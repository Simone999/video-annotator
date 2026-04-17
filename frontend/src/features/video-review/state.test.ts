import { describe, expect, it } from "vitest";

import type { ManualFrameAnnotation, ObjectSummary } from "./api";
import {
  initialAnnotationFoundationState,
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
      annotation: initialAnnotationFoundationState,
      currentFrameIndex: 17,
      selectedVideo: null,
      sam2: initialSam2WorkspaceState,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "video-selected",
      video: sampleVideo,
    });

    expect(nextState).toEqual({
      annotation: initialAnnotationFoundationState,
      currentFrameIndex: 0,
      selectedVideo: sampleVideo,
      sam2: initialSam2WorkspaceState,
    });
  });

  it("clears selection state back to the feature defaults", () => {
    const state: VideoReviewState = {
      annotation: initialAnnotationFoundationState,
      currentFrameIndex: 17,
      selectedVideo: sampleVideo,
      sam2: initialSam2WorkspaceState,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "selection-cleared",
    });

    expect(nextState).toEqual(initialVideoReviewState);
  });

  it("stores manifest object summaries separate from canonical frame state", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      currentFrameIndex: 17,
      selectedVideo: sampleVideo,
    };
    const objectSummaries: readonly ObjectSummary[] = [
      {
        color: "#00ffaa",
        id: "object-1",
        label: "left hand",
        status: "active",
      },
      {
        color: "#ffaa00",
        id: "object-2",
        label: "right hand",
        status: "active",
      },
    ];

    const nextState = videoReviewStateReducer(state, {
      annotatedFrameIndices: [17, 21],
      keyframeIndices: [17],
      objectSummaries,
      type: "manifest-loaded",
    });

    expect(nextState.currentFrameIndex).toBe(17);
    expect(nextState.annotation.objectSummaries).toEqual(objectSummaries);
    expect(nextState.annotation.selectedObjectId).toBe("object-1");
    expect(nextState.annotation.annotatedFrameIndices).toEqual([17, 21]);
    expect(nextState.annotation.keyframeIndices).toEqual([17]);
  });

  it("keys saved manual annotations by frame index then object id", () => {
    const manualAnnotation: ManualFrameAnnotation = {
      box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
      frame_idx: 17,
      is_keyframe: true,
      mask: {
        path: null,
      },
      object_id: "object-1",
      source: "manual",
      video_id: "video-123",
    };

    const storedState = videoReviewStateReducer(initialVideoReviewState, {
      annotation: manualAnnotation,
      type: "manual-annotation-upserted",
    });
    const nextState = videoReviewStateReducer(storedState, {
      frameIdx: 17,
      objectId: "object-1",
      type: "manual-annotation-deleted",
    });

    expect(
      storedState.annotation.savedManualAnnotationsByFrame[17]["object-1"],
    ).toEqual(manualAnnotation);
    expect(nextState.annotation.savedManualAnnotationsByFrame[17]).toEqual({});
  });

  it("hydrates saved manual annotations from frame reload payloads", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      annotation: {
        ...initialAnnotationFoundationState,
        keyframeIndices: [17],
      },
      currentFrameIndex: 0,
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      annotations: [
        {
          box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
          mask: null,
          object_id: "object-1",
          source: "manual",
        },
      ],
      frameIdx: 17,
      type: "frame-loaded",
    });

    expect(nextState.annotation.savedManualAnnotationsByFrame[17]).toEqual({
      "object-1": {
        box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
        frame_idx: 17,
        is_keyframe: true,
        mask: null,
        object_id: "object-1",
        source: "manual",
        video_id: "video-123",
      },
    });
  });

  it("removes deleted manual annotation from current-frame overlays", () => {
    const manualAnnotation: ManualFrameAnnotation = {
      box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
      frame_idx: 17,
      is_keyframe: true,
      mask: {
        path: null,
      },
      object_id: "object-1",
      source: "manual",
      video_id: "video-123",
    };

    const storedState = videoReviewStateReducer(
      {
        ...initialVideoReviewState,
        currentFrameIndex: 17,
      },
      {
        annotation: manualAnnotation,
        type: "manual-annotation-upserted",
      },
    );
    const nextState = videoReviewStateReducer(storedState, {
      frameIdx: 17,
      objectId: "object-1",
      type: "manual-annotation-deleted",
    });

    expect(storedState.sam2.frameAnnotations).toEqual([
      {
        box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
        mask: null,
        object_id: "object-1",
        source: "manual",
      },
    ]);
    expect(nextState.sam2.frameAnnotations).toEqual([]);
  });
});
