const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const decoded = html.replace(/\\u002F/g, "/");

const hits = [...decoded.matchAll(/hubfs\/146466316\/news[^"\\]+/g)].map((m) => m[0]);
console.log(hits.join("\n") || "none");

const idx = decoded.indexOf("third");
if (idx >= 0) console.log("\ncontext:", JSON.stringify(decoded.slice(idx - 40, idx + 120)));
