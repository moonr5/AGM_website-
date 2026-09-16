export function BootScreen() {
  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[#e8eef4]">
      <p className="text-[10px] tracking-[0.42em] text-[#0a62a8]">AGM</p>
      <h1 className="mt-3 text-[20px] font-medium tracking-[0.16em] text-[#0b1c33]">MARINE MAP</h1>
      <p className="mt-2 text-[12px] text-[#6d7b88]">Loading live AIS…</p>
    </div>
  );
}
