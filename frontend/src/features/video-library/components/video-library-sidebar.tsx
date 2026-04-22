import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";

export function VideoLibrarySidebar() {
  return (
    <nav
      aria-label="Primary"
      className="app-rail group fixed left-0 top-12 z-40 hidden h-[calc(100vh-3rem)] w-16 shrink-0 flex-col overflow-hidden text-xs font-medium uppercase tracking-tight transition-all duration-200 hover:w-64 focus-within:w-64 lg:flex"
    >
      <div className="flex w-64 flex-1 flex-col gap-1 py-4">
        <button
          className="app-rail-link app-rail-link--active flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left text-sm font-bold"
          type="button"
        >
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="dashboard" />
          <span className="block whitespace-nowrap">Dashboard</span>
        </button>
        <button
          className="app-rail-link flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left text-sm"
          type="button"
        >
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="movie" />
          <span className="block whitespace-nowrap">Videos</span>
        </button>
        <button
          className="app-rail-link flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left text-sm"
          type="button"
        >
          <MaterialSymbolIcon
            className="h-5 w-5 shrink-0"
            name="frame_inspect"
          />
          <span className="block whitespace-nowrap">Review</span>
        </button>
        <button
          className="app-rail-link flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left text-sm"
          type="button"
        >
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="task_alt" />
          <span className="block whitespace-nowrap">Exported</span>
        </button>
      </div>
      <div className="section-rule mt-auto flex w-64 flex-col py-4">
        <button
          className="app-rail-link flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
          type="button"
        >
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="sensors" />
          <span className="block whitespace-nowrap">Local Status</span>
        </button>
      </div>
    </nav>
  );
}
