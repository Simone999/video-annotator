import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";

export function ReviewVideoListPanel({
  controller,
  onBackToLibrary,
  workspace,
}: {
  controller: LiveReviewController;
  onBackToLibrary?: () => void;
  workspace: VideoReviewWorkspace;
}) {
  return (
    <aside className="side-panel side-panel--left" aria-label="Video list">
      <p className="panel-kicker">Indexed videos</p>
      {onBackToLibrary ? (
        <button
          className="exact-frame-button"
          type="button"
          onClick={onBackToLibrary}
        >
          Back to Library
        </button>
      ) : null}
      <h2 id="workspace-title" className="panel-title">
        {controller.selectedVideo?.display_name ?? "Choose review target"}
      </h2>
      <p className="panel-copy">
        Canonical exact-frame index: {workspace.reviewState.currentFrameIndex}
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
      <section className="object-panel" aria-label="Review objects">
        <p className="panel-kicker">Review objects</p>
        {controller.selectedVideo === null ? (
          <p className="panel-copy">
            Select video before choosing persisted objects.
          </p>
        ) : (
          <>
            <div className="object-create-form">
              <label className="exact-frame-field">
                <span className="exact-frame-field-label">
                  New object label
                </span>
                <input
                  aria-label="New object label"
                  className="exact-frame-input"
                  type="text"
                  value={controller.newObjectLabel}
                  onChange={(event) => {
                    controller.setNewObjectLabel(event.target.value);
                  }}
                />
              </label>
              <button
                className="exact-frame-button"
                disabled={controller.newObjectLabel.trim().length === 0}
                type="button"
                onClick={() => {
                  void controller.handleCreateObject();
                }}
              >
                Create object
              </button>
            </div>
            {controller.objectPanelError !== null ? (
              <p className="panel-copy">{controller.objectPanelError}</p>
            ) : null}
            <div className="object-list" role="list">
              {controller.objectSummaries.map((objectSummary) => (
                <button
                  key={objectSummary.id}
                  aria-pressed={
                    controller.selectedObjectId === objectSummary.id
                  }
                  className="object-list-button"
                  type="button"
                  onClick={() => {
                    workspace.setSam2SelectedObject(objectSummary.id);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="object-color-chip"
                    style={{ backgroundColor: objectSummary.color }}
                  />
                  <span className="object-list-copy">
                    <span className="object-list-label">
                      {objectSummary.label}
                    </span>
                    <span className="object-list-meta">{objectSummary.id}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </aside>
  );
}
