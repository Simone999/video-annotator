import { describe, expect, it } from "vitest";

import type {
  ManualFrameAnnotation,
  ObjectSummary,
} from "../../../src/features/video-review/api";
import {
  initialAnnotationFoundationState,
  initialSam2WorkspaceState,
  initialVideoReviewState,
  videoReviewStateReducer,
  type VideoReviewState,
} from "../../../src/features/video-review/state";

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

  it("refreshes selected video without resetting canonical frame index", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      currentFrameIndex: 17,
      selectedVideo: {
        ...sampleVideo,
        review_state: "ready",
      },
    };

    const nextState = videoReviewStateReducer(state, {
      type: "video-refreshed",
      video: {
        ...sampleVideo,
        review_state: "exported",
      },
    });

    expect(nextState.currentFrameIndex).toBe(17);
    expect(nextState.selectedVideo).toEqual({
      ...sampleVideo,
      review_state: "exported",
    });
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

  it("keeps selected object when manifest still contains it", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      annotation: {
        ...initialAnnotationFoundationState,
        selectedObjectId: "object-2",
      },
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      annotatedFrameIndices: [17],
      keyframeIndices: [17],
      objectSummaries: [
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
      ],
      type: "manifest-loaded",
    });

    expect(nextState.annotation.selectedObjectId).toBe("object-2");
  });

  it("replaces existing object summary when object-created matches stored id", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      annotation: {
        ...initialAnnotationFoundationState,
        objectSummaries: [
          {
            color: "#00ffaa",
            id: "object-1",
            label: "left hand",
            status: "active",
          },
        ],
        selectedObjectId: "object-1",
      },
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      objectSummary: {
        color: "#0055ff",
        id: "object-1",
        label: "left hand updated",
        status: "paused",
      },
      type: "object-created",
    });

    expect(nextState.annotation.objectSummaries).toEqual([
      {
        color: "#0055ff",
        id: "object-1",
        label: "left hand updated",
        status: "paused",
      },
    ]);
    expect(nextState.annotation.selectedObjectId).toBe("object-1");
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

  it("clears only the saved mask from current-frame overlays", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      currentFrameIndex: 17,
      sam2: {
        ...initialSam2WorkspaceState,
        frameAnnotations: [
          {
            box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
            mask: {
              path: "masks/frame-17.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ],
      },
    };

    const nextState = videoReviewStateReducer(state, {
      frameIdx: 17,
      objectId: "object-1",
      type: "frame-annotation-mask-deleted",
    });

    expect(nextState.sam2.frameAnnotations).toEqual([
      {
        box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
        mask: null,
        object_id: "object-1",
        source: "sam2",
      },
    ]);
  });

  it("keeps overlays unchanged when frame-local cleanup targets another frame", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      currentFrameIndex: 18,
      sam2: {
        ...initialSam2WorkspaceState,
        frameAnnotations: [
          {
            box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
            mask: {
              path: "masks/frame-18.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ],
      },
    };

    const nextState = videoReviewStateReducer(state, {
      frameIdx: 17,
      objectId: "object-1",
      type: "frame-annotation-mask-deleted",
    });

    expect(nextState.sam2.frameAnnotations).toEqual(
      state.sam2.frameAnnotations,
    );
  });

  it("keeps current overlays when deleting a manual annotation from another frame", () => {
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
        currentFrameIndex: 18,
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

    expect(nextState.sam2.frameAnnotations).toEqual(
      storedState.sam2.frameAnnotations,
    );
  });

  it("replaces existing sam2 frame annotation when prompt saves same object again", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      sam2: {
        ...initialSam2WorkspaceState,
        frameAnnotations: [
          {
            box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
            mask: {
              path: "masks/old.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ],
      },
    };

    const nextState = videoReviewStateReducer(state, {
      response: {
        annotation: {
          box_xywh_norm: [0.2, 0.3, 0.4, 0.2],
          mask: {
            path: "masks/new.png",
          },
          object_id: "object-1",
          source: "sam2",
        },
        frame_idx: 17,
      },
      type: "sam2-prompt-ready",
    });

    expect(nextState.sam2.frameAnnotations).toEqual([
      {
        box_xywh_norm: [0.2, 0.3, 0.4, 0.2],
        mask: {
          path: "masks/new.png",
        },
        object_id: "object-1",
        source: "sam2",
      },
    ]);
  });

  it("resolves selected object fallback when manifest drops current selection", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      annotation: {
        ...initialAnnotationFoundationState,
        selectedObjectId: "missing-object",
      },
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      annotatedFrameIndices: [7],
      keyframeIndices: [7],
      objectSummaries: [
        {
          color: "#00ffaa",
          id: "object-1",
          label: "left hand",
          status: "active",
        },
      ],
      type: "manifest-loaded",
    });

    expect(nextState.annotation.selectedObjectId).toBe("object-1");
  });

  it("tracks refine request lifecycle and upserts corrected annotations", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      sam2: {
        ...initialSam2WorkspaceState,
        frameAnnotations: [
          {
            box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
            mask: {
              path: "masks/original.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ],
      },
    };

    const loadingState = videoReviewStateReducer(state, {
      type: "sam2-refine-requested",
    });
    const readyState = videoReviewStateReducer(loadingState, {
      response: {
        annotation: {
          box_xywh_norm: [0.2, 0.25, 0.35, 0.3],
          mask: {
            path: "masks/refined.png",
          },
          mask_confidence: null,
          object_id: "object-1",
          source: "sam2_edited",
        },
        frame_idx: 7,
      },
      type: "sam2-refine-ready",
    });
    const errorState = videoReviewStateReducer(readyState, {
      message: "Refine broke",
      type: "sam2-refine-failed",
    });

    expect(loadingState.sam2.refine).toEqual({
      errorMessage: null,
      response: null,
      status: "loading",
    });
    expect(readyState.sam2.frameAnnotations).toEqual([
      {
        box_xywh_norm: [0.2, 0.25, 0.35, 0.3],
        mask: {
          path: "masks/refined.png",
        },
        object_id: "object-1",
        source: "sam2_edited",
      },
    ]);
    expect(readyState.sam2.refine.status).toBe("ready");
    expect(errorState.sam2.refine).toEqual({
      errorMessage: "Refine broke",
      response: null,
      status: "error",
    });
  });

  it("resets prompt and refine state when a new frame loads", () => {
    const state: VideoReviewState = {
      ...initialVideoReviewState,
      annotation: {
        ...initialAnnotationFoundationState,
        keyframeIndices: [],
      },
      currentFrameIndex: 7,
      sam2: {
        ...initialSam2WorkspaceState,
        draftBox: {
          h: 0.4,
          w: 0.3,
          x: 0.1,
          y: 0.2,
        },
        prompt: {
          errorMessage: "Prompt broke",
          response: {
            annotation: {
              box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
              mask: {
                path: "masks/prompt.png",
              },
              object_id: "object-1",
              source: "sam2",
            },
            frame_idx: 7,
          },
          status: "error",
        },
        refine: {
          errorMessage: "Refine broke",
          response: {
            annotation: {
              box_xywh_norm: [0.2, 0.25, 0.35, 0.3],
              mask: {
                path: "masks/refined.png",
              },
              mask_confidence: null,
              object_id: "object-1",
              source: "sam2_edited",
            },
            frame_idx: 7,
          },
          status: "ready",
        },
      },
      selectedVideo: sampleVideo,
    };

    const nextState = videoReviewStateReducer(state, {
      annotations: [],
      frameIdx: 8,
      type: "frame-loaded",
    });

    expect(nextState.currentFrameIndex).toBe(8);
    expect(nextState.sam2.draftBox).toBeNull();
    expect(nextState.sam2.prompt).toEqual(initialSam2WorkspaceState.prompt);
    expect(nextState.sam2.refine).toEqual(initialSam2WorkspaceState.refine);
  });

  it("keeps non-keyframe manual annotations out of keyframe index", () => {
    const nextState = videoReviewStateReducer(initialVideoReviewState, {
      annotation: {
        box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
        frame_idx: 12,
        is_keyframe: false,
        mask: null,
        object_id: "object-1",
        source: "manual",
        video_id: sampleVideo.id,
      },
      type: "manual-annotation-upserted",
    });

    expect(nextState.annotation.annotatedFrameIndices).toEqual([12]);
    expect(nextState.annotation.keyframeIndices).toEqual([]);
  });

  it("tracks session, prompt, and propagation request lifecycles", () => {
    const loadingSessionState = videoReviewStateReducer(
      initialVideoReviewState,
      {
        type: "sam2-session-requested",
      },
    );
    const readySessionState = videoReviewStateReducer(loadingSessionState, {
      reused: true,
      sessionId: "sam2-session-1",
      type: "sam2-session-ready",
    });
    const failedSessionState = videoReviewStateReducer(readySessionState, {
      message: "Session broke",
      type: "sam2-session-failed",
    });
    const clearedSessionState = videoReviewStateReducer(failedSessionState, {
      type: "sam2-session-cleared",
    });
    const loadingPromptState = videoReviewStateReducer(clearedSessionState, {
      type: "sam2-prompt-requested",
    });
    const failedPromptState = videoReviewStateReducer(loadingPromptState, {
      message: "Prompt broke",
      type: "sam2-prompt-failed",
    });
    const loadingPropagationState = videoReviewStateReducer(failedPromptState, {
      type: "sam2-propagation-requested",
    });
    const readyPropagationState = videoReviewStateReducer(
      loadingPropagationState,
      {
        job: {
          errorMessage: null,
          jobId: "job-1",
          progressCurrent: 2,
          progressTotal: 4,
          result: {
            persistedFrameCount: 2,
            persistedFrameIndices: [8, 9],
          },
          status: "running",
          type: "sam2_propagation",
        },
        type: "sam2-propagation-ready",
      },
    );
    const failedPropagationState = videoReviewStateReducer(
      readyPropagationState,
      {
        message: "Propagation broke",
        type: "sam2-propagation-failed",
      },
    );

    expect(loadingSessionState.sam2.session.status).toBe("loading");
    expect(readySessionState.sam2.session).toEqual({
      errorMessage: null,
      reused: true,
      sessionId: "sam2-session-1",
      status: "ready",
    });
    expect(failedSessionState.sam2.session).toEqual({
      errorMessage: "Session broke",
      reused: null,
      sessionId: null,
      status: "error",
    });
    expect(clearedSessionState.sam2.session).toEqual(
      initialSam2WorkspaceState.session,
    );
    expect(loadingPromptState.sam2.prompt).toEqual({
      errorMessage: null,
      response: null,
      status: "loading",
    });
    expect(failedPromptState.sam2.prompt).toEqual({
      errorMessage: "Prompt broke",
      response: null,
      status: "error",
    });
    expect(loadingPropagationState.sam2.propagation).toEqual({
      errorMessage: null,
      job: null,
      status: "loading",
    });
    expect(readyPropagationState.sam2.propagation).toEqual({
      errorMessage: null,
      job: {
        errorMessage: null,
        jobId: "job-1",
        progressCurrent: 2,
        progressTotal: 4,
        result: {
          persistedFrameCount: 2,
          persistedFrameIndices: [8, 9],
        },
        status: "running",
        type: "sam2_propagation",
      },
      status: "ready",
    });
    expect(failedPropagationState.sam2.propagation).toEqual({
      errorMessage: "Propagation broke",
      job: {
        errorMessage: null,
        jobId: "job-1",
        progressCurrent: 2,
        progressTotal: 4,
        result: {
          persistedFrameCount: 2,
          persistedFrameIndices: [8, 9],
        },
        status: "running",
        type: "sam2_propagation",
      },
      status: "error",
    });
  });
});
