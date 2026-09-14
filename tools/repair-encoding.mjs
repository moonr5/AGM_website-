/**
 * Repair HTML files that were round-tripped through Windows-1252.
 *
 * Two kinds of damage are undone:
 *   1. Multi-byte UTF-8 characters that collapsed to a single 1252 byte
 *      (an em dash became 0x97, a middle dot 0xB7). Valid UTF-8 sequences are
 *      left untouched, so this is safe to run on a partially damaged file.
 *   2. Characters with no 1252 equivalent, which became a literal "?". Only the
 *      known arrow spans are restored; a bare "?" elsewhere (a JS ternary, say)
 *      is left alone.
 *
 * Usage: node tools/repair-encoding.mjs [--write] file...
 */
import fs from "node:fs";

const write = process.argv.includes("--write");
const files = process.argv.slice(2).filter((a) => a !== "--write");

// The 0x80-0x9F range is where 1252 differs from Latin-1.
const CP1252_HIGH = {
  0x82: "\u201A", 0x83: "\u0192", 0x84: "\u201E", 0x85: "\u2026", 0x86: "\u2020",
  0x87: "\u2021", 0x88: "\u02C6", 0x89: "\u2030", 0x8a: "\u0160", 0x8b: "\u2039",
  0x8c: "\u0152", 0x8e: "\u017D", 0x91: "\u2018", 0x92: "\u2019", 0x93: "\u201C",
  0x94: "\u201D", 0x95: "\u2022", 0x96: "\u2013", 0x97: "\u2014", 0x98: "\u02DC",
  0x99: "\u2122", 0x9a: "\u0161", 0x9b: "\u203A", 0x9c: "\u0153", 0x9e: "\u017E",
  0x9f: "\u0178"
};

const ARROW = "\u2197"; // the glyph agm-travelo.js uses

function decodeMixed(buf) {
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b < 0x80) { out += String.fromCharCode(b); continue; }

    let need = 0;
    if (b >= 0xc2 && b <= 0xdf) need = 1;
    else if (b >= 0xe0 && b <= 0xef) need = 2;
    else if (b >= 0xf0 && b <= 0xf4) need = 3;

    let ok = need > 0;
    for (let k = 1; k <= need && ok; k++) {
      const c = buf[i + k];
      if (c === undefined || c < 0x80 || c > 0xbf) ok = false;
    }

    if (ok) {
      out += buf.toString("utf8", i, i + need + 1);
      i += need;
    } else {
      out += CP1252_HIGH[b] ?? String.fromCharCode(b); // 0xA0-0xFF match Latin-1
    }
  }
  return out;
}

for (const file of files) {
  const buf = fs.readFileSync(file);
  const before = decodeMixed(buf);
  let after = before;

  after = after.replace(/(<span class="arrow">)\?(<\/span>)/g, `$1${ARROW}$2`);
  after = after.replace(/(Read the brief\s*<span>)\?(<\/span>)/g, `$1${ARROW}$2`);

  const bytesFixed = Buffer.compare(Buffer.from(before, "utf8"), buf) !== 0;
  const arrowsFixed = after !== before;

  if (!bytesFixed && !arrowsFixed) {
    console.log(`  ${file}: already clean`);
    continue;
  }

  console.log(
    `  ${file}: ${bytesFixed ? "re-encoded to UTF-8" : "encoding ok"}` +
      `${arrowsFixed ? ", arrows restored" : ""}${write ? "" : "  (dry run)"}`
  );
  if (write) fs.writeFileSync(file, Buffer.from(after, "utf8"));
}
