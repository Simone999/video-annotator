import type { VideoLibrarySummaryMetric } from "../types";

export function VideoLibrarySummaryMetrics({
  summaryMetrics,
}: {
  summaryMetrics: VideoLibrarySummaryMetric[];
}) {
  return (
    <ul
      aria-label="Library summary"
      className="mb-6 flex w-full flex-wrap gap-px border-b border-t border-outline-variant/20 bg-outline-variant/20"
      role="list"
    >
      {summaryMetrics.map((metric) => (
        <li
          key={metric.label}
          className={`${metric.state === null ? "" : "state-context"} flex min-w-[200px] flex-1 flex-col justify-center bg-surface-container-low p-4`}
          data-state={metric.state ?? undefined}
        >
          <span className="mb-1 font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {metric.label}
          </span>
          <strong
            className={`text-3xl font-bold tabular-nums ${metric.state === null ? "text-on-surface" : "state-color"}`}
          >
            {metric.value}
          </strong>
        </li>
      ))}
    </ul>
  );
}
