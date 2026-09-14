/**
 * Quick responsive smoke test: horizontal overflow at common viewport widths.
 * Usage: node tools/check-responsive.js [baseUrl]
 */
const { chromium } = require("playwright");

const BASE = process.argv[2] || "http://localhost:8080";
const WIDTHS = [320, 375, 390, 414, 768, 1024, 1280];
const PAGES = [
  "/",
  "/en/",
  "/en/about/",
  "/en/services/",
  "/en/contacts/",
  "/en/corporate",
  "/en/investors",
];

async function checkOverflow(page, path, width) {
  await page.setViewportSize({ width, height: 800 });
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollW = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
    const clientW = doc.clientWidth;
    return { scrollW, clientW, diff: scrollW - clientW };
  });

  return overflow;
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const failures = [];

    for (const path of PAGES) {
      for (const width of WIDTHS) {
        const { scrollW, clientW, diff } = await checkOverflow(page, path, width);
        if (diff > 2) {
          failures.push({ path, width, scrollW, clientW, diff });
        }
        process.stdout.write(
          (diff > 2 ? "FAIL" : " OK ") +
            " " +
            String(width).padStart(4) +
            " " +
            path +
            "\n"
        );
      }
    }

    if (failures.length) {
      console.error("\nHorizontal overflow detected:");
      failures.forEach((f) =>
        console.error(
          `  ${f.path} @ ${f.width}px — scroll ${f.scrollW}px vs viewport ${f.clientW}px (+${f.diff}px)`
        )
      );
      process.exit(1);
    }

    console.log("\nAll viewport checks passed.");
  } catch (err) {
    console.error("Test skipped or failed:", err.message);
    process.exit(err.message.includes("Cannot find module") ? 0 : 1);
  } finally {
    if (browser) await browser.close();
  }
})();
