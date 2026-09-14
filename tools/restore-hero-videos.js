const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Restore original p7 / p8 / p9 hero sequence (reverse of use-p8-hero-video.js).
const REPLACEMENTS = [
  ["/en/p8.mp4", "/en/p7.mp4"],
  ["\\u002Fen\\u002Fp8.mp4", "\\u002Fen\\u002Fp7.mp4"],
];

const FILES = [
  "index.html",
  "en/index.html",
  "website-free.html",
  "website-free",
  "hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-smooth.js",
];

function restoreHeroIslandJson(text) {
  const marker = '"id":"hero"';
  const idx = text.indexOf(marker);
  if (idx === -1) return text;

  const seaIdx = text.indexOf('"id":"seaLiving"', idx);
  const end = seaIdx === -1 ? text.length : seaIdx;
  const before = text.slice(0, idx);
  let hero = text.slice(idx, end);
  const after = text.slice(end);

  const map = {
    background0: "/en/p7.mp4",
    background0mobile: "/en/p7.mp4",
    background1: "/en/p8.mp4",
    background1mobile: "/en/p8.mp4",
    background2: "/en/p9.mp4",
    background2mobile: "/en/p9.mp4",
    background3: "/en/p9.mp4",
    background3mobile: "/en/p9.mp4",
  };

  for (const [key, href] of Object.entries(map)) {
    const re = new RegExp(
      `"${key}":\\{"content_id":null,"href":"[^"]+","href_with_scheme":"[^"]+","type":"EXTERNAL"\\}`,
      "g"
    );
    hero = hero.replace(
      re,
      `"${key}":{"content_id":null,"href":"${href}","href_with_scheme":"${href}","type":"EXTERNAL"}`
    );
  }

  return before + hero + after;
}

function restoreSsrVideos(text) {
  const start = text.indexOf('id="hero"');
  const end = text.indexOf('id="seaLiving"', start);
  if (start === -1 || end === -1) return text;

  const before = text.slice(0, start);
  let hero = text.slice(start, end);
  const after = text.slice(end);

  const cycle = [
    "/en/p7.mp4",
    "/en/p7.mp4",
    "/en/p8.mp4",
    "/en/p8.mp4",
    "/en/p9.mp4",
    "/en/p9.mp4",
    "/en/p7.mp4",
    "/en/p7.mp4",
  ];
  let idx = 0;

  hero = hero.replace(/<video[\s\S]*?<\/video>/g, (block) => {
    const href = cycle[idx] ?? cycle[cycle.length - 1];
    idx += 1;
    return block.replace(/src="[^"]+"/g, `src="${href}"`).replace(
      /<source src="[^"]+"/g,
      (src) => {
        const media = src.match(/media="[^"]+"/);
        return media
          ? `<source src="${href}" ${media[0]}`
          : `<source src="${href}"`;
      }
    );
  });

  return before + hero + after;
}

for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  const original = text;

  if (rel.endsWith(".html") || rel === "website-free") {
    text = restoreHeroIslandJson(text);
    text = restoreSsrVideos(text);
  } else {
    for (const [from, to] of REPLACEMENTS) {
      text = text.split(from).join(to);
    }
    // agm-smooth.js: restore p9 in cycle where all became p8
    text = text.replace(
      /const cycle = \[([^\]]+)\]/,
      'const cycle = ["/en/p7.mp4", "/en/p7.mp4", "/en/p8.mp4", "/en/p8.mp4", "/en/p9.mp4", "/en/p9.mp4", "/en/p7.mp4", "/en/p7.mp4"]'
    );
  }

  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    console.log("restored", rel);
  }
}

console.log("Done.");
