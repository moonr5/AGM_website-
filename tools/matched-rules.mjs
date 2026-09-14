/**
 * Report every CSS rule matching a selector, with its origin stylesheet, after
 * scrolling to a given offset. Answers "what is actually setting this?".
 * Usage: node tools/matched-rules.mjs "<selector>" <scrollY> [property] [url]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const selector = process.argv[2] || "#below ._second_mirx2_56";
const scrollY = Number(process.argv[3] || 4400);
const prop = process.argv[4] || "position";
const url = process.argv[5] || "http://localhost:8080/";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9010 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-mr-"));
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
await call("DOM.enable");
await call("CSS.enable");
await call("Page.navigate", { url });
await sleep(3500);
for (let y = 0; y <= scrollY; y += 500) {
  await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
  await sleep(220);
}
await call("Runtime.evaluate", { expression: `scrollTo(0,${scrollY})` });
await sleep(1200);

const sheets = new Map();
const { root } = await call("DOM.getDocument", { depth: -1 });
const { nodeId } = await call("DOM.querySelector", { nodeId: root.nodeId, selector });
if (!nodeId) {
  console.log(`selector not found: ${selector}`);
} else {
  const styles = await call("CSS.getMatchedStylesForNode", { nodeId });

  async function sheetName(styleSheetId) {
    if (!styleSheetId) return "(inline)";
    if (sheets.has(styleSheetId)) return sheets.get(styleSheetId);
    let name = styleSheetId;
    try {
      const h = await call("CSS.getStyleSheetText", { styleSheetId });
      name = "len " + h.text.length;
    } catch {}
    sheets.set(styleSheetId, name);
    return name;
  }

  console.log(`\n=== rules matching ${selector} at y=${scrollY} (property: ${prop}) ===\n`);

  if (styles.inlineStyle) {
    const hit = (styles.inlineStyle.cssProperties || []).find((p) => p.name === prop);
    console.log("  inline style: " + (hit ? hit.value : "(no " + prop + ")"));
  }

  for (const m of styles.matchedCSSRules || []) {
    const r = m.rule;
    const hit = (r.style.cssProperties || []).find((p) => p.name === prop);
    if (!hit) continue;
    const origin = r.origin;
    const href = r.styleSheetId ? await sheetName(r.styleSheetId) : "?";
    const media = (r.media || []).map((x) => x.text).join(" and ");
    console.log(
      `  ${prop}: ${hit.value.padEnd(12)} <- ${r.selectorList.text.slice(0, 70)}` +
        `  [origin=${origin}${media ? ", media=" + media : ""}, sheet ${href}]`
    );
  }

  const computed = await call("CSS.getComputedStyleForNode", { nodeId });
  const cp = computed.computedStyle.find((p) => p.name === prop);
  console.log(`\n  computed ${prop}: ${cp ? cp.value : "?"}`);
  for (const n of ["width", "height", "top", "left", "flex-basis", "display"]) {
    const v = computed.computedStyle.find((p) => p.name === n);
    if (v) console.log(`  computed ${n}: ${v.value}`);
  }
}

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
