import { VideoLibraryIcon } from "./video-library-icon";

export function VideoLibraryFilters() {
  return (
    <section
      aria-label="Library filters"
      className="mb-8 grid items-center gap-3 xl:grid-cols-[1.5fr_auto_auto]"
    >
      <div className="relative flex h-11 items-center bg-surface-container-low px-3 transition-colors duration-150 hover:bg-surface-container focus-within:bg-surface-container">
        <VideoLibraryIcon
          className="mr-2 text-sm text-on-surface-variant text-slate-500"
          name="search"
        />
        <input
          aria-label="Filter library videos"
          className="w-full appearance-none border-none bg-transparent p-0 text-sm text-on-surface outline-none placeholder-on-surface-variant placeholder:text-slate-500"
          placeholder="Search filename, folder, or tag"
          type="text"
        />
      </div>
      <button
        aria-label="Filter videos by status"
        className="flex h-11 min-w-[180px] items-center justify-between gap-2 border border-outline-variant/20 bg-surface-container-low px-4 text-sm text-on-surface"
        type="button"
      >
        <span>Status: All</span>
        <VideoLibraryIcon className="text-base text-on-surface-variant" name="chevronDown" />
      </button>
      <button
        aria-label="Sort videos by recent activity"
        className="flex h-11 min-w-[180px] items-center justify-between gap-2 border border-outline-variant/20 bg-surface-container-low px-4 text-sm text-on-surface"
        type="button"
      >
        <span>Sort: Recent</span>
        <VideoLibraryIcon className="text-base text-on-surface-variant" name="chevronDown" />
      </button>
    </section>
  );
}
