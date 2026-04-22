import type {
  VideoLibrarySummaryMetric,
  VideoLibrarySummaryMetricTone,
} from "../types";

function getMetricToneClassName(tone: VideoLibrarySummaryMetricTone): string {
  switch (tone) {
    case "primary":
      return "text-primary-container";
    case "secondary":
      return "text-tertiary-fixed-dim";
    case "tertiary":
      return "text-primary-fixed";
    case "default":
      return "text-on-surface";
  }
}

export function VideoLibrarySummaryMetrics({
  summaryMetrics,
}: {
  summaryMetrics: VideoLibrarySummaryMetric[];
}) {
  return (
    <ul
      aria-label="Library summary"
      className="metric-strip flex flex-wrap gap-px"
      role="list"
    >
      {summaryMetrics.map((metric) => (
        <li
          key={metric.label}
          className="metric-tile min-w-[180px] flex-1 px-4 py-4"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {metric.label}
          </span>
          <strong
            className={`mt-3 block text-3xl font-semibold ${getMetricToneClassName(metric.tone)}`}
          >
            {metric.value}
          </strong>
        </li>
      ))}
    </ul>
  );
}
