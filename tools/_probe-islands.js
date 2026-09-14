(async () => {
  await new Promise((r) => setTimeout(r, 6000));
  const rows = [];
  const list = window.__islands || [];
  rows.push("window.__islands: " + list.length);
  list.forEach((i) => {
    rows.push("  id=" + i.id + "  hydrateOn=" + i.hydrateOn + "  status=" + i.hydrationStatus);
  });
  const below = document.getElementById("below");
  rows.push("");
  rows.push("#below markup length: " + (below ? below.innerHTML.length : "no #below element"));
  rows.push("#below child count  : " + (below ? below.children.length : "-"));
  rows.push("services row present: " + !!document.querySelector("#below ._main_mirx2_1"));
  rows.push("about container     : " + !!document.querySelector("#below ._container_1tsw7_1"));
  rows.push("document height     : " + document.body.scrollHeight);
  return rows.join("\n");
})()
