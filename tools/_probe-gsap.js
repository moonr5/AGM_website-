(() => {
  const hits = Object.keys(window).filter((k) =>
    /gsap|scrolltrigger|smooth|lenis|locomotive/i.test(k)
  );
  const st = window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger);
  const lines = [
    "window.gsap          : " + typeof window.gsap,
    "window.ScrollTrigger : " + typeof window.ScrollTrigger,
    "matching globals     : " + (hits.length ? hits.join(", ") : "(none)")
  ];
  if (st && typeof st.getAll === "function") {
    const all = st.getAll();
    lines.push("ScrollTriggers       : " + all.length);
    all.forEach((t, i) => {
      const trig = t.trigger;
      const pin = t.pin;
      const desc = (el) =>
        el
          ? el.tagName.toLowerCase() +
            (el.id ? "#" + el.id : "") +
            (el.className && typeof el.className === "string"
              ? "." + el.className.trim().split(/\s+/).join(".")
              : "")
          : "none";
      lines.push(
        "  [" + i + "] trigger=" + desc(trig) + "  pin=" + desc(pin) +
        "  inBelow=" + !!(trig && trig.closest && trig.closest("#below"))
      );
    });
  } else {
    lines.push("ScrollTriggers       : ScrollTrigger not reachable from window");
  }
  return lines.join("\n");
})()
