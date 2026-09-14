const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const FILES = ["index.html", "en/index.html", "website-free.html"];

function extractVideoHrefs(file) {
  const text = fs.readFileSync(file, "utf8");
  const hrefs = new Set();
  for (const m of text.matchAll(/"href":"([^"]+\.mp4)"/g)) hrefs.add(m[1]);
  for (const m of text.matchAll(/"src":"([^"]+\.mp4)"/g)) hrefs.add(m[1]);
  for (const m of text.matchAll(/"(\/en\/[^"]+\.mp4)"/g)) hrefs.add(m[1]);
  return [...hrefs];
}

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD" }, (res) => {
      resolve({ url, status: res.statusCode, len: res.headers["content-length"] || "?" });
    });
    req.on("error", (err) => resolve({ url, status: "ERR", len: err.message }));
    req.end();
  });
}

(async () => {
  const hrefs = new Set();
  for (const rel of FILES) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) continue;
    for (const h of extractVideoHrefs(file)) hrefs.add(h);
  }

  const local = [
    "en/videos/services/charter-blue.mp4",
    "en/videos/services/shipbuilding-blue.mp4",
    "en/videos/services/marine-support-blue.mp4",
  ];
  for (const rel of local) {
    const abs = path.join(ROOT, rel);
    const ok = fs.existsSync(abs) && fs.statSync(abs).size > 10000;
    console.log(ok ? "OK local" : "MISSING local", rel, ok ? fs.statSync(abs).size : "");
  }

  console.log("\nLive checks:");
  for (const href of [...hrefs].sort()) {
  const live = await head(`https://agmaritim.com${href}`);
    console.log(live.status, live.len, live.url);
    if (!href.startsWith("/en/")) {
      const alt = await head(`https://agmaritim.com/en${href.startsWith("/") ? href : `/${href}`}`);
      console.log("  alt", alt.status, alt.url);
    }
    const noEn = href.replace(/^\/en/, "");
    if (noEn !== href) {
      const short = await head(`https://agmaritim.com${noEn}`);
      console.log("  no-en", short.status, short.url);
    }
  }
})();
