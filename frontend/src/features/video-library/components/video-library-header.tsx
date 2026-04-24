import { VideoLibraryIcon } from "./video-library-icon";

export function VideoLibraryHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-12 w-full items-center justify-between border-b border-white/5 bg-slate-950/80 bg-slate-900 px-4 font-['Inter'] tabular-nums tracking-tight backdrop-blur-xl lg:px-6">
      <div className="flex min-w-0 items-center gap-6">
        <span className="text-lg font-black uppercase tracking-widest text-slate-100">
          Video Annotation
        </span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <button
          aria-label="Library settings"
          className="inline-flex items-center justify-center p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-800"
          type="button"
        >
          <VideoLibraryIcon className="text-[24px] leading-none" name="settings" />
        </button>
        <button
          aria-label="Library help"
          className="inline-flex items-center justify-center p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-800"
          type="button"
        >
          <VideoLibraryIcon className="text-[24px] leading-none" name="help" />
        </button>
      </div>
    </header>
  );
}
