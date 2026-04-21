import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";

export function ReviewVideoListPanel({
  controller,
  onBackToLibrary,
  routeMode,
  workspace,
}: {
  controller: LiveReviewController;
  onBackToLibrary?: () => void;
  routeMode: boolean;
  workspace: VideoReviewWorkspace;
}) {
  const selectedVideo = controller.selectedVideo;

  return (
    <aside
      aria-label={routeMode ? "Review overview" : "Video list"}
      className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {routeMode ? "Review route" : "Indexed videos"}
      </p>
      {onBackToLibrary ? (
        <button
          className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15"
          type="button"
          onClick={onBackToLibrary}
        >
          Back to Library
        </button>
      ) : null}
      <h1
        id="workspace-title"
        className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-slate-50"
      >
        {selectedVideo?.display_name ?? "Choose review target"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        {routeMode
          ? "Route-owned review workspace"
          : `Canonical exact-frame index: ${String(workspace.reviewState.currentFrameIndex)}`}
      </p>
      {selectedVideo !== null ? (
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-200">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Current frame
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-50">
              {workspace.reviewState.currentFrameIndex}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Resolution
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-50">
              {selectedVideo.width}×{selectedVideo.height}
            </dd>
          </div>
        </dl>
      ) : null}

      {!routeMode ? (
        <div className="mt-5 space-y-3">
          {workspace.listStatus === "loading" ? (
            <p className="text-sm leading-6 text-slate-300">
              Loading indexed videos...
            </p>
          ) : null}

          {workspace.listStatus === "empty" ? (
            <p className="text-sm leading-6 text-slate-300">
              No indexed videos found yet.
            </p>
          ) : null}

          {workspace.listStatus === "error" ? (
            <p className="text-sm leading-6 text-rose-200">
              {workspace.errorMessage}
            </p>
          ) : null}

          {workspace.listStatus === "ready" ? (
            <ul aria-label="Indexed videos" className="space-y-2">
              {workspace.indexedVideos.map((video) => (
                <li key={video.id}>
                  <button
                    aria-pressed={workspace.activeVideoId === video.id}
                    className={
                      workspace.activeVideoId === video.id
                        ? "flex w-full items-center justify-between rounded-2xl border border-sky-300/35 bg-sky-500/15 px-4 py-3 text-left text-sm font-medium text-sky-50 transition"
                        : "flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-slate-900/70"
                    }
                    type="button"
                    onClick={() => {
                      void workspace.selectVideo(video.id);
                    }}
                  >
                    <span>Open {video.display_name}</span>
                    <span
                      aria-hidden="true"
                      className="text-xs uppercase tracking-[0.18em] text-slate-400"
                    >
                      review
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section
        aria-label="Review objects"
        className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Review objects
        </p>
        {selectedVideo === null ? (
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Select video before choosing persisted objects.
          </p>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  New object label
                </span>
                <input
                  aria-label="New object label"
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300/40 focus:bg-slate-950/80"
                  type="text"
                  value={controller.newObjectLabel}
                  onChange={(event) => {
                    controller.setNewObjectLabel(event.target.value);
                  }}
                />
              </label>
              <button
                className="inline-flex items-center rounded-full border border-sky-300/30 bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-50 transition hover:border-sky-200/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={controller.newObjectLabel.trim().length === 0}
                type="button"
                onClick={() => {
                  void controller.handleCreateObject();
                }}
              >
                Create object
              </button>
            </div>
            {controller.objectPanelError !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {controller.objectPanelError}
              </p>
            ) : null}
            <div className="mt-4 space-y-2" role="list">
              {controller.objectSummaries.map((objectSummary) => (
                <button
                  key={objectSummary.id}
                  aria-pressed={
                    controller.selectedObjectId === objectSummary.id
                  }
                  className={
                    controller.selectedObjectId === objectSummary.id
                      ? "flex w-full items-center gap-3 rounded-2xl border border-sky-300/35 bg-sky-500/15 px-4 py-3 text-left transition"
                      : "flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-left transition hover:border-white/20 hover:bg-slate-900"
                  }
                  type="button"
                  onClick={() => {
                    workspace.setSam2SelectedObject(objectSummary.id);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: objectSummary.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-50">
                      {objectSummary.label}
                    </span>
                    <span className="block truncate text-xs uppercase tracking-[0.18em] text-slate-400">
                      {objectSummary.id}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </aside>
  );
}
