import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";

export function ReviewRail() {
  return (
    <nav
      aria-label="Primary"
      className="app-rail fixed bottom-0 left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-16 flex-col overflow-hidden text-xs font-medium uppercase tracking-tight transition-all duration-200 hover:w-64 focus-within:w-64 lg:flex"
    >
      <div className="flex w-64 flex-1 flex-col gap-1 py-4">
        <div className="app-rail-link flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left">
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="dashboard" />
          Dashboard
        </div>
        <div className="app-rail-link flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left">
          <MaterialSymbolIcon
            className="h-5 w-5 shrink-0"
            name="precision_manufacturing"
          />
          Workspace
        </div>
        <div className="app-rail-link app-rail-link--active flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left font-bold">
          <MaterialSymbolIcon
            className="h-5 w-5 shrink-0"
            name="visibility_lock"
          />
          Review
        </div>
        <div className="app-rail-link flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-left">
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="ios_share" />
          Export
        </div>
      </div>
      <div className="section-rule mt-auto w-64 py-4">
        <div className="app-rail-link flex w-full items-center gap-3 px-4 py-3 text-left">
          <MaterialSymbolIcon className="h-5 w-5 shrink-0" name="sensors" />
          System Status
        </div>
      </div>
    </nav>
  );
}
