const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const REPLACEMENTS = [
  [/shipbuildingÃ¢â‚¬"delivering/g, "shipbuilding, delivering"],
  [/NEW FLEET Ã¢â‚¬" Crewboat/g, "NEW FLEET - Crewboat"],
  [/Ã¢â‚¬"/g, " - "],
  [/\/en\/videos\/services\/en\/services\/-blue\.mp4/g, "/en/videos/services/charter-blue.mp4"],
  [/en\/p6\.svg/g, "en/p61.svg"],
];

function fixFile(rel) {
  const file = path.join(ROOT, rel);
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  for (const [pattern, replacement] of REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(
    /<link rel="stylesheet" href="hubfs\/hub_generated\/module_assets\/1\/303280081137\/1779285400441\/module_appbar\.css">\s*\r?\n/g,
    "",
  );

  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    console.log("fixed:", rel);
  }
}

for (const rel of ["index.html", "en/index.html"]) fixFile(rel);

const sl = path.join(
  ROOT,
  "hubfs/146466316/Homepage/metrics/desktop/Metric_scale_SL.svg",
);
const copies = [
  "hubfs/146466316/Homepage/metrics/desktop/Metric_scale_SD.svg",
  "hubfs/146466316/Homepage/metrics/mobile/scale_3_m.svg",
  "hubfs/146466316/Homepage/metrics/mobile/scale_4_m.svg",
];
if (fs.existsSync(sl)) {
  for (const rel of copies) {
    const dest = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(sl, dest);
      console.log("created:", rel);
    }
  }
}

const p61 = path.join(ROOT, "en/p61.svg");
const p6 = path.join(ROOT, "en/p6.svg");
if (fs.existsSync(p61) && !fs.existsSync(p6)) {
  fs.copyFileSync(p61, p6);
  console.log("created: en/p6.svg");
}

// Validate island JSON lines parse
for (const rel of ["index.html", "en/index.html"]) {
  const lines = fs.readFileSync(path.join(ROOT, rel), "utf8").split(/\n/);
  for (const n of [1764, 1843]) {
    const line = lines[n - 1];
    const json = line.replace(/^\s*var newIslands = /, "").replace(/;\s*$/, "");
    try {
      JSON.parse(json);
      console.log(rel, "line", n, "JSON OK");
    } catch (e) {
      console.error(rel, "line", n, "JSON FAIL:", e.message);
      process.exitCode = 1;
    }
  }
}
