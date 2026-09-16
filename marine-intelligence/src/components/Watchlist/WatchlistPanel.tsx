import { useFleet } from "../../hooks/FleetContext";
import { formatSpeed, labelStatus } from "../../utils/format";

export function WatchlistPanel() {
  const { view, watchIds, vessels, selectVessel } = useFleet();
  if (view !== "watchlist") return null;
  const list = vessels.filter((v) => watchIds.includes(v.id));

  return (
    <aside className="sheet-enter absolute left-0 top-0 z-10 m-3 w-[260px] border border-[#243140] bg-[#0b1219]/94 p-3 backdrop-blur-sm">
      <p className="text-[10px] tracking-[0.18em] text-[#6d7b88]">WATCHLIST</p>
      {!list.length && <p className="mt-3 text-[12px] text-[#7d8a97]">No vessels saved. Open a ship and add it to the watchlist.</p>}
      {list.map((v) => (
        <button key={v.id} type="button" onClick={() => selectVessel(v)} className="mt-3 block w-full text-left">
          <p className="text-[12px] text-white">{v.name}</p>
          <p className="text-[10px] text-[#8a97a4]">● {labelStatus(v.status)} · {formatSpeed(v.speed)}</p>
        </button>
      ))}
    </aside>
  );
}
