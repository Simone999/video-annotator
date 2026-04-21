export type VideoLibrarySummaryMetricTone =
  | "default"
  | "primary"
  | "secondary"
  | "tertiary";

export type VideoLibrarySummaryMetric = {
  label: string;
  tone: VideoLibrarySummaryMetricTone;
  value: string;
};

export type VideoLibraryVideoState =
  | "not_started"
  | "started"
  | "in_progress"
  | "ready"
  | "exported";

export type VideoLibraryVideo = {
  contextLine: string;
  detailLine: string;
  displayName: string;
  fps: number;
  frameCount: number;
  id: string;
  lastReviewedLabel: string;
  previewAlt: string;
  previewImageUrl: string;
  propagationProgressPercent: number | null;
  resolution: {
    width: number;
    height: number;
  };
  state: VideoLibraryVideoState;
};

export type VideoLibraryData = {
  summaryMetrics: VideoLibrarySummaryMetric[];
  videos: VideoLibraryVideo[];
};
