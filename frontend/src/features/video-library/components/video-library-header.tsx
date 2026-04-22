import { VideoLibraryIcon } from "./video-library-icon";

export function VideoLibraryHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-12 w-full items-center justify-between border-b border-white/5 bg-slate-900 px-4 text-slate-100 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-6">
        <span className="text-lg font-black uppercase tracking-[0.24em] text-slate-50">
          Video Annotation
        </span>
        <label className="hidden min-w-[16rem] items-center border-b border-slate-700 bg-slate-800/70 px-2 py-1 text-sm text-slate-300 md:flex md:w-64">
          <VideoLibraryIcon
            className="h-4 w-4 shrink-0 text-slate-500"
            name="search"
          />
          <input
            aria-label="Search library navigation"
            className="w-full min-w-0 bg-transparent px-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Search videos..."
            type="text"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Library settings"
          className="inline-flex h-8 w-8 items-center justify-center text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          type="button"
        >
          <VideoLibraryIcon className="h-4 w-4" name="settings" />
        </button>
        <button
          aria-label="Library help"
          className="inline-flex h-8 w-8 items-center justify-center text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          type="button"
        >
          <VideoLibraryIcon className="h-4 w-4" name="help" />
        </button>
      </div>
    </header>
  );
}
