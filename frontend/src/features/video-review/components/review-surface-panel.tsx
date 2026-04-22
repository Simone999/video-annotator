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
    <section
      aria-label="Live review surface"
      className="workspace-stage flex min-w-0 flex-1 flex-col"
    >
      <header className="workspace-subpanel section-rule px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex min-w-0 items-center gap-4">
            <h1
              id="workspace-title"
              className="truncate text-sm font-bold text-cyan-300"
            >
              {controller.selectedVideo?.display_name ?? "Review surface"}
            </h1>
            <span className="hidden text-slate-500 lg:inline">
              {controller.selectedVideo === null
                ? "No video selected"
                : `${String(controller.selectedVideo.width)}×${String(controller.selectedVideo.height)}`}
            </span>
            <span className="hidden text-slate-500 lg:inline">
              {controller.selectedVideo === null
                ? "No fps"
                : `${formatFramesPerSecond(controller.selectedVideo.fps)} FPS`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Frame{" "}
              <span className="text-slate-100">
                {controller.exactFrameReady
                  ? controller.currentFrameIndex
                  : "Not loaded"}
              </span>
            </span>
            <span>
              Playback{" "}
              <span className="text-slate-100">
                {controller.isPlaybackActive ? "active" : "paused"}
              </span>
            </span>
          </div>
        </div>
        <div className="mt-3">
          <h2 className="console-kicker text-sm font-semibold tracking-[0.22em]">
            Review surface
          </h2>
          <p className="console-copy mt-2 text-sm leading-6">
            Playback stays contextual only. Canonical review frame comes from
            backend frame index state.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-[#131313] px-4 py-4">
        {controller.selectedVideo === null ? (
          <div className="workspace-subpanel flex min-h-[420px] flex-col items-center justify-center border border-dashed border-white/15 px-6 py-10 text-center">
            <span className="console-kicker text-xs font-semibold tracking-[0.24em]">
              Playback review stage
            </span>
            <p className="console-copy mt-4 max-w-md text-sm leading-6">
              Select an indexed video, then load canonical backend frames onto
              one live review surface.
            </p>
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden border border-white/10 bg-slate-950/80">
              <video
                ref={controller.playbackVideoRef}
                aria-label="Playback preview"
                className="aspect-video w-full bg-slate-950 object-contain"
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
                <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.24))] p-4">
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

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                  Playback {controller.isPlaybackActive ? "active" : "paused"}
                </span>
                <span className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                  Frame {controller.currentFrameIndex}
                </span>
                {controller.exactFrameReady ? (
                  <span className="rounded-full border border-sky-300/30 bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur">
                    Exact frame loaded
                  </span>
                ) : null}
              </div>

              {controller.isPlaybackActive ? (
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-amber-300/25 bg-amber-500/12 px-4 py-3 text-sm text-amber-100 backdrop-blur">
                  Playback active. Pause to return to canonical frame{" "}
                  {controller.currentFrameIndex}.
                </div>
              ) : null}
            </div>

            <div className="workspace-subpanel mt-4 border border-white/10 px-4 py-4">
              <span className="console-kicker text-xs font-semibold tracking-[0.24em]">
                {controller.exactFrameReady
                  ? `Canonical frame ${String(controller.currentFrameIndex)}`
                  : "No canonical frame loaded"}
              </span>
              {controller.frameInputError !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {controller.frameInputError}
                </p>
              ) : null}
              {workspace.exactFrameErrorMessage !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {workspace.exactFrameErrorMessage}
                </p>
              ) : null}
              {workspace.exactFrameStatus === "loading" ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Loading exact frame...
                </p>
              ) : null}
              {!controller.exactFrameReady &&
              workspace.exactFrameStatus !== "loading" ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Load frame to bring backend-decoded canonical image onto
                  stage.
                </p>
              ) : null}
              {controller.isPlaybackActive ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Pause playback before mutating canonical frame data.
                </p>
              ) : controller.exactFrameReady ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Paused stage is edit-ready. Draw, move, resize, delete, and
                  SAM2 actions use backend frame {controller.currentFrameIndex}.
                </p>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-300">
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
