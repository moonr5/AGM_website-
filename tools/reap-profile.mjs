import fs from "node:fs";

/**
 * Delete a headless Chrome profile directory, retrying until Chrome lets go.
 *
 * Chrome keeps CrashpadMetrics-active.pma open for a moment after exit, so an
 * immediate delete fails with EBUSY. Every tool here used to either skip the
 * cleanup or swallow that error, which left a profile behind on each run; they
 * accumulated to several gigabytes and twice filled the disk.
 */
export async function reapProfile(dir, attempts = 10) {
  for (let i = 0; i < attempts; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return true;
    } catch {}
  }
  console.warn(`could not remove temp profile, delete it by hand: ${dir}`);
  return false;
}
