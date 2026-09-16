import type { VesselType } from "../../types/vessel";

const COLORS: Record<VesselType, string> = {
  tanker: "#c9842a",
  cargo: "#0a62a8",
  tug: "#1aa05a",
  passenger: "#7b4fc4",
  fishing: "#0d8a8a",
  other: "#3d4f63",
};

export function vesselColor(type: VesselType) {
  return COLORS[type];
}
