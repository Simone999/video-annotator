import type { UiShellVideo } from "./types";

export function UiShellReviewPage({ video }: { video: UiShellVideo | null }) {
  return (
    <div className="app-shell ui-shell">
      <section className="ui-shell-panel">
        <p className="ui-shell-kicker">Mockup UI shell foundation</p>
        <h1 className="ui-shell-title">Review Shell</h1>
        <p className="ui-shell-copy">
          Local page state is ready. Detailed annotation mockup lands in
          follow-up stories.
        </p>
        {video === null ? null : (
          <p className="ui-shell-copy">
            Selected fixture: <strong>{video.displayName}</strong>
          </p>
        )}
      </section>
    </div>
  );
}
