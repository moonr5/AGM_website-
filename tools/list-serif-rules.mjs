/**
 * List every CSS rule that sets the serif display face, with its selector,
 * size, weight and leading, so display headings can be separated from small
 * card titles before changing weights.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = "hubfs/raw_assets/homepage/179/js_client_assets/assets";
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".css"));

for (const file of files) {
  const css = fs.readFileSync(path.join(DIR, file), "utf8");
  const rows = [];
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const body = m[2];
    if (!/font-family:\s*var\(--agm-serif\)/.test(body)) continue;
    const sel = m[1].replace(/\s+/g, " ").trim().slice(-70);
    const grab = (p) => (new RegExp(p + ":\\s*([^;]+)").exec(body)?.[1] || "-").trim();
    const line = css.slice(0, m.index).split("\n").length;
    rows.push({
      line,
      sel,
      size: grab("font-size"),
      weight: grab("font-weight"),
      lh: grab("line-height")
    });
  }
  if (!rows.length) continue;
  console.log(`\n=== ${file} ===`);
  for (const r of rows) {
    console.log(
      `  ${String(r.line).padStart(5)}  size=${r.size.padEnd(30)} w=${r.weight.padEnd(16)} lh=${r.lh.padEnd(16)} ${r.sel}`
    );
  }
}
