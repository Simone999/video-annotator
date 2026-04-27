import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";
import { getVideoThumbnailSpriteUrl } from "../api";
import type { LiveReviewController } from "../hooks/use-live-review-controller";

const TIMELINE_TRACK_INSET_PX = 12;
const THUMBNAIL_SPRITE_FRAME_COUNT = 12;
const THUMBNAIL_SPRITE_STEP = 6;
const THUMBNAIL_WIDTH_PX = 112;

type RangeHandleState = {
  dragging: boolean;
  handle: "start" | "end" | null;
};

export function ReviewTransportControls({
  controller,
}: {
  controller: LiveReviewController;
}) {
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const timelineScrubStateRef = useRef<{
    dragging: boolean;
    lastFrameIdx: number | null;
  }>({
    dragging: false,
    lastFrameIdx: null,
  });
  const rangeHandleStateRef = useRef<RangeHandleState>({
    dragging: false,
    handle: null,
  });

  if (controller.selectedVideo === null) {
    return null;
  }

  const selectedVideo = controller.selectedVideo;
  const maxFrameIndex = Math.max(selectedVideo.frame_count - 1, 0);
  const viewedFrameIndex = controller.previewFrameIndex;
  const thumbnailFrameIndices = resolveThumbnailFrames({
    currentFrameIdx: viewedFrameIndex,
    maxFrameIndex,
  });
  const currentSpriteWindow = resolveThumbnailSpriteWindow({
    currentFrameIdx: viewedFrameIndex,
    frameCount: selectedVideo.frame_count,
  });
  const adjacentSpriteWindowStarts = resolveAdjacentSpriteWindowStarts({
    currentWindowStartFrameIdx: currentSpriteWindow.startFrameIdx,
    frameCount: selectedVideo.frame_count,
  });
  const currentSpriteUrl = getVideoThumbnailSpriteUrl({
    count: currentSpriteWindow.count,
    startFrameIdx: currentSpriteWindow.startFrameIdx,
    videoId: selectedVideo.id,
    width: THUMBNAIL_WIDTH_PX,
  });
  const preloadSpriteUrls = [
    currentSpriteUrl,
    ...adjacentSpriteWindowStarts.map((startFrameIdx) =>
      getVideoThumbnailSpriteUrl({
        count: THUMBNAIL_SPRITE_FRAME_COUNT,
        startFrameIdx,
        videoId: selectedVideo.id,
        width: THUMBNAIL_WIDTH_PX,
      }),
    ),
  ];
  const totalFramesInRange =
    controller.selectedRange === null
      ? 0
      : controller.selectedRange.endFrameIdx -
        controller.selectedRange.startFrameIdx +
        1;
  const visibleSelectedRange = controller.selectedRange ?? {
    endFrameIdx: maxFrameIndex,
    startFrameIdx: 0,
  };

  function scrubTimelineFrame(frameIdx: number | null) {
    if (
      frameIdx === null ||
      frameIdx === timelineScrubStateRef.current.lastFrameIdx
    ) {
      return;
    }

    timelineScrubStateRef.current.lastFrameIdx = frameIdx;
    controller.handleFrameJump(frameIdx);
  }

  function updateRangeHandleFromPointer(
    frameIdx: number | null,
    handle: "start" | "end",
  ) {
    if (frameIdx === null || controller.selectedRange === null) {
      return;
    }

    if (handle === "start") {
      controller.setPropagationRangeStartFrameValue(
        String(Math.min(frameIdx, controller.selectedRange.endFrameIdx)),
      );
      return;
    }

    controller.setPropagationEndFrameValue(
      String(Math.max(frameIdx, controller.selectedRange.startFrameIdx)),
    );
  }

  function handleTimelinePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    timelineScrubStateRef.current.dragging = true;
    timelineScrubStateRef.current.lastFrameIdx = viewedFrameIndex;
    if ("setPointerCapture" in event.currentTarget) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    scrubTimelineFrame(
      resolveTimelineFrameIndexFromPointer({
        clientX: event.clientX,
        maxFrameIndex,
        trackElement: event.currentTarget,
      }),
    );
  }

  function handleTimelinePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!timelineScrubStateRef.current.dragging) {
      return;
    }

    scrubTimelineFrame(
      resolveTimelineFrameIndexFromPointer({
        clientX: event.clientX,
        maxFrameIndex,
        trackElement: event.currentTarget,
      }),
    );
  }

  function handleTimelinePointerUp(event: PointerEvent<HTMLDivElement>) {
    timelineScrubStateRef.current.dragging = false;
    timelineScrubStateRef.current.lastFrameIdx = null;
    if (
      "hasPointerCapture" in event.currentTarget &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleTimelineKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      controller.handleFrameStep(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      controller.handleFrameStep(1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      event.stopPropagation();
      controller.handleFrameJump(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      event.stopPropagation();
      controller.handleFrameJump(maxFrameIndex);
    }
  }

  function handleRangeHandlePointerDown(
    handle: "start" | "end",
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    rangeHandleStateRef.current = {
      dragging: true,
      handle,
    };
    if ("setPointerCapture" in event.currentTarget) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    updateRangeHandleFromPointer(
      resolveTimelineFrameIndexFromPointer({
        clientX: event.clientX,
        maxFrameIndex,
        trackElement: timelineTrackRef.current ?? event.currentTarget,
      }),
      handle,
    );
  }

  function handleRangeHandlePointerMove(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    const activeHandle = rangeHandleStateRef.current.handle;
    if (!rangeHandleStateRef.current.dragging || activeHandle === null) {
      return;
    }

    event.stopPropagation();
    updateRangeHandleFromPointer(
      resolveTimelineFrameIndexFromPointer({
        clientX: event.clientX,
        maxFrameIndex,
        trackElement: timelineTrackRef.current ?? event.currentTarget,
      }),
      activeHandle,
    );
  }

  function handleRangeHandlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    rangeHandleStateRef.current = {
      dragging: false,
      handle: null,
    };
    if (
      "hasPointerCapture" in event.currentTarget &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <footer className="border-t border-outline-variant/20 bg-surface-container">
      <div className="flex h-10 items-center justify-between gap-4 border-b border-outline-variant/10 px-4 font-['JetBrains_Mono'] text-[10px]">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <ToolbarIconButton
            ariaLabel="Previous frame"
            disabled={!controller.canLoadPreviousFrame}
            icon="chevron_left"
            onClick={() => {
              controller.handleFrameStep(-1);
            }}
          />
          <ToolbarIconButton
            ariaLabel={
              controller.isPlaybackActive ? "Pause playback" : "Play context"
            }
            disabled={false}
            icon={controller.isPlaybackActive ? "pause" : "play_arrow"}
            onClick={controller.handlePlaybackToggle}
          />
          <ToolbarIconButton
            ariaLabel="Next frame"
            disabled={!controller.canLoadNextFrame}
            icon="chevron_right"
            onClick={() => {
              controller.handleFrameStep(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-outline">
          <span>START:</span>
          <input
            aria-label="Range start frame"
            className="h-8 w-20 border border-outline-variant/20 bg-surface-container-high px-2 text-center text-[10px] text-on-surface outline-none focus:border-primary-container/40"
            inputMode="numeric"
            max={maxFrameIndex}
            min={0}
            step={1}
            type="number"
            value={controller.propagationRangeStartFrameValue}
            onChange={(event) => {
              controller.setPropagationRangeStartFrameValue(event.target.value);
            }}
          />
          <span>SEED:</span>
          <input
            aria-label="Propagation seed frame"
            className="h-8 w-20 border border-outline-variant/20 bg-surface-container-high px-2 text-center text-[10px] text-on-surface outline-none focus:border-primary-container/40"
            inputMode="numeric"
            max={maxFrameIndex}
            min={0}
            step={1}
            type="number"
            value={controller.propagationSeedFrameValue}
            onChange={(event) => {
              controller.setPropagationSeedFrameValue(event.target.value);
            }}
          />
          <span>END:</span>
          <input
            aria-label="Range end frame"
            className="h-8 w-20 border border-outline-variant/20 bg-surface-container-high px-2 text-center text-[10px] text-on-surface outline-none focus:border-primary-container/40"
            inputMode="numeric"
            max={maxFrameIndex}
            min={0}
            step={1}
            type="number"
            value={controller.propagationEndFrameValue}
            onChange={(event) => {
              controller.setPropagationEndFrameValue(event.target.value);
            }}
          />
          <span>
            TOTAL:{" "}
            <span className="text-on-surface">{totalFramesInRange} frames</span>
          </span>
        </div>
      </div>

      <section aria-label="Review timeline" className="pb-2" role="region">
        <p className="sr-only">
          {viewedFrameIndex} / {maxFrameIndex}
        </p>
        <div aria-hidden="true" className="sr-only">
          {preloadSpriteUrls.map((spriteUrl) => (
            <img alt="" key={spriteUrl} src={spriteUrl} />
          ))}
        </div>
        <p className="px-4 pt-2 font-['JetBrains_Mono'] text-[10px] text-on-surface-variant">
          {visibleSelectedRange.startFrameIdx}-
          {visibleSelectedRange.endFrameIdx}
        </p>
        <div className="flex h-16 gap-[1px] px-4 py-2">
          {thumbnailFrameIndices.map((frameIdx) => {
            const isCurrent = frameIdx === viewedFrameIndex;
            const isAnnotated =
              controller.annotatedFrameIndices.includes(frameIdx);
            const isKeyframe = controller.keyframeIndices.includes(frameIdx);

            return (
              <button
                aria-label={`Open frame ${String(frameIdx)}`}
                className={
                  isCurrent
                    ? "relative flex-1 overflow-hidden border border-primary-container bg-surface-container-high ring-1 ring-primary-container"
                    : "relative flex-1 overflow-hidden border border-outline-variant/20 bg-surface-container-high opacity-60 transition-all hover:border-primary-container/40 hover:opacity-100"
                }
                key={frameIdx}
                type="button"
                onClick={() => {
                  controller.handleFrameJump(frameIdx);
                }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    alt={`Preview frame ${String(frameIdx)}`}
                    className="absolute inset-y-0 h-full max-w-none object-cover"
                    src={currentSpriteUrl}
                    style={resolveThumbnailSpriteImageStyle({
                      frameIdx,
                      spriteCount: currentSpriteWindow.count,
                      spriteStartFrameIdx: currentSpriteWindow.startFrameIdx,
                    })}
                  />
                </div>
                {isCurrent ? (
                  <div className="absolute inset-0 bg-primary-container/10" />
                ) : null}
                {isKeyframe ? (
                  <div className="absolute left-1 top-1 h-1.5 w-1.5 rotate-45 bg-tertiary-fixed-dim" />
                ) : null}
                {isAnnotated ? (
                  <div className="absolute left-1 top-1 h-1.5 w-1.5 bg-sky-300" />
                ) : null}
                <div className="absolute bottom-0 left-0 w-full bg-surface/80 px-1 py-0.5 font-['JetBrains_Mono'] text-[9px] text-on-surface-variant">
                  {frameIdx}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4">
          <div
            aria-label="Timeline scrubber"
            aria-orientation="horizontal"
            aria-valuemax={maxFrameIndex}
            aria-valuemin={0}
            aria-valuenow={viewedFrameIndex}
            aria-valuetext={`Viewed frame ${String(viewedFrameIndex)}`}
            className="relative h-4 border border-outline-variant/20 bg-surface-container-highest outline-none focus-visible:ring-2 focus-visible:ring-primary-container/50"
            ref={timelineTrackRef}
            role="slider"
            tabIndex={0}
            onKeyDown={handleTimelineKeyDown}
            onPointerCancel={handleTimelinePointerUp}
            onPointerDown={handleTimelinePointerDown}
            onPointerMove={handleTimelinePointerMove}
            onPointerUp={handleTimelinePointerUp}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTAwJSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMEwxMCAxMDAiIHN0cm9rZT0iIzM1MzUzNCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-50" />
            {controller.selectedRange !== null ? (
              <div
                className="absolute bottom-0 top-0 border-y border-primary-container/40 bg-primary-container/20"
                style={resolveTimelineRangeStyle({
                  endFrameIdx: controller.selectedRange.endFrameIdx,
                  maxFrameIndex,
                  startFrameIdx: controller.selectedRange.startFrameIdx,
                })}
              >
                <div className="absolute bottom-[4px] left-[3px] right-[3px] top-[4px] bg-primary-container/35" />
              </div>
            ) : null}
            {controller.selectedRange !== null ? (
              <RangeHandle
                ariaLabel="Range start handle"
                frameIdx={controller.selectedRange.startFrameIdx}
                maxFrameIndex={maxFrameIndex}
                onPointerDown={(event) => {
                  handleRangeHandlePointerDown("start", event);
                }}
                onPointerMove={handleRangeHandlePointerMove}
                onPointerUp={handleRangeHandlePointerUp}
              />
            ) : null}
            {controller.selectedRange !== null ? (
              <RangeHandle
                ariaLabel="Range end handle"
                frameIdx={controller.selectedRange.endFrameIdx}
                maxFrameIndex={maxFrameIndex}
                onPointerDown={(event) => {
                  handleRangeHandlePointerDown("end", event);
                }}
                onPointerMove={handleRangeHandlePointerMove}
                onPointerUp={handleRangeHandlePointerUp}
              />
            ) : null}
            {controller.annotatedFrameIndices.map((frameIdx) => (
              <FrameMarker
                currentFrameIdx={viewedFrameIndex}
                frameIdx={frameIdx}
                key={`annotated-${String(frameIdx)}`}
                labelPrefix="Annotated frame marker"
                maxFrameIndex={maxFrameIndex}
                onSelect={controller.handleFrameJump}
                tone="annotated"
              />
            ))}
            {controller.keyframeIndices.map((frameIdx) => (
              <FrameMarker
                currentFrameIdx={viewedFrameIndex}
                frameIdx={frameIdx}
                key={`keyframe-${String(frameIdx)}`}
                labelPrefix="Keyframe marker"
                maxFrameIndex={maxFrameIndex}
                onSelect={controller.handleFrameJump}
                tone="keyframe"
              />
            ))}
            <div
              aria-hidden="true"
              className="timeline-playhead absolute bottom-[-4px] top-[-10px] z-20 w-0.5 bg-primary-container"
              style={{
                left: resolveTimelineTrackOffset({
                  frameIdx: viewedFrameIndex,
                  maxFrameIndex,
                  pixelNudge: -1,
                }),
              }}
            >
              <div className="absolute -top-3 -translate-x-1/2 bg-primary-container px-1 font-['JetBrains_Mono'] text-[8px] font-bold text-on-primary-fixed">
                {viewedFrameIndex}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-on-surface-variant">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="block h-2 w-2 rotate-45 bg-tertiary-fixed-dim" />
                manual annotation
              </div>
              <div className="flex items-center gap-2">
                <span className="block h-2 w-2 bg-sky-300" />
                annotated frame
              </div>
              <div className="flex items-center gap-2">
                <span className="block h-1 w-4 bg-primary-container/40" />
                selected range
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2">
                <span>DIR</span>
                <select
                  aria-label="Range direction"
                  className="h-8 border border-outline-variant/20 bg-surface-container-high px-2 text-[10px] text-on-surface outline-none focus:border-primary-container/40"
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
              <SecondaryButton
                disabled={controller.previousAnnotatedFrameIndex === null}
                label="Previous annotated frame"
                onClick={() => {
                  controller.handleFrameJump(
                    controller.previousAnnotatedFrameIndex,
                  );
                }}
              />
              <SecondaryButton
                disabled={controller.nextAnnotatedFrameIndex === null}
                label="Next annotated frame"
                onClick={() => {
                  controller.handleFrameJump(
                    controller.nextAnnotatedFrameIndex,
                  );
                }}
              />
              <SecondaryButton
                disabled={controller.previousKeyframeIndex === null}
                label="Previous keyframe"
                onClick={() => {
                  controller.handleFrameJump(controller.previousKeyframeIndex);
                }}
              />
              <SecondaryButton
                disabled={controller.nextKeyframeIndex === null}
                label="Next keyframe"
                onClick={() => {
                  controller.handleFrameJump(controller.nextKeyframeIndex);
                }}
              />
            </div>
          </div>

          {controller.propagationInputError !== null ? (
            <p className="pt-2 text-sm leading-6 text-rose-200">
              {controller.propagationInputError}
            </p>
          ) : null}
        </div>
      </section>
    </footer>
  );
}

function resolveThumbnailSpriteWindow(options: {
  currentFrameIdx: number;
  frameCount: number;
}): {
  count: number;
  startFrameIdx: number;
} {
  const maxStartFrameIdx = Math.max(
    options.frameCount - THUMBNAIL_SPRITE_FRAME_COUNT,
    0,
  );
  const visibleStartFrameIdx =
    resolveThumbnailFrames({
      currentFrameIdx: options.currentFrameIdx,
      maxFrameIndex: Math.max(options.frameCount - 1, 0),
    })[0] ?? 0;
  const desiredStartFrameIdx =
    Math.floor(visibleStartFrameIdx / THUMBNAIL_SPRITE_STEP) *
    THUMBNAIL_SPRITE_STEP;

  return {
    count: THUMBNAIL_SPRITE_FRAME_COUNT,
    startFrameIdx: Math.min(
      Math.max(desiredStartFrameIdx, 0),
      maxStartFrameIdx,
    ),
  };
}

function resolveAdjacentSpriteWindowStarts(options: {
  currentWindowStartFrameIdx: number;
  frameCount: number;
}): number[] {
  const maxStartFrameIdx = Math.max(
    options.frameCount - THUMBNAIL_SPRITE_FRAME_COUNT,
    0,
  );
  const previousStartFrameIdx = Math.max(
    options.currentWindowStartFrameIdx - THUMBNAIL_SPRITE_STEP,
    0,
  );
  const nextStartFrameIdx = Math.min(
    options.currentWindowStartFrameIdx + THUMBNAIL_SPRITE_STEP,
    maxStartFrameIdx,
  );

  return Array.from(
    new Set(
      [previousStartFrameIdx, nextStartFrameIdx].filter(
        (startFrameIdx) => startFrameIdx !== options.currentWindowStartFrameIdx,
      ),
    ),
  );
}

function resolveThumbnailSpriteImageStyle(options: {
  frameIdx: number;
  spriteCount: number;
  spriteStartFrameIdx: number;
}): {
  left: string;
  width: string;
} {
  return {
    left: `-${String((options.frameIdx - options.spriteStartFrameIdx) * 100)}%`,
    width: `${String(options.spriteCount * 100)}%`,
  };
}

function ToolbarIconButton({
  ariaLabel,
  disabled,
  icon,
  onClick,
}: {
  ariaLabel: string;
  disabled: boolean;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="inline-flex h-7 w-7 items-center justify-center border border-outline-variant/30 transition-colors hover:border-primary-container/40 hover:text-primary-container disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <MaterialSymbolIcon className="text-[16px]" name={icon} />
    </button>
  );
}

function SecondaryButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-8 items-center justify-center border border-outline-variant/20 px-2 text-[10px] text-on-surface transition-colors hover:bg-surface-bright disabled:cursor-not-allowed disabled:text-on-surface-variant"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function RangeHandle({
  ariaLabel,
  frameIdx,
  maxFrameIndex,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  ariaLabel: string;
  frameIdx: number;
  maxFrameIndex: number;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="absolute bottom-[-4px] top-[-4px] z-20 w-3 -translate-x-1/2 border border-slate-950/80 bg-primary-container"
      style={{
        left: resolveTimelineTrackOffset({
          frameIdx,
          maxFrameIndex,
        }),
      }}
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

function FrameMarker({
  currentFrameIdx,
  frameIdx,
  labelPrefix,
  maxFrameIndex,
  onSelect,
  tone,
}: {
  currentFrameIdx: number;
  frameIdx: number;
  labelPrefix: string;
  maxFrameIndex: number;
  onSelect: (frameIdx: number | null) => void;
  tone: "annotated" | "keyframe";
}) {
  return (
    <button
      aria-label={`${labelPrefix} at ${String(frameIdx)}`}
      aria-current={frameIdx === currentFrameIdx ? "step" : undefined}
      className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 border border-slate-950/80 ${
        tone === "annotated"
          ? "h-1.5 w-1.5 bg-sky-300"
          : "h-1.5 w-1.5 rotate-45 bg-tertiary-fixed-dim"
      }`}
      style={{
        left: resolveTimelineTrackOffset({
          frameIdx,
          maxFrameIndex,
        }),
      }}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(frameIdx);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    />
  );
}

function resolveThumbnailFrames(options: {
  currentFrameIdx: number;
  maxFrameIndex: number;
}): number[] {
  const total = Math.min(options.maxFrameIndex + 1, 7);
  const start = Math.max(
    Math.min(options.currentFrameIdx - 3, options.maxFrameIndex - total + 1),
    0,
  );

  return Array.from({ length: total }, (_, index) => start + index);
}

function resolveTimelinePercent(options: {
  frameIdx: number;
  maxFrameIndex: number;
}): number {
  if (options.maxFrameIndex <= 0) {
    return 0;
  }

  return (options.frameIdx / options.maxFrameIndex) * 100;
}

function resolveTimelineRangeStyle(options: {
  startFrameIdx: number;
  endFrameIdx: number;
  maxFrameIndex: number;
}): {
  left: string;
  minWidth: string;
  width: string;
} {
  const startPercent = resolveTimelinePercent({
    frameIdx: options.startFrameIdx,
    maxFrameIndex: options.maxFrameIndex,
  });
  const endPercent = resolveTimelinePercent({
    frameIdx: options.endFrameIdx,
    maxFrameIndex: options.maxFrameIndex,
  });
  const width = Math.max(Math.abs(endPercent - startPercent), 0);

  return {
    left: resolveTimelineTrackOffset({
      frameIdx: Math.min(options.startFrameIdx, options.endFrameIdx),
      maxFrameIndex: options.maxFrameIndex,
    }),
    minWidth: "2px",
    width: resolveTimelineTrackSpan({
      maxFrameIndex: options.maxFrameIndex,
      spanPercent: width / 100,
    }),
  };
}

function resolveTimelineFrameIndexFromPointer(options: {
  clientX: number;
  maxFrameIndex: number;
  trackElement: HTMLElement;
}): number | null {
  const bounds = options.trackElement.getBoundingClientRect();
  const usableWidth = bounds.width - TIMELINE_TRACK_INSET_PX * 2;
  if (usableWidth <= 0) {
    return null;
  }

  const relativeX = Math.min(
    Math.max(options.clientX - bounds.left - TIMELINE_TRACK_INSET_PX, 0),
    usableWidth,
  );
  return Math.round((relativeX / usableWidth) * options.maxFrameIndex);
}

function resolveTimelineTrackOffset(options: {
  frameIdx: number;
  maxFrameIndex: number;
  pixelNudge?: number;
}): string {
  if (options.maxFrameIndex <= 0) {
    return `${String(TIMELINE_TRACK_INSET_PX + (options.pixelNudge ?? 0))}px`;
  }

  const percent = options.frameIdx / options.maxFrameIndex;
  const pixelOffset =
    TIMELINE_TRACK_INSET_PX * (1 - percent * 2) + (options.pixelNudge ?? 0);
  return formatTimelineLength({
    percent,
    pixelOffset,
  });
}

function resolveTimelineTrackSpan(options: {
  maxFrameIndex: number;
  spanPercent: number;
}): string {
  if (options.maxFrameIndex <= 0 || options.spanPercent <= 0) {
    return "0px";
  }

  return formatTimelineLength({
    percent: options.spanPercent,
    pixelOffset: -TIMELINE_TRACK_INSET_PX * 2 * options.spanPercent,
  });
}

function formatTimelineLength(options: {
  percent: number;
  pixelOffset: number;
}): string {
  const roundedPercent = Number((options.percent * 100).toFixed(4));
  const roundedPixels = Number(Math.abs(options.pixelOffset).toFixed(4));
  if (roundedPercent === 0) {
    return `${String(roundedPixels)}px`;
  }
  if (roundedPixels === 0) {
    return `${String(roundedPercent)}%`;
  }

  return `calc(${String(roundedPercent)}% ${
    options.pixelOffset < 0 ? "-" : "+"
  } ${String(roundedPixels)}px)`;
}
