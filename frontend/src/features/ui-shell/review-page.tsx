import type { UiShellReviewObject, UiShellVideo } from "./types";

function formatResolution(video: UiShellVideo): string {
  return `${String(video.resolution.width)}×${String(video.resolution.height)}`;
}

function formatObjectRowLabel(object: UiShellReviewObject): string {
  return object.id.replace("_", " ");
}

function getBoxIcon(isPresent: boolean): string {
  return isPresent ? "crop_din" : "crop_free";
}

function getMaskIcon(maskState: UiShellReviewObject["maskState"]): string {
  return maskState === "missing" ? "polyline" : "gesture";
}

export function UiShellReviewPage({
  onBackToLibrary,
  onSelectObject,
  selectedObject,
  selectedObjectId,
  video,
}: {
  onBackToLibrary: () => void;
  onSelectObject: (objectId: string) => void;
  selectedObject: UiShellReviewObject | null;
  selectedObjectId: string | null;
  video: UiShellVideo | null;
}) {
  if (video === null || selectedObject === null) {
    return (
      <div className="app-shell ui-shell">
        <section className="ui-shell-panel">
          <p className="ui-shell-kicker">Mockup UI shell foundation</p>
          <h1 className="ui-shell-title">Review shell unavailable</h1>
          <p className="ui-shell-copy">
            Select fixture video from library before opening review shell.
          </p>
        </section>
      </div>
    );
  }

  const { review } = video;

  return (
    <div className="ui-shell">
      <header className="ui-shell-topbar">
        <div className="ui-shell-topbar-group">
          <span className="ui-shell-brand">Video Annotation</span>
          <div
            aria-label="Review session actions"
            className="ui-shell-review-top-actions"
          >
            <button
              className="ui-shell-review-top-action"
              type="button"
              onClick={onBackToLibrary}
            >
              Back to Library
            </button>
            <button className="ui-shell-review-top-action" type="button">
              Save Session
            </button>
            <button
              className="ui-shell-review-top-action ui-shell-review-top-action--primary"
              type="button"
            >
              Export
            </button>
          </div>
        </div>
        <div
          aria-label="Review session metadata"
          className="ui-shell-review-session-meta"
        >
          <span>
            Video: <strong>{video.displayName}</strong>
          </span>
          <span>
            Frames: <strong>{video.frameCount}</strong>
          </span>
          <span>
            Current:{" "}
            <strong className="ui-shell-review-session-current">
              {review.currentFrame}
            </strong>
          </span>
          <span>
            FPS: <strong>{video.fps.toFixed(1)}</strong>
          </span>
        </div>
      </header>

      <div className="ui-shell-frame">
        <nav aria-label="Primary" className="ui-shell-nav">
          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              dashboard
            </span>
            <span className="ui-shell-nav-copy">Dashboard</span>
          </button>
          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              precision_manufacturing
            </span>
            <span className="ui-shell-nav-copy">Workspace</span>
          </button>
          <button
            className="ui-shell-nav-item ui-shell-nav-item--active"
            type="button"
          >
            <span className="ui-shell-icon" aria-hidden="true">
              visibility_lock
            </span>
            <span className="ui-shell-nav-copy">Review</span>
          </button>
          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              ios_share
            </span>
            <span className="ui-shell-nav-copy">Export</span>
          </button>

          <div className="ui-shell-nav-spacer" />

          <button className="ui-shell-nav-item" type="button">
            <span className="ui-shell-icon" aria-hidden="true">
              sensors
            </span>
            <span className="ui-shell-nav-copy">System Status</span>
          </button>
        </nav>

        <main className="ui-shell-review-page">
          <section className="ui-shell-review-rail">
            <header className="ui-shell-review-rail-header">
              <div>
                <h1 className="ui-shell-review-rail-title">
                  Annotations · Frame {review.currentFrame}
                </h1>
                <p className="ui-shell-review-rail-copy">
                  Current frame objects with box and mask state
                </p>
              </div>
              <span className="ui-shell-review-pill">
                {review.objectCountLabel}
              </span>
            </header>

            <div className="ui-shell-review-rail-columns" aria-hidden="true">
              <span className="ui-shell-review-rail-column--object">
                Object
              </span>
              <span>Box</span>
              <span>Mask</span>
            </div>

            <div className="ui-shell-review-object-list">
              {review.objects.map((object) => {
                const isSelected = object.id === selectedObjectId;

                return (
                  <button
                    key={object.id}
                    aria-label={`Select ${object.id}`}
                    aria-pressed={isSelected}
                    className="ui-shell-review-object-row"
                    data-selected={isSelected}
                    type="button"
                    onClick={() => {
                      onSelectObject(object.id);
                    }}
                  >
                    <span
                      className="ui-shell-icon ui-shell-review-object-visibility"
                      aria-hidden="true"
                    >
                      {object.visible ? "visibility" : "visibility_off"}
                    </span>
                    <span
                      className="ui-shell-review-object-label"
                      data-hidden={!object.visible}
                    >
                      {formatObjectRowLabel(object)}
                    </span>
                    <span
                      className="ui-shell-icon ui-shell-review-object-status"
                      aria-hidden="true"
                      data-active={object.boxState === "present"}
                    >
                      {getBoxIcon(object.boxState === "present")}
                    </span>
                    <span
                      className="ui-shell-icon ui-shell-review-object-status"
                      aria-hidden="true"
                      data-active={object.maskState !== "missing"}
                    >
                      {getMaskIcon(object.maskState)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="ui-shell-review-rail-footer">
              <button className="ui-shell-review-outline-button" type="button">
                <span className="ui-shell-icon" aria-hidden="true">
                  add
                </span>
                New Object
              </button>
            </div>
          </section>

          <section className="ui-shell-review-stage-column">
            <header className="ui-shell-review-stage-toolbar">
              <div className="ui-shell-review-stage-meta">
                <strong>{video.displayName}</strong>
                <span>{formatResolution(video)}</span>
                <span>{video.fps} FPS</span>
              </div>

              <div className="ui-shell-review-stage-controls">
                <button
                  aria-label="Previous frame"
                  className="ui-shell-review-icon-button"
                  type="button"
                >
                  <span className="ui-shell-icon" aria-hidden="true">
                    chevron_left
                  </span>
                </button>
                <button
                  aria-label="Play current frame"
                  className="ui-shell-review-icon-button"
                  type="button"
                >
                  <span className="ui-shell-icon" aria-hidden="true">
                    play_arrow
                  </span>
                </button>
                <button
                  aria-label="Next frame"
                  className="ui-shell-review-icon-button"
                  type="button"
                >
                  <span className="ui-shell-icon" aria-hidden="true">
                    chevron_right
                  </span>
                </button>
                <span className="ui-shell-review-stage-label">Jump</span>
                <input
                  aria-label="Jump to frame"
                  className="ui-shell-review-stage-input"
                  readOnly
                  value={review.currentFrame}
                />
                <button
                  className="ui-shell-review-outline-button"
                  type="button"
                >
                  Go
                </button>
                <div className="ui-shell-review-zoom-group">
                  <button
                    aria-label="Zoom out"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      remove
                    </span>
                  </button>
                  <div className="ui-shell-review-zoom-value">100%</div>
                  <button
                    aria-label="Zoom in"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      add
                    </span>
                  </button>
                  <button
                    aria-label="Fit stage"
                    className="ui-shell-review-outline-button"
                    type="button"
                  >
                    Fit
                  </button>
                </div>
              </div>
            </header>

            <div className="ui-shell-review-stage">
              <div className="ui-shell-review-stage-frame">
                <img
                  alt={`${video.previewAlt} review stage`}
                  className="ui-shell-review-stage-image"
                  src={video.previewImageUrl}
                />
                <button
                  aria-label="Play fixture video"
                  className="ui-shell-review-stage-play"
                  type="button"
                >
                  <span className="ui-shell-icon" aria-hidden="true">
                    play_arrow
                  </span>
                </button>
                <div
                  className="ui-shell-review-stage-overlays"
                  aria-hidden="true"
                >
                  {review.objects.map((object) => {
                    if (!object.visible || object.stageOverlay === null) {
                      return null;
                    }

                    const isSelected = object.id === selectedObjectId;

                    return (
                      <div
                        key={object.id}
                        className="ui-shell-review-stage-box"
                        data-selected={isSelected}
                        style={{
                          height: `${String(object.stageOverlay.heightPercent)}%`,
                          left: `${String(object.stageOverlay.leftPercent)}%`,
                          top: `${String(object.stageOverlay.topPercent)}%`,
                          width: `${String(object.stageOverlay.widthPercent)}%`,
                        }}
                      >
                        {isSelected ? (
                          <>
                            <div className="ui-shell-review-stage-mask" />
                            <span className="ui-shell-review-stage-handle ui-shell-review-stage-handle--top-left" />
                            <span className="ui-shell-review-stage-handle ui-shell-review-stage-handle--top-right" />
                            <span className="ui-shell-review-stage-handle ui-shell-review-stage-handle--bottom-left" />
                            <span className="ui-shell-review-stage-handle ui-shell-review-stage-handle--bottom-right" />
                          </>
                        ) : null}

                        <div className="ui-shell-review-stage-tag">
                          {object.maskState === "present" ? (
                            <span className="ui-shell-icon" aria-hidden="true">
                              polyline
                            </span>
                          ) : null}
                          <span>{object.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <section className="ui-shell-review-bottom">
              <div className="ui-shell-review-transport">
                <div className="ui-shell-review-transport-buttons">
                  <button
                    aria-label="Previous keyframe"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      skip_previous
                    </span>
                  </button>
                  <button
                    aria-label="Previous frame transport"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      chevron_left
                    </span>
                  </button>
                  <button
                    aria-label="Play transport"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      play_arrow
                    </span>
                  </button>
                  <button
                    aria-label="Next frame transport"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                  <button
                    aria-label="Next keyframe"
                    className="ui-shell-review-icon-button"
                    type="button"
                  >
                    <span className="ui-shell-icon" aria-hidden="true">
                      skip_next
                    </span>
                  </button>
                  <span className="ui-shell-review-transport-copy">
                    prev / next frame
                  </span>
                </div>

                <div className="ui-shell-review-track-summary">
                  <span>
                    START: <strong>{review.rangeStart}</strong>
                  </span>
                  <span>
                    END: <strong>{review.rangeEnd}</strong>
                  </span>
                  <span>
                    TOTAL: <strong>{review.trackFrames} frames</strong>
                  </span>
                  <span>
                    TRACK:{" "}
                    <strong className="ui-shell-review-track-summary--propagated">
                      {review.trackPropagated} propagated
                    </strong>{" "}
                    /{" "}
                    <strong className="ui-shell-review-track-summary--corrected">
                      {review.trackCorrected} corrected
                    </strong>
                  </span>
                </div>
              </div>

              <div className="ui-shell-review-thumbnail-row">
                {review.thumbnails.map((thumbnail) => (
                  <div
                    key={thumbnail.id}
                    className="ui-shell-review-thumbnail"
                    data-tone={thumbnail.tone}
                  >
                    {thumbnail.imageUrl === null ? null : (
                      <img
                        alt=""
                        className="ui-shell-review-thumbnail-image"
                        src={thumbnail.imageUrl}
                      />
                    )}
                    {thumbnail.badgeLabel === null ? null : (
                      <span className="ui-shell-review-thumbnail-badge">
                        {thumbnail.badgeLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="ui-shell-review-timeline-wrap">
                <div className="ui-shell-review-timeline">
                  <div className="ui-shell-review-timeline-grid" />
                  <div
                    className="ui-shell-review-timeline-range"
                    style={{
                      left: `${String(review.timelineRangeStartPercent)}%`,
                      right: `${String(100 - review.timelineRangeEndPercent)}%`,
                    }}
                  />
                  <div
                    className="ui-shell-review-timeline-cursor"
                    style={{ left: `${String(review.timelineCursorPercent)}%` }}
                  >
                    <span className="ui-shell-review-timeline-cursor-label">
                      {review.currentFrame}
                    </span>
                  </div>
                  {review.manualMarkerPercents.map((percent) => (
                    <span
                      key={percent}
                      className="ui-shell-review-timeline-marker"
                      style={{ left: `${String(percent)}%` }}
                    />
                  ))}
                  <span
                    className="ui-shell-review-timeline-missing"
                    style={{ left: `${String(review.missingMarkerPercent)}%` }}
                  />
                </div>

                <div className="ui-shell-review-timeline-legend">
                  <span className="ui-shell-review-timeline-legend-item">
                    <span className="ui-shell-review-timeline-legend-swatch ui-shell-review-timeline-legend-swatch--manual" />
                    manual keyframe
                  </span>
                  <span className="ui-shell-review-timeline-legend-item">
                    <span className="ui-shell-review-timeline-legend-swatch ui-shell-review-timeline-legend-swatch--propagated" />
                    propagated span
                  </span>
                  <span className="ui-shell-review-timeline-legend-item">
                    <span className="ui-shell-review-timeline-legend-swatch ui-shell-review-timeline-legend-swatch--missing" />
                    missing frame
                  </span>
                </div>
              </div>
            </section>
          </section>

          <aside
            aria-label="Selected object inspector"
            className="ui-shell-review-inspector"
          >
            <section className="ui-shell-review-card">
              <header className="ui-shell-review-card-header">
                <span className="ui-shell-icon" aria-hidden="true">
                  info
                </span>
                <h2 className="ui-shell-review-card-title">Selected Object</h2>
              </header>

              <dl className="ui-shell-review-inspector-list">
                <div className="ui-shell-review-inspector-row">
                  <dt>ID</dt>
                  <dd>{selectedObject.id}</dd>
                </div>
                <div className="ui-shell-review-inspector-row">
                  <dt>Class</dt>
                  <dd>{selectedObject.classLabel}</dd>
                </div>
                <div className="ui-shell-review-inspector-row">
                  <dt>Confidence</dt>
                  <dd>{selectedObject.confidenceLabel}</dd>
                </div>
                <div className="ui-shell-review-inspector-row">
                  <dt>BBox [x1,y1,x2,y2]</dt>
                  <dd>{selectedObject.bboxLabel}</dd>
                </div>
              </dl>

              <div className="ui-shell-review-summary-card">
                <div className="ui-shell-review-summary-header">
                  <span>Track Summary</span>
                  <strong>
                    {review.rangeStart}–{review.rangeEnd}
                  </strong>
                </div>
                <div className="ui-shell-review-summary-grid">
                  <div>
                    <span>Frames</span>
                    <strong>{review.trackFrames}</strong>
                  </div>
                  <div>
                    <span>Corrected</span>
                    <strong>{review.trackCorrected}</strong>
                  </div>
                  <div>
                    <span>Propagated</span>
                    <strong>{review.trackPropagated}</strong>
                  </div>
                </div>
                <div className="ui-shell-review-summary-legend">
                  <span>manual keyframe</span>
                  <span>propagated span</span>
                  <span>missing frame</span>
                </div>
              </div>
            </section>

            <section className="ui-shell-review-card">
              <header className="ui-shell-review-card-header">
                <span className="ui-shell-icon" aria-hidden="true">
                  crop_din
                </span>
                <h2 className="ui-shell-review-card-title">Box Tools</h2>
              </header>
              <div className="ui-shell-review-button-grid">
                <button
                  className="ui-shell-review-solid-button ui-shell-review-solid-button--active"
                  type="button"
                >
                  Edit Box
                </button>
                <button className="ui-shell-review-solid-button" type="button">
                  Draw
                </button>
                <button
                  className="ui-shell-review-solid-button ui-shell-review-solid-button--danger ui-shell-review-button-span"
                  type="button"
                >
                  Delete Box
                </button>
              </div>
            </section>

            <section className="ui-shell-review-card">
              <header className="ui-shell-review-card-header">
                <span className="ui-shell-icon" aria-hidden="true">
                  polyline
                </span>
                <h2 className="ui-shell-review-card-title">Mask Tools</h2>
              </header>
              <div className="ui-shell-review-button-stack">
                <button className="ui-shell-review-solid-button" type="button">
                  Toggle Visibility
                </button>
                <button className="ui-shell-review-solid-button" type="button">
                  Correct Mask
                </button>
                <button
                  className="ui-shell-review-solid-button ui-shell-review-solid-button--danger"
                  type="button"
                >
                  Delete Mask
                </button>
              </div>
            </section>

            <section className="ui-shell-review-card">
              <header className="ui-shell-review-card-header">
                <span className="ui-shell-icon" aria-hidden="true">
                  auto_awesome
                </span>
                <h2 className="ui-shell-review-card-title">SAM2 Automation</h2>
              </header>
              <div className="ui-shell-review-button-stack">
                <button className="ui-shell-review-solid-button" type="button">
                  Generate Mask
                </button>
                <div className="ui-shell-review-range-card">
                  <div className="ui-shell-review-range-header">
                    <span>Tracking range</span>
                  </div>
                  <div className="ui-shell-review-range-values">
                    <span>{review.rangeStart}</span>
                    <span className="ui-shell-icon" aria-hidden="true">
                      arrow_forward
                    </span>
                    <span>{review.rangeEnd}</span>
                  </div>
                  <div className="ui-shell-review-button-grid">
                    <button
                      className="ui-shell-review-solid-button"
                      type="button"
                    >
                      Preview Range
                    </button>
                    <button
                      className="ui-shell-review-solid-button"
                      type="button"
                    >
                      Reset Range
                    </button>
                  </div>
                  <button
                    className="ui-shell-review-solid-button ui-shell-review-solid-button--primary"
                    type="button"
                  >
                    Propagate
                  </button>
                </div>
              </div>
            </section>

            <section className="ui-shell-review-card ui-shell-review-card--footer">
              <div className="ui-shell-review-button-grid">
                <button className="ui-shell-review-solid-button" type="button">
                  Export JSON
                </button>
                <button className="ui-shell-review-solid-button" type="button">
                  Export PNGs
                </button>
              </div>
              <p className="ui-shell-review-footer-copy">
                Export uses backend-decoded frames as source of truth. Output:
                annotations.json + masks/*.png
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
