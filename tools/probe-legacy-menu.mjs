/**
 * Is the imported template's yacht mega-menu reachable?
 *
 * The homepage DOM still contains the original menu markup ("PRE-OWNED",
 * "50 Steel", a language picker). The audit sees it positioned off-screen. This
 * walks the ancestor chain of those nodes to show what is keeping them out of
 * view, and then opens the mobile drawer to see whether it surfaces.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9700 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-probe-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=390,844",
    "--hide-scrollbars",
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
  throw new Error("no debugging socket");
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
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});

const evaluate = async (expression) =>
  (
    await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })
  ).result?.value;

await call("Page.navigate", { url: "http://localhost:8080/en/" });
await sleep(3000);

const CHAIN = `(() => {
  const target = [...document.querySelectorAll('a,span')]
    .find(e => (e.textContent||'').trim() === 'PRE-OWNED');
  if (!target) return 'no PRE-OWNED node found';
  const out = [];
  for (let p = target; p && out.length < 12; p = p.parentElement) {
    const s = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    out.push({
      node: p.tagName.toLowerCase() + (p.id ? '#'+p.id : '') + '.' + (p.className||'').toString().trim().split(/\\s+/).slice(0,3).join('.'),
      display: s.display,
      visibility: s.visibility,
      opacity: s.opacity,
      transform: s.transform === 'none' ? 'none' : 'set',
      pointer: s.pointerEvents,
      rect: Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)
    });
  }
  return out;
})()`;

console.log("=== ancestor chain of the 'PRE-OWNED' node ===");
const chain = await evaluate(CHAIN);
if (typeof chain === "string") console.log("  " + chain);
else
  for (const c of chain)
    console.log(
      `  ${c.node.slice(0, 46).padEnd(46)} display:${c.display.padEnd(12)} vis:${c.visibility.padEnd(8)} op:${c.opacity.padEnd(4)} transform:${c.transform.padEnd(5)} pe:${c.pointer.padEnd(6)} ${c.rect}`
    );

console.log("\n=== open the mobile drawer and see what is on screen ===");
const OPEN = `(() => {
  const b = document.querySelector('#burger');
  if (!b) return 'no #burger';
  b.click();
  return 'clicked';
})()`;
console.log("  " + (await evaluate(OPEN)));
await sleep(1200);

const VISIBLE = `(() => {
  const vw = innerWidth, vh = innerHeight;
  const seen = [];
  for (const el of document.querySelectorAll('a,button,span,div')) {
    const t = (el.textContent||'').trim();
    if (!t || t.length > 40 || el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.right < 0 || r.left > vw || r.bottom < 0 || r.top > vh) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || parseFloat(s.opacity) === 0) continue;
    let hidden = false;
    for (let p = el; p; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (ps.visibility === 'hidden' || parseFloat(ps.opacity) === 0 || ps.display === 'none') { hidden = true; break; }
    }
    if (hidden) continue;
    if (!seen.includes(t)) seen.push(t);
  }
  return seen.slice(0, 40);
})()`;

const visible = await evaluate(VISIBLE);
console.log("  on-screen labels after opening the drawer:");
for (const v of visible) console.log(`    - ${v}`);

const shot = await call("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("tools/_drawer-open.png", Buffer.from(shot.data, "base64"));
console.log("\n  wrote tools/_drawer-open.png");

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
