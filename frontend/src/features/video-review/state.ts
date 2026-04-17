import { useReducer } from "react";

import type {
  FrameAnnotation,
  IndexedVideo,
  ManualFrameAnnotation,
  ObjectSummary,
  Sam2JobStatusResponse,
  Sam2PromptBoxResponse,
  Sam2PropagationResultResponse,
  Sam2PropagationJobResponse,
} from "./api";

export type Sam2RequestStatus = "idle" | "loading" | "ready" | "error";

export type Sam2DraftBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

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

export type Sam2PropagationResult = {
  persistedFrameCount: number;
  persistedFrameIndices: readonly number[];
};

export type Sam2PropagationJob = {
  jobId: string;
  type: string | null;
  status: string;
  progressCurrent: number;
  progressTotal: number;
  result: Sam2PropagationResult | null;
  errorMessage: string | null;
};

export type Sam2PropagationState = {
  status: Sam2RequestStatus;
  errorMessage: string | null;
  job: Sam2PropagationJob | null;
};

export type Sam2WorkspaceState = {
  draftBox: Sam2DraftBox | null;
  frameAnnotations: readonly FrameAnnotation[];
  session: Sam2SessionState;
  prompt: Sam2PromptState;
  propagation: Sam2PropagationState;
};

export type AnnotationFoundationState = {
  objectSummaries: readonly ObjectSummary[];
  selectedObjectId: string | null;
  annotatedFrameIndices: readonly number[];
  keyframeIndices: readonly number[];
  savedManualAnnotationsByFrame: Record<
    number,
    Record<string, ManualFrameAnnotation>
  >;
};

export type VideoReviewState = {
  selectedVideo: IndexedVideo | null;
  currentFrameIndex: number;
  annotation: AnnotationFoundationState;
  sam2: Sam2WorkspaceState;
};

export type VideoReviewAction =
  | {
      type: "video-selected";
      video: IndexedVideo;
    }
  | {
      type: "object-created";
      objectSummary: ObjectSummary;
    }
  | {
      type: "frame-loaded";
      frameIdx: number;
      annotations: readonly FrameAnnotation[];
    }
  | {
      type: "manifest-loaded";
      objectSummaries: readonly ObjectSummary[];
      annotatedFrameIndices: readonly number[];
      keyframeIndices: readonly number[];
    }
  | {
      type: "selection-cleared";
    }
  | {
      type: "sam2-object-selected";
      objectId: string;
    }
  | {
      type: "sam2-draft-box-set";
      box: Sam2DraftBox | null;
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
    }
  | {
      type: "manual-annotation-upserted";
      annotation: ManualFrameAnnotation;
    }
  | {
      type: "manual-annotation-deleted";
      frameIdx: number;
      objectId: string;
    };

export const initialSam2WorkspaceState: Sam2WorkspaceState = {
  draftBox: null,
  frameAnnotations: [],
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

export const initialAnnotationFoundationState: AnnotationFoundationState = {
  annotatedFrameIndices: [],
  keyframeIndices: [],
  objectSummaries: [],
  savedManualAnnotationsByFrame: {},
  selectedObjectId: null,
};

export const initialVideoReviewState: VideoReviewState = {
  annotation: initialAnnotationFoundationState,
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
        annotation: initialAnnotationFoundationState,
        currentFrameIndex: 0,
        selectedVideo: action.video,
        sam2: initialSam2WorkspaceState,
      };
    case "object-created":
      return {
        ...state,
        annotation: {
          ...state.annotation,
          objectSummaries: upsertObjectSummary(
            state.annotation.objectSummaries,
            action.objectSummary,
          ),
          selectedObjectId: action.objectSummary.id,
        },
      };
    case "frame-loaded":
      return {
        ...state,
        currentFrameIndex: action.frameIdx,
        annotation: {
          ...state.annotation,
          savedManualAnnotationsByFrame: syncSavedManualAnnotationsForFrame(
            state.annotation.savedManualAnnotationsByFrame,
            {
              annotations: action.annotations,
              frameIdx: action.frameIdx,
              isKeyframe: state.annotation.keyframeIndices.includes(
                action.frameIdx,
              ),
              videoId: state.selectedVideo?.id ?? "",
            },
          ),
        },
        sam2: {
          ...state.sam2,
          draftBox: null,
          frameAnnotations: action.annotations,
          prompt: initialSam2WorkspaceState.prompt,
        },
      };
    case "manifest-loaded":
      return {
        ...state,
        annotation: {
          ...state.annotation,
          annotatedFrameIndices: action.annotatedFrameIndices,
          keyframeIndices: action.keyframeIndices,
          objectSummaries: action.objectSummaries,
          selectedObjectId: resolveSelectedObjectId({
            currentObjectId: state.annotation.selectedObjectId,
            objectSummaries: action.objectSummaries,
          }),
        },
      };
    case "selection-cleared":
      return initialVideoReviewState;
    case "sam2-object-selected":
      return {
        ...state,
        annotation: {
          ...state.annotation,
          selectedObjectId: action.objectId,
        },
        sam2: {
          ...state.sam2,
          draftBox: null,
        },
      };
    case "sam2-draft-box-set":
      return {
        ...state,
        sam2: {
          ...state.sam2,
          draftBox: action.box,
        },
      };
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
          draftBox: null,
          frameAnnotations: upsertFrameAnnotation(state.sam2.frameAnnotations, {
            box_xywh_norm: action.response.annotation.box_xywh_norm,
            mask: action.response.annotation.mask,
            object_id: action.response.annotation.object_id,
            source: action.response.annotation.source,
          }),
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
    case "manual-annotation-upserted":
      return {
        ...state,
        annotation: {
          ...state.annotation,
          annotatedFrameIndices: upsertFrameIndex(
            state.annotation.annotatedFrameIndices,
            action.annotation.frame_idx,
          ),
          keyframeIndices: action.annotation.is_keyframe
            ? upsertFrameIndex(
                state.annotation.keyframeIndices,
                action.annotation.frame_idx,
              )
            : state.annotation.keyframeIndices,
          savedManualAnnotationsByFrame: upsertSavedManualAnnotation(
            state.annotation.savedManualAnnotationsByFrame,
            action.annotation,
          ),
        },
        sam2: {
          ...state.sam2,
          frameAnnotations: upsertFrameAnnotation(
            state.sam2.frameAnnotations,
            frameAnnotationFromManualAnnotation(action.annotation),
          ),
        },
      };
    case "manual-annotation-deleted": {
      const savedManualAnnotationsByFrame = deleteSavedManualAnnotation(
        state.annotation.savedManualAnnotationsByFrame,
        action.frameIdx,
        action.objectId,
      );
      const nextFrameAnnotations =
        state.currentFrameIndex === action.frameIdx
          ? deleteFrameAnnotation(
              state.sam2.frameAnnotations,
              action.objectId,
              "manual",
            )
          : state.sam2.frameAnnotations;

      return {
        ...state,
        annotation: {
          ...state.annotation,
          savedManualAnnotationsByFrame,
        },
        sam2: {
          ...state.sam2,
          frameAnnotations: nextFrameAnnotations,
        },
      };
    }
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
    result:
      response.result === null
        ? null
        : sam2PropagationResultFromResponse(response.result),
    status: response.status,
    type: response.type,
  };
}

function sam2PropagationResultFromResponse(
  response: Sam2PropagationResultResponse,
): Sam2PropagationResult {
  return {
    persistedFrameCount: response.persisted_frame_count,
    persistedFrameIndices: response.persisted_frame_indices,
  };
}

export function useVideoReviewState(
  initialState: VideoReviewState = initialVideoReviewState,
) {
  return useReducer(videoReviewStateReducer, initialState);
}

function upsertFrameAnnotation(
  annotations: readonly FrameAnnotation[],
  nextAnnotation: FrameAnnotation,
): readonly FrameAnnotation[] {
  const existingAnnotationIndex = annotations.findIndex(
    (annotation) => annotation.object_id === nextAnnotation.object_id,
  );
  if (existingAnnotationIndex === -1) {
    return [...annotations, nextAnnotation];
  }

  return annotations.map((annotation, index) =>
    index === existingAnnotationIndex ? nextAnnotation : annotation,
  );
}

function upsertObjectSummary(
  objectSummaries: readonly ObjectSummary[],
  nextObjectSummary: ObjectSummary,
): readonly ObjectSummary[] {
  const existingObjectIndex = objectSummaries.findIndex(
    (objectSummary) => objectSummary.id === nextObjectSummary.id,
  );
  if (existingObjectIndex === -1) {
    return [...objectSummaries, nextObjectSummary];
  }

  return objectSummaries.map((objectSummary, index) =>
    index === existingObjectIndex ? nextObjectSummary : objectSummary,
  );
}

function resolveSelectedObjectId(options: {
  currentObjectId: string | null;
  objectSummaries: readonly ObjectSummary[];
}): string | null {
  if (
    options.currentObjectId !== null &&
    options.objectSummaries.some(
      (objectSummary) => objectSummary.id === options.currentObjectId,
    )
  ) {
    return options.currentObjectId;
  }

  return options.objectSummaries[0]?.id ?? null;
}

function upsertSavedManualAnnotation(
  savedManualAnnotationsByFrame: AnnotationFoundationState["savedManualAnnotationsByFrame"],
  annotation: ManualFrameAnnotation,
): AnnotationFoundationState["savedManualAnnotationsByFrame"] {
  return {
    ...savedManualAnnotationsByFrame,
    [annotation.frame_idx]: {
      ...(savedManualAnnotationsByFrame[annotation.frame_idx] ?? {}),
      [annotation.object_id]: annotation,
    },
  };
}

function deleteSavedManualAnnotation(
  savedManualAnnotationsByFrame: AnnotationFoundationState["savedManualAnnotationsByFrame"],
  frameIdx: number,
  objectId: string,
): AnnotationFoundationState["savedManualAnnotationsByFrame"] {
  const currentFrameAnnotations = savedManualAnnotationsByFrame[frameIdx] ?? {};
  const nextFrameAnnotations = Object.fromEntries(
    Object.entries(currentFrameAnnotations).filter(
      ([savedObjectId]) => savedObjectId !== objectId,
    ),
  ) as Record<string, ManualFrameAnnotation>;

  return {
    ...savedManualAnnotationsByFrame,
    [frameIdx]: nextFrameAnnotations,
  };
}

function deleteFrameAnnotation(
  annotations: readonly FrameAnnotation[],
  objectId: string,
  source: string,
): readonly FrameAnnotation[] {
  return annotations.filter(
    (annotation) =>
      !(annotation.object_id === objectId && annotation.source === source),
  );
}

function syncSavedManualAnnotationsForFrame(
  savedManualAnnotationsByFrame: AnnotationFoundationState["savedManualAnnotationsByFrame"],
  options: {
    annotations: readonly FrameAnnotation[];
    frameIdx: number;
    isKeyframe: boolean;
    videoId: string;
  },
): AnnotationFoundationState["savedManualAnnotationsByFrame"] {
  const nextFrameAnnotations = Object.fromEntries(
    options.annotations
      .filter(
        (annotation) =>
          annotation.source === "manual" && annotation.box_xywh_norm !== null,
      )
      .map((annotation) => [
        annotation.object_id,
        {
          box_xywh_norm: annotation.box_xywh_norm as [
            number,
            number,
            number,
            number,
          ],
          frame_idx: options.frameIdx,
          is_keyframe: options.isKeyframe,
          mask: null,
          object_id: annotation.object_id,
          source: "manual",
          video_id: options.videoId,
        } satisfies ManualFrameAnnotation,
      ]),
  ) as Record<string, ManualFrameAnnotation>;

  return {
    ...savedManualAnnotationsByFrame,
    [options.frameIdx]: nextFrameAnnotations,
  };
}

function frameAnnotationFromManualAnnotation(
  annotation: ManualFrameAnnotation,
): FrameAnnotation {
  return {
    box_xywh_norm: annotation.box_xywh_norm,
    mask: null,
    object_id: annotation.object_id,
    source: annotation.source,
  };
}

function upsertFrameIndex(
  frameIndices: readonly number[],
  frameIdx: number,
): readonly number[] {
  if (frameIndices.includes(frameIdx)) {
    return frameIndices;
  }

  return [...frameIndices, frameIdx].sort((left, right) => left - right);
}
