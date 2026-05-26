export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0f141a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-[#4d6077]">Loading…</p>
      </div>
    </div>
  );
}
