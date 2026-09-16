import { useMemo } from "react";
import { TYPE_ORDER } from "../data/demoVessels";
import { PORTS, useFleet } from "../hooks/FleetContext";
import { labelType } from "../utils/format";

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const w = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-[#8a97a4]">{label}</span>
        <span className="font-mono text-[#e8eef4]">{value}</span>
      </div>
      <div className="h-1 bg-[#1c2834]">
        <div className="h-full bg-[#8fb4d6]" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const { vessels, mode } = useFleet();
  const byType = useMemo(() => TYPE_ORDER.map((t) => ({ t, n: vessels.filter((v) => v.type === t).length })), [vessels]);
  const byPort = useMemo(
    () =>
      PORTS.map((p) => ({
        p,
        n: vessels.filter((v) => (v.destination || "").toLowerCase().includes(p.city.toLowerCase()) || (v.destination || "").toLowerCase().includes(p.name.toLowerCase())).length,
      })),
    [vessels],
  );
  const avg = vessels.length ? vessels.reduce((s, v) => s + v.speed, 0) / vessels.length : 0;
  const arrivals = vessels.filter((v) => v.status === "approaching").length;
  const departed = vessels.filter((v) => v.status === "underway").length;
  const hours = [0, 4, 8, 12, 16, 20, 24].map((_, i) => Math.max(4, Math.round(vessels.length * (0.45 + ((i * 17) % 7) / 18))));

  return (
    <div className="mi-scroll h-full overflow-auto bg-[#070c11] p-6">
      <p className="text-[10px] tracking-[0.2em] text-[#6d7b88]">VESSEL ACTIVITY</p>
      <h2 className="mt-1 text-[18px] font-medium">Last 24 hours</h2>
      <p className="mt-1 text-[11px] text-[#7d8a97]">
        {mode === "demo" ? "DEMO DATA — constructed from the current picture, not a live historical series." : "Derived from the live vessels currently loaded."}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="border border-[#1c2834] p-4">
          <p className="mb-3 text-[10px] tracking-[0.16em] text-[#6d7b88]">ACTIVITY OVER TIME</p>
          <div className="flex h-32 items-end gap-2">
            {hours.map((n, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end">
                <div className="w-full bg-[#2a4a62]" style={{ height: `${(n / Math.max(...hours)) * 100}%` }} />
                <span className="mt-1 font-mono text-[9px] text-[#5d6b78]">{i * 4}h</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-[#1c2834] p-4">
          <p className="mb-3 text-[10px] tracking-[0.16em] text-[#6d7b88]">VESSEL TYPES</p>
          {byType.map((row) => (
            <Bar key={row.t} label={labelType(row.t)} value={row.n} max={Math.max(...byType.map((x) => x.n), 1)} />
          ))}
        </section>

        <section className="border border-[#1c2834] p-4">
          <p className="mb-3 text-[10px] tracking-[0.16em] text-[#6d7b88]">PORT ACTIVITY</p>
          {byPort.map((row) => (
            <Bar key={row.p.id} label={row.p.name} value={row.n} max={Math.max(...byPort.map((x) => x.n), 1)} />
          ))}
        </section>

        <section className="grid grid-cols-3 gap-3">
          <div className="border border-[#1c2834] p-4">
            <p className="text-[9px] tracking-[0.16em] text-[#6d7b88]">AVG SPEED</p>
            <p className="mt-2 font-mono text-[22px]">{avg.toFixed(1)}</p>
            <p className="text-[10px] text-[#5d6b78]">kn</p>
          </div>
          <div className="border border-[#1c2834] p-4">
            <p className="text-[9px] tracking-[0.16em] text-[#6d7b88]">ARRIVALS</p>
            <p className="mt-2 font-mono text-[22px]">{arrivals}</p>
            <p className="text-[10px] text-[#5d6b78]">approaching</p>
          </div>
          <div className="border border-[#1c2834] p-4">
            <p className="text-[9px] tracking-[0.16em] text-[#6d7b88]">UNDERWAY</p>
            <p className="mt-2 font-mono text-[22px]">{departed}</p>
            <p className="text-[10px] text-[#5d6b78]">in transit</p>
          </div>
        </section>
      </div>
    </div>
  );
}
