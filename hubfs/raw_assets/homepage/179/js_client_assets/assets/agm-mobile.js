(function () {
  var DRAWER_LINKS = [
    { href: "/en/", label: "Home", key: "nav.home" },
    { href: "/en/about/", label: "About", key: "nav.about" },
    { href: "/en/services/", label: "Services", key: "nav.services" },
    { href: "/en/our-fleet/", label: "Fleet", key: "nav.fleet" },
    { href: "/en/shipyard/", label: "Shipyard", key: "nav.shipyard" },
    { href: "/en/owner-care/", label: "Owner Care", key: "nav.ownercare" },
    { href: "/en/sea-cucumber-trade/", label: "Sea Cucumber Trade", key: "nav.seatrad" },
    { href: "/en/blue-economy/", label: "Blue Economy", key: "nav.blue" },
    { href: "/en/marine-intelligence/", label: "Marine Intelligence", key: "nav.intel" },
    { href: "/en/sustainability/", label: "Our Story", key: "nav.story" },
    { href: "/en/people/", label: "People", key: "nav.people" },
    { href: "/en/compliance/", label: "Compliance", key: "nav.compliance" },
    { href: "/en/enquire/", label: "Enquire", key: "nav.enquire" },
    { href: "/en/contacts/", label: "Contacts", key: "nav.contacts" }
  ];

  function setViewportHeight() {
    document.documentElement.style.setProperty("--agm-vh", window.innerHeight + "px");
  }

  function setAppbarHeight() {
    var bar = document.querySelector(".appbar-wrapper");
    if (!bar) {
      document.documentElement.style.removeProperty("--agm-appbar-h");
      return;
    }
    var topPad = 0;
    try {
      topPad = parseFloat(getComputedStyle(bar).paddingTop) || 0;
    } catch (e) {}
    var pill = bar.querySelector("#appbar") || bar;
    var h = Math.ceil(pill.getBoundingClientRect().height + topPad);
    document.documentElement.style.setProperty("--agm-appbar-h", Math.max(64, h) + "px");
  }

  function setAppbarScrolled() {
    var hero = document.querySelector(".agm-hero");
    var overHero = false;
    if (hero) {
      overHero = hero.getBoundingClientRect().bottom > 88;
    }
    document.querySelectorAll(".appbar-wrapper").forEach(function (bar) {
      bar.classList.toggle("is-over-hero", overHero);
      bar.classList.toggle("is-scrolled", !overHero);
    });
  }

  function ensureViewportMeta() {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    var content = meta.getAttribute("content") || "";
    var next = content;
    if (!/width=device-width/.test(next)) {
      next = "width=device-width, initial-scale=1" + (next ? ", " + next : "");
    }
    if (!/viewport-fit=cover/.test(next)) {
      next += ", viewport-fit=cover";
    }
    meta.setAttribute("content", next);
  }

  function drawerHtml() {
    return (
      '<div class="agm-drawer" id="agm-drawer" hidden>' +
      "<nav>" +
      DRAWER_LINKS.map(function (item) {
        return (
          '<a href="' +
          item.href +
          '" data-i18n="' +
          item.key +
          '">' +
          item.label +
          "</a>"
        );
      }).join("") +
      "</nav></div>"
    );
  }

  function ensureDrawer() {
    if (document.getElementById("agm-drawer")) return;
    if (!document.getElementById("burger")) return;
    document.body.insertAdjacentHTML("afterbegin", drawerHtml());
  }

  function bindDrawer() {
    ensureDrawer();
    var burger = document.getElementById("burger");
    var drawer = document.getElementById("agm-drawer");
    if (!burger || !drawer || drawer.dataset.agmBound === "1") return;
    drawer.dataset.agmBound = "1";
    drawer.removeAttribute("hidden");

    function setOpen(open) {
      drawer.classList.toggle("is-open", open);
      document.body.classList.toggle("agm-drawer-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      // Prevent HubSpot mobile-menu from also opening.
      document.querySelectorAll("#mobile-menu.open").forEach(function (el) {
        el.classList.remove("open");
      });
    }

    function close() {
      setOpen(false);
    }

    burger.setAttribute("role", "button");
    burger.setAttribute("aria-controls", "agm-drawer");
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener(
      "click",
      function (event) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(!drawer.classList.contains("is-open"));
      },
      true
    );
    drawer.addEventListener("click", function (event) {
      if (event.target === drawer) close();
    });
    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  function playHeroVideos() {
    document.querySelectorAll("#hero video").forEach(function (video) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      if (!video.getAttribute("preload")) {
        video.preload = "auto";
      }
      video.load();
      video.play().catch(function () {});
    });
  }

  function init() {
    ensureViewportMeta();
    setViewportHeight();
    setAppbarHeight();
    setAppbarScrolled();
    bindDrawer();
    if (window.AGM_I18N && typeof window.AGM_I18N.mount === "function") {
      window.AGM_I18N.mount();
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        setViewportHeight();
        setAppbarHeight();
      }, 100);
    }
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", setViewportHeight, { passive: true });
    window.addEventListener("scroll", setAppbarScrolled, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize, { passive: true });
    }

    playHeroVideos();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) playHeroVideos();
    });
    new MutationObserver(playHeroVideos).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
