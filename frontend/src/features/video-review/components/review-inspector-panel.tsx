import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";

export function ReviewInspectorPanel({
  controller,
  workspace,
}: {
  controller: LiveReviewController;
  workspace: VideoReviewWorkspace;
}) {
  const selectedObjectId = controller.selectedObjectId.trim();
  const selectedObjectLabel =
    controller.selectedObjectReviewSummary?.label ??
    controller.selectedObjectSummary?.label ??
    "No object selected";
  const selectedObjectSummary = controller.selectedObjectReviewSummary;
  const selectedObjectSummaryStatus =
    controller.selectedObjectReviewSummaryStatus;
  const selectedObjectSummaryMessage = formatSelectedObjectSummaryMessage({
    error: controller.selectedObjectReviewSummaryError,
    hasSelectedObject: selectedObjectId.length > 0,
    status: selectedObjectSummaryStatus,
  });

  return (
    <aside
      aria-label="Selected object inspector"
      className="workspace-panel h-full w-80 flex-shrink-0 overflow-y-auto border-l border-white/10"
    >
      <div className="workspace-subpanel section-rule px-4 py-3">
        <p className="console-kicker text-[10px] font-bold tracking-[0.22em]">
          Selected Object
        </p>
      </div>
      {workspace.selectionStatus === "loading" ? (
        <p className="console-copy px-4 py-4 text-sm leading-6">
          Loading selected video...
        </p>
      ) : null}
      {controller.selectedVideo === null ? (
        <div className="px-4 py-4">
          <p className="console-copy text-sm leading-6">
            Pick a video from indexed list to open review workspace.
          </p>
          <p className="console-copy mt-3 text-sm leading-6">
            Selection uses backend detail fetch, not list payload as source of
            truth.
          </p>
        </div>
      ) : (
        <>
          <section className="section-rule px-4 py-4 font-mono text-[11px]">
            <div className="space-y-3">
              <div className="flex items-end justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] text-slate-500">Label</span>
                <span className="text-slate-100">{selectedObjectLabel}</span>
              </div>
              <div className="flex items-end justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] text-slate-500">ID</span>
                <span className="text-cyan-300">
                  {selectedObjectId || "None"}
                </span>
              </div>
              <div className="flex items-end justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] text-slate-500">Confidence</span>
                <span className="text-slate-100">
                  {formatSelectedObjectConfidence({
                    confidence: selectedObjectSummary?.mask_confidence ?? null,
                    status: selectedObjectSummaryStatus,
                  })}
                </span>
              </div>
              <div className="flex items-end justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] text-slate-500">
                  BBox [x1,y1,x2,y2]
                </span>
                <span className="text-slate-100">
                  {formatSelectedObjectSummaryBox({
                    bboxXyxyPx: selectedObjectSummary?.bbox_xyxy_px ?? null,
                    status: selectedObjectSummaryStatus,
                  })}
                </span>
              </div>
              <div className="flex items-end justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] text-slate-500">
                  Current source
                </span>
                <span className="text-slate-100">
                  {formatCurrentAnnotationSource({
                    selectedFrameAnnotation: controller.selectedFrameAnnotation,
                    selectedSavedManualAnnotation:
                      controller.selectedSavedManualAnnotation,
                  })}
                </span>
              </div>
              <div className="flex items-end justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] text-slate-500">Duration</span>
                <span className="text-slate-100">
                  {formatDuration(controller.selectedVideo.duration_seconds)}
                </span>
              </div>
            </div>
            <div className="workspace-subpanel mt-4 border border-white/10 px-3 py-3">
              <p className="console-kicker text-[10px] font-bold tracking-[0.18em]">
                Track Summary
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="metric-tile border border-white/10 px-2 py-2">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                    Frames
                  </div>
                  <div className="mt-1 font-bold text-slate-100">
                    {formatSelectedObjectSummaryMetric({
                      status: selectedObjectSummaryStatus,
                      value:
                        selectedObjectSummary?.track_summary.frames ?? null,
                    })}
                  </div>
                </div>
                <div className="metric-tile border border-white/10 px-2 py-2">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                    Corrected
                  </div>
                  <div className="mt-1 font-bold text-slate-100">
                    {formatSelectedObjectSummaryMetric({
                      status: selectedObjectSummaryStatus,
                      value:
                        selectedObjectSummary?.track_summary.corrected ?? null,
                    })}
                  </div>
                </div>
                <div className="metric-tile border border-white/10 px-2 py-2">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
                    Propagated
                  </div>
                  <div className="mt-1 font-bold text-slate-100">
                    {formatSelectedObjectSummaryMetric({
                      status: selectedObjectSummaryStatus,
                      value:
                        selectedObjectSummary?.track_summary.propagated ?? null,
                    })}
                  </div>
                </div>
              </div>
              {selectedObjectSummaryMessage !== null ? (
                <p
                  className={`mt-3 text-sm leading-6 ${
                    selectedObjectSummaryStatus === "error"
                      ? "text-rose-200"
                      : "text-slate-300"
                  }`}
                >
                  {selectedObjectSummaryMessage}
                </p>
              ) : null}
            </div>
          </section>

          <section className="section-rule px-4 py-4">
            <p className="console-kicker text-[10px] font-bold tracking-[0.22em]">
              Mask Tools
            </p>
            <label className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Mask opacity
              </span>
              <input
                aria-label="Mask opacity"
                className="accent-cyan-300"
                max={100}
                min={0}
                step={1}
                type="range"
                value={controller.maskOpacityPercent}
                onChange={(event) => {
                  controller.setMaskOpacityPercent(Number(event.target.value));
                }}
              />
            </label>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {controller.maskOpacityPercent}%
            </p>
            {controller.selectedFrameAnnotation?.mask != null ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Adjust selected mask overlay locally without changing persisted
                data.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Selected object has no mask on current frame.
              </p>
            )}
          </section>

          <section className="section-rule px-4 py-4">
            <p className="console-kicker text-[10px] font-bold tracking-[0.22em]">
              Box Tools
            </p>
            <button
              className="danger-button mt-4 inline-flex items-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
              disabled={
                !controller.canMutateCurrentFrame ||
                controller.selectedSavedManualAnnotation === null
              }
              type="button"
              onClick={controller.handleDeleteManualBox}
            >
              Delete saved box
            </button>
            {controller.manualBoxError !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {controller.manualBoxError}
              </p>
            ) : null}
          </section>

          <section className="section-rule px-4 py-4">
            <p className="console-kicker text-[10px] font-bold tracking-[0.22em]">
              SAM2 Prompt
            </p>
            <button
              className="primary-button mt-4 inline-flex items-center border border-cyan-300/30 px-4 py-2 text-sm font-medium text-cyan-50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
              disabled={
                !controller.canMutateCurrentFrame ||
                controller.sam2DraftBox === null ||
                controller.selectedObjectId.trim().length === 0 ||
                workspace.reviewState.sam2.prompt.status === "loading"
              }
              type="button"
              onClick={controller.handleRunSam2}
            >
              Run SAM2
            </button>
            {controller.sam2DraftBox === null ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Draw box on exact frame to seed SAM2.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Draft box ready for {controller.selectedObjectId}
              </p>
            )}
            {workspace.reviewState.sam2.prompt.status === "loading" ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Running SAM2...
              </p>
            ) : null}
            {workspace.reviewState.sam2.prompt.errorMessage !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {workspace.reviewState.sam2.prompt.errorMessage}
              </p>
            ) : null}
          </section>

          <section aria-label="SAM2 propagation controls" className="px-4 py-4">
            <p className="console-kicker text-[10px] font-bold tracking-[0.22em]">
              SAM2 Propagation
            </p>
            <p className="console-copy mt-3 text-sm leading-6">
              Propagate from frame {controller.currentFrameIndex}
            </p>
            <label className="mt-4 flex flex-col gap-2">
              <span className="console-kicker text-xs font-semibold tracking-[0.18em]">
                Propagation direction
              </span>
              <select
                aria-label="Propagation direction"
                className="ghost-field border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
                value={controller.propagationDirection}
                onChange={(event) => {
                  controller.setPropagationDirection(
                    event.target.value as "forward" | "backward" | "both",
                  );
                }}
              >
                <option value="forward">Forward</option>
                <option value="backward">Backward</option>
                <option value="both">Both</option>
              </select>
            </label>
            <label className="mt-4 flex flex-col gap-2">
              <span className="console-kicker text-xs font-semibold tracking-[0.18em]">
                Propagation end frame
              </span>
              <input
                aria-label="Propagation end frame"
                className="ghost-field border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
                inputMode="numeric"
                min={0}
                max={controller.selectedVideo.frame_count - 1}
                step={1}
                type="number"
                value={controller.propagationEndFrameValue}
                onChange={(event) => {
                  controller.setPropagationEndFrameValue(event.target.value);
                }}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="primary-button inline-flex items-center border border-cyan-300/30 px-4 py-2 text-sm font-medium text-cyan-50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={!controller.canStartPropagation}
                type="button"
                onClick={controller.handleStartPropagation}
              >
                Start propagation
              </button>
              {controller.propagationJob !== null ? (
                <button
                  className="ghost-button inline-flex items-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                  disabled={!controller.canCancelPropagation}
                  type="button"
                  onClick={() => {
                    void workspace.cancelSam2PropagationJob();
                  }}
                >
                  Cancel propagation
                </button>
              ) : null}
            </div>
            {workspace.reviewState.sam2.session.sessionId === null ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Run SAM2 on current object before propagation.
              </p>
            ) : null}
            {controller.propagationInputError !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {controller.propagationInputError}
              </p>
            ) : null}
            {controller.propagationStatus === "loading" &&
            controller.propagationJob === null ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Starting propagation...
              </p>
            ) : null}
            {workspace.reviewState.sam2.propagation.errorMessage !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {workspace.reviewState.sam2.propagation.errorMessage}
              </p>
            ) : null}
            {controller.propagationJob !== null ? (
              <>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Propagation job {controller.propagationJob.status}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Progress {controller.propagationJob.progressCurrent} /{" "}
                  {controller.propagationJob.progressTotal}
                </p>
                {controller.propagatedFrameIndices.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm leading-6 text-slate-300">
                      Saved propagated frames
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {controller.propagatedFrameIndices.map((frameIdx) => (
                        <button
                          key={frameIdx}
                          className="ghost-button inline-flex items-center border border-white/15 px-3 py-2 text-sm font-medium"
                          type="button"
                          onClick={() => {
                            controller.pausePlaybackContext();
                            void workspace.loadExactFrame(frameIdx);
                          }}
                        >
                          Open frame {frameIdx}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        </>
      )}
      {workspace.errorMessage !== null ? (
        <p className="mt-4 text-sm leading-6 text-rose-200">
          {workspace.errorMessage}
        </p>
      ) : null}
    </aside>
  );
}

function formatDuration(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }

  return `${value.toFixed(2)}s`;
}

function formatSelectedObjectConfidence(options: {
  confidence: number | null;
  status: "error" | "idle" | "loading" | "ready";
}): string {
  if (options.status === "loading") {
    return "Loading...";
  }

  if (options.status !== "ready" || options.confidence === null) {
    return "Unavailable";
  }

  return options.confidence.toFixed(2);
}

function formatSelectedObjectSummaryBox(options: {
  bboxXyxyPx: readonly [number, number, number, number] | null;
  status: "error" | "idle" | "loading" | "ready";
}): string {
  if (options.status === "loading") {
    return "Loading...";
  }

  if (options.status !== "ready" || options.bboxXyxyPx === null) {
    return "Unavailable";
  }

  const [x1, y1, x2, y2] = options.bboxXyxyPx;

  return `[${String(x1)}, ${String(y1)}, ${String(x2)}, ${String(y2)}]`;
}

function formatSelectedObjectSummaryMetric(options: {
  status: "error" | "idle" | "loading" | "ready";
  value: number | null;
}): string {
  if (options.status === "loading") {
    return "Loading...";
  }

  if (options.status !== "ready" || options.value === null) {
    return "Unavailable";
  }

  return String(options.value);
}

function formatSelectedObjectSummaryMessage(options: {
  error: string | null;
  hasSelectedObject: boolean;
  status: "error" | "idle" | "loading" | "ready";
}): string | null {
  if (options.status === "loading") {
    return "Loading selected-range summary...";
  }

  if (options.status === "error") {
    return options.error ?? "Unable to load selected-range summary.";
  }

  if (options.status === "idle" && !options.hasSelectedObject) {
    return "Select object to load selected-range summary.";
  }

  return null;
}

function formatCurrentAnnotationSource(options: {
  selectedFrameAnnotation: {
    source: string;
    mask: { path: string } | null;
  } | null;
  selectedSavedManualAnnotation: {
    source: string;
  } | null;
}): string {
  if (options.selectedSavedManualAnnotation !== null) {
    return "Manual box";
  }

  if (options.selectedFrameAnnotation === null) {
    return "No saved annotation on current frame";
  }

  if (
    options.selectedFrameAnnotation.source === "sam2" &&
    options.selectedFrameAnnotation.mask !== null
  ) {
    return "SAM2 mask";
  }

  return options.selectedFrameAnnotation.source;
}
