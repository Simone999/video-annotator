import { VideoLibraryIcon } from "./video-library-icon";

export function VideoLibraryFilters() {
  return (
    <section
      aria-label="Library filters"
      className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]"
    >
      <label className="flex min-w-0 items-center gap-3 border border-white/10 bg-slate-900 px-3 py-3 text-sm text-slate-300">
        <VideoLibraryIcon
          className="h-4 w-4 shrink-0 text-slate-500"
          name="search"
        />
        <input
          aria-label="Filter library videos"
          className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Search filename, folder, or tag"
          type="text"
        />
      </label>
      <button
        aria-label="Filter videos by status"
        className="inline-flex min-w-[180px] items-center justify-between gap-2 border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-800"
        type="button"
      >
        Status: All
        <VideoLibraryIcon
          className="h-4 w-4 text-slate-400"
          name="chevronDown"
        />
      </button>
      <button
        aria-label="Sort videos by recent activity"
        className="inline-flex min-w-[180px] items-center justify-between gap-2 border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-800"
        type="button"
      >
        Sort: Recent
        <VideoLibraryIcon
          className="h-4 w-4 text-slate-400"
          name="chevronDown"
        />
      </button>
    </section>
  );
}
