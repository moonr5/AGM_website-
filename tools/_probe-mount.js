(async () => {
  const rows = [];
  let mountAt = null;
  let finalAt = null;
  let lastH = -1;
  const stamp = () => Math.round(performance.now());
  for (let i = 0; i < 60; i++) {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const el = document.querySelector("#below ._main_mirx2_1");
    if (el && mountAt === null) mountAt = stamp();
    if (h !== lastH) {
      rows.push(String(stamp()).padStart(6) + "ms  docH=" + String(h).padStart(6));
      lastH = h;
      finalAt = stamp();
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  rows.push("");
  rows.push("services row first in DOM : " + (mountAt === null ? "never" : mountAt + "ms"));
  rows.push("document height last grew : " + finalAt + "ms");
  rows.push("settled height            : " + lastH);
  return rows.join("\n");
})()
