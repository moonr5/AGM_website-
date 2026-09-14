import fs from "node:fs";

// The "Our fleet" tile carried a stock superyacht and "The yard" tile carried
// harbour porters. Both now show AGM's own vessel and yard.
const SWAPS = [
  [
    '<img src="/en/images/company-profile/vessel-charter.jpg" alt="Charter-ready crewboat">',
    '<img src="/en/images/hero/fleet-tile.webp" alt="An AGM crewboat under way" loading="lazy">'
  ],
  [
    '<img src="/en/images/company-profile/frp-shipbuilding.jpg" alt="Yard team at Marunda">',
    '<img src="/en/images/service-backgrounds/frp-shipbuilding-bg.webp" alt="An FRP hull under construction at the Marunda yard" loading="lazy">'
  ]
];

for (const file of ["index.html", "en/index.html"]) {
  let html = fs.readFileSync(file, "utf8");
  let hits = 0;
  for (const [from, to] of SWAPS) {
    if (html.includes(from)) {
      html = html.replace(from, to);
      hits++;
    }
  }
  fs.writeFileSync(file, html);
  console.log(`  ${file}: ${hits}/${SWAPS.length} tiles swapped`);
}
