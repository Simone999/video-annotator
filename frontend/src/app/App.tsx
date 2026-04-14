import "../app/app.css";
import { useVideoReviewWorkspace } from "../features/video-review";

export function App() {
  const workspace = useVideoReviewWorkspace();
  const selectedVideo = workspace.reviewState.selectedVideo;

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
            aria-label="Playback placeholder"
          >
            <p className="surface-kicker">Playback placeholder</p>
            <div className="surface-frame">
              <span className="surface-label">Playback placeholder</span>
              <p className="surface-copy">
                Center top region for viewing only.
              </p>
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
          aria-label="Selection state"
        >
          <p className="panel-kicker">Selection state</p>
          <h2 className="panel-title">Selected video</h2>
          <p className="panel-copy">
            {workspace.selectionStatus === "loading"
              ? "Loading selected video..."
              : (selectedVideo?.display_name ??
                "Pick a video from indexed list to open review workspace.")}
          </p>
          <p className="panel-copy">
            {selectedVideo?.source_path ??
              "Playback pane and exact-frame pane stay unchanged for this story."}
          </p>
          <p className="panel-copy">
            {workspace.errorMessage ??
              "Selection uses backend detail fetch, not list payload as source of truth."}
          </p>
        </aside>
      </section>
    </main>
  );
}
