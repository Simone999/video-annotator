import { uiShellFixtureData } from "./fixtures";
import type { UiShellData, UiShellSummaryMetric, UiShellVideo } from "./types";

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
    resolution: {
      ...video.resolution,
    },
  };
}

export function loadUiShellData(): Promise<UiShellData> {
  return Promise.resolve({
    summaryMetrics: uiShellFixtureData.summaryMetrics.map(cloneSummaryMetric),
    videos: uiShellFixtureData.videos.map(cloneVideo),
  });
}
