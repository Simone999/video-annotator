import type { LiveReviewController } from "../hooks/use-live-review-controller";

export function ReviewTransportControls({
  controller,
}: {
  controller: LiveReviewController;
}) {
  if (controller.selectedVideo === null) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        Transport
      </div>
      <form
        className="grid gap-4 px-4 pb-4"
        onSubmit={controller.handleFrameSubmit}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_auto]">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Frame number
            </span>
            <input
              aria-label="Frame number"
              className="border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/40"
              ref={controller.frameInputRef}
              inputMode="numeric"
              min={0}
              max={controller.selectedVideo.frame_count - 1}
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
            className="inline-flex items-center justify-center self-end border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
            type="submit"
          >
            Load frame
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <button
            aria-label="Previous frame"
            className="inline-flex items-center justify-center border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
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
            className="inline-flex items-center justify-center border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
            disabled={!controller.canLoadNextFrame}
            type="button"
            onClick={() => {
              controller.handleFrameStep(1);
            }}
          >
            Next frame
          </button>
          <button
            className="inline-flex items-center justify-center border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
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
            className="inline-flex items-center justify-center border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
            disabled={controller.nextAnnotatedFrameIndex === null}
            type="button"
            onClick={() => {
              controller.handleFrameJump(controller.nextAnnotatedFrameIndex);
            }}
          >
            Next annotated frame
          </button>
          <button
            className="inline-flex items-center justify-center border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
            disabled={controller.previousKeyframeIndex === null}
            type="button"
            onClick={() => {
              controller.handleFrameJump(controller.previousKeyframeIndex);
            }}
          >
            Previous keyframe
          </button>
          <button
            className="inline-flex items-center justify-center border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/25 hover:bg-white/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
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
          className="inline-flex items-center justify-center self-start border border-emerald-300/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-200/40 hover:bg-emerald-500/20"
          type="button"
          onClick={controller.handlePlaybackToggle}
        >
          {controller.isPlaybackActive ? "Pause playback" : "Play context"}
        </button>
        <p className="text-sm leading-6 text-slate-400">
          Timeline and selected range controls land in next task.
        </p>
      </form>
    </footer>
  );
}
