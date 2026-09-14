/**
 * Report whether a section fits inside one screen, across several viewports.
 *
 * Screenshotting a fixed scroll offset is not a reliable check here: two bands
 * on the homepage use content-visibility: auto, so their heights, and every
 * offset below them, change as the page is scrolled. This measures the element
 * against the viewport height instead.
 * Usage: node tools/measure-fit.mjs [selector] [url]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const sel = process.argv[2] || "#agm-briefs";
const url = process.argv[3] || "http://localhost:8080/en/";
const SIZES = [
  [1440, 900],
  [1440, 780],
  [1366, 768],
  [1280, 720],
  [1920, 1080]
];

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9300 + Math.floor(Math.random() * 200);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-fit-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,900",
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

// Evaluating on the browser-level target would not see the page's DOM, so run
// everything against an attached page session.
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (m, p) => send(m, p, sessionId);
const evaluate = async (expression) =>
  (await call("Runtime.evaluate", { expression, returnByValue: true })).result.value;

await call("Page.enable");
await call("Runtime.enable");

console.log(`${sel}  on  ${url}\n`);
console.log("  viewport       section    screen   verdict");

for (const [w, h] of SIZES) {
  await call("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false
  });
  await call("Page.navigate", { url });
  await sleep(2600);

  // Walk the page so lazily hydrated islands and content-visibility bands above
  // the target have all been laid out before measuring.
  const doc = await evaluate("document.body.scrollHeight");
  for (let y = 0; y < doc; y += 700) {
    await evaluate(`scrollTo(0,${y})`);
    await sleep(120);
  }
  await evaluate(`document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({block:"start"})`);
  await sleep(500);

  const out = await evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(sel)});
    if (!el) return null;
    return { h: Math.round(el.getBoundingClientRect().height), vh: window.innerHeight };
  })()`);

  const label = `${w}x${h}`.padEnd(13);
  if (!out) {
    console.log(`  ${label} selector not found`);
    continue;
  }
  const spare = out.vh - out.h;
  console.log(
    `  ${label} ${String(out.h).padStart(6)}px ${String(out.vh).padStart(8)}px   ` +
      (spare >= 0 ? `fits (${spare}px spare)` : `OVERFLOWS by ${-spare}px`)
  );
}

ws.close();
chrome.kill();
await reapProfile(profile);
