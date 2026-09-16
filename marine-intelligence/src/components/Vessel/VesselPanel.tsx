import { Star, X } from "lucide-react";
import { useFleet } from "../../hooks/FleetContext";
import { formatCoord, formatHeading, formatNumber, formatSpeed, labelStatus, labelType } from "../../utils/format";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-[10px] tracking-[0.12em] text-[#8a97a4]">{k}</span>
      <span className="font-mono text-[11px] text-[#142033]">{v}</span>
    </div>
  );
}

export function VesselPanel() {
  const { selected, selectVessel, showTrack, track, clearTrack, trackDemo, isWatched, toggleWatch } = useFleet();
  if (!selected) return null;

  return (
    <aside className="sheet-enter absolute inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-auto rounded-t-2xl border border-[#d5dee6] bg-white shadow-[0_-8px_40px_rgba(11,28,51,0.1)] md:inset-y-3 md:right-3 md:bottom-auto md:left-auto md:w-[320px] md:rounded-2xl">
      <div className="flex items-start justify-between px-4 pt-3">
        <div>
          <p className="text-[14px] font-medium text-[#0b1c33]">{selected.name}</p>
          <p className="mt-1 text-[10px] tracking-[0.16em] text-[#6d7b88]">{labelType(selected.type).toUpperCase()}</p>
        </div>
        <button type="button" onClick={() => selectVessel(null)} className="text-[#7d8a97]" aria-label="Close">
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 px-4">
        <span className="size-1.5 rounded-full bg-[#96f878]" />
        <span className="text-[10px] tracking-[0.16em] text-[#3d4f63]">{labelStatus(selected.status).toUpperCase()}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-4 font-mono">
        <div>
          <p className="text-[18px] text-[#0b1c33]">{formatSpeed(selected.speed)}</p>
        </div>
        <div>
          <p className="text-[18px] text-[#0b1c33]">{formatHeading(selected.heading)}</p>
        </div>
      </div>

      <div className="mt-4 px-4">
        <p className="text-[9px] tracking-[0.18em] text-[#6d7b88]">DESTINATION</p>
        <p className="mt-1 text-[13px]">{selected.destination || "—"}</p>
        <p className="mt-3 text-[9px] tracking-[0.18em] text-[#6d7b88]">ETA</p>
        <p className="mt-1 font-mono text-[12px]">{selected.eta ? new Date(selected.eta).toLocaleString() : "—"}</p>
      </div>

      <div className="mt-5 border-t border-[#eef2f6] px-4 py-3">
        <p className="mb-1 text-[9px] tracking-[0.18em] text-[#6d7b88]">VESSEL DETAILS</p>
        <Row k="IMO" v={selected.imo || "—"} />
        <Row k="MMSI" v={selected.mmsi || "—"} />
        <Row k="Flag" v={selected.flag || "—"} />
        <Row k="Length" v={selected.length ? `${formatNumber(selected.length)} m` : "—"} />
        <Row k="Beam" v={selected.beam ? `${formatNumber(selected.beam)} m` : "—"} />
        <Row k="Gross Tonnage" v={selected.grossTonnage ? formatNumber(selected.grossTonnage) : "—"} />
      </div>

      <div className="border-t border-[#eef2f6] px-4 py-3">
        <p className="mb-1 text-[9px] tracking-[0.18em] text-[#6d7b88]">CURRENT POSITION</p>
        <Row k="Latitude" v={formatCoord(selected.latitude, "lat")} />
        <Row k="Longitude" v={formatCoord(selected.longitude, "lon")} />
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={() => (track ? clearTrack() : showTrack())}
          className="h-8 flex-1 rounded-full border border-[#d5dee6] text-[10px] tracking-[0.12em] text-[#142033] hover:bg-[#f4f7fa]"
        >
          {track ? "Hide Track" : "View Track"}
        </button>
        <button
          type="button"
          onClick={() => toggleWatch(selected.id)}
          className="flex h-8 items-center gap-1 rounded-full border border-[#d5dee6] px-2 text-[10px] tracking-[0.12em] text-[#142033] hover:bg-[#f4f7fa]"
        >
          <Star className={`size-3 ${isWatched(selected.id) ? "fill-[#e3b341] text-[#e3b341]" : ""}`} />
          {isWatched(selected.id) ? "Watching" : "Watchlist"}
        </button>
      </div>
      {track && (
        <p className="px-4 pb-3 text-[10px] text-[#6d7b88]">
          {trackDemo ? "DEMO TRACK — reconstructed from last reported motion." : "Historical positions from Data Docked."}
        </p>
      )}
    </aside>
  );
}
