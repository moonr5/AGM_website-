(function () {
  var LINKS = [
    { href: "/en/", label: "Home", key: "nav.home" },
    { href: "/en/about/", label: "About", key: "nav.about" },
    { href: "/en/services/", label: "Services", key: "nav.services" },
    { href: "/en/our-fleet/", label: "Fleet", key: "nav.fleet" },
    { href: "/en/shipyard/", label: "Shipyard", key: "nav.shipyard" },
    { href: "/en/owner-care/", label: "Owner Care", key: "nav.ownercare" },
    { href: "/en/sea-cucumber-trade/", label: "Sea Cucumber Trade", key: "nav.seatrad" },
    { href: "/en/blue-economy/", label: "Blue Economy", key: "nav.blue" },
    { href: "/en/sustainability/", label: "Our Story", key: "nav.story" },
    { href: "/en/people/", label: "People", key: "nav.people" },
    { href: "/en/compliance/", label: "Compliance", key: "nav.compliance" },
    { href: "/en/enquire/", label: "Enquire", key: "nav.enquire" },
    { href: "/en/contacts/", label: "Contacts", key: "nav.contacts" },
    { href: "/en/careers/", label: "Careers", key: "nav.careers" },
    { href: "/en/privacy-policy/", label: "Privacy", key: "nav.privacy" },
    { href: "/en/cookie-policy/", label: "Cookie Policy", key: "nav.cookies" },
    { href: "/en/cookie-manager/", label: "Cookie Manager", key: "nav.cookiemgr" }
  ];

  function headerHtml() {
    return (
      '<div id="appbar-corporate">' +
      '<div id="appbar-wrapper" class="appbar-wrapper is-scrolled">' +
      '<div id="appbar" class="appbar">' +
      "<div>" +
      '<div class="section agm-brand">' +
      '<a href="/en/" class="agm-brand-link" aria-label="Agara Global Maritim Home">' +
      '<img src="/en/p61.png" alt="AGM Logo" class="agm-brand-logo" width="44" height="34">' +
      '<span class="agm-brand-text"><span class="agm-brand-name">AGARA</span><span class="agm-brand-sub">GLOBAL MARITIM</span></span>' +
      "</a></div>" +
      '<div class="section agm-nav">' +
      (window.AGM_I18N && typeof window.AGM_I18N.navHtml === "function"
        ? window.AGM_I18N.navHtml()
        : '<a class="a" href="/en/" data-i18n="nav.home">Home</a>' +
          '<a class="a" href="/en/our-fleet/" data-i18n="nav.fleet">Fleet</a>' +
          '<a class="a" href="/en/about/" data-i18n="nav.about">About</a>' +
          '<a class="a" href="/en/services/" data-i18n="nav.services">Services</a>' +
          '<a class="a" href="/en/blue-economy/" data-i18n="nav.blue">Blue Economy</a>' +
          '<div class="agm-langs" role="group" aria-label="Language">' +
          '<button type="button" data-agm-lang="en">EN</button>' +
          '<button type="button" data-agm-lang="id">ID</button>' +
          "</div>" +
          '<a class="a agm-nav-cta" href="/en/enquire/" data-i18n="nav.enquire">Enquire</a>') +
      "</div>" +
      '<div class="section uppercase"></div>' +
      '<div class="section"><img id="burger" src="/hubfs/raw_assets/public/appbar/assets/burger_menu.svg" alt="Menu"></div>' +
      "</div></div></div></div>"
    );
  }

  function drawerHtml() {
    return (
      '<div class="agm-drawer" id="agm-drawer" hidden>' +
      "<nav>" +
      LINKS.map(function (item) {
        return '<a href="' + item.href + '" data-i18n="' + item.key + '">' + item.label + "</a>";
      }).join("") +
      "</nav></div>"
    );
  }

  function closerHtml() {
    return (
      '<section class="agm-closer" id="agm-closer">' +
      '<div class="agm-closer-plan">' +
      '<div class="agm-closer-copy">' +
      '<p class="agm-kicker" data-i18n="close.kicker">Next step</p>' +
      '<h2 data-i18n="close.h2">Plan the next charter from Marunda</h2>' +
      '<p data-i18n="close.p">Tell the operations desk the work. We will place the boat, or start the hull.</p>' +
      '<a class="agm-pill" href="/en/enquire/" data-i18n="nav.enquire">Enquire</a>' +
      "</div>" +
      '<form class="agm-form agm-closer-form" action="/api/enquire.php" method="post">' +
      '<p class="agm-closer-form-title" data-i18n="close.form">Send us the brief</p>' +
      '<label><span data-i18n="form.name">Your name</span><input name="name" required autocomplete="name" maxlength="120"></label>' +
      '<label><span data-i18n="form.email">Your email</span><input type="email" name="email" required autocomplete="email" maxlength="180"></label>' +
      '<label><span data-i18n="form.phone">Your phone</span><input type="tel" name="phone" autocomplete="tel" maxlength="60"></label>' +
      '<label><span data-i18n="form.msg">Tell us more</span><textarea name="message" required maxlength="4000" placeholder="Dates, passengers, or a build brief"></textarea></label>' +
      '<label class="agm-form-honey" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>' +
      '<p class="agm-form-status" role="status" aria-live="polite" hidden></p>' +
      '<button class="agm-pill agm-pill-plain" type="submit" data-i18n="form.send">Send message</button>' +
      "</form></div></section>"
    );
  }

  function footerHtml() {
    return (
      '<footer class="agm-endfoot">' +
      '<img class="agm-endfoot-media" src="/en/images/hero/home-hero.webp?v=h2" alt="" width="1920" height="900">' +
      '<div class="agm-endfoot-inner">' +
      '<h2 data-i18n="close.foot">Plan the next charter from Marunda</h2>' +
      '<nav class="agm-endfoot-cols" aria-label="Footer">' +
      "<div>" +
      '<a href="/en/" data-i18n="nav.home">Home</a>' +
      '<a href="/en/about/" data-i18n="nav.about">About</a>' +
      '<a href="/en/our-fleet/" data-i18n="nav.fleet">Fleet</a>' +
      '<a href="/en/services/" data-i18n="nav.services">Services</a>' +
      "</div>" +
      '<div class="agm-endfoot-brand"><img class="agm-endfoot-logo" src="/en/p61.png" alt="AGM" width="72" height="56"><strong>AGARA</strong><span>GLOBAL MARITIM</span></div>' +
      "<div>" +
      '<a href="/en/contacts/" data-i18n="nav.contacts">Contacts</a>' +
      '<a href="/en/enquire/" data-i18n="nav.enquire">Enquire</a>' +
      '<a href="/en/privacy-policy/" data-i18n="nav.privacy">Privacy</a>' +
      '<a href="/en/cookie-policy/" data-i18n="nav.cookies">Cookie Policy</a>' +
      "</div></nav>" +
      "<p>© 2026 PT. Agara Global Maritim</p>" +
      "</div></footer>"
    );
  }

  function skipCloserForm() {
    return /\/enquire\/?$|\/contacts\/?$/.test(location.pathname);
  }

  var ENQUIRE_TO = "corporate@stratconagaraglobal.com";
  var FORMSUBMIT_ID = "61682d31a83783a04281843d3581c10f";

  function formSubmitAccepted(body) {
    if (!body) return false;
    if (body.success === true || body.success === "true") return true;
    return /activat|confirm|verify/i.test(String(body.message || ""));
  }

  function sendViaFormSubmit(payload) {
    return fetch("https://formsubmit.co/ajax/" + FORMSUBMIT_ID, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "Who wrote": payload.name,
        "Their email": payload.email,
        "Their phone": payload.phone || "Not given",
        "About": payload.service || "General enquiry",
        "What they wrote": payload.message,
        _subject: "New AGM enquiry — " + payload.name + (payload.service ? " — " + payload.service : ""),
        _template: "box",
        _captcha: "false",
        _replyto: payload.email,
        _autoresponse: "Thank you for writing to PT. Agara Global Maritim. We have received your enquiry and will reply shortly."
      })
    }).then(function (res) {
      return res.json().then(function (body) {
        return {
          ok: res.ok && formSubmitAccepted(body),
          error: body && body.message
        };
      });
    });
  }

  function postEnquiry(payload) {
    return fetch("/api/enquire.php", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (res.status === 404 || res.status === 501) {
          return sendViaFormSubmit(payload);
        }
        return res
          .json()
          .catch(function () {
            return { ok: false, mailed: false, error: "" };
          })
          .then(function (body) {
            if (res.status === 400 || res.status === 429) {
              return { ok: false, error: body && body.error };
            }
            if (body && body.ok && body.mailed) {
              return { ok: true };
            }
            return sendViaFormSubmit(payload);
          });
      })
      .catch(function () {
        return sendViaFormSubmit(payload);
      });
  }

  function bindEnquireForm() {
    document.querySelectorAll(".agm-form").forEach(bindOneEnquireForm);
  }

  function bindOneEnquireForm(form) {
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
        setStatus("ok", window.AGM_I18N ? window.AGM_I18N.t("form.ok") : "Thank you. We have received your enquiry.");
        form.reset();
        return;
      }

      var payload = {
        name: String(data.get("name") || "").trim(),
        email: String(data.get("email") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        service: String(data.get("service") || "").trim(),
        message: String(data.get("message") || "").trim()
      };

      if (!payload.name || !payload.email || !payload.message) {
        setStatus("err", window.AGM_I18N ? window.AGM_I18N.t("form.need") : "Please add your name, email, and a short message.");
        return;
      }

      if (button) {
        button.disabled = true;
        button.dataset.label = button.textContent;
        button.textContent = window.AGM_I18N ? window.AGM_I18N.t("form.sending") : "Sending…";
      }
      setStatus("", "");

      postEnquiry(payload)
        .then(function (result) {
          if (!result.ok) {
            throw new Error(result.error || "Could not send.");
          }
          form.reset();
          setStatus(
            "ok",
            window.AGM_I18N ? window.AGM_I18N.t("form.ok") : "Thank you. Your enquiry has been sent. We will reply shortly."
          );
        })
        .catch(function () {
          setStatus(
            "err",
            window.AGM_I18N ? window.AGM_I18N.t("form.err") : "The message could not be sent. Please email corporate@stratconagaraglobal.com or call +62 819-231-001."
          );
        })
        .then(function () {
          if (button) {
            button.disabled = false;
            button.textContent = button.dataset.label || (window.AGM_I18N ? window.AGM_I18N.t("form.send") : "Send message");
          }
        });
    });
  }

  function bindDrawingPins() {
    document.querySelectorAll(".agm-drawing-stage").forEach(function (stage) {
      if (stage.dataset.bound === "1") return;
      stage.dataset.bound = "1";
      stage.addEventListener("click", function (event) {
        var pin = event.target.closest(".agm-pin");
        if (!pin) return;
        event.preventDefault();
        stage.querySelectorAll(".agm-pin.is-on").forEach(function (el) {
          if (el !== pin) el.classList.remove("is-on");
        });
        pin.classList.toggle("is-on");
      });
    });
  }

  function inject() {
    document.body.classList.add("agm-page");
    if (!document.getElementById("appbar-corporate")) {
      document.body.insertAdjacentHTML("afterbegin", headerHtml() + drawerHtml());
    } else if (!document.getElementById("agm-drawer")) {
      document.body.insertAdjacentHTML("afterbegin", drawerHtml());
    }
    document.querySelectorAll(".agm-about-cta").forEach(function (el) {
      el.hidden = true;
    });
    if (!document.querySelector(".agm-endfoot") && !document.querySelector(".agm-page-footer")) {
      document.body.insertAdjacentHTML("beforeend", (skipCloserForm() ? "" : closerHtml()) + footerHtml());
    }

    bindEnquireForm();
    if (!document.querySelector('script[src*="agm-cookies.js"]')) {
      var cookies = document.createElement("script");
      cookies.src = "/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-cookies.js?v=3";
      cookies.defer = true;
      document.head.appendChild(cookies);
    }
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("agm-drawer");
    if (burger && drawer) {
      drawer.removeAttribute("hidden");
      function close() {
        drawer.classList.remove("is-open");
      }
      burger.addEventListener("click", function () {
        drawer.classList.toggle("is-open");
      });
      drawer.addEventListener("click", function (event) {
        if (event.target === drawer) close();
      });
    }
    bindDrawingPins();
    revealOnScroll();
    bindCeoLang();
    if (window.AGM_I18N && typeof window.AGM_I18N.mount === "function") {
      window.AGM_I18N.mount();
    }
  }

  function bindCeoLang() {
    var root = document.getElementById("agm-ceo");
    if (!root) return;
    var copies = {
      en: {
        title: "Message from <em>Director</em> About Company",
        banner: "Message From Our Director",
        role: "Operational Director"
      },
      id: {
        title: "Pesan dari <em>Direktur</em> Tentang Perusahaan",
        banner: "Pesan Dari Direktur Kami",
        role: "Direktur Operasional"
      }
    };
    function setLang(lang) {
      var pack = copies[lang] || copies.en;
      var title = root.querySelector("[data-ceo-title]");
      var banner = root.querySelector("[data-ceo-banner]");
      var role = root.querySelector("[data-ceo-role]");
      if (title) title.innerHTML = pack.title;
      if (banner) banner.textContent = pack.banner;
      if (role) role.textContent = pack.role;
      root.querySelectorAll("[data-ceo-copy]").forEach(function (el) {
        el.hidden = el.getAttribute("data-ceo-copy") !== lang;
      });
    }
    function sync() {
      setLang(window.AGM_I18N ? window.AGM_I18N.get() : "en");
    }
    document.addEventListener("agm:lang", function (event) {
      setLang(event.detail && event.detail.lang);
    });
    sync();
  }

  function revealOnScroll() {
    var nodes = document.querySelectorAll(".agm-reveal");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach(function (el) {
        el.classList.add("is-in");
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
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
