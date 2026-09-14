/**
 * Capture a strip of frames while scrolling a single page session, so the
 * actual scroll experience is visible rather than a set of cold loads with
 * half-loaded lazy images.
 * Usage: node tools/scroll-film.mjs <startY> <endY> <frames> [url]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.slice(name.length + 3)) : def;
};

const startY = Number(positional[0] || 3800);
const endY = Number(positional[1] || 5000);
const frames = Number(positional[2] || 6);
const url = positional[3] || "http://localhost:8080/";
const width = opt("w", 1440);
const height = opt("h", 900);
const cold = args.includes("--cold");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9050 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-film-"));
const OUT = "tools/shots/film";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
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

/* Warm the whole page once so lazy media is decoded, then return to the top.
   --cold skips this: warming hydrates every island up front, which hides
   exactly what a first-time visitor sees while scrolling down. */
if (!cold) {
  const docH = (await call("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true })).result.value;
  for (let y = 0; y < docH; y += 600) {
    await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
    await sleep(200);
  }
  await call("Runtime.evaluate", { expression: "scrollTo(0,0)" });
  await sleep(1200);
}

const step = frames > 1 ? (endY - startY) / (frames - 1) : 0;
for (let i = 0; i < frames; i++) {
  const y = Math.round(startY + step * i);
  await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
  await sleep(700);
  const shot = await call("Page.captureScreenshot", { format: "png" });
  const file = path.join(OUT, `y${String(y).padStart(5, "0")}.png`);
  fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
  const state = (
    await call("Runtime.evaluate", {
      returnByValue: true,
      expression: `(function(){
        var m=document.querySelector('#below ._main_mirx2_1');
        if(!m) return 'no services module';
        var r=m.getBoundingClientRect();
        var second=document.querySelector('#below ._second_mirx2_56');
        var sr=second?second.getBoundingClientRect():null;
        var cs=getComputedStyle(m);
        return 'module top='+Math.round(r.top)+' h='+Math.round(r.height)+
          ' pos='+cs.position+(sr?('  media top='+Math.round(sr.top)+' h='+Math.round(sr.height)+' pos='+getComputedStyle(second).position):'');
      })()`
    })
  ).result.value;
  console.log(`  y=${String(y).padStart(5)}  ${file}   ${state}`);
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
