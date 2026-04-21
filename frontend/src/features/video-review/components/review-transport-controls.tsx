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
    <footer className="review-surface-footer">
      <form
        className="exact-frame-form review-surface-frame-form"
        onSubmit={controller.handleFrameSubmit}
      >
        <label className="exact-frame-field">
          <span className="exact-frame-field-label">Frame number</span>
          <input
            aria-label="Frame number"
            className="exact-frame-input"
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
        <button className="exact-frame-button" type="submit">
          Load frame
        </button>
        <div className="exact-frame-nav">
          <button
            aria-label="Previous frame"
            className="exact-frame-button"
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
            className="exact-frame-button"
            disabled={!controller.canLoadNextFrame}
            type="button"
            onClick={() => {
              controller.handleFrameStep(1);
            }}
          >
            Next frame
          </button>
        </div>
        <div className="exact-frame-nav">
          <button
            className="exact-frame-button"
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
            className="exact-frame-button"
            disabled={controller.nextAnnotatedFrameIndex === null}
            type="button"
            onClick={() => {
              controller.handleFrameJump(controller.nextAnnotatedFrameIndex);
            }}
          >
            Next annotated frame
          </button>
        </div>
        <div className="exact-frame-nav">
          <button
            className="exact-frame-button"
            disabled={controller.previousKeyframeIndex === null}
            type="button"
            onClick={() => {
              controller.handleFrameJump(controller.previousKeyframeIndex);
            }}
          >
            Previous keyframe
          </button>
          <button
            className="exact-frame-button"
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
          className="exact-frame-button"
          type="button"
          onClick={controller.handlePlaybackToggle}
        >
          {controller.isPlaybackActive ? "Pause playback" : "Play context"}
        </button>
      </form>
    </footer>
  );
}
