(function () {
  function splitLines(el) {
    return el.innerHTML
      .split(/<br\s*\/?>/gi)
      .map(function (s) {
        return s.replace(/<[^>]+>/g, "").trim();
      })
      .filter(Boolean);
  }

  function formatManifest() {
    var root = document.querySelector("#hero");
    if (!root) return;

    var textEl = root.querySelector("._text_174va_29");
    if (!textEl || textEl.dataset.agmFormatted === "1") return;

    var lines = splitLines(textEl);
    if (!lines.length) return;

    var name = lines[0];
    var tagline = lines[1] || "";
    var body = lines.slice(2).join(" ");

    textEl.dataset.agmFormatted = "1";
    textEl.classList.add("agm-manifest-text");
    textEl.innerHTML =
      '<span class="agm-manifest-name">' +
      name +
      "</span>" +
      (tagline
        ? '<span class="agm-manifest-tagline">' + tagline + "</span>"
        : "") +
      (body ? '<span class="agm-manifest-body">' + body + "</span>" : "");
  }

  function run() {
    formatManifest();
    var root = document.querySelector("#hero");
    if (!root || root.dataset.agmManifestWatch === "1") return;
    root.dataset.agmManifestWatch = "1";
    new MutationObserver(formatManifest).observe(root, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
