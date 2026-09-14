/**
 * AGM homepage sections — mobile only (max-width: 768px).
 * Keeps seaLiving scroll-pinned 3-slide carousel working after island hydration.
 */
(function () {
  var MQ = "(max-width: 768px)";

  function isMobile() {
    return window.matchMedia(MQ).matches;
  }

  function getScrollTrigger() {
    return window.gsap && window.gsap.ScrollTrigger;
  }

  function refreshSeaLivingPin() {
    if (!isMobile()) return;

    var container = document.querySelector("#seaLiving ._container_1im41_1");
    if (!container) return;

    var ST = getScrollTrigger();
    if (!ST) return;

    ST.getAll().forEach(function (st) {
      if (st.trigger === container) {
        st.refresh();
      }
    });
    ST.refresh(true);
  }

  function scheduleSeaLivingRefresh() {
    if (!isMobile()) return;

    [2200, 3200, 4500].forEach(function (delay) {
      setTimeout(refreshSeaLivingPin, delay);
    });
  }

  function watchSeaLivingHydration() {
    var root = document.querySelector("#seaLiving");
    if (!root) return;

    var hydrated = false;

    function onHydrated() {
      if (!isMobile() || hydrated) return;
      if (!root.querySelector("._container_1im41_1")) return;
      hydrated = true;
      scheduleSeaLivingRefresh();
    }

    new MutationObserver(onHydrated).observe(root, { childList: true, subtree: true });
    onHydrated();
  }

  function init() {
    if (!isMobile()) return;

    watchSeaLivingHydration();

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshSeaLivingPin, 120);
    }
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize, { passive: true });
    }
    window.addEventListener("load", refreshSeaLivingPin, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
