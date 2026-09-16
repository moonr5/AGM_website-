import { useFleet } from "../hooks/FleetContext";

export function ErrorBanner() {
  const { liveFailed, liveMessage, retryLive, loading, picture } = useFleet();
  if (!liveFailed || picture === "live") return null;
  return (
    <div className="pointer-events-auto absolute left-1/2 top-[76px] z-[1200] w-[min(420px,calc(100%-24px))] -translate-x-1/2 rounded-2xl border border-[#ead9a8] bg-[#fff8e8] p-3 shadow-sm">
      <p className="text-[11px] text-[#8a6a16]">Live AIS unavailable</p>
      <p className="mt-1 text-[12px] leading-5 text-[#3d4f63]">
        {liveMessage || "Unable to retrieve live vessel data."} The map is showing local demo traffic until Data Docked credits are available.
      </p>
      <button
        type="button"
        data-retry-live
        onClick={retryLive}
        disabled={loading}
        className="mt-3 h-7 rounded-full bg-white px-3 text-[11px] text-[#142033] disabled:opacity-60"
      >
        {loading ? "Trying live…" : "Retry live"}
      </button>
    </div>
  );
}
