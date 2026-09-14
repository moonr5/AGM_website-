/**
 * Replace seaLiving center videos with still photos and keep them
 * in place if the island re-renders.
 */
(function () {
  var PHOTOS = {
    charter: {
      src: "/en/images/services/charter-portrait.webp",
      alt: "AGM crewboat charter in tropical waters"
    },
    shipbuilding: {
      src: "/en/images/services/shipbuilding-portrait.webp",
      alt: "FRP vessel construction at Marunda shipyard"
    },
    support: {
      src: "/en/images/services/support-portrait.webp",
      alt: "Marine support operations with certified crew"
    }
  };
  var ORDER = ["charter", "shipbuilding", "support"];

  function pickKey(src, index) {
    var value = (src || "").toLowerCase();
    if (value.indexOf("shipbuilding") !== -1) return "shipbuilding";
    if (value.indexOf("marine-support") !== -1 || value.indexOf("support") !== -1) return "support";
    if (value.indexOf("charter") !== -1) return "charter";
    return ORDER[index] || "charter";
  }

  function mediaSrc(node) {
    if (!node) return "";
    var bits = [node.currentSrc || "", node.src || ""];
    node.querySelectorAll("source").forEach(function (source) {
      bits.push(source.src || "");
    });
    return bits.join(" ");
  }

  function replaceBox(box, index) {
    if (!box) return;
    var existing = box.querySelector("img.agm-service-photo");
    var video = box.querySelector("video");
    if (existing) {
      if (video) video.remove();
      return;
    }
    var media = video || box.querySelector("img");
    var key = pickKey(mediaSrc(media), index);
    var photo = PHOTOS[key];
    var img = document.createElement("img");
    img.className = "agm-service-photo";
    img.src = photo.src;
    img.alt = photo.alt;
    img.decoding = "async";
    if (media && media.tagName === "VIDEO") {
      try { media.pause(); } catch (e) {}
      media.removeAttribute("src");
      media.querySelectorAll("source").forEach(function (source) {
        source.remove();
      });
      media.load();
      media.replaceWith(img);
      return;
    }
    if (media) media.replaceWith(img);
    else box.appendChild(img);
  }

  function enhance() {
    var root = document.querySelector("#seaLiving");
    if (!root) return false;
    var boxes = root.querySelectorAll("._imgBox_1im41_154");
    if (!boxes.length) return false;
    boxes.forEach(replaceBox);
    root.classList.add("agm-services-ready");
    return true;
  }

  function watch() {
    var root = document.querySelector("#seaLiving");
    if (!root) return;
    enhance();
    new MutationObserver(function () {
      enhance();
    }).observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch, { once: true });
  } else {
    watch();
  }
})();
