import { readFileSync, writeFileSync } from "node:fs";

const CHARTER = "/en/images/services/charter-portrait.webp";
const BUILD = "/en/images/services/shipbuilding-portrait.webp";
const SUPPORT = "/en/images/services/support-portrait.webp";
const FLEET = "/en/images/company-profile/vessel-charter.jpg";
const YARD = "/en/images/company-profile/frp-shipbuilding.jpg";
const CREW = "/en/images/company-profile/marine-support.jpg";

const HERO_UI = `
<div class="agm-hero-ui">
  <div class="agm-hero-top">
    <div class="agm-hero-copy">
      <h1>Vessels for incredible waters.</h1>
      <p>PT. Agara Global Maritim charters crewboats, builds FRP vessels, and supports marine operations from Marunda, North Jakarta.</p>
      <div class="agm-hero-actions">
        <a class="agm-btn-pill" href="/en/enquire/">Enquire <span class="arrow">↗</span></a>
        <div class="agm-proof"><span class="agm-avatars"><span></span><span></span><span></span></span><span>Trusted marine partner in <b>Jakarta</b></span></div>
      </div>
    </div>
    <aside class="agm-float-card">
      <img src="${CHARTER}" alt="AGM crewboat">
      <strong>Crewboat charter</strong>
      <em>12 passengers · Ready 2025</em>
    </aside>
  </div>
  <div class="agm-hero-mark">
    <span class="agm-hero-mark-rule" aria-hidden="true"></span>
    <p class="agm-hero-mark-name">PT. Agara Global Maritim</p>
    <p class="agm-hero-mark-what">Vessel charter · FRP shipbuilding · Marine support</p>
    <p class="agm-hero-mark-where">From our own yard in Marunda, North Jakarta</p>
  </div>
</div>
`;

const PAGE_SECTIONS = `
<section class="agm-travelo-section" id="agm-about">
  <div class="agm-kicker-row">About us</div>
  <p class="agm-about-lead">We deliver safe vessel charter, marine support, and high-quality FRP shipbuilding — built on trust, performance, and precision.</p>
  <div class="agm-center-row">
    <a class="agm-btn-pill ghost" href="/en/about/">More about us <span class="arrow">↗</span></a>
    <div class="agm-proof" style="color:#142033"><span class="agm-avatars"><span></span><span></span><span></span></span><span>Marunda shipyard · North Jakarta</span></div>
  </div>
</section>
<div class="agm-feature-grid">
  <a class="agm-feature" href="/en/our-fleet/">
    <svg class="agm-feature-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 30l16-10 16 10v6H8v-6z"/><path d="M14 26V16h6v7"/><path d="M6 38h36"/></svg>
    <h3>Vessel charter</h3>
    <p>Crew transfer, sea tourism, fishing trips, and support vessels with certified crews.</p>
  </a>
  <a class="agm-feature photo" href="/en/about/">
    <h3>FRP shipbuilding</h3>
    <p>Custom fiberglass vessels built at our Marunda yard to your specification.</p>
  </a>
  <a class="agm-feature" href="/en/contacts/">
    <svg class="agm-feature-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="24" cy="24" r="14"/><path d="M24 10v4M24 34v4M10 24h4M34 24h4"/></svg>
    <h3>Marine support</h3>
    <p>Shorebase, light logistics, and operational assistance for industrial clients.</p>
  </a>
</div>
<section class="agm-fleet-intro">
  <h2>Explore our charter-ready vessels</h2>
  <p>Multi-purpose crewboats for transfer, tourism, and project work. Additional hulls are under construction at Marunda.</p>
</section>
`;

const AFTER_FLEET = `
<section class="agm-travelo-section" id="agm-briefs">
  <p class="agm-gallery-head">Official briefs</p>
  <div class="agm-stories">
    <article class="agm-story">
      <button type="button" class="agm-story-toggle" aria-expanded="false">
        <span class="agm-story-shot"><img src="${FLEET}" alt="AGM crewboat prepared for charter"></span>
        <span class="agm-story-head"><small>Fleet programme · 2025</small><h3>A charter-ready FRP crewboat, placed into professional service</h3></span>
      </button>
      <div class="agm-story-collapse"><div class="agm-story-body">
        <p>PT. Agara Global Maritim has commissioned a multi-purpose crewboat constructed in fibreglass-reinforced plastic. The vessel is available for crew transfer, maritime tourism, and light industrial support under certified operational command.</p>
        <a class="agm-story-link" href="/en/fleet-charter/">Read the brief <span>↗</span></a>
      </div></div>
    </article>
    <article class="agm-story">
      <button type="button" class="agm-story-toggle" aria-expanded="false">
        <span class="agm-story-shot"><img src="${YARD}" alt="Marunda shipyard"></span>
        <span class="agm-story-head"><small>Marunda shipyard</small><h3>Construction and finishing undertaken entirely in our own yard</h3></span>
      </button>
      <div class="agm-story-collapse"><div class="agm-story-body">
        <p>Principal fabrication, hull lay-up, and finishing are performed at our Marunda yard in North Jakarta. Geometry, accommodation, and machinery may be specified to the principal's operational requirement.</p>
        <a class="agm-story-link" href="/en/shipyard/">Read the brief <span>↗</span></a>
      </div></div>
    </article>
    <article class="agm-story">
      <button type="button" class="agm-story-toggle" aria-expanded="false">
        <span class="agm-story-shot"><img src="${CREW}" alt="Marine operations"></span>
        <span class="agm-story-head"><small>Marine operations</small><h3>A certified ship's company, with continuous operational cover</h3></span>
      </button>
      <div class="agm-story-collapse"><div class="agm-story-body">
        <p>Our seafarers are trained, certificated, and experienced across industrial, commercial, and tourism assignments. The operations desk remains available at all hours for mobilisation and support.</p>
        <a class="agm-story-link" href="/en/operations/">Read the brief <span>↗</span></a>
      </div></div>
    </article>
  </div>
  <article class="agm-story agm-story-blue">
    <div class="agm-story-media">
      <video autoplay muted loop playsinline preload="metadata" poster="/en/hero-poster.webp">
        <source src="/en/p8-lite.mp4" type="video/mp4">
      </video>
    </div>
    <div class="agm-story-copy">
      <button type="button" class="agm-story-toggle" aria-expanded="false">
        <span class="agm-story-head"><small>Blue economy</small><h3>A considered contribution to Indonesia's maritime prosperity</h3></span>
      </button>
      <div class="agm-story-collapse"><div class="agm-story-body">
        <p>We regard the sea as working capital, not a disposable backdrop. Durable FRP construction, local manufacture, and disciplined operations are the means by which a yard of our scale may serve commerce while remaining answerable to the water that sustains it.</p>
        <a class="agm-story-link" href="/en/blue-economy/">Read the brief <span>↗</span></a>
      </div></div>
    </div>
  </article>
</section>
<section class="agm-travelo-section agm-faq">
  <div>
    <h2>Frequently asked questions</h2>
    <div class="agm-help">
      <img src="${CHARTER}" alt="">
      <div><p>Need a vessel or a custom build?</p><a class="agm-btn-pill" href="/en/contacts/">Get in touch</a></div>
    </div>
  </div>
  <div>
    <details open><summary>What vessels can we charter?</summary><p>Multi-purpose FRP crewboats for crew transfer, tourism, fishing trips, and light project support. Daily, trip, or monthly arrangements.</p></details>
    <details><summary>Do you build custom FRP boats?</summary><p>Yes. Our Marunda yard builds fiberglass vessels with adjustable length, layout, and engine configuration.</p></details>
    <details><summary>Where are you based?</summary><p>PT. Agara Global Maritim operates from Marunda, North Jakarta 14130.</p></details>
    <details><summary>How do we enquire?</summary><p>Call +62 819-231-001 or email corporate@stratconagaraglobal.com, or use the enquire form.</p></details>
  </div>
</section>
<section class="agm-travelo-section">
  <p class="agm-gallery-head">From the yard to the water</p>
  <div class="agm-gallery">
    <figure class="agm-gallery-item" tabindex="0">
      <img src="${CHARTER}" alt="Charter vessel on sea trial">
      <figcaption><small>Vessel charter</small><strong>Crew transfer, sea tourism, and fishing voyages under certified command.</strong></figcaption>
    </figure>
    <figure class="agm-gallery-item" tabindex="0">
      <img src="${BUILD}" alt="FRP hull under construction">
      <figcaption><small>FRP shipbuilding</small><strong>Custom fibreglass vessels laid up and finished at our Marunda yard.</strong></figcaption>
    </figure>
    <figure class="agm-gallery-item" tabindex="0">
      <img src="${SUPPORT}" alt="Utility vessel on operations">
      <figcaption><small>Marine support</small><strong>Shorebase attendance, light logistics, and industrial project cover.</strong></figcaption>
    </figure>
    <figure class="agm-gallery-item" tabindex="0">
      <img src="${FLEET}" alt="Charter-ready crewboat">
      <figcaption><small>Our fleet</small><strong>A multi-purpose crewboat in service, with further hulls in build.</strong></figcaption>
    </figure>
    <figure class="agm-gallery-item" tabindex="0">
      <img src="${YARD}" alt="Yard team at Marunda">
      <figcaption><small>The yard</small><strong>Fabrication, repair, and finishing by our own people in North Jakarta.</strong></figcaption>
    </figure>
  </div>
</section>
`;

function patch(file) {
  let html = readFileSync(file, "utf8");
  html = html.replace("<html lang=\"en\">", '<html lang="en" class="agm-travelo">');
  html = html.replaceAll("agm-travelo.css?v=1", "agm-travelo.css?v=2");
  html = html.replaceAll("agm-travelo.js?v=1", "agm-travelo.js?v=2");
  html = html.replace(
    `<div class="section agm-nav">
      <a class="a" href="#range" id="models">Boats</a>
      <a class="a" href="/en/sustainability">Our Story</a>
      <a class="a agm-nav-cta" href="/en/contacts/">Contact</a>
    </div>`,
    `<div class="section agm-nav">
      <a class="a" href="/en/">Home</a>
      <a class="a" href="#range" id="models">Fleet</a>
      <a class="a" href="/en/about/">About</a>
      <a class="a" href="/en/services/">Services</a>
      <a class="a" href="/en/blue-economy/">Blue Economy</a>
      <a class="a agm-nav-cta" href="/en/enquire/">Enquire</a>
    </div>`,
  );

  if (!html.includes("agm-hero-ui")) {
    html = html.replace(
      "</div> <div id=\"hs_cos_wrapper_seaLiving\"",
      `${HERO_UI}</div> ${PAGE_SECTIONS} <div id="hs_cos_wrapper_seaLiving"`,
    );
  }
  if (!html.includes("agm-stories")) {
    html = html.replace(
      "</div> <div id=\"hs_cos_wrapper_below\"",
      `</div> ${AFTER_FLEET} <div id="hs_cos_wrapper_below"`,
    );
  }

  writeFileSync(file, html);
  console.log("applied", file);
}

patch("index.html");
patch("en/index.html");
