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
    <main className="route-status-screen flex min-h-screen items-center justify-center px-6 py-16 text-slate-100">
      <section className="route-status-card w-full max-w-2xl p-8">
        <p className="console-kicker text-xs font-semibold text-slate-400">
          Review route
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-slate-50">
          {title}
        </h1>
        <p className="console-copy mt-3 max-w-xl text-sm leading-6">{copy}</p>
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
      </section>
    </main>
  );
}
