/**
 * Find what makes a page scroll sideways, with a real layout-space scrollbar.
 *
 * Headless Chrome defaults to overlay scrollbars, which take no layout width,
 * so an element sized width:100vw fits exactly and nothing looks wrong. On
 * Windows the scrollbar consumes about 15px, 100vw stays the full window width,
 * and the page overflows by that much. OverlayScrollbar is disabled here so the
 * bug actually reproduces.
 * Usage: node tools/probe-hscroll.mjs [url] [--w=1440] [--h=900]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
const url = args.find((a) => !a.startsWith("--")) || "http://localhost:8080/en/";
const width = flag("w", 1440);
const height = flag("h", 900);
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9600 + Math.floor(Math.random() * 150);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-hscroll-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "--disable-features=OverlayScrollbar",
    "--no-first-run",
    "--disable-gpu",
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
const evaluate = async (expression) =>
  (await call("Runtime.evaluate", { expression, returnByValue: true })).result.value;

await call("Page.enable");
await call("Runtime.enable");
await call("Page.navigate", { url });
await sleep(3500);

// Bands using content-visibility: auto are not laid out until scrolled past,
// so walk the whole page before measuring.
const docH = await evaluate("document.body.scrollHeight");
for (let y = 0; y < docH; y += 600) {
  await evaluate(`scrollTo(0,${y})`);
  await sleep(140);
}
await evaluate("scrollTo(0,0)");
await sleep(700);

const report = await evaluate(`(() => {
  const de = document.documentElement;
  const out = {
    innerWidth: window.innerWidth,
    clientWidth: de.clientWidth,
    scrollWidth: de.scrollWidth,
    scrollbar: window.innerWidth - de.clientWidth,
    offenders: []
  };

  for (const el of document.querySelectorAll("*")) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    // Only report boxes that reach past the content area; a fixed element is
    // positioned against the viewport and is allowed to.
    if (r.right <= de.clientWidth + 1 || s.position === "fixed") continue;
    out.offenders.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || "").toString().slice(0, 60),
      width: Math.round(r.width),
      past: Math.round(r.right - de.clientWidth),
      cssWidth: s.width
    });
  }
  return out;
})()`);

console.log(`${url}\n`);
console.log(`  window inner width : ${report.innerWidth}`);
console.log(`  content width      : ${report.clientWidth}`);
console.log(`  scrollbar          : ${report.scrollbar}px`);
console.log(`  document scrollWidth: ${report.scrollWidth}`);
console.log(
  report.scrollWidth > report.clientWidth + 1
    ? `\n  SCROLLS SIDEWAYS by ${report.scrollWidth - report.clientWidth}px\n`
    : "\n  no horizontal scroll\n"
);

if (report.offenders.length) {
  console.log(`  ${report.offenders.length} element(s) past the content edge:`);
  for (const o of report.offenders.slice(0, 20)) {
    console.log(`    +${String(o.past).padStart(3)}px  w=${String(o.width).padStart(5)} (css ${o.cssWidth})  <${o.tag} class="${o.cls}">`);
  }
} else {
  console.log("  nothing past the content edge");
}

ws.close();
chrome.kill();
await reapProfile(profile);
