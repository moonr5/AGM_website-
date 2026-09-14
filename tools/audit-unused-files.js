const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEXT_EXT = new Set([
  ".html", ".htm", ".css", ".js", ".mjs", ".json", ".svg", ".xml", ".txt", ".map"
]);
const ALWAYS_USED = new Set([
  path.normalize("en/index.html"),
  path.normalize("it/index.html"),
  path.normalize("hubfs/placeholder-green.svg"),
  path.normalize("en/images/fallback-purple/purple-portrait.jpg"),
  path.normalize("en/images/fallback-purple/purple-square.jpg"),
  path.normalize("hubfs/js/island-runtime/island-runtime.mjs"),
  path.normalize("hubfs/js/react/react-combined.mjs"),
]);

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "tools",
  "docs",
  "website_backup",
  "api"
]);

const SKIP_FILES = new Set([
  "package.json",
  "package-lock.json",
  "README.md",
  "README_LOCAL.md",
  "local-server.js",
  ".gitignore",
  ".gitattributes",
  ".htaccess",
  "unused-files-report.json",
  "website-free",
  "website-free.html"
]);

function walk(dir, base = ROOT) {
  const out = [];
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(name.name)) continue;
    const abs = path.join(dir, name.name);
    const rel = path.relative(base, abs).replace(/\\/g, "/");
    if (name.isDirectory()) out.push(...walk(abs, base));
    else if (!SKIP_FILES.has(rel)) out.push(rel);
  }
  return out;
}

function normalizeRef(raw, fromFile) {
  if (!raw || raw.startsWith("data:") || raw.startsWith("#") || raw.startsWith("mailto:")) return null;
  if (/^https?:\/\//i.test(raw)) return null;
  if (raw.startsWith("//")) return null;

  let ref = raw.split(/[?#]/)[0].replace(/\\/g, "/");
  if (!ref) return null;

  if (ref.startsWith("/")) ref = ref.slice(1);

  const fromDir = path.dirname(fromFile).replace(/\\/g, "/");
  if (!ref.includes("/") && !ref.startsWith("en/") && !ref.startsWith("it/") && !ref.startsWith("hubfs/") && !ref.startsWith("fonts/") && !ref.startsWith("uploads/")) {
    ref = path.posix.normalize(`${fromDir}/${ref}`);
  }

  ref = ref.replace(/^(\.\/)+/, "");
  while (ref.startsWith("../")) ref = ref.slice(3);
  ref = path.posix.normalize(ref);

  const candidates = new Set([ref]);
  if (!ref.endsWith(".html") && !path.extname(ref)) {
    candidates.add(`${ref}/index.html`);
    candidates.add(ref); // extensionless page file
  }
  if (ref.startsWith("hubfs/") && !ref.includes("146466316") && fs.existsSync(path.join(ROOT, ref.replace(/^hubfs\//, "hubfs/146466316/")))) {
    candidates.add(ref.replace(/^hubfs\//, "hubfs/146466316/"));
  }
  return [...candidates];
}

function extractRefs(content, fromFile) {
  const refs = new Set();
  const patterns = [
    /(?:src|href|poster|data-src|content)=["']([^"']+)["']/gi,
    /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
    /"src"\s*:\s*"([^"]+)"/gi,
    /"href"\s*:\s*"([^"]+)"/gi,
    /"href_with_scheme"\s*:\s*"([^"]+)"/gi,
    /from\s+["']([^"']+)["']/gi,
    /import\s+["']([^"']+)["']/gi,
    /moduleId"\s*:\s*"[^"]*assets[/\\]([^"?]+)/gi,
    /assets[/\\](island-[A-Za-z0-9_-]+\.(?:js|css))/gi,
    /"url"\s*:\s*"([^"]+)"/gi
  ];

  for (const re of patterns) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(content)) !== null) {
      const raw = m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/");
      for (const c of normalizeRef(raw, fromFile) || []) refs.add(c);
    }
  }
  return refs;
}

function isTextLike(rel) {
  const ext = path.extname(rel).toLowerCase();
  if (TEXT_EXT.has(ext)) return true;
  if (!ext) return true; // extensionless html pages
  return false;
}

const allFiles = walk(ROOT);
const allSet = new Set(allFiles);
const referenced = new Set([...ALWAYS_USED]);
const entryPages = allFiles.filter(
  (f) => f === "en/index.html" || f === "it/index.html" || f.endsWith("/index.html") || (!path.extname(f) && f.startsWith("en/"))
);

const textFiles = allFiles.filter(isTextLike);
for (const file of textFiles) {
  const content = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const ref of extractRefs(content, file)) {
    if (allSet.has(ref)) referenced.add(ref);
    // basename fallback for js imports
    const base = path.basename(ref);
    for (const f of allFiles) if (path.basename(f) === base) referenced.add(f);
  }
}

// island bundles reference each other by basename in same folder - mark siblings imported by used islands
for (const used of [...referenced]) {
  if (!used.includes("/assets/")) continue;
  const dir = path.dirname(used);
  const content = fs.readFileSync(path.join(ROOT, used), "utf8");
  for (const f of allFiles) {
    if (!f.startsWith(dir + "/")) continue;
    const base = path.basename(f);
    if (content.includes(base)) referenced.add(f);
  }
}

const reachablePages = new Set(entryPages);
const queue = [...entryPages];
while (queue.length) {
  const page = queue.pop();
  if (!allSet.has(page)) continue;
  let content;
  try { content = fs.readFileSync(path.join(ROOT, page), "utf8"); } catch { continue; }
  for (const ref of extractRefs(content, page)) {
    if (allSet.has(ref) && isTextLike(ref) && !reachablePages.has(ref)) {
      reachablePages.add(ref);
      queue.push(ref);
    }
  }
}

const unused = allFiles.filter((f) => !referenced.has(f));
const unusedByDir = {};
for (const f of unused) {
  const top = f.split("/")[0] + (f.includes("/") ? "/" + f.split("/")[1] : "");
  (unusedByDir[top] ||= []).push(f);
}

const unreachablePages = allFiles.filter((f) => isTextLike(f) && !reachablePages.has(f) && (f.startsWith("en/") || f.startsWith("it/")));

console.log("=== AGM Unused File Audit ===");
console.log(`Total files: ${allFiles.length}`);
console.log(`Referenced (direct): ${referenced.size}`);
console.log(`Unused (never referenced): ${unused.length}`);
console.log(`Entry/reachable pages: ${reachablePages.size}`);
console.log(`Unreachable HTML pages: ${unreachablePages.length}`);
console.log("");

console.log("--- Unreachable pages (exist but no nav/link path found) ---");
for (const p of unreachablePages.sort()) console.log(p);

console.log("");
console.log("--- Unused files by area (sample) ---");
for (const [area, files] of Object.entries(unusedByDir).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n[${area}] ${files.length} unused`);
  for (const f of files.slice(0, 8)) console.log("  " + f);
  if (files.length > 8) console.log(`  ... +${files.length - 8} more`);
}

// Write full report
const report = {
  generatedAt: new Date().toISOString(),
  totals: { all: allFiles.length, referenced: referenced.size, unused: unused.length },
  unused: unused.sort(),
  unreachablePages: unreachablePages.sort()
};
fs.writeFileSync(path.join(__dirname, "..", "unused-files-report.json"), JSON.stringify(report, null, 2));
console.log("\nFull report: unused-files-report.json");
