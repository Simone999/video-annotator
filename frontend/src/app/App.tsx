import "../app/app.css";
import { useEffect, useState, type SyntheticEvent } from "react";

import {
  getIndexedVideoPlaybackUrl,
  useVideoReviewWorkspace,
} from "../features/video-review";

export function App() {
  const workspace = useVideoReviewWorkspace();
  const selectedVideo = workspace.reviewState.selectedVideo;
  const playbackSource =
    selectedVideo === null
      ? null
      : getIndexedVideoPlaybackUrl({ videoId: selectedVideo.id });
  const [frameInputValue, setFrameInputValue] = useState("0");
  const [frameInputError, setFrameInputError] = useState<string | null>(null);
  const exactFrameImageUrl = useObjectUrl(workspace.exactFrame?.blob ?? null);

  useEffect(() => {
    setFrameInputValue(String(workspace.reviewState.currentFrameIndex));
    setFrameInputError(null);
  }, [selectedVideo?.id, workspace.reviewState.currentFrameIndex]);

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
                    <button className="exact-frame-button" type="submit">
                      Load frame
                    </button>
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
                        Canonical frame{" "}
                        {workspace.reviewState.currentFrameIndex}
                      </span>
                      <img
                        alt={`Exact frame ${String(
                          workspace.reviewState.currentFrameIndex,
                        )}`}
                        className="exact-frame-image"
                        src={exactFrameImageUrl}
                      />
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
