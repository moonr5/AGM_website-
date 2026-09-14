import fs from "node:fs";

// Drop the PPNeueMontreal @font-face outright and point body at the brand sans.
// The face is unreferenced now: only the Iubenda cookie banner stylesheet asked
// for it, and that tool is not installed.
const BROKEN_FACE = `      @font-face {
        font-family: var(--agm-sans);
        src:
          url('hubfs/fonts/PPNeueMontreal/PPNeueMontreal-Variable.woff2')
            format('woff2-variations'),
          url('hubfs/fonts/PPNeueMontreal/PPNeueMontreal-Variable.woff')
            format('woff-variations'),
          url('/fonts/PPNeueMontreal-Variablewoff2') format('woff2-variations'),
          url('/fonts/PPNeueMontreal-Variable.woff') format('woff-variations');
        font-weight: 100 900;
        font-display: swap;
      }
`;

for (const file of ["index.html", "en/index.html"]) {
  let html = fs.readFileSync(file, "utf8");
  const steps = [];

  // Normalise line endings for the match, then restore.
  const crlf = html.includes("\r\n");
  let work = crlf ? html.replace(/\r\n/g, "\n") : html;

  if (work.includes(BROKEN_FACE)) {
    work = work.replace(BROKEN_FACE, "");
    steps.push("@font-face removed");
  }
  if (work.includes("font-family: 'PPNeueMontreal';")) {
    work = work.replaceAll("font-family: 'PPNeueMontreal';", "font-family: var(--agm-sans);");
    steps.push("body font retargeted");
  }

  html = crlf ? work.replace(/\n/g, "\r\n") : work;
  fs.writeFileSync(file, html);

  const left = (html.match(/PPNeueMontreal/g) || []).length;
  console.log(`  ${file}: ${steps.join(", ") || "nothing to do"}  (${left} refs left)`);
}
