const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REPORT = path.resolve(__dirname, "..", "unused-files-report.json");
const KEEP = new Set([
  "hubfs/placeholder-green.svg",
  "en/images/fallback-purple/purple-portrait.jpg",
  "en/images/fallback-purple/purple-square.jpg",
  "hubfs/js/island-runtime/island-runtime.mjs",
  "hubfs/js/react/react-combined.mjs",
]);

const SKIP_DIRS = new Set(["node_modules", ".git", ".github", "tools", "docs", "website_backup"]);

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(name.name)) continue;
    const abs = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

function loadAllText(unusedSet) {
  const files = walk(ROOT).filter((f) => {
    const rel = path.relative(ROOT, f).replace(/\\/g, "/");
    if (unusedSet.has(rel)) return false;
    const ext = path.extname(f).toLowerCase();
    return !ext || [".html", ".htm", ".css", ".js", ".mjs", ".json", ".svg", ".xml", ".txt", ".pdf"].includes(ext);
  });
  return files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
}

function pathVariants(rel) {
  const v = new Set([rel]);
  v.add(rel.replace(/^hubfs\/146466316\//, "hubfs/"));
  v.add("/" + rel);
  for (const p of [...v]) {
    v.add(p.replace(/\//g, "\\u002F"));
    v.add(p.replace(/\//g, "\\/"));
    v.add(encodeURI(p));
  }
  return [...v];
}

function isReferenced(rel, haystack) {
  if (KEEP.has(rel)) return true;
  for (const variant of pathVariants(rel)) {
    if (variant && haystack.includes(variant)) return true;
  }
  return false;
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory()) removeEmptyDirs(path.join(dir, name.name));
  }
  if (dir !== ROOT && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

const { unused } = JSON.parse(fs.readFileSync(REPORT, "utf8"));
const unusedSet = new Set(unused);
const haystack = loadAllText(unusedSet);

let deleted = 0;
let skipped = 0;
const skippedFiles = [];

for (const rel of unused) {
  if (KEEP.has(rel)) {
    skipped++;
    skippedFiles.push(rel + " (keep list)");
    continue;
  }
  if (isReferenced(rel, haystack)) {
    skipped++;
    skippedFiles.push(rel + " (still referenced)");
    continue;
  }
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) {
    fs.unlinkSync(abs);
    deleted++;
  }
}

removeEmptyDirs(ROOT);

// Also remove leftover clutter that is not part of the live site
for (const extra of ["../local-server.log", "../website-free", "../website-free.html"]) {
  const p = path.resolve(__dirname, extra);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    deleted++;
  }
}

console.log(`Deleted: ${deleted}`);
console.log(`Skipped: ${skipped}`);
if (skippedFiles.length) {
  console.log("\nSkipped files:");
  for (const s of skippedFiles.slice(0, 20)) console.log("  " + s);
  if (skippedFiles.length > 20) console.log(`  ... +${skippedFiles.length - 20} more`);
}
