/**
 * Replace leftover stock photography on the inner-page heroes.
 *
 * Three heroes still showed imagery from the imported template: a superyacht at
 * a marina, a container ship with tugs, and open-air harbour porters. None are
 * AGM vessels, and the shipyard one directly contradicted its own headline
 * about building under our own roof.
 */
import fs from "node:fs";

const SWAPS = [
  {
    page: "en/fleet-charter/index.html",
    from: "/en/images/company-profile/vessel-charter.jpg",
    to: "/en/images/services/charter-portrait.jpg",
    alt: "An AGM crewboat under way with crew aboard"
  },
  {
    page: "en/operations/index.html",
    from: "/en/images/company-profile/marine-support.jpg",
    to: "/en/images/services/support-portrait.jpg",
    alt: "AGM crew alongside at the harbour"
  },
  {
    page: "en/shipyard/index.html",
    from: "/en/images/company-profile/frp-shipbuilding.jpg",
    to: "/en/images/service-backgrounds/frp-shipbuilding-bg.webp",
    alt: "An FRP hull under construction inside the Marunda yard"
  }
];

for (const { page, from, to, alt } of SWAPS) {
  let html = fs.readFileSync(page, "utf8");
  if (!html.includes(from)) {
    console.log(`  ${page}: source not found, skipped`);
    continue;
  }

  // Replace the src and refresh the alt text on that same tag.
  html = html.replace(
    new RegExp(`<img([^>]*)src="${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"([^>]*)>`),
    (tag, pre, post) => {
      const cleaned = (pre + post).replace(/\s*alt="[^"]*"/, "");
      return `<img${cleaned} src="${to}" alt="${alt}">`.replace(/\s+/g, " ").replace("<img ", "<img ");
    }
  );

  fs.writeFileSync(page, html);
  console.log(`  ${page}\n    -> ${to}`);
}
