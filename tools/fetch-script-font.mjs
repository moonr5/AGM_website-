import fs from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const css = await (
  await fetch("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap", {
    headers: { "User-Agent": UA }
  })
).text();
const latin = /\/\*\s*latin\s*\*\/[\s\S]*?url\((https:[^)]+)\)/.exec(css);
if (!latin) throw new Error("no latin Great Vibes url");
const buf = Buffer.from(await (await fetch(latin[1], { headers: { "User-Agent": UA } })).arrayBuffer());
fs.writeFileSync("hubfs/fonts/agm/great-vibes-400-normal-latin.woff2", buf);
console.log("great-vibes", (buf.length / 1024).toFixed(1) + " KB");
