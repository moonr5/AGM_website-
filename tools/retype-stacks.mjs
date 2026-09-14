/**
 * Point every hardcoded font stack at the brand tokens.
 *
 * The site had Segoe UI and Playfair/Georgia spelled out in a dozen places,
 * which is why changing the typeface used to mean hunting through files. After
 * this, --agm-sans and --agm-serif are the only places a family is named.
 */
import fs from "node:fs";
import path from "node:path";

const DIR = "hubfs/raw_assets/homepage/179/js_client_assets/assets";

const RULES = [
  // Sans stacks, longest first so partial matches cannot fire early.
  [/system-ui,\s*-apple-system,\s*"Segoe UI",\s*Roboto,\s*Helvetica,\s*Arial,\s*sans-serif/g, "var(--agm-sans)"],
  [/"Segoe UI",\s*system-ui,\s*-apple-system,\s*sans-serif/g, "var(--agm-sans)"],
  [/"Segoe UI",\s*system-ui,\s*sans-serif/g, "var(--agm-sans)"],
  // Serif stacks.
  [/"Playfair Display",\s*Georgia,\s*"Times New Roman",\s*serif/g, "var(--agm-serif)"],
  [/Georgia,\s*"Times New Roman",\s*serif/g, "var(--agm-serif)"]
];

let total = 0;
for (const name of fs.readdirSync(DIR)) {
  if (!name.endsWith(".css")) continue;
  // The brand layer is where the tokens are defined; leave it alone.
  if (name === "agm-brand.css") continue;

  const file = path.join(DIR, name);
  const before = fs.readFileSync(file, "utf8");
  let hits = 0;

  // Skip token definition lines, or a stack would be rewritten to reference the
  // very token it defines.
  const after = before
    .split("\n")
    .map((line) => {
      if (/--agm-(sans|serif)\s*:/.test(line)) return line;
      for (const [re, to] of RULES) {
        line = line.replace(re, () => {
          hits++;
          return to;
        });
      }
      return line;
    })
    .join("\n");

  if (hits) {
    fs.writeFileSync(file, after);
    console.log(`  ${name.padEnd(24)} ${hits} stack(s)`);
    total += hits;
  }
}

console.log(`\n${total} font stacks tokenised`);
