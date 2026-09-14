const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Replace mojibake with plain ASCII punctuation (safe for all text/HTML/JSON).
const ENCODING_FIXES = [
  ["\u00c3\u0082\u00c2\u00a9", "(c)"],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a9", "(c)"],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009d", '"'],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c", '"'],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u0099", "'"],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00cb\u0153", "'"],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u0093", " - "],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u0094", " - "],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00ba", ">"],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a2", " - "],
  ["\u00c3\u00a2\u00e2\u0082\u00ac\u00c2", ""],
  ["\u00e2\u0080\u0094", " - "],
  ["\u00e2\u0080\u0093", " - "],
  ["\u00e2\u0080\u0099", "'"],
  ["\u00e2\u0080\u0098", "'"],
  ["\u00e2\u0080\u009c", '"'],
  ["\u00e2\u0080\u009d", '"'],
  ["\u00e2\u0080\u00a2", " - "],
  ["\u00e2\u0080\u00ba", ">"],
  ["\u00e2\u0086\u0090", "<-"],
  ["\u00c2\u00a9", "(c)"],
  ["\u00c2\u00ba", ""],
  ["â€”", " - "],
  ["â€“", " - "],
  ["â€¢", " - "],
  ["â€˜", "'"],
  ["â€™", "'"],
  ["â€œ", '"'],
  ["â€\u009d", '"'],
  ["â€º", ">"],
  ["â†\u0090", "<-"],
  ["Â©", "(c)"],
  ["Âº", ""],
  ["Ã‚©", "(c)"],
  ["Ã¢â‚¬â„¢", "'"],
  ["Ã¢â‚¬Å“", '"'],
  ["Ã¢â‚¬\u009d", '"'],
  ["Ã¢â‚¬â€œ", " - "],
  ["Ã¢â‚¬â€", " - "],
  ["Ã¢â‚¬Âº", ">"],
  ["Ã¢â‚¬\"", " - "],
];

const TEXT_FIXES = [
  ["our cultural compass", "Engineering reliable maritime solutions."],
  ["Copyright (c) 2026 by Sanlorenzo Spa  |  P.IVA 01109160117", "Copyright (c) 2026 PT. Agara Global Maritim | Your Trusted Partner for Marine Services"],
  ["welcome@sanlorenzoyacht.com", "ardi.2772@gmail.com"],
  ["https://www.sanlorenzoyacht.com", "https://agmaritim.com"],
  ["sanlorenzoyacht.com", "agmaritim.com"],
  ["Sanlorenzo S.p.A", "PT. Agara Global Maritim"],
  ["http://localhost:8080", "https://agmaritim.com"],
  ['language: "it"', 'language: "en"'],
  ["www.stratconagaraglobal.com", "agmaritim.com"],
];

const SCHEMA = `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PT. Agara Global Maritim",
    "description": "Indonesian marine services company specializing in vessel charter, FRP shipbuilding, and marine support.",
    "legalName": "PT. Agara Global Maritim",
    "url": "https://agmaritim.com",
    "logo": "/en/p61.svg",
    "foundingDate": "2020",
    "foundingLocation": {
      "@type": "Place",
      "address": "Jakarta, Indonesia"
    },
    "location": [
      {
        "@type": "Place",
        "name": "Marunda Shipyard",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Marunda, North Jakarta",
          "postalCode": "14130",
          "addressLocality": "North Jakarta",
          "addressRegion": "Jakarta",
          "addressCountry": "Indonesia"
        }
      }
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+62 813-5439-6700",
        "email": "ardi.2772@gmail.com",
        "contactType": "customer service",
        "availableLanguage": "English"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/agaraglobalmaritim/",
      "https://www.instagram.com/agaraglobalmaritim/",
      "https://www.linkedin.com/company/agaraglobalmaritim/",
      "https://www.youtube.com/@agaraglobalmaritim"
    ]
  }
</script>`;

const SKIP_DIRS = new Set(["node_modules", ".git", "website_backup", "tools"]);
const SKIP_FILES = new Set([
  "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DwW7ueMe.js",
]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(name.name)) continue;
    const abs = path.join(dir, name.name);
    if (name.isDirectory()) walk(abs, out);
    else out.push(abs);
  }
  return out;
}

function applyFixes(text) {
  let next = text;
  for (const [from, to] of ENCODING_FIXES) next = next.split(from).join(to);
  for (const [from, to] of TEXT_FIXES) next = next.split(from).join(to);
  if (next.includes('"@type": "Organization"')) {
    next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, SCHEMA);
    next = next.replace(/,\s*,/g, ",").replace(/\[\s*,/g, "[").replace(/,\s*\]/g, "]");
  }
  return next;
}

const exts = new Set([".html", ".htm", ""]);
let fixed = 0;

for (const abs of walk(ROOT)) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  if (SKIP_FILES.has(rel)) continue;
  const ext = path.extname(abs).toLowerCase();
  if (!exts.has(ext)) continue;
  if (rel.startsWith("hubfs/") && ext === ".js") continue;

  const original = fs.readFileSync(abs, "utf8");
  const next = applyFixes(original);
  if (next !== original) {
    fs.writeFileSync(abs, next, "utf8");
    console.log("fixed:", rel);
    fixed += 1;
  }
}

console.log(`Encoding and English cleanup complete. ${fixed} file(s) updated.`);
