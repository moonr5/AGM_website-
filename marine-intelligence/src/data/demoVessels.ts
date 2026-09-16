import type { ActivityItem, AlertItem, Vessel, VesselStatus, VesselType } from "../types/vessel";

type Seed = Omit<Vessel, "id" | "lastUpdate">;

const SEEDS: Seed[] = [
  { name: "MT ARUN WAVE", imo: "9811001", mmsi: "525000101", type: "tanker", flag: "Indonesia", latitude: -5.92, longitude: 106.78, speed: 12.4, heading: 74, destination: "Jakarta", eta: "2026-09-14T16:42:00+07:00", status: "approaching", length: 145, beam: 23, grossTonnage: 12450 },
  { name: "MT SILVER MONSOON", imo: "9811002", mmsi: "525000102", type: "tanker", flag: "Indonesia", latitude: -5.74, longitude: 106.21, speed: 11.1, heading: 92, destination: "Marunda", eta: "2026-09-14T18:10:00+07:00", status: "underway", length: 162, beam: 26, grossTonnage: 16880 },
  { name: "MT PACIFIC DAWN", imo: "9811003", mmsi: "525000103", type: "tanker", flag: "Singapore", latitude: -6.02, longitude: 106.91, speed: 8.2, heading: 118, destination: "Jakarta", eta: "2026-09-14T19:35:00+07:00", status: "approaching", length: 138, beam: 22, grossTonnage: 10920 },
  { name: "MT JAVA CURRENT", imo: "9811004", mmsi: "525000104", type: "tanker", flag: "Indonesia", latitude: -6.18, longitude: 107.42, speed: 13.6, heading: 268, destination: "Surabaya", eta: "2026-09-15T06:20:00+07:00", status: "underway", length: 171, beam: 28, grossTonnage: 21400 },
  { name: "MT SUNDA ROAD", imo: "9811005", mmsi: "525000105", type: "tanker", flag: "Malaysia", latitude: -5.88, longitude: 105.92, speed: 9.4, heading: 46, destination: "Belawan", eta: "2026-09-16T11:00:00+07:00", status: "underway", length: 154, beam: 24, grossTonnage: 14210 },
  { name: "MT EQUATOR FILL", imo: "9811006", mmsi: "525000106", type: "tanker", flag: "Indonesia", latitude: 1.08, longitude: 103.92, speed: 0.1, heading: 12, destination: "Batam", eta: "2026-09-14T12:00:00+07:00", status: "at_port", length: 119, beam: 20, grossTonnage: 7840 },
  { name: "MV SELAT JAYA", imo: "9811101", mmsi: "525000201", type: "cargo", flag: "Indonesia", latitude: -6.08, longitude: 106.96, speed: 0, heading: 188, destination: "Marunda", eta: "2026-09-14T09:10:00+07:00", status: "at_port", length: 98, beam: 16, grossTonnage: 4120 },
  { name: "MV NUSANTARA PATH", imo: "9811102", mmsi: "525000202", type: "cargo", flag: "Indonesia", latitude: -5.61, longitude: 107.18, speed: 10.8, heading: 196, destination: "Jakarta", eta: "2026-09-14T17:25:00+07:00", status: "underway", length: 124, beam: 18, grossTonnage: 6780 },
  { name: "MV KALIMANTAN HAUL", imo: "9811103", mmsi: "525000203", type: "cargo", flag: "Indonesia", latitude: -3.42, longitude: 109.88, speed: 11.6, heading: 214, destination: "Surabaya", eta: "2026-09-15T14:40:00+07:00", status: "underway", length: 142, beam: 21, grossTonnage: 9340 },
  { name: "MV EQUATOR BRIDGE", imo: "9811104", mmsi: "525000204", type: "cargo", flag: "Panama", latitude: -4.88, longitude: 106.42, speed: 12.9, heading: 148, destination: "Jakarta", eta: "2026-09-15T03:15:00+07:00", status: "underway", length: 168, beam: 25, grossTonnage: 18650 },
  { name: "MV FLORES REACH", imo: "9811105", mmsi: "525000205", type: "cargo", flag: "Indonesia", latitude: -8.12, longitude: 115.21, speed: 9.7, heading: 288, destination: "Surabaya", eta: "2026-09-15T22:00:00+07:00", status: "underway", length: 112, beam: 17, grossTonnage: 5410 },
  { name: "MV MAKASSAR LINE", imo: "9811106", mmsi: "525000206", type: "cargo", flag: "Indonesia", latitude: -5.11, longitude: 119.22, speed: 6.4, heading: 92, destination: "Makassar", eta: "2026-09-14T20:05:00+07:00", status: "approaching", length: 106, beam: 16, grossTonnage: 4980 },
  { name: "MV JAVA PACKET", imo: "9811107", mmsi: "525000207", type: "cargo", flag: "Indonesia", latitude: -6.94, longitude: 112.58, speed: 7.8, heading: 78, destination: "Surabaya", eta: "2026-09-14T21:30:00+07:00", status: "approaching", length: 91, beam: 14, grossTonnage: 3260 },
  { name: "MV BELAWAN CARGO", imo: "9811108", mmsi: "525000208", type: "cargo", flag: "Indonesia", latitude: 3.81, longitude: 98.71, speed: 0.2, heading: 4, destination: "Belawan", eta: "2026-09-14T08:00:00+07:00", status: "at_port", length: 118, beam: 18, grossTonnage: 6020 },
  { name: "MV STRAIT HAULER", imo: "9811109", mmsi: "525000209", type: "cargo", flag: "Singapore", latitude: 1.21, longitude: 104.18, speed: 13.2, heading: 312, destination: "Batam", eta: "2026-09-14T15:50:00+07:00", status: "underway", length: 152, beam: 22, grossTonnage: 12110 },
  { name: "MV LOMBOK ROAD", imo: "9811110", mmsi: "525000210", type: "cargo", flag: "Indonesia", latitude: -8.42, longitude: 116.08, speed: 8.6, heading: 268, destination: "Makassar", eta: "2026-09-16T09:40:00+07:00", status: "underway", length: 104, beam: 16, grossTonnage: 4550 },
  { name: "TB MARUNDA PUSH", imo: "9811201", mmsi: "525000301", type: "tug", flag: "Indonesia", latitude: -6.1, longitude: 106.97, speed: 0, heading: 210, destination: "Marunda", eta: "2026-09-14T07:30:00+07:00", status: "at_port", length: 28, beam: 9, grossTonnage: 280 },
  { name: "TB PRIOK ASSIST", imo: "9811202", mmsi: "525000302", type: "tug", flag: "Indonesia", latitude: -6.12, longitude: 106.87, speed: 4.6, heading: 42, destination: "Jakarta", eta: "2026-09-14T15:05:00+07:00", status: "underway", length: 26, beam: 8, grossTonnage: 240 },
  { name: "TB SURABAYA HAND", imo: "9811203", mmsi: "525000303", type: "tug", flag: "Indonesia", latitude: -7.19, longitude: 112.74, speed: 0.1, heading: 96, destination: "Surabaya", eta: "2026-09-14T10:00:00+07:00", status: "at_port", length: 30, beam: 9, grossTonnage: 310 },
  { name: "TB BELAWAN LINE", imo: "9811204", mmsi: "525000304", type: "tug", flag: "Indonesia", latitude: 3.76, longitude: 98.82, speed: 5.2, heading: 188, destination: "Belawan", eta: "2026-09-14T16:20:00+07:00", status: "underway", length: 27, beam: 8, grossTonnage: 260 },
  { name: "TB BATAM SHIFT", imo: "9811205", mmsi: "525000305", type: "tug", flag: "Indonesia", latitude: 1.16, longitude: 104.01, speed: 3.8, heading: 74, destination: "Batam", eta: "2026-09-14T14:10:00+07:00", status: "approaching", length: 25, beam: 8, grossTonnage: 220 },
  { name: "TB MAKASSAR WORK", imo: "9811206", mmsi: "525000306", type: "tug", flag: "Indonesia", latitude: -5.14, longitude: 119.39, speed: 0, heading: 16, destination: "Makassar", eta: "2026-09-14T11:00:00+07:00", status: "at_port", length: 29, beam: 9, grossTonnage: 295 },
  { name: "KM ISLAND PASS", imo: "9811301", mmsi: "525000401", type: "passenger", flag: "Indonesia", latitude: -8.21, longitude: 114.42, speed: 14.8, heading: 108, destination: "Bali", eta: "2026-09-14T18:45:00+07:00", status: "underway", length: 86, beam: 15, grossTonnage: 3180 },
  { name: "KM BALI STRAIT", imo: "9811302", mmsi: "525000402", type: "passenger", flag: "Indonesia", latitude: -8.16, longitude: 114.48, speed: 12.2, heading: 292, destination: "Ketapang", eta: "2026-09-14T17:10:00+07:00", status: "underway", length: 79, beam: 14, grossTonnage: 2740 },
  { name: "KM JAVA FERRY", imo: "9811303", mmsi: "525000403", type: "passenger", flag: "Indonesia", latitude: -5.89, longitude: 105.86, speed: 0.3, heading: 8, destination: "Merak", eta: "2026-09-14T13:20:00+07:00", status: "anchored", length: 94, beam: 16, grossTonnage: 3920 },
  { name: "KM BATAM LINK", imo: "9811304", mmsi: "525000404", type: "passenger", flag: "Indonesia", latitude: 1.09, longitude: 103.98, speed: 9.1, heading: 54, destination: "Batam", eta: "2026-09-14T15:25:00+07:00", status: "approaching", length: 62, beam: 12, grossTonnage: 1480 },
  { name: "KM MAKASSAR ISLE", imo: "9811305", mmsi: "525000405", type: "passenger", flag: "Indonesia", latitude: -5.22, longitude: 119.51, speed: 11.4, heading: 246, destination: "Makassar", eta: "2026-09-14T19:00:00+07:00", status: "underway", length: 71, beam: 13, grossTonnage: 1860 },
  { name: "FV BANDA CATCH", imo: "9811401", mmsi: "525000501", type: "fishing", flag: "Indonesia", latitude: -4.62, longitude: 129.84, speed: 6.8, heading: 312, destination: "Ambon", eta: "2026-09-16T08:00:00+07:00", status: "underway", length: 34, beam: 8, grossTonnage: 180 },
  { name: "FV JAVA NET", imo: "9811402", mmsi: "525000502", type: "fishing", flag: "Indonesia", latitude: -6.48, longitude: 110.92, speed: 5.4, heading: 86, destination: "Pekalongan", eta: "2026-09-14T22:40:00+07:00", status: "underway", length: 28, beam: 7, grossTonnage: 120 },
  { name: "FV SUNDA HAUL", imo: "9811403", mmsi: "525000503", type: "fishing", flag: "Indonesia", latitude: -5.96, longitude: 105.48, speed: 0.2, heading: 164, destination: "Labuan", eta: "2026-09-14T12:30:00+07:00", status: "anchored", length: 26, beam: 6, grossTonnage: 95 },
  { name: "FV MAKASSAR NET", imo: "9811404", mmsi: "525000504", type: "fishing", flag: "Indonesia", latitude: -5.02, longitude: 119.18, speed: 4.9, heading: 128, destination: "Makassar", eta: "2026-09-14T21:15:00+07:00", status: "underway", length: 31, beam: 7, grossTonnage: 140 },
  { name: "FV BELAWAN CATCH", imo: "9811405", mmsi: "525000505", type: "fishing", flag: "Indonesia", latitude: 3.92, longitude: 98.92, speed: 3.6, heading: 214, destination: "Belawan", eta: "2026-09-14T18:55:00+07:00", status: "underway", length: 24, beam: 6, grossTonnage: 88 },
  { name: "SV SURVEY ARC", imo: "9811501", mmsi: "525000601", type: "other", flag: "Indonesia", latitude: -5.48, longitude: 106.62, speed: 7.2, heading: 36, destination: "Jakarta", eta: "2026-09-14T20:30:00+07:00", status: "underway", length: 48, beam: 10, grossTonnage: 640 },
  { name: "SV COAST WATCH", imo: "9811502", mmsi: "525000602", type: "other", flag: "Indonesia", latitude: -6.22, longitude: 108.12, speed: 8.8, heading: 96, destination: "Cirebon", eta: "2026-09-15T01:10:00+07:00", status: "underway", length: 52, beam: 11, grossTonnage: 710 },
  { name: "SV ANCHOR HOLD", imo: "9811503", mmsi: "525000603", type: "other", flag: "Indonesia", latitude: -6.06, longitude: 106.84, speed: 0.1, heading: 268, destination: "Jakarta", eta: "2026-09-14T08:40:00+07:00", status: "anchored", length: 44, beam: 10, grossTonnage: 520 },
  { name: "MT BENGKULU LIFT", imo: "9811007", mmsi: "525000107", type: "tanker", flag: "Indonesia", latitude: -4.12, longitude: 102.38, speed: 10.2, heading: 18, destination: "Belawan", eta: "2026-09-16T04:20:00+07:00", status: "underway", length: 128, beam: 21, grossTonnage: 9860 },
  { name: "MV PONTIANAK ROAD", imo: "9811111", mmsi: "525000211", type: "cargo", flag: "Indonesia", latitude: -0.12, longitude: 109.18, speed: 9.9, heading: 176, destination: "Jakarta", eta: "2026-09-16T12:00:00+07:00", status: "underway", length: 116, beam: 18, grossTonnage: 5840 },
  { name: "MV BANJARMASIN HAUL", imo: "9811112", mmsi: "525000212", type: "cargo", flag: "Indonesia", latitude: -3.28, longitude: 114.58, speed: 8.1, heading: 214, destination: "Surabaya", eta: "2026-09-15T16:30:00+07:00", status: "underway", length: 108, beam: 17, grossTonnage: 5120 },
  { name: "TB CIREBON PUSH", imo: "9811207", mmsi: "525000307", type: "tug", flag: "Indonesia", latitude: -6.72, longitude: 108.58, speed: 5.8, heading: 262, destination: "Cirebon", eta: "2026-09-14T19:20:00+07:00", status: "underway", length: 24, beam: 8, grossTonnage: 210 },
  { name: "KM KARIMUN LINK", imo: "9811306", mmsi: "525000406", type: "passenger", flag: "Indonesia", latitude: 0.98, longitude: 103.42, speed: 10.6, heading: 84, destination: "Batam", eta: "2026-09-14T17:55:00+07:00", status: "underway", length: 58, beam: 11, grossTonnage: 1320 },
  { name: "MV AMBON PACKET", imo: "9811113", mmsi: "525000213", type: "cargo", flag: "Indonesia", latitude: -3.68, longitude: 128.12, speed: 11.3, heading: 268, destination: "Makassar", eta: "2026-09-17T08:00:00+07:00", status: "underway", length: 96, beam: 15, grossTonnage: 3880 },
  { name: "MT BALIKPAPAN FILL", imo: "9811008", mmsi: "525000108", type: "tanker", flag: "Indonesia", latitude: -1.24, longitude: 116.82, speed: 0.2, heading: 188, destination: "Balikpapan", eta: "2026-09-14T11:40:00+07:00", status: "anchored", length: 176, beam: 29, grossTonnage: 24600 },
  { name: "MV JAVA RIDGE", imo: "9811114", mmsi: "525000214", type: "cargo", flag: "Indonesia", latitude: -5.72, longitude: 107.55, speed: 11.8, heading: 248, destination: "Jakarta", eta: "2026-09-14T21:10:00+07:00", status: "underway", length: 118, beam: 18, grossTonnage: 6120 },
  { name: "MT KARIMATA", imo: "9811009", mmsi: "525000109", type: "tanker", flag: "Indonesia", latitude: -5.48, longitude: 108.12, speed: 12.6, heading: 262, destination: "Cirebon", eta: "2026-09-15T02:40:00+07:00", status: "underway", length: 148, beam: 24, grossTonnage: 13240 },
  { name: "MV SERIBU PATH", imo: "9811115", mmsi: "525000215", type: "cargo", flag: "Indonesia", latitude: -5.86, longitude: 106.62, speed: 9.4, heading: 118, destination: "Jakarta", eta: "2026-09-14T18:20:00+07:00", status: "underway", length: 102, beam: 16, grossTonnage: 4680 },
  { name: "TB ANCOL HAND", imo: "9811208", mmsi: "525000308", type: "tug", flag: "Indonesia", latitude: -6.04, longitude: 106.88, speed: 6.2, heading: 74, destination: "Jakarta", eta: "2026-09-14T16:40:00+07:00", status: "underway", length: 26, beam: 8, grossTonnage: 230 },
  { name: "MV INDRAMAYU HAUL", imo: "9811116", mmsi: "525000216", type: "cargo", flag: "Indonesia", latitude: -6.12, longitude: 108.22, speed: 10.1, heading: 86, destination: "Cirebon", eta: "2026-09-14T22:00:00+07:00", status: "underway", length: 110, beam: 17, grossTonnage: 5340 },
  { name: "KM MERAK CROSS", imo: "9811307", mmsi: "525000407", type: "passenger", flag: "Indonesia", latitude: -5.96, longitude: 105.98, speed: 13.4, heading: 292, destination: "Merak", eta: "2026-09-14T17:05:00+07:00", status: "underway", length: 88, beam: 15, grossTonnage: 3040 },
  { name: "MV THOUSAND ISLANDS", imo: "9811117", mmsi: "525000217", type: "cargo", flag: "Indonesia", latitude: -5.68, longitude: 106.58, speed: 8.8, heading: 164, destination: "Jakarta", eta: "2026-09-14T19:50:00+07:00", status: "underway", length: 94, beam: 15, grossTonnage: 3920 },
  { name: "MT NORTH JAVA", imo: "9811010", mmsi: "525000110", type: "tanker", flag: "Singapore", latitude: -5.38, longitude: 107.22, speed: 11.2, heading: 196, destination: "Marunda", eta: "2026-09-15T01:15:00+07:00", status: "underway", length: 156, beam: 25, grossTonnage: 15480 },
  { name: "FV PANTURA NET", imo: "9811406", mmsi: "525000506", type: "fishing", flag: "Indonesia", latitude: -6.02, longitude: 107.82, speed: 5.6, heading: 92, destination: "Indramayu", eta: "2026-09-14T23:10:00+07:00", status: "underway", length: 27, beam: 7, grossTonnage: 110 },
  { name: "MV BANTEN ROAD", imo: "9811118", mmsi: "525000218", type: "cargo", flag: "Indonesia", latitude: -6.02, longitude: 105.88, speed: 10.7, heading: 78, destination: "Jakarta", eta: "2026-09-14T20:35:00+07:00", status: "underway", length: 121, beam: 19, grossTonnage: 6780 },
];

const PREFIX: Record<VesselType, string> = {
  tanker: "MT",
  cargo: "MV",
  tug: "TB",
  passenger: "KM",
  fishing: "FV",
  other: "SV",
};

const LANE_WORDS = [
  "ARJUNA", "MERAPI", "KRAKATAU", "CIMANDIRI", "CILIWUNG", "PROGO", "SOLO", "BRANTAS",
  "MAJAPAHIT", "GARUDA", "RAJAWALI", "CEMPAKA", "MELATI", "KENANGA", "MONSOON", "TRADEWIND",
  "HORIZON", "MERIDIAN", "COMPASS", "HARBOUR", "SUNDA", "KARIMATA", "SERIBU", "PANTURA",
  "EQUATOR", "NUSANTARA", "BOROBUDUR", "DIPONEGORO", "CELEBES", "BANDA",
];

function rnd(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function laneSeeds(): Seed[] {
  const patches: { lat: number; lon: number; spreadLat: number; spreadLon: number; count: number; heading: number; types: VesselType[]; dest: string; status?: VesselStatus }[] = [
    { lat: -5.98, lon: 106.82, spreadLat: 0.22, spreadLon: 0.38, count: 22, heading: 96, types: ["cargo", "tanker", "tug", "other"], dest: "Jakarta" },
    { lat: -6.08, lon: 106.94, spreadLat: 0.08, spreadLon: 0.12, count: 10, heading: 188, types: ["tug", "cargo"], dest: "Marunda", status: "at_port" },
    { lat: -5.72, lon: 106.55, spreadLat: 0.18, spreadLon: 0.28, count: 12, heading: 148, types: ["tanker", "cargo"], dest: "Jakarta", status: "approaching" },
    { lat: -5.9, lon: 105.92, spreadLat: 0.16, spreadLon: 0.22, count: 10, heading: 54, types: ["passenger", "cargo", "tug"], dest: "Merak" },
    { lat: -5.78, lon: 107.85, spreadLat: 0.28, spreadLon: 0.55, count: 18, heading: 84, types: ["cargo", "tanker", "fishing"], dest: "Cirebon" },
    { lat: -5.52, lon: 107.4, spreadLat: 0.32, spreadLon: 0.7, count: 16, heading: 262, types: ["cargo", "tanker"], dest: "Jakarta" },
    { lat: -6.02, lon: 108.55, spreadLat: 0.2, spreadLon: 0.42, count: 12, heading: 92, types: ["cargo", "fishing", "tug"], dest: "Cirebon" },
    { lat: -5.42, lon: 108.9, spreadLat: 0.35, spreadLon: 0.8, count: 14, heading: 102, types: ["tanker", "cargo"], dest: "Surabaya" },
    { lat: -6.12, lon: 110.4, spreadLat: 0.22, spreadLon: 0.5, count: 10, heading: 78, types: ["fishing", "cargo"], dest: "Semarang" },
    { lat: -6.95, lon: 112.55, spreadLat: 0.16, spreadLon: 0.28, count: 10, heading: 268, types: ["cargo", "tug", "tanker"], dest: "Surabaya" },
  ];

  const extra: Seed[] = [];
  let n = 0;
  patches.forEach((patch, pi) => {
    for (let i = 0; i < patch.count; i += 1) {
      const type = patch.types[i % patch.types.length];
      const status = patch.status || "underway";
      const parked = status === "at_port" || status === "anchored";
      const speedBase = parked ? 0.1 : type === "tug" || type === "fishing" ? 5.1 : type === "passenger" ? 13.1 : type === "tanker" ? 11.0 : 10.2;
      extra.push({
        name: `${PREFIX[type]} ${LANE_WORDS[n % LANE_WORDS.length]} ${String(n + 21).padStart(2, "0")}`,
        imo: String(9812000 + n),
        mmsi: String(525010000 + n),
        type,
        flag: n % 8 === 0 ? "Singapore" : n % 11 === 0 ? "Malaysia" : "Indonesia",
        latitude: patch.lat + (rnd(n, 1) - 0.5) * patch.spreadLat * 2,
        longitude: patch.lon + (rnd(n, 2) - 0.5) * patch.spreadLon * 2,
        speed: parked ? 0.1 + rnd(n, 3) * 0.2 : speedBase + rnd(n, 3) * 3.2,
        heading: (patch.heading + (rnd(n, 4) - 0.5) * 48 + (i % 5 === 0 ? 180 : 0) + 360) % 360,
        destination: patch.dest,
        eta: "2026-09-15T06:00:00+07:00",
        status: i % 9 === 0 && !parked ? "approaching" : status,
        length: 36 + ((n + pi) % 14) * 8,
        beam: 8 + (n % 6) * 2,
        grossTonnage: 160 + n * 80,
      });
      n += 1;
    }
  });
  return extra;
}

export function demoVessels(now = new Date()): Vessel[] {
  return [...SEEDS, ...laneSeeds()].map((seed, i) => ({
    ...seed,
    id: `demo-${i + 1}`,
    lastUpdate: new Date(now.getTime() - i * 17000).toISOString(),
  }));
}

export function demoAlerts(now = new Date()): AlertItem[] {
  return [
    { id: "a1", severity: "notice", title: "Vessel entered area", body: "MT ARUN WAVE entered the Jakarta monitoring area.", time: new Date(now.getTime() - 120000).toISOString(), vesselId: "demo-1" },
    { id: "a2", severity: "info", title: "Destination change", body: "MV NUSANTARA PATH destination set to Jakarta.", time: new Date(now.getTime() - 198000).toISOString(), vesselId: "demo-8" },
    { id: "a3", severity: "warning", title: "Watchlist update", body: "MT PACIFIC DAWN is now approaching Marunda.", time: new Date(now.getTime() - 305000).toISOString(), vesselId: "demo-3" },
    { id: "a4", severity: "info", title: "Arrival", body: "TB MARUNDA PUSH arrived at Marunda.", time: new Date(now.getTime() - 412000).toISOString(), vesselId: "demo-17" },
    { id: "a5", severity: "notice", title: "New vessel detected", body: "SV COAST WATCH appeared in the Java Sea picture.", time: new Date(now.getTime() - 505000).toISOString(), vesselId: "demo-34" },
  ];
}

export function demoActivity(now = new Date()): ActivityItem[] {
  return [
    { id: "f1", time: new Date(now.getTime() - 8000).toISOString(), text: "MT ARUN WAVE entered monitoring area", vesselId: "demo-1" },
    { id: "f2", time: new Date(now.getTime() - 18000).toISOString(), text: "MV NUSANTARA PATH changed destination", vesselId: "demo-8" },
    { id: "f3", time: new Date(now.getTime() - 49000).toISOString(), text: "TB MARUNDA PUSH arrived at Marunda", vesselId: "demo-17" },
    { id: "f4", time: new Date(now.getTime() - 65000).toISOString(), text: "New vessel detected — SV COAST WATCH", vesselId: "demo-34" },
    { id: "f5", time: new Date(now.getTime() - 88000).toISOString(), text: "KM BALI STRAIT heading 292° at 12.2 kn", vesselId: "demo-24" },
    { id: "f6", time: new Date(now.getTime() - 121000).toISOString(), text: "MV SELAT JAYA remains at Marunda", vesselId: "demo-7" },
    { id: "f7", time: new Date(now.getTime() - 156000).toISOString(), text: "MT PACIFIC DAWN approaching Jakarta", vesselId: "demo-3" },
  ];
}

export const TYPE_ORDER: VesselType[] = ["tanker", "cargo", "tug", "passenger", "fishing", "other"];
export const STATUS_ORDER: VesselStatus[] = ["underway", "at_port", "anchored", "approaching", "unknown"];
