import { X } from "lucide-react";
import { useFleet } from "../../hooks/FleetContext";

export function PortPanel() {
  const { selectedPort, portActivity, selectPort, selectVessel, vessels } = useFleet();
  if (!selectedPort || !portActivity) return null;

  return (
    <aside className="sheet-enter absolute inset-x-0 bottom-0 z-20 max-h-[70vh] overflow-auto rounded-t-2xl border border-[#d5dee6] bg-white shadow-[0_-8px_40px_rgba(11,28,51,0.1)] md:inset-y-3 md:right-3 md:bottom-auto md:left-auto md:w-[320px] md:rounded-2xl">
      <div className="flex items-start justify-between px-4 pt-3">
        <div>
          <p className="text-[13px] tracking-[0.08em] text-[#0b1c33]">{selectedPort.name.toUpperCase()}</p>
          <p className="mt-1 font-mono text-[10px] text-[#6d7b88]">{selectedPort.locode} · {selectedPort.city}</p>
        </div>
        <button type="button" onClick={() => selectPort(null)} aria-label="Close" className="text-[#7d8a97]">
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-3 px-4 text-[10px] text-[#0a62a8]">
        Live port activity
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 px-4">
        {[
          ["Approaching", portActivity.approaching],
          ["At Port", portActivity.atPort],
          ["Departed", portActivity.departed],
        ].map(([k, v]) => (
          <div key={String(k)}>
            <p className="text-[9px] tracking-[0.12em] text-[#6d7b88]">{k}</p>
            <p className="font-mono text-[18px]">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 px-4 pb-4">
        <p className="mb-2 text-[9px] tracking-[0.18em] text-[#6d7b88]">NEXT ARRIVALS</p>
        {portActivity.arrivals.length === 0 && <p className="text-[12px] text-[#7d8a97]">No expected arrivals in this picture.</p>}
        {portActivity.arrivals.map((a) => {
          const match = vessels.find((v) => v.name === a.name);
          return (
            <button
              key={a.name + a.eta}
              type="button"
              onClick={() => match && selectVessel(match)}
              className="mb-2 block w-full text-left"
            >
              <p className="text-[12px] text-white">{a.name}</p>
              <p className="font-mono text-[10px] text-[#6d7b88]">ETA {a.eta.includes("T") ? new Date(a.eta).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : a.eta}</p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
