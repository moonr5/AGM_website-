/**
 * Site-wide fixes: encoding, language metadata, /fr/ links, homepage copy.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const ENCODING_FIXES = [
  ["â€”", "—"],
  ["â€“", "–"],
  ["â€¢", "•"],
  ["â€˜", "'"],
  ["â€™", "'"],
  ["â€œ", '"'],
  ["â€\u009d", '"'],
  ["â†\u0090", "←"],
  ["â€º", "›"],
  ["Ã¢â‚¬â€œ", "–"],
  ["Ã¢â‚¬â€", "—"],
  ["Ã¢â‚¬\"", " - "],
  ["Â©", "©"],
  ["â€\u008d", ""],
  ["handsâ€‘on", "hands-on"],
  ["600â€‘hour", "600-hour"],
];

const HOMEPAGE_FIXES = [
  ['content="it"', 'content="en"'],
  ["hsVars['language'] = 'it'", "hsVars['language'] = 'en'"],
  ['"languageCode": "it"', '"languageCode": "en"'],
  ['"language": "it"', '"language": "en"'],
  ['<html lang="it">', '<html lang="en">'],
  [">IT</div>", ">EN</div>"],
  ['"title":"Everchanging yet\\nnever-changing."', '"title":"Your trusted partner\\nfor marine services."'],
  ["Everchanging yet\nnever-changing.", "Your trusted partner\nfor marine services."],
  [
    '"description":"Your Trusted Partner for Marine Services\\nour cultural compass."',
    '"description":"Your Trusted Partner for Marine Services\\nEngineering reliable maritime solutions."',
  ],
  ["15Ã¢â‚¬â€œ20", "15–20"],
  ["15\u00e2\u20ac\u201c20", "15–20"],
  ["/en/our-fleet/she", "/en/#range"],
  ["/en/our-fleet/50-steel", "/en/#range"],
  ["/en/our-fleet?range=alloy", "/en/#range"],
  ["/en/our-fleet?range=steel", "/en/#range"],
  ["/en/our-fleet?range=explorer", "/en/#range"],
  ["/en/our-fleet?range=x-space", "/en/#range"],
  ["/en/our-fleet?range=sl", "/en/#range"],
  ["/en/our-fleet?range=sd", "/en/#range"],
  ["/en/our-fleet?range=sx", "/en/#range"],
  ["/en/our-fleet?range=sp", "/en/#range"],
  ["/en/our-fleet", "/en/#range"],
  ["/en/people", "/en/about/"],
  ["/en/corporate", "/en/about/"],
  ["/en/investors", "/en/about/"],
  ["/en/owner-care", "/en/services/"],
  ["/en/brand-representative", "/en/contacts/"],
  ["/en/news-and-events", "/en/sustainability/"],
  ["/en/enquire", "/en/contacts/"],
  ["/en/arts-and-culture", "/en/sustainability/"],
  ["/en/about", "/en/about/"],
  ["/en/sustainability", "/en/sustainability/"],
  ["/en/services", "/en/services/"],
  ["/en/contacts", "/en/contacts/"],
  ["/en/team", "/en/about/"],
  ["/en/Boats-for-sale", "/en/services/"],
  ["/en/Boats-for-sale?filter=pre-owned", "/en/services/"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "website_backup"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function applyFixes(text, extra = []) {
  let next = text;
  for (const [from, to] of ENCODING_FIXES) next = next.split(from).join(to);
  for (const [from, to] of extra) next = next.split(from).join(to);
  if (next.includes("/fr/")) next = next.split("/fr/").join("/en/");
  return next;
}

function isSiteTextFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (rel.startsWith("tools/")) return false;
  if (/\.(svg|mp4|webm|png|jpe?g|gif|webp|woff2?|ttf|eot|ico|pdf|zip)$/i.test(rel)) return false;
  if (rel.startsWith("hubfs/146466316") && rel.endsWith(".js")) return true;
  if (!rel.endsWith(".html") && !/^(index\.html|en\/|website-free)/.test(rel) && !rel.includes("/index.html") && !rel.startsWith("en/")) {
    if (!rel.endsWith(".js") && !rel.endsWith(".css")) return false;
  }
  const ext = path.extname(rel);
  if ([".html", ".js", ".css", ""].includes(ext) || rel.startsWith("en/")) {
    try {
      const buf = fs.readFileSync(file);
      if (buf.includes(0)) return false;
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

let updated = 0;
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (!isSiteTextFile(file)) continue;

  const original = fs.readFileSync(file, "utf8");
  const extra = ["index.html", "en/index.html"].includes(rel) ? HOMEPAGE_FIXES : [];
  const next = applyFixes(original, extra);
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    updated++;
    console.log("fixed:", rel);
  }
}

console.log(`Encoding/language fixes applied to ${updated} file(s).`);
