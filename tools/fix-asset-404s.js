const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "website_backup", "tools"]);

const APPBAR_CSS =
  "hubfs/hub_generated/template_assets/1/303278617829/1776244747491/template_appbar.min.css";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(name.name)) continue;
    const abs = path.join(dir, name.name);
    if (name.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

function fixFile(abs) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const ext = path.extname(abs).toLowerCase();
  if (ext !== ".html" && ext !== "" && ext !== ".htm") return false;

  let text = fs.readFileSync(abs, "utf8");
  const original = text;

  text = text.replace(
    /<link rel="stylesheet" href="(?:\/|)hubfs\/hub_generated\/module_assets\/1\/303280081137\/1779285400441\/module_appbar\.css">\s*\r?\n/g,
    "",
  );

  text = text.replace(
    /<script defer src="\/hs\/hsstatic\/content-cwv-embed\/static-1\.1293\/embed\.js"><\/script>\s*\r?\n/g,
    "",
  );

  text = text.replace(
    /<script defer src="\/hs\/hsstatic\/content-cwv-embed\/static-1\.1293\/embed\.js"><\/script>/g,
    "",
  );

  if (text !== original) {
    fs.writeFileSync(abs, text, "utf8");
    console.log("fixed:", rel);
    return true;
  }
  return false;
}

let count = 0;
for (const abs of walk(ROOT)) {
  if (fixFile(abs)) count += 1;
}

console.log(`Asset 404 cleanup done. ${count} file(s) updated.`);
