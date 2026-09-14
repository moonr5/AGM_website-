/**
 * Dump the text and media inventory of a .pptx without unpacking it to disk.
 *
 * A .pptx is a zip of XML parts. This walks the central directory and inflates
 * only the parts we care about, so nothing is written to the filesystem (the
 * machine this runs on is out of free space).
 * Usage: node tools/read-pptx.mjs "<path to .pptx>" [--media] [--slide=N]
 */
import fs from "node:fs";
import zlib from "node:zlib";

const file = process.argv[2];
const wantMedia = process.argv.includes("--media");
const only = (process.argv.find((a) => a.startsWith("--slide=")) || "").split("=")[1];

if (!file || !fs.existsSync(file)) {
  console.error(`cannot find: ${file}`);
  process.exit(1);
}

const buf = fs.readFileSync(file);

// Locate the end-of-central-directory record (scan back over the comment).
let eocd = -1;
for (let i = buf.length - 22; i >= 0 && i > buf.length - 70000; i--) {
  if (buf.readUInt32LE(i) === 0x06054b50) {
    eocd = i;
    break;
  }
}
if (eocd < 0) {
  console.error("not a zip archive");
  process.exit(1);
}

const entryCount = buf.readUInt16LE(eocd + 10);
let cd = buf.readUInt32LE(eocd + 16);

const entries = [];
for (let i = 0; i < entryCount; i++) {
  if (buf.readUInt32LE(cd) !== 0x02014b50) break;
  const method = buf.readUInt16LE(cd + 10);
  const compSize = buf.readUInt32LE(cd + 20);
  const rawSize = buf.readUInt32LE(cd + 24);
  const nameLen = buf.readUInt16LE(cd + 28);
  const extraLen = buf.readUInt16LE(cd + 30);
  const commentLen = buf.readUInt16LE(cd + 32);
  const localOff = buf.readUInt32LE(cd + 42);
  const name = buf.toString("utf8", cd + 46, cd + 46 + nameLen);
  entries.push({ name, method, compSize, rawSize, localOff });
  cd += 46 + nameLen + extraLen + commentLen;
}

function read(entry) {
  // Skip the local file header, whose name/extra lengths can differ from the
  // central directory's.
  const o = entry.localOff;
  const nameLen = buf.readUInt16LE(o + 26);
  const extraLen = buf.readUInt16LE(o + 28);
  const start = o + 30 + nameLen + extraLen;
  const raw = buf.subarray(start, start + entry.compSize);
  return entry.method === 0 ? raw : zlib.inflateRawSync(raw);
}

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** Pull paragraph-grouped text out of a DrawingML part. */
function paragraphs(xml) {
  const out = [];
  for (const para of xml.split("</a:p>")) {
    const runs = [...para.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => decode(m[1]));
    const line = runs.join("").replace(/\s+/g, " ").trim();
    if (line) out.push(line);
  }
  return out;
}

const slides = entries
  .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.name))
  .sort((a, b) => Number(a.name.match(/(\d+)/)[1]) - Number(b.name.match(/(\d+)/)[1]));

const notes = new Map();
for (const e of entries.filter((x) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(x.name))) {
  notes.set(Number(e.name.match(/(\d+)/)[1]), paragraphs(read(e).toString("utf8")));
}

console.log(`${file}`);
console.log(`${slides.length} slide(s), ${entries.length} part(s)\n`);

for (const s of slides) {
  const n = Number(s.name.match(/(\d+)/)[1]);
  if (only && String(n) !== only) continue;
  console.log(`${"=".repeat(70)}\nSLIDE ${n}\n${"=".repeat(70)}`);
  for (const line of paragraphs(read(s).toString("utf8"))) console.log(`  ${line}`);
  const nt = notes.get(n);
  if (nt && nt.length) {
    console.log("  --- speaker notes ---");
    for (const line of nt) console.log(`    ${line}`);
  }
  console.log("");
}

if (wantMedia) {
  console.log(`${"=".repeat(70)}\nMEDIA\n${"=".repeat(70)}`);
  const media = entries.filter((e) => e.name.startsWith("ppt/media/"));
  for (const m of media.sort((a, b) => b.rawSize - a.rawSize)) {
    console.log(`  ${String(Math.round(m.rawSize / 1024)).padStart(6)} KB  ${m.name}`);
  }
  console.log(`  ${media.length} media file(s)`);
}
