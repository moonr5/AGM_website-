/**
 * Crop the homepage hero photograph.
 *
 * The source is a tall frame with a pale sky on top and dark water below. The
 * hero sets its copy over the lower half, so the crop is biased downwards: it
 * keeps the vessel and as much dark water as possible, which is what gives the
 * white headline something to sit on.
 */
import sharp from "sharp";

const SRC = "en/images/service-backgrounds/crewboat-charter-bg.webp";
const OUT = "en/images/hero/home-hero.webp";

const meta = await sharp(SRC).metadata();
const cropW = meta.width;
const cropH = Math.round(cropW / (16 / 9));
// Drop most of the empty sky, but leave enough that the horizon still reads.
const top = Math.min(meta.height - cropH, Math.round((meta.height - cropH) * 0.62));

console.log(`source ${meta.width}x${meta.height}`);
console.log(`crop   ${cropW}x${cropH} at top=${top}`);

await sharp(SRC)
  .extract({ left: 0, top, width: cropW, height: cropH })
  .webp({ quality: 82 })
  .toFile(OUT);

const done = await sharp(OUT).metadata();
console.log(`wrote  ${OUT} -> ${done.width}x${done.height}`);

await sharp(OUT).png().toFile("tools/_hero-preview.png");
