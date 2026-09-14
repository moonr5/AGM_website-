/**
 * For each band on the homepage, report the left edge of its leading text and
 * its background, at several widths. Bands whose text starts at a different x
 * from their neighbours are what makes a page read as a stack of unrelated
 * blocks rather than one document.
 * Usage: node tools/audit-alignment.mjs [url]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const url = process.argv[2] || "http://localhost:8080/";
const WIDTHS = [1440, 1280, 1024];
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9300 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-align-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--window-size=1440,900",
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

const BANDS = [
  ["hero", ".agm-hero h1"],
  ["hero facts", ".agm-hero-facts dt"],
  ["about", "#agm-about .agm-eyebrow, #agm-about h2, .agm-about-lead"],
  ["features", ".agm-feature-grid .agm-feature"],
  ["fleet", "#range h2, #range ._title_ws1t0_1, #range [class*='title']"],
  ["briefs", "#agm-briefs h2, #agm-briefs .agm-eyebrow"],
  ["faq", ".agm-faq h2"],
  ["gallery", ".agm-travelo-section .agm-gallery"],
  ["services", "#below ._first_mirx2_8 > h2"],
  ["footer", "#below ._footerSection_ypmp5_1 ._footerTitle_ypmp5_67"]
];

for (const w of WIDTHS) {
  await call("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await call("Page.navigate", { url });
  await sleep(3200);
  const h = (await call("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true })).result.value;
  for (let y = 0; y <= h; y += 600) {
    await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
    await sleep(180);
  }
  await call("Runtime.evaluate", { expression: "scrollTo(0,0)" });
  await sleep(800);

  const expr = `
  (function () {
    var bands = ${JSON.stringify(BANDS)};
    var out = [];
    for (var i = 0; i < bands.length; i++) {
      var el = document.querySelector(bands[i][1]);
      if (!el) { out.push([bands[i][0], null]); continue; }
      var r = el.getBoundingClientRect();
      out.push([bands[i][0], Math.round(r.left + window.scrollX), Math.round(r.width)]);
    }
    return JSON.stringify(out);
  })()`;
  const rows = JSON.parse((await call("Runtime.evaluate", { expression: expr, returnByValue: true })).result.value);

  console.log(`\n=== viewport ${w}px ===`);
  const lefts = rows.filter((r) => r[1] !== null).map((r) => r[1]);
  const mode = lefts.sort((a, b) => lefts.filter((v) => v === a).length - lefts.filter((v) => v === b).length).pop();
  for (const [name, left, width] of rows) {
    if (left === null) {
      console.log(`  ${name.padEnd(12)} (not found)`);
      continue;
    }
    const off = left - mode;
    const flag = Math.abs(off) > 6 ? `  <-- ${off > 0 ? "+" : ""}${off}px off` : "";
    console.log(`  ${name.padEnd(12)} left=${String(left).padStart(4)}  w=${String(width).padStart(4)}${flag}`);
  }
  console.log(`  (page gutter appears to be ${mode}px)`);
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
