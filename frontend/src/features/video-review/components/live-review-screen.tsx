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
    <div className="h-screen overflow-hidden bg-[#131313] text-slate-100">
      <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#131313] px-6 text-xs font-bold uppercase tracking-[0.18em]">
        <div className="flex min-w-0 items-center gap-8">
          <span className="text-lg font-black uppercase tracking-[0.24em] text-slate-50">
            Video Annotation
          </span>
          <div className="flex items-center gap-3 font-medium normal-case text-[11px] tracking-normal text-slate-300">
            <button
              aria-label="Save Session"
              className="border border-white/15 px-3 py-2 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200"
              type="button"
            >
              Save Session
            </button>
            <button
              aria-label="Export"
              className="border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-200 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
              disabled
              type="button"
            >
              Export
            </button>
          </div>
        </div>
        <div className="hidden items-center gap-6 font-mono text-[11px] normal-case tracking-normal text-slate-400 xl:flex">
          <span>
            Video:{" "}
            <span className="text-slate-100">
              {controller.selectedVideo?.display_name ?? "Unselected"}
            </span>
          </span>
          <span>
            Frames:{" "}
            <span className="text-slate-100">
              {controller.selectedVideo?.frame_count ?? "—"}
            </span>
          </span>
          <span>
            Current:{" "}
            <span className="font-bold text-cyan-300">
              {controller.selectedVideo === null
                ? "—"
                : String(controller.currentFrameIndex)}
            </span>
          </span>
          <span>
            FPS:{" "}
            <span className="text-slate-100">
              {controller.selectedVideo === null
                ? "—"
                : formatFramesPerSecond(controller.selectedVideo.fps)}
            </span>
          </span>
        </div>
      </nav>

      <div className="flex h-full pt-14">
        <nav className="fixed bottom-0 left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] w-16 flex-col overflow-hidden border-r border-white/5 bg-slate-900 text-xs font-medium uppercase tracking-tight text-slate-500 transition-all duration-200 hover:w-64 focus-within:w-64 lg:flex">
          <div className="flex w-64 flex-1 flex-col gap-1 py-4">
            <div className="w-full border-l-2 border-transparent px-4 py-3 text-left transition hover:bg-slate-800 hover:text-slate-100">
              Dashboard
            </div>
            <div className="w-full border-l-2 border-transparent px-4 py-3 text-left transition hover:bg-slate-800 hover:text-slate-100">
              Workspace
            </div>
            <div className="w-full border-l-2 border-blue-500 bg-blue-500/10 px-4 py-3 text-left font-bold text-blue-400 transition hover:bg-slate-800 hover:text-slate-100">
              Review
            </div>
            <div className="w-full border-l-2 border-transparent px-4 py-3 text-left transition hover:bg-slate-800 hover:text-slate-100">
              Export
            </div>
          </div>
          <div className="mt-auto w-64 border-t border-white/5 py-4">
            <div className="w-full px-4 py-3 text-left transition hover:bg-slate-800 hover:text-slate-100">
              System Status
            </div>
          </div>
        </nav>

        <div className="flex min-w-0 flex-1 lg:ml-16">
          <ReviewVideoListPanel
            controller={controller}
            onBackToLibrary={onBackToLibrary}
            routeMode={initialVideoId !== null}
            workspace={workspace}
          />
          <ReviewSurfacePanel controller={controller} workspace={workspace} />
          <ReviewInspectorPanel controller={controller} workspace={workspace} />
        </div>
      </div>
    </div>
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

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
