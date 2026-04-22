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
  const savedManualAnnotationsForCurrentFrame =
    workspace.reviewState.annotation.savedManualAnnotationsByFrame[
      workspace.reviewState.currentFrameIndex
    ] ?? {};
  const currentFrameAnnotationsByObjectId = new Map(
    workspace.reviewState.sam2.frameAnnotations.map((annotation) => [
      annotation.object_id,
      annotation,
    ]),
  );

  return (
    <aside
      aria-label={routeMode ? "Review overview" : "Video list"}
      className="workspace-panel flex h-full w-72 flex-shrink-0 flex-col border-r border-white/10"
    >
      {selectedVideo === null ? (
        <div className="flex flex-1 flex-col px-5 py-5">
          <p className="console-kicker text-xs font-semibold tracking-[0.24em]">
            {routeMode ? "Review route" : "Indexed videos"}
          </p>
          {onBackToLibrary ? (
            <button
              className="ghost-button mt-4 inline-flex items-center self-start border border-white/15 px-4 py-2 text-sm font-medium"
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
            Choose review target
          </h1>
          <p className="console-copy mt-2 text-sm leading-6">
            {routeMode
              ? "Route-owned review workspace"
              : `Canonical exact-frame index: ${String(workspace.reviewState.currentFrameIndex)}`}
          </p>

          <div className="mt-5 space-y-3">
            {workspace.listStatus === "loading" ? (
              <p className="console-copy text-sm leading-6">
                Loading indexed videos...
              </p>
            ) : null}

            {workspace.listStatus === "empty" ? (
              <p className="console-copy text-sm leading-6">
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
                          ? "workspace-subpanel flex w-full items-center justify-between border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-left text-sm font-medium text-cyan-50 transition"
                          : "workspace-subpanel flex w-full items-center justify-between border border-white/10 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-slate-900/70"
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
        </div>
      ) : (
        <>
          <div className="workspace-subpanel section-rule px-4 py-3">
            {onBackToLibrary ? (
              <button
                className="ghost-button mb-3 inline-flex items-center border border-white/15 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-200"
                type="button"
                onClick={onBackToLibrary}
              >
                Back to Library
              </button>
            ) : null}
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="console-kicker text-[11px] font-bold tracking-[0.22em]">
                  Annotations · Frame {workspace.reviewState.currentFrameIndex}
                </h2>
                <p className="console-copy mt-1 text-[10px]">
                  Current frame objects with box and mask state
                </p>
                <p className="console-kicker mt-2 text-[10px] tracking-[0.18em]">
                  Route-owned review workspace
                </p>
              </div>
              <span className="console-pill px-2 py-1 font-mono text-[10px]">
                {controller.objectSummaries.length} OBJ
              </span>
            </div>
          </div>

          <div className="section-rule flex items-center gap-3 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span className="flex-1">Object</span>
            <span>Box</span>
            <span>Mask</span>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {controller.objectSummaries.map((objectSummary) => {
              const frameAnnotation = currentFrameAnnotationsByObjectId.get(
                objectSummary.id,
              );
              const hasBox =
                Object.hasOwn(
                  savedManualAnnotationsForCurrentFrame,
                  objectSummary.id,
                ) || frameAnnotation?.box_xywh_norm != null;
              const hasMask = frameAnnotation?.mask != null;

              return (
                <button
                  key={objectSummary.id}
                  aria-pressed={
                    controller.selectedObjectId === objectSummary.id
                  }
                  className={
                    controller.selectedObjectId === objectSummary.id
                      ? "flex w-full items-center gap-2 border-l-2 border-cyan-300 bg-cyan-300/10 px-3 py-2 text-left transition"
                      : "flex w-full items-center gap-2 border-l-2 border-transparent px-3 py-2 text-left transition hover:bg-slate-800"
                  }
                  type="button"
                  onClick={() => {
                    workspace.setSam2SelectedObject(objectSummary.id);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 border border-white/20"
                    style={{ backgroundColor: objectSummary.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[11px] text-slate-100">
                      {objectSummary.label}
                    </span>
                    <span className="block truncate text-[10px] text-slate-500">
                      {objectSummary.id}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {hasBox ? "Box" : "—"}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {hasMask ? "Mask" : "—"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="workspace-subpanel px-4 py-3">
            <label className="flex flex-col gap-2">
              <span className="console-kicker text-[10px] font-semibold tracking-[0.18em]">
                New object label
              </span>
              <input
                aria-label="New object label"
                className="ghost-field border border-white/10 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                type="text"
                value={controller.newObjectLabel}
                onChange={(event) => {
                  controller.setNewObjectLabel(event.target.value);
                }}
              />
            </label>
            <button
              aria-label="Create object"
              className="primary-button mt-3 inline-flex items-center border border-cyan-300/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
              disabled={controller.newObjectLabel.trim().length === 0}
              type="button"
              onClick={() => {
                void controller.handleCreateObject();
              }}
            >
              New Object
            </button>
            {controller.objectPanelError !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {controller.objectPanelError}
              </p>
            ) : null}
          </div>
        </>
      )}
    </aside>
  );
}
