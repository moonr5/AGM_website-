/**
 * Read computed styles off the running SAG reference so the AGM design tokens
 * can be matched to real numbers instead of eyeballed from a screenshot.
 * Usage: node tools/extract-sag-tokens.mjs [http://127.0.0.1:8099/]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const target = process.argv[2] || "http://127.0.0.1:8099/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9300 + Math.floor(Math.random() * 90);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-tok-"));
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
await call("Page.navigate", { url: target });
await sleep(4000);
for (const y of [1000, 2200, 3400]) {
  await call("Runtime.evaluate", { expression: `scrollTo(0,${y})` });
  await sleep(500);
}
await call("Runtime.evaluate", { expression: "scrollTo(0,0)" });
await sleep(800);

const expr = `
(function () {
  var out = {};
  function pick(el, props) {
    if (!el) return null;
    var cs = getComputedStyle(el);
    var o = { _tag: el.tagName.toLowerCase(), _cls: (el.className || "").toString().slice(0, 70) };
    props.forEach(function (p) { o[p] = cs.getPropertyValue(p); });
    var r = el.getBoundingClientRect();
    o._box = Math.round(r.width) + "x" + Math.round(r.height) + " @" + Math.round(r.left) + "," + Math.round(r.top);
    return o;
  }
  var TYPE = ["font-family","font-size","font-weight","line-height","letter-spacing","color","text-transform"];
  var BOX = ["background-color","border-radius","padding","border","box-shadow","backdrop-filter","position"];

  // Biggest heading on the page = hero h1.
  var heads = [].slice.call(document.querySelectorAll("h1,h2,h3"));
  heads.sort(function (a, b) {
    return parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize);
  });
  out.biggestHeadings = heads.slice(0, 6).map(function (h) {
    var o = pick(h, TYPE);
    o._text = (h.textContent || "").trim().slice(0, 48);
    return o;
  });

  // Anything that looks like a bright pill button.
  var pills = [].slice.call(document.querySelectorAll("a,button")).filter(function (el) {
    var cs = getComputedStyle(el);
    var r = parseFloat(cs.borderRadius);
    var rect = el.getBoundingClientRect();
    return r >= 14 && rect.height > 24 && rect.width > 60 && cs.backgroundColor !== "rgba(0, 0, 0, 0)";
  });
  out.pills = pills.slice(0, 6).map(function (el) {
    var o = Object.assign(pick(el, TYPE), pick(el, BOX));
    o._text = (el.textContent || "").trim().slice(0, 30);
    return o;
  });

  // Fixed / sticky chrome = the floating nav pills.
  var fixed = [].slice.call(document.querySelectorAll("header,nav,div")).filter(function (el) {
    var cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") return false;
    var r = el.getBoundingClientRect();
    return r.top < 140 && r.height > 20 && r.height < 130 && r.width > 40;
  });
  out.floatingChrome = fixed.slice(0, 8).map(function (el) {
    return Object.assign(pick(el, BOX), { _text: (el.textContent || "").trim().slice(0, 30) });
  });

  // Distinct section background colours down the page.
  var seen = {}, bands = [];
  [].slice.call(document.querySelectorAll("section,div")).forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width < window.innerWidth * 0.85 || r.height < 200) return;
    var bg = getComputedStyle(el).backgroundColor;
    if (bg === "rgba(0, 0, 0, 0)" || seen[bg]) return;
    seen[bg] = 1;
    bands.push({ bg: bg, cls: (el.className || "").toString().slice(0, 50), h: Math.round(r.height) });
  });
  out.sectionBands = bands.slice(0, 10);

  out.body = pick(document.body, TYPE.concat(["background-color"]));
  out.eyebrows = [].slice.call(document.querySelectorAll("p,span,div")).filter(function (el) {
    var cs = getComputedStyle(el);
    return cs.textTransform === "uppercase" && parseFloat(cs.fontSize) <= 15 &&
      (el.textContent || "").trim().length > 2 && (el.textContent || "").trim().length < 30 &&
      el.children.length === 0;
  }).slice(0, 5).map(function (el) {
    var o = pick(el, TYPE);
    o._text = (el.textContent || "").trim().slice(0, 26);
    return o;
  });
  return JSON.stringify(out, null, 2);
})()
`;

const res = await call("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log(res.result.value || JSON.stringify(res, null, 2));

ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {}
