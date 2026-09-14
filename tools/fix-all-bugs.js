const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", "website_backup", "tools"]);

const REPLACEMENTS = [
  // Broken image path from partial Massimo -> AGM rename.
  [
    "en/images/company-profile/vessel-charter.jpg/AGM-vessel-charter.jpg",
    "en/images/company-profile/vessel-charter.jpg",
  ],
  [
    "en/images/company-profile/vessel-charter.jpg\\u002FAGM-vessel-charter.jpg",
    "en/images/company-profile/vessel-charter.jpg",
  ],
  ['"alt":"AGM-vessel-charter"', '"alt":"AGM vessel charter"'],
  [
    "\\u002Fnews-and-events\\u002Fthird-paradise",
    "\\u002Fen\\u002Fsustainability\\u002F",
  ],
  ["/news-and-events/third-paradise", "/en/sustainability/"],
  [
    "hubfs/146466316/news\\u002Fthird%20paradise\\u002FMassimo-Perotti-&-Michelangelo-Pistoletto-(1).jpg",
    "en/images/company-profile/vessel-charter.jpg",
  ],
  [
    "hubfs\\u002F146466316\\u002Fnews\\u002Fthird%20paradise\\u002FMassimo-Perotti-&-Michelangelo-Pistoletto-(1).jpg",
    "en/images/company-profile/vessel-charter.jpg",
  ],
  [
    "hubfs/146466316/news/third%20paradise/Massimo-Perotti-&-Michelangelo-Pistoletto-(1).jpg",
    "en/images/company-profile/vessel-charter.jpg",
  ],
  [
    '"alt":"Massimo-Perotti-&-Michelangelo-Pistoletto-(1)"',
    '"alt":"AGM vessel charter"',
  ],
  [
    "Michelangelo Pistoletto and the reinterpretation of Third Paradise",
    "AGM fleet expansion and new crewboat charter services",
  ],
  [
    "THIRD PARADISE QUICK RESPONSE - Venice, 2024",
    "AGM Crewboat Charter - Marunda, 2025",
  ],
  ["/en/about//", "/en/about/"],
  ["/en/sustainability//", "/en/sustainability/"],
  ["/en/contacts//", "/en/contacts/"],
  ["/en/services//", "/en/services/"],
  ["/en/#range//", "/en/#range"],
  ["en/p6.svg", "en/p61.svg"],
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(name.name)) continue;
    const abs = path.join(dir, name.name);
    if (name.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

function fixText(text) {
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  next = next.replace(
    /<link rel="stylesheet" href="(?:\/|)hubfs\/hub_generated\/module_assets\/1\/303280081137\/1779285400441\/module_appbar\.css">\s*\r?\n/g,
    "",
  );
  next = next.replace(
    /<script defer src="\/hs\/hsstatic\/content-cwv-embed\/static-1\.1293\/embed\.js"><\/script>\s*\r?\n/g,
    "",
  );
  next = next.replace(
    /<script defer src="\/hs\/hsstatic\/content-cwv-embed\/static-1\.1293\/embed\.js"><\/script>/g,
    "",
  );
  next = next.replace(
    /<!-- HubSpot performance collection script -->\s*<script defer>\s*!function\(\)\{"use strict";const t="\/_hcms\/perf\/v2"[\s\S]*?<\/script>\s*\r?\n/g,
    "",
  );
  next = next.replace(/hsVars\['language'\] = 'it'/g, "hsVars['language'] = 'en'");
  return next;
}

let count = 0;
for (const abs of walk(ROOT)) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  const ext = path.extname(abs).toLowerCase();
  if (ext !== ".html" && ext !== "" && ext !== ".htm") continue;
  const original = fs.readFileSync(abs, "utf8");
  const next = fixText(original);
  if (next !== original) {
    fs.writeFileSync(abs, next, "utf8");
    console.log("fixed:", rel);
    count += 1;
  }
}

// Ensure logo alias exists.
const p61 = path.join(ROOT, "en/p61.svg");
const p6 = path.join(ROOT, "en/p6.svg");
if (fs.existsSync(p61) && !fs.existsSync(p6)) {
  fs.copyFileSync(p61, p6);
  console.log("created: en/p6.svg");
}

console.log(`Bug sweep complete. ${count} file(s) updated.`);
