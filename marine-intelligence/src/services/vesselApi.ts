import { LIVE_AREAS, PORTS } from "../data/ports";
import { demoVessels } from "../data/demoVessels";
import type { MapBounds, Port, PortActivity, TrackPoint, Vessel } from "../types/vessel";
import { boundsCenter, boundsRadiusKm, buildDemoTrack, distanceKm } from "../utils/geo";
import { normalizeAreaVessel, normalizeInfoVessel, normalizeOpenWater, normalizeTrack } from "./normalize";

const proxyBase = () => import.meta.env.VITE_DATADOCKED_API_URL || "/api/datadocked";

export class LiveUnavailableError extends Error {
  constructor(message = "Unable to retrieve live vessel data.") {
    super(message);
    this.name = "LiveUnavailableError";
  }
}

function liveErrorMessage(status: number, body: unknown) {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const detail = record.detail;
  const message = typeof record.message === "string" ? record.message : "";
  const detailText = typeof detail === "string" ? detail : "";
  if (status === 401) return "Data Docked rejected the API key.";
  if (/credit/i.test(detailText) || /credit/i.test(message)) {
    return "Data Docked has no remaining credits for live AIS.";
  }
  return detailText || message || `Data Docked returned ${status}.`;
}

async function docked<T>(path: string): Promise<T> {
  const url = `${proxyBase()}${path}`;
  const ctrl = new AbortController();
  const timer = globalThis.setTimeout(() => ctrl.abort(), 12000);
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new LiveUnavailableError("Data Docked timed out.");
    }
    throw new LiveUnavailableError("Data Docked could not be reached.");
  } finally {
    globalThis.clearTimeout(timer);
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) throw new LiveUnavailableError(liveErrorMessage(res.status, body));
  return body as T;
}

export async function getCreditBalance(): Promise<number | null> {
  const body = await docked<{ detail?: { credits?: number } | string }>("/my-credits");
  if (body.detail && typeof body.detail === "object" && body.detail.credits != null) {
    const n = Number(body.detail.credits);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function getDemoVessels() {
  return demoVessels();
}

async function getDockedVessels(): Promise<Vessel[]> {
  const seen = new Set<string>();
  const vessels: Vessel[] = [];
  for (const area of LIVE_AREAS) {
    const batch = await docked<{ vessels?: Record<string, unknown>[] }>(
      `/get-vessels-by-area?latitude=${area.latitude.toFixed(1)}&longitude=${area.longitude.toFixed(1)}&circle_radius=${area.radius}`,
    );
    (batch.vessels || []).forEach((raw, i) => {
      const vessel = normalizeAreaVessel(raw, i);
      const key = vessel.mmsi || vessel.id;
      if (seen.has(key)) return;
      seen.add(key);
      vessels.push(vessel);
    });
  }
  return vessels;
}

const OPEN_WATER_BOXES = [
  "-7.30,105.50,-5.20,110.80",
  "-7.60,112.20,-6.80,113.20",
  "0.70,103.60,1.50,104.50",
];

async function getOpenWaterVessels(): Promise<Vessel[]> {
  const seen = new Set<string>();
  const vessels: Vessel[] = [];
  for (const bbox of OPEN_WATER_BOXES) {
    const res = await fetch(`/api/ais/vessels?bbox=${bbox}`, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      if (vessels.length) break;
      throw new LiveUnavailableError("Live AIS feed could not be reached.");
    }
    const body = (await res.json()) as { features?: { geometry?: { coordinates?: unknown }; properties?: Record<string, unknown> }[] };
    (body.features || []).forEach((feature, i) => {
      const vessel = normalizeOpenWater(feature, i);
      if (!vessel) return;
      const key = vessel.mmsi || vessel.id;
      if (seen.has(key)) return;
      seen.add(key);
      vessels.push(vessel);
    });
  }
  return vessels;
}

export async function getVessels(): Promise<Vessel[]> {
  try {
    const dockedVessels = await getDockedVessels();
    if (dockedVessels.length) return dockedVessels;
  } catch {
    /* Data Docked is tried first; fall through to the public live AIS feed. */
  }
  const live = await getOpenWaterVessels();
  if (!live.length) throw new LiveUnavailableError("No live AIS vessels in view.");
  return live;
}

export async function getVesselsByArea(bounds: MapBounds): Promise<Vessel[]> {
  const center = boundsCenter(bounds);
  const radius = Math.max(5, Math.round(boundsRadiusKm(bounds)));
  const batch = await docked<{ vessels?: Record<string, unknown>[] }>(
    `/get-vessels-by-area?latitude=${center.latitude.toFixed(1)}&longitude=${center.longitude.toFixed(1)}&circle_radius=${radius}`,
  );
  return (batch.vessels || []).map((raw, i) => normalizeAreaVessel(raw, i));
}

export async function getVesselByIMO(imo: string): Promise<Vessel | null> {
  return getVesselById(imo);
}

export async function getVesselByMMSI(mmsi: string): Promise<Vessel | null> {
  return getVesselById(mmsi);
}

export async function getVesselById(id: string): Promise<Vessel | null> {
  const body = await docked<Record<string, unknown>>(
    `/get-vessel-info?imo_or_mmsi=${encodeURIComponent(id)}`,
  );
  if (!body || body.error) return null;
  return normalizeInfoVessel(body);
}

export async function getVesselTrack(id: string): Promise<TrackPoint[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 3600000);
  const body = await docked<{ data?: unknown }>(
    `/get-vessel-historical-data?imo_or_mmsi=${encodeURIComponent(id)}&from_date=${encodeURIComponent(from.toISOString())}&to_date=${encodeURIComponent(to.toISOString())}`,
  );
  return normalizeTrack(body.data);
}

export async function getPortActivity(port: Port): Promise<PortActivity> {
  const [expected, inPort, departed] = await Promise.all([
    docked<{ detail?: { expected?: { total?: number; list?: Record<string, unknown>[] } } }>(
      `/port-calls-by-port?port_call=${port.locode}&search_type=expected&page=1`,
    ),
    docked<{ detail?: { in_port?: { total?: number } } }>(
      `/port-calls-by-port?port_call=${port.locode}&search_type=in_port&page=1`,
    ),
    docked<{ detail?: { departure?: { total?: number } } }>(
      `/port-calls-by-port?port_call=${port.locode}&search_type=departure&page=1`,
    ),
  ]);
  const list = expected.detail?.expected?.list || [];
  return {
    port,
    approaching: expected.detail?.expected?.total || list.length,
    atPort: inPort.detail?.in_port?.total || 0,
    departed: departed.detail?.departure?.total || 0,
    arrivals: list.slice(0, 6).map((row) => ({
      name: String(row.name || "Unknown"),
      eta: String(row.formattedETA || "—"),
      type: "cargo" as const,
    })),
    demo: false,
  };
}

export function getDemoPortActivity(port: Port, vessels: Vessel[]): PortActivity {
  const nearby = vessels.filter((v) => distanceKm(v.latitude, v.longitude, port.latitude, port.longitude) < 80);
  const dest = vessels.filter((v) => (v.destination || "").toLowerCase().includes(port.city.toLowerCase()) || (v.destination || "").toLowerCase().includes(port.name.toLowerCase()));
  const approaching = dest.filter((v) => v.status === "approaching" || v.status === "underway").length;
  const atPort = nearby.filter((v) => v.status === "at_port").length;
  return {
    port,
    approaching,
    atPort,
    departed: Math.max(4, Math.round(nearby.length * 0.4)),
    arrivals: dest
      .filter((v) => v.eta)
      .sort((a, b) => String(a.eta).localeCompare(String(b.eta)))
      .slice(0, 5)
      .map((v) => ({ name: v.name, eta: v.eta || "—", type: v.type })),
    demo: true,
  };
}

export function getDemoTrack(vessel: Vessel) {
  return buildDemoTrack(vessel);
}

export function findPort(id: string) {
  return PORTS.find((p) => p.id === id) || null;
}
