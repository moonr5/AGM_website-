export type VesselStatus = "underway" | "anchored" | "at_port" | "approaching" | "unknown";

export type VesselType = "tanker" | "cargo" | "tug" | "passenger" | "fishing" | "other";

export type DataMode = "demo" | "live";

export type AppView = "overview" | "fleet" | "ports" | "watchlist" | "analytics";

export interface Vessel {
  id: string;
  name: string;
  imo?: string;
  mmsi?: string;
  type: VesselType;
  flag?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  destination?: string;
  eta?: string;
  status: VesselStatus;
  length?: number;
  beam?: number;
  grossTonnage?: number;
  lastUpdate: string;
}

export interface TrackPoint {
  latitude: number;
  longitude: number;
  time: string;
  speed: number;
  heading: number;
}

export interface Port {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  locode: string;
}

export interface PortActivity {
  port: Port;
  approaching: number;
  atPort: number;
  departed: number;
  arrivals: { name: string; eta: string; type: VesselType }[];
  demo: boolean;
}

export interface AlertItem {
  id: string;
  severity: "info" | "notice" | "warning";
  title: string;
  body: string;
  time: string;
  vesselId?: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  text: string;
  vesselId?: string;
}

export interface VesselFilters {
  type: VesselType | "all";
  status: VesselStatus | "all";
  flag: string;
  destination: string;
  minSpeed: number;
  maxSpeed: number;
}

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}
