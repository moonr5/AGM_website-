import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { demoVessels } from "../data/demoVessels";
import { PORTS } from "../data/ports";
import { askAssistant, type AssistantAnswer } from "../services/assistant";
import {
  LiveUnavailableError,
  getVesselById,
  getVesselTrack,
  getVessels,
} from "../services/vesselApi";
import type {
  ActivityItem,
  AlertItem,
  AppView,
  DataMode,
  Port,
  PortActivity,
  TrackPoint,
  Vessel,
  VesselFilters,
} from "../types/vessel";
import { distanceKm, moveVessel } from "../utils/geo";
import { useWatchlist } from "./useWatchlist";

interface FleetState {
  ready: boolean;
  view: AppView;
  setView: (view: AppView) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  vessels: Vessel[];
  filtered: Vessel[];
  selected: Vessel | null;
  selectVessel: (vessel: Vessel | null, fly?: boolean) => void;
  focus: { lng: number; lat: number; zoom?: number } | null;
  clearFocus: () => void;
  filters: VesselFilters;
  setFilters: (patch: Partial<VesselFilters>) => void;
  search: string;
  setSearch: (value: string) => void;
  mode: DataMode;
  setMode: (mode: DataMode) => void;
  liveFailed: boolean;
  liveMessage: string;
  retryLive: () => void;
  picture: DataMode;
  lastUpdate: Date;
  loading: boolean;
  track: TrackPoint[] | null;
  trackDemo: boolean;
  trackIndex: number;
  setTrackIndex: (index: number) => void;
  showTrack: () => void;
  clearTrack: () => void;
  watchIds: string[];
  toggleWatch: (id: string) => void;
  isWatched: (id: string) => boolean;
  selectedPort: Port | null;
  portActivity: PortActivity | null;
  selectPort: (port: Port | null) => void;
  alerts: AlertItem[];
  activity: ActivityItem[];
  highlightIds: string[];
  ask: (question: string) => AssistantAnswer;
  bottomOpen: boolean;
  setBottomOpen: (open: boolean) => void;
}

const FleetContext = createContext<FleetState | null>(null);

const DEFAULT_FILTERS: VesselFilters = {
  type: "all",
  status: "all",
  flag: "",
  destination: "",
  minSpeed: 0,
  maxSpeed: 30,
};

export function FleetProvider({ children }: { children: ReactNode }) {
  const [ready] = useState(true);
  const [view, setView] = useState<AppView>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vessels, setVessels] = useState<Vessel[]>(() => demoVessels());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lng: number; lat: number; zoom?: number } | null>(null);
  const [filters, setFiltersState] = useState<VesselFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const [mode] = useState<DataMode>("live");
  const [picture, setPicture] = useState<DataMode>("demo");
  const [liveFailed, setLiveFailed] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [lastUpdate, setLastUpdate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<TrackPoint[] | null>(null);
  const [trackDemo] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [portActivity, setPortActivity] = useState<PortActivity | null>(null);
  const [alerts] = useState<AlertItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [bottomOpen, setBottomOpen] = useState(true);
  const watch = useWatchlist();
  const inflight = useRef(false);

  const loadLive = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    setLoading(true);
    try {
      const live = await getVessels();
      if (!live.length) throw new LiveUnavailableError("No vessels returned for the monitored areas.");
      setVessels(live);
      setPicture("live");
      setLiveFailed(false);
      setLiveMessage("");
      setLastUpdate(new Date());
      setActivity((prev) => [
        { id: `live-${Date.now()}`, time: new Date().toISOString(), text: `Live picture loaded — ${live.length} vessels` },
        ...prev,
      ].slice(0, 24));
    } catch (err) {
      setPicture("demo");
      setVessels((prev) => (prev.length ? prev : demoVessels()));
      setLiveFailed(true);
      setLiveMessage(err instanceof Error ? err.message : "Unable to retrieve live vessel data.");
      setLastUpdate(new Date());
    } finally {
      inflight.current = false;
      setLoading(false);
    }
  }, []);

  const setMode = useCallback((next: DataMode) => {
    if (next !== "live") return;
    setLiveFailed(false);
    setLiveMessage("");
    setTrack(null);
    void loadLive();
  }, [loadLive]);

  useEffect(() => {
    void loadLive();
  }, [loadLive]);

  useEffect(() => {
    if (picture !== "live") return;
    const t = window.setInterval(() => {
      void loadLive();
    }, 60000);
    return () => window.clearInterval(t);
  }, [picture, loadLive]);

  useEffect(() => {
    if (!vessels.length) return;
    const hours = picture === "live" ? 2 / 3600 : 8 / 60;
    const every = picture === "live" ? 2000 : 600;
    const t = window.setInterval(() => {
      setVessels((prev) => prev.map((v) => moveVessel(v, hours)));
    }, every);
    return () => window.clearInterval(t);
  }, [picture, vessels.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = vessels.filter((v) => {
      if (filters.type !== "all" && v.type !== filters.type) return false;
      if (filters.status !== "all" && v.status !== filters.status) return false;
      if (filters.flag && (v.flag || "").toLowerCase() !== filters.flag.toLowerCase()) return false;
      if (filters.destination && !(v.destination || "").toLowerCase().includes(filters.destination.toLowerCase())) return false;
      if (v.speed < filters.minSpeed || v.speed > filters.maxSpeed) return false;
      if (!q) return true;
      return [v.name, v.imo, v.mmsi, v.destination, v.flag].some((x) => (x || "").toLowerCase().includes(q));
    });
    if (list.length > 500) return list.slice(0, 500);
    return list;
  }, [vessels, filters, search, mode]);

  const selected = useMemo(
    () => vessels.find((v) => v.id === selectedId) || null,
    [vessels, selectedId],
  );

  const selectVessel = useCallback((vessel: Vessel | null, fly = true) => {
    setSelectedId(vessel?.id ?? null);
    setSelectedPort(null);
    setHighlightIds(vessel ? [vessel.id] : []);
    if (vessel && fly) setFocus({ lng: vessel.longitude, lat: vessel.latitude, zoom: 9 });
  }, []);

  const selectPort = useCallback(async (port: Port | null) => {
    setSelectedPort(port);
    setSelectedId(null);
    setTrack(null);
    if (!port) {
      setPortActivity(null);
      return;
    }
    setFocus({ lng: port.longitude, lat: port.latitude, zoom: 9 });
    const nearby = vessels.filter((v) => distanceKm(v.latitude, v.longitude, port.latitude, port.longitude) < 40);
    const dest = vessels.filter((v) => {
      const hay = `${v.destination || ""}`.toLowerCase();
      return hay.includes(port.city.toLowerCase()) || hay.includes(port.name.toLowerCase());
    });
    setPortActivity({
      port,
      approaching: dest.filter((v) => v.status === "approaching" || v.status === "underway").length,
      atPort: nearby.filter((v) => v.status === "at_port" || v.speed < 0.4).length,
      departed: 0,
      arrivals: dest
        .filter((v) => v.eta)
        .sort((a, b) => String(a.eta).localeCompare(String(b.eta)))
        .slice(0, 5)
        .map((v) => ({ name: v.name, eta: v.eta || "—", type: v.type })),
      demo: false,
    });
  }, [vessels]);

  const showTrack = useCallback(async () => {
    if (!selected) return;
    try {
      const key = selected.imo || selected.mmsi || selected.id;
      const points = await getVesselTrack(key);
      if (!points.length) return;
      setTrack(points);
      setTrackIndex(points.length - 1);
    } catch {
      setTrack(null);
    }
  }, [selected]);

  const ask = useCallback((question: string) => {
    const answer = askAssistant(question, vessels);
    setHighlightIds(answer.highlightIds);
    if (answer.highlightIds[0]) {
      const hit = vessels.find((v) => v.id === answer.highlightIds[0]);
      if (hit) {
        setSelectedId(hit.id);
        setFocus({ lng: hit.longitude, lat: hit.latitude, zoom: 8 });
      }
    }
    return answer;
  }, [vessels]);

  const enrich = useCallback(async (vessel: Vessel) => {
    if (mode !== "live" || liveFailed) return;
    const key = vessel.imo || vessel.mmsi;
    if (!key) return;
    try {
      const full = await getVesselById(key);
      if (!full) return;
      setVessels((prev) => prev.map((v) => (v.id === vessel.id ? { ...v, ...full, id: v.id, latitude: v.latitude, longitude: v.longitude } : v)));
    } catch {
      /* keep area record */
    }
  }, [mode, liveFailed]);

  useEffect(() => {
    if (selected) void enrich(selected);
  }, [selected, enrich]);

  const value: FleetState = {
    ready,
    view,
    setView,
    sidebarOpen,
    setSidebarOpen,
    vessels,
    filtered,
    selected,
    selectVessel,
    focus,
    clearFocus: () => setFocus(null),
    filters,
    setFilters: (patch) => setFiltersState((prev) => ({ ...prev, ...patch })),
    search,
    setSearch,
    mode,
    setMode,
    liveFailed,
    liveMessage,
    retryLive: () => {
      void loadLive();
    },
    picture,
    lastUpdate,
    loading,
    track,
    trackDemo,
    trackIndex,
    setTrackIndex,
    showTrack,
    clearTrack: () => setTrack(null),
    watchIds: watch.ids,
    toggleWatch: watch.toggle,
    isWatched: watch.has,
    selectedPort,
    portActivity,
    selectPort,
    alerts,
    activity,
    highlightIds,
    ask,
    bottomOpen,
    setBottomOpen,
  };

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}

export { PORTS };
