import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import {
  cancelSam2Job as cancelSam2JobRequest,
  closeSam2Session as closeSam2SessionRequest,
  createSam2Session as createSam2SessionRequest,
  createVideoObject as createVideoObjectRequest,
  deleteFrameAnnotationMask as deleteFrameAnnotationMaskRequest,
  deleteObjectMasks as deleteObjectMasksRequest,
  deleteManualFrameAnnotation as deleteManualFrameAnnotationRequest,
  getSam2Job,
  runSam2RefineMask as runSam2RefineMaskRequest,
  runSam2PromptBox as runSam2PromptBoxRequest,
  startSam2Propagation as startSam2PropagationRequest,
  upsertManualFrameAnnotation as upsertManualFrameAnnotationRequest,
  type Sam2PropagationDirection,
} from "../api";
import {
  sam2PropagationJobFromCreateResponse,
  sam2PropagationJobFromStatusResponse,
  type Sam2DraftBox,
  type VideoReviewAction,
  type VideoReviewState,
} from "../state";
import {
  SAM2_JOB_POLL_INTERVAL_MS,
  formatWorkspaceError,
  isSam2JobActive,
  mergeCancelledJobState,
} from "./workspace-utils";

export function useSam2Workspace({
  dispatch,
  reviewState,
  setErrorMessage,
}: {
  dispatch: Dispatch<VideoReviewAction>;
  reviewState: VideoReviewState;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}) {
  const isMountedRef = useRef(true);
  const activeVideoIdRef = useRef<string | null>(
    reviewState.selectedVideo?.id ?? null,
  );
  activeVideoIdRef.current = reviewState.selectedVideo?.id ?? null;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const currentJob = reviewState.sam2.propagation.job;
    if (currentJob === null || !isSam2JobActive(currentJob.status)) {
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await getSam2Job({
            jobId: currentJob.jobId,
          });
          if (isCancelled) {
            return;
          }

          dispatch({
            job: sam2PropagationJobFromStatusResponse(response),
            type: "sam2-propagation-ready",
          });
        } catch (error: unknown) {
          if (isCancelled) {
            return;
          }

          dispatch({
            message: formatWorkspaceError(error),
            type: "sam2-propagation-failed",
          });
        }
      })();
    }, SAM2_JOB_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, reviewState.sam2.propagation.job]);

  async function createObject(label: string): Promise<void> {
    if (reviewState.selectedVideo === null) {
      setErrorMessage("Select a video before creating objects.");
      return;
    }

    try {
      const objectSummary = await createVideoObjectRequest({
        label,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        objectSummary,
        type: "object-created",
      });
      setErrorMessage(null);
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
    }
  }

  async function saveManualAnnotation(options: {
    boxXywhNorm: readonly [number, number, number, number];
    frameIdx: number;
    objectId: string;
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before saving manual annotations.");
    }

    const annotation = await upsertManualFrameAnnotationRequest({
      boxXywhNorm: options.boxXywhNorm,
      frameIdx: options.frameIdx,
      isKeyframe: true,
      objectId: options.objectId,
      videoId: reviewState.selectedVideo.id,
    });

    dispatch({
      annotation,
      type: "manual-annotation-upserted",
    });
  }

  async function deleteManualAnnotation(options: {
    frameIdx: number;
    objectId: string;
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before deleting manual annotations.");
    }

    await deleteManualFrameAnnotationRequest({
      frameIdx: options.frameIdx,
      objectId: options.objectId,
      videoId: reviewState.selectedVideo.id,
    });

    dispatch({
      frameIdx: options.frameIdx,
      objectId: options.objectId,
      type: "manual-annotation-deleted",
    });
  }

  async function deleteFrameAnnotationMask(options: {
    frameIdx: number;
    objectId: string;
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before clearing saved masks.");
    }

    await deleteFrameAnnotationMaskRequest({
      frameIdx: options.frameIdx,
      objectId: options.objectId,
      videoId: reviewState.selectedVideo.id,
    });

    dispatch({
      frameIdx: options.frameIdx,
      objectId: options.objectId,
      type: "frame-annotation-mask-deleted",
    });
  }

  async function deleteObjectMasks(options: {
    objectId: string;
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before clearing saved masks.");
    }

    await deleteObjectMasksRequest({
      objectId: options.objectId,
      videoId: reviewState.selectedVideo.id,
    });
  }

  function canApplySam2Result(videoId: string): boolean {
    return isMountedRef.current && activeVideoIdRef.current === videoId;
  }

  async function ensureSam2Session(): Promise<string | null> {
    if (reviewState.selectedVideo === null) {
      dispatch({
        message: "Select a video before creating a SAM2 session.",
        type: "sam2-session-failed",
      });
      throw new Error("Select a video before creating a SAM2 session.");
    }
    const videoId = reviewState.selectedVideo.id;

    if (reviewState.sam2.session.sessionId !== null) {
      return reviewState.sam2.session.sessionId;
    }

    dispatch({
      type: "sam2-session-requested",
    });

    try {
      const session = await createSam2SessionRequest({
        videoId,
      });
      if (!canApplySam2Result(videoId)) {
        return null;
      }
      dispatch({
        reused: session.reused,
        sessionId: session.session_id,
        type: "sam2-session-ready",
      });
      return session.session_id;
    } catch (error: unknown) {
      if (!canApplySam2Result(videoId)) {
        return null;
      }
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-session-failed",
      });
      throw error;
    }
  }

  async function createSam2Session(): Promise<void> {
    try {
      await ensureSam2Session();
    } catch {
      return;
    }
  }

  async function closeSam2Session(): Promise<void> {
    if (
      reviewState.selectedVideo === null ||
      reviewState.sam2.session.sessionId === null
    ) {
      dispatch({
        type: "sam2-session-cleared",
      });
      return;
    }

    try {
      await closeSam2SessionRequest({
        sessionId: reviewState.sam2.session.sessionId,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        type: "sam2-session-cleared",
      });
    } catch (error: unknown) {
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-session-failed",
      });
    }
  }

  async function runSam2PromptBox(options: {
    frameIdx: number;
    objectId: string;
    boxXyxyPx: readonly [number, number, number, number];
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      dispatch({
        message: "Select a video before running SAM2.",
        type: "sam2-prompt-failed",
      });
      return;
    }
    const videoId = reviewState.selectedVideo.id;

    dispatch({
      type: "sam2-prompt-requested",
    });

    try {
      const sessionId = await ensureSam2Session();
      if (sessionId === null) {
        return;
      }
      const response = await runSam2PromptBoxRequest({
        boxXyxyPx: options.boxXyxyPx,
        frameIdx: options.frameIdx,
        objectId: options.objectId,
        sessionId,
        videoId,
      });
      if (!canApplySam2Result(videoId)) {
        return;
      }
      dispatch({
        response,
        type: "sam2-prompt-ready",
      });
    } catch (error: unknown) {
      if (!canApplySam2Result(videoId)) {
        return;
      }
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-prompt-failed",
      });
    }
  }

  async function runSam2RefineMask(options: {
    frameIdx: number;
    objectId: string;
    positivePoints: readonly [number, number][];
    negativePoints: readonly [number, number][];
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      dispatch({
        message: "Select a video before refining a mask.",
        type: "sam2-refine-failed",
      });
      return;
    }
    const videoId = reviewState.selectedVideo.id;

    dispatch({
      type: "sam2-refine-requested",
    });

    try {
      const sessionId = await ensureSam2Session();
      if (sessionId === null) {
        return;
      }
      const response = await runSam2RefineMaskRequest({
        frameIdx: options.frameIdx,
        negativePoints: options.negativePoints,
        objectId: options.objectId,
        positivePoints: options.positivePoints,
        sessionId,
        videoId,
      });
      if (!canApplySam2Result(videoId)) {
        return;
      }
      dispatch({
        response,
        type: "sam2-refine-ready",
      });
    } catch (error: unknown) {
      if (!canApplySam2Result(videoId)) {
        return;
      }
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-refine-failed",
      });
    }
  }

  function setSam2SelectedObject(objectId: string): void {
    dispatch({
      objectId,
      type: "sam2-object-selected",
    });
  }

  function setSam2DraftBox(box: Sam2DraftBox | null): void {
    dispatch({
      box,
      type: "sam2-draft-box-set",
    });
  }

  async function startSam2Propagation(options: {
    startFrameIdx: number;
    endFrameIdx?: number;
    direction: Sam2PropagationDirection;
    objectIds: readonly string[];
  }): Promise<void> {
    if (reviewState.selectedVideo === null) {
      dispatch({
        message: "Select a video before starting propagation.",
        type: "sam2-propagation-failed",
      });
      return;
    }
    const videoId = reviewState.selectedVideo.id;
    const sessionId = reviewState.sam2.session.sessionId;

    if (sessionId === null) {
      dispatch({
        message: "Create or reuse a SAM2 session before starting propagation.",
        type: "sam2-propagation-failed",
      });
      return;
    }

    dispatch({
      type: "sam2-propagation-requested",
    });

    try {
      const response = await startSam2PropagationRequest({
        direction: options.direction,
        endFrameIdx: options.endFrameIdx,
        objectIds: options.objectIds,
        sessionId,
        startFrameIdx: options.startFrameIdx,
        videoId,
      });
      if (!canApplySam2Result(videoId)) {
        return;
      }
      dispatch({
        job: sam2PropagationJobFromCreateResponse(response),
        type: "sam2-propagation-ready",
      });
    } catch (error: unknown) {
      if (!canApplySam2Result(videoId)) {
        return;
      }
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-propagation-failed",
      });
    }
  }

  async function refreshSam2PropagationJob(): Promise<void> {
    const currentJob = reviewState.sam2.propagation.job;
    if (currentJob === null) {
      return;
    }

    try {
      const response = await getSam2Job({
        jobId: currentJob.jobId,
      });
      dispatch({
        job: sam2PropagationJobFromStatusResponse(response),
        type: "sam2-propagation-ready",
      });
    } catch (error: unknown) {
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-propagation-failed",
      });
    }
  }

  async function cancelSam2PropagationJob(): Promise<void> {
    const currentJob = reviewState.sam2.propagation.job;
    if (currentJob === null) {
      return;
    }

    try {
      const response = await cancelSam2JobRequest({
        jobId: currentJob.jobId,
      });
      dispatch({
        job: mergeCancelledJobState(currentJob, response.status),
        type: "sam2-propagation-ready",
      });
    } catch (error: unknown) {
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-propagation-failed",
      });
    }
  }

  return {
    cancelSam2PropagationJob,
    closeSam2Session,
    createObject,
    createSam2Session,
    deleteFrameAnnotationMask,
    deleteObjectMasks,
    deleteManualAnnotation,
    refreshSam2PropagationJob,
    runSam2RefineMask,
    runSam2PromptBox,
    saveManualAnnotation,
    setSam2DraftBox,
    setSam2SelectedObject,
    startSam2Propagation,
  };
}
