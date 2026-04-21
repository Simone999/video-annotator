import type {
  VideoLibrarySummaryMetric,
  VideoLibrarySummaryMetricTone,
} from "../types";

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

export function VideoLibrarySummaryMetrics({
  summaryMetrics,
}: {
  summaryMetrics: VideoLibrarySummaryMetric[];
}) {
  return (
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
  );
}
