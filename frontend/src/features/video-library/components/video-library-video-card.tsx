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
      return "bg-slate-400";
    case "started":
      return "bg-amber-400";
    case "in_progress":
      return "bg-cyan-300";
    case "ready":
      return "bg-emerald-400";
    case "exported":
      return "bg-slate-200";
  }
}

function getStateBadgeClassName(state: VideoLibraryVideoState): string {
  switch (state) {
    case "not_started":
      return "border-slate-400/30 bg-slate-400/15 text-slate-100";
    case "started":
      return "border-amber-400/30 bg-amber-400/15 text-amber-100";
    case "in_progress":
      return "border-cyan-300/30 bg-cyan-300/15 text-cyan-100";
    case "ready":
      return "border-emerald-400/30 bg-emerald-400/15 text-emerald-100";
    case "exported":
      return "border-slate-200/30 bg-slate-200/15 text-slate-50";
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
      className={`overflow-hidden rounded-[1.75rem] border bg-slate-900/70 shadow-[0_18px_48px_rgba(2,6,23,0.28)] transition ${
        isSelected
          ? "border-cyan-300/40 ring-1 ring-cyan-300/30"
          : "border-white/10"
      }`}
      data-selected={isSelected}
      data-state={video.state}
    >
      <div className={`h-1.5 w-full ${stateAccentClassName}`} />
      <div className="relative">
        <img
          alt={video.previewAlt}
          className="aspect-video w-full object-cover"
          src={video.previewImageUrl}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
        <span
          className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${stateBadgeClassName}`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${stateAccentClassName}`}
          />
          {formatStateLabel(video.state)}
        </span>
      </div>
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-slate-50">
              {video.displayName}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-400">
              {video.contextLine}
            </p>
          </div>
          <button
            aria-label={`More actions for ${video.displayName}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            type="button"
            onClick={() => {
              onSelectVideo(video.id);
            }}
          >
            <VideoLibraryIcon className="h-4 w-4" name="moreHorizontal" />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Frames
            </dt>
            <dd className="mt-2 text-base font-medium text-slate-100">
              {formatNumber(video.frameCount)}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              FPS
            </dt>
            <dd className="mt-2 text-base font-medium text-slate-100">
              {video.fps}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Resolution
            </dt>
            <dd className="mt-2 text-base font-medium text-slate-100">
              {formatResolution(video)}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Last reviewed
            </dt>
            <dd className="mt-2 text-base font-medium text-slate-100">
              {video.lastReviewedLabel}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-300">{video.detailLine}</p>
          {video.state === "in_progress" &&
          video.propagationProgressPercent !== null ? (
            <div className="space-y-2">
              <div className="text-sm text-cyan-100">
                Propagation completion:{" "}
                {String(video.propagationProgressPercent)}%
              </div>
              <div
                aria-label={`Propagation completion ${video.displayName} ${String(video.propagationProgressPercent)} percent`}
                className="h-2 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{
                    width: `${String(video.propagationProgressPercent)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <button
            aria-label={`Open Review ${video.displayName}`}
            className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
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
