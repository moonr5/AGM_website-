const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const patterns = [
  "AGM-vessel-charter",
  "vessel-charter.jpg/",
  ".jpg/",
  "Massimo-Perotti",
  "third%20paradise",
  "module_appbar.css",
  "content-cwv-embed",
];

for (const rel of ["index.html", "en/index.html", "website-free.html"]) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  console.log("\n==", rel, "==");
  for (const p of patterns) {
    if (!text.includes(p)) continue;
    let idx = 0;
    let n = 0;
    while ((idx = text.indexOf(p, idx)) !== -1 && n < 3) {
      console.log(p, "->", text.slice(Math.max(0, idx - 80), idx + p.length + 80));
      idx += p.length;
      n++;
    }
  }
}
