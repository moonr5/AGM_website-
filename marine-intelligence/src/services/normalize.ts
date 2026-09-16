import type { PortActivity, TrackPoint, Vessel, VesselStatus, VesselType } from "../types/vessel";
import type { Port } from "../types/vessel";

export function mapType(raw?: string): VesselType {
  const t = String(raw || "").toLowerCase();
  if (/tanker|oil|chemical|product/.test(t)) return "tanker";
  if (/container|bulk|cargo|general|ro-?ro|reefer/.test(t)) return "cargo";
  if (/tug|pusher/.test(t)) return "tug";
  if (/passenger|ferry|cruise/.test(t)) return "passenger";
  if (/fish/.test(t)) return "fishing";
  return "other";
}

export function mapStatus(raw?: string, speed = 0): VesselStatus {
  const s = String(raw || "").toLowerCase();
  if (/moor|bert|in port|alongside/.test(s)) return "at_port";
  if (/anchor/.test(s)) return "anchored";
  if (/approach|under way using engine|underway/.test(s)) return speed < 3 ? "approaching" : "underway";
  if (speed < 0.3) return "at_port";
  if (speed < 3) return "approaching";
  return "underway";
}

function num(value: unknown) {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : 0;
}

export function mapAisNav(code: unknown, speed = 0): VesselStatus {
  const n = Number(code);
  if (n === 1 || n === 6) return "anchored";
  if (n === 5) return "at_port";
  if (n === 0 || n === 8) return speed < 3 ? "approaching" : "underway";
  return mapStatus(String(code ?? ""), speed);
}

export function normalizeOpenWater(
  feature: { geometry?: { coordinates?: unknown }; properties?: Record<string, unknown> },
  index: number,
): Vessel | null {
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const longitude = num(coords[0]);
  const latitude = num(coords[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const props = feature.properties || {};
  const speed = num(props.sog ?? props.speed);
  const mmsi = String(props.mmsi || "");
  const named = String(props.name || "").replace(/_/g, " ").trim();
  const seen = props.seen;
  const lastUpdate =
    typeof seen === "number"
      ? new Date(seen > 1e12 ? seen : seen * 1000).toISOString()
      : typeof seen === "string"
        ? seen
        : new Date().toISOString();
  return {
    id: mmsi || `ais-${index}`,
    name: named || (mmsi ? `MMSI ${mmsi}` : `VESSEL ${index + 1}`),
    mmsi: mmsi || undefined,
    type: mapType(String(props.type || props.typeSpecific || props.kind || "")),
    latitude,
    longitude,
    speed,
    heading: num(props.heading ?? props.cog ?? props.course),
    destination: props.destination != null ? String(props.destination) : undefined,
    status: mapAisNav(props.nav_status ?? props.navigationalStatus, speed),
    lastUpdate,
  };
}

export function normalizeAreaVessel(raw: Record<string, unknown>, index: number): Vessel {
  const speedRaw = num(raw.speed);
  const speed = speedRaw > 40 ? speedRaw / 10 : speedRaw;
  const heading = num(raw.heading ?? raw.course);
  const mmsi = String(raw.mmsi || "");
  return {
    id: mmsi || `live-${index}`,
    name: String(raw.name || "UNKNOWN VESSEL"),
    mmsi: mmsi || undefined,
    type: mapType(String(raw.typeSpecific || raw.type || "")),
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    speed,
    heading,
    status: mapStatus(String(raw.navigationalStatus || ""), speed),
    lastUpdate: new Date().toISOString(),
  };
}

export function normalizeInfoVessel(raw: Record<string, unknown>): Vessel {
  const speed = num(raw.speed);
  return {
    id: String(raw.mmsi || raw.imo || raw.name),
    name: String(raw.name || "UNKNOWN VESSEL"),
    imo: raw.imo != null ? String(raw.imo) : undefined,
    mmsi: raw.mmsi != null ? String(raw.mmsi) : undefined,
    type: mapType(String(raw.shipType || raw.typeSpecific || "")),
    flag: raw.country != null ? String(raw.country) : undefined,
    latitude: num(raw.latitude),
    longitude: num(raw.longitude),
    speed,
    heading: num(raw.heading ?? raw.course),
    destination: raw.destination != null ? String(raw.destination) : undefined,
    eta: raw.etaUtc != null ? String(raw.etaUtc) : undefined,
    status: mapStatus(String(raw.navigationalStatus || ""), speed),
    length: num(raw.length) || undefined,
    beam: num(raw.beam) || undefined,
    grossTonnage: num(raw.grossTonnage) || undefined,
    lastUpdate: String(raw.updateTime || raw.positionReceived || new Date().toISOString()),
  };
}

export function normalizeTrack(raw: unknown): TrackPoint[] {
  const rows = Array.isArray(raw) ? raw : [];
  return rows
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        latitude: num(item.lat ?? item.latitude),
        longitude: num(item.lng ?? item.longitude),
        time: String(item.time || new Date().toISOString()),
        speed: num(item.speed),
        heading: num(item.course ?? item.heading),
      };
    })
    .filter((p) => p.latitude !== 0 || p.longitude !== 0);
}

export function emptyPortActivity(port: Port, demo: boolean): PortActivity {
  return { port, approaching: 0, atPort: 0, departed: 0, arrivals: [], demo };
}
