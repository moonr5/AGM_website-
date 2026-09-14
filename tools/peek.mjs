/**
 * Print the text surrounding a needle in a file.
 *
 * The island runtime and the imported bundles are minified onto a single line,
 * so grep answers with the whole file. This shows just the neighbourhood.
 * Usage: node tools/peek.mjs <file> <needle> [chars=400]
 */
import fs from "node:fs";

const [file, needle, span = "400"] = process.argv.slice(2);
if (!file || !needle) {
  console.error("usage: node tools/peek.mjs <file> <needle> [chars]");
  process.exit(1);
}

const text = fs.readFileSync(file, "utf8");
const width = Number(span);
let from = 0;
let hits = 0;

for (;;) {
  const at = text.indexOf(needle, from);
  if (at < 0) break;
  hits++;
  const start = Math.max(0, at - width);
  const end = Math.min(text.length, at + needle.length + width);
  console.log(`\n--- hit ${hits} at offset ${at} ---`);
  console.log(text.slice(start, end));
  from = at + needle.length;
}

console.log(`\n${hits} hit(s) for "${needle}"`);
