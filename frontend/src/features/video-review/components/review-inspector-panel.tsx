import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";

export function ReviewInspectorPanel({
  controller,
  workspace,
}: {
  controller: LiveReviewController;
  workspace: VideoReviewWorkspace;
}) {
  return (
    <aside
      aria-label="Selected object inspector"
      className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Inspector
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-slate-50">
        Selected object
      </h2>
      {workspace.selectionStatus === "loading" ? (
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Loading selected video...
        </p>
      ) : null}
      {controller.selectedVideo === null ? (
        <>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Pick a video from indexed list to open review workspace.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Selection uses backend detail fetch, not list payload as source of
            truth.
          </p>
        </>
      ) : (
        <>
          <dl className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Label
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-50">
                {controller.selectedObjectSummary?.label ??
                  "No object selected"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Object id
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-50">
                {controller.selectedObjectId.trim() || "None"}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current box
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-50">
                {formatCurrentBoxLabel({
                  boxXywhNorm: controller.currentFrameBox,
                  videoHeight: controller.selectedVideo.height,
                  videoWidth: controller.selectedVideo.width,
                })}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current source
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-50">
                {formatCurrentAnnotationSource({
                  selectedFrameAnnotation: controller.selectedFrameAnnotation,
                  selectedSavedManualAnnotation:
                    controller.selectedSavedManualAnnotation,
                })}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Duration
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-50">
                {formatDuration(controller.selectedVideo.duration_seconds)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Live review stays backed by local-first video data from the backend
            playback source.
          </p>

          <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Mask overlay
            </p>
            <label className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Mask opacity
              </span>
              <input
                aria-label="Mask opacity"
                className="accent-sky-400"
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
            {controller.selectedFrameAnnotation?.mask === null ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Selected object has no mask on current frame.
              </p>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Adjust selected mask overlay locally without changing persisted
                data.
              </p>
            )}
          </section>

          <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Box tools
            </p>
            <button
              className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
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

          <section className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              SAM2 prompt
            </p>
            <button
              className="mt-4 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
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

          <section
            aria-label="SAM2 propagation controls"
            className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              SAM2 propagation
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Propagate from frame {controller.currentFrameIndex}
            </p>
            <label className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Propagation direction
              </span>
              <select
                aria-label="Propagation direction"
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40 focus:bg-slate-950/80"
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
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Propagation end frame
              </span>
              <input
                aria-label="Propagation end frame"
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-300/40 focus:bg-slate-950/80"
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
                className="inline-flex items-center rounded-full border border-sky-300/30 bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-50 transition hover:border-sky-200/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={!controller.canStartPropagation}
                type="button"
                onClick={controller.handleStartPropagation}
              >
                Start propagation
              </button>
              {controller.propagationJob !== null ? (
                <button
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
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
                          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15"
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

function formatCurrentBoxLabel(options: {
  boxXywhNorm: readonly [number, number, number, number] | null;
  videoWidth: number;
  videoHeight: number;
}): string {
  if (options.boxXywhNorm === null) {
    return "Unavailable";
  }

  const x1 = Math.floor(options.boxXywhNorm[0] * options.videoWidth);
  const y1 = Math.floor(options.boxXywhNorm[1] * options.videoHeight);
  const x2 = Math.ceil(
    (options.boxXywhNorm[0] + options.boxXywhNorm[2]) * options.videoWidth,
  );
  const y2 = Math.ceil(
    (options.boxXywhNorm[1] + options.boxXywhNorm[3]) * options.videoHeight,
  );

  return `[${String(x1)}, ${String(y1)}, ${String(x2)}, ${String(y2)}]`;
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
