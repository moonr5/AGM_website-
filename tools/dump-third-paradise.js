const fs = require("fs");
const c = fs.readFileSync("index.html", "utf8");
const needle = "third%20paradise";
let i = 0;
while ((i = c.indexOf(needle, i)) >= 0) {
  console.log(JSON.stringify(c.slice(i - 60, i + 100)));
  i++;
}
