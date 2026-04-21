import type {
  VideoLibrarySummaryMetric,
  VideoLibrarySummaryMetricTone,
  VideoLibraryVideo,
  VideoLibraryVideoState,
} from "../types";

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

function getMetricToneClassName(tone: VideoLibrarySummaryMetricTone): string {
  switch (tone) {
    case "primary":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
    case "secondary":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
    case "tertiary":
      return "border-amber-400/30 bg-amber-400/10 text-amber-100";
    case "default":
      return "border-white/10 bg-white/5 text-slate-100";
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

export function VideoLibraryScreen({
  onOpenReview,
  onSelectVideo,
  selectedVideoId,
  summaryMetrics,
  videos,
}: {
  onOpenReview: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string | null;
  summaryMetrics: VideoLibrarySummaryMetric[];
  videos: VideoLibraryVideo[];
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 xl:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <span className="text-lg font-semibold tracking-[0.18em] text-slate-50 uppercase">
              Video Annotation
            </span>
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <span className="text-slate-500" aria-hidden="true">
                /
              </span>
              <input
                className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Search videos..."
                type="text"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Settings"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              type="button"
            >
              Settings
            </button>
            <button
              aria-label="Help"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              type="button"
            >
              Help
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-10 pt-6 lg:px-6 xl:px-8">
        <nav
          aria-label="Primary"
          className="hidden w-52 shrink-0 flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 p-4 lg:flex"
        >
          <button
            className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-slate-50"
            type="button"
          >
            Dashboard
          </button>
          <button
            className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
            type="button"
          >
            Videos
          </button>
          <button
            className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
            type="button"
          >
            Review
          </button>
          <button
            className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
            type="button"
          >
            Exported
          </button>
          <div className="flex-1" />
          <button
            className="rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-slate-50"
            type="button"
          >
            Local Status
          </button>
        </nav>

        <main className="flex-1">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-7 shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-semibold text-slate-50">
                  Video Library
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  Browse local videos, choose work, and open a video for
                  annotation review.
                </p>
              </div>

              <ul
                aria-label="Library summary"
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
                role="list"
              >
                {summaryMetrics.map((metric) => (
                  <li
                    key={metric.label}
                    className={`rounded-[1.5rem] border px-4 py-4 ${getMetricToneClassName(metric.tone)}`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-inherit/70">
                      {metric.label}
                    </span>
                    <strong className="mt-3 block text-3xl font-semibold text-inherit">
                      {metric.value}
                    </strong>
                  </li>
                ))}
              </ul>

              <section
                aria-label="Library filters"
                className="flex flex-col gap-3 xl:flex-row"
              >
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
                  <span className="text-slate-500" aria-hidden="true">
                    /
                  </span>
                  <input
                    className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                    placeholder="Search filename, folder, or tag"
                    type="text"
                  />
                </label>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
                  type="button"
                >
                  Status: All
                </button>
                <button
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
                  type="button"
                >
                  Sort: Recent
                </button>
              </section>

              <section
                aria-label="Library videos"
                className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
              >
                {videos.length === 0 ? (
                  <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/50 px-6 py-10">
                    <h2 className="text-xl font-semibold text-slate-50">
                      No indexed videos yet
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                      Add local videos to backend catalog, then reload shell.
                    </p>
                  </div>
                ) : null}

                {videos.map((video) => {
                  const isSelected = video.id === selectedVideoId;
                  const stateBadgeClassName = getStateBadgeClassName(
                    video.state,
                  );
                  const stateAccentClassName = getStateAccentClassName(
                    video.state,
                  );

                  return (
                    <article
                      key={video.id}
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
                            className={`h-2 w-2 rounded-full ${stateAccentClassName}`}
                            aria-hidden="true"
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
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                            type="button"
                            onClick={() => {
                              onSelectVideo(video.id);
                            }}
                          >
                            More
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
                          <p className="text-sm leading-6 text-slate-300">
                            {video.detailLine}
                          </p>
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
                })}
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
