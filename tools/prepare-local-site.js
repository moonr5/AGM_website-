const fs = require("fs");
const https = require("https");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIT_ONLY = process.argv.includes("--audit-only");
const MAX_PARALLEL = 6;
const MAX_DOWNLOAD_BYTES = Number(process.env.MAX_DOWNLOAD_BYTES || 150 * 1024 * 1024);

const ASSET_HOSTS = new Set([
  "www.sanlorenzoyacht.com",
  "146466316.fs1.hubspotusercontent-eu1.net"
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function isTextFile(file) {
  try {
    const sample = fs.readFileSync(file).subarray(0, 4096);
    if (sample.includes(0)) return false;
    let control = 0;
    for (const byte of sample) {
      if (byte < 32 && ![9, 10, 13].includes(byte)) control += 1;
    }
    return sample.length === 0 || control / sample.length < 0.02;
  } catch {
    return false;
  }
}

function normalizeForUrlScan(text) {
  return text
    .replaceAll("\\u002F", "/")
    .replaceAll("\\/", "/")
    .replaceAll("&amp;", "&");
}

function localPathForUrl(rawUrl) {
  const fixed = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;
  let url;
  try {
    url = new URL(fixed);
  } catch {
    return null;
  }

  if (!ASSET_HOSTS.has(url.hostname)) return null;
  if (!url.pathname.startsWith("/hubfs/") && !url.pathname.startsWith("/hs/")) return null;

  const local = path.join(ROOT, url.pathname.replace(/^\/+/, ""));
  const relative = path.relative(ROOT, local);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;

  return local;
}

function collectAssetUrls(files) {
  const urls = new Map();
  const urlPattern = /(?:https?:)?\/\/(?:www\.sanlorenzoyacht\.com|146466316\.fs1\.hubspotusercontent-eu1\.net)\/[^\s"'<>]+/g;

  for (const file of files) {
    const text = normalizeForUrlScan(fs.readFileSync(file, "utf8"));
    for (const match of text.matchAll(urlPattern)) {
      const raw = match[0].replace(/[.;,]+$/, "");
      const local = localPathForUrl(raw);
      if (local) urls.set(raw.startsWith("//") ? `https:${raw}` : raw, local);
    }
  }

  return urls;
}

function cleanupStaleDownloads() {
  let removed = 0;
  for (const file of walk(ROOT)) {
    if (file.endsWith(".download")) {
      fs.rmSync(file, { force: true });
      removed += 1;
    }
  }
  return removed;
}

function localizeText(text) {
  return text
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
    .replaceAll("https:\\/\\/146466316.fs1.hubspotusercontent-eu1.net\\/hubfs\\/", "\\/hubfs\\/");
}

function rewriteFiles(files) {
  let changed = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    const after = localizeText(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed += 1;
    }
  }
  return changed;
}

function download(url, destination, redirects = 0) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const request = https.get(url, { headers: { "User-Agent": "agm-local-site/1.0" } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location && redirects < 5) {
        response.resume();
        const next = new URL(response.headers.location, url).toString();
        download(next, destination, redirects + 1).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        response.resume();
        resolve({ ok: false, url, status: response.statusCode });
        return;
      }

      const length = Number(response.headers["content-length"] || 0);
      if (length > MAX_DOWNLOAD_BYTES) {
        response.destroy();
        resolve({ ok: false, skipped: true, url, size: length });
        return;
      }

      const temp = `${destination}.download`;
      const stream = fs.createWriteStream(temp);
      let received = 0;
      response.on("data", (chunk) => {
        received += chunk.length;
        if (received > MAX_DOWNLOAD_BYTES) {
          request.destroy(new Error(`larger than ${MAX_DOWNLOAD_BYTES} bytes`));
        }
      });
      response.pipe(stream);
      stream.on("finish", () => {
        stream.close(() => {
          fs.renameSync(temp, destination);
          resolve({ ok: true, url });
        });
      });
      stream.on("error", (error) => {
        fs.rmSync(temp, { force: true });
        resolve({ ok: false, url, error: error.message });
      });
    });

    request.on("error", (error) => {
      fs.rmSync(`${destination}.download`, { force: true });
      resolve({ ok: false, url, error: error.message });
    });
    request.setTimeout(30000, () => {
      request.destroy(new Error("timeout"));
    });
  });
}

async function downloadMissing(urls) {
  const missing = [...urls.entries()].filter(([, local]) => !fs.existsSync(local));
  let completed = 0;
  let failed = 0;
  let skipped = 0;

  async function worker(queue) {
    while (queue.length) {
      const [url, local] = queue.shift();
      const result = await download(url, local);
      completed += 1;
      if (!result.ok) {
        if (result.skipped) {
          skipped += 1;
          console.warn(`skip ${(result.size / 1024 / 1024).toFixed(1)}MB: ${url}`);
        } else {
          failed += 1;
          console.warn(`miss ${result.status || result.error}: ${url}`);
        }
      }
      if (completed % 25 === 0 || completed === missing.length) {
        console.log(`downloaded ${completed}/${missing.length}`);
      }
    }
  }

  const queue = missing.slice();
  await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, queue.length) }, () => worker(queue)));
  return { missing: missing.length, failed, skipped };
}

function audit(files, urls) {
  const missing = [...urls.values()].filter((local) => !fs.existsSync(local));
  console.log(`Text files: ${files.length}`);
  console.log(`External localizable assets: ${urls.size}`);
  console.log(`Missing local assets: ${missing.length}`);
  if (missing.length) {
    for (const file of missing.slice(0, 20)) {
      console.log(`  ${path.relative(ROOT, file)}`);
    }
    if (missing.length > 20) console.log(`  ...and ${missing.length - 20} more`);
  }
}

(async () => {
  const textFiles = walk(ROOT).filter(isTextFile);
  const urls = collectAssetUrls(textFiles);

  if (AUDIT_ONLY) {
    audit(textFiles, urls);
    return;
  }

  const removed = cleanupStaleDownloads();
  console.log(`Found ${urls.size} localizable external assets.`);
  if (removed) console.log(`Removed stale temp downloads: ${removed}`);
  console.log(`Max asset download size: ${(MAX_DOWNLOAD_BYTES / 1024 / 1024).toFixed(0)}MB`);
  const result = await downloadMissing(urls);
  const changed = rewriteFiles(textFiles);

  console.log(`Downloaded missing assets: ${result.missing - result.failed - result.skipped}/${result.missing}`);
  console.log(`Skipped oversized assets: ${result.skipped}`);
  console.log(`Failed downloads: ${result.failed}`);
  console.log(`Localized text files: ${changed}`);
})();
