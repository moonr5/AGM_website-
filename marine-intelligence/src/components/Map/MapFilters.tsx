import { STATUS_ORDER, TYPE_ORDER } from "../../data/demoVessels";
import { useFleet } from "../../hooks/FleetContext";
import { labelStatus, labelType } from "../../utils/format";

export function MapFilters() {
  const { filters, setFilters } = useFleet();
  return (
    <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
      <div className="border border-[#243140] bg-[#0b1219]/88 p-2 backdrop-blur-sm">
        <p className="mb-1.5 text-[9px] tracking-[0.18em] text-[#6d7b88]">VESSEL FILTER</p>
        <div className="flex flex-wrap gap-1">
          {(["all", ...TYPE_ORDER] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilters({ type: t })}
              className={`h-6 px-1.5 text-[10px] ${filters.type === t ? "bg-[#d7dee6] text-[#070c11]" : "text-[#8a97a4] hover:text-white"}`}
            >
              {t === "all" ? "All" : labelType(t)}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-[#243140] bg-[#0b1219]/88 p-2 backdrop-blur-sm">
        <p className="mb-1.5 text-[9px] tracking-[0.18em] text-[#6d7b88]">STATUS</p>
        <div className="flex flex-wrap gap-1">
          {(["all", ...STATUS_ORDER] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilters({ status: s })}
              className={`h-6 px-1.5 text-[10px] ${filters.status === s ? "bg-[#d7dee6] text-[#070c11]" : "text-[#8a97a4] hover:text-white"}`}
            >
              {s === "all" ? "All" : labelStatus(s)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
