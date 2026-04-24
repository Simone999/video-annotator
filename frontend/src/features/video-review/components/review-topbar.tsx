import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";

export function ReviewTopbar() {
  return (
    <nav
      aria-label="Review chrome"
      className="app-topbar fixed inset-x-0 top-0 z-50 flex h-12 items-center justify-between border-b border-white/5 bg-slate-950/80 bg-slate-900 px-4 font-['Inter'] text-xs font-bold uppercase tracking-tight text-slate-100 backdrop-blur-xl tabular-nums"
    >
      <div className="flex min-w-0 items-center gap-6">
        <span className="text-lg font-black uppercase tracking-widest text-slate-100">
          Video Annotation
        </span>
      </div>
      <div className="flex items-center gap-2 text-slate-400">
        <button
          aria-label="Settings"
          className="inline-flex items-center justify-center p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-200 disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          disabled
          type="button"
        >
          <MaterialSymbolIcon
            className="text-[24px] leading-none"
            name="settings"
          />
        </button>
        <button
          aria-label="Help"
          className="inline-flex items-center justify-center p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-slate-200 disabled:cursor-default disabled:opacity-100 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          disabled
          type="button"
        >
          <MaterialSymbolIcon
            className="text-[24px] leading-none"
            name="help_outline"
          />
        </button>
      </div>
    </nav>
  );
}
