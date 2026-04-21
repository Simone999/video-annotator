import type {
  VideoLibrarySummaryMetric,
  VideoLibraryVideo,
} from "../video-library";

export type UiShellPage = "library" | "review";

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

export type UiShellVideo = VideoLibraryVideo & {
  review: UiShellReviewData;
};

export type UiShellFixtureData = {
  source: "fixture";
  summaryMetrics: VideoLibrarySummaryMetric[];
  videos: UiShellVideo[];
};

export type UiShellLiveData = {
  source: "live";
  summaryMetrics: VideoLibrarySummaryMetric[];
  videos: VideoLibraryVideo[];
};

export type UiShellData = UiShellFixtureData | UiShellLiveData;
