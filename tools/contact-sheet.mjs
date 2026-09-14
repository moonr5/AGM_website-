/**
 * Build a labelled contact sheet of candidate photographs so several can be
 * judged side by side instead of opening them one at a time.
 * Usage: node tools/contact-sheet.mjs out.png <img> [<img> ...]
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2];
const files = process.argv.slice(3).filter((f) => fs.existsSync(f));
if (!files.length) {
  console.log("no input images found");
  process.exit(1);
}

const CELL_W = 420;
const CELL_H = 236;
const LABEL_H = 22;
const COLS = 3;
const rows = Math.ceil(files.length / COLS);

const composites = [];
for (let i = 0; i < files.length; i++) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const buf = await sharp(files[i])
    .resize(CELL_W, CELL_H, { fit: "cover", position: "center" })
    .toBuffer();
  composites.push({ input: buf, left: col * CELL_W, top: row * (CELL_H + LABEL_H) });

  const name = path.basename(files[i]);
  const label = Buffer.from(
    `<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#111"/>` +
      `<text x="6" y="15" font-family="monospace" font-size="12" fill="#eee">${i + 1}. ${name}</text></svg>`
  );
  composites.push({
    input: label,
    left: col * CELL_W,
    top: row * (CELL_H + LABEL_H) + CELL_H
  });
}

await sharp({
  create: {
    width: COLS * CELL_W,
    height: rows * (CELL_H + LABEL_H),
    channels: 3,
    background: "#111"
  }
})
  .composite(composites)
  .png()
  .toFile(out);

console.log(`wrote ${out} (${files.length} images)`);
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
