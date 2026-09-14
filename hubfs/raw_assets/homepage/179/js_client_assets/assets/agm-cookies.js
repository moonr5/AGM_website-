/**
 * Cookie preference banner and the Cookie Manager page.
 * Stores a single JSON record in localStorage; necessary items stay on.
 */
(function () {
  var KEY = "agm-cookie-prefs";

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return {
        necessary: true,
        analytics: !!data.analytics,
        marketing: !!data.marketing
      };
    } catch (err) {
      return null;
    }
  }

  function write(prefs) {
    var next = {
      necessary: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      at: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(next));
    document.documentElement.setAttribute("data-agm-analytics", next.analytics ? "1" : "0");
    document.documentElement.setAttribute("data-agm-marketing", next.marketing ? "1" : "0");
    return next;
  }

  function apply(prefs) {
    if (!prefs) return;
    document.documentElement.setAttribute("data-agm-analytics", prefs.analytics ? "1" : "0");
    document.documentElement.setAttribute("data-agm-marketing", prefs.marketing ? "1" : "0");
  }

  function hideBar() {
    var bar = document.getElementById("agm-cookie-bar");
    if (bar) bar.remove();
    document.documentElement.classList.remove("agm-has-cookie");
  }

  function showBar() {
    if (document.getElementById("agm-cookie-bar")) return;
    var bar = document.createElement("div");
    bar.id = "agm-cookie-bar";
    bar.className = "agm-cookie-bar";
    var T = window.AGM_I18N && window.AGM_I18N.t;
    var title = T ? T("cookie.title") : "Cookies on this site";
    var copy = T ? T("cookie.copy") : "We use necessary cookies so the forms work. Analytics and marketing stay off unless you allow them.";
    var accept = T ? T("cookie.accept") : "Accept all";
    var reject = T ? T("cookie.reject") : "Necessary only";
    var manage = T ? T("nav.cookiemgr") : "Cookie Manager";
    bar.innerHTML =
      '<div class="agm-cookie-bar-copy">' +
      "<strong data-i18n=\"cookie.title\">" + title + "</strong>" +
      "<p data-i18n=\"cookie.copy\">" + copy + "</p>" +
      "</div>" +
      '<div class="agm-cookie-bar-actions">' +
      '<button type="button" class="agm-cookie-bar-btn is-solid" data-agm-cookie="accept" data-i18n="cookie.accept">' + accept + "</button>" +
      '<button type="button" class="agm-cookie-bar-btn" data-agm-cookie="reject" data-i18n="cookie.reject">' + reject + "</button>" +
      '<a class="agm-cookie-bar-btn" href="/en/cookie-manager/" data-i18n="nav.cookiemgr">' + manage + "</a>" +
      "</div>";
    document.body.appendChild(bar);
    document.documentElement.classList.add("agm-has-cookie");
    bar.addEventListener("click", function (event) {
      var action = event.target.getAttribute("data-agm-cookie");
      if (!action) return;
      if (action === "accept") write({ analytics: true, marketing: true });
      if (action === "reject") write({ analytics: false, marketing: false });
      hideBar();
    });
  }

  function bindManager() {
    var form = document.getElementById("agm-cookie-form");
    if (!form) return;
    var analytics = document.getElementById("agm-cookie-analytics");
    var marketing = document.getElementById("agm-cookie-marketing");
    var status = document.getElementById("agm-cookie-status");
    var prefs = read() || { analytics: false, marketing: false };
    if (analytics) analytics.checked = prefs.analytics;
    if (marketing) marketing.checked = prefs.marketing;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      write({
        analytics: !!(analytics && analytics.checked),
        marketing: !!(marketing && marketing.checked)
      });
      hideBar();
      if (status) {
        status.hidden = false;
        status.className = "agm-form-status is-ok";
        status.textContent = "Your cookie choices have been saved on this device.";
      }
    });
  }

  function start() {
    var prefs = read();
    apply(prefs);
    bindManager();
    if (!prefs && !document.getElementById("agm-cookie-form")) showBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
