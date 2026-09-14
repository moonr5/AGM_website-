import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9600 + Math.floor(Math.random() * 200);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-enq-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--window-size=1440,900",
  "--hide-scrollbars",
  "--no-first-run",
  "--disable-extensions",
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
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
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
await call("Page.navigate", { url: "http://localhost:3000/en/enquire/" });
for (let i = 0; i < 40; i++) {
  const ready = await call("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
  if (ready.result.value === "complete") break;
  await sleep(150);
}
await sleep(400);

const result = await call("Runtime.evaluate", {
  expression: `
    (async () => {
      const form = document.querySelector(".agm-form");
      if (!form) return { error: "no form" };
      form.elements.namedItem("name").value = "Yard Visitor";
      form.elements.namedItem("email").value = "visitor@example.com";
      form.elements.namedItem("phone").value = "+62 819-231-001";
      form.elements.namedItem("service").value = "FRP shipbuilding";
      form.elements.namedItem("message").value = "Please quote a 12m crewboat.";
      form.requestSubmit();
      for (let i = 0; i < 40; i++) {
        const status = form.querySelector(".agm-form-status");
        if (status && !status.hidden && status.textContent) {
          return { text: status.textContent, kind: status.className };
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      return { error: "no status" };
    })()
  `,
  awaitPromise: true,
  returnByValue: true
});
console.log(JSON.stringify(result.result.value));

const shot = await call("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("tools/_enquire-sent.png", Buffer.from(shot.data, "base64"));
console.log("wrote tools/_enquire-sent.png");

ws.close();
chrome.kill();
await reapProfile(profile);
