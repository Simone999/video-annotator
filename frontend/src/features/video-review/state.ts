import { useReducer } from "react";

import type { IndexedVideo } from "./api";

export type VideoReviewState = {
  selectedVideo: IndexedVideo | null;
  currentFrameIndex: number;
};

export type VideoReviewAction =
  | {
      type: "video-selected";
      video: IndexedVideo;
    }
  | {
      type: "frame-index-set";
      frameIdx: number;
    }
  | {
      type: "selection-cleared";
    };

export const initialVideoReviewState: VideoReviewState = {
  currentFrameIndex: 0,
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
        selectedVideo: action.video,
      };
    case "frame-index-set":
      return {
        ...state,
        currentFrameIndex: action.frameIdx,
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
