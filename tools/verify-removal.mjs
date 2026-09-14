/**
 * Confirm the withdrawn configurator page is gone cleanly: no page still links
 * to it, nothing still requests its stylesheet or script, /en/build-your-boat/
 * now 404s, and the pages that used to link to it load without errors.
 * Usage: node tools/verify-removal.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = "http://localhost:8080";
const ROUTES = ["/", "/en/", "/en/services/", "/en/shipyard/", "/en/about/"];
const GONE = ["/en/build-your-boat/", "/api/save-design.php"];

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9500 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-vr-"));
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
let bad = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    return;
  }
  if (m.method === "Network.responseReceived") {
    const { url, status } = m.params.response;
    if (status >= 400) bad.push(`HTTP ${status} ${url}`);
  }
  if (m.method === "Network.loadingFailed") {
    bad.push(`failed ${m.params.errorText}`);
  }
  if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    bad.push(`JS error: ${d.exception?.description || d.text}`);
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
await call("Network.enable");

// 1. Deleted endpoints should no longer resolve.
console.log("=== deleted endpoints ===");
for (const p of GONE) {
  const res = await fetch(BASE + p, { redirect: "manual" });
  const ok = res.status === 404 || res.status === 403;
  console.log(`  ${p}  ->  HTTP ${res.status}  ${ok ? "gone" : "STILL SERVED"}`);
}

// 2. Pages that referenced it should load clean and link to it nowhere.
console.log("\n=== pages ===");
for (const route of ROUTES) {
  bad = [];
  await call("Page.navigate", { url: BASE + route });
  await sleep(2600);
  const h = (await call("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true })).result.value;
  for (let y = 0; y <= h; y += 700) {
    await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
    await sleep(200);
  }
  await sleep(600);

  const found = (
    await call("Runtime.evaluate", {
      returnByValue: true,
      expression: `(function(){
        var hits = [].slice.call(document.querySelectorAll('a[href*="build-your-boat"]'))
          .map(function(a){ return a.getAttribute('href'); });
        var assets = [].slice.call(document.querySelectorAll('link[href*="agm-builder"],script[src*="agm-builder"]')).length;
        var cards = document.querySelectorAll('#below .agm-about-card').length;
        return JSON.stringify({ hits: hits, assets: assets, cards: cards });
      })()`
    })
  ).result.value;
  const { hits, assets, cards } = JSON.parse(found);

  const notes = [];
  if (hits.length) notes.push(`${hits.length} dead link(s): ${hits.join(", ")}`);
  if (assets) notes.push(`${assets} builder asset tag(s)`);
  if (bad.length) notes.push(`${bad.length} runtime problem(s)`);
  console.log(
    `  ${route.padEnd(18)} links=${hits.length} assets=${assets}` +
      (route === "/" || route === "/en/" ? ` aboutCards=${cards}` : "") +
      `  ${notes.length ? "-> " + notes.join("; ") : "clean"}`
  );
  for (const b of bad.slice(0, 4)) console.log(`        ${b.slice(0, 110)}`);
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
