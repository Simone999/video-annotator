import { RouteStatusShell } from "../../../shared/ui/route-status-shell";

export function ReviewRouteStatusPanel({
  copy,
  onBackToLibrary,
  routeVideoId,
  title,
  tone,
}: {
  copy: string;
  onBackToLibrary?: () => void;
  routeVideoId: string | null;
  title: string;
  tone: "error" | "loading";
}) {
  return (
    <RouteStatusShell
      cardClassName="max-w-2xl"
      copy={copy}
      copyClassName="max-w-xl"
      eyebrow="Review route"
      eyebrowClassName="text-slate-400"
      title={title}
      titleClassName="tracking-[-0.02em]"
    >
      {routeVideoId !== null ? (
        <p
          className={
            tone === "error"
              ? "route-status-badge mt-6 inline-flex border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-100"
              : "route-status-badge mt-6 inline-flex border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100"
          }
        >
          Video id {routeVideoId}
        </p>
      ) : null}
      {onBackToLibrary ? (
        <div className="mt-6">
          <button
            className="ghost-button inline-flex items-center px-4 py-2 text-sm font-medium text-slate-100"
            type="button"
            onClick={onBackToLibrary}
          >
            Back to Library
          </button>
        </div>
      ) : null}
    </RouteStatusShell>
  );
}
