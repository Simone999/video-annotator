export function VideoLibrarySidebar() {
  return (
    <nav
      aria-label="Primary"
      className="hidden w-52 shrink-0 flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 lg:flex"
    >
      <button
        className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-slate-50"
        type="button"
      >
        Dashboard
      </button>
      <button
        className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
        type="button"
      >
        Videos
      </button>
      <button
        className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
        type="button"
      >
        Review
      </button>
      <button
        className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
        type="button"
      >
        Exported
      </button>
      <div className="flex-1" />
      <button
        className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
        type="button"
      >
        Local Status
      </button>
    </nav>
  );
}
