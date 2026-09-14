const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HERO_VIDEO = "/en/p8.mp4";
const HERO_VIDEO_ESC = "\\u002Fen\\u002Fp8.mp4";

const HTML_FILES = [
  "index.html",
  "en/index.html",
  "website-free.html",
  "website-free",
];

const HERO_BG_KEYS = [
  "background0",
  "background0mobile",
  "background1",
  "background1mobile",
  "background2",
  "background2mobile",
  "background3",
  "background3mobile",
];

function patchHeroIslandJson(text) {
  const marker = '"id":"hero"';
  const idx = text.indexOf(marker);
  if (idx === -1) return text;

  const end = text.indexOf('"id":"seaLiving"', idx);
  if (end === -1) return text;

  const before = text.slice(0, idx);
  let hero = text.slice(idx, end);
  const after = text.slice(end);

  for (const key of HERO_BG_KEYS) {
    const re = new RegExp(
      `"${key}":\\{"content_id":null,"href":"[^"]*","href_with_scheme":"[^"]*","type":"[^"]*"\\}`,
      "g",
    );
    hero = hero.replace(
      re,
      `"${key}":{"content_id":null,"href":"${HERO_VIDEO}","href_with_scheme":"${HERO_VIDEO}","type":"EXTERNAL"}`,
    );
  }

  // Hide small foreground preview videos; keep text carousel only.
  for (let i = 0; i < 4; i += 1) {
    const key = `foreground${i}`;
    const re = new RegExp(
      `"${key}":\\{"content_id":null,"href":"[^"]*","href_with_scheme":"[^"]*","type":"[^"]*"\\}`,
      "g",
    );
    hero = hero.replace(
      re,
      `"${key}":{"content_id":null,"href":"","href_with_scheme":"","type":"EXTERNAL"}`,
    );
  }

  return before + hero + after;
}

function patchHeroSsrVideos(text) {
  const start = text.indexOf('id="hero"');
  const end = text.indexOf('id="seaLiving"', start);
  if (start === -1 || end === -1) return text;

  const before = text.slice(0, start);
  let hero = text.slice(start, end);
  const after = text.slice(end);

  hero = hero.replace(/<video[\s\S]*?<\/video>/g, (block) =>
    block
      .replace(/src="[^"]+\.mp4"/g, `src="${HERO_VIDEO}"`)
      .replace(/<source src="[^"]+\.mp4"/g, `<source src="${HERO_VIDEO}"`),
  );

  // Collapse small preview stack to a single static clip.
  hero = hero.replace(
    /<div class="_smallVideo_ty1x2_64">[\s\S]*?<\/div><div class="_titleContainer_ty1x2_107">/,
    `<div class="_smallVideo_ty1x2_64" style="display:none"></div><div class="_titleContainer_ty1x2_107">`,
  );

  return before + hero + after;
}

function patchWarmScript(text) {
  return text.replace(
    /const sources = \[[\s\S]*?\];/,
    `const sources = [\n      "${HERO_VIDEO}",\n      "/en/videos/services/charter-blue.mp4",\n      "/en/videos/services/shipbuilding-blue.mp4",\n      "/en/videos/services/marine-support-blue.mp4"\n  ];`,
  );
}

function patchAgmSmooth(text) {
  return text.replace(
    /const WARM_SOURCES = \[[\s\S]*?\];/,
    `const WARM_SOURCES = [\n    "${HERO_VIDEO}",\n    "/en/videos/services/charter-blue.mp4",\n    "/en/videos/services/shipbuilding-blue.mp4",\n    "/en/videos/services/marine-support-blue.mp4",\n  ];`,
  );
}

let count = 0;
for (const rel of HTML_FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  text = patchHeroIslandJson(text);
  if (rel.endsWith(".html") || rel === "website-free") {
    text = patchHeroSsrVideos(text);
    text = patchWarmScript(text);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    console.log("updated", rel);
    count += 1;
  }
}

const smooth = path.join(
  ROOT,
  "hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-smooth.js",
);
if (fs.existsSync(smooth)) {
  const original = fs.readFileSync(smooth, "utf8");
  const next = patchAgmSmooth(original);
  if (next !== original) {
    fs.writeFileSync(smooth, next, "utf8");
    console.log("updated agm-smooth.js");
    count += 1;
  }
}

// Optional CSS: keep one hero background visible while slides change text.
const cssPath = path.join(
  ROOT,
  "hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-hero-p8.css",
);
const css = `/* Fixed p8 background: keep video visible on every hero text slide. */
#hero ._video_ty1x2_6 > div:not(._overlay_ty1x2_22) {
  opacity: 1 !important;
  clip-path: inset(0 0 0 0) !important;
  -webkit-clip-path: inset(0 0 0 0) !important;
}

#hero ._video_ty1x2_6 video {
  opacity: 1 !important;
}

#hero ._smallVideo_ty1x2_64 {
  display: none !important;
}
`;
fs.writeFileSync(cssPath, css, "utf8");
console.log("wrote agm-hero-p8.css");

for (const rel of ["index.html", "en/index.html", "website-free.html"]) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  const link =
    '<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-hero-p8.css">';
  if (!text.includes("agm-hero-p8.css")) {
    text = text.replace(
      '<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/island-BNVETaCL.css">',
      `${link}\n<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/island-BNVETaCL.css">`,
    );
    fs.writeFileSync(file, text, "utf8");
    console.log("linked css in", rel);
    count += 1;
  }
}

console.log(`Hero p8-only patch complete. ${count} update(s).`);

// Keep one background clip playing while hero text advances.
const islandPath = path.join(
  ROOT,
  "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DKwCZMR6.js",
);
if (fs.existsSync(islandPath)) {
  let island = fs.readFileSync(islandPath, "utf8");
  const original = island;
  island = island.replace(/isPlaying:a&&s===0/g, "isPlaying:a");
  island = island.replace(/isPlaying:a&&s===c/g, "isPlaying:a");
  if (island !== original) {
    fs.writeFileSync(islandPath, island, "utf8");
    console.log("patched island-DKwCZMR6.js");
  }
}
