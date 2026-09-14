(function () {
  // Lazy playback for the remaining page videos. The hero no longer has any —
  // it is drawn as inline SVG — so every video here is below the fold.

  function normalizeVideoSrc(src) {
    if (!src) return src;
    try {
      const url = new URL(src, window.location.origin);
      if (url.pathname.startsWith("/videos/services/")) {
        url.pathname = `/en${url.pathname}`;
        return url.pathname;
      }
      if (/^\/p[789]\.mp4$/.test(url.pathname)) {
        url.pathname = `/en${url.pathname}`;
        return url.pathname;
      }
      return url.pathname + url.search;
    } catch (e) {
      if (src.startsWith("/videos/services/")) return `/en${src}`;
      if (/^\/p[789]\.mp4$/.test(src)) return `/en${src}`;
      return src;
    }
  }

  function fixVideoSources(root) {
    root.querySelectorAll("video source[src], video[src]").forEach((node) => {
      const current = node.getAttribute("src");
      const fixed = normalizeVideoSrc(current);
      if (fixed && fixed !== current) {
        node.setAttribute("src", fixed);
      }
    });
  }

  function enhance(node) {
    if (!(node instanceof HTMLVideoElement) || node.dataset.agmSmooth) return;
    node.dataset.agmSmooth = "1";
    node.muted = true;
    node.playsInline = true;
    node.setAttribute("playsinline", "");
    node.preload = "none";
    fixVideoSources(node);

    let primed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!primed) {
            primed = true;
            node.preload = "auto";
            node.load();
          }
          node.play().catch(() => {});
        } else {
          node.pause();
        }
      },
      { threshold: 0.12, rootMargin: "120px 0px" },
    );

    observer.observe(node);
  }

  function scan(root) {
    fixVideoSources(root);
    root.querySelectorAll("video").forEach(enhance);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => scan(document), { once: true });
  } else {
    scan(document);
  }

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLVideoElement) enhance(node);
        else if (node instanceof Element) scan(node);
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
