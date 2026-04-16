import { useReducer } from "react";

import type {
  IndexedVideo,
  ManualFrameAnnotation,
  ObjectTrackSummary,
} from "./api";

export type { ObjectTrackSummary } from "./api";
export type SavedManualAnnotation = ManualFrameAnnotation;
export type SavedManualAnnotationsByFrame = Partial<
  Record<number, Record<string, SavedManualAnnotation>>
>;

export type VideoReviewState = {
  selectedVideo: IndexedVideo | null;
  currentFrameIndex: number;
  objectSummaries: ObjectTrackSummary[];
  selectedObjectId: string | null;
  savedManualAnnotationsByFrame: SavedManualAnnotationsByFrame;
};

export type VideoReviewAction =
  | {
      type: "video-selected";
      video: IndexedVideo;
    }
  | {
      type: "manifest-loaded";
      objects: ObjectTrackSummary[];
    }
  | {
      type: "object-selected";
      objectId: string | null;
    }
  | {
      type: "object-created";
      object: ObjectTrackSummary;
    }
  | {
      type: "frame-index-set";
      frameIdx: number;
    }
  | {
      type: "manual-annotation-upserted";
      annotation: SavedManualAnnotation;
    }
  | {
      type: "manual-annotation-deleted";
      frameIdx: number;
      objectId: string;
    }
  | {
      type: "selection-cleared";
    };

export const initialVideoReviewState: VideoReviewState = {
  currentFrameIndex: 0,
  objectSummaries: [],
  savedManualAnnotationsByFrame: {},
  selectedObjectId: null,
  selectedVideo: null,
};

export function videoReviewStateReducer(
  state: VideoReviewState,
  action: VideoReviewAction,
): VideoReviewState {
  switch (action.type) {
    case "video-selected":
      return {
        currentFrameIndex: 0,
        objectSummaries: [],
        savedManualAnnotationsByFrame: {},
        selectedObjectId: null,
        selectedVideo: action.video,
      };
    case "manifest-loaded":
      return {
        ...state,
        objectSummaries: action.objects,
      };
    case "object-selected":
      return {
        ...state,
        selectedObjectId: action.objectId,
      };
    case "object-created":
      return {
        ...state,
        objectSummaries: [...state.objectSummaries, action.object],
        selectedObjectId: action.object.id,
      };
    case "frame-index-set":
      return {
        ...state,
        currentFrameIndex: action.frameIdx,
      };
    case "manual-annotation-upserted":
      return {
        ...state,
        savedManualAnnotationsByFrame: {
          ...state.savedManualAnnotationsByFrame,
          [action.annotation.frame_idx]: {
            ...state.savedManualAnnotationsByFrame[action.annotation.frame_idx],
            [action.annotation.object_id]: action.annotation,
          },
        },
      };
    case "manual-annotation-deleted":
      return {
        ...state,
        savedManualAnnotationsByFrame: removeSavedManualAnnotation({
          frameIdx: action.frameIdx,
          objectId: action.objectId,
          savedManualAnnotationsByFrame: state.savedManualAnnotationsByFrame,
        }),
      };
    case "selection-cleared":
      return initialVideoReviewState;
  }

  const exhaustiveAction: never = action;
  throw new Error(`Unhandled action: ${JSON.stringify(exhaustiveAction)}`);
}

export function useVideoReviewState(
  initialState: VideoReviewState = initialVideoReviewState,
) {
  return useReducer(videoReviewStateReducer, initialState);
}

function removeSavedManualAnnotation(options: {
  frameIdx: number;
  objectId: string;
  savedManualAnnotationsByFrame: SavedManualAnnotationsByFrame;
}): SavedManualAnnotationsByFrame {
  const frameAnnotations =
    options.savedManualAnnotationsByFrame[options.frameIdx];
  if (frameAnnotations === undefined) {
    return options.savedManualAnnotationsByFrame;
  }

  const nextFrameAnnotations = Object.fromEntries(
    Object.entries(frameAnnotations).filter(
      ([objectId]) => objectId !== options.objectId,
    ),
  );

  if (Object.keys(nextFrameAnnotations).length === 0) {
    return Object.fromEntries(
      Object.entries(options.savedManualAnnotationsByFrame).filter(
        ([frameIdx]) => Number(frameIdx) !== options.frameIdx,
      ),
    );
  }

  return {
    ...options.savedManualAnnotationsByFrame,
    [options.frameIdx]: nextFrameAnnotations,
  };
}
