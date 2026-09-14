const fs = require("fs");
const lines = fs.readFileSync("index.html", "utf8").split(/\n/);
for (let i = 0; i < lines.length; i++) {
  if (!lines[i].includes("var newIslands")) continue;
  const code = lines[i].trim();
  try {
    eval(code);
    console.log("OK line", i + 1);
  } catch (e) {
    console.log("FAIL line", i + 1, e.message);
    const idx = lines[i].indexOf("delivering");
    if (idx >= 0) console.log(JSON.stringify(lines[i].slice(idx - 25, idx + 20)));
  }
}
