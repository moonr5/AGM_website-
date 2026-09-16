import { useState } from "react";
import { PORTS, useFleet } from "../../hooks/FleetContext";
import { formatClock, formatSpeed, labelStatus, relativeTime } from "../../utils/format";

const TABS = ["ACTIVITY", "VESSELS", "PORTS", "ALERTS"] as const;

export function BottomPanel() {
  const { bottomOpen, setBottomOpen, activity, filtered, selectVessel, selectPort, alerts, view } = useFleet();
  const [tab, setTab] = useState<(typeof TABS)[number]>("ACTIVITY");

  if (view === "analytics") return null;

  return (
    <section className={`hidden border-t border-[#1c2834] bg-[#0b1219] md:block ${bottomOpen ? "h-[168px]" : "h-8"}`}>
      <div className="flex h-8 items-center gap-3 border-b border-[#1c2834] px-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setBottomOpen(true); }}
            className={`text-[10px] tracking-[0.16em] ${tab === t && bottomOpen ? "text-white" : "text-[#6d7b88]"}`}
          >
            {t}
          </button>
        ))}
        <button type="button" onClick={() => setBottomOpen(!bottomOpen)} className="ml-auto text-[10px] tracking-[0.14em] text-[#6d7b88]">
          {bottomOpen ? "HIDE" : "LIVE ACTIVITY"}
        </button>
      </div>
      {bottomOpen && (
        <div className="mi-scroll h-[136px] overflow-auto">
          {tab === "ACTIVITY" && (
            <ul>
              {activity.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.vesselId) return;
                      const v = filtered.find((x) => x.id === item.vesselId);
                      if (v) selectVessel(v);
                    }}
                    className="flex w-full gap-4 px-3 py-1.5 text-left hover:bg-[#101820]"
                  >
                    <span className="w-16 font-mono text-[10px] text-[#6d7b88]">{formatClock(new Date(item.time))}</span>
                    <span className="text-[12px] text-[#d7dee6]">{item.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {tab === "VESSELS" && (
            <table className="w-full text-left text-[11px]">
              <thead className="text-[9px] tracking-[0.14em] text-[#6d7b88]">
                <tr>
                  <th className="px-3 py-1 font-normal">NAME</th>
                  <th className="font-normal">TYPE</th>
                  <th className="font-normal">STATUS</th>
                  <th className="font-normal">SPD</th>
                  <th className="font-normal">DEST</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((v) => (
                  <tr key={v.id} className="cursor-pointer hover:bg-[#101820]" onClick={() => selectVessel(v)}>
                    <td className="px-3 py-1 text-[#e8eef4]">{v.name}</td>
                    <td className="uppercase text-[#8a97a4]">{v.type}</td>
                    <td>{labelStatus(v.status)}</td>
                    <td className="font-mono">{formatSpeed(v.speed)}</td>
                    <td>{v.destination || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "PORTS" && (
            <div className="grid grid-cols-3 gap-2 p-3">
              {PORTS.map((p) => (
                <button key={p.id} type="button" onClick={() => selectPort(p)} className="border border-[#243140] px-2 py-2 text-left hover:bg-[#14202c]">
                  <p className="text-[12px] text-white">{p.name}</p>
                  <p className="font-mono text-[10px] text-[#6d7b88]">{p.locode}</p>
                </button>
              ))}
            </div>
          )}
          {tab === "ALERTS" && (
            <ul>
              {alerts.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-3 py-1.5">
                  <span className={`mt-1 size-1.5 rounded-full ${a.severity === "warning" ? "bg-[#e3b341]" : a.severity === "notice" ? "bg-[#6ea8ff]" : "bg-[#7d8a97]"}`} />
                  <div>
                    <p className="text-[10px] tracking-[0.14em] text-[#8a97a4]">{a.severity.toUpperCase()} · {relativeTime(a.time)}</p>
                    <p className="text-[12px] text-[#e8eef4]">{a.title}</p>
                    <p className="text-[11px] text-[#8a97a4]">{a.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
