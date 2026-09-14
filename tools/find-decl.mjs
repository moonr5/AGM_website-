/**
 * Find CSS declarations matching a substring and print their selectors.
 *
 * The imported island stylesheets are minified onto one line each, so grep
 * gives back a whole file rather than the rule that matters.
 * Usage: node tools/find-decl.mjs <substring> [dir]
 */
import fs from "node:fs";
import path from "node:path";

const needle = process.argv[2];
const dir = process.argv[3] || "hubfs/raw_assets/homepage/179/js_client_assets/assets";

if (!needle) {
  console.error("give a substring, e.g. 100vw");
  process.exit(1);
}

let hits = 0;
for (const file of fs.readdirSync(dir).filter((n) => n.endsWith(".css"))) {
  const css = fs.readFileSync(path.join(dir, file), "utf8");
  const rules = [];

  for (const block of css.split("}")) {
    const brace = block.lastIndexOf("{");
    if (brace < 0) continue;
    const body = block.slice(brace + 1);
    if (!body.includes(needle)) continue;
    const selector = block.slice(0, brace).split(/[\r\n]/).pop().trim();
    const decls = body
      .split(";")
      .map((d) => d.trim())
      .filter((d) => d.includes(needle));
    rules.push({ selector, decls });
  }

  if (!rules.length) continue;
  console.log(`\n${file}`);
  for (const r of rules) {
    hits++;
    console.log(`  ${r.selector}`);
    for (const d of r.decls) console.log(`      ${d}`);
  }
}

console.log(`\n${hits} rule(s) containing "${needle}"`);
