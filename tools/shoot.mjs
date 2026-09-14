/**
 * Headless screenshot helper.
 *   node tools/shoot.mjs <url> <out.png> [--w=1440] [--h=900] [--sel=CSS] [--scroll=CSS] [--wait=CSS:count]
 * Scrolls before capturing so islands that hydrate on visibility have a chance
 * to render, then clips to an element when --sel is given.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const opt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};

const width = Number(opt("w", 1440));
const height = Number(opt("h", 900));
const sel = opt("sel", "");
const scrollTo = opt("scroll", sel);
const waitFor = opt("wait", "");
const mobile = args.includes("--mobile");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9500 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-shot-"));

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  "--hide-scrollbars",
  "--no-first-run",
  "--disable-extensions",
  "--force-device-scale-factor=1",
  "about:blank"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
await call("Log.enable");
if (mobile) {
  await call("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 2, mobile: true
  });
}

const evaluate = async (expression, awaitPromise = false) => {
  const r = await call("Runtime.evaluate", {
    expression, awaitPromise, returnByValue: true
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description || ""));
  return r.result.value;
};

await call("Page.navigate", { url });
for (let i = 0; i < 80; i++) {
  if (events.some((e) => e.method === "Page.loadEventFired")) break;
  await sleep(150);
}
await sleep(600);

const scrollY = opt("y", "");
if (scrollY) {
  await evaluate(`window.scrollTo(0, ${Number(scrollY)}); true`);
  await sleep(1000);
}

if (scrollTo) {
  await evaluate(`
    (() => {
      const el = document.querySelector(${JSON.stringify(scrollTo)});
      if (el) el.scrollIntoView({ block: "center" });
      return !!el;
    })()
  `);
  await sleep(900);
}

if (waitFor) {
  const [wSel, wCount] = waitFor.split(":");
  let ok = false;
  for (let i = 0; i < 60; i++) {
    const n = await evaluate(`document.querySelectorAll(${JSON.stringify(wSel)}).length`);
    if (n >= Number(wCount || 1)) { ok = true; break; }
    await sleep(300);
  }
  console.log(`wait ${waitFor}: ${ok ? "ok" : "TIMED OUT"}`);
}

// Let lazy images settle.
await evaluate(`
  (async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = "eager");
    await Promise.all([...document.images].filter(i => !i.complete).map(i =>
      new Promise(r => { i.addEventListener("load", r, {once:true}); i.addEventListener("error", r, {once:true}); setTimeout(r, 3000); })
    ));
    return true;
  })()
`, true);
await sleep(400);

let clip;
if (sel && args.includes("--viewport")) {
  // Sections further down the page use content-visibility, which renders blank
  // under captureBeyondViewport. Scroll the element flush to the top and grab
  // the plain viewport instead.
  //
  // Scrolling is done as a correction loop rather than a single jump: images
  // above the target finish loading and scroll-triggered pinning re-runs as we
  // move, either of which shifts the element out from under a position worked
  // out beforehand. A single jump landed a screen or more off target.
  let offset = null;
  for (let i = 0; i < 8; i++) {
    offset = await evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return null;
        const top = el.getBoundingClientRect().top;
        window.scrollBy(0, top);
        return Math.round(top);
      })()
    `);
    if (offset === null) break;
    await sleep(350);
    if (Math.abs(offset) <= 2) break;
  }
  if (offset === null) console.log(`selector not found: ${sel}`);
  else console.log(`settled ${sel} at ${offset}px from viewport top`);
  await sleep(500);
} else if (sel) {
  const box = await evaluate(`
    (() => {
      const el = document.querySelector(${JSON.stringify(sel)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
    })()
  `);
  if (!box) {
    console.log(`selector not found: ${sel}`);
  } else {
    clip = { ...box, scale: 1 };
    console.log(`clip ${JSON.stringify(box)}`);
  }
}

// After any scrolling, so the cursor lands on the element where it finally sits.
const hover = opt("hover", "");
if (hover) {
  const at = await evaluate(`
    (() => {
      const el = document.querySelector(${JSON.stringify(hover)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
    })()
  `);
  if (!at) console.log(`hover target not found: ${hover}`);
  else {
    await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: at.x, y: at.y, buttons: 0 });
    console.log(`hovered ${hover} at ${at.x},${at.y}`);
    await sleep(1300);
  }
}

const shot = await call("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: !!clip,
  ...(clip ? { clip } : {})
});
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log(`wrote ${out}`);

const errs = events.filter((e) => e.method === "Log.entryAdded" && e.params.entry.level === "error");
if (errs.length) {
  console.log("--- console errors ---");
  errs.forEach((e) => console.log("  " + e.params.entry.text));
}

ws.close();
chrome.kill();
await reapProfile(profile);
process.exit(0);
