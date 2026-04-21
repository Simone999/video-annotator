export type UiShellPage = "library" | "review";

export type UiShellSummaryMetricTone =
  | "default"
  | "primary"
  | "secondary"
  | "tertiary";

export type UiShellSummaryMetric = {
  label: string;
  tone: UiShellSummaryMetricTone;
  value: string;
};

export type UiShellVideoState =
  | "not_started"
  | "started"
  | "in_progress"
  | "ready"
  | "exported";

export type UiShellVideo = {
  contextLine: string;
  detailLine: string;
  id: string;
  displayName: string;
  fps: number;
  frameCount: number;
  lastReviewedLabel: string;
  previewAlt: string;
  previewImageUrl: string;
  propagationProgressPercent: number | null;
  resolution: {
    width: number;
    height: number;
  };
  state: UiShellVideoState;
};

export type UiShellData = {
  summaryMetrics: UiShellSummaryMetric[];
  videos: UiShellVideo[];
};
