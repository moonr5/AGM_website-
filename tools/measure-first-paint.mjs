import http from "node:http";
import { performance } from "node:perf_hooks";

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    http
      .get({ hostname: "127.0.0.1", port: 8080, path, headers }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
            ms: performance.now() - t0,
          });
        });
      })
      .on("error", reject);
  });
}

const htmlRes = await get("/", { "accept-encoding": "gzip" });
console.log(
  "HTML",
  htmlRes.status,
  `${Math.round(htmlRes.body.length / 1024)}KB on wire`,
  `${Math.round(htmlRes.ms)}ms`,
  "enc=" + htmlRes.headers["content-encoding"],
);

const html = (await get("/", {})).body.toString("utf8");
const hrefs = [...html.matchAll(/<(?:link|script|img|source)[^>]*(?:href|src)="([^"]+)"[^>]*>/gi)].map((m) => ({
  tag: m[0],
  url: m[1],
}));

function isCritical(item) {
  const t = item.tag.toLowerCase();
  const u = item.url;
  if (u.startsWith("data:")) return false;
  if (t.includes('media="print"')) return false;
  if (t.includes('preload="none"')) return false;
  if (u.includes("p8.mp4") || u.includes("p8-lite")) return false;
  if (u.includes("Loader")) return false;
  if (t.startsWith("<script") && t.includes("defer")) return t.includes("agm-perf");
  if (t.startsWith("<img")) {
    return u.includes("p61") || u.includes("hero-poster") || u.includes("favicon");
  }
  if (t.startsWith("<link") && t.includes("stylesheet")) return true;
  if (t.includes('rel="preload"')) return true;
  if (t.includes('rel="icon"') || t.includes("shortcut icon")) return true;
  return false;
}

const seen = new Set();
const critical = [];
for (const item of hrefs) {
  if (!isCritical(item)) continue;
  let url = item.url;
  if (!url.startsWith("http") && !url.startsWith("/")) url = "/" + url;
  if (seen.has(url)) continue;
  seen.add(url);
  critical.push(url);
}

let total = htmlRes.body.length;
console.log("Critical assets:");
for (const url of critical) {
  const r = await get(url, { "accept-encoding": "gzip" });
  total += r.body.length;
  console.log(" ", url, r.status, `${Math.round(r.body.length / 1024)}KB`, `${Math.round(r.ms)}ms`);
}
console.log("First-paint bytes on wire ~", `${Math.round(total / 1024)}KB`);

const checks = ["/en/hero-poster.webp", "/en/p61.png", "/en/favicon.png", "/en/p8-lite.mp4", "/en/p8.mp4"];
for (const url of checks) {
  const r = await get(url);
  console.log(url, r.status, r.body.length, r.headers["content-type"]);
}
