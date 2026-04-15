import "../app/app.css";
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
            aria-label="Exact-frame placeholder"
          >
            <p className="surface-kicker">Exact-frame placeholder</p>
            <div className="surface-frame">
              <span className="surface-label">Exact-frame placeholder</span>
              <p className="surface-copy">
                Center bottom region held for exact-frame work.
              </p>
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

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatDuration(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }

  return `${value.toFixed(2)}s`;
}
