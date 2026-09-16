import { BootScreen } from "./components/BootScreen";
import { ErrorBanner } from "./components/ErrorBanner";
import { FleetMap } from "./components/Map/FleetMap";
import { SearchResults } from "./components/Search/SearchResults";
import { TopBar } from "./components/TopBar";
import { TrackTimeline } from "./components/Vessel/TrackTimeline";
import { VesselPanel } from "./components/Vessel/VesselPanel";
import { PortPanel } from "./components/Port/PortPanel";
import { FleetProvider, useFleet } from "./hooks/FleetContext";

function Shell() {
  const { ready, loading, picture } = useFleet();
  if (!ready) return <BootScreen />;

  return (
    <div className="relative h-full" data-desk="ready" data-picture={picture}>
      <FleetMap />
      <TopBar />
      <SearchResults />
      <ErrorBanner />
      <TrackTimeline />
      <VesselPanel />
      <PortPanel />
      {loading && (
        <p className="absolute bottom-4 left-4 z-20 rounded-full bg-white/90 px-3 py-1 text-[11px] text-[#4a5a68] shadow-sm">
          Updating the picture…
        </p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <FleetProvider>
      <Shell />
    </FleetProvider>
  );
}
