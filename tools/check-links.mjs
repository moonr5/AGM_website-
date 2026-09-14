/**
 * Resolve every internal link the site can produce and report the dead ones.
 *
 * Links come from two places: the static page markup, and the shared appbar,
 * drawer and footer that agm-pages.js / agm-travelo.js inject at runtime. The
 * injected ones never appear in the HTML on disk, so they are scraped out of
 * the scripts as well.
 * Usage: node tools/check-links.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:8080";

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git" || e.name === "tools") continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (/\.(html|js)$/.test(e.name)) acc.push(f);
  }
  return acc;
}

// Maps each link to the files that reference it, so a failure is actionable.
const found = new Map();
for (const file of walk(".")) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/(?:href|link)["'\s:=]{1,4}((?:\/|\\u002F)[^"'\s>)]*)/g)) {
    const href = m[1].replace(/\\u002F/g, "/").replace(/\\/g, "");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    if (/\.(css|js|woff2?|png|jpe?g|webp|svg|mp4|ico|json|xml)(\?|$)/i.test(href)) continue;
    const url = href.split("#")[0];
    if (!url || url === "/") continue;
    if (!found.has(url)) found.set(url, new Set());
    found.get(url).add(file.replace(/^\.[\\/]/, ""));
  }
}

const urls = [...found.keys()].sort();
console.log(`checking ${urls.length} internal link target(s)\n`);

let bad = 0;
for (const url of urls) {
  let status;
  try {
    const res = await fetch(BASE + url, { redirect: "follow" });
    status = res.status;
  } catch (err) {
    status = `ERR ${err.message}`;
  }
  if (status !== 200) {
    bad++;
    console.log(`  ${status}  ${url}`);
    for (const f of found.get(url)) console.log(`        from ${f}`);
  }
}

console.log(bad ? `\n${bad} dead link target(s)` : "\nall link targets resolve");
