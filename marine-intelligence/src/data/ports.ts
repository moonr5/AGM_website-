import type { Port } from "../types/vessel";

export const PORTS: Port[] = [
  { id: "tpp", name: "Tanjung Priok", city: "Jakarta", latitude: -6.104, longitude: 106.882, locode: "IDTPP" },
  { id: "marunda", name: "Marunda", city: "North Jakarta", latitude: -6.098, longitude: 106.962, locode: "IDTPP" },
  { id: "sub", name: "Tanjung Perak", city: "Surabaya", latitude: -7.2, longitude: 112.733, locode: "IDSUB" },
  { id: "blw", name: "Belawan", city: "Medan", latitude: 3.787, longitude: 98.694, locode: "IDBLW" },
  { id: "btm", name: "Batam", city: "Batam", latitude: 1.13, longitude: 104.03, locode: "IDBTM" },
  { id: "mak", name: "Makassar", city: "Makassar", latitude: -5.133, longitude: 119.408, locode: "IDMAK" },
];

export const LIVE_AREAS = [
  { name: "Jakarta", latitude: -6.1, longitude: 106.9, radius: 50 },
  { name: "Java Sea west", latitude: -5.6, longitude: 107.2, radius: 50 },
  { name: "Cirebon", latitude: -6.1, longitude: 108.5, radius: 50 },
  { name: "Surabaya", latitude: -7.2, longitude: 112.7, radius: 50 },
  { name: "Batam", latitude: 1.1, longitude: 104.0, radius: 50 },
] as const;
