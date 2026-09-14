import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function report(label, before, after) {
  const saved = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  console.log(`  ${label}: ${kb(before)} → ${kb(after)} (${saved}% smaller)`);
}

async function knockoutBlack(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    if (max < 36) data[i + 3] = 0;
    else if (max < 70 && max - min < 14) {
      data[i + 3] = Math.round(((max - 36) / 34) * 255);
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function optimizeLogo() {
  const svgPath = join(ROOT, "en", "p61.svg");
  const svg = readFileSync(svgPath, "utf8");
  const matches = [...svg.matchAll(/data:image\/png;base64,([A-Za-z0-9+/=]+)/g)];
  if (!matches.length) throw new Error("No PNG embeds in p61.svg");

  const embeds = matches.map((m) => Buffer.from(m[1], "base64"));
  const source = embeds.sort((a, b) => b.length - a.length)[0];
  const pipeline = (await knockoutBlack(source)).trim().resize({
    height: 160,
    withoutEnlargement: true,
  });

  const pngPath = join(ROOT, "en", "p61.png");
  const favPath = join(ROOT, "en", "favicon.png");
  await pipeline.clone().png({ compressionLevel: 9, palette: true }).toFile(pngPath);
  await pipeline
    .clone()
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(favPath);

  report("logo p61.png", source.length, readFileSync(pngPath).length);
  report("favicon.png", source.length, readFileSync(favPath).length);
}

async function toWebp(srcRel, destRel, width, quality = 72) {
  const src = join(ROOT, srcRel);
  const dest = join(ROOT, destRel);
  if (!existsSync(src)) {
    console.warn(`  skip missing ${srcRel}`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  const before = readFileSync(src).length;
  await sharp(src)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(dest);
  report(destRel, before, readFileSync(dest).length);
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit", windowsHide: true });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed with code ${result.status}`);
  }
}

function optimizeHeroVideo() {
  const src = join(ROOT, "en", "p8.mp4");
  const lite = join(ROOT, "en", "p8-lite.mp4");
  const posterJpg = join(ROOT, "en", "hero-poster.jpg");
  if (!existsSync(src)) {
    console.warn("  skip hero video — en/p8.mp4 missing");
    return;
  }

  runFfmpeg([
    "-y",
    "-i",
    src,
    "-an",
    "-t",
    "8",
    "-vf",
    "scale='min(1280,iw)':-2,fps=24",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "32",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    lite,
  ]);

  runFfmpeg([
    "-y",
    "-ss",
    "0.4",
    "-i",
    existsSync(lite) ? lite : src,
    "-frames:v",
    "1",
    "-q:v",
    "4",
    posterJpg,
  ]);

  report("p8-lite.mp4", readFileSync(src).length, readFileSync(lite).length);
}

async function optimizePoster() {
  const jpg = join(ROOT, "en", "hero-poster.jpg");
  const webp = join(ROOT, "en", "hero-poster.webp");
  const fallback = join(ROOT, "en", "images", "services", "charter-portrait.jpg");
  const src = existsSync(jpg) ? jpg : fallback;
  if (!existsSync(src)) return;
  const before = readFileSync(src).length;
  await sharp(src)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 68, effort: 6 })
    .toFile(webp);
  report("hero-poster.webp", before, readFileSync(webp).length);
  if (existsSync(jpg) && jpg !== src) {
    try {
      unlinkSync(jpg);
    } catch {
      // keep poster jpg if unlink fails
    }
  }
}

async function main() {
  console.log("Optimizing media for first paint...");
  await optimizeLogo();
  await toWebp("en/images/services/charter-portrait.jpg", "en/images/services/charter-portrait.webp", 900, 70);
  await toWebp("en/images/services/shipbuilding-portrait.jpg", "en/images/services/shipbuilding-portrait.webp", 900, 70);
  await toWebp("en/images/services/support-portrait.jpg", "en/images/services/support-portrait.webp", 900, 70);
  await toWebp(
    "en/images/service-backgrounds/crewboat-charter-bg.jpg",
    "en/images/service-backgrounds/crewboat-charter-bg.webp",
    1600,
    68,
  );
  await toWebp(
    "en/images/service-backgrounds/frp-shipbuilding-bg.jpg",
    "en/images/service-backgrounds/frp-shipbuilding-bg.webp",
    1600,
    68,
  );
  await toWebp(
    "en/images/service-backgrounds/marine-support-bg.jpg",
    "en/images/service-backgrounds/marine-support-bg.webp",
    1600,
    68,
  );
  await toWebp("en/p2.png", "en/p2.webp", 1600, 70);
  await toWebp("en/p1.png", "en/p1.webp", 1400, 72);
  await toWebp("en/p4.png", "en/p4.webp", 1400, 72);
  await toWebp("en/p5.png", "en/p5.webp", 1600, 74);
  optimizeHeroVideo();
  await optimizePoster();

  for (const extra of ["en/_logo-extract-1.png", "en/_logo-extract-2.png"]) {
    const abs = join(ROOT, extra);
    if (existsSync(abs)) unlinkSync(abs);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
