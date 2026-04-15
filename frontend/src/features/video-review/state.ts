import { useReducer } from "react";

import type {
  FrameAnnotation,
  IndexedVideo,
  ObjectTrackSummary,
  VideoManifest,
} from "./api";

export type AnnotationBoxDraft = {
  frameIdx: number;
  objectId: number;
  box_xywh_norm: [number, number, number, number];
};

export type VideoReviewState = {
  annotatedFrameIndices: number[];
  selectedVideo: IndexedVideo | null;
  currentFrameIndex: number;
  objects: ObjectTrackSummary[];
  keyframeIndices: number[];
  selectedObjectId: number | null;
  frameAnnotationsByFrame: Record<number, FrameAnnotation[]>;
  draftAnnotationBox: AnnotationBoxDraft | null;
};

export type VideoReviewAction =
  | {
      type: "manifest-loaded";
      manifest: VideoManifest;
    }
  | {
      type: "frame-index-set";
      frameIdx: number;
    }
  | {
      type: "selected-object-set";
      objectId: number | null;
    }
  | {
      type: "object-created";
      object: ObjectTrackSummary;
    }
  | {
      type: "frame-annotations-received";
      frameIdx: number;
      annotations: FrameAnnotation[];
    }
  | {
      type: "draft-annotation-box-set";
      draft: AnnotationBoxDraft | null;
    }
  | {
      type: "selection-cleared";
    };

export const initialVideoReviewState: VideoReviewState = {
  annotatedFrameIndices: [],
  currentFrameIndex: 0,
  draftAnnotationBox: null,
  frameAnnotationsByFrame: {},
  keyframeIndices: [],
  objects: [],
  selectedObjectId: null,
  selectedVideo: null,
};

export function videoReviewStateReducer(
  state: VideoReviewState,
  action: VideoReviewAction,
): VideoReviewState {
  switch (action.type) {
    case "manifest-loaded":
      return {
        annotatedFrameIndices: [...action.manifest.annotated_frame_indices],
        currentFrameIndex: 0,
        draftAnnotationBox: null,
        frameAnnotationsByFrame: {},
        keyframeIndices: [...action.manifest.keyframe_indices],
        objects: [...action.manifest.objects],
        selectedObjectId: null,
        selectedVideo: action.manifest.video,
      };
    case "frame-index-set":
      return {
        ...state,
        currentFrameIndex: action.frameIdx,
        draftAnnotationBox: null,
      };
    case "selected-object-set":
      return {
        ...state,
        draftAnnotationBox: null,
        selectedObjectId: action.objectId,
      };
    case "object-created":
      return {
        ...state,
        draftAnnotationBox: null,
        objects: [...state.objects, action.object],
        selectedObjectId: action.object.id,
      };
    case "frame-annotations-received":
      return {
        ...state,
        annotatedFrameIndices: upsertFrameIndex(
          state.annotatedFrameIndices,
          action.frameIdx,
          action.annotations.length > 0,
        ),
        frameAnnotationsByFrame: {
          ...state.frameAnnotationsByFrame,
          [action.frameIdx]: action.annotations,
        },
        keyframeIndices: upsertFrameIndex(
          state.keyframeIndices,
          action.frameIdx,
          action.annotations.some((annotation) => annotation.is_keyframe),
        ),
      };
    case "draft-annotation-box-set":
      return {
        ...state,
        draftAnnotationBox: action.draft,
      };
    case "selection-cleared":
      return initialVideoReviewState;
  }
}

export function useVideoReviewState(
  initialState: VideoReviewState = initialVideoReviewState,
) {
  return useReducer(videoReviewStateReducer, initialState);
}

function upsertFrameIndex(
  frameIndices: number[],
  frameIdx: number,
  shouldInclude: boolean,
): number[] {
  const nextFrameIndices = shouldInclude
    ? [...frameIndices, frameIdx]
    : frameIndices.filter((value) => value !== frameIdx);

  return [...new Set(nextFrameIndices)].sort((left, right) => left - right);
}
