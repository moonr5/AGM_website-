import { PORTS, useFleet } from "../../hooks/FleetContext";
import { formatSpeed, labelType } from "../../utils/format";

export function SearchResults() {
  const { search, filtered, selectVessel, selectPort } = useFleet();
  const q = search.trim().toLowerCase();
  if (q.length < 2) return null;

  const ports = PORTS.filter((p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
  const vessels = filtered.slice(0, 8);

  return (
    <div className="absolute left-1/2 top-[72px] z-30 w-[min(520px,calc(100%-24px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#d5dee6] bg-white shadow-[0_16px_40px_rgba(11,28,51,0.12)]">
      {!!vessels.length && (
        <div className="border-b border-[#eef2f6] p-2">
          <p className="mb-1 px-2 text-[10px] tracking-[0.14em] text-[#8a97a4]">VESSELS</p>
          {vessels.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => selectVessel(v)}
              className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left hover:bg-[#f4f7fa]"
            >
              <span>
                <span className="block text-[13px] text-[#142033]">{v.name}</span>
                <span className="text-[11px] text-[#7d8a97]">{labelType(v.type)} · {v.destination || "—"}</span>
              </span>
              <span className="font-mono text-[11px] text-[#0a62a8]">{formatSpeed(v.speed)}</span>
            </button>
          ))}
        </div>
      )}
      {!!ports.length && (
        <div className="p-2">
          <p className="mb-1 px-2 text-[10px] tracking-[0.14em] text-[#8a97a4]">PORTS</p>
          {ports.map((p) => (
            <button key={p.id} type="button" onClick={() => selectPort(p)} className="block w-full rounded-xl px-2 py-1.5 text-left text-[13px] hover:bg-[#f4f7fa]">
              {p.name}
              <span className="ml-2 font-mono text-[10px] text-[#8a97a4]">{p.city}</span>
            </button>
          ))}
        </div>
      )}
      {!vessels.length && !ports.length && (
        <p className="px-4 py-3 text-[13px] text-[#7d8a97]">Nothing in the current picture matches that.</p>
      )}
    </div>
  );
}
