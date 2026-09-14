/**
 * Print the box and selected computed styles of elements, after optionally
 * scrolling to one of them. Layout bugs in this page tend to appear only once
 * a band has been scrolled into view and its island has hydrated, so measuring
 * from a cold document at the top of the page reports the wrong numbers.
 *
 * Usage:
 *   node tools/probe-box.mjs <url> --sel=A,B,C [--scroll=SEL]
 *        [--props=height,position] [--w=1920] [--h=1080] [--warm]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--")) || "http://localhost:8080/en/";
const opt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};

const sels = opt("sel", "").split(",").filter(Boolean);
/* Read from a file rather than the command line: these expressions are full of
   quotes and braces, which the shell mangles. */
const evalFile = opt("eval-file", "");
const scrollSel = opt("scroll", "");
const props = opt("props", "height,position,flexBasis,alignSelf,marginBottom")
  .split(",")
  .filter(Boolean);
const width = Number(opt("w", 1920));
const height = Number(opt("h", 1080));
const warm = args.includes("--warm");

if (!sels.length && !evalFile) {
  console.error("give at least one --sel=CSS selector, or --eval-file=path");
  process.exit(1);
}

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9700 + Math.floor(Math.random() * 200);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-box-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  "--hide-scrollbars",
  "--no-first-run",
  "--force-device-scale-factor=1",
  "about:blank"
], { stdio: "ignore" });

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not expose a debugging socket");
}

const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

let seq = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  } else if (msg.method) {
    events.push(msg);
  }
});

function send(method, params = {}, sessionId) {
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params) => send(method, params, sessionId);

await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width, height, deviceScaleFactor: 1, mobile: false
});

const evaluate = async (expression) => {
  const r = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await call("Page.navigate", { url });
for (let i = 0; i < 80; i++) {
  if (events.some((e) => e.method === "Page.loadEventFired")) break;
  await sleep(150);
}
await sleep(1200);

if (warm) {
  const docH = await evaluate("document.body.scrollHeight");
  for (let y = 0; y < docH; y += 600) {
    await evaluate(`scrollTo(0,${y})`);
    await sleep(180);
  }
  await evaluate("scrollTo(0,0)");
  await sleep(900);
}

if (scrollSel) {
  for (let i = 0; i < 8; i++) {
    const top = await evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(scrollSel)});
        if (!el) return null;
        const t = el.getBoundingClientRect().top;
        window.scrollBy(0, t);
        return Math.round(t);
      })()
    `);
    if (top === null || Math.abs(top) <= 2) break;
    await sleep(300);
  }
  await sleep(500);
}

if (evalFile) {
  const expr = fs.readFileSync(evalFile, "utf8");
  console.log(await evaluate(expr));
}

const rows = await evaluate(`
  (() => {
    const sels = ${JSON.stringify(sels)};
    const props = ${JSON.stringify(props)};
    return sels.map((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { sel, missing: true };
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const out = {
        sel,
        x: Math.round(r.x), y: Math.round(r.y),
        w: Math.round(r.width), h: Math.round(r.height),
        inline: el.getAttribute("style") || "",
        props: {}
      };
      props.forEach((p) => { out.props[p] = cs[p]; });
      return out;
    });
  })()
`);

console.log(`viewport ${width}x${height}   innerHeight ${await evaluate("window.innerHeight")}   scrollY ${await evaluate("Math.round(window.scrollY)")}`);
for (const row of rows) {
  if (row.missing) { console.log(`\n  ${row.sel}\n    NOT FOUND`); continue; }
  console.log(`\n  ${row.sel}`);
  console.log(`    box   x=${row.x} y=${row.y} w=${row.w} h=${row.h}`);
  console.log(`    css   ${Object.entries(row.props).map(([k, v]) => `${k}=${v}`).join("  ")}`);
  if (row.inline) console.log(`    style ${row.inline}`);
}

ws.close();
chrome.kill();
await reapProfile(profile);
process.exit(0);
