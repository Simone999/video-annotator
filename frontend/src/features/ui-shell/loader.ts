import { uiShellFixtureData } from "./fixtures";
import type {
  UiShellData,
  UiShellReviewObject,
  UiShellReviewThumbnail,
  UiShellSummaryMetric,
  UiShellVideo,
} from "./types";

function cloneSummaryMetric(
  metric: UiShellSummaryMetric,
): UiShellSummaryMetric {
  return {
    ...metric,
  };
}

function cloneVideo(video: UiShellVideo): UiShellVideo {
  return {
    ...video,
    review: {
      ...video.review,
      manualMarkerPercents: [...video.review.manualMarkerPercents],
      objects: video.review.objects.map(cloneReviewObject),
      thumbnails: video.review.thumbnails.map(cloneReviewThumbnail),
    },
    resolution: {
      ...video.resolution,
    },
  };
}

function cloneReviewObject(object: UiShellReviewObject): UiShellReviewObject {
  return {
    ...object,
    stageOverlay:
      object.stageOverlay === null ? null : { ...object.stageOverlay },
  };
}

function cloneReviewThumbnail(
  thumbnail: UiShellReviewThumbnail,
): UiShellReviewThumbnail {
  return {
    ...thumbnail,
  };
}

export function loadUiShellData(): Promise<UiShellData> {
  return Promise.resolve({
    summaryMetrics: uiShellFixtureData.summaryMetrics.map(cloneSummaryMetric),
    videos: uiShellFixtureData.videos.map(cloneVideo),
  });
}
