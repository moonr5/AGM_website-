/**
 * Report the left edge of the key page landmarks at a given width, so the
 * appbar and hero can be checked for a shared gutter.
 * Usage: node tools/measure-gutters.mjs 1024 [url]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const width = Number(process.argv[2] || 1024);
const url = process.argv[3] || "http://localhost:8080/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9200 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-gut-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},900`,
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
await call("Emulation.setDeviceMetricsOverride", {
  width,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false
});
await call("Page.navigate", { url });
await sleep(3500);

const expr = `
(function () {
  var picks = {
    "appbar logo":   "#appbar .section:first-child a, #appbar img[alt*='AGARA'], .agm-brand",
    "appbar nav":    "#appbar .agm-nav",
    "appbar cta":    "#appbar .agm-nav-cta",
    "hero eyebrow":  ".agm-hero-inner .agm-eyebrow",
    "hero h1":       ".agm-hero h1",
    "hero buttons":  ".agm-hero-actions",
    "hero inner":    ".agm-hero-inner"
  };
  var out = [];
  for (var label in picks) {
    var el = document.querySelector(picks[label]);
    if (!el) { out.push(label + ": (not found)"); continue; }
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    out.push(label + ": left=" + Math.round(r.left) + " right=" + Math.round(r.right) +
      " w=" + Math.round(r.width) + " padL=" + cs.paddingLeft);
  }
  out.push("viewport: " + window.innerWidth);
  return out.join("\\n");
})()
`;

const res = await call("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log(`\n=== ${url} @ ${width}px ===`);
console.log(res.result.value);

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
