/**
 * Small live AIS teaser. Loads Leaflet only when the block is on screen,
 * then plots a Jakarta box from /api/ais/vessels.
 */
(function () {
  var LEAFLET_CSS = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
  var LEAFLET_JS = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
  var TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
  var DEFAULT_BBOX = "-6.35,106.50,-5.78,107.25";
  var YARD = [-6.098, 106.962];
  var MAX_DOTS = 120;
  var leafletWait = null;

  function label(n) {
    var raw = window.AGM_I18N && typeof window.AGM_I18N.t === "function"
      ? window.AGM_I18N.t("livemap.ships")
      : "{n} ships";
    return String(raw || "{n} ships").replace("{n}", String(n));
  }

  function loadCss(href) {
    if (document.querySelector('link[data-agm-livemap-css="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-agm-livemap-css", href);
    document.head.appendChild(link);
  }

  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    if (leafletWait) return leafletWait;
    loadCss(LEAFLET_CSS);
    leafletWait = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = LEAFLET_JS;
      script.onload = function () { resolve(); };
      script.onerror = function () { leafletWait = null; reject(new Error("leaflet")); };
      document.head.appendChild(script);
    });
    return leafletWait;
  }

  function readPoints(body) {
    var list = [];
    var features = body && body.features;
    if (!Array.isArray(features)) return list;
    features.forEach(function (feature) {
      var coords = feature && feature.geometry && feature.geometry.coordinates;
      if (!coords || coords.length < 2) return;
      var lng = Number(coords[0]);
      var lat = Number(coords[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      list.push({ lat: lat, lng: lng });
    });
    return list;
  }

  function mount(root) {
    var canvas = root.querySelector("[data-agm-livemap-canvas]");
    var countEl = root.querySelector("[data-agm-livemap-count]");
    if (!canvas || canvas.dataset.ready === "1") return;
    canvas.dataset.ready = "1";

    var bbox = root.getAttribute("data-bbox") || DEFAULT_BBOX;
    var center = (root.getAttribute("data-center") || "-6.05,106.88").split(",");
        var zoom = Number(root.getAttribute("data-zoom") || 10) || 10;
    var lastCount = 0;

    function writeCount(n) {
      lastCount = n;
      if (countEl) countEl.textContent = n ? label(n) : "";
    }

    loadLeaflet().then(function () {
      var map = window.L.map(canvas, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false,
      }).setView([Number(center[0]) || -6.05, Number(center[1]) || 106.88], zoom);

      window.L.tileLayer(TILE, { maxZoom: 16 }).addTo(map);
      var dots = window.L.layerGroup().addTo(map);

      window.L.circleMarker(YARD, {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: "#96f878",
        fillOpacity: 1,
      }).addTo(map);

      function draw(points) {
        dots.clearLayers();
        points.slice(0, MAX_DOTS).forEach(function (point) {
          window.L.circleMarker([point.lat, point.lng], {
            radius: 3.5,
            color: "#fff",
            weight: 1,
            fillColor: "#0a62a8",
            fillOpacity: 0.95,
          }).addTo(dots);
        });
        writeCount(points.length);
      }

      function load() {
        fetch("/api/ais/vessels?bbox=" + encodeURIComponent(bbox), {
          headers: { Accept: "application/json" },
        })
          .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
          .then(function (body) { draw(readPoints(body)); })
          .catch(function () {});
      }

      load();
      window.setInterval(load, 60000);
      window.setTimeout(function () { map.invalidateSize(); }, 240);
      document.addEventListener("agm:lang", function () { writeCount(lastCount); });
    }).catch(function () {});
  }

  function watch(root) {
    if (!("IntersectionObserver" in window)) {
      mount(root);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.disconnect();
        mount(root);
      });
    }, { rootMargin: "160px" });
    io.observe(root);
  }

  function start() {
    document.querySelectorAll("[data-agm-livemap]").forEach(watch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
