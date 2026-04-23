import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";

export function ReviewTopbar() {
  return (
    <nav
      aria-label="Review chrome"
      className="app-topbar fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-6 text-xs font-bold uppercase tracking-[0.18em]"
    >
      <div className="flex min-w-0 items-center gap-8">
        <span className="text-lg font-black uppercase tracking-[0.24em] text-slate-50">
          Video Annotation
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Settings"
          className="ghost-button inline-flex h-9 w-9 items-center justify-center border border-white/10 text-slate-300"
          disabled
          type="button"
        >
          <MaterialSymbolIcon className="h-5 w-5" name="settings" />
        </button>
        <button
          aria-label="Help"
          className="ghost-button inline-flex h-9 w-9 items-center justify-center border border-white/10 text-slate-300"
          disabled
          type="button"
        >
          <MaterialSymbolIcon className="h-5 w-5" name="help" />
        </button>
      </div>
    </nav>
  );
}
