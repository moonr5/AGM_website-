import { readFileSync, writeFileSync } from "node:fs";

const files = ["index.html", "en/index.html"];
const defer = [
  "island-Dn4nrtOY.css",
  "island-D0xuzvwo.css",
  "island-BHS-UEXq.css",
];

for (const file of files) {
  let html = readFileSync(file, "utf8");
  html = html.replaceAll("agm-perf.js?v=1", "agm-perf.js?v=2");
  html = html.replace(
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-services.css?v=2">',
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-services.css?v=2" media="print" onload="this.media=\'all\'">',
  );
  html = html.replace(
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-about.css?v=12">',
    '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-about.css?v=12" media="print" onload="this.media=\'all\'">',
  );
  for (const name of defer) {
    html = html.replace(
      `<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/${name}">`,
      `<link rel="stylesheet" href="hubfs/raw_assets/homepage/179/js_client_assets/assets/${name}" media="print" onload="this.media='all'">`,
    );
  }
  writeFileSync(file, html);
  console.log("deferred css", file);
}
