import { describe, expect, it } from "vitest";

import {
  initialVideoReviewState,
  videoReviewStateReducer,
  type AnnotationBoxDraft,
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

const sampleManifest = {
  video: sampleVideo,
  objects: [
    {
      id: 9,
      label: "left hand",
      color: null,
      status: "active",
    },
  ],
  annotated_frame_indices: [4],
  keyframe_indices: [4],
};

const sampleDraft: AnnotationBoxDraft = {
  box_xywh_norm: [0.2, 0.3, 0.1, 0.15],
  frameIdx: 4,
  objectId: 9,
};

describe("video review state", () => {
  it("stores manifest data and resets canonical frame index on video selection", () => {
    const state: VideoReviewState = {
      annotatedFrameIndices: [],
      currentFrameIndex: 17,
      draftAnnotationBox: sampleDraft,
      frameAnnotationsByFrame: {
        4: [
          {
            box_xywh_norm: [0.2, 0.3, 0.1, 0.15],
            is_keyframe: true,
            object_id: 9,
            source: "manual",
          },
        ],
      },
      keyframeIndices: [],
      objects: [],
      selectedObjectId: 9,
      selectedVideo: null,
    };

    const nextState = videoReviewStateReducer(state, {
      manifest: sampleManifest,
      type: "manifest-loaded",
    });

    expect(nextState).toEqual({
      annotatedFrameIndices: [4],
      currentFrameIndex: 0,
      draftAnnotationBox: null,
      frameAnnotationsByFrame: {},
      keyframeIndices: [4],
      objects: sampleManifest.objects,
      selectedObjectId: null,
      selectedVideo: sampleVideo,
    });
  });

  it("keeps selected object and draft box state separate from canonical frame index", () => {
    const state = videoReviewStateReducer(initialVideoReviewState, {
      manifest: sampleManifest,
      type: "manifest-loaded",
    });

    const withObjectSelection = videoReviewStateReducer(state, {
      objectId: 9,
      type: "selected-object-set",
    });
    const withDraft = videoReviewStateReducer(withObjectSelection, {
      draft: sampleDraft,
      type: "draft-annotation-box-set",
    });

    expect(withDraft.currentFrameIndex).toBe(0);
    expect(withDraft.selectedObjectId).toBe(9);
    expect(withDraft.draftAnnotationBox).toEqual(sampleDraft);
  });

  it("tracks loaded frame annotations by canonical frame index", () => {
    const state = videoReviewStateReducer(initialVideoReviewState, {
      manifest: sampleManifest,
      type: "manifest-loaded",
    });

    const nextState = videoReviewStateReducer(state, {
      annotations: [
        {
          box_xywh_norm: [0.2, 0.3, 0.1, 0.15],
          is_keyframe: true,
          object_id: 9,
          source: "manual",
        },
      ],
      frameIdx: 7,
      type: "frame-annotations-received",
    });

    expect(nextState.frameAnnotationsByFrame).toEqual({
      7: [
        {
          box_xywh_norm: [0.2, 0.3, 0.1, 0.15],
          is_keyframe: true,
          object_id: 9,
          source: "manual",
        },
      ],
    });
    expect(nextState.annotatedFrameIndices).toEqual([4, 7]);
    expect(nextState.keyframeIndices).toEqual([4, 7]);
  });

  it("clears draft box when canonical frame changes", () => {
    const state: VideoReviewState = {
      annotatedFrameIndices: [4],
      currentFrameIndex: 4,
      draftAnnotationBox: sampleDraft,
      frameAnnotationsByFrame: {},
      keyframeIndices: [4],
      objects: sampleManifest.objects,
      selectedObjectId: 9,
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      frameIdx: 7,
      type: "frame-index-set",
    });

    expect(nextState.currentFrameIndex).toBe(7);
    expect(nextState.draftAnnotationBox).toBeNull();
  });

  it("clears stale draft box when selected object changes", () => {
    const state: VideoReviewState = {
      annotatedFrameIndices: [4],
      currentFrameIndex: 4,
      draftAnnotationBox: sampleDraft,
      frameAnnotationsByFrame: {},
      keyframeIndices: [4],
      objects: [
        ...sampleManifest.objects,
        {
          color: null,
          id: 11,
          label: "right hand",
          status: "active",
        },
      ],
      selectedObjectId: 9,
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      objectId: 11,
      type: "selected-object-set",
    });

    expect(nextState.selectedObjectId).toBe(11);
    expect(nextState.draftAnnotationBox).toBeNull();
  });

  it("clears selection state back to the feature defaults", () => {
    const state: VideoReviewState = {
      annotatedFrameIndices: [4],
      currentFrameIndex: 17,
      draftAnnotationBox: sampleDraft,
      frameAnnotationsByFrame: {},
      keyframeIndices: [4],
      objects: sampleManifest.objects,
      selectedObjectId: 9,
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      type: "selection-cleared",
    });

    expect(nextState).toEqual(initialVideoReviewState);
  });
});
