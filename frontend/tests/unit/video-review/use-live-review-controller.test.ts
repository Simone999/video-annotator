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
      refine: {
        ...initialSam2WorkspaceState.refine,
        ...overrides?.sam2?.refine,
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
  exactFrame?: VideoReviewWorkspace["exactFrame"];
  exactFrameStatus?: VideoReviewWorkspace["exactFrameStatus"];
  indexedVideos?: VideoReviewWorkspace["indexedVideos"];
  listStatus?: VideoReviewWorkspace["listStatus"];
  loadExactFrame?: VideoReviewWorkspace["loadExactFrame"];
  reviewState?: VideoReviewState;
  runSam2RefineMask?: VideoReviewWorkspace["runSam2RefineMask"];
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
    deleteFrameAnnotationMask: vi.fn(async () => {}),
    deleteObjectMasks: vi.fn(async () => {}),
    deleteObjectTrack: vi.fn(async () => {}),
    deleteManualAnnotation: vi.fn(async () => {}),
    errorMessage: null,
    exactFrame: options?.exactFrame ?? null,
    exactFrameErrorMessage: null,
    exactFrameStatus: options?.exactFrameStatus ?? "idle",
    indexedVideos: options?.indexedVideos ?? [],
    listStatus: options?.listStatus ?? "loading",
    loadExactFrame: options?.loadExactFrame ?? vi.fn(async () => {}),
    refreshSam2PropagationJob: vi.fn(async () => {}),
    reviewState: options?.reviewState ?? initialVideoReviewState,
    runSam2RefineMask: options?.runSam2RefineMask ?? vi.fn(async () => {}),
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

  it("surfaces frame-submit errors when no video is selected or frame is invalid", () => {
    const loadExactFrame = vi.fn(() => Promise.resolve());
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
    const createObject = vi.fn(() => Promise.resolve());
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

  it("tracks explicit selected-range defaults and reset rules on canonical frames", async () => {
    const { result, rerender } = renderHook(
      ({ workspace }: { workspace: VideoReviewWorkspace }) =>
        useLiveReviewController({
          initialVideoId: null,
          workspace,
        }),
      {
        initialProps: {
          workspace: createWorkspace({
            reviewState: createReviewState({
              currentFrameIndex: 7,
              selectedVideo: sampleVideo,
            }),
          }),
        },
      },
    );

    expect(result.current.selectedRange).toEqual({
      boundaryFrameIdx: 41,
      endFrameIdx: 41,
      startFrameIdx: 7,
    });

    act(() => {
      result.current.setPropagationDirection("backward");
    });

    await waitFor(() => {
      expect(result.current.propagationEndFrameValue).toBe("0");
      expect(result.current.selectedRange).toEqual({
        boundaryFrameIdx: 0,
        endFrameIdx: 7,
        startFrameIdx: 0,
      });
    });

    act(() => {
      result.current.setPropagationEndFrameValue("3");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        boundaryFrameIdx: 3,
        endFrameIdx: 7,
        startFrameIdx: 3,
      });
    });

    rerender({
      workspace: createWorkspace({
        reviewState: createReviewState({
          currentFrameIndex: 8,
          selectedVideo: sampleVideo,
        }),
      }),
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        boundaryFrameIdx: 3,
        endFrameIdx: 8,
        startFrameIdx: 3,
      });
    });

    act(() => {
      result.current.setPropagationEndFrameValue("99");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toBeNull();
    });
  });

  it("surfaces propagation input validation and starts propagation with parsed frame", () => {
    const startSam2Propagation = vi.fn(() => Promise.resolve());
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

    act(() => {
      result.current.setPropagationEndFrameValue("99");
    });
    act(() => {
      result.current.handleStartPropagation();
    });

    expect(result.current.propagationInputError).toBe("Enter frame 0-41.");
    expect(startSam2Propagation).not.toHaveBeenCalled();

    act(() => {
      result.current.setPropagationEndFrameValue("3");
    });
    act(() => {
      result.current.handleStartPropagation();
    });

    expect(startSam2Propagation).toHaveBeenCalledWith({
      direction: "forward",
      endFrameIdx: 7,
      objectIds: [""],
      startFrameIdx: 7,
    });

    act(() => {
      result.current.setPropagationEndFrameValue("11");
    });
    act(() => {
      result.current.handleStartPropagation();
    });

    expect(startSam2Propagation).toHaveBeenCalledWith({
      direction: "forward",
      endFrameIdx: 11,
      objectIds: [""],
      startFrameIdx: 7,
    });
  });

  it("normalizes both-direction selected range from one shared boundary state", async () => {
    const startSam2Propagation = vi.fn(() => Promise.resolve());
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

    act(() => {
      result.current.setPropagationDirection("both");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        boundaryFrameIdx: 41,
        endFrameIdx: 41,
        startFrameIdx: 0,
      });
    });

    act(() => {
      result.current.setPropagationEndFrameValue("3");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        boundaryFrameIdx: 3,
        endFrameIdx: 41,
        startFrameIdx: 3,
      });
    });

    act(() => {
      result.current.handleStartPropagation();
    });

    expect(startSam2Propagation).toHaveBeenLastCalledWith({
      direction: "both",
      endFrameIdx: 3,
      objectIds: [""],
      startFrameIdx: 7,
    });
  });

  it("switches refine brush modes from keyboard shortcuts on paused saved-mask frame", () => {
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame: {
            blob: new Blob(["frame-7"]),
            mediaType: "image/png",
          },
          exactFrameStatus: "ready",
          reviewState: createReviewState({
            annotation: {
              ...initialVideoReviewState.annotation,
              objectSummaries: [
                {
                  color: "#00ffaa",
                  id: "object-1",
                  label: "pedestrian_01",
                  status: "active",
                },
              ],
              selectedObjectId: "object-1",
            },
            currentFrameIndex: 7,
            sam2: {
              ...initialSam2WorkspaceState,
              frameAnnotations: [
                {
                  box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
                  mask: {
                    path: "masks/video-123/object-1/frame_000007.png",
                  },
                  object_id: "object-1",
                  source: "sam2",
                },
              ],
            },
            selectedVideo: sampleVideo,
          }),
          selectionStatus: "ready",
        }),
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "m" }));
    });

    expect(result.current.isMaskRefineActive).toBe(true);
    expect(result.current.refineBrushMode).toBe("add");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" }));
    });

    expect(result.current.isMaskRefineActive).toBe(true);
    expect(result.current.refineBrushMode).toBe("erase");
  });

  it("maps refine points to pixels when saving corrected mask", () => {
    const runSam2RefineMask = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame: {
            blob: new Blob(["frame-7"]),
            mediaType: "image/png",
          },
          exactFrameStatus: "ready",
          reviewState: createReviewState({
            annotation: {
              ...initialVideoReviewState.annotation,
              objectSummaries: [
                {
                  color: "#00ffaa",
                  id: "object-1",
                  label: "pedestrian_01",
                  status: "active",
                },
              ],
              selectedObjectId: "object-1",
            },
            currentFrameIndex: 7,
            sam2: {
              ...initialSam2WorkspaceState,
              frameAnnotations: [
                {
                  box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
                  mask: {
                    path: "masks/video-123/object-1/frame_000007.png",
                  },
                  object_id: "object-1",
                  source: "sam2",
                },
              ],
            },
            selectedVideo: sampleVideo,
          }),
          runSam2RefineMask,
          selectionStatus: "ready",
        }),
      }),
    );

    act(() => {
      result.current.handleMaskRefineToggle();
      result.current.handleRefineStrokeCommit([
        { x: 0.25, y: 0.3 },
        { x: 0.375, y: 0.4 },
      ]);
      result.current.handleRefineBrushModeChange("erase");
      result.current.handleRefineStrokeCommit([{ x: 0.55, y: 0.6 }]);
      result.current.handleSaveRefinedMask();
    });

    expect(runSam2RefineMask).toHaveBeenCalledWith({
      frameIdx: 7,
      negativePoints: [[1056, 648]],
      objectId: "object-1",
      positivePoints: [
        [480, 324],
        [720, 432],
      ],
    });
  });
});
