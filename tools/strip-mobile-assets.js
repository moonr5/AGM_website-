const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const STRIP_PATTERNS = [
  /<script id="agm-desktop-viewport">[\s\S]*?<\/script>\s*/g,
  /<link rel="stylesheet" href="[^"]*agm-mobile\.css[^"]*">\s*/g,
  /<script defer src="[^"]*agm-mobile\.js[^"]*"><\/script>\s*/g,
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function strip(content) {
  let next = content;
  for (const pattern of STRIP_PATTERNS) {
    next = next.replace(pattern, "");
  }
  return next;
}

let updated = 0;
for (const file of walk(ROOT)) {
  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!content.includes("agm-mobile") && !content.includes("agm-desktop-viewport")) {
    continue;
  }
  const next = strip(content);
  if (next !== content) {
    fs.writeFileSync(file, next, "utf8");
    updated++;
    console.log(path.relative(ROOT, file));
  }
}

console.log(`Removed mobile assets from ${updated} file(s).`);
