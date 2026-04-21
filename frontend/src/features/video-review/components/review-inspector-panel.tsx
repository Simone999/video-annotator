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
      className="side-panel side-panel--right"
      aria-label="Selected object inspector"
    >
      <p className="panel-kicker">Inspector</p>
      <h2 className="panel-title">Selected object</h2>
      {workspace.selectionStatus === "loading" ? (
        <p className="panel-copy">Loading selected video...</p>
      ) : null}
      {controller.selectedVideo === null ? (
        <>
          <p className="panel-copy">
            Pick a video from indexed list to open review workspace.
          </p>
          <p className="panel-copy">
            Selection uses backend detail fetch, not list payload as source of
            truth.
          </p>
        </>
      ) : (
        <>
          <dl className="metadata-list">
            <div className="metadata-row">
              <dt>Label</dt>
              <dd>
                {controller.selectedObjectSummary?.label ??
                  "No object selected"}
              </dd>
            </div>
            <div className="metadata-row">
              <dt>Object id</dt>
              <dd>{controller.selectedObjectId.trim() || "None"}</dd>
            </div>
            <div className="metadata-row">
              <dt>Current box</dt>
              <dd>
                {formatCurrentBoxLabel({
                  boxXywhNorm: controller.currentFrameBox,
                  videoHeight: controller.selectedVideo.height,
                  videoWidth: controller.selectedVideo.width,
                })}
              </dd>
            </div>
            <div className="metadata-row">
              <dt>Current source</dt>
              <dd>
                {formatCurrentAnnotationSource({
                  selectedFrameAnnotation: controller.selectedFrameAnnotation,
                  selectedSavedManualAnnotation:
                    controller.selectedSavedManualAnnotation,
                })}
              </dd>
            </div>
            <div className="metadata-row">
              <dt>Duration</dt>
              <dd>
                {formatDuration(controller.selectedVideo.duration_seconds)}
              </dd>
            </div>
          </dl>
          <p className="panel-copy">{controller.selectedVideo.source_path}</p>

          <section className="object-panel">
            <p className="panel-kicker">Mask overlay</p>
            <label className="exact-frame-field">
              <span className="exact-frame-field-label">Mask opacity</span>
              <input
                aria-label="Mask opacity"
                className="exact-frame-input"
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
            <p className="panel-copy">{controller.maskOpacityPercent}%</p>
            {controller.selectedFrameAnnotation?.mask === null ? (
              <p className="panel-copy">
                Selected object has no mask on current frame.
              </p>
            ) : (
              <p className="panel-copy">
                Adjust selected mask overlay locally without changing persisted
                data.
              </p>
            )}
          </section>

          <section className="object-panel">
            <p className="panel-kicker">Box tools</p>
            <button
              className="exact-frame-button"
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
              <p className="panel-copy">{controller.manualBoxError}</p>
            ) : null}
          </section>

          <section className="object-panel">
            <p className="panel-kicker">SAM2 prompt</p>
            <button
              className="exact-frame-button"
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
              <p className="panel-copy">
                Draw box on exact frame to seed SAM2.
              </p>
            ) : (
              <p className="panel-copy">
                Draft box ready for {controller.selectedObjectId}
              </p>
            )}
            {workspace.reviewState.sam2.prompt.status === "loading" ? (
              <p className="panel-copy">Running SAM2...</p>
            ) : null}
            {workspace.reviewState.sam2.prompt.errorMessage !== null ? (
              <p className="panel-copy">
                {workspace.reviewState.sam2.prompt.errorMessage}
              </p>
            ) : null}
          </section>

          <section
            className="object-panel"
            aria-label="SAM2 propagation controls"
          >
            <p className="panel-kicker">SAM2 propagation</p>
            <p className="panel-copy">
              Propagate from frame {controller.currentFrameIndex}
            </p>
            <label className="exact-frame-field">
              <span className="exact-frame-field-label">
                Propagation direction
              </span>
              <select
                aria-label="Propagation direction"
                className="exact-frame-input"
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
            <label className="exact-frame-field">
              <span className="exact-frame-field-label">
                Propagation end frame
              </span>
              <input
                aria-label="Propagation end frame"
                className="exact-frame-input"
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
            <div className="sam2-propagation-actions">
              <button
                className="exact-frame-button"
                disabled={!controller.canStartPropagation}
                type="button"
                onClick={controller.handleStartPropagation}
              >
                Start propagation
              </button>
              {controller.propagationJob !== null ? (
                <button
                  className="exact-frame-button"
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
              <p className="panel-copy">
                Run SAM2 on current object before propagation.
              </p>
            ) : null}
            {controller.propagationInputError !== null ? (
              <p className="panel-copy">{controller.propagationInputError}</p>
            ) : null}
            {controller.propagationStatus === "loading" &&
            controller.propagationJob === null ? (
              <p className="panel-copy">Starting propagation...</p>
            ) : null}
            {workspace.reviewState.sam2.propagation.errorMessage !== null ? (
              <p className="panel-copy">
                {workspace.reviewState.sam2.propagation.errorMessage}
              </p>
            ) : null}
            {controller.propagationJob !== null ? (
              <>
                <p className="panel-copy">
                  Propagation job {controller.propagationJob.status}
                </p>
                <p className="panel-copy">
                  Progress {controller.propagationJob.progressCurrent} /{" "}
                  {controller.propagationJob.progressTotal}
                </p>
                {controller.propagatedFrameIndices.length > 0 ? (
                  <div className="sam2-propagation-results">
                    <p className="panel-copy">Saved propagated frames</p>
                    <div className="sam2-propagation-frame-list">
                      {controller.propagatedFrameIndices.map((frameIdx) => (
                        <button
                          key={frameIdx}
                          className="exact-frame-button"
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
        <p className="panel-copy">{workspace.errorMessage}</p>
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
