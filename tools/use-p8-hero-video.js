const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const REPLACEMENTS = [
  ["/en/p7.mp4", "/en/p8.mp4"],
  ["/en/p9.mp4", "/en/p8.mp4"],
  ["\\u002Fen\\u002Fp7.mp4", "\\u002Fen\\u002Fp8.mp4"],
  ["\\u002Fen\\u002Fp9.mp4", "\\u002Fen\\u002Fp8.mp4"],
];

const FILES = [
  "index.html",
  "en/index.html",
  "website-free.html",
  "website-free",
  "hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-smooth.js",
];

for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  for (const [from, to] of REPLACEMENTS) {
    text = text.split(from).join(to);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    console.log("updated", rel);
  }
}

console.log("Done.");
