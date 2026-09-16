import { Activity, Anchor, Eye, LayoutGrid, Ship } from "lucide-react";
import { useFleet } from "../hooks/FleetContext";
import type { AppView } from "../types/vessel";

const ITEMS: { id: AppView; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Map", icon: LayoutGrid },
  { id: "fleet", label: "Fleet", icon: Ship },
  { id: "ports", label: "Ports", icon: Anchor },
  { id: "watchlist", label: "Watch", icon: Eye },
  { id: "analytics", label: "Stats", icon: Activity },
];

export function MobileNav() {
  const { view, setView } = useFleet();
  return (
    <nav className="flex h-12 shrink-0 items-center justify-around border-t border-[#1c2834] bg-[#0b1219] md:hidden">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const on = view === item.id;
        return (
          <button key={item.id} type="button" onClick={() => setView(item.id)} className={`grid place-items-center text-[9px] tracking-[0.08em] ${on ? "text-white" : "text-[#6d7b88]"}`}>
            <Icon className="mb-0.5 size-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
