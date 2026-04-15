import { useReducer } from "react";

import type {
  IndexedVideo,
  Sam2JobStatusResponse,
  Sam2PromptBoxResponse,
  Sam2PropagationJobResponse,
} from "./api";

export type Sam2RequestStatus = "idle" | "loading" | "ready" | "error";

export type Sam2SessionState = {
  sessionId: string | null;
  status: Sam2RequestStatus;
  reused: boolean | null;
  errorMessage: string | null;
};

export type Sam2PromptState = {
  status: Sam2RequestStatus;
  errorMessage: string | null;
  response: Sam2PromptBoxResponse | null;
};

export type Sam2PropagationJob = {
  jobId: string;
  type: string | null;
  status: string;
  progressCurrent: number;
  progressTotal: number;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
};

export type Sam2PropagationState = {
  status: Sam2RequestStatus;
  errorMessage: string | null;
  job: Sam2PropagationJob | null;
};

export type Sam2WorkspaceState = {
  session: Sam2SessionState;
  prompt: Sam2PromptState;
  propagation: Sam2PropagationState;
};

export type VideoReviewState = {
  selectedVideo: IndexedVideo | null;
  currentFrameIndex: number;
  sam2: Sam2WorkspaceState;
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
    }
  | {
      type: "sam2-session-requested";
    }
  | {
      type: "sam2-session-ready";
      sessionId: string;
      reused: boolean;
    }
  | {
      type: "sam2-session-failed";
      message: string;
    }
  | {
      type: "sam2-session-cleared";
    }
  | {
      type: "sam2-prompt-requested";
    }
  | {
      type: "sam2-prompt-ready";
      response: Sam2PromptBoxResponse;
    }
  | {
      type: "sam2-prompt-failed";
      message: string;
    }
  | {
      type: "sam2-propagation-requested";
    }
  | {
      type: "sam2-propagation-ready";
      job: Sam2PropagationJob;
    }
  | {
      type: "sam2-propagation-failed";
      message: string;
    };

export const initialSam2WorkspaceState: Sam2WorkspaceState = {
  propagation: {
    errorMessage: null,
    job: null,
    status: "idle",
  },
  prompt: {
    errorMessage: null,
    response: null,
    status: "idle",
  },
  session: {
    errorMessage: null,
    reused: null,
    sessionId: null,
    status: "idle",
  },
};

export const initialVideoReviewState: VideoReviewState = {
  currentFrameIndex: 0,
  selectedVideo: null,
  sam2: initialSam2WorkspaceState,
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
        sam2: initialSam2WorkspaceState,
      };
    case "frame-index-set":
      return {
        ...state,
        currentFrameIndex: action.frameIdx,
      };
    case "selection-cleared":
      return initialVideoReviewState;
    case "sam2-session-requested":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          session: {
            errorMessage: null,
            reused: null,
            sessionId: null,
            status: "loading",
          },
        },
      };
    case "sam2-session-ready":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          session: {
            errorMessage: null,
            reused: action.reused,
            sessionId: action.sessionId,
            status: "ready",
          },
        },
      };
    case "sam2-session-failed":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          session: {
            errorMessage: action.message,
            reused: null,
            sessionId: null,
            status: "error",
          },
        },
      };
    case "sam2-session-cleared":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          session: initialSam2WorkspaceState.session,
        },
      };
    case "sam2-prompt-requested":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          prompt: {
            errorMessage: null,
            response: null,
            status: "loading",
          },
        },
      };
    case "sam2-prompt-ready":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          prompt: {
            errorMessage: null,
            response: action.response,
            status: "ready",
          },
        },
      };
    case "sam2-prompt-failed":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          prompt: {
            errorMessage: action.message,
            response: null,
            status: "error",
          },
        },
      };
    case "sam2-propagation-requested":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          propagation: {
            errorMessage: null,
            job: state.sam2.propagation.job,
            status: "loading",
          },
        },
      };
    case "sam2-propagation-ready":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          propagation: {
            errorMessage: null,
            job: action.job,
            status: "ready",
          },
        },
      };
    case "sam2-propagation-failed":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          propagation: {
            errorMessage: action.message,
            job: state.sam2.propagation.job,
            status: "error",
          },
        },
      };
  }
}

export function sam2PropagationJobFromCreateResponse(
  response: Sam2PropagationJobResponse,
): Sam2PropagationJob {
  return {
    errorMessage: null,
    jobId: response.job_id,
    progressCurrent: response.progress_current,
    progressTotal: response.progress_total,
    result: null,
    status: response.status,
    type: "sam2_propagation",
  };
}

export function sam2PropagationJobFromStatusResponse(
  response: Sam2JobStatusResponse,
): Sam2PropagationJob {
  return {
    errorMessage: response.error_message,
    jobId: response.job_id,
    progressCurrent: response.progress_current,
    progressTotal: response.progress_total,
    result: response.result,
    status: response.status,
    type: response.type,
  };
}

export function useVideoReviewState(
  initialState: VideoReviewState = initialVideoReviewState,
) {
  return useReducer(videoReviewStateReducer, initialState);
}
