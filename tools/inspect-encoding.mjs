/**
 * Report bytes that are not valid UTF-8, plus places where a character was
 * replaced by a literal "?" during an ANSI round-trip.
 */
import fs from "node:fs";

const files = process.argv.slice(2);
const utf8Strict = new TextDecoder("utf-8", { fatal: false });

for (const file of files) {
  const buf = fs.readFileSync(file);
  const bad = [];
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b < 0x80) continue;
    // Validate a UTF-8 sequence starting here.
    let need = 0;
    if (b >= 0xc2 && b <= 0xdf) need = 1;
    else if (b >= 0xe0 && b <= 0xef) need = 2;
    else if (b >= 0xf0 && b <= 0xf4) need = 3;
    else {
      bad.push({ i, b });
      continue;
    }
    let ok = true;
    for (let k = 1; k <= need; k++) {
      const c = buf[i + k];
      if (c === undefined || c < 0x80 || c > 0xbf) { ok = false; break; }
    }
    if (!ok) bad.push({ i, b });
    else i += need;
  }

  const text = utf8Strict.decode(buf);
  const qMarks = [...text.matchAll(/>\s*\?\s*<|["'>]\?["'<]|\s\?\s/g)].slice(0, 12);

  console.log(`\n=== ${file} ===`);
  console.log(`  ${bad.length} invalid UTF-8 byte(s)`);
  const counts = {};
  for (const x of bad) counts[x.b] = (counts[x.b] || 0) + 1;
  for (const [b, n] of Object.entries(counts)) {
    console.log(`    0x${Number(b).toString(16)}  x${n}`);
  }
  console.log(`  suspicious lone "?" occurrences: ${qMarks.length}`);
  for (const m of qMarks) {
    const s = Math.max(0, m.index - 60);
    console.log("    ..." + text.slice(s, m.index + 40).replace(/\n/g, " ") + "...");
  }
}
