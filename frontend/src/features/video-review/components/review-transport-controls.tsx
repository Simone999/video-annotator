import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import type { LiveReviewController } from "../hooks/use-live-review-controller";

export function ReviewTransportControls({
  controller,
}: {
  controller: LiveReviewController;
}) {
  const timelineScrubStateRef = useRef<{
    dragging: boolean;
    lastFrameIdx: number | null;
  }>({
    dragging: false,
    lastFrameIdx: null,
  });

  if (controller.selectedVideo === null) {
    return null;
  }

  const maxFrameIndex = Math.max(controller.selectedVideo.frame_count - 1, 0);

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

  function handleTimelinePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    timelineScrubStateRef.current.dragging = true;
    timelineScrubStateRef.current.lastFrameIdx = controller.currentFrameIndex;
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

  return (
    <footer className="timeline-shell border-t border-white/10">
      <div className="section-rule px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Transport
      </div>
      <div className="grid gap-4 px-4 pb-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <section aria-label="Review timeline" className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              <TransportMetric
                label="Current frame"
                value={`${String(controller.currentFrameIndex)} / ${String(maxFrameIndex)}`}
              />
              <TransportMetric
                label="Selected range"
                value={formatSelectedRange(controller.selectedRange)}
              />
              <TransportMetric
                label="Annotated"
                value={String(controller.annotatedFrameIndices.length)}
              />
              <TransportMetric
                label="Keyframes"
                value={String(controller.keyframeIndices.length)}
              />
            </div>

            <div
              aria-label="Timeline scrubber"
              aria-orientation="horizontal"
              aria-valuemax={maxFrameIndex}
              aria-valuemin={0}
              aria-valuenow={controller.currentFrameIndex}
              aria-valuetext={`Canonical frame ${String(
                controller.currentFrameIndex,
              )}`}
              className="timeline-track relative overflow-hidden border border-white/10 px-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
              role="slider"
              tabIndex={0}
              onKeyDown={handleTimelineKeyDown}
              onPointerCancel={handleTimelinePointerUp}
              onPointerDown={handleTimelinePointerDown}
              onPointerMove={handleTimelinePointerMove}
              onPointerUp={handleTimelinePointerUp}
            >
              <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-white/10" />
              {controller.selectedRange !== null ? (
                <div
                  className="timeline-range absolute bottom-4 top-4"
                  style={resolveTimelineRangeStyle({
                    endFrameIdx: controller.selectedRange.endFrameIdx,
                    maxFrameIndex,
                    startFrameIdx: controller.selectedRange.startFrameIdx,
                  })}
                />
              ) : null}
              {controller.annotatedFrameIndices.map((frameIdx) => (
                <FrameMarker
                  currentFrameIdx={controller.currentFrameIndex}
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
                  currentFrameIdx={controller.currentFrameIndex}
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
                className="timeline-playhead absolute bottom-3 top-3 w-[2px]"
                style={{
                  left: `calc(${String(
                    resolveTimelinePercent({
                      frameIdx: controller.currentFrameIndex,
                      maxFrameIndex,
                    }),
                  )}% - 1px)`,
                }}
              />
              <div className="relative flex items-center justify-between font-mono text-[10px] text-slate-500">
                <span>0</span>
                <span>{maxFrameIndex}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-[2px] bg-cyan-300" />
                Current frame
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 border border-slate-950/80 bg-sky-300" />
                Annotated marker
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="timeline-keyframe h-2.5 w-2.5 rotate-45 border border-slate-950/80" />
                Keyframe marker
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="timeline-range h-3 w-8" />
                Selected range
              </span>
            </div>
          </section>

          <section className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
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
              <label className="flex flex-col gap-2">
                <span className="console-kicker text-xs font-semibold tracking-[0.18em]">
                  Propagation end frame
                </span>
                <input
                  aria-label="Propagation end frame"
                  className="ghost-field border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
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
              </label>
            </div>
            {controller.propagationInputError !== null ? (
              <p className="text-sm leading-6 text-rose-200">
                {controller.propagationInputError}
              </p>
            ) : (
              <p className="console-copy text-sm leading-6">
                Timeline shows canonical current frame, manifest markers, and
                shared selected range before interaction wiring lands.
              </p>
            )}
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <button
                aria-label="Previous frame"
                className="ghost-button inline-flex items-center justify-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={!controller.canLoadPreviousFrame}
                type="button"
                onClick={() => {
                  controller.handleFrameStep(-1);
                }}
              >
                Previous frame
              </button>
              <button
                aria-label="Next frame"
                className="ghost-button inline-flex items-center justify-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={!controller.canLoadNextFrame}
                type="button"
                onClick={() => {
                  controller.handleFrameStep(1);
                }}
              >
                Next frame
              </button>
              <button
                className="ghost-button inline-flex items-center justify-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={controller.previousAnnotatedFrameIndex === null}
                type="button"
                onClick={() => {
                  controller.handleFrameJump(
                    controller.previousAnnotatedFrameIndex,
                  );
                }}
              >
                Previous annotated frame
              </button>
              <button
                className="ghost-button inline-flex items-center justify-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={controller.nextAnnotatedFrameIndex === null}
                type="button"
                onClick={() => {
                  controller.handleFrameJump(
                    controller.nextAnnotatedFrameIndex,
                  );
                }}
              >
                Next annotated frame
              </button>
              <button
                className="ghost-button inline-flex items-center justify-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={controller.previousKeyframeIndex === null}
                type="button"
                onClick={() => {
                  controller.handleFrameJump(controller.previousKeyframeIndex);
                }}
              >
                Previous keyframe
              </button>
              <button
                className="ghost-button inline-flex items-center justify-center border border-white/15 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                disabled={controller.nextKeyframeIndex === null}
                type="button"
                onClick={() => {
                  controller.handleFrameJump(controller.nextKeyframeIndex);
                }}
              >
                Next keyframe
              </button>
            </div>
            <button
              className="ghost-button inline-flex items-center justify-center self-start border border-white/15 px-4 py-2 text-sm font-medium"
              type="button"
              onClick={controller.handlePlaybackToggle}
            >
              {controller.isPlaybackActive ? "Pause playback" : "Play context"}
            </button>
          </section>
        </div>

        <section
          aria-label="Exact frame fallback"
          className="workspace-subpanel border border-white/10 px-4 py-4"
          role="group"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="console-kicker text-xs font-semibold tracking-[0.2em]">
                Exact frame fallback
              </p>
              <p className="console-copy mt-2 text-sm leading-6">
                Use numeric jump only for direct frame loads that do not fit
                timeline transport.
              </p>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-[minmax(0,220px)_auto]"
              onSubmit={controller.handleFrameSubmit}
            >
              <label className="flex flex-col gap-2">
                <span className="console-kicker text-xs font-semibold tracking-[0.18em]">
                  Frame number
                </span>
                <input
                  aria-label="Frame number"
                  className="ghost-field border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
                  ref={controller.frameInputRef}
                  inputMode="numeric"
                  max={maxFrameIndex}
                  min={0}
                  name="frame-number"
                  step={1}
                  type="number"
                  value={controller.frameInputValue}
                  onChange={(event) => {
                    controller.setFrameInputValue(event.target.value);
                  }}
                />
              </label>
              <button
                className="primary-button inline-flex items-center justify-center self-end border border-cyan-300/20 px-4 py-3 text-sm font-medium text-cyan-100"
                type="submit"
              >
                Load frame
              </button>
            </form>
          </div>
        </section>
      </div>
    </footer>
  );
}

function TransportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-tile border border-white/10 px-3 py-3 font-mono text-[11px]">
      <div className="text-[9px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-100">{value}</div>
    </div>
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
      className={`absolute -translate-x-1/2 border border-slate-950/80 ${
        tone === "annotated"
          ? "top-[34%] h-3 w-2 bg-sky-300"
          : "timeline-keyframe top-[58%] h-2.5 w-2.5 rotate-45"
      }`}
      style={{
        left: `${String(
          resolveTimelinePercent({
            frameIdx,
            maxFrameIndex,
          }),
        )}%`,
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

function formatSelectedRange(
  selectedRange: LiveReviewController["selectedRange"],
): string {
  if (selectedRange === null) {
    return "Invalid";
  }

  return `${String(selectedRange.startFrameIdx)}-${String(selectedRange.endFrameIdx)}`;
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
  const left = Math.min(startPercent, endPercent);
  const width = Math.max(Math.abs(endPercent - startPercent), 0);

  return {
    left: `${String(left)}%`,
    minWidth: "2px",
    width: `${String(width)}%`,
  };
}

function resolveTimelineFrameIndexFromPointer(options: {
  clientX: number;
  maxFrameIndex: number;
  trackElement: HTMLDivElement;
}): number | null {
  const bounds = options.trackElement.getBoundingClientRect();
  if (bounds.width <= 0) {
    return null;
  }

  const relativeX = Math.min(
    Math.max(options.clientX - bounds.left, 0),
    bounds.width,
  );
  return Math.round((relativeX / bounds.width) * options.maxFrameIndex);
}
