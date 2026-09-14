const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BACKUP = path.join(ROOT, "website_backup");

const VIDEO_PATHS = [
  "en/p7.mp4",
  "en/p8.mp4",
  "en/p9.mp4",
  "en/v1.mp4",
  "en/videos/services/charter-blue.mp4",
  "en/videos/services/shipbuilding-blue.mp4",
  "en/videos/services/marine-support-blue.mp4",
];

const HTML_FILES = [
  "index.html",
  "en/index.html",
  "website-free.html",
  "website-free",
  "hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-smooth.js",
];

function isLfsPointer(file) {
  if (!fs.existsSync(file)) return false;
  const head = fs.readFileSync(file, "utf8").slice(0, 80);
  return head.startsWith("version https://git-lfs.github.com/spec/v1");
}

function ensureVideo(rel) {
  const dest = path.join(ROOT, rel);
  const backup = path.join(BACKUP, rel);
  if (!isLfsPointer(dest) && fs.existsSync(dest)) {
    const size = fs.statSync(dest).size;
    if (size > 1000) return;
  }
  if (fs.existsSync(backup) && fs.statSync(backup).size > 1000) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(backup, dest);
    console.log("restored:", rel, fs.statSync(dest).size, "bytes");
  } else {
    console.warn("missing source for", rel);
  }
}

// p8 is committed as a compressed ~14MB file (original 4K is kept locally as en/p8-original.mp4).
const HERO_REPLACEMENTS = [];

for (const rel of VIDEO_PATHS) ensureVideo(rel);

for (const rel of HTML_FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  for (const [from, to] of HERO_REPLACEMENTS) {
    text = text.split(from).join(to);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    console.log("updated hero refs:", rel);
  }
}

// Remove Git LFS tracking so Hostinger git deploy serves real mp4 files.
const attrs = path.join(ROOT, ".gitattributes");
if (fs.existsSync(attrs)) {
  const next = fs
    .readFileSync(attrs, "utf8")
    .split(/\r?\n/)
    .filter((line) => !/\.(mp4|mov)\s+filter=lfs/.test(line))
    .join("\n")
    .replace(/\n+$/, "\n");
  fs.writeFileSync(attrs, next || "", "utf8");
  console.log("updated .gitattributes (removed mp4/mov LFS)");
}

try {
  execSync('git lfs untrack "*.mp4" "*.mov"', { cwd: ROOT, stdio: "inherit" });
} catch {
  // git lfs may be unavailable; .gitattributes change is enough before re-add.
}

console.log("\nVideo deploy fix complete.");
console.log("Deployable via git: p7, p9, v1, service videos.");
console.log("p8.mp4 (192MB) exceeds GitHub limit — upload manually to Hostinger /en/p8.mp4 if needed.");
