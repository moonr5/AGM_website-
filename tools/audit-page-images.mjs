/**
 * Contact sheet of every image referenced by the inner pages, so mismatched or
 * leftover stock photography is easy to spot.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const pages = fs
  .readdirSync("en", { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join("en", d.name, "index.html"))
  .filter((f) => fs.existsSync(f));

const rows = [];
for (const page of pages) {
  const html = fs.readFileSync(page, "utf8");
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g)) {
    const src = m[1];
    if (!src.startsWith("/")) continue;
    const alt = /alt="([^"]*)"/.exec(m[0])?.[1] ?? "";
    rows.push({ page: page.replace(/\\/g, "/"), src, alt });
  }
}

console.log(`${rows.length} images across ${pages.length} pages\n`);

const TILE_W = 190;
const TILE_H = 130;
const COLS = 6;
const tiles = [];
const labels = [];

for (const row of rows) {
  const file = row.src.replace(/^\//, "");
  if (!fs.existsSync(file)) {
    console.log(`  MISSING  ${row.src}   <- ${row.page}`);
    continue;
  }
  try {
    tiles.push(await sharp(file).resize(TILE_W, TILE_H, { fit: "cover" }).toBuffer());
    labels.push(row);
  } catch (e) {
    console.log(`  UNREADABLE ${row.src}: ${e.message}`);
  }
}

const rowsN = Math.ceil(tiles.length / COLS);
await sharp({
  create: {
    width: COLS * (TILE_W + 6),
    height: rowsN * (TILE_H + 6),
    channels: 3,
    background: "#ffffff"
  }
})
  .composite(
    tiles.map((input, i) => ({
      input,
      left: (i % COLS) * (TILE_W + 6),
      top: Math.floor(i / COLS) * (TILE_H + 6)
    }))
  )
  .png()
  .toFile("tools/_page-images.png");

console.log("\nsheet order (row-major):");
labels.forEach((l, i) => {
  console.log(`  ${String(i).padStart(2)}  ${l.page.replace("en/", "").replace("/index.html", "").padEnd(22)} ${l.src}`);
});
