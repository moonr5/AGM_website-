import fs from "node:fs";

// The drawer carried a language switcher offering "IT" behind a dead href="#".
// The site is English-only, so the control is removed rather than left to
// mislead. Matched loosely because the files use CRLF line endings.
const BLOCK =
  /\s*<div style="display: flex; justify-content: space-between">\s*<span[^>]*>SELECT LANGUAGE<\/span>\s*<a href="#"[^>]*><div id="language-mobile"[^>]*>IT<\/div><\/a>\s*<\/div>\s*<div class="divider-mobile"><\/div>/g;

for (const file of ["index.html", "en/index.html"]) {
  let html = fs.readFileSync(file, "utf8");
  const before = (html.match(/SELECT LANGUAGE/g) || []).length;
  html = html.replace(BLOCK, "");
  const after = (html.match(/SELECT LANGUAGE/g) || []).length;
  fs.writeFileSync(file, html);
  console.log(`  ${file}: ${before} -> ${after} language switcher(s)`);
}
