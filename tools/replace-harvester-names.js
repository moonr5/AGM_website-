/**
 * Replace SL LINE / SD LINE branding with Harvester I / Harvester II.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const TEXT_REPLACEMENTS = [
  ["SL LINE", "Harvester I"],
  ["SD LINE", "Harvester II"],
];

const JSON_REPLACEMENTS = [
  ['"title":"SL"', '"title":"Harvester I"'],
  ['"title":"SD"', '"title":"Harvester II"'],
  ['"description":"The signature."', '"description":""'],
  ['"description":"An icon of voyaging."', '"description":""'],
  ['"caption":"The signature."', '"caption":""'],
  ['"caption":"An icon of voyaging."', '"caption":""'],
];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === "node_modules" || name.name === ".git") continue;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function shouldProcess(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (rel.startsWith("brand-representative/")) return false;
  if (rel.startsWith("website_backup/")) return false;
  if (rel.endsWith(".html") || rel === "website-free") return true;
  if (/^en\/[^/]+$/.test(rel)) return true;
  if (rel.endsWith("template_labels.min.js")) return true;
  if (rel.endsWith("island-DJ-QQ3E8.js")) return true;
  return false;
}

let changed = 0;

for (const file of walk(ROOT).filter(shouldProcess)) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  for (const [from, to] of TEXT_REPLACEMENTS) {
    text = text.split(from).join(to);
  }
  for (const [from, to] of JSON_REPLACEMENTS) {
    text = text.split(from).join(to);
  }

  if (file.endsWith("island-DJ-QQ3E8.js")) {
    text = text.replace(
      '!r.title.includes("Harvester")&&!r.title.includes("Harvester")',
      '!r.title.includes("Harvester")'
    );
    if (!text.includes('includes("Harvester")')) {
      text = text.replace(
        'r.title!="SHE"&&T("span",{style:{fontWeight:100},children:"LINE"})',
        '!r.title.includes("Harvester")&&r.title!="SHE"&&T("span",{style:{fontWeight:100},children:"LINE"})'
      );
    }
  }

  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
    console.log("updated:", path.relative(ROOT, file));
  }
}

console.log(`Done. ${changed} file(s) updated.`);
