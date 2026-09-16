import type { VesselStatus, VesselType } from "../types/vessel";

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatClock(date = new Date()) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatCoord(value: number, axis: "lat" | "lon") {
  const abs = Math.abs(value).toFixed(6);
  const hemi = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${abs}° ${hemi}`;
}

export function formatNumber(value?: number, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatSpeed(kn: number) {
  return `${formatNumber(kn, 1)} kn`;
}

export function formatHeading(deg: number) {
  return `${String(Math.round(((deg % 360) + 360) % 360)).padStart(3, "0")}°`;
}

export function labelType(type: VesselType) {
  return type === "other" ? "Other" : type[0].toUpperCase() + type.slice(1);
}

export function labelStatus(status: VesselStatus) {
  if (status === "at_port") return "At Port";
  return status[0].toUpperCase() + status.slice(1);
}

export function relativeTime(iso: string) {
  const delta = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(delta / 60000));
  if (min < 1) return "just now";
  if (min === 1) return "1 min ago";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  return hr === 1 ? "1 hr ago" : `${hr} hr ago`;
}
