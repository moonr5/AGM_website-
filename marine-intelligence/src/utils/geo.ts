import type { MapBounds, TrackPoint, Vessel } from "../types/vessel";

const KM_PER_DEG_LAT = 110.574;

export function destinationPoint(lat: number, lon: number, heading: number, km: number) {
  const rad = (heading * Math.PI) / 180;
  const dLat = (km * Math.cos(rad)) / KM_PER_DEG_LAT;
  const dLon = (km * Math.sin(rad)) / (111.32 * Math.cos((lat * Math.PI) / 180));
  return { latitude: lat + dLat, longitude: lon + dLon };
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(x)));
}

export function moveVessel(vessel: Vessel, hours: number): Vessel {
  if (vessel.speed < 0.3 || vessel.status === "at_port" || vessel.status === "anchored") {
    return { ...vessel, lastUpdate: new Date().toISOString() };
  }
  const km = vessel.speed * 1.852 * hours;
  const next = destinationPoint(vessel.latitude, vessel.longitude, vessel.heading, km);
  return { ...vessel, ...next, lastUpdate: new Date().toISOString() };
}

export function buildDemoTrack(vessel: Vessel, hours = 6, steps = 12): TrackPoint[] {
  const points: TrackPoint[] = [];
  const now = Date.now();
  for (let i = steps; i >= 0; i -= 1) {
    const ageH = (hours * i) / steps;
    const km = vessel.speed * 1.852 * ageH;
    const pos =
      vessel.speed < 0.3
        ? { latitude: vessel.latitude, longitude: vessel.longitude }
        : destinationPoint(vessel.latitude, vessel.longitude, vessel.heading + 180, km);
    points.push({
      ...pos,
      time: new Date(now - ageH * 3600000).toISOString(),
      speed: vessel.speed,
      heading: vessel.heading,
    });
  }
  return points;
}

export function inBounds(vessel: Vessel, bounds: MapBounds) {
  return (
    vessel.longitude >= bounds.west &&
    vessel.longitude <= bounds.east &&
    vessel.latitude >= bounds.south &&
    vessel.latitude <= bounds.north
  );
}

export function boundsRadiusKm(bounds: MapBounds) {
  return Math.min(
    50,
    distanceKm(bounds.south, bounds.west, bounds.north, bounds.east) / 2,
  );
}

export function boundsCenter(bounds: MapBounds) {
  return {
    latitude: (bounds.south + bounds.north) / 2,
    longitude: (bounds.west + bounds.east) / 2,
  };
}
