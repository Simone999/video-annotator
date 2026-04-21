import { VideoLibraryIcon } from "./video-library-icon";

export function VideoLibraryHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <span className="text-base font-semibold uppercase tracking-[0.24em] text-slate-50">
            Video Annotation
          </span>
          <label className="flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 lg:min-w-[22rem]">
            <VideoLibraryIcon
              className="h-4 w-4 shrink-0 text-slate-500"
              name="search"
            />
            <input
              aria-label="Search library navigation"
              className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Search videos"
              type="text"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            aria-label="Library settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
            type="button"
          >
            <VideoLibraryIcon className="h-4 w-4" name="settings" />
          </button>
          <button
            aria-label="Library help"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
            type="button"
          >
            <VideoLibraryIcon className="h-4 w-4" name="help" />
          </button>
        </div>
      </div>
    </header>
  );
}
