const fs = require("fs");
const path =
  "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DwW7ueMe.js";

let c = fs.readFileSync(path, "utf8");
if (c.charCodeAt(0) === 0xfeff) c = c.slice(1);

const oldFetch = 'fetch("/api/dealers"';
const newFetch = 'fetch("/api/dealers.json"';

if (c.includes(newFetch)) {
  console.log("dealers.json fetch already present");
} else if (c.includes(oldFetch)) {
  c = c.replace(oldFetch, newFetch);
  fs.writeFileSync(path, c, "utf8");
  console.log("patched dealers fetch");
} else {
  console.log("dealers fetch pattern not found");
}
