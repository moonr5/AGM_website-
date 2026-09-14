const fs = require("fs");
const html = fs.readFileSync("index.html", "utf8");
const m = html.match(/shipbuilding[^"\\]{0,80}/gi);
console.log(m ? [...new Set(m)] : "none");
const v = html.match(/\/en\/videos[^"\\]+/g);
console.log("video paths:", v ? [...new Set(v)] : "none");
