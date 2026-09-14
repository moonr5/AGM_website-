/**
 * Travelo-style homepage chrome. Leaves #range (boats) untouched.
 */
(function () {
  if (!document.getElementById("hero")) return;

  document.documentElement.classList.add("agm-travelo");

  var CHARTER = "/en/images/services/charter-portrait.webp?v=h2";
  var BUILD = "/en/images/services/shipbuilding-portrait.webp";
  var SUPPORT = "/en/images/services/support-portrait.webp";
  var FLEET = "/en/images/hero/fleet-tile.webp";
  var YARD = "/en/images/service-backgrounds/frp-shipbuilding-bg.webp";
  var CREW = "/en/images/company-profile/marine-support.jpg";

  function pageSections() {
    return (
      '<section class="agm-travelo-section agm-about-stage" id="agm-about">' +
      '<div class="agm-about-stage-inner"><div class="agm-about-copy">' +
      '<p class="agm-about-kicker">The company</p>' +
      "<h2><span>A ship's company,</span><em>and a yard.</em></h2>" +
      '<p class="agm-about-script">From our own berth in Marunda.</p>' +
      '<p class="agm-about-deck">AGM charters crewboats, builds FRP vessels, and supports marine operations from North Jakarta. We are part of the PT. Stratcon Agara Global Group.</p>' +
      '<div class="agm-about-meta"><a class="agm-pill" href="/en/about/">More about us</a>' +
      '<span class="agm-about-where">Marunda yard · North Jakarta 14150</span></div>' +
      '<dl class="agm-about-figures">' +
      "<div><dt>Yard</dt><dd>Own berth, Marunda</dd></div>" +
      "<div><dt>Group</dt><dd>Stratcon Agara Global</dd></div>" +
      "<div><dt>12</dt><dd>Passengers per crewboat</dd></div>" +
      "<div><dt>24/7</dt><dd>Operations desk</dd></div></dl></div>" +
      '<div class="agm-about-mosaic">' +
      '<figure class="is-hero"><img src="' + CHARTER + '" alt="AGM crewboat on charter" width="640" height="800" loading="lazy" decoding="async"><figcaption>On charter</figcaption></figure>' +
      '<figure><img src="' + BUILD + '" alt="FRP hull under construction at Marunda" width="640" height="400" loading="lazy" decoding="async"><figcaption>In build</figcaption></figure>' +
      '<figure><img src="' + SUPPORT + '" alt="Marine operations support" width="640" height="400" loading="lazy" decoding="async"><figcaption>On station</figcaption></figure>' +
      "</div></div>" +
      '<div class="agm-about-lanes">' +
      '<a class="agm-about-lane" href="/en/our-fleet/"><img src="' + FLEET + '" alt="" width="640" height="480" loading="lazy" decoding="async"><span class="agm-about-lane-n">01</span><span class="agm-about-lane-body"><small>Fleet</small><strong>Vessel charter</strong><em>Open</em></span></a>' +
      '<a class="agm-about-lane" href="/en/shipyard/"><img src="' + YARD + '" alt="" width="640" height="480" loading="lazy" decoding="async"><span class="agm-about-lane-n">02</span><span class="agm-about-lane-body"><small>Yard</small><strong>FRP shipbuilding</strong><em>Open</em></span></a>' +
      '<a class="agm-about-lane" href="/en/services/"><img src="' + CREW + '" alt="" width="640" height="480" loading="lazy" decoding="async"><span class="agm-about-lane-n">03</span><span class="agm-about-lane-body"><small>Operations</small><strong>Marine support</strong><em>Open</em></span></a>' +
      "</div></section>" +
      '<section class="agm-partners" id="agm-partners" aria-label="Official partners">' +
      '<div class="agm-partners-inner"><p class="agm-partners-kicker">Official partners</p>' +
      "<h2>The engines we specify</h2>" +
      '<p class="agm-partners-lede">Suzuki Marine and Yamaha — installed, attended, and supported from the Marunda yard.</p>' +
      '<div class="agm-partners-row">' +
      '<article class="agm-partner-card" data-partner="suzuki"><a class="agm-partner-plate" href="https://www.suzukimarine.com/" target="_blank" rel="noopener noreferrer"><span class="agm-partner-float"><img src="/en/images/partners/suzuki-marine.png?v=2" alt="Suzuki Marine" width="420" height="140" loading="lazy" decoding="async"></span></a><p class="agm-partner-name">Suzuki Marine</p></article>' +
      '<article class="agm-partner-card" data-partner="yamaha"><a class="agm-partner-plate" href="https://yamaha-motor.com/marine" target="_blank" rel="noopener noreferrer"><span class="agm-partner-float"><img src="/en/images/partners/yamaha.png?v=2" alt="Yamaha" width="420" height="140" loading="lazy" decoding="async"></span></a><p class="agm-partner-name">Yamaha</p></article>' +
      "</div></div></section>" +
      '<section class="agm-fleet-intro">' +
      "<h2>Explore our charter-ready vessels</h2>" +
      "<p>Multi-purpose crewboats for transfer, tourism, and project work. Additional hulls are under construction at Marunda.</p>" +
      "</section>"
    );
  }

  function storyCard(opts) {
    return (
      '<a class="agm-story' +
      (opts.wide ? " agm-story-wide" : "") +
      '" href="' +
      opts.href +
      '"><img src="' +
      (opts.img || opts.poster || "") +
      '" alt="' +
      (opts.alt || "") +
      '" loading="lazy" decoding="async">' +
      '<span class="agm-story-n" aria-hidden="true">' +
      (opts.n || "") +
      "</span>" +
      '<div class="agm-story-head"><small>' +
      opts.kicker +
      "</small><h3>" +
      opts.title +
      '</h3><span class="agm-story-go">Read more</span></div></a>'
    );
  }

  function afterFleet() {
    return (
      '<section class="agm-travelo-section" id="agm-briefs">' +
      '<header class="agm-briefs-head"><p class="agm-kicker">Company notes</p><h2>Official briefs</h2></header>' +
      '<div class="agm-stories">' +
      storyCard({
        n: "01",
        img: FLEET,
        alt: "AGM crewboat prepared for charter",
        kicker: "Fleet programme · 2025",
        title: "A charter-ready FRP crewboat, placed into professional service",
        href: "/en/fleet-charter/",
      }) +
      storyCard({
        n: "02",
        img: YARD,
        alt: "Marunda shipyard",
        kicker: "Marunda shipyard",
        title: "Construction and finishing undertaken entirely in our own yard",
        href: "/en/shipyard/",
      }) +
      storyCard({
        n: "03",
        img: CREW,
        alt: "Marine operations",
        kicker: "Marine operations",
        title: "A certified ship's company, with continuous operational cover",
        href: "/en/operations/",
      }) +
      storyCard({
        n: "04",
        wide: true,
        img: "/en/hero-poster.webp",
        alt: "Open water at dusk off the Java coast",
        kicker: "Blue economy",
        title: "A considered contribution to Indonesia's maritime prosperity",
        href: "/en/blue-economy/",
      }) +
      "</div></section>" +
      '<section class="agm-travelo-section agm-faq">' +
      "<div><h2>Frequently asked questions</h2>" +
      '<div class="agm-help"><img src="' +
      CHARTER +
      '" alt="">' +
      "<div><p>Need a vessel or a custom build?</p><a class=\"agm-btn-pill\" href=\"/en/contacts/\">Get in touch</a></div></div></div>" +
      "<div>" +
      "<details open><summary>What vessels can we charter?</summary><p>Multi-purpose FRP crewboats for crew transfer, tourism, fishing trips, and light project support. Daily, trip, or monthly arrangements.</p></details>" +
      "<details><summary>Do you build custom FRP boats?</summary><p>Yes. Our Marunda yard builds fiberglass vessels with adjustable length, layout, and engine configuration.</p></details>" +
      "<details><summary>Where are you based?</summary><p>PT. Agara Global Maritim operates from Marunda, North Jakarta 14130.</p></details>" +
      "<details><summary>How do we enquire?</summary><p>Call +62 819-231-001 or email corporate@stratconagaraglobal.com, or use the enquire form.</p></details>" +
      "</div></section>" +
      '<section class="agm-travelo-section">' +
      '<p class="agm-gallery-head">From the yard to the water</p>' +
      '<div class="agm-gallery">' +
      galleryShot(CHARTER, "Charter vessel on sea trial", "Vessel charter", "Crew transfer, sea tourism, and fishing voyages under certified command.") +
      galleryShot(BUILD, "FRP hull under construction", "FRP shipbuilding", "Custom fibreglass vessels laid up and finished at our Marunda yard.") +
      galleryShot(SUPPORT, "Utility vessel on operations", "Marine support", "Shorebase attendance, light logistics, and industrial project cover.") +
      galleryShot(FLEET, "Charter-ready crewboat", "Our fleet", "A multi-purpose crewboat in service, with further hulls in build.") +
      galleryShot(YARD, "Yard team at Marunda", "The yard", "Fabrication, repair, and finishing by our own people in North Jakarta.") +
      "</div></section>"
    );
  }

  function galleryShot(src, alt, kicker, copy) {
    return (
      '<figure class="agm-gallery-item" tabindex="0">' +
      '<img src="' +
      src +
      '" alt="' +
      alt +
      '" loading="lazy" decoding="async">' +
      "<figcaption><small>" +
      kicker +
      "</small><strong>" +
      copy +
      "</strong></figcaption></figure>"
    );
  }

  function mountPage() {
    if (document.querySelector(".agm-travelo-section")) return;
    var heroWrap = document.getElementById("hs_cos_wrapper_hero");
    var rangeWrap = document.getElementById("hs_cos_wrapper_range");
    if (heroWrap) heroWrap.insertAdjacentHTML("afterend", pageSections());
    if (rangeWrap) rangeWrap.insertAdjacentHTML("afterend", afterFleet());
  }

  function restyleNav() {
    var nav = document.querySelector("#appbar .agm-nav");
    if (!nav || nav.dataset.agmTravelo === "1") return;
    nav.dataset.agmTravelo = "1";
    nav.innerHTML =
      '<a class="a" href="/en/" data-i18n="nav.home">Home</a>' +
      '<a class="a" href="#range" data-i18n="nav.fleet">Fleet</a>' +
      '<a class="a" href="/en/about/" data-i18n="nav.about">About</a>' +
      '<a class="a" href="/en/services/" data-i18n="nav.services">Services</a>' +
      '<a class="a" href="/en/blue-economy/" data-i18n="nav.blue">Blue Economy</a>' +
      '<a class="a agm-nav-cta" href="/en/enquire/" data-i18n="nav.enquire">Enquire</a>';
  }

  function bindStories() {
    var root = document.getElementById("agm-briefs");
    if (!root || root.dataset.bound === "1") return;
    root.dataset.bound = "1";
    root.addEventListener("click", function (event) {
      if (event.target.closest(".agm-story-link")) return;
      var toggle = event.target.closest(".agm-story-toggle");
      if (!toggle) return;
      var card = toggle.closest(".agm-story");
      var willOpen = !card.classList.contains("is-open");
      root.querySelectorAll(".agm-story.is-open").forEach(function (el) {
        if (el === card) return;
        el.classList.remove("is-open");
        var btn = el.querySelector(".agm-story-toggle");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
      card.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });
  }

  function bindGallery() {
    var gallery = document.querySelector(".agm-gallery");
    if (!gallery || gallery.dataset.bound === "1") return;
    gallery.dataset.bound = "1";
    gallery.addEventListener("click", function (event) {
      var item = event.target.closest(".agm-gallery-item");
      if (!item) return;
      gallery.querySelectorAll(".agm-gallery-item.is-on").forEach(function (el) {
        if (el !== item) el.classList.remove("is-on");
      });
      item.classList.toggle("is-on");
    });
  }

  function polishServiceLinks(root) {
    root.querySelectorAll("._texts_mirx2_93 a").forEach(function (link) {
      link.childNodes.forEach(function (node) {
        if (node.nodeType === 3 && /discover/i.test(node.textContent || "")) {
          node.textContent = node.textContent.replace(/Discover model/gi, "Read the brief");
        }
      });
    });
  }

  function enhanceServices() {
    var root = document.querySelector("#below ._main_mirx2_1");
    if (!root) return;
    polishServiceLinks(root);
    var desc = root.querySelector("._description_mirx2_36");
    var box = root.querySelector("._first_mirx2_8 > ._container_mirx2_26");
    if (!desc || !box) return;
    if (!box.querySelector(".agm-service-plate")) {
      desc.insertAdjacentHTML(
        "afterend",
        '<div class="agm-service-plate">' +
          "<figure>" +
          '<img src="/en/images/custom-pages/shipyard-hero.jpg" alt="FRP construction at the Marunda yard">' +
          "<figcaption>Marunda yard · North Jakarta</figcaption>" +
          "</figure>" +
          '<p class="agm-service-lead">PT. Agara Global Maritim is a ship’s company and FRP yard. We place working boats, with certificated crews, at the disposal of principals who must answer for safety and timetable.</p>' +
          '<ul class="agm-service-facts">' +
          "<li><b>Marunda</b>Own yard, North Jakarta</li>" +
          "<li><b>FRP</b>Built and finished in-house</li>" +
          "<li><b>12</b>Passengers per crewboat</li>" +
          "<li><b>24/7</b>Operations desk</li>" +
          "</ul></div>"
      );
    }
    var learn = box.querySelector("._discover_mirx2_161");
    if (learn && /learn more/i.test(learn.textContent || "")) {
      learn.textContent = "View services";
    }
  }

  function enhanceFooter() {
    var root = document.querySelector("#below ._footerSection_ypmp5_1");
    if (!root || root.querySelector(".agm-legal-foot")) return;
    var nav = document.createElement("nav");
    nav.className = "agm-legal-foot";
    nav.setAttribute("aria-label", "Legal");
    nav.innerHTML =
      '<a href="/en/contacts/">Contacts</a>' +
      '<a href="/en/careers/">Careers</a>' +
      '<a href="/en/privacy-policy/">Privacy</a>' +
      '<a href="/en/cookie-policy/">Cookie Policy</a>' +
      '<a href="/en/cookie-manager/">Cookie Manager</a>';
    root.appendChild(nav);
  }

  function enhanceContact() {
    var root = document.querySelector("#below ._container_k2jxx_1");
    if (!root) return;

    var heading = root.querySelector("._heading_k2jxx_10");
    if (heading) heading.textContent = "Contact us";

    var title = root.querySelector("._title_k2jxx_32");
    if (title && /ready to assist|inquiries about vessel|enquiries about vessel/i.test(title.textContent || "")) {
      title.textContent = "The operations desk answers from Marunda.";
    }

    var controls = root.querySelector("._topControls_k2jxx_258");
    if (controls && !controls.querySelector(".agm-contact-aside")) {
      controls.insertAdjacentHTML(
        "afterbegin",
        '<aside class="agm-contact-aside">' +
          "<dl>" +
          "<div><dt>Yard</dt><dd>Marunda, North Jakarta</dd></div>" +
          '<div><dt>Call</dt><dd><a href="tel:+62819231001">+62 819-231-001</a></dd></div>' +
          '<div><dt>Write</dt><dd><a href="mailto:corporate@stratconagaraglobal.com">corporate@stratconagaraglobal.com</a></dd></div>' +
          "</dl>" +
          '<a class="agm-contact-cta" href="/en/enquire/">Enquire</a>' +
          "</aside>"
      );
    }
  }

  function bindCloserForm() {
    var form = document.querySelector(".agm-closer-form");
    if (!form || form.dataset.bound === "1") return;
    form.dataset.bound = "1";
    var status = form.querySelector(".agm-form-status");
    var button = form.querySelector('button[type="submit"]');
    function setStatus(kind, text) {
      if (!status) return;
      status.hidden = !text;
      status.className = "agm-form-status" + (kind ? " is-" + kind : "");
      status.textContent = text || "";
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      if (String(data.get("website") || "").trim()) {
        setStatus("ok", window.AGM_I18N ? window.AGM_I18N.t("form.ok") : "Thank you.");
        form.reset();
        return;
      }
      var payload = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        message: String(data.get("message") || "").trim()
      };
      if (!payload.name || !payload.email || !payload.message) {
        setStatus("err", window.AGM_I18N ? window.AGM_I18N.t("form.need") : "Please add your name, email, and a short message.");
        return;
      }
      if (button) {
        button.disabled = true;
        button.textContent = window.AGM_I18N ? window.AGM_I18N.t("form.sending") : "Sending…";
      }
      fetch("/api/enquire.php", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () {
            return { ok: res.ok };
          });
        })
        .then(function (body) {
          if (!body || !body.ok) throw new Error("fail");
          form.reset();
          setStatus("ok", window.AGM_I18N ? window.AGM_I18N.t("form.ok") : "Thank you. We will reply shortly.");
        })
        .catch(function () {
          setStatus("err", window.AGM_I18N ? window.AGM_I18N.t("form.err") : "Could not send. Email corporate@stratconagaraglobal.com");
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.textContent = window.AGM_I18N ? window.AGM_I18N.t("form.send") : "Send message";
          }
        });
    });
  }

  function wrapHeroWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (word, i) {
      var span = document.createElement("span");
      span.className = "agm-hero-word";
      span.style.setProperty("--i", String(i));
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }

  function writeHeroScript(el, reduce) {
    if (!el) return;
    var gen = (Number(el.dataset.heroGen) || 0) + 1;
    el.dataset.heroGen = String(gen);
    var textEl = el.querySelector(".agm-hero-script-text");
    var phrases = (el.getAttribute("data-phrases") || "")
      .split("|")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    if (!textEl || !phrases.length) return;

    if (reduce) {
      textEl.textContent = phrases[0];
      return;
    }

    var i = 0;
    var pos = 0;
    var deleting = false;

    function tick() {
      if (Number(el.dataset.heroGen) !== gen) return;
      var phrase = phrases[i];
      if (!deleting) {
        pos += 1;
        textEl.textContent = phrase.slice(0, pos);
        if (pos >= phrase.length) {
          deleting = true;
          setTimeout(tick, 2300);
          return;
        }
        setTimeout(tick, 36 + Math.random() * 26);
        return;
      }
      pos -= 1;
      textEl.textContent = phrase.slice(0, Math.max(pos, 0));
      if (pos <= 0) {
        deleting = false;
        i = (i + 1) % phrases.length;
        setTimeout(tick, 280);
        return;
      }
      setTimeout(tick, 20);
    }

    setTimeout(tick, 780);
  }

  function animateHero() {
    var hero = document.querySelector(".agm-hero");
    if (!hero || hero.dataset.anim === "1") return;
    hero.dataset.anim = "1";

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      hero.querySelectorAll(".agm-hero-line, .agm-hero-lux").forEach(function (el, i) {
        wrapHeroWords(el);
        el.style.setProperty("--delay", i * 220 + "ms");
      });
    }

    hero.classList.add("is-ready");
    writeHeroScript(hero.querySelector(".agm-hero-script"), reduce);
    if (!hero.dataset.langBound) {
      hero.dataset.langBound = "1";
      document.addEventListener("agm:lang", function () {
        writeHeroScript(hero.querySelector(".agm-hero-script"), reduce);
      });
    }
  }

  function revealFeatures() {
    var stage = document.getElementById("agm-about");
    var cards = document.querySelectorAll(".agm-feature, .agm-about-lane, .agm-about-copy, .agm-about-mosaic figure, .agm-partner-card");
    if (!cards.length) return;
    if (stage && stage.dataset.reveal === "1") return;
    if (stage) stage.dataset.reveal = "1";
    if (stage) stage.classList.add("is-ready");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cards.forEach(function (card) {
        card.classList.add("is-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );
    cards.forEach(function (card) {
      io.observe(card);
    });
  }

  function unpinBelow() {
    var root = document.getElementById("below") || document.getElementById("hs_cos_wrapper_below");
    if (!root) return;
    var nodes = [root].concat(
      Array.prototype.slice.call(
        root.querySelectorAll(".pin-spacer, ._main_mirx2_1, ._first_mirx2_8, ._second_mirx2_56, ._imgWrapper_mirx2_65, ._container_mirx2_26")
      )
    );
    nodes.forEach(function (el) {
      if (!el || !el.style) return;
      if (el.style.position === "fixed") {
        el.style.position = "relative";
        el.style.top = "";
        el.style.left = "";
        el.style.right = "";
        el.style.bottom = "";
        el.style.width = "";
      }
      if (el.classList && el.classList.contains("pin-spacer")) {
        el.style.height = "auto";
        el.style.padding = "0";
        el.style.margin = "0";
      }
    });
    var ST = window.ScrollTrigger;
    if (ST && typeof ST.getAll === "function") {
      ST.getAll().forEach(function (trigger) {
        var target = trigger && trigger.trigger;
        if (!target) return;
        if (target === root || (target.closest && target.closest("#below, #hs_cos_wrapper_below"))) {
          trigger.kill();
        }
      });
    }
  }

  function pinNav() {
    var bars = document.querySelectorAll(".appbar-wrapper");
    if (!bars.length) return;
    function update() {
      var hero = document.querySelector(".agm-hero, #hero, #hs_cos_wrapper_hero");
      var overHero = false;
      if (hero) {
        overHero = hero.getBoundingClientRect().bottom > 90;
      }
      var scrolled = window.scrollY > 16 && !overHero;
      bars.forEach(function (bar) {
        bar.classList.toggle("is-scrolled", scrolled);
      });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  }

  function run() {
    restyleNav();
    pinNav();
    unpinBelow();
    mountPage();
    bindStories();
    bindGallery();
    animateHero();
    revealFeatures();
    enhanceServices();
    enhanceContact();
    enhanceFooter();
    bindCloserForm();
    if (window.AGM_I18N && typeof window.AGM_I18N.mount === "function") {
      window.AGM_I18N.mount();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  var below = document.getElementById("below") || document.getElementById("hs_cos_wrapper_below");
  if (below) {
    var belowTimer;
    new MutationObserver(function () {
      clearTimeout(belowTimer);
      belowTimer = setTimeout(function () {
        unpinBelow();
        enhanceServices();
        enhanceContact();
        enhanceFooter();
      }, 120);
    }).observe(below, { childList: true, subtree: true });
  }
})();
