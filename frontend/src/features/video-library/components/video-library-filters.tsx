export function VideoLibraryFilters() {
  return (
    <section
      aria-label="Library filters"
      className="flex flex-col gap-3 xl:flex-row"
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
        <span className="text-slate-500" aria-hidden="true">
          /
        </span>
        <input
          className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Search filename, folder, or tag"
          type="text"
        />
      </label>
      <button
        className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
        type="button"
      >
        Status: All
      </button>
      <button
        className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
        type="button"
      >
        Sort: Recent
      </button>
    </section>
  );
}
