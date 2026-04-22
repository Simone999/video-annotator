import type { VideoLibraryVideo, VideoLibraryVideoState } from "../types";
import { VideoLibraryIcon } from "./video-library-icon";

function formatResolution(video: VideoLibraryVideo): string {
  return `${String(video.resolution.width)}x${String(video.resolution.height)}`;
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

function getStateAccentClassName(state: VideoLibraryVideoState): string {
  switch (state) {
    case "not_started":
      return "bg-slate-500";
    case "started":
      return "bg-blue-400";
    case "in_progress":
      return "bg-orange-300";
    case "ready":
      return "bg-cyan-300";
    case "exported":
      return "bg-slate-300";
  }
}

function getStateBadgeClassName(state: VideoLibraryVideoState): string {
  switch (state) {
    case "not_started":
      return "border-white/10 bg-slate-950/80 text-slate-300";
    case "started":
      return "border-blue-400/20 bg-slate-950/80 text-blue-200";
    case "in_progress":
      return "border-orange-200/20 bg-slate-950/80 text-orange-200";
    case "ready":
      return "border-cyan-300/20 bg-slate-950/80 text-cyan-200";
    case "exported":
      return "border-white/10 bg-slate-950/80 text-slate-200";
  }
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
  const stateBadgeClassName = getStateBadgeClassName(video.state);
  const stateAccentClassName = getStateAccentClassName(video.state);

  return (
    <article
      aria-label={video.displayName}
      className={`video-card-shell relative overflow-hidden border transition ${
        isSelected
          ? "border-blue-400/40"
          : "border-white/10 hover:border-blue-300/30"
      }`}
      data-selected={isSelected}
      data-state={video.state}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 ${stateAccentClassName}`}
      />
      <div className="relative">
        <img
          alt={video.previewAlt}
          className="aspect-video w-full object-cover opacity-70"
          src={video.previewImageUrl}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <span
          className={`video-card-badge absolute right-3 top-3 inline-flex items-center gap-2 border px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${stateBadgeClassName}`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 ${stateAccentClassName}`}
          />
          {formatStateLabel(video.state)}
        </span>
      </div>
      <div className="flex flex-col gap-4 p-4 pl-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-50">
              {video.displayName}
            </h2>
            <p className="mt-1 truncate text-xs text-slate-400">
              {video.contextLine}
            </p>
          </div>
          <button
            aria-label={`More actions for ${video.displayName}`}
            className="ghost-button inline-flex h-8 w-8 items-center justify-center text-slate-400"
            type="button"
            onClick={() => {
              onSelectVideo(video.id);
            }}
          >
            <VideoLibraryIcon className="h-4 w-4" name="moreHorizontal" />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex flex-col">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Frames
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-100">
              {formatNumber(video.frameCount)}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              FPS
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-100">
              {video.fps}
            </dd>
          </div>
          <div className="mt-2 flex flex-col">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Resolution
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-100">
              {formatResolution(video)}
            </dd>
          </div>
          <div className="mt-2 flex flex-col">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Last reviewed
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-100">
              {video.lastReviewedLabel}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          {video.state === "in_progress" &&
          video.propagationProgressPercent !== null ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{video.detailLine}</span>
                <span className="text-orange-100">
                  Propagation completion:{" "}
                  {String(video.propagationProgressPercent)}%
                </span>
              </div>
              <div
                aria-label={`Propagation completion ${video.displayName} ${String(video.propagationProgressPercent)} percent`}
                className="h-1 overflow-hidden bg-white/10"
              >
                <div
                  className="h-full bg-orange-300"
                  style={{
                    width: `${String(video.propagationProgressPercent)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{video.detailLine}</span>
              <span className="hidden">Progress hidden until in_progress</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            aria-label={`Open Review ${video.displayName}`}
            className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-primary-fixed transition hover:text-primary"
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
}
