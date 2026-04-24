import type { ReactNode } from "react";

import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";
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
  const selectedVideo = controller.selectedVideo;
  const frameStatusLabel = controller.exactFrameReady
    ? String(controller.currentFrameIndex)
    : "Not loaded";

  return (
    <section
      aria-label="Live review surface"
      className="workspace-stage relative z-0 flex min-w-0 flex-1 flex-col bg-surface"
    >
      <h2 className="sr-only">Review surface</h2>
      <header className="h-12 border-b border-outline-variant/15 bg-surface-container-lowest px-4 font-['JetBrains_Mono'] text-[11px]">
        <div className="flex h-full flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <h1
              id="workspace-title"
              className="truncate text-on-surface font-bold text-primary-container"
            >
              {selectedVideo?.display_name ?? "Review surface"}
            </h1>
            <HeaderMetaItem value={formatResolution(selectedVideo)} />
            <HeaderMetaItem value={formatFramesPerSecondValue(selectedVideo)} />
            <HeaderMetaItem value={formatFrameCountValue(selectedVideo)} />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 text-on-surface-variant">
            <button
              className="inline-flex h-8 items-center justify-center border border-primary-container/40 bg-primary-container/10 px-3 text-primary-container transition-colors hover:bg-primary-container/15 disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:bg-surface-container-high disabled:text-on-surface-variant"
              disabled={!controller.canSaveMaskRefine}
              title={
                controller.canSaveMaskRefine
                  ? "Save corrected mask"
                  : "Save is available only while mask correction has unsaved strokes."
              }
              type="button"
              onClick={controller.handleSaveRefinedMask}
            >
              Save
            </button>
            <HeaderIconButton
              ariaLabel="Header previous frame"
              disabled={!controller.canLoadPreviousFrame}
              icon="chevron_left"
              onClick={() => {
                controller.handleFrameStep(-1);
              }}
            />
            <HeaderIconButton
              ariaLabel={
                controller.isPlaybackActive
                  ? "Header pause playback"
                  : "Header play context"
              }
              disabled={selectedVideo === null}
              icon={controller.isPlaybackActive ? "pause" : "play_arrow"}
              onClick={controller.handlePlaybackToggle}
            />
            <HeaderIconButton
              ariaLabel="Header next frame"
              disabled={!controller.canLoadNextFrame}
              icon="chevron_right"
              onClick={() => {
                controller.handleFrameStep(1);
              }}
            />
            <form
              aria-label="Exact frame fallback"
              className="flex flex-wrap items-center gap-2"
              role="group"
              onSubmit={controller.handleFrameSubmit}
            >
              <span className="pl-2 text-outline">Frame</span>
              <input
                aria-label="Frame number"
                className="h-8 w-20 border border-outline-variant/20 bg-surface-container-high px-2 text-center text-on-surface outline-none focus:border-primary-container/40"
                ref={controller.frameInputRef}
                inputMode="numeric"
                max={selectedVideo ? selectedVideo.frame_count - 1 : 0}
                min={0}
                name="frame-number"
                step={1}
                type="number"
                value={controller.frameInputValue}
                onChange={(event) => {
                  controller.setFrameInputValue(event.target.value);
                }}
              />
              <button
                aria-label="Load frame"
                className="inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-on-surface transition-colors hover:border-primary-container/40 hover:text-primary-container"
                type="submit"
              >
                Go
              </button>
            </form>
            <div className="ml-2 flex items-center gap-1">
              <HeaderIconButton
                ariaLabel="Zoom out unavailable"
                disabled
                icon="remove"
                title="Zoom controls are not wired in current review controller."
              />
              <div className="flex h-8 items-center border border-outline-variant/20 bg-surface-container-high px-2 text-on-surface">
                100%
              </div>
              <HeaderIconButton
                ariaLabel="Zoom in unavailable"
                disabled
                icon="add"
                title="Zoom controls are not wired in current review controller."
              />
              <button
                className="inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-on-surface transition-colors disabled:cursor-not-allowed disabled:text-on-surface-variant"
                disabled
                title="Fit control is not wired in current review controller."
                type="button"
              >
                Fit
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-surface-container-lowest p-4">
        {selectedVideo === null ? (
          <div className="workspace-subpanel flex min-h-[420px] flex-col items-center justify-center border border-dashed border-white/15 px-6 py-10 text-center">
            <span className="console-kicker text-xs font-semibold tracking-[0.24em]">
              Playback review stage
            </span>
            <p className="console-copy mt-4 max-w-md text-sm leading-6">
              Select indexed video, then load canonical backend frames onto one
              live review surface.
            </p>
          </div>
        ) : (
          <div className="relative flex h-full min-h-[420px] items-center justify-center overflow-hidden border border-outline-variant/20 bg-black p-4 shadow-2xl">
            <p className="sr-only">
              Playback stays contextual only. Canonical review frame comes from
              backend frame index state.
            </p>
            {controller.exactFrameReady ? (
              <p className="sr-only">
                Canonical frame {controller.currentFrameIndex}
              </p>
            ) : null}
            <video
              ref={controller.playbackVideoRef}
              aria-label="Playback preview"
              className="h-full w-full object-contain opacity-80"
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
              <div className="absolute inset-0 grid place-items-center p-4">
                <ExactFrameCanvas
                  alt={`Exact frame ${String(controller.currentFrameIndex)}`}
                  annotations={controller.sam2Annotations}
                  draftBox={controller.visibleDraftBox}
                  editableAnnotation={
                    controller.isMaskRefineActive ||
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
                            controller.selectedSavedManualAnnotation.object_id,
                        }
                  }
                  imageUrl={controller.exactFrameImageUrl}
                  interactionMode={
                    controller.isMaskRefineActive ? "refine" : "box"
                  }
                  maskOpacity={controller.maskOpacityPercent / 100}
                  onAnnotationTransformCommit={controller.handleManualBoxCommit}
                  onDraftBoxCommit={controller.handleManualBoxCommit}
                  onDraftBoxChange={workspace.setSam2DraftBox}
                  onRefineStrokeCommit={controller.handleRefineStrokeCommit}
                  refineBrushMode={controller.refineBrushMode}
                  refineNegativePoints={controller.refineNegativePoints}
                  refinePositivePoints={controller.refinePositivePoints}
                />
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <StatusChip
                    tone="neutral"
                    value={`Playback ${controller.isPlaybackActive ? "active" : "paused"}`}
                  />
                  <StatusChip tone="neutral" value={`Frame ${frameStatusLabel}`} />
                  {controller.exactFrameReady && !controller.isPlaybackActive ? (
                    <StatusChip tone="sky" value="Exact frame loaded" />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  {workspace.exactFrameStatus === "loading" ? (
                    <OverlayMessage tone="neutral">
                      Loading exact frame...
                    </OverlayMessage>
                  ) : null}
                  {controller.frameInputError !== null ? (
                    <OverlayMessage tone="error">
                      {controller.frameInputError}
                    </OverlayMessage>
                  ) : null}
                  {workspace.exactFrameErrorMessage !== null ? (
                    <OverlayMessage tone="error">
                      {workspace.exactFrameErrorMessage}
                    </OverlayMessage>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid max-w-xl gap-2">
                  {controller.isPlaybackActive ? (
                    <OverlayMessage tone="warning">
                      Playback active. Pause to return to canonical frame{" "}
                      {controller.currentFrameIndex}.
                    </OverlayMessage>
                  ) : null}
                  {controller.isMaskRefineActive ? (
                    <OverlayMessage tone="sky">
                      Mask correction active. Drag{" "}
                      {controller.refineBrushMode === "erase"
                        ? "erase"
                        : "add"}{" "}
                      brush on paused canonical frame {controller.currentFrameIndex}
                      .
                    </OverlayMessage>
                  ) : controller.exactFrameReady ? (
                    <OverlayMessage tone="neutral">
                      Paused stage is edit-ready. Draw, move, resize, delete,
                      and SAM2 actions use backend frame{" "}
                      {controller.currentFrameIndex}.
                    </OverlayMessage>
                  ) : (
                    <OverlayMessage tone="neutral">
                      Playback stays contextual only. Canonical review frame
                      comes from backend frame index state.
                    </OverlayMessage>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ReviewTransportControls controller={controller} />
    </section>
  );
}

function HeaderMetaItem({ value }: { value: string }) {
  return (
    <span className="border-l border-outline-variant/30 pl-4 text-outline">
      {value}
    </span>
  );
}

function HeaderIconButton({
  ariaLabel,
  disabled = false,
  icon,
  onClick,
  title,
}: {
  ariaLabel: string;
  disabled?: boolean;
  icon: string;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex h-8 w-8 items-center justify-center border border-outline-variant/30 text-on-surface-variant transition-colors hover:border-primary-container/40 hover:text-primary-container disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
      disabled={disabled}
      title={title}
      type="button"
      onClick={onClick}
    >
      <MaterialSymbolIcon className="text-[16px]" name={icon} />
    </button>
  );
}

function StatusChip({
  tone,
  value,
}: {
  tone: "neutral" | "sky";
  value: string;
}) {
  const toneClass =
    tone === "sky"
      ? "border-sky-300/30 bg-sky-500/15 text-sky-100"
      : "border-white/15 bg-slate-950/70 text-slate-100";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur ${toneClass}`}
    >
      {value}
    </span>
  );
}

function OverlayMessage({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "error" | "neutral" | "sky" | "warning";
}) {
  const toneClass = {
    error: "border-rose-300/25 bg-rose-500/12 text-rose-100",
    neutral: "border-white/15 bg-slate-950/72 text-slate-100",
    sky: "border-cyan-300/25 bg-cyan-500/12 text-cyan-100",
    warning: "border-amber-300/25 bg-amber-500/12 text-amber-100",
  }[tone];

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm leading-6 backdrop-blur ${toneClass}`}
    >
      {children}
    </div>
  );
}

function formatResolution(
  value: LiveReviewController["selectedVideo"],
): string {
  if (value === null) {
    return "No video selected";
  }

  return `${String(value.width)}×${String(value.height)}`;
}

function formatFramesPerSecondValue(
  value: LiveReviewController["selectedVideo"],
): string {
  if (value === null) {
    return "No fps";
  }

  return `${formatFramesPerSecond(value.fps)} FPS`;
}

function formatFrameCountValue(
  value: LiveReviewController["selectedVideo"],
): string {
  if (value === null) {
    return "No frames";
  }

  return `${String(value.frame_count)} Frames`;
}

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
