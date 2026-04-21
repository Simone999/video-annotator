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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-6 py-16 text-slate-100">
      <section className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Review route
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-slate-50">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{copy}</p>
        {routeVideoId !== null ? (
          <p
            className={
              tone === "error"
                ? "mt-6 inline-flex rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-100"
                : "mt-6 inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-100"
            }
          >
            Video id {routeVideoId}
          </p>
        ) : null}
        {onBackToLibrary ? (
          <div className="mt-6">
            <button
              className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15"
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
