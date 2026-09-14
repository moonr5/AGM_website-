/**
 * Remove two pieces of dead weight from the homepage.
 *
 * 1. PPNeueMontreal. It was preloaded (146 KB), declared as an @font-face, and
 *    set as the body font, but the only stylesheet that asks for it belongs to
 *    the Iubenda cookie banner, which is not installed. Body copy now uses the
 *    brand sans token like the rest of the site.
 *
 * 2. The autoplaying background video in the blue-economy card. It is the last
 *    survivor of the old video hero, costs a cancelled range request on every
 *    load, and its own poster frame is what viewers actually see.
 */
import fs from "node:fs";

const FONTFACE =
  /\s*@font-face \{\s*font-family: 'PPNeueMontreal';[\s\S]*?font-display: swap;\s*\}\n/;
const PRELOAD =
  /\s*<link rel="preload" as="font" href="\/hubfs\/fonts\/PPNeueMontreal\/PPNeueMontreal-Variable\.woff2"[^>]*>/;
const VIDEO =
  /<video autoplay muted loop playsinline preload="metadata" poster="\/en\/hero-poster\.webp">\s*<source src="\/en\/p8-lite\.mp4" type="video\/mp4">\s*<\/video>/;

const VIDEO_REPLACEMENT =
  '<img src="/en/hero-poster.webp" alt="Open water at dusk off the Java coast" loading="lazy" decoding="async">';

for (const file of ["index.html", "en/index.html"]) {
  let html = fs.readFileSync(file, "utf8");
  const report = [];

  if (PRELOAD.test(html)) {
    html = html.replace(PRELOAD, "");
    report.push("preload removed");
  }
  if (FONTFACE.test(html)) {
    html = html.replace(FONTFACE, "\n");
    report.push("@font-face removed");
  }
  if (html.includes("font-family: 'PPNeueMontreal';")) {
    html = html.replace("font-family: 'PPNeueMontreal';", "font-family: var(--agm-sans);");
    report.push("body font retargeted");
  }
  if (VIDEO.test(html)) {
    html = html.replace(VIDEO, VIDEO_REPLACEMENT);
    report.push("background video replaced with its poster");
  }

  fs.writeFileSync(file, html);
  const left = (html.match(/PPNeueMontreal/g) || []).length;
  console.log(`  ${file}: ${report.join(", ") || "nothing to do"}  (${left} refs left)`);
}
