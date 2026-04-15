import "../app/app.css";
import { useEffect, useState, type SyntheticEvent } from "react";

import {
  ExactFrameCanvas,
  getFrameAnnotationMaskUrl,
  getIndexedVideoPlaybackUrl,
  useVideoReviewWorkspace,
} from "../features/video-review";

export function App() {
  const workspace = useVideoReviewWorkspace();
  const selectedVideo = workspace.reviewState.selectedVideo;
  const currentFrameIndex = workspace.reviewState.currentFrameIndex;
  const playbackSource =
    selectedVideo === null
      ? null
      : getIndexedVideoPlaybackUrl({ videoId: selectedVideo.id });
  const [frameInputValue, setFrameInputValue] = useState("0");
  const [frameInputError, setFrameInputError] = useState<string | null>(null);
  const exactFrameImageUrl = useObjectUrl(workspace.exactFrame?.blob ?? null);
  const selectedObjectId = workspace.reviewState.sam2.selectedObjectId;
  const sam2DraftBox = workspace.reviewState.sam2.draftBox;
  const sam2Annotations = selectedVideo
    ? workspace.reviewState.sam2.frameAnnotations.map((annotation) => ({
        box:
          annotation.box_xywh_norm === null
            ? null
            : {
                h: annotation.box_xywh_norm[3],
                w: annotation.box_xywh_norm[2],
                x: annotation.box_xywh_norm[0],
                y: annotation.box_xywh_norm[1],
              },
        isSelected: annotation.object_id === selectedObjectId,
        maskUrl:
          annotation.mask === null
            ? null
            : getFrameAnnotationMaskUrl({
                frameIdx: currentFrameIndex,
                objectId: annotation.object_id,
                videoId: selectedVideo.id,
              }),
        objectId: annotation.object_id,
      }))
    : [];
  const canLoadPreviousFrame =
    selectedVideo !== null &&
    currentFrameIndex > 0 &&
    workspace.exactFrameStatus !== "loading";
  const canLoadNextFrame =
    selectedVideo !== null &&
    currentFrameIndex < selectedVideo.frame_count - 1 &&
    workspace.exactFrameStatus !== "loading";

  useEffect(() => {
    setFrameInputValue(String(currentFrameIndex));
    setFrameInputError(null);
  }, [currentFrameIndex, selectedVideo?.id]);

  function handleFrameSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedVideo === null) {
      setFrameInputError("Select a video before loading exact frames.");
      return;
    }

    const parsedFrameIdx = Number(frameInputValue);
    if (
      !Number.isInteger(parsedFrameIdx) ||
      parsedFrameIdx < 0 ||
      parsedFrameIdx >= selectedVideo.frame_count
    ) {
      setFrameInputError(
        `Enter frame 0-${String(selectedVideo.frame_count - 1)}.`,
      );
      return;
    }

    setFrameInputError(null);
    void workspace.loadExactFrame(parsedFrameIdx);
  }

  function handleFrameStep(delta: -1 | 1) {
    if (selectedVideo === null) {
      return;
    }

    const nextFrameIdx = clampFrameIndex({
      frameCount: selectedVideo.frame_count,
      frameIdx: currentFrameIndex + delta,
    });

    if (nextFrameIdx === currentFrameIndex) {
      return;
    }

    setFrameInputError(null);
    void workspace.loadExactFrame(nextFrameIdx);
  }

  function handleRunSam2() {
    if (
      selectedVideo === null ||
      sam2DraftBox === null ||
      selectedObjectId.trim().length === 0
    ) {
      return;
    }

    void workspace.runSam2PromptBox({
      boxXyxyPx: draftBoxToPixelBox({
        draftBox: sam2DraftBox,
        videoHeight: selectedVideo.height,
        videoWidth: selectedVideo.width,
      }),
      frameIdx: currentFrameIndex,
      objectId: selectedObjectId.trim(),
    });
  }

  return (
    <main className="app-shell">
      <section className="workspace-shell" aria-labelledby="workspace-title">
        <aside className="side-panel side-panel--left" aria-label="Video list">
          <p className="panel-kicker">Indexed videos</p>
          <h2 id="workspace-title" className="panel-title">
            {selectedVideo?.display_name ?? "Choose review target"}
          </h2>
          <p className="panel-copy">
            Canonical exact-frame index:{" "}
            {workspace.reviewState.currentFrameIndex}
          </p>
          <div className="video-list-panel">
            {workspace.listStatus === "loading" ? (
              <p className="panel-copy">Loading indexed videos...</p>
            ) : null}

            {workspace.listStatus === "empty" ? (
              <p className="panel-copy">No indexed videos found yet.</p>
            ) : null}

            {workspace.listStatus === "error" ? (
              <p className="panel-copy">{workspace.errorMessage}</p>
            ) : null}

            {workspace.listStatus === "ready" ? (
              <ul className="video-list" aria-label="Indexed videos">
                {workspace.indexedVideos.map((video) => (
                  <li key={video.id}>
                    <button
                      className="video-list-button"
                      aria-pressed={workspace.activeVideoId === video.id}
                      type="button"
                      onClick={() => {
                        void workspace.selectVideo(video.id);
                      }}
                    >
                      Open {video.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>

        <div className="center-column">
          <section
            className="surface surface--playback"
            aria-label="Playback pane"
          >
            <p className="surface-kicker">Playback pane</p>
            <div className="surface-frame">
              {selectedVideo === null ? (
                <>
                  <span className="surface-label">Playback preview</span>
                  <p className="surface-copy">
                    Select an indexed video to load contextual playback.
                  </p>
                </>
              ) : (
                <>
                  <video
                    aria-label="Playback preview"
                    className="playback-video"
                    controls
                    preload="metadata"
                    src={playbackSource ?? undefined}
                  />
                  <p className="surface-copy">
                    Playback stays contextual only. Canonical review frame comes
                    from backend frame index state.
                  </p>
                </>
              )}
            </div>
          </section>

          <section
            className="surface surface--exact"
            aria-label="Exact-frame pane"
            style={{ overflowAnchor: "none" }}
          >
            <p className="surface-kicker">Exact-frame pane</p>
            <div className="surface-frame">
              {selectedVideo === null ? (
                <>
                  <span className="surface-label">Exact-frame preview</span>
                  <p className="surface-copy">
                    Select a video, then jump to canonical frame N from backend
                    exact-frame service.
                  </p>
                </>
              ) : (
                <>
                  <form
                    className="exact-frame-form"
                    onSubmit={handleFrameSubmit}
                  >
                    <label className="exact-frame-field">
                      <span className="exact-frame-field-label">
                        Frame number
                      </span>
                      <input
                        aria-label="Frame number"
                        className="exact-frame-input"
                        inputMode="numeric"
                        min={0}
                        max={selectedVideo.frame_count - 1}
                        step={1}
                        type="number"
                        value={frameInputValue}
                        onChange={(event) => {
                          setFrameInputValue(event.target.value);
                        }}
                      />
                    </label>
                    <label className="exact-frame-field">
                      <span className="exact-frame-field-label">Object ID</span>
                      <input
                        aria-label="Object ID"
                        className="exact-frame-input"
                        type="text"
                        value={selectedObjectId}
                        onChange={(event) => {
                          workspace.setSam2SelectedObject(event.target.value);
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
                        disabled={!canLoadPreviousFrame}
                        type="button"
                        onClick={() => {
                          handleFrameStep(-1);
                        }}
                      >
                        Previous frame
                      </button>
                      <button
                        aria-label="Next frame"
                        className="exact-frame-button"
                        disabled={!canLoadNextFrame}
                        type="button"
                        onClick={() => {
                          handleFrameStep(1);
                        }}
                      >
                        Next frame
                      </button>
                    </div>
                  </form>
                  {frameInputError !== null ? (
                    <p className="surface-copy">{frameInputError}</p>
                  ) : null}
                  {workspace.exactFrameErrorMessage !== null ? (
                    <p className="surface-copy">
                      {workspace.exactFrameErrorMessage}
                    </p>
                  ) : null}
                  {workspace.exactFrameStatus === "loading" ? (
                    <p className="surface-copy">Loading exact frame...</p>
                  ) : null}
                  {workspace.exactFrameStatus === "ready" &&
                  exactFrameImageUrl !== null ? (
                    <>
                      <span className="surface-label">
                        Canonical frame {currentFrameIndex}
                      </span>
                      <ExactFrameCanvas
                        alt={`Exact frame ${String(currentFrameIndex)}`}
                        annotations={sam2Annotations}
                        draftBox={sam2DraftBox}
                        imageUrl={exactFrameImageUrl}
                        onDraftBoxChange={workspace.setSam2DraftBox}
                      />
                      <div className="sam2-controls">
                        <button
                          className="exact-frame-button"
                          disabled={
                            sam2DraftBox === null ||
                            selectedObjectId.trim().length === 0 ||
                            workspace.reviewState.sam2.prompt.status ===
                              "loading"
                          }
                          type="button"
                          onClick={handleRunSam2}
                        >
                          Run SAM2
                        </button>
                        {sam2DraftBox === null ? (
                          <p className="surface-copy">
                            Draw box on exact frame to seed SAM2.
                          </p>
                        ) : (
                          <p className="surface-copy">
                            Draft box ready for {selectedObjectId}
                          </p>
                        )}
                        {workspace.reviewState.sam2.prompt.status ===
                        "loading" ? (
                          <p className="surface-copy">Running SAM2...</p>
                        ) : null}
                        {workspace.reviewState.sam2.prompt.errorMessage !==
                        null ? (
                          <p className="surface-copy">
                            {workspace.reviewState.sam2.prompt.errorMessage}
                          </p>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <p className="surface-copy">
                      Playback time stays separate. Re-enter frame N to confirm
                      canonical backend image.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <aside
          className="side-panel side-panel--right"
          aria-label="Backend metadata"
        >
          <p className="panel-kicker">Backend metadata</p>
          <h2 className="panel-title">Review target</h2>
          {workspace.selectionStatus === "loading" ? (
            <p className="panel-copy">Loading selected video...</p>
          ) : null}
          {selectedVideo === null ? (
            <>
              <p className="panel-copy">
                Pick a video from indexed list to open review workspace.
              </p>
              <p className="panel-copy">
                Selection uses backend detail fetch, not list payload as source
                of truth.
              </p>
            </>
          ) : (
            <>
              <dl className="metadata-list">
                <div className="metadata-row">
                  <dt>Display name</dt>
                  <dd>{selectedVideo.display_name}</dd>
                </div>
                <div className="metadata-row">
                  <dt>Frame count</dt>
                  <dd>{selectedVideo.frame_count}</dd>
                </div>
                <div className="metadata-row">
                  <dt>FPS</dt>
                  <dd>{formatFramesPerSecond(selectedVideo.fps)}</dd>
                </div>
                <div className="metadata-row">
                  <dt>Resolution</dt>
                  <dd>
                    {selectedVideo.width} x {selectedVideo.height}
                  </dd>
                </div>
                <div className="metadata-row">
                  <dt>Duration</dt>
                  <dd>{formatDuration(selectedVideo.duration_seconds)}</dd>
                </div>
              </dl>
              <p className="panel-copy">{selectedVideo.source_path}</p>
              <p className="panel-copy">
                Selection uses backend detail fetch, not list payload as source
                of truth.
              </p>
            </>
          )}
          {workspace.errorMessage !== null ? (
            <p className="panel-copy">{workspace.errorMessage}</p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function clampFrameIndex(options: {
  frameIdx: number;
  frameCount: number;
}): number {
  return Math.min(Math.max(options.frameIdx, 0), options.frameCount - 1);
}

function draftBoxToPixelBox(options: {
  draftBox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  videoWidth: number;
  videoHeight: number;
}): [number, number, number, number] {
  const x1 = Math.floor(options.draftBox.x * options.videoWidth);
  const y1 = Math.floor(options.draftBox.y * options.videoHeight);
  const x2 = Math.ceil(
    (options.draftBox.x + options.draftBox.w) * options.videoWidth,
  );
  const y2 = Math.ceil(
    (options.draftBox.y + options.draftBox.h) * options.videoHeight,
  );

  return [x1, y1, x2, y2];
}

function useObjectUrl(blob: Blob | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob === null) {
      setObjectUrl(null);
      return;
    }

    const nextObjectUrl = URL.createObjectURL(blob);
    setObjectUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [blob]);

  return objectUrl;
}

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatDuration(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }

  return `${value.toFixed(2)}s`;
}
