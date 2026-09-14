const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const refs = new Set();

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name === ".git" || name === "website_backup") continue;
      walk(full);
      continue;
    }
    if (!/\.(html|js)$/i.test(name)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const match of text.matchAll(/["']([^"']*\.mp4)["']/g)) {
      refs.add(match[1]);
    }
  }
}

walk(root);
console.log([...refs].sort().join("\n"));
