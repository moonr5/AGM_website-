import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const REPLACEMENTS = [
  ["en/p61.svg", "en/p61.png"],
  ["/en/p61.svg", "/en/p61.png"],
  ["/en/p8.mp4", "/en/p8-lite.mp4"],
  ["en/p2.png", "en/p2.webp"],
  ["/en/images/services/charter-portrait.jpg", "/en/images/services/charter-portrait.webp"],
  ["/en/images/services/shipbuilding-portrait.jpg", "/en/images/services/shipbuilding-portrait.webp"],
  ["/en/images/services/support-portrait.jpg", "/en/images/services/support-portrait.webp"],
  [
    "/en/images/service-backgrounds/crewboat-charter-bg.jpg",
    "/en/images/service-backgrounds/crewboat-charter-bg.webp",
  ],
  [
    "/en/images/service-backgrounds/frp-shipbuilding-bg.jpg",
    "/en/images/service-backgrounds/frp-shipbuilding-bg.webp",
  ],
  [
    "/en/images/service-backgrounds/marine-support-bg.jpg",
    "/en/images/service-backgrounds/marine-support-bg.webp",
  ],
  ['"loading":"disabled"', '"loading":"lazy"'],
  ['"hydrateOn":"load","id":"seaLiving"', '"hydrateOn":"idle","id":"seaLiving"'],
  ['"hydrateOn":"load","id":"range"', '"hydrateOn":"idle","id":"range"'],
  ['"hydrateOn":"load","id":"below"', '"hydrateOn":"idle","id":"below"'],
  ["agm-mobile.css?v=5", "agm-mobile.css?v=6"],
  ["agm-appbar.css?v=2", "agm-appbar.css?v=3"],
  ["agm-hero-shared.css?v=1", "agm-hero-shared.css?v=2"],
  ["agm-smooth.js?v=3", "agm-smooth.js?v=4"],
  ["agm-services.css?v=1", "agm-services.css?v=2"],
  ["agm-services.js?v=1", "agm-services.js?v=2"],
  ["agm-about.css?v=11", "agm-about.css?v=12"],
  ["agm-about.js?v=3", "agm-about.js?v=4"],
];

function dedupeStylesheets(html) {
  const seen = new Set();
  return html.replace(/<link rel="stylesheet" href="([^"]+)">\s*/g, (full, href) => {
    if (seen.has(href)) return "";
    seen.add(href);
    return `<link rel="stylesheet" href="${href}">\n`;
  });
}

function stripStylePreloads(html) {
  return html.replace(/<link rel="preload" as="style" href="[^"]+">\s*/g, "");
}

function emptyHeroLoaders(html) {
  return html.replace(
    /(<div class="_heroImages_biyw3_32">)([\s\S]*?)(<\/div><div class="_overlay_biyw3_102")/,
    (_, open, inner, close) => {
      const stripped = inner.replace(
        /<img src="[^"]+" alt="[^"]*">/g,
        `<img src="${PIXEL}" alt="" width="1" height="1" loading="lazy" decoding="async">`,
      );
      return open + stripped + close;
    },
  );
}

function patchHeroVideos(html) {
  const start = html.indexOf('id="hero"');
  const end = html.indexOf('id="seaLiving"', start);
  if (start === -1 || end === -1) return html;

  let n = 0;
  const before = html.slice(0, start);
  let hero = html.slice(start, end);
  const after = html.slice(end);

  hero = hero.replace(/<video([^>]*)>([\s\S]*?)<\/video>/g, (_, attrs, inner) => {
    n += 1;
    attrs = attrs.replace(/\s*autoplay/gi, "").replace(/\s*preload="[^"]*"/gi, "");
    if (n === 1) {
      inner = inner.replace(/src="\/en\/p8(?:-lite)?\.mp4"/g, 'src="/en/p8-lite.mp4"');
      return `<video${attrs} preload="none" poster="/en/hero-poster.webp">${inner}</video>`;
    }
    inner = inner.replace(/src="[^"]*"/g, 'src=""');
    return `<video${attrs} preload="none" poster="/en/hero-poster.webp">${inner}</video>`;
  });

  return before + hero + after;
}

function patchBoot(html) {
  const old = `  <link rel="modulepreload" href="https://static.hsappstatic.net/cms-js-static/ex/js/react/v18/react-combined.mjs">
  <script type="module">
    import { initConfigSingletonFromJSON, setupIslandHydration } from "https://static.hsappstatic.net/cms-js-static/ex/js/island-runtime/v1/island-runtime.mjs"
    if (window.__hsEnvConfig) {
      initConfigSingletonFromJSON(window.__hsEnvConfig);
    }
    setupIslandHydration();
  </script>`;

  const next = `  <script type="module">
    import { initConfigSingletonFromJSON, setupIslandHydration } from "/hubfs/js/island-runtime/island-runtime.mjs";
    if (window.__hsEnvConfig) {
      initConfigSingletonFromJSON(window.__hsEnvConfig);
    }
    const boot = () => setupIslandHydration();
    const start = () => {
      if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 1200 });
      else setTimeout(boot, 1);
    };
    requestAnimationFrame(() => requestAnimationFrame(start));
  </script>`;

  if (!html.includes(old)) {
    console.warn("  island boot block not found — check index.html");
    return html;
  }
  return html.replace(old, next);
}

function injectHeadHints(html) {
  if (html.includes("hero-poster.webp")) {
    // still add font preload if missing
  }
  const hints = `
<link rel="icon" href="/en/favicon.png" sizes="32x32">
<link rel="preload" as="font" href="/hubfs/fonts/PPNeueMontreal/PPNeueMontreal-Variable.woff2" type="font/woff2" crossorigin>
<link rel="preload" as="image" href="/en/hero-poster.webp" fetchpriority="high">
<link rel="preload" as="image" href="/en/p61.png">
<script defer src="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-perf.js?v=2"></script>
`;
  if (html.includes("agm-perf.js")) return html;
  return html.replace("<base href=\"/\">", `<base href="/">\n${hints}`);
}

function deferBelowFoldCss(html) {
  html = html.replace(
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-services.css?v=2">',
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-services.css?v=2" media="print" onload="this.media=\'all\'">',
  );
  html = html.replace(
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-about.css?v=12">',
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-about.css?v=12" media="print" onload="this.media=\'all\'">',
  );
  for (const name of ["island-Dn4nrtOY.css", "island-D0xuzvwo.css", "island-BHS-UEXq.css"]) {
    html = html.replace(
      `<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/${name}">`,
      `<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/${name}" media="print" onload="this.media='all'">`,
    );
  }
  return html;
}

function delayAnalytics(html) {
  return html
    .replace(
      '<script type="text/javascript" id="hs-script-loader" async defer src="/hs/scriptloader/146466316.js"></script>',
      "",
    )
    .replace(
      '<script defer src="/hs/hsstatic/HubspotToolsMenu/static-1.640/js/index.js"></script>',
      "",
    );
}

function patchHomepage(file) {
  let html = readFileSync(join(ROOT, file), "utf8");
  html = html.replace(/@import url\('hubfs\/fonts\/playfair\/playfair\.css'\);\s*/g, "");
  html = dedupeStylesheets(html);
  html = stripStylePreloads(html);
  html = emptyHeroLoaders(html);
  html = patchHeroVideos(html);
  html = patchBoot(html);
  html = delayAnalytics(html);
  html = injectHeadHints(html);
  for (const [from, to] of REPLACEMENTS) html = html.split(from).join(to);
  html = html.replaceAll(
    '<img src="/en/p61.png" alt="AGM Logo" class="agm-brand-logo">',
    '<img src="/en/p61.png" alt="AGM Logo" class="agm-brand-logo" width="44" height="34" decoding="async">',
  );
  html = deferBelowFoldCss(html);
  writeFileSync(join(ROOT, file), html);
  console.log(`patched ${file}`);
}

function walkHtml(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const stat = statSync(abs);
    if (stat.isDirectory()) walkHtml(abs, files);
    else if (name.endsWith(".html")) files.push(abs);
  }
  return files;
}

function patchInnerPages() {
  const files = walkHtml(join(ROOT, "en")).filter(
    (file) => !file.endsWith("en\\index.html") && !file.endsWith("en/index.html"),
  );
  for (const file of files) {
    let html = readFileSync(file, "utf8");
    const next = html
      .replaceAll('href="/en/p61.svg"', 'href="/en/favicon.png"')
      .replaceAll("agm-pages.js?v=1", "agm-pages.js?v=2")
      .replaceAll("agm-pages.css?v=1", "agm-pages.css?v=2");
    if (next !== html) {
      writeFileSync(file, next);
      console.log(`patched ${file.slice(ROOT.length + 1)}`);
    }
  }
}

patchHomepage("index.html");
patchHomepage("en/index.html");
patchInnerPages();
console.log("Homepage speed patches applied.");
