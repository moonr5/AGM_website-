import { useFleet } from "../../hooks/FleetContext";

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="min-w-[88px] border border-[#243140] bg-[#0b1219]/88 px-2.5 py-1.5 backdrop-blur-sm">
      <p className="text-[9px] tracking-[0.18em] text-[#6d7b88]">{label}</p>
      <p className="font-mono text-[18px] leading-none text-[#e8eef4]">{value}</p>
      {hint && <p className="mt-0.5 text-[9px] tracking-[0.12em] text-[#5d6b78]">{hint}</p>}
    </div>
  );
}

export function MapStats() {
  const { filtered, vessels } = useFleet();
  const list = filtered;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
      <Stat label="LIVE FLEET" value={list.length} hint="VESSELS" />
      <Stat label="UNDERWAY" value={list.filter((v) => v.status === "underway").length} />
      <Stat label="AT PORT" value={list.filter((v) => v.status === "at_port").length} />
      <Stat label="APPROACHING" value={list.filter((v) => v.status === "approaching").length} />
      {list.length !== vessels.length && <Stat label="FILTERED FROM" value={vessels.length} />}
    </div>
  );
}
