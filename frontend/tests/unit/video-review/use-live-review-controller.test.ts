// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  initialSam2WorkspaceState,
  initialVideoReviewState,
  type VideoReviewState,
} from "../../../src/features/video-review/state";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";

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

function createReviewState(
  overrides?: Partial<VideoReviewState>,
): VideoReviewState {
  return {
    ...initialVideoReviewState,
    ...overrides,
    annotation: {
      ...initialVideoReviewState.annotation,
      ...overrides?.annotation,
    },
    sam2: {
      ...initialSam2WorkspaceState,
      ...overrides?.sam2,
      propagation: {
        ...initialSam2WorkspaceState.propagation,
        ...overrides?.sam2?.propagation,
      },
      prompt: {
        ...initialSam2WorkspaceState.prompt,
        ...overrides?.sam2?.prompt,
      },
      session: {
        ...initialSam2WorkspaceState.session,
        ...overrides?.sam2?.session,
      },
    },
  };
}

function createWorkspace(options?: {
  createObject?: VideoReviewWorkspace["createObject"];
  indexedVideos?: VideoReviewWorkspace["indexedVideos"];
  listStatus?: VideoReviewWorkspace["listStatus"];
  loadExactFrame?: VideoReviewWorkspace["loadExactFrame"];
  reviewState?: VideoReviewState;
  selectVideo?: VideoReviewWorkspace["selectVideo"];
  selectionStatus?: VideoReviewWorkspace["selectionStatus"];
  startSam2Propagation?: VideoReviewWorkspace["startSam2Propagation"];
}): VideoReviewWorkspace {
  return {
    activeVideoId: null,
    cancelSam2PropagationJob: vi.fn(async () => {}),
    createObject: options?.createObject ?? vi.fn(async () => {}),
    createSam2Session: vi.fn(async () => {}),
    closeSam2Session: vi.fn(async () => {}),
    deleteManualAnnotation: vi.fn(async () => {}),
    errorMessage: null,
    exactFrame: null,
    exactFrameErrorMessage: null,
    exactFrameStatus: "idle",
    indexedVideos: options?.indexedVideos ?? [],
    listStatus: options?.listStatus ?? "loading",
    loadExactFrame: options?.loadExactFrame ?? vi.fn(async () => {}),
    refreshSam2PropagationJob: vi.fn(async () => {}),
    reviewState: options?.reviewState ?? initialVideoReviewState,
    runSam2PromptBox: vi.fn(async () => {}),
    saveManualAnnotation: vi.fn(async () => {}),
    selectVideo: options?.selectVideo ?? vi.fn(async () => {}),
    selectionStatus: options?.selectionStatus ?? "idle",
    setSam2DraftBox: vi.fn(),
    setSam2SelectedObject: vi.fn(),
    startSam2Propagation:
      options?.startSam2Propagation ?? vi.fn(async () => {}),
  };
}

describe("useLiveReviewController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("bootstraps selected video from route video id once list is ready", async () => {
    const selectVideo = vi.fn(async () => {});
    const workspace = createWorkspace({
      indexedVideos: [sampleVideo],
      listStatus: "ready",
      selectVideo,
    });

    const { rerender } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: sampleVideo.id,
        workspace,
      }),
    );

    await waitFor(() => {
      expect(selectVideo).toHaveBeenCalledWith(sampleVideo.id);
    });

    rerender();

    expect(selectVideo).toHaveBeenCalledTimes(1);
  });

  it("loads landing frame from first annotated frame once selection is ready", async () => {
    const loadExactFrame = vi.fn(async () => {});
    const workspace = createWorkspace({
      loadExactFrame,
      reviewState: {
        ...initialVideoReviewState,
        annotation: {
          ...initialVideoReviewState.annotation,
          annotatedFrameIndices: [7, 12],
        },
        selectedVideo: sampleVideo,
      },
      selectionStatus: "ready",
    });

    const { rerender } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace,
      }),
    );

    await waitFor(() => {
      expect(loadExactFrame).toHaveBeenCalledWith(7);
    });

    rerender();

    expect(loadExactFrame).toHaveBeenCalledTimes(1);
  });

  it("surfaces frame-submit errors when no video is selected or frame is invalid", async () => {
    const loadExactFrame = vi.fn(async () => {});
    const { result, rerender } = renderHook(
      ({ workspace }: { workspace: VideoReviewWorkspace }) =>
        useLiveReviewController({
          initialVideoId: null,
          workspace,
        }),
      {
        initialProps: {
          workspace: createWorkspace({
            loadExactFrame,
          }),
        },
      },
    );

    const emptyForm = document.createElement("form");
    emptyForm.innerHTML = '<input name="frame-number" value="7" />';

    act(() => {
      result.current.handleFrameSubmit({
        currentTarget: emptyForm,
        preventDefault: vi.fn(),
      } as never);
    });

    expect(result.current.frameInputError).toBe(
      "Select a video before loading exact frames.",
    );
    expect(loadExactFrame).not.toHaveBeenCalled();

    const invalidForm = document.createElement("form");
    invalidForm.innerHTML = '<input name="frame-number" value="99" />';

    rerender({
      workspace: createWorkspace({
        loadExactFrame,
        reviewState: createReviewState({
          selectedVideo: sampleVideo,
        }),
        selectionStatus: "ready",
      }),
    });

    act(() => {
      result.current.handleFrameSubmit({
        currentTarget: invalidForm,
        preventDefault: vi.fn(),
      } as never);
    });

    expect(result.current.frameInputError).toBe("Enter frame 0-41.");
    expect(loadExactFrame).toHaveBeenCalledTimes(1);
  });

  it("surfaces object-creation validation errors and resets label after success", async () => {
    const createObject = vi.fn(async () => {});
    const { result, rerender } = renderHook(
      ({ workspace }: { workspace: VideoReviewWorkspace }) =>
        useLiveReviewController({
          initialVideoId: null,
          workspace,
        }),
      {
        initialProps: {
          workspace: createWorkspace({
            createObject,
          }),
        },
      },
    );

    await act(async () => {
      await result.current.handleCreateObject();
    });

    expect(result.current.objectPanelError).toBe(
      "Select a video before creating objects.",
    );

    rerender({
      workspace: createWorkspace({
        createObject,
        reviewState: createReviewState({
          selectedVideo: sampleVideo,
        }),
      }),
    });

    act(() => {
      result.current.setNewObjectLabel("   ");
    });
    await act(async () => {
      await result.current.handleCreateObject();
    });
    expect(result.current.objectPanelError).toBe(
      "Enter object label before creating object.",
    );

    act(() => {
      result.current.setNewObjectLabel("left hand");
    });
    await act(async () => {
      await result.current.handleCreateObject();
    });

    expect(createObject).toHaveBeenCalledWith("left hand");
    expect(result.current.newObjectLabel).toBe("");
  });

  it("surfaces manual-box validation errors when no object is selected", () => {
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          reviewState: createReviewState({
            selectedVideo: sampleVideo,
          }),
        }),
      }),
    );

    act(() => {
      result.current.handleManualBoxCommit({
        h: 0.4,
        w: 0.3,
        x: 0.1,
        y: 0.2,
      });
      result.current.handleDeleteManualBox();
    });

    expect(result.current.manualBoxError).toBe(
      "Select object before deleting manual box.",
    );
  });

  it("surfaces propagation input validation and starts propagation with parsed frame", async () => {
    const startSam2Propagation = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          reviewState: createReviewState({
            currentFrameIndex: 7,
            selectedVideo: sampleVideo,
          }),
          startSam2Propagation,
        }),
      }),
    );

    await act(async () => {
      result.current.setPropagationEndFrameValue("99");
    });
    await act(async () => {
      result.current.handleStartPropagation();
    });

    expect(result.current.propagationInputError).toBe("Enter frame 0-41.");
    expect(startSam2Propagation).not.toHaveBeenCalled();

    await act(async () => {
      result.current.setPropagationEndFrameValue("11");
    });
    await act(async () => {
      result.current.handleStartPropagation();
    });

    expect(startSam2Propagation).toHaveBeenCalledWith({
      direction: "forward",
      endFrameIdx: 11,
      objectIds: [""],
      startFrameIdx: 7,
    });
  });
});
