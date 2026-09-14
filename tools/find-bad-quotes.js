const fs = require("fs");

const path = process.argv[2] || "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DwW7ueMe.js";
let c = fs.readFileSync(path, "utf8");
if (c.charCodeAt(0) === 0xfeff) c = c.slice(1);

const line6 = c.split("\n")[5] || "";
const idx = line6.indexOf('""":');
console.log("file", path);
console.log("bytes", Buffer.byteLength(c, "utf8"), "badQuotes at", idx);
if (idx >= 0) console.log("context", JSON.stringify(line6.slice(idx - 40, idx + 120)));

// Find the character mapping object - look for pattern like {"ÿ":"...
const mapStart = line6.indexOf('{"');
let found = 0;
for (let i = mapStart; i < line6.length && found < 3; i++) {
  if (line6.slice(i, i + 4) === '"":"' || line6.slice(i, i + 4) === "'':'") {
    console.log("invalid key at", i, JSON.stringify(line6.slice(i - 20, i + 40)));
    found++;
  }
}
