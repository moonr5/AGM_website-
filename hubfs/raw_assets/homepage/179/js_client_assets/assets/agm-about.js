/**
 * About Us: header + glassmorphism service cards.
 * Re-applies if the island re-renders.
 */
(function () {
  var ABOUT = "/en/about/";
  var CARDS = [
    {
      badge: "Vessel Charter",
      metaLabel: "Service",
      meta: "Fleet 2025",
      title: "Crewboats ready for industrial, tourism, and fishing charters",
      blurb: "Daily, voyage, or monthly charter under certificated command.",
      src: "/en/images/services/charter-portrait.webp",
      alt: "AGM crewboat on charter",
      href: "/en/our-fleet/"
    },
    {
      badge: "Shipbuilding",
      metaLabel: "Service",
      meta: "Marunda Yard",
      title: "Custom FRP vessels built to client specification",
      blurb: "Length, arrangement, and machinery specified and finished at Marunda.",
      src: "/en/images/services/shipbuilding-portrait.webp",
      alt: "FRP vessel construction at Marunda shipyard",
      href: "/en/shipyard/"
    },
    {
      badge: "Marine Support",
      metaLabel: "Service",
      meta: "24/7 Operations",
      title: "Shorebase, logistics, and certified crew support",
      blurb: "The operations desk remains available at all hours for mobilisation.",
      src: "/en/images/services/support-portrait.webp",
      alt: "Marine support crew at harbour",
      href: "/en/services/"
    },
    {
      badge: "Repair & Maintenance",
      metaLabel: "Service",
      meta: "Marunda Yard",
      title: "Inspection, fiberglass repair, retrofit, and finishing",
      blurb: "Hull, engine, and electrical attendance for our vessels or yours.",
      src: "/en/images/services-hover/owner-care.jpg",
      alt: "Fiberglass hull repair at the Marunda yard",
      href: "/en/owner-care/"
    }
  ];

  function el(tag, className, attrs) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function buildCard(item) {
    var card = el("a", "agm-about-card", { href: item.href });
    var img = el("img", "agm-about-card-photo", {
      src: item.src,
      alt: item.alt,
      loading: "lazy"
    });
    var badge = el("span", "agm-about-badge", { text: item.badge });
    var glass = el("div", "agm-about-glass");
    var meta = el("div", "agm-about-meta");
    meta.appendChild(el("strong", "", { text: item.metaLabel }));
    meta.appendChild(document.createTextNode(" " + item.meta));
    var title = el("h3", "agm-about-card-title", { text: item.title });
    glass.appendChild(meta);
    glass.appendChild(title);
    if (item.blurb) {
      var blurb = el("p", "agm-about-blurb");
      blurb.appendChild(el("span", "", { text: item.blurb }));
      glass.appendChild(blurb);
    }
    glass.appendChild(el("span", "agm-about-more", { text: "Open" }));
    card.appendChild(img);
    card.appendChild(badge);
    card.appendChild(glass);
    return card;
  }

  function buildFx() {
    var fx = el("div", "agm-about-fx");
    fx.setAttribute("aria-hidden", "true");
    fx.appendChild(el("div", "agm-about-grid"));
    var radar = el("div", "agm-about-radar");
    radar.appendChild(el("span", "agm-about-radar-ring"));
    radar.appendChild(el("span", "agm-about-radar-ring"));
    radar.appendChild(el("span", "agm-about-radar-ring"));
    radar.appendChild(el("span", "agm-about-radar-cross"));
    radar.appendChild(el("span", "agm-about-radar-sweep"));
    fx.appendChild(radar);
    return fx;
  }

  function enhance() {
    if (document.getElementById("agm-about-host")) return true;

    var root = document.querySelector("#below ._container_1tsw7_1");
    if (!root) return false;

    if (!root.querySelector(".agm-about-fx")) {
      root.insertBefore(buildFx(), root.firstChild);
    }

    if (!root.querySelector(".agm-about-cards")) {
      var heading = root.querySelector("._headingContainer_1tsw7_15");
      var bottom = root.querySelector("._bottomContainer_1tsw7_37");
      var staleMedia = root.querySelector(".agm-about-media");
      if (staleMedia) staleMedia.remove();

      var head = el("div", "agm-about-head");
      if (heading) head.appendChild(heading);
      if (bottom) head.appendChild(bottom);

      var staleCopy = root.querySelector(".agm-about-copy");
      if (staleCopy) staleCopy.remove();

      var cards = el("div", "agm-about-cards");
      CARDS.forEach(function (item) {
        cards.appendChild(buildCard(item));
      });

      root.insertBefore(head, root.querySelector(".agm-about-fx").nextSibling);
      root.insertBefore(cards, head.nextSibling);
    }

    var cta = root.querySelector("._discover_1tsw7_51");
    if (cta) cta.setAttribute("href", ABOUT);

    root.classList.add("agm-about-ready");
    return true;
  }

  function watch() {
    var host = document.getElementById("below") || document.body;
    var observer = new MutationObserver(function () {
      enhance();
    });
    observer.observe(host, { childList: true, subtree: true });
    enhance();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
})();
