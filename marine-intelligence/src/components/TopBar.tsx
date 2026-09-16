import { Search } from "lucide-react";
import { useFleet } from "../hooks/FleetContext";
import { formatClock } from "../utils/format";

export function TopBar() {
  const { search, setSearch, picture, lastUpdate, loading, filtered } = useFleet();
  const live = picture === "live";

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[1300] flex justify-center px-3 pt-3">
      <div className="pointer-events-auto flex w-full max-w-[920px] items-center gap-3 rounded-full border border-white/70 bg-white/88 px-3 py-1.5 shadow-[0_8px_28px_rgba(11,28,51,0.08)] backdrop-blur-md">
        <a href="/en/" className="shrink-0 pl-1 leading-none">
          <p className="text-[10px] font-semibold text-[#0a62a8]">AGM</p>
          <p className="mt-0.5 text-[10px] text-[#6d7b88]">Map</p>
        </a>

        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8a97a4]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a vessel or port"
            className="h-8 w-full rounded-full border-0 bg-[#f4f7fa] pl-8 pr-3 text-[13px] text-[#142033] outline-none placeholder:text-[#8a97a4]"
          />
        </label>

        <p className="hidden font-mono text-[11px] text-[#5d6b78] sm:block">{filtered.length} ships</p>

        <div className="hidden items-center gap-1.5 pr-1 sm:flex">
          <span className={`size-1.5 rounded-full ${live ? "pulse-live bg-[#1aa05a]" : "bg-[#c9842a]"}`} />
          <span className="text-[10px] text-[#5d6b78]">
            {loading ? "Updating" : live ? "Live" : "Demo"} {formatClock(lastUpdate)}
          </span>
        </div>
      </div>
    </header>
  );
}
