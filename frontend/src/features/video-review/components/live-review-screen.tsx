import "../../../app/app.css";

import { ReviewInspectorPanel } from "./review-inspector-panel";
import { ReviewRouteStatusPanel } from "./review-route-status-panel";
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
  const routeShell = resolveRouteShell({
    errorMessage: workspace.errorMessage,
    indexedVideos: workspace.indexedVideos,
    initialVideoId,
    listStatus: workspace.listStatus,
    selectedVideo: controller.selectedVideo,
    selectionStatus: workspace.selectionStatus,
  });

  if (routeShell !== null) {
    return (
      <ReviewRouteStatusPanel
        copy={routeShell.copy}
        onBackToLibrary={onBackToLibrary}
        routeVideoId={initialVideoId}
        title={routeShell.title}
        tone={routeShell.tone}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 pb-8 pt-5 lg:px-6 xl:px-8">
        <section
          aria-labelledby="workspace-title"
          className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]"
        >
          <ReviewVideoListPanel
            controller={controller}
            onBackToLibrary={onBackToLibrary}
            routeMode={initialVideoId !== null}
            workspace={workspace}
          />
          <ReviewSurfacePanel controller={controller} workspace={workspace} />
          <ReviewInspectorPanel controller={controller} workspace={workspace} />
        </section>
      </div>
    </main>
  );
}

function resolveRouteShell(options: {
  errorMessage: string | null;
  indexedVideos: readonly {
    id: string;
    display_name: string;
  }[];
  initialVideoId: string | null;
  listStatus: "empty" | "error" | "loading" | "ready";
  selectedVideo: {
    id: string;
  } | null;
  selectionStatus: "error" | "idle" | "loading" | "ready";
}): {
  copy: string;
  title: string;
  tone: "error" | "loading";
} | null {
  if (options.initialVideoId === null) {
    return null;
  }

  if (options.listStatus === "loading") {
    return {
      copy: "Direct route owns video selection from URL. Preparing review workspace before live controls mount.",
      title: "Opening review workspace",
      tone: "loading",
    };
  }

  if (options.listStatus === "error") {
    return {
      copy:
        options.errorMessage ??
        "Unable to load indexed videos for review route.",
      title: "Review unavailable",
      tone: "error",
    };
  }

  if (options.listStatus === "empty") {
    return {
      copy: "No indexed videos found yet, so direct review route cannot open a workspace.",
      title: "Review unavailable",
      tone: "error",
    };
  }

  const routeVideo =
    options.indexedVideos.find(
      (video) => video.id === options.initialVideoId,
    ) ?? null;
  if (routeVideo === null) {
    return {
      copy: "Requested review route is not indexed in local library.",
      title: "Review unavailable",
      tone: "error",
    };
  }

  if (
    options.selectionStatus === "idle" ||
    options.selectionStatus === "loading"
  ) {
    return {
      copy: `Preparing live review workspace for ${routeVideo.display_name}.`,
      title: "Opening review workspace",
      tone: "loading",
    };
  }

  if (options.selectionStatus === "error" || options.selectedVideo === null) {
    return {
      copy: options.errorMessage ?? "Video review request failed.",
      title: "Review unavailable",
      tone: "error",
    };
  }

  return null;
}
