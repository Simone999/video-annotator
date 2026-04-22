export function ReviewTopbar({
  currentFrameIndex,
  selectedVideo,
}: {
  currentFrameIndex: number;
  selectedVideo: {
    display_name: string;
    fps: number;
    frame_count: number;
  } | null;
}) {
  return (
    <nav className="app-topbar fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-6 text-xs font-bold uppercase tracking-[0.18em]">
      <div className="flex min-w-0 items-center gap-8">
        <span className="text-lg font-black uppercase tracking-[0.24em] text-slate-50">
          Video Annotation
        </span>
        <div className="flex items-center gap-3 font-medium normal-case text-[11px] tracking-normal text-slate-300">
          <button
            aria-label="Save Session"
            className="ghost-button px-3 py-2 text-slate-300"
            type="button"
          >
            Save Session
          </button>
          <button
            aria-label="Export"
            className="primary-button px-3 py-2 text-cyan-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
            disabled
            type="button"
          >
            Export
          </button>
        </div>
      </div>
      <div className="hidden items-center gap-6 font-mono text-[11px] normal-case tracking-normal text-slate-400 xl:flex">
        <span>
          Video:{" "}
          <span className="text-slate-100">
            {selectedVideo?.display_name ?? "Unselected"}
          </span>
        </span>
        <span>
          Frames:{" "}
          <span className="text-slate-100">
            {selectedVideo?.frame_count ?? "—"}
          </span>
        </span>
        <span>
          Current:{" "}
          <span className="font-bold text-cyan-300">
            {selectedVideo === null ? "—" : String(currentFrameIndex)}
          </span>
        </span>
        <span>
          FPS:{" "}
          <span className="text-slate-100">
            {selectedVideo === null
              ? "—"
              : formatFramesPerSecond(selectedVideo.fps)}
          </span>
        </span>
      </div>
    </nav>
  );
}

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
