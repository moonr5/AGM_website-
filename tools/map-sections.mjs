/**
 * List the homepage's major bands in document order with their offset, height
 * and background, so section-to-section transitions can be reasoned about.
 * Usage: node tools/map-sections.mjs [url] [--root=CSS] [--depth=1] [--min=120] [--w=1440] [--h=900]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : def;
};
const url = args.find((a) => !a.startsWith("--")) || "http://localhost:8080/";
const root = opt("root", "");
const depth = Number(opt("depth", 1));
const minHeight = Number(opt("min", 120));
const width = Number(opt("w", 1440));
const height = Number(opt("h", 900));
const cold = args.includes("--cold");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9100 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-map-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
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
await call("Page.navigate", { url });
await sleep(3500);
/* Walk the page so every lazily hydrated island is mounted before measuring.
   --cold skips the walk, which is how to see what a visitor meets on the way
   down rather than the settled result. */
if (!cold) {
  const h = (await call("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true })).result.value;
  for (let y = 0; y < h; y += 700) {
    await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
    await sleep(260);
  }
  await call("Runtime.evaluate", { expression: "scrollTo(0,0)" });
  await sleep(900);
}

const expr = `
(function () {
  var rootSel = ${JSON.stringify(root)};
  var maxDepth = ${depth};
  var minH = ${minHeight};
  var main = rootSel
    ? document.querySelector(rootSel)
    : (document.querySelector(".body-wrapper") || document.body);
  if (!main) return JSON.stringify({ error: "root not found: " + rootSel });
  var rows = [];
  function label(el) {
    var id = el.id ? "#" + el.id : "";
    var cls = (el.className || "").toString().trim().split(/\\s+/).slice(0, 2).join(".");
    return (id || (cls ? "." + cls : el.tagName.toLowerCase()));
  }
  function scan(node, depth) {
    for (var i = 0; i < node.children.length; i++) {
      var el = node.children[i];
      var r = el.getBoundingClientRect();
      if (r.height < minH) continue;
      var cs = getComputedStyle(el);
      var top = Math.round(r.top + window.scrollY);
      /* A band can be the right height and still look empty, so count what is
         actually paintable inside it: text, and images that decoded. */
      var text = (el.textContent || "").trim().replace(/\\s+/g, " ");
      var imgs = el.querySelectorAll("img");
      var drawn = 0;
      for (var k = 0; k < imgs.length; k++) if (imgs[k].naturalWidth > 0) drawn++;
      rows.push({
        depth: depth,
        label: label(el),
        top: top,
        h: Math.round(r.height),
        bg: cs.backgroundColor,
        cv: cs.contentVisibility,
        pos: cs.position,
        chars: text.length,
        imgs: imgs.length,
        drawn: drawn,
        text: text.slice(0, 40)
      });
      if (depth < maxDepth) scan(el, depth + 1);
    }
  }
  scan(main, 0);
  return JSON.stringify({ docHeight: document.body.scrollHeight, rows: rows });
})()
`;

const res = await call("Runtime.evaluate", { expression: expr, returnByValue: true });
const data = JSON.parse(res.result.value);
if (data.error) {
  console.error(data.error);
} else {
  console.log(`document height: ${data.docHeight}\n`);
  for (const r of data.rows) {
    const pad = "  ".repeat(r.depth + 1);
    const media = r.imgs ? `img=${r.drawn}/${r.imgs}` : "img=-";
    console.log(
      `${pad}${r.label.padEnd(34 - r.depth * 2)} top=${String(r.top).padStart(6)} h=${String(r.h).padStart(5)}` +
        `  bg=${r.bg.padEnd(22)} cv=${(r.cv || "-").padEnd(8)} chars=${String(r.chars).padStart(5)} ${media.padEnd(10)} ${r.text}`
    );
  }
}

ws.close();
chrome.kill();
await reapProfile(profile);
