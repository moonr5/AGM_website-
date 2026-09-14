const { execFileSync } = require("child_process");
const path =
  "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DwW7ueMe.js";

for (const rev of ["0a8cc9d", "2849db7", "0f03f15", "cfb886a", "1f14c84"]) {
  const blob = execFileSync("git", ["show", `${rev}:${path}`]);
  const c = blob.toString("utf8");
  const line6 = (c.split("\n")[5] || "");
  console.log(
    rev,
    "bytes",
    blob.length,
    "mojibake",
    c.includes("ï¿"),
    "badQuotes",
    /""":/.test(line6),
  );
}
