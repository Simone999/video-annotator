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
      className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_80px_rgba(2,6,23,0.28)] backdrop-blur"
    >
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Live review
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-slate-50">
            Review surface
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Playback stays contextual only. Canonical review frame comes from
            backend frame index state.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm text-slate-200 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Video
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-50">
              {controller.selectedVideo?.display_name ?? "No selection"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Frame
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-50">
              {controller.exactFrameReady
                ? `Frame ${String(controller.currentFrameIndex)}`
                : "Not loaded"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              FPS
            </dt>
            <dd className="mt-1 text-base font-medium text-slate-50">
              {controller.selectedVideo === null
                ? "Unavailable"
                : formatFramesPerSecond(controller.selectedVideo.fps)}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-slate-950/45 p-4">
        {controller.selectedVideo === null ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-white/15 bg-slate-950/30 px-6 py-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Playback review stage
            </span>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Select an indexed video, then load canonical backend frames onto
              one live review surface.
            </p>
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/80">
              <video
                ref={controller.playbackVideoRef}
                aria-label="Playback preview"
                className="aspect-video w-full bg-slate-950 object-contain"
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

            <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-slate-950/35 px-4 py-4">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
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
