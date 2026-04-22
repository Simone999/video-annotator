export function VideoLibrarySidebar() {
  return (
    <nav
      aria-label="Primary"
      className="group fixed left-0 top-12 z-40 hidden h-[calc(100vh-3rem)] w-16 shrink-0 flex-col overflow-hidden border-r border-white/5 bg-slate-900 text-xs font-medium uppercase tracking-tight text-slate-500 transition-all duration-200 hover:w-64 focus-within:w-64 lg:flex"
    >
      <div className="flex w-64 flex-1 flex-col gap-1 py-4">
        <button
          className="w-full border-l-2 border-blue-500 bg-blue-500/10 px-4 py-3 text-left text-sm font-bold text-blue-400 transition hover:bg-slate-800 hover:text-slate-100 focus-visible:bg-slate-800 focus-visible:text-slate-100"
          type="button"
        >
          <span className="block whitespace-nowrap">Dashboard</span>
        </button>
        <button
          className="w-full border-l-2 border-transparent px-4 py-3 text-left text-sm transition hover:bg-slate-800 hover:text-slate-100 focus-visible:bg-slate-800 focus-visible:text-slate-100"
          type="button"
        >
          <span className="block whitespace-nowrap">Videos</span>
        </button>
        <button
          className="w-full border-l-2 border-transparent px-4 py-3 text-left text-sm transition hover:bg-slate-800 hover:text-slate-100 focus-visible:bg-slate-800 focus-visible:text-slate-100"
          type="button"
        >
          <span className="block whitespace-nowrap">Review</span>
        </button>
        <button
          className="w-full border-l-2 border-transparent px-4 py-3 text-left text-sm transition hover:bg-slate-800 hover:text-slate-100 focus-visible:bg-slate-800 focus-visible:text-slate-100"
          type="button"
        >
          <span className="block whitespace-nowrap">Exported</span>
        </button>
      </div>
      <div className="mt-auto flex w-64 flex-col border-t border-white/5 py-4">
        <button
          className="w-full px-4 py-3 text-left text-sm transition hover:bg-slate-800 hover:text-slate-100 focus-visible:bg-slate-800 focus-visible:text-slate-100"
          type="button"
        >
          <span className="block whitespace-nowrap">Local Status</span>
        </button>
      </div>
    </nav>
  );
}
