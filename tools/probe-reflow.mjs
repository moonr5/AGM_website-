/**
 * Sample the page height and the offset of each major band over time after
 * load, to find what is still growing and shifting content underneath it.
 *
 * Screenshots race the load and disagree with each other; this records the
 * settling directly.
 * Usage: node tools/probe-reflow.mjs [url] [--w=1920] [--h=1080] [--for=8000]
 *                                   [--bands=#a,#b]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : def;
};
const url = args.find((a) => !a.startsWith("--")) || "http://localhost:8080/en/";
const width = opt("w", 1920);
const height = opt("h", 1080);
const duration = opt("for", 8000);

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9700 + Math.floor(Math.random() * 150);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-reflow-"));
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
const evaluate = async (expression) =>
  (await call("Runtime.evaluate", { expression, returnByValue: true })).result.value;

await call("Page.enable");
await call("Runtime.enable");

const bandsFlag = args.find((a) => a.startsWith("--bands="));
const BANDS = bandsFlag
  ? bandsFlag.slice("--bands=".length).split(",").map((s) => s.trim()).filter(Boolean)
  : ["#hero", "#agm-about", "#range", "#agm-briefs", "#below"];
const probe = `(() => {
  const out = { doc: document.body.scrollHeight };
  for (const sel of ${JSON.stringify(BANDS)}) {
    const el = document.querySelector(sel);
    if (!el) { out[sel] = null; continue; }
    const r = el.getBoundingClientRect();
    out[sel] = { top: Math.round(r.top + window.scrollY), h: Math.round(r.height) };
  }
  return out;
})()`;

const started = Date.now();
await call("Page.navigate", { url });

const samples = [];
while (Date.now() - started < duration) {
  await sleep(400);
  try {
    samples.push({ t: Date.now() - started, ...(await evaluate(probe)) });
  } catch {}
}

const fmt = (b) => (b ? `${String(b.top).padStart(5)}/${String(b.h).padStart(5)}` : "    -/    -");
console.log(`${url}  ${width}x${height}\n`);
console.log(`   ms   docH   ${BANDS.map((b) => (b + " top/h").padEnd(12)).join("")}`);
for (const s of samples) {
  console.log(
    `${String(s.t).padStart(5)} ${String(s.doc).padStart(6)}   ` +
      BANDS.map((b) => fmt(s[b]).padEnd(12)).join("")
  );
}

const last = samples[samples.length - 1];
const settled = samples.filter((s) => s.doc === last.doc);
console.log(
  `\nfinal height ${last.doc}, first reached at ${settled.length ? settled[0].t : "?"}ms` +
    ` (page kept resizing for that long after navigation)`
);

ws.close();
chrome.kill();
await reapProfile(profile);
