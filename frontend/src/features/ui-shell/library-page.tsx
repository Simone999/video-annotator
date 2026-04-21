import type { UiShellVideo } from "./types";

function formatResolution(video: UiShellVideo): string {
  return `${String(video.resolution.width)}x${String(video.resolution.height)}`;
}

function formatStateLabel(state: UiShellVideo["state"]): string {
  switch (state) {
    case "not_started":
      return "Not Started";
    case "started":
      return "Started";
    case "in_progress":
      return "In Progress";
    case "ready":
      return "Ready";
    case "exported":
      return "Exported";
  }
}

export function UiShellLibraryPage({
  onSelectVideo,
  selectedVideoId,
  videos,
}: {
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string | null;
  videos: UiShellVideo[];
}) {
  return (
    <div className="app-shell ui-shell">
      <header className="ui-shell-panel">
        <p className="ui-shell-kicker">Mockup UI shell foundation</p>
        <div className="ui-shell-header">
          <div>
            <h1 className="ui-shell-title">Video Library</h1>
            <p className="ui-shell-copy">
              Fixture-backed host is now default app entry. Detailed mockup
              chrome lands in follow-up stories.
            </p>
          </div>
          <div className="ui-shell-pill-row">
            <span className="ui-shell-pill">Page: library</span>
            <span className="ui-shell-pill">
              Source: static frontend fixtures
            </span>
          </div>
        </div>
      </header>

      <section className="ui-shell-grid" aria-label="Fixture videos">
        {videos.map((video) => {
          const isSelected = video.id === selectedVideoId;

          return (
            <button
              key={video.id}
              aria-pressed={isSelected}
              className="ui-shell-card"
              type="button"
              onClick={() => {
                onSelectVideo(video.id);
              }}
            >
              <img
                alt={video.previewAlt}
                className="ui-shell-preview"
                src={video.previewImageUrl}
              />
              <div className="ui-shell-card-body">
                <div className="ui-shell-card-header">
                  <h2 className="ui-shell-card-title">{video.displayName}</h2>
                  <span className="ui-shell-state-badge">
                    {formatStateLabel(video.state)}
                  </span>
                </div>
                <dl className="ui-shell-metadata">
                  <div>
                    <dt>Frames</dt>
                    <dd>{video.frameCount}</dd>
                  </div>
                  <div>
                    <dt>FPS</dt>
                    <dd>{video.fps}</dd>
                  </div>
                  <div>
                    <dt>Resolution</dt>
                    <dd>{formatResolution(video)}</dd>
                  </div>
                  <div>
                    <dt>Last reviewed</dt>
                    <dd>{video.lastReviewedLabel}</dd>
                  </div>
                </dl>
                <p className="ui-shell-detail-line">{video.detailLine}</p>
                {video.propagationProgressPercent !== null ? (
                  <div
                    aria-label={`Propagation ${String(video.propagationProgressPercent)} percent`}
                    className="ui-shell-progress"
                  >
                    <div
                      className="ui-shell-progress-bar"
                      style={{
                        width: `${String(video.propagationProgressPercent)}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
