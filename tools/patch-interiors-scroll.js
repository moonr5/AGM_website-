const fs = require("fs");
const path =
  "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DwW7ueMe.js";

let content = fs.readFileSync(path, "utf8");
if (content.charCodeAt(0) === 0xfeff) {
  content = content.slice(1);
}

const replacements = [
  // Mobile viewport hook prevented ScrollTrigger init entirely (c||setTimeout).
  ["Ce&&(c||setTimeout(()=>{", "Ce&&setTimeout(()=>{"],
  // Original 5s delay kept OUR SERVICES hidden until long after page load.
  ["St.to({},{duration:.5})},5e3))},[Ce])", "St.to({},{duration:.5})},0))},[Ce])"],
  // Title/copy started off-screen at -50vw and never appeared if scroll failed.
  ['Yn.set(Ne,{left:"-50vw"})', 'Yn.set(Ne,{left:"0"})'],
];

let changed = false;
for (const [from, to] of replacements) {
  if (!content.includes(from)) {
    console.error("patch target not found:", from.slice(0, 60));
    process.exit(1);
  }
  if (content.includes(from)) {
    content = content.replace(from, to);
    changed = true;
    console.log("patched", from.slice(0, 50));
  }
}

if (changed) {
  fs.writeFileSync(path, content, "utf8");
  console.log("interiors scroll patch applied");
}
