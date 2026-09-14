/**
 * Regrade the homepage hero photograph.
 *
 * The source frame is a hazy, low-contrast grey sea. Behind the reference
 * site's lighter scrim it reads as flat murk, so lift contrast and saturation
 * and sharpen slightly to recover separation between hull, water and sky.
 * The 16:9 crop is biased high to keep the horizon out of the copy block.
 */
import sharp from "sharp";
import fs from "node:fs";

const SRC = "en/images/service-backgrounds/crewboat-charter-bg.jpg";
const OUT = "en/images/hero/home-hero.webp";
const BACKUP = "en/images/hero/home-hero.flat.webp";

if (fs.existsSync(OUT) && !fs.existsSync(BACKUP)) {
  fs.copyFileSync(OUT, BACKUP);
  console.log(`kept the previous grade at ${BACKUP}`);
}

const meta = await sharp(SRC).metadata();
const cropH = Math.round(meta.width * 9 / 16);
const top = Math.round((meta.height - cropH) * 0.34);

await sharp(SRC)
  .extract({ left: 0, top, width: meta.width, height: cropH })
  .resize(1600, 900, { fit: "cover" })
  .modulate({ brightness: 1.05, saturation: 1.35 })
  .linear(1.18, -14)
  .sharpen({ sigma: 0.8 })
  .webp({ quality: 82 })
  .toFile(OUT);

const out = await sharp(OUT).metadata();
console.log(`wrote ${OUT}  ${out.width}x${out.height}  ${Math.round(fs.statSync(OUT).size / 1024)}KB`);
