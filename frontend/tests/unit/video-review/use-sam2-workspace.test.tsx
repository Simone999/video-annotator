// @vitest-environment jsdom

import type { Dispatch, SetStateAction } from "react";
import { act } from "react";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  IndexedVideo,
  ManualFrameAnnotation,
  Sam2PromptBoxResponse,
} from "../../../src/features/video-review/api";
import {
  initialSam2WorkspaceState,
  initialVideoReviewState,
  type Sam2PropagationJob,
  type VideoReviewAction,
  type VideoReviewState,
} from "../../../src/features/video-review/state";
import { SAM2_JOB_POLL_INTERVAL_MS } from "../../../src/features/video-review/hooks/workspace-utils";

const {
  cancelSam2JobMock,
  closeSam2SessionMock,
  createSam2SessionMock,
  createVideoObjectMock,
  deleteManualFrameAnnotationMock,
  getSam2JobMock,
  runSam2PromptBoxMock,
  startSam2PropagationMock,
  upsertManualFrameAnnotationMock,
} = vi.hoisted(() => ({
  cancelSam2JobMock: vi.fn(),
  closeSam2SessionMock: vi.fn(),
  createSam2SessionMock: vi.fn(),
  createVideoObjectMock: vi.fn(),
  deleteManualFrameAnnotationMock: vi.fn(),
  getSam2JobMock: vi.fn(),
  runSam2PromptBoxMock: vi.fn(),
  startSam2PropagationMock: vi.fn(),
  upsertManualFrameAnnotationMock: vi.fn(),
}));

vi.mock("../../../src/features/video-review/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../src/features/video-review/api")
  >("../../../src/features/video-review/api");

  return {
    ...actual,
    cancelSam2Job: cancelSam2JobMock,
    closeSam2Session: closeSam2SessionMock,
    createSam2Session: createSam2SessionMock,
    createVideoObject: createVideoObjectMock,
    deleteManualFrameAnnotation: deleteManualFrameAnnotationMock,
    getSam2Job: getSam2JobMock,
    runSam2PromptBox: runSam2PromptBoxMock,
    startSam2Propagation: startSam2PropagationMock,
    upsertManualFrameAnnotation: upsertManualFrameAnnotationMock,
  };
});

import { useSam2Workspace } from "../../../src/features/video-review/hooks/use-sam2-workspace";

const sampleVideo: IndexedVideo = {
  display_name: "sample.mp4",
  duration_seconds: 1.75,
  fps: 24,
  frame_count: 42,
  height: 1080,
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  width: 1920,
};

function createReviewState(options?: {
  currentFrameIndex?: number;
  job?: Sam2PropagationJob | null;
  selectedVideo?: IndexedVideo | null;
  sessionId?: string | null;
}): VideoReviewState {
  const sessionId = options?.sessionId ?? null;

  return {
    ...initialVideoReviewState,
    currentFrameIndex: options?.currentFrameIndex ?? 7,
    selectedVideo: options?.selectedVideo ?? null,
    sam2: {
      ...initialSam2WorkspaceState,
      propagation: {
        ...initialSam2WorkspaceState.propagation,
        job: options?.job ?? null,
      },
      session: {
        ...initialSam2WorkspaceState.session,
        reused: sessionId === null ? null : false,
        sessionId,
        status: sessionId === null ? "idle" : "ready",
      },
    },
  };
}

function createPropagationJob(
  overrides?: Partial<Sam2PropagationJob>,
): Sam2PropagationJob {
  return {
    errorMessage: null,
    jobId: "job-1",
    progressCurrent: 1,
    progressTotal: 4,
    result: null,
    status: "running",
    type: "sam2_propagation",
    ...overrides,
  };
}

function createPromptResponse(): Sam2PromptBoxResponse {
  return {
    annotation: {
      box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
      mask: {
        path: "masks/video-123/object-1/frame_000007.png",
      },
      object_id: "object-1",
      source: "sam2",
    },
    frame_idx: 7,
  };
}

function createManualAnnotation(): ManualFrameAnnotation {
  return {
    box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
    frame_idx: 7,
    is_keyframe: true,
    mask: null,
    object_id: "object-1",
    source: "manual",
    video_id: sampleVideo.id,
  };
}

function createDeferredPromise<T>() {
  let resolvePromise: ((value: T) => void) | null = null;
  let rejectPromise: ((reason?: unknown) => void) | null = null;
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    reject(reason: unknown) {
      if (rejectPromise === null) {
        throw new Error("Deferred promise reject was not initialized.");
      }
      rejectPromise(reason);
    },
    resolve(value: T) {
      if (resolvePromise === null) {
        throw new Error("Deferred promise resolve was not initialized.");
      }
      resolvePromise(value);
    },
  };
}

function createSetErrorMessageSpy() {
  return vi.fn() as ReturnType<typeof vi.fn> &
    Dispatch<SetStateAction<string | null>>;
}

describe("useSam2Workspace", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("surfaces fail-fast errors when no video is selected", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();

    const { result } = renderHook(() =>
      useSam2Workspace({
        dispatch,
        reviewState: createReviewState(),
        setErrorMessage,
      }),
    );

    await act(async () => {
      await result.current.createObject("left hand");
      await result.current.createSam2Session();
      await result.current.runSam2PromptBox({
        boxXyxyPx: [10, 20, 30, 40],
        frameIdx: 7,
        objectId: "object-1",
      });
      await result.current.startSam2Propagation({
        direction: "forward",
        endFrameIdx: 11,
        objectIds: ["object-1"],
        startFrameIdx: 7,
      });
    });

    await expect(
      result.current.saveManualAnnotation({
        boxXywhNorm: [0.1, 0.2, 0.3, 0.4],
        frameIdx: 7,
        objectId: "object-1",
      }),
    ).rejects.toThrow("Select a video before saving manual annotations.");
    await expect(
      result.current.deleteManualAnnotation({
        frameIdx: 7,
        objectId: "object-1",
      }),
    ).rejects.toThrow("Select a video before deleting manual annotations.");

    expect(setErrorMessage).toHaveBeenCalledWith(
      "Select a video before creating objects.",
    );
    expect(dispatch).toHaveBeenCalledWith({
      message: "Select a video before creating a SAM2 session.",
      type: "sam2-session-failed",
    });
    expect(dispatch).toHaveBeenCalledWith({
      message: "Select a video before running SAM2.",
      type: "sam2-prompt-failed",
    });
    expect(dispatch).toHaveBeenCalledWith({
      message: "Select a video before starting propagation.",
      type: "sam2-propagation-failed",
    });
    expect(createVideoObjectMock).not.toHaveBeenCalled();
    expect(createSam2SessionMock).not.toHaveBeenCalled();
  });

  it("creates objects and manual annotations for selected video", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    createVideoObjectMock.mockResolvedValue({
      color: "#00ffaa",
      id: "object-1",
      label: "left hand",
      status: "active",
    });
    upsertManualFrameAnnotationMock.mockResolvedValue(createManualAnnotation());

    const { result } = renderHook(() =>
      useSam2Workspace({
        dispatch,
        reviewState: createReviewState({
          selectedVideo: sampleVideo,
        }),
        setErrorMessage,
      }),
    );

    await act(async () => {
      await result.current.createObject("left hand");
      await result.current.saveManualAnnotation({
        boxXywhNorm: [0.1, 0.2, 0.3, 0.4],
        frameIdx: 7,
        objectId: "object-1",
      });
    });

    expect(createVideoObjectMock).toHaveBeenCalledWith({
      label: "left hand",
      videoId: sampleVideo.id,
    });
    expect(upsertManualFrameAnnotationMock).toHaveBeenCalledWith({
      boxXywhNorm: [0.1, 0.2, 0.3, 0.4],
      frameIdx: 7,
      isKeyframe: true,
      objectId: "object-1",
      videoId: sampleVideo.id,
    });
    expect(dispatch).toHaveBeenCalledWith({
      objectSummary: {
        color: "#00ffaa",
        id: "object-1",
        label: "left hand",
        status: "active",
      },
      type: "object-created",
    });
    expect(dispatch).toHaveBeenCalledWith({
      annotation: createManualAnnotation(),
      type: "manual-annotation-upserted",
    });
    expect(setErrorMessage).toHaveBeenCalledWith(null);
  });

  it("surfaces object-creation failure through workspace error setter", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    createVideoObjectMock.mockRejectedValue(new Error("Create broke"));

    const { result } = renderHook(() =>
      useSam2Workspace({
        dispatch,
        reviewState: createReviewState({
          selectedVideo: sampleVideo,
        }),
        setErrorMessage,
      }),
    );

    await act(async () => {
      await result.current.createObject("left hand");
    });

    expect(dispatch).not.toHaveBeenCalled();
    expect(setErrorMessage).toHaveBeenCalledWith("Create broke");
  });

  it("creates session once and reuses existing session for prompt runs", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    createSam2SessionMock.mockResolvedValue({
      reused: false,
      session_id: "sam2-session-1",
    });
    runSam2PromptBoxMock.mockResolvedValue(createPromptResponse());

    const { result, rerender } = renderHook(
      ({ reviewState }: { reviewState: VideoReviewState }) =>
        useSam2Workspace({
          dispatch,
          reviewState,
          setErrorMessage,
        }),
      {
        initialProps: {
          reviewState: createReviewState({
            selectedVideo: sampleVideo,
          }),
        },
      },
    );

    await act(async () => {
      await result.current.createSam2Session();
    });

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "sam2-session-requested",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      reused: false,
      sessionId: "sam2-session-1",
      type: "sam2-session-ready",
    });

    rerender({
      reviewState: createReviewState({
        selectedVideo: sampleVideo,
        sessionId: "sam2-session-1",
      }),
    });

    await act(async () => {
      await result.current.runSam2PromptBox({
        boxXyxyPx: [10, 20, 30, 40],
        frameIdx: 7,
        objectId: "object-1",
      });
    });

    expect(createSam2SessionMock).toHaveBeenCalledTimes(1);
    expect(runSam2PromptBoxMock).toHaveBeenCalledWith({
      boxXyxyPx: [10, 20, 30, 40],
      frameIdx: 7,
      objectId: "object-1",
      sessionId: "sam2-session-1",
      videoId: sampleVideo.id,
    });
    expect(dispatch).toHaveBeenCalledWith({
      response: createPromptResponse(),
      type: "sam2-prompt-ready",
    });
  });

  it("clears or fails session close based on current workspace state", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    closeSam2SessionMock.mockRejectedValue(new Error("Close broke"));

    const { result, rerender } = renderHook(
      ({ reviewState }: { reviewState: VideoReviewState }) =>
        useSam2Workspace({
          dispatch,
          reviewState,
          setErrorMessage,
        }),
      {
        initialProps: {
          reviewState: createReviewState(),
        },
      },
    );

    await act(async () => {
      await result.current.closeSam2Session();
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "sam2-session-cleared",
    });

    rerender({
      reviewState: createReviewState({
        selectedVideo: sampleVideo,
      }),
    });

    await act(async () => {
      await result.current.closeSam2Session();
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "sam2-session-cleared",
    });

    rerender({
      reviewState: createReviewState({
        selectedVideo: sampleVideo,
        sessionId: "sam2-session-1",
      }),
    });

    await act(async () => {
      await result.current.closeSam2Session();
    });

    expect(closeSam2SessionMock).toHaveBeenCalledWith({
      sessionId: "sam2-session-1",
      videoId: sampleVideo.id,
    });
    expect(dispatch).toHaveBeenCalledWith({
      message: "Close broke",
      type: "sam2-session-failed",
    });
  });

  it("surfaces prompt failures after prompt request starts", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    createSam2SessionMock.mockResolvedValue({
      reused: false,
      session_id: "sam2-session-1",
    });
    runSam2PromptBoxMock.mockRejectedValue(new Error("Prompt broke"));

    const { result } = renderHook(() =>
      useSam2Workspace({
        dispatch,
        reviewState: createReviewState({
          selectedVideo: sampleVideo,
        }),
        setErrorMessage,
      }),
    );

    await act(async () => {
      await result.current.runSam2PromptBox({
        boxXyxyPx: [10, 20, 30, 40],
        frameIdx: 7,
        objectId: "object-1",
      });
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "sam2-prompt-requested",
    });
    expect(dispatch).toHaveBeenCalledWith({
      message: "Prompt broke",
      type: "sam2-prompt-failed",
    });
  });

  it("starts propagation, refreshes active jobs, and handles cancel success", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    startSam2PropagationMock.mockResolvedValue({
      job_id: "job-1",
      progress_current: 0,
      progress_total: 4,
      status: "queued",
    });
    getSam2JobMock.mockResolvedValue({
      error_message: null,
      job_id: "job-1",
      progress_current: 2,
      progress_total: 4,
      result: {
        persisted_frame_count: 2,
        persisted_frame_indices: [8, 9],
      },
      status: "running",
      type: "sam2_propagation",
    });
    cancelSam2JobMock.mockResolvedValue({
      job_id: "job-1",
      status: "cancelling",
    });

    const { result, rerender } = renderHook(
      ({ reviewState }: { reviewState: VideoReviewState }) =>
        useSam2Workspace({
          dispatch,
          reviewState,
          setErrorMessage,
        }),
      {
        initialProps: {
          reviewState: createReviewState({
            selectedVideo: sampleVideo,
            sessionId: "sam2-session-1",
          }),
        },
      },
    );

    await act(async () => {
      await result.current.startSam2Propagation({
        direction: "forward",
        endFrameIdx: 11,
        objectIds: ["object-1"],
        startFrameIdx: 7,
      });
    });

    expect(startSam2PropagationMock).toHaveBeenCalledWith({
      direction: "forward",
      endFrameIdx: 11,
      objectIds: ["object-1"],
      sessionId: "sam2-session-1",
      startFrameIdx: 7,
      videoId: sampleVideo.id,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: "sam2-propagation-requested",
    });
    expect(dispatch).toHaveBeenCalledWith({
      job: {
        errorMessage: null,
        jobId: "job-1",
        progressCurrent: 0,
        progressTotal: 4,
        result: null,
        status: "queued",
        type: "sam2_propagation",
      },
      type: "sam2-propagation-ready",
    });

    const currentJob = createPropagationJob({
      status: "queued",
    });
    rerender({
      reviewState: createReviewState({
        job: currentJob,
        selectedVideo: sampleVideo,
        sessionId: "sam2-session-1",
      }),
    });

    await act(async () => {
      await result.current.refreshSam2PropagationJob();
      await result.current.cancelSam2PropagationJob();
    });

    expect(getSam2JobMock).toHaveBeenCalledWith({
      jobId: "job-1",
    });
    expect(cancelSam2JobMock).toHaveBeenCalledWith({
      jobId: "job-1",
    });
    expect(dispatch).toHaveBeenCalledWith({
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
    });
    expect(dispatch).toHaveBeenCalledWith({
      job: {
        ...currentJob,
        status: "cancelling",
      },
      type: "sam2-propagation-ready",
    });
  });

  it("surfaces propagation fail-fast and request failures", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    startSam2PropagationMock.mockRejectedValue(new Error("Propagation broke"));

    const { result, rerender } = renderHook(
      ({ reviewState }: { reviewState: VideoReviewState }) =>
        useSam2Workspace({
          dispatch,
          reviewState,
          setErrorMessage,
        }),
      {
        initialProps: {
          reviewState: createReviewState(),
        },
      },
    );

    await act(async () => {
      await result.current.startSam2Propagation({
        direction: "forward",
        endFrameIdx: 11,
        objectIds: ["object-1"],
        startFrameIdx: 7,
      });
    });

    expect(dispatch).toHaveBeenCalledWith({
      message: "Select a video before starting propagation.",
      type: "sam2-propagation-failed",
    });

    rerender({
      reviewState: createReviewState({
        selectedVideo: sampleVideo,
      }),
    });

    await act(async () => {
      await result.current.startSam2Propagation({
        direction: "forward",
        endFrameIdx: 11,
        objectIds: ["object-1"],
        startFrameIdx: 7,
      });
    });

    expect(dispatch).toHaveBeenCalledWith({
      message: "Create or reuse a SAM2 session before starting propagation.",
      type: "sam2-propagation-failed",
    });

    rerender({
      reviewState: createReviewState({
        selectedVideo: sampleVideo,
        sessionId: "sam2-session-1",
      }),
    });

    await act(async () => {
      await result.current.startSam2Propagation({
        direction: "forward",
        endFrameIdx: 11,
        objectIds: ["object-1"],
        startFrameIdx: 7,
      });
    });

    expect(dispatch).toHaveBeenCalledWith({
      message: "Propagation broke",
      type: "sam2-propagation-failed",
    });
  });

  it("surfaces refresh and cancel failures and ignores null current jobs", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    getSam2JobMock.mockRejectedValue(new Error("Refresh broke"));
    cancelSam2JobMock.mockRejectedValue(new Error("Cancel broke"));

    const { result, rerender } = renderHook(
      ({ reviewState }: { reviewState: VideoReviewState }) =>
        useSam2Workspace({
          dispatch,
          reviewState,
          setErrorMessage,
        }),
      {
        initialProps: {
          reviewState: createReviewState(),
        },
      },
    );

    await act(async () => {
      await result.current.refreshSam2PropagationJob();
      await result.current.cancelSam2PropagationJob();
    });

    expect(getSam2JobMock).not.toHaveBeenCalled();
    expect(cancelSam2JobMock).not.toHaveBeenCalled();

    rerender({
      reviewState: createReviewState({
        job: createPropagationJob(),
      }),
    });

    await act(async () => {
      await result.current.refreshSam2PropagationJob();
      await result.current.cancelSam2PropagationJob();
    });

    expect(dispatch).toHaveBeenCalledWith({
      message: "Refresh broke",
      type: "sam2-propagation-failed",
    });
    expect(dispatch).toHaveBeenCalledWith({
      message: "Cancel broke",
      type: "sam2-propagation-failed",
    });
  });

  it("polls active jobs and ignores late responses after unmount", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    const deferred = createDeferredPromise<{
      error_message: null;
      job_id: string;
      progress_current: number;
      progress_total: number;
      result: null;
      status: string;
      type: string;
    }>();
    getSam2JobMock.mockReturnValue(deferred.promise);
    vi.useFakeTimers();

    const { unmount } = renderHook(() =>
      useSam2Workspace({
        dispatch,
        reviewState: createReviewState({
          job: createPropagationJob(),
        }),
        setErrorMessage,
      }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SAM2_JOB_POLL_INTERVAL_MS);
    });

    unmount();

    await act(async () => {
      deferred.resolve({
        error_message: null,
        job_id: "job-1",
        progress_current: 2,
        progress_total: 4,
        result: null,
        status: "running",
        type: "sam2_propagation",
      });
      await deferred.promise;
    });

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("polls active jobs and dispatches formatted failures", async () => {
    const dispatch = vi.fn<(action: VideoReviewAction) => void>();
    const setErrorMessage = createSetErrorMessageSpy();
    getSam2JobMock.mockRejectedValue(new Error("Polling broke"));
    vi.useFakeTimers();

    renderHook(() =>
      useSam2Workspace({
        dispatch,
        reviewState: createReviewState({
          job: createPropagationJob(),
        }),
        setErrorMessage,
      }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SAM2_JOB_POLL_INTERVAL_MS);
    });

    expect(dispatch).toHaveBeenCalledWith({
      message: "Polling broke",
      type: "sam2-propagation-failed",
    });
  });
});
