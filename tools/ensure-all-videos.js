const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BACKUP = path.join(ROOT, "website_backup");

const HTML_FILES = [
  "index.html",
  "en/index.html",
  "website-free.html",
  "website-free",
];

const VIDEO_FILES = [
  "en/p7.mp4",
  "en/p9.mp4",
  "en/v1.mp4",
  "en/videos/services/charter-blue.mp4",
  "en/videos/services/shipbuilding-blue.mp4",
  "en/videos/services/marine-support-blue.mp4",
];

const HERO_MAP = {
  background0: "/en/p8.mp4",
  background0mobile: "/en/p8.mp4",
  background1: "/en/p8.mp4",
  background1mobile: "/en/p8.mp4",
  background2: "/en/p8.mp4",
  background2mobile: "/en/p8.mp4",
  background3: "/en/p8.mp4",
  background3mobile: "/en/p8.mp4",
};

const SERVICE_MAP = {
  video1: "/en/videos/services/charter-blue.mp4",
  video2: "/en/videos/services/shipbuilding-blue.mp4",
  video3: "/en/videos/services/marine-support-blue.mp4",
  background1: "/en/images/service-backgrounds/crewboat-charter-bg.jpg",
  background2: "/en/images/service-backgrounds/frp-shipbuilding-bg.jpg",
  background3: "/en/images/service-backgrounds/marine-support-bg.jpg",
};

const HERO_SSR_CYCLE = [
  "/en/p8.mp4",
  "/en/p8.mp4",
  "/en/p8.mp4",
  "/en/p8.mp4",
  "/en/p8.mp4",
  "/en/p8.mp4",
  "/en/p8.mp4",
  "/en/p8.mp4",
];

const WARM_SOURCES = [
  "/en/p7.mp4",
  "/en/p8.mp4",
  "/en/p9.mp4",
  "/en/videos/services/charter-blue.mp4",
  "/en/videos/services/shipbuilding-blue.mp4",
  "/en/videos/services/marine-support-blue.mp4",
];

function isLfsPointer(file) {
  if (!fs.existsSync(file)) return true;
  const size = fs.statSync(file).size;
  if (size < 1000) return true;
  const head = fs.readFileSync(file, "utf8").slice(0, 40);
  return head.startsWith("version https://git-lfs.github.com");
}

function ensureVideo(rel) {
  const dest = path.join(ROOT, rel);
  if (!isLfsPointer(dest)) return;
  const backup = path.join(BACKUP, rel);
  if (!fs.existsSync(backup) || fs.statSync(backup).size < 1000) {
    console.warn("missing backup for", rel);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(backup, dest);
  console.log("restored", rel);
}

function patchIsland(text, islandId, fieldMap, hrefOnly = false) {
  const marker = `"id":"${islandId}"`;
  const idx = text.indexOf(marker);
  if (idx === -1) return text;

  const nextIds = ["hero", "seaLiving", "range", "below"];
  const pos = nextIds.indexOf(islandId);
  const endMarker =
    pos >= 0 && pos < nextIds.length - 1
      ? `"id":"${nextIds[pos + 1]}"`
      : null;
  const end = endMarker ? text.indexOf(endMarker, idx + marker.length) : text.length;
  const before = text.slice(0, idx);
  let island = text.slice(idx, end === -1 ? text.length : end);
  const after = end === -1 ? "" : text.slice(end);

  for (const [key, value] of Object.entries(fieldMap)) {
    if (hrefOnly || key.startsWith("video") || key.startsWith("background")) {
      const hrefRe = new RegExp(
        `"${key}":\\{"content_id":null,"href":"[^"]+","href_with_scheme":"[^"]+","type":"[^"]+"\\}`,
        "g",
      );
      island = island.replace(
        hrefRe,
        `"${key}":{"content_id":null,"href":"${value}","href_with_scheme":"${value}","type":"EXTERNAL"}`,
      );
    }
    if (key.startsWith("background")) {
      const imgRe = new RegExp(
        `"${key}":\\{"alt":"[^"]*","height":\\d+,"src":"[^"]+","width":\\d+\\}`,
        "g",
      );
      const altMatch = island.match(new RegExp(`"${key}":\\{"alt":"([^"]*)"`));
      const alt = altMatch ? altMatch[1] : key;
      island = island.replace(
        imgRe,
        `"${key}":{"alt":"${alt}","height":1080,"src":"${value}","width":1920}`,
      );
    }
  }

  return before + island + after;
}

function patchHeroSsr(text) {
  const start = text.indexOf('id="hero"');
  const end = text.indexOf('id="seaLiving"', start);
  if (start === -1 || end === -1) return text;

  const before = text.slice(0, start);
  let hero = text.slice(start, end);
  const after = text.slice(end);
  let idx = 0;

  hero = hero.replace(/<video[\s\S]*?<\/video>/g, (block) => {
    const href = HERO_SSR_CYCLE[idx] ?? HERO_SSR_CYCLE[HERO_SSR_CYCLE.length - 1];
    idx += 1;
    return block
      .replace(/src="[^"]+"/g, `src="${href}"`)
      .replace(/<source src="[^"]+"/g, (src) => {
        const media = src.match(/media="[^"]+"/);
        return media ? `<source src="${href}" ${media[0]}` : `<source src="${href}"`;
      });
  });

  return before + hero + after;
}

function ensureWarmScript(text) {
  const block = `
  <script defer>
(function () {
  const sources = ${JSON.stringify(WARM_SOURCES, null, 4).replace(/\n/g, "\n  ")};

  function warmVideo(src) {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = src;
    video.load();
  }

  function warmAll() {
    sources.forEach((src, index) => {
      setTimeout(() => warmVideo(src), index * 250);
    });
  }

  if (document.readyState === "complete") {
    warmAll();
  } else {
    window.addEventListener("load", warmAll, { once: true });
  }
})();
  </script>
`;

  const marker = '<script defer src="hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-smooth.js"></script>';
  if (!text.includes(marker)) return text;

  if (text.includes('const sources = [\n    "/en/p7.mp4"')) {
    text = text.replace(
      /<script defer>\s*\(function \(\) \{\s*const sources = \[[\s\S]*?\}\)\(\);\s*<\/script>\s*(?=<script defer src="hubfs\/raw_assets\/homepage\/179\/js_client_assets\/assets\/agm-smooth.js"><\/script>)/,
      block.trim() + "\n\n  ",
    );
    return text;
  }

  if (!text.includes("warmVideo(src)")) {
    return text.replace(marker, block.trim() + "\n\n  " + marker);
  }

  return text;
}

function patchAgmSmooth() {
  // agm-smooth.js is maintained manually; ensure-all-videos only warms via HTML preload.
}

for (const rel of VIDEO_FILES) ensureVideo(rel);

for (const rel of HTML_FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  text = patchIsland(text, "hero", HERO_MAP);
  text = patchIsland(text, "seaLiving", SERVICE_MAP);
  if (rel.endsWith(".html") || rel === "website-free") {
    text = patchHeroSsr(text);
    text = ensureWarmScript(text);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    console.log("updated", rel);
  }
}

patchAgmSmooth();
console.log("All homepage videos verified and aligned.");
