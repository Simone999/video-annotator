import type { VideoLibraryVideo, VideoLibraryVideoState } from "../types";
import { VideoLibraryIcon } from "./video-library-icon";

function formatResolution(video: VideoLibraryVideo): string {
  return `${String(video.resolution.width)}×${String(video.resolution.height)}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatStateLabel(state: VideoLibraryVideoState): string {
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

function getPreviewClassName(state: VideoLibraryVideoState): string {
  if (state === "exported") {
    return "opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0";
  }

  return "opacity-60 group-hover:opacity-80";
}

export function VideoLibraryVideoCard({
  isSelected,
  onOpenReview,
  onSelectVideo,
  video,
}: {
  isSelected: boolean;
  onOpenReview: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  video: VideoLibraryVideo;
}) {
  return (
    <article
      aria-label={video.displayName}
      className="video-card-shell stateful-card group relative flex cursor-pointer flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-low transition-colors duration-150"
      data-selected={isSelected}
      data-state={video.state}
      onClick={() => {
        onOpenReview(video.id);
      }}
    >
      <div
        className="video-card-accent state-fill absolute left-0 top-0 h-full w-1"
        data-testid={`video-card-accent-${video.id}`}
      />
      <div className="relative h-40 w-full overflow-hidden bg-surface-container-highest">
        <img
          alt={video.previewAlt}
          className={`h-40 w-full object-cover transition-all duration-200 ${getPreviewClassName(video.state)}`}
          src={video.previewImageUrl}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
        <span
          className="video-card-badge state-border absolute right-2 top-2 inline-flex items-center gap-1 border bg-surface/80 px-2 py-1 text-xs font-bold tabular-nums text-on-surface backdrop-blur-md"
          data-testid={`video-card-badge-${video.id}`}
        >
          <span
            aria-hidden="true"
            className="video-card-accent state-fill h-2 w-2"
          />
          {formatStateLabel(video.state)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-base leading-tight font-bold text-on-surface">
              {video.displayName}
            </h2>
            <p className="mt-1 truncate text-xs text-on-surface-variant">
              {video.contextLine}
            </p>
          </div>
          <button
            aria-label={`More actions for ${video.displayName}`}
            className="inline-flex h-8 w-8 items-center justify-center text-on-surface-variant transition-colors duration-150 hover:bg-surface-bright hover:text-primary"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelectVideo(video.id);
            }}
          >
            <VideoLibraryIcon className="text-lg" name="moreHorizontal" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-label">
          <div className="flex flex-col">
            <span className="text-on-surface-variant">Frames</span>
            <span className="text-on-surface mt-1 font-medium tabular-nums">
              {formatNumber(video.frameCount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-on-surface-variant">FPS</span>
            <span className="text-on-surface mt-1 font-medium tabular-nums">
              {video.fps}
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-on-surface-variant">Resolution</span>
            <span className="text-on-surface mt-1 font-medium">
              {formatResolution(video)}
            </span>
          </div>
          <div className="mt-2 flex flex-col">
            <span className="text-on-surface-variant">Last reviewed</span>
            <span className="text-on-surface mt-1 font-medium tabular-nums">
              {video.lastReviewedLabel}
            </span>
          </div>
        </div>

        {video.state === "in_progress" &&
        video.propagationProgressPercent !== null ? (
          <>
            <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
              <span>{video.detailLine}</span>
              <span>
                Propagation completion:{" "}
                {String(video.propagationProgressPercent)}%
              </span>
            </div>
            <div
              aria-label={`Propagation completion ${video.displayName} ${String(video.propagationProgressPercent)} percent`}
              className="mt-1 h-1 w-full bg-surface-container-highest"
            >
              <div
                className="video-card-progress-fill state-fill h-full"
                style={{
                  width: `${String(video.propagationProgressPercent)}%`,
                }}
              />
            </div>
          </>
        ) : (
          <div className="mt-1 flex items-center justify-between text-xs text-on-surface-variant">
            <span>{video.detailLine}</span>
            <span className="hidden">Progress hidden until in_progress</span>
          </div>
        )}
      </div>
    </article>
  );
}
