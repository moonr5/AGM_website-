const fs = require("fs");
const http = require("http");
const path = require("path");
const zlib = require("zlib");
const { pipeline } = require("stream");

const PORT = Number(process.env.PORT || 8080);
const ROOT = path.resolve(__dirname);
const GREEN_FALLBACK_IMAGE = path.join(ROOT, "hubfs", "placeholder-green.svg");
const PURPLE_FALLBACK_IMAGES = {
  landscape: path.join(ROOT, "en", "images", "fallback-purple", "purple-landscape.jpg"),
  portrait: path.join(ROOT, "en", "images", "fallback-purple", "purple-portrait.jpg"),
  square: path.join(ROOT, "en", "images", "fallback-purple", "purple-square.jpg"),
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf"
};

function isInsideRoot(candidate) {
  const relative = path.relative(ROOT, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function existsFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function isBackgroundAsset(pathname) {
  const value = (pathname || "").toLowerCase();
  return [
    "background",
    "hero",
    "banner",
    "voyaging_draft",
    "coasting_draft",
    "pioneering_draft",
    "loader-",
    "_loader",
  ].some((token) => value.includes(token));
}

function pickPurpleFallback(pathname) {
  const value = (pathname || "").toLowerCase();

  if (/(portrait|person|people|crew|vertical|mobile)/.test(value)) {
    return PURPLE_FALLBACK_IMAGES.portrait;
  }
  if (/(thumb|square|tile|card)/.test(value)) {
    return PURPLE_FALLBACK_IMAGES.square;
  }
  return PURPLE_FALLBACK_IMAGES.landscape;
}

const AGM_MOBILE_SNIPPET = [
  '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-mobile.css">',
  '<link rel="stylesheet" href="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-appbar.css">',
  '<script defer src="/hubfs/raw_assets/homepage/179/js_client_assets/assets/agm-mobile.js"></script>',
].join("\n");

function injectMobileAssets(html) {
  if (!html.includes("</head>") || html.includes("agm-mobile.css")) {
    return html;
  }
  return html.replace("</head>", `${AGM_MOBILE_SNIPPET}\n</head>`);
}

function localizeText(text) {
  return injectMobileAssets(
    text
    .replaceAll("/hubfs/", "/hubfs/")
    .replaceAll("/hs/", "/hs/")
    .replaceAll("/en/", "/en/")
    .replaceAll("/it/", "/it/")
    .replaceAll("/", "/")
    .replaceAll("/hubfs/", "/hubfs/")
    .replaceAll("/hubfs/", "/hubfs/")
    .replaceAll("/", "/")
    .replaceAll("/", "/")
    .replaceAll("/en/", "/en/")
    .replaceAll("/it/", "/it/")
    .replaceAll("#", "#")
    .replaceAll("/en/our-fleet/she", "/en/our-fleet/she")
    .replaceAll('data-removed-empty-href=""', 'data-removed-empty-data-removed-empty-href=""')
    .replaceAll("https:\\u002F\\u002Fwww.sanlorenzoyacht.com\\u002Fhubfs\\u002F", "\\u002Fhubfs\\u002F")
    .replaceAll("https:\\u002F\\u002Fwww.sanlorenzoyacht.com\\u002Fhs\\u002F", "\\u002Fhs\\u002F")
    .replaceAll("https:\\u002F\\u002Fwww.sanlorenzoyacht.com\\u002Fen\\u002F", "\\u002Fen\\u002F")
    .replaceAll("https:\\u002F\\u002Fwww.sanlorenzoyacht.com\\u002Fit\\u002F", "\\u002Fit\\u002F")
    .replaceAll("https:\\u002F\\u002F146466316.fs1.hubspotusercontent-eu1.net\\u002Fhubfs\\u002F", "\\u002Fhubfs\\u002F")
    .replaceAll("http:\\u002F\\u002Flocalhost:8080\\u002F", "\\u002F")
    .replaceAll("https:\\u002F\\u002Flocalhost:8080\\u002F", "\\u002F")
    .replaceAll("https:\\u002F\\u002Flocalhost:8080/", "\\u002F")
    .replaceAll("https:\\/\\/localhost:8080\\/", "\\/")
    .replaceAll("https:\\/\\/www.sanlorenzoyacht.com\\/hubfs\\/", "\\/hubfs\\/")
    .replaceAll("https:\\/\\/www.sanlorenzoyacht.com\\/hs\\/", "\\/hs\\/")
    .replaceAll("https:\\/\\/146466316.fs1.hubspotusercontent-eu1.net\\/hubfs\\/", "\\/hubfs\\/")
  );
}

function resolveRequest(url) {
  const parsed = new URL(url, `http://localhost:${PORT}`);
  let pathname = parsed.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep original pathname when malformed encoding is present.
  }

  if (pathname === "/brand-representative") {
    pathname = "/en/brand-representative";
  }
  if (pathname === "/charter" || pathname === "/charter/") {
    pathname = "/en/our-fleet";
  }
  if (pathname === "/p8.mp4" || pathname === "/en/p8.mp4") {
    const lite = path.join(ROOT, "en", "p8-lite.mp4");
    if (existsFile(lite)) return lite;
  }
  if (pathname === "/p61.svg" || pathname === "/en/p61.svg") {
    const png = path.join(ROOT, "en", "p61.png");
    if (existsFile(png)) return png;
  }

  // Mirrors the .htaccess rule: every page lives under /en/, but the imported
  // template still links to locale-less paths such as /our-fleet.
  const SECTIONS = new Set([
    "about", "blue-economy", "brand-representative", "compliance",
    "contacts", "corporate", "careers", "enquire", "fleet-charter", "investors",
    "news-and-events", "operations", "our-fleet", "owner-care", "people",
    "privacy-policy", "terms", "cookie-policy", "cookie-manager",
    "sea-cucumber-trade", "services", "shipyard",
    "sustainability", "marine-intelligence"
  ]);
  const firstSegment = pathname.replace(/^\/+/, "").split("/")[0];
  if (SECTIONS.has(firstSegment)) {
    const requested = path.join(ROOT, pathname.replace(/^\/+/, ""));
    if (!existsFile(requested) && !existsFile(path.join(requested, "index.html"))) {
      pathname = `/en/${firstSegment}`;
    }
  }

  const candidates = [];
  if (pathname === "/") {
    candidates.push("en/index.html");
  } else {
    const clean = pathname.replace(/^\/+/, "");
    candidates.push(clean);
    candidates.push(path.join(clean, "index.html"));

    const parts = clean.split("/");
    while (parts.length > 1) {
      parts.pop();
      candidates.push(parts.join("/"));
    }
  }

  for (const candidate of candidates) {
    const absolute = path.join(ROOT, candidate);
    if (isInsideRoot(absolute) && existsFile(absolute)) {
      return absolute;
    }
  }

  if (pathname.startsWith("/en/marine-intelligence")) {
    const spa = path.join(ROOT, "en", "marine-intelligence", "index.html");
    if (existsFile(spa)) return spa;
  }

  return null;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    const sample = fs.readFileSync(filePath, "utf8").slice(0, 128).trimStart().toLowerCase();
    if (sample.startsWith("<!doctype") || sample.startsWith("<html")) return MIME[".html"];
  } catch {
    // Binary files fall through to extension-based MIME.
  }

  if (ext) return MIME[ext] || "application/octet-stream";

  const relative = path.relative(ROOT, filePath).replaceAll("\\", "/");
  if (relative.startsWith("en/") || relative === "brand-representative") {
    return MIME[".html"];
  }
  return "application/octet-stream";
}

/* This is the review server, so markup and code are never cached.
 *
 * The previous values mirrored production: an hour for CSS and JS, a week for
 * media. That meant an edit could sit invisible in the browser long after the
 * file on disk had changed, because the cached HTML kept asking for the old
 * ?v= URLs. Media still caches, since those are replaced by name. */
function cacheControl(type) {
  if (type.startsWith("text/html")) return "no-store";
  if (/css|javascript|json/.test(type)) return "no-cache";
  if (/image|video|font|woff/.test(type)) return "public, max-age=604800";
  return "no-cache";
}

function wantsGzip(req) {
  return String(req.headers["accept-encoding"] || "").includes("gzip");
}

function send(res, status, body, type, req) {
  const headers = {
    "Content-Type": type,
    "Cache-Control": cacheControl(type),
  };
  let payload = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (req && wantsGzip(req) && /html|css|javascript|json|svg|xml/.test(type)) {
    payload = zlib.gzipSync(payload);
    headers["Content-Encoding"] = "gzip";
    headers["Vary"] = "Accept-Encoding";
  }
  headers["Content-Length"] = payload.length;
  res.writeHead(status, headers);
  res.end(payload);
}

function sendFile(req, res, filePath, type) {
  const stat = fs.statSync(filePath);
  const headers = {
    "Content-Type": type,
    "Cache-Control": cacheControl(type),
    "Accept-Ranges": "bytes",
  };

  const range = req.headers.range;
  if (range && stat.size > 0) {
    const match = String(range).match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = Number(match[1]);
      const end = Math.min(match[2] ? Number(match[2]) : stat.size - 1, stat.size - 1);
      headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
      headers["Content-Length"] = Math.max(0, end - start + 1);
      res.writeHead(206, headers);
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }
  }

  if (wantsGzip(req) && /html|css|javascript|json|svg|xml/.test(type)) {
    headers["Content-Encoding"] = "gzip";
    headers["Vary"] = "Accept-Encoding";
    res.writeHead(200, headers);
    pipeline(fs.createReadStream(filePath), zlib.createGzip(), res, () => {});
    return;
  }

  headers["Content-Length"] = stat.size;
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const ENQUIRE_TO = "corporate@stratconagaraglobal.com";
const FORMSUBMIT_URL = "https://formsubmit.co/ajax/61682d31a83783a04281843d3581c10f";

function formSubmitFields(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim();
  const phone = String(input.phone || "").trim();
  const service = String(input.service || "").trim();
  const subject = "New AGM enquiry — " + name + (service ? " — " + service : "");
  return {
    "Who wrote": name,
    "Their email": email,
    "Their phone": phone || "Not given",
    About: service || "General enquiry",
    "What they wrote": String(input.message || "").trim(),
    _subject: subject,
    _template: "box",
    _captcha: "false",
    _replyto: email,
    _autoresponse: "Thank you for writing to PT. Agara Global Maritim. We have received your enquiry and will reply shortly.",
  };
}

function formSubmitAccepted(body) {
  if (!body || typeof body !== "object") return false;
  if (body.success === true || body.success === "true") return true;
  const note = String(body.message || "");
  return /activat|confirm|verify/i.test(note);
}

async function deliverEnquire(input) {
  const res = await fetch(FORMSUBMIT_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: "https://agmaritim.com",
      Referer: "https://agmaritim.com/en/enquire/",
    },
    body: JSON.stringify(formSubmitFields(input)),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.ok && formSubmitAccepted(body)) {
    return { mailed: true, via: "formsubmit" };
  }
  throw new Error((body && body.message) || "The mailbox could not be reached.");
}

function handleEnquire(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, JSON.stringify({ ok: false, error: "Send the enquiry form to this address." }), MIME[".json"], req);
  }

  readBody(req, 64 * 1024)
    .then(async (raw) => {
      const type = String(req.headers["content-type"] || "");
      let input = {};
      if (type.includes("application/json")) {
        input = JSON.parse(raw || "{}");
      } else {
        input = Object.fromEntries(new URLSearchParams(raw));
      }
      if (String(input.website || "").trim()) {
        return send(res, 200, JSON.stringify({ ok: true }), MIME[".json"], req);
      }

      const name = String(input.name || "").trim();
      const email = String(input.email || "").trim();
      const phone = String(input.phone || "").trim();
      const service = String(input.service || "").trim();
      const message = String(input.message || "").trim();
      if (!name || !email || !message) {
        return send(res, 400, JSON.stringify({ ok: false, error: "Please add your name, email, and a short message." }), MIME[".json"], req);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return send(res, 400, JSON.stringify({ ok: false, error: "Please use a valid email address so we can reply." }), MIME[".json"], req);
      }

      const dir = path.join(ROOT, "storage", "enquiries");
      fs.mkdirSync(dir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const record = {
        at: new Date().toISOString(),
        name,
        email,
        phone,
        service,
        message,
        local: true,
      };
      fs.writeFileSync(path.join(dir, `${stamp}.json`), JSON.stringify(record, null, 2));

      const delivery = await deliverEnquire({ name, email, phone, service, message });
      console.log(`Enquiry mailed for ${email} → ${ENQUIRE_TO} via ${delivery.via}`);
      return send(res, 200, JSON.stringify({ ok: true, mailed: true, via: delivery.via }), MIME[".json"], req);
    })
    .catch((err) => {
      const msg = err && err.message ? err.message : "The form could not be read.";
      const status = /mailbox|formsubmit|fetch|network/i.test(msg) ? 502 : 400;
      console.error(`Enquiry send failed: ${msg}`);
      send(res, status, JSON.stringify({
        ok: false,
        mailed: false,
        error: status === 502
          ? "The mailbox could not be reached. Please email corporate@stratconagaraglobal.com or call +62 819-231-001."
          : msg,
      }), MIME[".json"], req);
    });
}

function readLocalEnv() {
  const file = path.join(ROOT, "marine-intelligence", ".env");
  const out = {};
  if (!existsFile(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) out[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function handleOpenWaters(req, res, parsedUrl) {
  const bbox = parsedUrl.searchParams.get("bbox") || "";
  if (!/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(bbox)) {
    return send(res, 400, JSON.stringify({ error: "bbox", message: "bbox must be minLat,minLon,maxLat,maxLon." }), MIME[".json"], req);
  }
  const dest = `https://ais.openwaters.io/v1/vessels?bbox=${bbox}`;
  fetch(dest, { headers: { Accept: "application/geo+json, application/json" } })
    .then(async (upstream) => {
      const body = await upstream.text();
      send(res, upstream.status, body, MIME[".json"], req);
    })
    .catch((err) => {
      send(res, 502, JSON.stringify({
        error: "upstream",
        message: err && err.message ? err.message : "Live AIS could not be reached.",
      }), MIME[".json"], req);
    });
}

function handleDataDocked(req, res, parsedUrl) {
  const env = readLocalEnv();
  const key = process.env.DATADOCKED_API_KEY || env.DATADOCKED_API_KEY || "";
  if (!key) {
    return send(res, 401, JSON.stringify({
      error: "unauthorized",
      message: "No Data Docked key configured. Set DATADOCKED_API_KEY.",
    }), MIME[".json"], req);
  }
  const destPath = parsedUrl.pathname.replace(/^\/api\/datadocked/, "") || "/";
  const dest = `https://datadocked.com/api/vessels_operations${destPath}${parsedUrl.search}`;
  fetch(dest, { headers: { Accept: "application/json", "x-api-key": key } })
    .then(async (upstream) => {
      const body = await upstream.text();
      send(res, upstream.status, body, MIME[".json"], req);
    })
    .catch((err) => {
      send(res, 502, JSON.stringify({
        error: "upstream",
        message: err && err.message ? err.message : "Data Docked could not be reached.",
      }), MIME[".json"], req);
    });
}

const server = http.createServer((req, res) => {
  // Intercept HubSpot dealer API — return single placeholder to suppress error
  if (req.url === "/api/dealers") {
    return send(res, 200, '{"results":[{"id":"placeholder","values":{"name":"","latitude":0,"longitude":0,"office":"","office_address":"","phone_number":"","email":""}}]}', MIME[".json"], req);
  }

  const parsedUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep original pathname when malformed encoding is present.
  }

  if (pathname === "/api/enquire.php" || pathname === "/api/enquire") {
    return handleEnquire(req, res);
  }
  if (pathname.startsWith("/api/datadocked")) {
    return handleDataDocked(req, res, parsedUrl);
  }
  if (pathname === "/api/ais/vessels") {
    return handleOpenWaters(req, res, parsedUrl);
  }
  if (pathname.toLowerCase().endsWith(".php")) {
    return send(res, 501, JSON.stringify({ ok: false, error: "This sender runs on the live Hostinger site." }), MIME[".json"], req);
  }

  const filePath = resolveRequest(req.url || "/");

  if (!filePath) {
    const ext = path.extname(pathname).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
      // Keep background placeholders as originally styled.
      if ((ext === ".svg" || isBackgroundAsset(pathname)) && existsFile(GREEN_FALLBACK_IMAGE)) {
        return send(res, 200, fs.readFileSync(GREEN_FALLBACK_IMAGE), MIME[".svg"], req);
      }

      const purpleFallback = pickPurpleFallback(pathname);
      if (existsFile(purpleFallback)) {
        return send(res, 200, fs.readFileSync(purpleFallback), MIME[".jpg"], req);
      }

      if (existsFile(GREEN_FALLBACK_IMAGE)) {
        return send(res, 200, fs.readFileSync(GREEN_FALLBACK_IMAGE), MIME[".svg"], req);
      }
    }
    if (ext === ".css") return send(res, 200, "", MIME[".css"], req);
    if ([".js", ".mjs"].includes(ext)) return send(res, 200, "", MIME[".js"], req);
    return send(res, 404, "Not found", "text/plain; charset=utf-8", req);
  }

  const type = contentType(filePath);

  if (type.startsWith("text/html") || type.startsWith("text/css") || type.startsWith("application/javascript")) {
    return send(res, 200, localizeText(fs.readFileSync(filePath, "utf8")), type, req);
  }

  sendFile(req, res, filePath, type);
});

server.listen(PORT, () => {
  console.log(`AGM local site running at http://localhost:${PORT}/`);
  console.log(`Serving ${ROOT}`);
});
