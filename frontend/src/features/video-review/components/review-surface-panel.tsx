import { ExactFrameCanvas } from "../exact-frame-canvas";
import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";
import { ReviewTransportControls } from "./review-transport-controls";

export function ReviewSurfacePanel({
  controller,
  workspace,
}: {
  controller: LiveReviewController;
  workspace: VideoReviewWorkspace;
}) {
  return (
    <section className="review-surface" aria-label="Live review surface">
      <header className="review-surface-header">
        <div>
          <p className="surface-kicker">Live review</p>
          <h2 className="panel-title">Review surface</h2>
          <p className="surface-copy">
            Playback stays contextual only. Canonical review frame comes from
            backend frame index state.
          </p>
        </div>
        <dl className="review-surface-meta">
          <div>
            <dt>Video</dt>
            <dd>{controller.selectedVideo?.display_name ?? "No selection"}</dd>
          </div>
          <div>
            <dt>Frame</dt>
            <dd>
              {controller.exactFrameReady
                ? `Frame ${String(controller.currentFrameIndex)}`
                : "Not loaded"}
            </dd>
          </div>
          <div>
            <dt>FPS</dt>
            <dd>
              {controller.selectedVideo === null
                ? "Unavailable"
                : formatFramesPerSecond(controller.selectedVideo.fps)}
            </dd>
          </div>
        </dl>
      </header>

      <div className="review-stage-card">
        {controller.selectedVideo === null ? (
          <div className="surface-frame review-stage-placeholder">
            <span className="surface-label">Playback review stage</span>
            <p className="surface-copy">
              Select an indexed video, then load canonical backend frames onto
              one live review surface.
            </p>
          </div>
        ) : (
          <>
            <div className="review-stage-frame">
              <video
                ref={controller.playbackVideoRef}
                aria-label="Playback preview"
                className="playback-video review-stage-video"
                controls
                preload="metadata"
                src={controller.playbackSource ?? undefined}
                onEnded={() => {
                  controller.setIsPlaybackActive(false);
                }}
                onPause={() => {
                  controller.setIsPlaybackActive(false);
                }}
                onPlay={() => {
                  controller.setIsPlaybackActive(true);
                }}
              />
              {controller.exactFrameImageUrl !== null &&
              !controller.isPlaybackActive ? (
                <div className="review-stage-canvas">
                  <ExactFrameCanvas
                    alt={`Exact frame ${String(controller.currentFrameIndex)}`}
                    annotations={controller.sam2Annotations}
                    draftBox={controller.visibleDraftBox}
                    editableAnnotation={
                      controller.selectedSavedManualAnnotation === null
                        ? null
                        : {
                            box: {
                              h: controller.selectedSavedManualAnnotation
                                .box_xywh_norm[3],
                              w: controller.selectedSavedManualAnnotation
                                .box_xywh_norm[2],
                              x: controller.selectedSavedManualAnnotation
                                .box_xywh_norm[0],
                              y: controller.selectedSavedManualAnnotation
                                .box_xywh_norm[1],
                            },
                            objectId:
                              controller.selectedSavedManualAnnotation
                                .object_id,
                          }
                    }
                    imageUrl={controller.exactFrameImageUrl}
                    maskOpacity={controller.maskOpacityPercent / 100}
                    onAnnotationTransformCommit={
                      controller.handleManualBoxCommit
                    }
                    onDraftBoxCommit={controller.handleManualBoxCommit}
                    onDraftBoxChange={workspace.setSam2DraftBox}
                  />
                </div>
              ) : null}

              <div className="review-stage-chip-row">
                <span className="review-stage-chip">
                  Playback {controller.isPlaybackActive ? "active" : "paused"}
                </span>
                <span className="review-stage-chip">
                  Frame {controller.currentFrameIndex}
                </span>
                {controller.exactFrameReady ? (
                  <span className="review-stage-chip">Exact frame loaded</span>
                ) : null}
              </div>

              {controller.isPlaybackActive ? (
                <div className="review-stage-banner">
                  Playback active. Pause to return to canonical frame{" "}
                  {controller.currentFrameIndex}.
                </div>
              ) : null}
            </div>

            <div className="review-stage-status">
              <span className="surface-label">
                {controller.exactFrameReady
                  ? `Canonical frame ${String(controller.currentFrameIndex)}`
                  : "No canonical frame loaded"}
              </span>
              {controller.frameInputError !== null ? (
                <p className="surface-copy">{controller.frameInputError}</p>
              ) : null}
              {workspace.exactFrameErrorMessage !== null ? (
                <p className="surface-copy">
                  {workspace.exactFrameErrorMessage}
                </p>
              ) : null}
              {workspace.exactFrameStatus === "loading" ? (
                <p className="surface-copy">Loading exact frame...</p>
              ) : null}
              {!controller.exactFrameReady &&
              workspace.exactFrameStatus !== "loading" ? (
                <p className="surface-copy">
                  Load frame to bring backend-decoded canonical image onto
                  stage.
                </p>
              ) : null}
              {controller.isPlaybackActive ? (
                <p className="surface-copy">
                  Pause playback before mutating canonical frame data.
                </p>
              ) : controller.exactFrameReady ? (
                <p className="surface-copy">
                  Paused stage is edit-ready. Draw, move, resize, delete, and
                  SAM2 actions use backend frame {controller.currentFrameIndex}.
                </p>
              ) : (
                <p className="surface-copy">
                  Playback time stays separate. Load exact frame before mutating
                  review data.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <ReviewTransportControls controller={controller} />
    </section>
  );
}

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
