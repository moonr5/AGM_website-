/**
 * Wire the self-hosted fonts and the brand token layer into every page.
 *
 * Both must load before the page-specific stylesheets so the tokens resolve and
 * headings never paint in the fallback serif first. The two latin font files are
 * preloaded because they are render-critical on first view.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ASSETS = "/hubfs/raw_assets/homepage/179/js_client_assets/assets";
const FONTS = "/hubfs/fonts/agm";
const FONT_V = "1";
const BRAND_V = "1";

const BLOCK = `<link rel="preload" href="${FONTS}/dm-sans-400_700-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${FONTS}/source-serif-4-400_700-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${FONTS}/agm-fonts.css?v=${FONT_V}">
<link rel="stylesheet" href="${ASSETS}/agm-brand.css?v=${BRAND_V}">`;

const MARKER = `<link rel="stylesheet" href="${ASSETS}/agm-mobile.css`;

function pages() {
  const list = ["index.html", "en/index.html"];
  for (const dir of fs.readdirSync(path.join(ROOT, "en"), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const file = path.join("en", dir.name, "index.html");
    if (fs.existsSync(path.join(ROOT, file))) list.push(file.replace(/\\/g, "/"));
  }
  return list;
}

let done = 0;
let skipped = 0;
const missing = [];

for (const rel of pages()) {
  const file = path.join(ROOT, rel);
  let html = fs.readFileSync(file, "utf8");

  if (html.includes("agm-brand.css")) {
    skipped++;
    continue;
  }

  const at = html.indexOf(MARKER);
  if (at === -1) {
    missing.push(rel);
    continue;
  }

  html = html.slice(0, at) + BLOCK + "\n" + html.slice(at);
  fs.writeFileSync(file, html);
  console.log(`  wired  ${rel}`);
  done++;
}

console.log(`\n${done} wired, ${skipped} already had it`);
if (missing.length) {
  console.log(`no agm-mobile.css anchor in:\n${missing.map((m) => "  " + m).join("\n")}`);
}
