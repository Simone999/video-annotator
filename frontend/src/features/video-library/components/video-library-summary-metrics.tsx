import type {
  VideoLibrarySummaryMetric,
  VideoLibrarySummaryMetricTone,
} from "../types";

function getMetricToneClassName(tone: VideoLibrarySummaryMetricTone): string {
  switch (tone) {
    case "primary":
      return "text-blue-300";
    case "secondary":
      return "text-orange-200";
    case "tertiary":
      return "text-cyan-300";
    case "default":
      return "text-slate-100";
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
      className="flex flex-wrap gap-px border-y border-white/10 bg-white/10"
      role="list"
    >
      {summaryMetrics.map((metric) => (
        <li
          key={metric.label}
          className="min-w-[180px] flex-1 bg-slate-900 px-4 py-4"
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
