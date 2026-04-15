import { describe, expect, it } from "vitest";

import {
  initialSam2WorkspaceState,
  initialVideoReviewState,
  videoReviewStateReducer,
  type VideoReviewState,
} from "./state";

const sampleVideo = {
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  display_name: "sample.mp4",
  frame_count: 42,
  fps: 24,
  width: 1920,
  height: 1080,
  duration_seconds: 1.75,
} as const;

describe("video review state", () => {
  it("resets the canonical frame index when a new video is selected", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      selectedVideo: null,
      sam2: initialSam2WorkspaceState,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "video-selected",
      video: sampleVideo,
    });

    expect(nextState).toEqual({
      currentFrameIndex: 0,
      selectedVideo: sampleVideo,
      sam2: initialSam2WorkspaceState,
    });
  });

  it("clears selection state back to the feature defaults", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      selectedVideo: sampleVideo,
      sam2: initialSam2WorkspaceState,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "selection-cleared",
    });

    expect(nextState).toEqual(initialVideoReviewState);
  });
});
