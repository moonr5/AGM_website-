/**
 * Dump the full CDP event payload for every failed request on a route, so an
 * abort with no matching requestWillBeSent can still be identified.
 * Usage: node tools/probe-abort.mjs /en/
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const route = process.argv[2] || "/en/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9700 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-abort-"));
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
let onEvent = () => {};
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  } else if (m.method) onEvent(m);
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

const seen = new Map();
const fails = [];

onEvent = (m) => {
  const p = m.params || {};
  if (m.method === "Network.requestWillBeSent") {
    seen.set(p.requestId, {
      url: p.request.url,
      type: p.type,
      initiator: p.initiator,
      documentURL: p.documentURL
    });
  } else if (m.method === "Network.loadingFailed") {
    fails.push({ event: p, known: seen.get(p.requestId) || null });
  }
};

await call("Network.enable");
await call("Page.enable");
await call("Runtime.enable");
await call("Page.navigate", { url: "http://localhost:8080" + route });
await sleep(3000);
// Scroll the page so visible-hydrated islands and lazy media all fire.
for (const y of [1200, 3000, 5200, 7600, 10000]) {
  await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
  await sleep(700);
}
await sleep(1500);

console.log(`route ${route} — ${fails.length} failed request(s), ${seen.size} total requests seen`);
for (const f of fails) {
  console.log("\n--- failed ---");
  console.log("  requestId:  " + f.event.requestId);
  console.log("  errorText:  " + f.event.errorText);
  console.log("  type:       " + f.event.type);
  console.log("  canceled:   " + f.event.canceled);
  console.log("  blocked:    " + (f.event.blockedReason || "-"));
  if (f.known) {
    console.log("  url:        " + f.known.url);
    console.log("  initiator:  " + JSON.stringify(f.known.initiator));
  } else {
    console.log("  url:        <no requestWillBeSent captured>");
  }
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
