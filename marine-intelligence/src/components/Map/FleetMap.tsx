import L from "leaflet";
import { useEffect, useRef } from "react";
import { PORTS, useFleet } from "../../hooks/FleetContext";
import type { Vessel } from "../../types/vessel";
import { formatSpeed, labelType } from "../../utils/format";
import { destinationPoint } from "../../utils/geo";
import { vesselColor } from "./vesselIcons";

const WAKE = 10;

function vesselIcon(vessel: Vessel, highlight: boolean) {
  const color = highlight ? "#0a62a8" : vesselColor(vessel.type);
  const moving = vessel.speed >= 0.4;
  return L.divIcon({
    className: "mi-vessel",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<span class="${moving ? "mi-ship-live" : ""}" style="display:block;width:24px;height:24px;transform:rotate(${vessel.heading}deg)"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 1.4 L21 22 L12 17.2 L3 22 Z" fill="${color}" stroke="#fff" stroke-width="1.6"/></svg></span>`,
  });
}

function seedTrail(vessel: Vessel): L.LatLngExpression[] {
  if (vessel.speed < 0.4) return [[vessel.latitude, vessel.longitude]];
  const pts: L.LatLngExpression[] = [];
  for (let i = WAKE - 1; i >= 0; i -= 1) {
    const km = vessel.speed * 1.852 * (i * (8 / 60) * 0.55);
    const back = destinationPoint(vessel.latitude, vessel.longitude, (vessel.heading + 180) % 360, km);
    pts.push([back.latitude, back.longitude]);
  }
  return pts;
}
export function FleetMap() {
  const { filtered, selectVessel, selectPort, focus, clearFocus, highlightIds, track, trackIndex, selected } = useFleet();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const wakeRef = useRef<L.LayerGroup | null>(null);
  const trackRef = useRef<L.Polyline | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const history = useRef(new Map<string, L.LatLngExpression[]>());
  const selectPortRef = useRef(selectPort);
  selectPortRef.current = selectPort;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 4,
      maxZoom: 16,
    }).setView([-5.88, 107.05], 8);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles © Esri",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    PORTS.forEach((p) => {
      L.circleMarker([p.latitude, p.longitude], {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: "#0a62a8",
        fillOpacity: 1,
      })
        .bindTooltip(p.name, { direction: "bottom", className: "mi-port-label", offset: [0, 8] })
        .on("click", () => selectPortRef.current(p))
        .addTo(map);
    });    const wakes = L.layerGroup().addTo(map);
    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    wakeRef.current = wakes;
    layerRef.current = group;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      wakeRef.current = null;
      markers.current.clear();
      history.current.clear();
    };
  }, []);

  useEffect(() => {
    const group = layerRef.current;
    const wakes = wakeRef.current;
    if (!group || !wakes) return;

    const keep = new Set(filtered.map((v) => v.id));
    markers.current.forEach((marker, id) => {
      if (keep.has(id)) return;
      group.removeLayer(marker);
      markers.current.delete(id);
      history.current.delete(id);
    });

    wakes.clearLayers();

    filtered.forEach((vessel) => {
      const point: L.LatLngExpression = [vessel.latitude, vessel.longitude];
      let trail = history.current.get(vessel.id);
      if (!trail) {
        trail = seedTrail(vessel);
        history.current.set(vessel.id, trail);
      }
      const last = trail[trail.length - 1] as [number, number] | undefined;
      if (!last || last[0] !== vessel.latitude || last[1] !== vessel.longitude) {
        trail.push(point);
        if (trail.length > WAKE) trail.shift();
        history.current.set(vessel.id, trail);
      }
      if (trail.length > 1 && vessel.speed >= 0.4) {
        L.polyline(trail, {
          color: vesselColor(vessel.type),
          weight: 2.6,
          opacity: 0.42,
          lineCap: "round",
        }).addTo(wakes);
      }
      const on = highlightIds.includes(vessel.id) || selected?.id === vessel.id;
      const existing = markers.current.get(vessel.id);
      if (existing) {
        existing.setLatLng(point);
        existing.setIcon(vesselIcon(vessel, on));
        existing.setTooltipContent(
          `<strong>${vessel.name}</strong><br>${labelType(vessel.type)} · ${formatSpeed(vessel.speed)}<br>${vessel.destination || "—"}`,
        );
        return;
      }
      const marker = L.marker(point, { icon: vesselIcon(vessel, on) });
      marker.bindTooltip(
        `<strong>${vessel.name}</strong><br>${labelType(vessel.type)} · ${formatSpeed(vessel.speed)}<br>${vessel.destination || "—"}`,
        { className: "mi-tip", direction: "top", offset: [0, -8] },
      );
      marker.on("click", () => selectVessel(vessel));
      marker.addTo(group);
      markers.current.set(vessel.id, marker);
    });
  }, [filtered, highlightIds, selected, selectVessel]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (trackRef.current) {
      map.removeLayer(trackRef.current);
      trackRef.current = null;
    }
    if (!track?.length) return;
    const slice = track.slice(0, trackIndex + 1).map((p) => [p.latitude, p.longitude] as L.LatLngExpression);
    trackRef.current = L.polyline(slice, { color: "#0a62a8", weight: 2.2, opacity: 0.8 }).addTo(map);
  }, [track, trackIndex]);

  useEffect(() => {
    if (!focus || !mapRef.current) return;
    mapRef.current.flyTo([focus.lat, focus.lng], focus.zoom ?? 9, { duration: 0.8 });
    clearFocus();
  }, [focus, clearFocus]);

  return (
    <div className="absolute inset-0 z-0 isolate bg-[#d8e4ef]">
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}
