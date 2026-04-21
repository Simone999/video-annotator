export function VideoLibraryHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <span className="text-lg font-semibold tracking-[0.18em] text-slate-50 uppercase">
            Video Annotation
          </span>
          <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <span className="text-slate-500" aria-hidden="true">
              /
            </span>
            <input
              className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Search videos..."
              type="text"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Settings"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            type="button"
          >
            Settings
          </button>
          <button
            aria-label="Help"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            type="button"
          >
            Help
          </button>
        </div>
      </div>
    </header>
  );
}
