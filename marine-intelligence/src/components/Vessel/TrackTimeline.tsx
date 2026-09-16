import { useFleet } from "../../hooks/FleetContext";
import { formatClock } from "../../utils/format";

export function TrackTimeline() {
  const { track, trackIndex, setTrackIndex, trackDemo } = useFleet();
  if (!track?.length) return null;
  const point = track[trackIndex];
  return (
    <div className="absolute bottom-4 left-1/2 z-20 w-[min(560px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-[0_8px_24px_rgba(11,28,51,0.1)] backdrop-blur-md">
      <div className="mb-1 flex items-center justify-between text-[10px] tracking-[0.12em] text-[#6d7b88]">
        <span>{trackDemo ? "DEMO TRACK" : "VESSEL TRACK"}</span>
        <span className="font-mono text-[#142033]">{point ? formatClock(new Date(point.time)) : ""}</span>
      </div>
      <input
        type="range"
        min={0}
        max={track.length - 1}
        value={trackIndex}
        onChange={(e) => setTrackIndex(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
