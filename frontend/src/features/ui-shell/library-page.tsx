import type {
  UiShellLibraryVideo,
  UiShellSummaryMetric,
  UiShellSummaryMetricTone,
} from "./types";

function formatResolution(video: UiShellLibraryVideo): string {
  return `${String(video.resolution.width)}x${String(video.resolution.height)}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatStateLabel(state: UiShellLibraryVideo["state"]): string {
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

function getMetricToneClassName(tone: UiShellSummaryMetricTone): string {
  switch (tone) {
    case "primary":
      return "ui-shell-summary-card--primary";
    case "secondary":
      return "ui-shell-summary-card--secondary";
    case "tertiary":
      return "ui-shell-summary-card--tertiary";
    case "default":
      return "";
  }
}

export function UiShellLibraryPage({
  onOpenReview,
  onSelectVideo,
  selectedVideoId,
  summaryMetrics,
  videos,
}: {
  onOpenReview: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string | null;
  summaryMetrics: UiShellSummaryMetric[];
  videos: UiShellLibraryVideo[];
}) {
  return (
    <div className="ui-shell">
      <header className="ui-shell-topbar">
        <div className="ui-shell-topbar-group">
          <span className="ui-shell-brand">Video Annotation</span>
          <label className="ui-shell-top-search">
            <span className="ui-shell-icon" aria-hidden="true">
              search
            </span>
            <input placeholder="Search videos..." type="text" />
          </label>
        </div>
        <div className="ui-shell-topbar-actions">
          <button
            aria-label="Settings"
            className="ui-shell-icon-button"
            type="button"
          >
            <span className="ui-shell-icon" aria-hidden="true">
              settings
            </span>
          </button>
          <button
            aria-label="Help"
            className="ui-shell-icon-button"
            type="button"
          >
            <span className="ui-shell-icon" aria-hidden="true">
              help_outline
            </span>
          </button>
        </div>
      </header>

      <div className="ui-shell-frame">
        <nav aria-label="Primary" className="ui-shell-nav">
          <button
            className="ui-shell-nav-item ui-shell-nav-item--active"
            type="button"
          >
            <span className="ui-shell-icon" aria-hidden="true">
              dashboard
            </span>
            <span className="ui-shell-nav-copy">Dashboard</span>
          </button>
          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              movie
            </span>
            <span className="ui-shell-nav-copy">Videos</span>
          </button>
          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              frame_inspect
            </span>
            <span className="ui-shell-nav-copy">Review</span>
          </button>
          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              task_alt
            </span>
            <span className="ui-shell-nav-copy">Exported</span>
          </button>

          <div className="ui-shell-nav-spacer" />

          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              sensors
            </span>
            <span className="ui-shell-nav-copy">Local Status</span>
          </button>
        </nav>

        <main className="app-shell ui-shell-page">
          <section className="ui-shell-page-header">
            <div>
              <h1 className="ui-shell-title">Video Library</h1>
              <p className="ui-shell-copy">
                Browse local videos, choose work, and open a video for
                annotation review.
              </p>
            </div>
          </section>

          <ul
            aria-label="Library summary"
            className="ui-shell-summary"
            role="list"
          >
            {summaryMetrics.map((metric) => {
              const toneClassName = getMetricToneClassName(metric.tone);

              return (
                <li
                  key={metric.label}
                  className={`ui-shell-summary-card ${toneClassName}`.trim()}
                >
                  <span className="ui-shell-summary-label">{metric.label}</span>
                  <strong className="ui-shell-summary-value">
                    {metric.value}
                  </strong>
                </li>
              );
            })}
          </ul>

          <section className="ui-shell-toolbar" aria-label="Library filters">
            <label className="ui-shell-search">
              <span className="ui-shell-icon" aria-hidden="true">
                search
              </span>
              <input
                placeholder="Search filename, folder, or tag"
                type="text"
              />
            </label>
            <button className="ui-shell-select" type="button">
              <span>Status: All</span>
              <span className="ui-shell-icon" aria-hidden="true">
                expand_more
              </span>
            </button>
            <button className="ui-shell-select" type="button">
              <span>Sort: Recent</span>
              <span className="ui-shell-icon" aria-hidden="true">
                expand_more
              </span>
            </button>
          </section>

          <section className="ui-shell-grid" aria-label="Library videos">
            {videos.length === 0 ? (
              <div className="ui-shell-empty-state">
                <h2 className="ui-shell-empty-title">No indexed videos yet</h2>
                <p className="ui-shell-copy">
                  Add local videos to backend catalog, then reload shell.
                </p>
              </div>
            ) : null}

            {videos.map((video) => {
              const isSelected = video.id === selectedVideoId;

              return (
                <article
                  key={video.id}
                  aria-label={video.displayName}
                  className="ui-shell-library-card"
                  data-selected={isSelected}
                  data-state={video.state}
                >
                  <div className="ui-shell-card-accent" aria-hidden="true" />
                  <div className="ui-shell-card-preview-frame">
                    <img
                      alt={video.previewAlt}
                      className="ui-shell-preview"
                      src={video.previewImageUrl}
                    />
                    <div className="ui-shell-card-overlay" aria-hidden="true" />
                    <span className="ui-shell-state-badge">
                      <span className="ui-shell-state-dot" aria-hidden="true" />
                      {formatStateLabel(video.state)}
                    </span>
                  </div>
                  <div className="ui-shell-card-body">
                    <div className="ui-shell-card-header">
                      <div>
                        <h2 className="ui-shell-card-title">
                          {video.displayName}
                        </h2>
                        <p className="ui-shell-card-context">
                          {video.contextLine}
                        </p>
                      </div>
                      <button
                        aria-label={`More actions for ${video.displayName}`}
                        className="ui-shell-card-menu"
                        type="button"
                        onClick={() => {
                          onSelectVideo(video.id);
                        }}
                      >
                        <span className="ui-shell-icon" aria-hidden="true">
                          more_vert
                        </span>
                      </button>
                    </div>
                    <dl className="ui-shell-metadata">
                      <div>
                        <dt>Frames</dt>
                        <dd>{formatNumber(video.frameCount)}</dd>
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
                    <div className="ui-shell-card-footer">
                      <p className="ui-shell-detail-line">{video.detailLine}</p>
                      {video.state === "in_progress" &&
                      video.propagationProgressPercent !== null ? (
                        <div className="ui-shell-progress-group">
                          <div className="ui-shell-progress-copy">
                            <span>
                              Propagation completion:{" "}
                              {String(video.propagationProgressPercent)}%
                            </span>
                          </div>
                          <div
                            aria-label={`Propagation completion ${video.displayName} ${String(video.propagationProgressPercent)} percent`}
                            className="ui-shell-progress"
                          >
                            <div
                              className="ui-shell-progress-bar"
                              style={{
                                width: `${String(video.propagationProgressPercent)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="ui-shell-card-actions">
                      <button
                        aria-label={`Open Review ${video.displayName}`}
                        className="ui-shell-open-review"
                        type="button"
                        onClick={() => {
                          onOpenReview(video.id);
                        }}
                      >
                        Open Review
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
