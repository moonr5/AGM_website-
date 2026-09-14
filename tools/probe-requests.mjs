/**
 * List failed network requests with their URLs, plus the final URL after any
 * redirect. Usage: node tools/probe-requests.mjs /en/ /en/arts-and-culture/
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const routes = process.argv.slice(2);
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9600 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-req-"));
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
await call("Page.enable");
await call("Runtime.enable");
await call("Network.enable");

for (const route of routes) {
  const urls = new Map();
  const problems = [];

  onEvent = (m) => {
    if (m.method === "Network.requestWillBeSent") {
      urls.set(m.params.requestId, m.params.request.url);
    } else if (m.method === "Network.loadingFailed") {
      problems.push({ why: m.params.errorText, url: urls.get(m.params.requestId) || "?" });
    } else if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
      problems.push({ why: `HTTP ${m.params.response.status}`, url: m.params.response.url });
    }
  };

  await call("Page.navigate", { url: "http://localhost:8080" + route });
  await sleep(3500);

  const final = (
    await call("Runtime.evaluate", { expression: "location.href", returnByValue: true })
  ).result.value;

  console.log(`\n${route}`);
  console.log(`  final url: ${final}`);
  if (!problems.length) console.log("  no failed requests");
  for (const p of problems) console.log(`  ${p.why.padEnd(22)} ${p.url}`);
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
