/**
 * After scrolling the whole page, list every content element that has promoted
 * itself to position: fixed or sticky. Legitimately fixed chrome (appbar, the
 * mobile drawer) is allow-listed, so anything else reported here is a leftover
 * scroll-choreographed module that will detach from the page as you scroll.
 * Usage: node tools/audit-stuck.mjs [url]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] || "http://localhost:8080/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9200 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-stuck-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,900",
    "--no-first-run",
    "about:blank"
  ],
  { stdio: "ignore" }
);

async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no socket");
}

const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (m, p) => send(m, p, sessionId);

await call("Page.enable");
await call("Runtime.enable");
await call("Page.navigate", { url });
await sleep(3500);

const h = (await call("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true })).result.value;
for (let y = 0; y <= h; y += 500) {
  await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
  await sleep(220);
}
await call("Runtime.evaluate", { expression: `scrollTo(0, ${Math.round(h * 0.55)})` });
await sleep(1200);

const expr = `
(function () {
  var ALLOW = ["appbar", "drawer", "menu", "overlay", "cookie", "modal", "dialog", "toast", "backdrop", "scrollbar"];
  var out = [];
  var all = document.querySelectorAll("body *");
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    var cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") continue;
    var r = el.getBoundingClientRect();
    if (r.width < 60 || r.height < 60) continue;
    var tag = el.tagName.toLowerCase();
    var idc = ((el.id || "") + " " + (el.className || "")).toLowerCase();
    var allowed = false;
    for (var k = 0; k < ALLOW.length; k++) if (idc.indexOf(ALLOW[k]) !== -1) allowed = true;
    if (allowed) continue;
    // Ignore things nested inside allow-listed chrome.
    var p = el.parentElement, inChrome = false;
    while (p) {
      var pid = ((p.id || "") + " " + (p.className || "")).toLowerCase();
      for (var k2 = 0; k2 < ALLOW.length; k2++) if (pid.indexOf(ALLOW[k2]) !== -1) inChrome = true;
      p = p.parentElement;
    }
    if (inChrome) continue;
    out.push({
      sel: tag + (el.id ? "#" + el.id : "") + (el.className ? "." + (el.className + "").trim().split(/\\s+/).slice(0,2).join(".") : ""),
      pos: cs.position,
      w: Math.round(r.width), h: Math.round(r.height),
      top: Math.round(r.top),
      text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 44)
    });
  }
  return JSON.stringify(out);
})()
`;

const rows = JSON.parse((await call("Runtime.evaluate", { expression: expr, returnByValue: true })).result.value);
if (!rows.length) {
  console.log("no detached content elements: every band stays in normal flow");
} else {
  console.log(`${rows.length} content element(s) pinned outside normal flow:\n`);
  for (const r of rows) {
    console.log(`  ${r.pos.padEnd(7)} ${r.sel.padEnd(46)} ${r.w}x${r.h} top=${r.top}  ${r.text}`);
  }
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
