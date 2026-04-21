import { uiShellFixtureData } from "./fixtures";
import type { UiShellData, UiShellVideo } from "./types";

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
    videos: uiShellFixtureData.videos.map(cloneVideo),
  });
}
