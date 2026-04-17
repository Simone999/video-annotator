import { useEffect, useState } from "react";

import {
  cancelSam2Job as cancelSam2JobRequest,
  createSam2Session as createSam2SessionRequest,
  closeSam2Session as closeSam2SessionRequest,
  getFrameAnnotations,
  getExactVideoFrame,
  getVideoManifest,
  getSam2Job,
  getIndexedVideo,
  listIndexedVideos,
  runSam2PromptBox as runSam2PromptBoxRequest,
  startSam2Propagation as startSam2PropagationRequest,
  type Sam2PropagationDirection,
  type ExactVideoFrame,
  VideoReviewApiError,
  type IndexedVideo,
} from "./api";
import {
  sam2PropagationJobFromCreateResponse,
  sam2PropagationJobFromStatusResponse,
  useVideoReviewState,
  type Sam2DraftBox,
  type Sam2PropagationJob,
  type VideoReviewState,
} from "./state";

type VideoListStatus = "loading" | "ready" | "empty" | "error";
type VideoSelectionStatus = "idle" | "loading" | "ready" | "error";
type ExactFrameStatus = "idle" | "loading" | "ready" | "error";
const SAM2_JOB_POLL_INTERVAL_MS = 1000;

export type VideoReviewWorkspaceState = {
  reviewState: VideoReviewState;
  indexedVideos: readonly IndexedVideo[];
  activeVideoId: string | null;
  errorMessage: string | null;
  exactFrame: ExactVideoFrame | null;
  exactFrameErrorMessage: string | null;
  exactFrameStatus: ExactFrameStatus;
  listStatus: VideoListStatus;
  selectionStatus: VideoSelectionStatus;
};

export type VideoReviewWorkspace = VideoReviewWorkspaceState & {
  cancelSam2PropagationJob: () => Promise<void>;
  closeSam2Session: () => Promise<void>;
  createSam2Session: () => Promise<void>;
  loadExactFrame: (frameIdx: number) => Promise<void>;
  refreshSam2PropagationJob: () => Promise<void>;
  setSam2DraftBox: (box: Sam2DraftBox | null) => void;
  setSam2SelectedObject: (objectId: string) => void;
  runSam2PromptBox: (options: {
    frameIdx: number;
    objectId: string;
    boxXyxyPx: readonly [number, number, number, number];
  }) => Promise<void>;
  selectVideo: (videoId: string) => Promise<void>;
  startSam2Propagation: (options: {
    startFrameIdx: number;
    endFrameIdx?: number;
    direction: Sam2PropagationDirection;
    objectIds: readonly string[];
  }) => Promise<void>;
};

export function useVideoReviewWorkspace(): VideoReviewWorkspace {
  const [reviewState, dispatch] = useVideoReviewState();
  const [indexedVideos, setIndexedVideos] = useState<
    VideoReviewWorkspaceState["indexedVideos"]
  >([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exactFrame, setExactFrame] = useState<ExactVideoFrame | null>(null);
  const [exactFrameErrorMessage, setExactFrameErrorMessage] = useState<
    string | null
  >(null);
  const [exactFrameStatus, setExactFrameStatus] =
    useState<ExactFrameStatus>("idle");
  const [listStatus, setListStatus] = useState<VideoListStatus>("loading");
  const [selectionStatus, setSelectionStatus] =
    useState<VideoSelectionStatus>("idle");

  useEffect(() => {
    let isCancelled = false;

    async function loadVideos() {
      try {
        const videos = await listIndexedVideos();

        if (isCancelled) {
          return;
        }

        setIndexedVideos(videos);
        setListStatus(videos.length === 0 ? "empty" : "ready");
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        setIndexedVideos([]);
        setErrorMessage(formatWorkspaceError(error));
        setListStatus("error");
      }
    }

    void loadVideos();

    return () => {
      isCancelled = true;
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
  }, [reviewState.sam2.propagation.job]);

  async function selectVideo(videoId: string): Promise<void> {
    setActiveVideoId(videoId);
    setErrorMessage(null);
    setExactFrame(null);
    setExactFrameErrorMessage(null);
    setExactFrameStatus("idle");
    setSelectionStatus("loading");

    try {
      const [video, manifest] = await Promise.all([
        getIndexedVideo({ videoId }),
        getVideoManifest({ videoId }),
      ]);
      dispatch({
        type: "video-selected",
        video,
      });
      dispatch({
        annotatedFrameIndices: manifest.annotated_frames,
        keyframeIndices: manifest.keyframes,
        objectSummaries: manifest.objects,
        type: "manifest-loaded",
      });
      setSelectionStatus("ready");
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      setSelectionStatus("error");
    }
  }

  async function loadExactFrame(frameIdx: number): Promise<void> {
    if (reviewState.selectedVideo === null) {
      setExactFrame(null);
      setExactFrameErrorMessage("Select a video before loading exact frames.");
      setExactFrameStatus("error");
      return;
    }

    setExactFrameErrorMessage(null);
    setExactFrameStatus("loading");

    try {
      const [frame, annotations] = await Promise.all([
        getExactVideoFrame({
          frameIdx,
          videoId: reviewState.selectedVideo.id,
        }),
        getFrameAnnotations({
          frameIdx,
          videoId: reviewState.selectedVideo.id,
        }),
      ]);
      setExactFrame(frame);
      setExactFrameStatus("ready");
      dispatch({
        annotations: annotations.annotations,
        frameIdx,
        type: "frame-loaded",
      });
    } catch (error: unknown) {
      setExactFrame(null);
      setExactFrameErrorMessage(formatWorkspaceError(error));
      setExactFrameStatus("error");
    }
  }

  async function createSam2Session(): Promise<void> {
    try {
      await ensureSam2Session();
    } catch {
      return;
    }
  }

  async function ensureSam2Session(): Promise<string> {
    if (reviewState.selectedVideo === null) {
      dispatch({
        message: "Select a video before creating a SAM2 session.",
        type: "sam2-session-failed",
      });
      throw new Error("Select a video before creating a SAM2 session.");
    }

    if (reviewState.sam2.session.sessionId !== null) {
      return reviewState.sam2.session.sessionId;
    }

    dispatch({
      type: "sam2-session-requested",
    });

    try {
      const session = await createSam2SessionRequest({
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        reused: session.reused,
        sessionId: session.session_id,
        type: "sam2-session-ready",
      });
      return session.session_id;
    } catch (error: unknown) {
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-session-failed",
      });
      throw error;
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

    dispatch({
      type: "sam2-prompt-requested",
    });

    try {
      const sessionId = await ensureSam2Session();
      const response = await runSam2PromptBoxRequest({
        boxXyxyPx: options.boxXyxyPx,
        frameIdx: options.frameIdx,
        objectId: options.objectId,
        sessionId,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        response,
        type: "sam2-prompt-ready",
      });
    } catch (error: unknown) {
      dispatch({
        message: formatWorkspaceError(error),
        type: "sam2-prompt-failed",
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

    if (reviewState.sam2.session.sessionId === null) {
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
        sessionId: reviewState.sam2.session.sessionId,
        startFrameIdx: options.startFrameIdx,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        job: sam2PropagationJobFromCreateResponse(response),
        type: "sam2-propagation-ready",
      });
    } catch (error: unknown) {
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
    activeVideoId,
    cancelSam2PropagationJob,
    closeSam2Session,
    createSam2Session,
    errorMessage,
    exactFrame,
    exactFrameErrorMessage,
    exactFrameStatus,
    indexedVideos,
    listStatus,
    loadExactFrame,
    refreshSam2PropagationJob,
    reviewState,
    runSam2PromptBox,
    setSam2DraftBox,
    setSam2SelectedObject,
    selectVideo,
    selectionStatus,
    startSam2Propagation,
  };
}

function formatWorkspaceError(error: unknown): string {
  if (error instanceof VideoReviewApiError) {
    return error.detail;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Video review request failed.";
}

function mergeCancelledJobState(
  job: Sam2PropagationJob,
  status: string,
): Sam2PropagationJob {
  return {
    ...job,
    status,
  };
}

function isSam2JobActive(status: string): boolean {
  return status === "queued" || status === "running" || status === "cancelling";
}
