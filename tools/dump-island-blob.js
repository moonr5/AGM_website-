const { execFileSync } = require("child_process");
const fs = require("fs");

const blob = execFileSync(
  "git",
  [
    "show",
    "1f14c84:hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DwW7ueMe.js",
  ],
  { cwd: __dirname + "/.." },
);

fs.writeFileSync(__dirname + "/island-from-git.bin", blob);
const c = blob.toString("utf8");
const line6 = (c.split("\n")[5] || "");
console.log("bytes", blob.length, "chars", c.length, "line6", line6.length);
console.log("mojibake", c.includes("ï¿"));
console.log("slice", line6.slice(135300, 135500));
