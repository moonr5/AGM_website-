/**
 * AGM hero — mobile enhancements (max-width: 768px only).
 * Sets --agm-hero-h and --agm-appbar-h for true fullscreen on all phone sizes.
 */
(function () {
  var MQ = "(max-width: 768px)";

  function isMobile() {
    return window.matchMedia(MQ).matches;
  }

  function readSafeTop() {
    var probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;padding-top:env(safe-area-inset-top);visibility:hidden;pointer-events:none";
    document.documentElement.appendChild(probe);
    var top = parseFloat(getComputedStyle(probe).paddingTop) || 0;
    probe.remove();
    return top;
  }

  function readAppbarHeight() {
    var bar = document.querySelector(".appbar-wrapper");
    if (!bar) return 60;
    return Math.max(60, Math.ceil(bar.getBoundingClientRect().height));
  }

  function readCopyHeight() {
    var content = document.querySelector("#hero ._contentSpace_ty1x2_38");
    if (!content) return 120;
    return Math.max(96, Math.ceil(content.getBoundingClientRect().height) + 12);
  }

  function setHeroMetrics() {
    var root = document.documentElement;
    if (!isMobile()) {
      root.style.removeProperty("--agm-hero-h");
      root.style.removeProperty("--agm-appbar-h");
      root.style.removeProperty("--agm-hero-copy-h");
      return;
    }

    var appbarH = readAppbarHeight();
    var vv = window.visualViewport;
    var viewportH = vv && vv.height ? vv.height : window.innerHeight;
    var heroH = Math.max(280, Math.round(viewportH - appbarH - readSafeTop()));
    var copyH = readCopyHeight();

    root.style.setProperty("--agm-appbar-h", appbarH + "px");
    root.style.setProperty("--agm-hero-h", heroH + "px");
    root.style.setProperty("--agm-hero-copy-h", copyH + "px");
    fixHeroPinSpacer(heroH);
  }

  function readHeroHeightPx() {
    var root = document.documentElement;
    var raw = root.style.getPropertyValue("--agm-hero-h") || getComputedStyle(root).getPropertyValue("--agm-hero-h");
    raw = (raw || "").trim();
    if (raw) return raw;
    return "calc(100svh - var(--agm-appbar-h, 60px) - var(--agm-safe-top, 0px))";
  }

  /** Pin-spacer must equal hero height — height:0 hid the entire hero. */
  function fixHeroPinSpacer(heroHPx) {
    if (!isMobile()) return;
    var heroH = heroHPx ? heroHPx + "px" : readHeroHeightPx();
    document.querySelectorAll(".pin-spacer").forEach(function (spacer) {
      if (spacer.querySelector("#hero") || spacer.querySelector("._pinnedSection_biyw3_1")) {
        spacer.style.height = heroH;
        spacer.style.minHeight = heroH;
        spacer.style.maxHeight = heroH;
        spacer.style.padding = "0";
        spacer.style.margin = "0";
        spacer.style.overflow = "visible";
      }
    });
  }

  function syncHeroMode() {
    var root = document.documentElement;
    if (isMobile()) {
      root.classList.add("agm-hero-is-mobile");
      setHeroMetrics();
      disableHeroScrollPin();
    } else {
      root.classList.remove("agm-hero-is-mobile");
      root.style.removeProperty("--agm-hero-h");
      root.style.removeProperty("--agm-appbar-h");
      root.style.removeProperty("--agm-hero-copy-h");
    }
  }

  /** Kill GSAP ScrollTrigger pin on mobile so seaLiving/range/below are reachable. */
  function disableHeroScrollPin() {
    if (!isMobile()) return false;

    var hero = document.querySelector("#hero");
    if (!hero) return false;

    var gsap = window.gsap;
    var ST = gsap && gsap.ScrollTrigger;
    var killed = false;

    if (ST) {
      ST.getAll().forEach(function (st) {
        var trigger = st.trigger;
        if (!trigger) return;
        if (trigger === hero || trigger.closest("#hero") || hero.contains(trigger)) {
          st.kill(true);
          killed = true;
        }
      });
      ST.refresh(true);
    }

    hero.querySelectorAll("._pinnedSection_biyw3_1").forEach(function (el) {
      el.style.position = "relative";
      el.style.top = "auto";
      el.style.left = "auto";
      el.style.right = "auto";
      el.style.width = "100%";
      el.style.transform = "none";
      el.style.zIndex = "auto";
    });

    document.querySelectorAll(".pin-spacer").forEach(function (spacer) {
      if (spacer.querySelector("#hero") || spacer.querySelector("._pinnedSection_biyw3_1")) {
        fixHeroPinSpacer();
        killed = true;
      }
    });

    ensureMobileScroll();

    return killed;
  }

  /** Keep native touch scroll working on mobile homepage. */
  function ensureMobileScroll() {
    if (!isMobile()) return;
    if (window.disableScroll) {
      window.disableScroll = false;
    }
    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "auto";
    }
    if (document.documentElement.style.overflow === "hidden") {
      document.documentElement.style.overflow = "auto";
    }
    var pinned = document.querySelector("#hero ._pinnedSection_biyw3_1");
    if (pinned && getComputedStyle(pinned).position === "fixed") {
      pinned.style.position = "relative";
      pinned.style.top = "auto";
      pinned.style.left = "auto";
      pinned.style.width = "100%";
      pinned.style.transform = "none";
    }
  }

  function schedulePinDisable() {
    if (!isMobile()) return;

    var attempts = 0;
    var stable = 0;
    var timer = setInterval(function () {
      attempts += 1;
      var pinned = document.querySelector("#hero ._pinnedSection_biyw3_1");
      var pinOk =
        pinned &&
        getComputedStyle(pinned).position !== "fixed" &&
        pinned.getBoundingClientRect().height > 200;
      disableHeroScrollPin();
      ensureMobileScroll();
      if (pinOk) {
        stable += 1;
      } else {
        stable = 0;
      }
      if (stable >= 3 || attempts >= 48) clearInterval(timer);
    }, 250);

    window.addEventListener(
      "load",
      function () {
        disableHeroScrollPin();
        ensureMobileScroll();
        fixHeroPinSpacer();
      },
      { once: true },
    );
  }

  function init() {
    syncHeroMode();
    schedulePinDisable();
    var mq = window.matchMedia(MQ);
    if (mq.addEventListener) {
      mq.addEventListener("change", syncHeroMode);
    } else if (mq.addListener) {
      mq.addListener(syncHeroMode);
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setHeroMetrics, 80);
    }
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", setHeroMetrics, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize, { passive: true });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setHeroMetrics);
    }

    var heroObserverTimer;
    function observeHero() {
      var hero = document.querySelector("#hero");
      if (!hero) return;
      new MutationObserver(function () {
        if (!isMobile()) return;
        clearTimeout(heroObserverTimer);
        heroObserverTimer = setTimeout(setHeroMetrics, 150);
      }).observe(hero, { childList: true, subtree: true, characterData: true });
    }
    observeHero();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
