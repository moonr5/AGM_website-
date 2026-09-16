import { Activity, Anchor, Eye, LayoutGrid, PanelLeftClose, PanelLeftOpen, Ship } from "lucide-react";
import { STATUS_ORDER, TYPE_ORDER } from "../data/demoVessels";
import { PORTS, useFleet } from "../hooks/FleetContext";
import type { AppView } from "../types/vessel";
import { labelStatus, labelType } from "../utils/format";

const NAV: { id: AppView; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "fleet", label: "Live Fleet", icon: Ship },
  { id: "ports", label: "Ports", icon: Anchor },
  { id: "watchlist", label: "Watchlist", icon: Eye },
  { id: "analytics", label: "Analytics", icon: Activity },
];

export function Sidebar() {
  const { view, setView, sidebarOpen, setSidebarOpen, filters, setFilters, vessels, mode, setMode, liveFailed } = useFleet();
  const flags = [...new Set(vessels.map((v) => v.flag).filter(Boolean))] as string[];

  return (
    <aside className={`hidden shrink-0 flex-col border-r border-[#1c2834] bg-[#0b1219] md:flex ${sidebarOpen ? "w-[220px]" : "w-[52px]"}`}>
      <div className="flex items-center justify-end px-2 py-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="grid size-7 place-items-center text-[#7d8a97] hover:text-white"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
        </button>
      </div>

      <nav className="px-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const on = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`mb-0.5 flex h-8 w-full items-center gap-2.5 px-2 text-[12px] ${on ? "bg-[#14202c] text-white" : "text-[#8a97a4] hover:bg-[#101820] hover:text-[#d7dee6]"}`}
            >
              <Icon className="size-3.5 shrink-0" />
              {sidebarOpen && item.label}
            </button>
          );
        })}
      </nav>

      {sidebarOpen && (
        <div className="mi-scroll mt-4 flex-1 overflow-auto px-3 pb-3">
          <p className="mb-2 text-[10px] tracking-[0.2em] text-[#5d6b78]">DATA SOURCE</p>
          <div className="mb-4 grid grid-cols-2 gap-1">
            {(["demo", "live"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`h-7 text-[10px] tracking-[0.14em] ${mode === id ? "bg-[#14202c] text-white" : "text-[#7d8a97] hover:text-white"}`}
              >
                {id === "live" ? "● LIVE" : "○ DEMO"}
              </button>
            ))}
          </div>
          {liveFailed && <p className="mb-3 text-[10px] leading-4 text-[#e3b341]">Live unavailable. Showing DEMO DATA.</p>}

          <p className="mb-2 text-[10px] tracking-[0.2em] text-[#5d6b78]">FILTERS</p>
          <label className="mb-2 block text-[10px] text-[#7d8a97]">
            Vessel Type
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value as typeof filters.type })}
              className="mt-1 h-7 w-full border border-[#243140] bg-[#0a1016] px-2 text-[11px] text-[#d7dee6]"
            >
              <option value="all">All</option>
              {TYPE_ORDER.map((t) => (
                <option key={t} value={t}>{labelType(t)}</option>
              ))}
            </select>
          </label>
          <label className="mb-2 block text-[10px] text-[#7d8a97]">
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
              className="mt-1 h-7 w-full border border-[#243140] bg-[#0a1016] px-2 text-[11px] text-[#d7dee6]"
            >
              <option value="all">All</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{labelStatus(s)}</option>
              ))}
            </select>
          </label>
          <label className="mb-2 block text-[10px] text-[#7d8a97]">
            Flag
            <select
              value={filters.flag}
              onChange={(e) => setFilters({ flag: e.target.value })}
              className="mt-1 h-7 w-full border border-[#243140] bg-[#0a1016] px-2 text-[11px] text-[#d7dee6]"
            >
              <option value="">All</option>
              {flags.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="mb-2 block text-[10px] text-[#7d8a97]">
            Destination
            <input
              value={filters.destination}
              onChange={(e) => setFilters({ destination: e.target.value })}
              className="mt-1 h-7 w-full border border-[#243140] bg-[#0a1016] px-2 text-[11px] text-[#d7dee6]"
              placeholder="Jakarta, Marunda…"
            />
          </label>
          <label className="block text-[10px] text-[#7d8a97]">
            Speed 0–{filters.maxSpeed} kn
            <input
              type="range"
              min={0}
              max={30}
              value={filters.maxSpeed}
              onChange={(e) => setFilters({ maxSpeed: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </label>

          {view === "ports" && (
            <div className="mt-4">
              <p className="mb-2 text-[10px] tracking-[0.2em] text-[#5d6b78]">PORTS</p>
              {PORTS.map((p) => (
                <PortLink key={p.id} id={p.id} name={p.name} city={p.city} />
              ))}
            </div>
          )}
        </div>
      )}

      {sidebarOpen && (
        <div className="border-t border-[#1c2834] px-3 py-3">
          <p className="text-[10px] tracking-[0.14em] text-[#c5d0dc]">AGM MARINE OPERATIONS</p>
          <p className="mt-1 font-mono text-[10px] text-[#96f878]">System Online</p>
        </div>
      )}
    </aside>
  );
}

function PortLink({ id, name, city }: { id: string; name: string; city: string }) {
  const { selectPort, selectedPort } = useFleet();
  const port = PORTS.find((p) => p.id === id);
  if (!port) return null;
  return (
    <button
      type="button"
      onClick={() => selectPort(port)}
      className={`mb-0.5 block w-full px-1 py-1 text-left text-[11px] ${selectedPort?.id === id ? "text-white" : "text-[#8a97a4] hover:text-white"}`}
    >
      {name}
      <span className="block font-mono text-[10px] text-[#5d6b78]">{city}</span>
    </button>
  );
}
