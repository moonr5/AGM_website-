(function () {
  function setViewportHeight() {
    document.documentElement.style.setProperty("--agm-vh", window.innerHeight + "px");
  }

  function setAppbarHeight() {
    var bar = document.querySelector(".appbar-wrapper");
    if (!bar) {
      document.documentElement.style.removeProperty("--agm-appbar-h");
      return;
    }
    document.documentElement.style.setProperty(
      "--agm-appbar-h",
      Math.max(54, Math.ceil(bar.getBoundingClientRect().height)) + "px"
    );
  }

  function setAppbarScrolled() {
    var bars = document.querySelectorAll(".appbar-wrapper");
    if (!bars.length) return;
    var hero = document.querySelector(".agm-hero, #hero, #hs_cos_wrapper_hero");
    var overHero = hero ? hero.getBoundingClientRect().bottom > 90 : false;
    var scrolled = window.scrollY > 16 && !overHero;
    bars.forEach(function (bar) {
      bar.classList.toggle("is-scrolled", scrolled);
    });
  }

  function ensureViewportMeta() {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    const content = meta.getAttribute("content") || "";
    let next = content;

    if (!/width=device-width/.test(next)) {
      next = "width=device-width, initial-scale=1" + (next ? ", " + next : "");
    }
    if (!/viewport-fit=cover/.test(next)) {
      next += ", viewport-fit=cover";
    }

    meta.setAttribute("content", next);
  }

  function init() {
    ensureViewportMeta();
    setViewportHeight();
    setAppbarHeight();
    setAppbarScrolled();
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

    playHeroVideos();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) playHeroVideos();
    });
    new MutationObserver(playHeroVideos).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
