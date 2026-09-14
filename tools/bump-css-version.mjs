/**
 * Increment the ?v= cache-buster on the named stylesheets across every page.
 *
 * Node is used rather than a shell one-liner because Windows PowerShell 5.1
 * writes text back as Windows-1252, which silently destroys the non-ASCII
 * glyphs in these pages.
 * Usage: node tools/bump-css-version.mjs agm-travelo.css agm-brand.css
 */
import fs from "node:fs";
import path from "node:path";

const names = process.argv.slice(2);
if (!names.length) {
  console.error("give at least one stylesheet name");
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (f.endsWith(".html")) acc.push(f);
  }
  return acc;
}

let touched = 0;
for (const file of walk(".")) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  for (const name of names) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    after = after.replace(new RegExp(`${esc}\\?v=(\\d+)`, "g"), (_, v) => `${name}?v=${Number(v) + 1}`);
  }
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    touched++;
  }
}
console.log(`bumped ${names.join(", ")} in ${touched} page(s)`);
