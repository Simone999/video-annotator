import "../../../app/app.css";

import { ReviewInspectorPanel } from "./review-inspector-panel";
import { ReviewSurfacePanel } from "./review-surface-panel";
import { ReviewVideoListPanel } from "./review-video-list-panel";
import { useLiveReviewController } from "../hooks/use-live-review-controller";
import { useVideoReviewWorkspace } from "../workspace";

export function LiveReviewScreen({
  initialVideoId = null,
  onBackToLibrary,
}: {
  initialVideoId?: string | null;
  onBackToLibrary?: () => void;
}) {
  const workspace = useVideoReviewWorkspace();
  const controller = useLiveReviewController({
    initialVideoId,
    workspace,
  });

  return (
    <main className="app-shell">
      <section
        className="workspace-shell workspace-shell--single-stage"
        aria-labelledby="workspace-title"
      >
        <ReviewVideoListPanel
          controller={controller}
          onBackToLibrary={onBackToLibrary}
          workspace={workspace}
        />
        <ReviewSurfacePanel controller={controller} workspace={workspace} />
        <ReviewInspectorPanel controller={controller} workspace={workspace} />
      </section>
    </main>
  );
}
