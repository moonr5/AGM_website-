import { PORTS } from "../data/ports";
import type { Vessel } from "../types/vessel";
import { labelType } from "../utils/format";
import { distanceKm } from "../utils/geo";

export interface AssistantAnswer {
  text: string;
  highlightIds: string[];
}

function nearPort(vessels: Vessel[], query: string) {
  const port = PORTS.find((p) => query.includes(p.name.toLowerCase()) || query.includes(p.city.toLowerCase()));
  if (!port) return null;
  const hits = vessels
    .filter((v) => distanceKm(v.latitude, v.longitude, port.latitude, port.longitude) < 80)
    .sort((a, b) => a.speed === b.speed ? 0 : b.speed - a.speed);
  return { port, hits };
}

export function askAssistant(question: string, vessels: Vessel[]): AssistantAnswer {
  const q = question.trim().toLowerCase();
  if (!q) return { text: "Ask about a vessel, port, type, or status in the current picture.", highlightIds: [] };

  const named = vessels.filter((v) => q.includes(v.name.toLowerCase()) || (v.imo && q.includes(v.imo)) || (v.mmsi && q.includes(v.mmsi)));
  if (named.length === 1) {
    const v = named[0];
    return {
      text: `${v.name} is ${v.status.replace("_", " ")} at ${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}, making ${v.speed.toFixed(1)} kn on heading ${Math.round(v.heading)}°. Destination ${v.destination || "not reported"}.`,
      highlightIds: [v.id],
    };
  }

  const typeHit = (["tanker", "cargo", "tug", "passenger", "fishing"] as const).find((t) => q.includes(t));
  const statusHit =
    q.includes("anchor") ? "anchored" :
    q.includes("port") && !q.includes("approach") ? "at_port" :
    q.includes("approach") ? "approaching" :
    q.includes("underway") || q.includes("under way") ? "underway" :
    null;

  const around = nearPort(vessels, q);
  let pool = vessels;
  if (typeHit) pool = pool.filter((v) => v.type === typeHit);
  if (statusHit) pool = pool.filter((v) => v.status === statusHit);
  if (around) pool = pool.filter((v) => around.hits.some((h) => h.id === v.id));

  if (around && q.includes("approach")) {
    const hits = around.hits.filter((v) => v.status === "approaching" || (v.destination || "").toLowerCase().includes(around.port.city.toLowerCase()));
    if (!hits.length) {
      return { text: `No vessels in the current dataset are approaching ${around.port.name}.`, highlightIds: [] };
    }
    return {
      text: `I found ${hits.length} vessel${hits.length === 1 ? "" : "s"} approaching ${around.port.name}.\n\n${hits.slice(0, 8).map((v, i) => `${i + 1}. ${v.name} — ${v.speed.toFixed(1)} kn`).join("\n")}`,
      highlightIds: hits.map((v) => v.id),
    };
  }

  if (pool.length && (typeHit || statusHit || around)) {
    const place = around ? ` near ${around.port.city}` : "";
    const kind = typeHit ? `${labelType(typeHit).toLowerCase()}s` : "vessels";
    const state = statusHit ? ` that are ${statusHit.replace("_", " ")}` : "";
    return {
      text: `I found ${pool.length} ${kind}${state}${place} in the current picture.\n\n${pool.slice(0, 8).map((v, i) => `${i + 1}. ${v.name} — ${v.speed.toFixed(1)} kn`).join("\n")}`,
      highlightIds: pool.map((v) => v.id),
    };
  }

  return {
    text: "I can only answer from the vessels currently loaded. Try a name, IMO, MMSI, a type such as tanker, or a port such as Marunda or Jakarta.",
    highlightIds: [],
  };
}
