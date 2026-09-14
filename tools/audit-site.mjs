/**
 * Whole-site runtime audit.
 *   node tools/audit-site.mjs [--w=1440] [--h=900] [--mobile]
 *
 * For every page it reports: JS and console errors, failed requests, missing
 * images, text clipped by an overflow-hidden ancestor, horizontal overflow, and
 * whether the two brand webfonts actually loaded.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reapProfile } from "./reap-profile.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const hit = args.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : d;
};
const mobile = args.includes("--mobile");
const width = Number(opt("w", mobile ? 390 : 1440));
const height = Number(opt("h", mobile ? 844 : 900));

const BASE = "http://localhost:8080";
const routes = ["/en/"].concat(
  fs
    .readdirSync("en", { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join("en", d.name, "index.html")))
    .map((d) => `/en/${d.name}/`)
);

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9800 + Math.floor(Math.random() * 150);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "agm-audit-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--disable-extensions",
    "--force-device-scale-factor=1",
    "about:blank"
  ],
  { stdio: "ignore" }
);

async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const json = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
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

let id = 0;
const pending = new Map();
let onEvent = () => {};

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    onEvent(msg);
  }
});

function send(method, params = {}, sessionId) {
  const msgId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
}

// The browser-level socket has no Page/Runtime domain, so attach to a tab and
// address it by session.
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params) => send(method, params, sessionId);

async function evaluate(expression) {
  const r = await call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  return r.result?.value;
}

await call("Page.enable");
await call("Runtime.enable");
await call("Log.enable");
await call("Network.enable");

if (mobile) {
  await call("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: true
  });
}

/* Runs in the page: find text clipped by a scroll-less overflow-hidden
   ancestor, and any element sticking out past the viewport width. */
const PROBE = `(() => {
  const clipped = [];
  const overflow = [];
  const vw = document.documentElement.clientWidth;

  /* An element inside a faded-out, hidden, or deliberately collapsed ancestor
     is not a layout fault: closed accordions and the shut mobile drawer both
     clip their contents on purpose. */
  const effectivelyHidden = (el) => {
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.visibility === 'hidden' || s.display === 'none') return true;
      if (parseFloat(s.opacity) === 0) return true;
      if (s.contentVisibility === 'hidden') return true;
      // A grid collapsed to a zero track is an accordion in its shut state.
      if (s.gridTemplateRows === '0px' || s.gridTemplateRows === '0fr') return true;
      if (p.getAttribute && p.getAttribute('aria-hidden') === 'true') return true;
    }
    return false;
  };

  const clipper = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflow === 'hidden' || s.overflowY === 'hidden' || s.overflowX === 'hidden') {
        if (p.scrollHeight > p.clientHeight + 2 || p.scrollWidth > p.clientWidth + 2) {
          // A box collapsed to almost nothing is closed, not broken.
          if (p.clientHeight < 8 || p.clientWidth < 8) return null;
          return p;
        }
      }
    }
    return null;
  };

  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,strong,span,dd,dt,figcaption,a')) {
    const text = (el.textContent || '').trim();
    if (!text || el.children.length > 2) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const s = getComputedStyle(el);
    if (effectivelyHidden(el)) continue;

    const c = clipper(el);
    if (c) {
      const cr = c.getBoundingClientRect();
      // Only report when this element's box actually runs past the clip edge.
      if (r.bottom > cr.bottom + 1 || r.right > cr.right + 1) {
        clipped.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 48),
          text: text.slice(0, 70),
          by: c.tagName.toLowerCase() + '.' + (c.className || '').toString().slice(0, 36),
          overBy: Math.round(Math.max(r.bottom - cr.bottom, r.right - cr.right))
        });
      }
    }

    /* A carousel that runs past the viewport is doing its job, so only report
       overflow when no ancestor is a horizontal scroller. */
    const inScroller = (() => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === 'auto' || ps.overflowX === 'scroll') return true;
      }
      return false;
    })();

    if (r.right > vw + 2 && s.position !== 'fixed' && !inScroller) {
      overflow.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 48),
        text: text.slice(0, 50),
        past: Math.round(r.right - vw)
      });
    }
  }

  const badImgs = [...document.images]
    .filter((i) => i.complete && i.naturalWidth === 0)
    .map((i) => i.currentSrc || i.src);

  const fams = new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));

  return {
    clipped: clipped.slice(0, 12),
    overflow: overflow.slice(0, 12),
    badImgs,
    docWidth: document.documentElement.scrollWidth,
    vw,
    sans: fams.has('DM Sans'),
    serif: fams.has('Source Serif 4'),
    h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 60),
    h1Font: document.querySelector('h1') ? getComputedStyle(document.querySelector('h1')).fontFamily.split(',')[0] : ''
  };
})()`;

let problems = 0;
console.log(`\n=== ${mobile ? "MOBILE" : "DESKTOP"} ${width}x${height} ===\n`);

for (const route of routes) {
  const errors = [];
  const failed = [];
  onEvent = (msg) => {
    if (msg.method === "Runtime.exceptionThrown") {
      errors.push(msg.params.exceptionDetails?.exception?.description || "exception");
    } else if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      failed.push(msg.params.entry.text.slice(0, 150));
    } else if (msg.method === "Network.loadingFailed") {
      failed.push(`request failed: ${msg.params.errorText}`);
    }
  };

  await call("Page.navigate", { url: BASE + route });
  await sleep(2600);
  // Let visibility-hydrated islands run, then come back to the top.
  await evaluate(`window.scrollTo(0, document.body.scrollHeight); true`);
  await sleep(1400);
  await evaluate(`window.scrollTo(0, 0); true`);
  await sleep(500);

  const r = await evaluate(PROBE);
  const issues = [];

  if (errors.length) issues.push(`${errors.length} JS error(s): ${errors[0].slice(0, 110)}`);
  const realFailed = failed.filter((f) => !/favicon/i.test(f));
  if (realFailed.length) issues.push(`${realFailed.length} failed request(s): ${realFailed[0]}`);
  if (r.badImgs?.length) issues.push(`${r.badImgs.length} broken image(s): ${r.badImgs[0]}`);
  if (!r.sans) issues.push("DM Sans did not load");
  if (!r.serif) issues.push("Source Serif 4 did not load");
  if (r.docWidth > r.vw + 2) issues.push(`horizontal scroll: doc ${r.docWidth} > viewport ${r.vw}`);
  for (const c of r.clipped) {
    issues.push(`clipped ${c.overBy}px: <${c.tag} class="${c.cls}"> "${c.text}" inside ${c.by}`);
  }
  for (const o of r.overflow) {
    issues.push(`overflows ${o.past}px: <${o.tag} class="${o.cls}"> "${o.text}"`);
  }

  if (issues.length) {
    problems++;
    console.log(`${route}`);
    console.log(`   h1: "${r.h1}"  [${r.h1Font}]`);
    for (const i of issues) console.log(`   - ${i}`);
    console.log("");
  } else {
    console.log(`${route.padEnd(28)} clean   h1 in ${r.h1Font}`);
  }
}

console.log(`\n${routes.length - problems}/${routes.length} pages clean`);

ws.close();
chrome.kill();
await reapProfile(profile);
