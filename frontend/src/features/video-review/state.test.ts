import { describe, expect, it } from "vitest";

import {
  initialVideoReviewState,
  videoReviewStateReducer,
  type ObjectTrackSummary,
  type SavedManualAnnotation,
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

const sampleObject: ObjectTrackSummary = {
  id: "object-123",
  label: "left hand",
  color: "#00ffaa",
  status: "active",
};

const sampleManualAnnotation: SavedManualAnnotation = {
  video_id: "video-123",
  frame_idx: 7,
  object_id: "object-123",
  is_keyframe: true,
  source: "manual",
  box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
  mask: {
    path: null,
  },
};

describe("video review state", () => {
  it("resets the canonical frame index when a new video is selected", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      objectSummaries: [sampleObject],
      savedManualAnnotationsByFrame: {
        7: {
          "object-123": sampleManualAnnotation,
        },
      },
      selectedObjectId: "object-123",
      selectedVideo: null,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "video-selected",
      video: sampleVideo,
    });

    expect(nextState).toEqual({
      currentFrameIndex: 0,
      objectSummaries: [],
      savedManualAnnotationsByFrame: {},
      selectedObjectId: null,
      selectedVideo: sampleVideo,
    });
  });

  it("stores object summary from manifest state separately from canonical frame state", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      objectSummaries: [],
      savedManualAnnotationsByFrame: {},
      selectedObjectId: null,
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "manifest-loaded",
      objects: [sampleObject],
    });

    expect(nextState).toEqual({
      ...state,
      objectSummaries: [sampleObject],
    });
  });

  it("tracks selected object separately from canonical frame state", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      objectSummaries: [sampleObject],
      savedManualAnnotationsByFrame: {},
      selectedObjectId: null,
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "object-selected",
      objectId: "object-123",
    });

    expect(nextState).toEqual({
      ...state,
      selectedObjectId: "object-123",
    });
  });

  it("stores saved manual annotations by frame without mutating canonical frame state", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      objectSummaries: [sampleObject],
      savedManualAnnotationsByFrame: {},
      selectedObjectId: "object-123",
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "manual-annotation-upserted",
      annotation: sampleManualAnnotation,
    });

    expect(nextState).toEqual({
      ...state,
      savedManualAnnotationsByFrame: {
        7: {
          "object-123": sampleManualAnnotation,
        },
      },
    });
  });

  it("removes one saved manual annotation without mutating canonical frame state", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      objectSummaries: [sampleObject],
      savedManualAnnotationsByFrame: {
        7: {
          "object-123": sampleManualAnnotation,
        },
      },
      selectedObjectId: "object-123",
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "manual-annotation-deleted",
      frameIdx: 7,
      objectId: "object-123",
    });

    expect(nextState).toEqual({
      ...state,
      savedManualAnnotationsByFrame: {},
    });
  });

  it("clears selection state back to the feature defaults", () => {
    const state: VideoReviewState = {
      currentFrameIndex: 17,
      objectSummaries: [sampleObject],
      savedManualAnnotationsByFrame: {
        7: {
          "object-123": sampleManualAnnotation,
        },
      },
      selectedObjectId: "object-123",
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "selection-cleared",
    });

    expect(nextState).toEqual(initialVideoReviewState);
  });
});
