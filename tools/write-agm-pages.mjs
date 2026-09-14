import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = "en";
const CSS = "/hubfs/raw_assets/homepage/179/js_client_assets/assets";

function wrap({ title, description, kicker, heading, lede, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title} — PT. Agara Global Maritim</title>
  <meta name="description" content="${description}">
  <link rel="shortcut icon" href="/en/favicon.png">
  <link rel="stylesheet" href="${CSS}/agm-mobile.css?v=6">
  <link rel="stylesheet" href="${CSS}/agm-appbar.css?v=3">
  <link rel="stylesheet" href="${CSS}/agm-pages.css?v=2">
  <script defer src="${CSS}/agm-mobile.js?v=4"></script>
  <script defer src="${CSS}/agm-pages.js?v=2"></script>
</head>
<body class="agm-page">
  <main class="agm-page-main">
    <header class="agm-page-hero">
      <p class="agm-kicker">${kicker}</p>
      <h1>${heading}</h1>
      ${lede ? `<p class="agm-lede">${lede}</p>` : ""}
    </header>
    ${body}
  </main>
</body>
</html>
`;
}

function redirect(to, title) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta http-equiv="refresh" content="0;url=${to}">
  <link rel="canonical" href="${to}">
</head>
<body>
  <p>Redirecting to <a href="${to}">${to}</a></p>
</body>
</html>
`;
}

const pages = {
  "about/index.html": wrap({
    title: "About Us",
    description: "PT. Agara Global Maritim provides vessel charter, FRP shipbuilding, and marine support from Marunda, North Jakarta.",
    kicker: "About Us",
    heading: "Your trusted partner<br>for marine services",
    lede: "AGM delivers vessel charter, marine support, and high-quality FRP shipbuilding with a safety-first operating standard.",
    body: `
    <p class="agm-copy">PT. Agara Global Maritim is a marine services company based in Marunda, North Jakarta. We charter multi-purpose crewboats, support industrial and tourism operations, and build fiberglass vessels at our own yard.</p>
    <p class="agm-copy">We currently operate a charter-ready crewboat and continue expanding the fleet with new FRP hulls built in-house.</p>
    <div class="agm-section">
      <h2>Vision</h2>
      <p class="agm-copy">To be a leading Indonesian maritime company for vessel services, FRP manufacturing, and offshore support, with international safety and quality standards.</p>
    </div>
    <div class="agm-section">
      <h2>Mission</h2>
      <ul class="agm-list">
        <li>Provide safe, responsive, and reliable vessel charter.</li>
        <li>Build FRP vessels with modern methods and durable finishing.</li>
        <li>Deliver efficient marine and logistics support.</li>
        <li>Create long-term client partnerships through integrity.</li>
        <li>Add value to Indonesia's maritime industry.</li>
      </ul>
    </div>
    <div class="agm-grid agm-section">
      <article class="agm-panel"><h2>New, efficient boats</h2><p class="agm-copy">Clean, well-maintained FRP crewboats ready for transfer, tourism, and project work.</p></article>
      <article class="agm-panel"><h2>Certified crews</h2><p class="agm-copy">Professionally trained crews experienced with industrial and commercial clients.</p></article>
      <article class="agm-panel"><h2>24/7 support</h2><p class="agm-copy">Fast operational response with daily, trip, or monthly charter options.</p></article>
    </div>
    <div class="agm-cta-row">
      <a class="agm-btn agm-btn-solid" href="/en/enquire/">Enquire</a>
      <a class="agm-btn" href="/en/our-fleet/">View fleet</a>
    </div>`
  }),

  "services/index.html": wrap({
    title: "Services",
    description: "Vessel charter, FRP shipbuilding, marine support, and repair from AGM.",
    kicker: "Services",
    heading: "Charter, build,<br>and support",
    lede: "One team for crew transfer, custom FRP construction, logistics support, and vessel upkeep.",
    body: `
    <div class="agm-grid">
      <article class="agm-card">
        <img src="/en/images/services/charter-portrait.jpg" alt="AGM crewboat charter">
        <div class="agm-card-body">
          <p class="agm-meta">Vessel charter</p>
          <h2>Crewboats for work and leisure</h2>
          <ul class="agm-list">
            <li>Crew transfer to moorings and project sites</li>
            <li>Sea tourism, snorkeling, and island hopping</li>
            <li>Premium fishing trips</li>
            <li>Light logistics and survey support</li>
          </ul>
        </div>
      </article>
      <article class="agm-card">
        <img src="/en/images/services/shipbuilding-portrait.jpg" alt="FRP shipbuilding at Marunda">
        <div class="agm-card-body">
          <p class="agm-meta">FRP shipbuilding</p>
          <h2>Custom vessels at Marunda</h2>
          <ul class="agm-list">
            <li>Fiberglass hulls built to specification</li>
            <li>Adjustable length, layout, and engines</li>
            <li>Experienced yard team and finishing</li>
            <li>Efficient build programmes</li>
          </ul>
        </div>
      </article>
      <article class="agm-card">
        <img src="/en/images/services/support-portrait.jpg" alt="Marine support operations">
        <div class="agm-card-body">
          <p class="agm-meta">Marine support</p>
          <h2>Shorebase and logistics</h2>
          <ul class="agm-list">
            <li>Shorebase support</li>
            <li>Light logistics delivery</li>
            <li>Operational assistance</li>
            <li>Industrial project charters</li>
          </ul>
        </div>
      </article>
    </div>
    <div class="agm-cta-row">
      <a class="agm-btn agm-btn-solid" href="/en/enquire/">Request a quote</a>
      <a class="agm-btn" href="/en/owner-care/">Repair &amp; maintenance</a>
    </div>`
  }),

  "our-fleet/index.html": wrap({
    title: "Fleet",
    description: "AGM multi-purpose FRP crewboat ready for charter, with additional hulls under construction in Marunda.",
    kicker: "Fleet",
    heading: "Crewboats ready<br>for charter",
    lede: "A new FRP multi-purpose crewboat is available now. Sister vessels are under construction at our Marunda yard.",
    body: `
    <article class="agm-card agm-split">
      <img src="/en/images/services/charter-portrait.jpg" alt="AGM crewboat">
      <div class="agm-card-body">
        <p class="agm-meta">Ready 2025</p>
        <h2>Multi-purpose crewboat</h2>
        <p class="agm-copy">Built in FRP at Marunda for crew transfer, fishing trips, sea tourism, and light project support.</p>
        <dl class="agm-specs agm-section">
          <div><dt>Capacity</dt><dd>12 persons</dd></div>
          <div><dt>Material</dt><dd>FRP</dd></div>
          <div><dt>Year</dt><dd>2025</dd></div>
          <div><dt>Yard</dt><dd>Marunda, North Jakarta</dd></div>
        </dl>
        <div class="agm-cta-row">
          <a class="agm-btn agm-btn-solid" href="/en/enquire/">Charter this vessel</a>
        </div>
      </div>
    </article>
    <div class="agm-section agm-grid-2 agm-grid">
      <article class="agm-panel">
        <p class="agm-meta">In build</p>
        <h2>Fleet expansion</h2>
        <p class="agm-copy">Additional crewboats with similar specifications are in production to meet growing charter demand.</p>
      </article>
      <article class="agm-panel">
        <p class="agm-meta">Configuration</p>
        <h2>Built around the job</h2>
        <p class="agm-copy">Layouts can be adapted for industrial transfer, tourism, or fishing packages. Ask us about availability and duration.</p>
      </article>
    </div>`
  }),

  "people/index.html": wrap({
    title: "People",
    description: "Certified AGM crews and yard teams for charter, shipbuilding, and marine support.",
    kicker: "People",
    heading: "Crews and craftsmen<br>you can trust",
    lede: "Operations succeed because of people. AGM crews are certified, and our Marunda team builds and maintains every hull we put to work.",
    body: `
    <div class="agm-grid">
      <article class="agm-panel"><h2>Deck and engine crews</h2><p class="agm-copy">Professionally trained, certified personnel for industrial, commercial, and tourism charters, with a safety-first brief on every trip.</p></article>
      <article class="agm-panel"><h2>Shipyard team</h2><p class="agm-copy">FRP laminators, fitters, and finishers who build and repair vessels at our Marunda facility.</p></article>
      <article class="agm-panel"><h2>Operations support</h2><p class="agm-copy">Shore-side coordinators who handle scheduling, logistics, and 24/7 client response.</p></article>
    </div>
    <div class="agm-cta-row">
      <a class="agm-btn agm-btn-solid" href="/en/contacts/">Talk to the team</a>
    </div>`
  }),

  "owner-care/index.html": wrap({
    title: "Owner Care",
    description: "AGM repair, maintenance, retrofit, and painting services for FRP vessels.",
    kicker: "Owner Care",
    heading: "Keep the boat<br>working",
    lede: "Repair, maintenance, and retrofit from the same yard that builds our charter fleet.",
    body: `
    <div class="agm-grid agm-grid-2">
      <article class="agm-panel">
        <h2>What we service</h2>
        <ul class="agm-list">
          <li>Periodic hull, engine, and electrical inspections</li>
          <li>Fiberglass hull and structure repair</li>
          <li>Engine service and repair</li>
          <li>Electrical and navigation systems</li>
          <li>Retrofit and upgrades</li>
          <li>Finishing and painting</li>
        </ul>
      </article>
      <article class="agm-panel">
        <h2>Yard location</h2>
        <p class="agm-copy">Work is carried out at Marunda, North Jakarta, with planning around your charter or operations calendar.</p>
        <div class="agm-cta-row">
          <a class="agm-btn agm-btn-solid" href="/en/enquire/">Book a slot</a>
        </div>
      </article>
    </div>`
  }),

  "contacts/index.html": wrap({
    title: "Contact",
    description: "Contact PT. Agara Global Maritim in Marunda, North Jakarta.",
    kicker: "Contact",
    heading: "Get in touch",
    lede: "Call, email, or visit the yard. We will help with charter, new builds, and support.",
    body: `
    <div class="agm-grid agm-grid-2">
      <article class="agm-panel">
        <h2>PT. Agara Global Maritim</h2>
        <p class="agm-copy">Jl. Akses Kp. Su No.2 2, RT.2/RW.2, Marunda, Kec. Cilincing, North Jakarta 14150</p>
        <p class="agm-copy"><a href="tel:+62819231001">+62 819-231-001</a><br><a href="mailto:corporate@stratconagaraglobal.com">corporate@stratconagaraglobal.com</a></p>
        <div class="agm-cta-row">
          <a class="agm-btn agm-btn-solid" href="/en/enquire/">Send an enquiry</a>
          <a class="agm-btn" href="https://maps.google.com/?q=Marunda+Cilincing+Jakarta+Utara" target="_blank" rel="noopener">Open map</a>
        </div>
      </article>
      <article class="agm-panel">
        <h2>Hours</h2>
        <p class="agm-copy">Operations support is available 24/7 for active charters. Yard visits are by appointment.</p>
      </article>
    </div>`
  }),

  "enquire/index.html": wrap({
    title: "Enquire",
    description: "Request a vessel charter, shipbuilding quote, or marine support from AGM.",
    kicker: "Enquire",
    heading: "Tell us what<br>you need",
    lede: "Charter dates, a new hull, or yard work — send the details and we will reply.",
    body: `
    <form class="agm-form" action="mailto:corporate@stratconagaraglobal.com" method="post" enctype="text/plain">
      <label>Name<input name="name" required autocomplete="name"></label>
      <label>Email<input type="email" name="email" required autocomplete="email"></label>
      <label>Phone<input type="tel" name="phone" autocomplete="tel"></label>
      <label>Service
        <select name="service">
          <option>Vessel charter</option>
          <option>FRP shipbuilding</option>
          <option>Marine support</option>
          <option>Repair &amp; maintenance</option>
        </select>
      </label>
      <label>Message<textarea name="message" required placeholder="Dates, passenger count, or build requirements"></textarea></label>
      <button class="agm-btn agm-btn-solid" type="submit">Send message</button>
    </form>`
  }),

  "sustainability/index.html": wrap({
    title: "Our Story",
    description: "How PT. Agara Global Maritim is building Indonesia's marine services and FRP fleet from Marunda.",
    kicker: "Our Story",
    heading: "Building Indonesia's<br>maritime future",
    lede: "From a Marunda yard we charter, build, and support boats with a long view on safety, quality, and responsible production.",
    body: `
    <p class="agm-copy">AGM was founded to provide vessel charter, shipbuilding, and marine support to international safety and quality standards. We invest in FRP manufacturing, a growing crewboat fleet, and the people who run them.</p>
    <p class="agm-copy">Responsible development for us means durable hulls, less waste through longer vessel life, and processes that respect the communities around the yard.</p>
    <div class="agm-grid agm-section">
      <article class="agm-panel"><h2>Safety first</h2><p class="agm-copy">Certified crews, inspected vessels, and procedures designed to protect everyone on board.</p></article>
      <article class="agm-panel"><h2>Craftsmanship</h2><p class="agm-copy">From hull layup to finishing, the yard takes pride in proven techniques and quality materials.</p></article>
      <article class="agm-panel"><h2>Partnership</h2><p class="agm-copy">We plan charters and builds around the client's operational reality, not a catalogue only.</p></article>
    </div>`
  }),

  "news-and-events/index.html": wrap({
    title: "News",
    description: "Updates from PT. Agara Global Maritim on fleet, yard, and operations.",
    kicker: "News",
    heading: "Yard and fleet<br>updates",
    lede: "Selected notes from Marunda as the fleet and shipyard grow.",
    body: `
    <div class="agm-grid">
      <article class="agm-panel"><p class="agm-meta">2025</p><h2>Crewboat ready for charter</h2><p class="agm-copy">Our multi-purpose FRP crewboat, built in Marunda for 12 passengers, is available for crew transfer, tourism, and fishing charters.</p></article>
      <article class="agm-panel"><p class="agm-meta">Yard</p><h2>Additional hulls in build</h2><p class="agm-copy">Sister vessels are under construction to meet rising charter demand across industrial and leisure work.</p></article>
      <article class="agm-panel"><p class="agm-meta">Marunda</p><h2>North Jakarta base</h2><p class="agm-copy">Charter operations, FRP production, and owner-care work are coordinated from our Cilincing / Marunda facility.</p></article>
    </div>`
  }),

  "corporate/index.html": wrap({
    title: "Company",
    description: "Legal standing and company information for PT. Agara Global Maritim.",
    kicker: "Company",
    heading: "Registered and<br>ready to operate",
    lede: "PT. Agara Global Maritim is a legally registered Indonesian company serving charter, shipbuilding, and marine support clients.",
    body: `
    <p class="agm-copy">We operate in line with applicable maritime, safety, and crewing requirements for the work we undertake, including vessel safety standards and crew certification.</p>
    <div class="agm-grid agm-grid-2 agm-section">
      <article class="agm-panel"><h2>Registered entity</h2><p class="agm-copy">PT. Agara Global Maritim, Marunda, North Jakarta.</p></article>
      <article class="agm-panel"><h2>Documents</h2><p class="agm-copy">For vendor registration or compliance packs, contact us and we will share the relevant company documents.</p></article>
    </div>
    <div class="agm-cta-row">
      <a class="agm-btn agm-btn-solid" href="/en/contacts/">Request documents</a>
    </div>`
  }),

  "investors/index.html": wrap({
    title: "Investors",
    description: "PT. Agara Global Maritim is a privately held marine services company.",
    kicker: "Investors",
    heading: "A privately held<br>marine company",
    lede: "AGM is not a listed issuer. Partnership and supply enquiries are welcome through the contact team.",
    body: `
    <p class="agm-copy">If you are exploring operational partnership, vessel investment, or long-term charter offtake, write to us with your mandate and timeline.</p>
    <div class="agm-cta-row">
      <a class="agm-btn agm-btn-solid" href="mailto:corporate@stratconagaraglobal.com">Email the company</a>
      <a class="agm-btn" href="/en/about/">About AGM</a>
    </div>`
  }),

  "privacy-policy/index.html": wrap({
    title: "Privacy policy",
    description: "How PT. Agara Global Maritim handles personal information sent through this website.",
    kicker: "Privacy",
    heading: "How we handle<br>your information",
    lede: "This site is operated by PT. Agara Global Maritim. We collect only what we need to answer enquiries and run charters or yard work.",
    body: `
    <div class="agm-panel">
      <h2>What we collect</h2>
      <p class="agm-copy">If you email us or submit an enquiry, we receive your name, contact details, and the message you send. We use that information to reply and, where relevant, to prepare a quote or operational plan.</p>
      <h2>What we do not do</h2>
      <p class="agm-copy">We do not sell personal data. We do not use enquiry details for unrelated marketing lists.</p>
      <h2>Contact</h2>
      <p class="agm-copy">Questions about this policy: <a href="mailto:corporate@stratconagaraglobal.com">corporate@stratconagaraglobal.com</a>.</p>
    </div>`
  }),

  "brand-representative/index.html": wrap({
    title: "Partners",
    description: "Work with PT. Agara Global Maritim as a charter, build, or support partner.",
    kicker: "Partners",
    heading: "Work with AGM",
    lede: "Agents, operators, and project owners who need reliable Indonesian marine support can partner with us.",
    body: `
    <p class="agm-copy">We collaborate with industrial clients, tourism operators, and project teams who need crewboats, new FRP hulls, or shore support from North Jakarta.</p>
    <div class="agm-cta-row">
      <a class="agm-btn agm-btn-solid" href="/en/enquire/">Start a conversation</a>
    </div>`
  }),

  "arts-and-culture/index.html": redirect("/en/about/", "About AGM"),
  "our-fleet/she/index.html": redirect("/en/our-fleet/", "AGM Fleet"),
  "our-fleet/50-steel/index.html": redirect("/en/our-fleet/", "AGM Fleet")
};

function writePage(rel, html) {
  const full = join(ROOT, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
  console.log("wrote", full);
}

for (const [rel, html] of Object.entries(pages)) {
  writePage(rel, html);
}

mkdirSync("charter", { recursive: true });
writeFileSync("charter/index.html", redirect("/en/our-fleet/", "AGM Fleet"));
console.log("wrote charter/index.html");
