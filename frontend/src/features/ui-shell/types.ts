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

export type UiShellReviewObject = {
  bboxLabel: string;
  boxState: "present" | "missing";
  classLabel: string;
  confidenceLabel: string;
  id: string;
  maskState: "manual" | "present" | "missing";
  stageOverlay: {
    heightPercent: number;
    leftPercent: number;
    topPercent: number;
    widthPercent: number;
  } | null;
  visible: boolean;
};

export type UiShellReviewThumbnail = {
  badgeLabel: string | null;
  id: string;
  imageUrl: string | null;
  tone: "current" | "default" | "manual";
};

export type UiShellReviewData = {
  currentFrame: number;
  manualMarkerPercents: number[];
  missingMarkerPercent: number;
  objectCountLabel: string;
  objects: UiShellReviewObject[];
  rangeEnd: number;
  rangeStart: number;
  selectedObjectId: string;
  thumbnails: UiShellReviewThumbnail[];
  timelineCursorPercent: number;
  timelineRangeEndPercent: number;
  timelineRangeStartPercent: number;
  trackCorrected: number;
  trackFrames: number;
  trackPropagated: number;
};

export type UiShellLibraryVideo = {
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

export type UiShellVideo = UiShellLibraryVideo & {
  review: UiShellReviewData;
};

export type UiShellLiveVideo = UiShellLibraryVideo;

export type UiShellFixtureData = {
  source: "fixture";
  summaryMetrics: UiShellSummaryMetric[];
  videos: UiShellVideo[];
};

export type UiShellLiveData = {
  source: "live";
  summaryMetrics: UiShellSummaryMetric[];
  videos: UiShellLiveVideo[];
};

export type UiShellData = UiShellFixtureData | UiShellLiveData;
