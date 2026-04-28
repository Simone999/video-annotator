// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewInspectorPanel } from "../../../src/features/video-review/components/review-inspector-panel";
import type { LiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";

const selectedVideo = {
  display_name: "sample.mp4",
  duration_seconds: 1.75,
  fps: 24,
  frame_count: 42,
  height: 1080,
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  width: 1920,
} as const;

function createController(
  overrides?: Partial<LiveReviewController>,
): LiveReviewController {
  return {
    canCreateExport: false,
    canDeleteObjectTrack: false,
    canDeleteFrameMask: false,
    canDeleteObjectMasks: false,
    canMutateCurrentFrame: false,
    canCancelPropagation: false,
    canSaveMaskRefine: false,
    canStartMaskRefine: false,
    canStartPropagation: false,
    currentFrameIndex: 7,
    currentFrameBox: null,
    currentReviewState: "ready",
    exportDownloadUrl: null,
    exportError: null,
    exportRequestStatus: "idle",
    handleClearRefinePoints: vi.fn(),
    handleCreateExport: vi.fn(),
    handleDeleteFrameMask: vi.fn(),
    handleDeleteManualBox: vi.fn(),
    handleDeleteObjectMasks: vi.fn(),
    handleDeleteObjectTrack: vi.fn(),
    handleMaskRefineToggle: vi.fn(),
    handleRefineBrushModeChange: vi.fn(),
    handleRunSam2: vi.fn(),
    handleSaveRefinedMask: vi.fn(),
    handleStartPropagation: vi.fn(),
    isMaskRefineActive: false,
    isPlaybackActive: false,
    manualBoxError: null,
    maskCleanupError: null,
    maskOpacityPercent: 58,
    objectDeleteError: null,
    pausePlaybackContext: vi.fn(),
    propagatedFrameIndices: [],
    propagationDirection: "both",
    propagationEndFrameValue: "11",
    propagationJob: null,
    propagationStatus: "idle",
    refineBrushMode: "add",
    refineErrorMessage: null,
    refineNegativePoints: [],
    refinePositivePoints: [],
    refineStatus: "idle",
    refineValidationError: null,
    sam2DraftBox: null,
    selectedFrameAnnotation: null,
    selectedObjectId: "object-1",
    selectedObjectReviewSummary: {
      bbox_xyxy_px: [20, 30, 100, 140],
      frame_idx: 7,
      label: "pedestrian_01",
      mask_confidence: null,
      object_id: "object-1",
      track_summary: {
        frames: 5,
        manual: 2,
        missing: 1,
        propagated: 2,
      },
      video_id: "video-123",
    },
    selectedObjectReviewSummaryError: null,
    selectedObjectReviewSummaryStatus: "ready",
    selectedObjectSummary: {
      color: "#00ffaa",
      id: "object-1",
      label: "pedestrian_01",
      status: "active",
    },
    selectedRange: {
      boundaryFrameIdx: 11,
      direction: "forward",
      endFrameIdx: 11,
      startFrameIdx: 7,
    },
    selectedSavedManualAnnotation: null,
    selectedVideo,
    setMaskOpacityPercent: vi.fn(),
    ...overrides,
  } as unknown as LiveReviewController;
}

function createWorkspace(
  overrides?: Partial<VideoReviewWorkspace>,
): VideoReviewWorkspace {
  return {
    cancelSam2PropagationJob: vi.fn(async () => {}),
    errorMessage: null,
    loadExactFrame: vi.fn(async () => {}),
    reviewState: {
      sam2: {
        prompt: {
          errorMessage: null,
          status: "idle",
        },
        propagation: {
          errorMessage: null,
        },
        session: {
          sessionId: null,
        },
      },
    },
    selectionStatus: "ready",
    ...overrides,
  } as unknown as VideoReviewWorkspace;
}

describe("ReviewInspectorPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows unavailable duration and invalid range when review state lacks those values", () => {
    const controller = createController({
      objectDeleteError: "Object track delete failed.",
      selectedObjectId: "",
      selectedObjectReviewSummary: null,
      selectedObjectReviewSummaryStatus: "idle",
      selectedObjectSummary: null,
      selectedRange: null,
      selectedVideo: {
        ...selectedVideo,
        duration_seconds: null,
      },
    });
    const workspace = createWorkspace({
      errorMessage: "Workspace reload failed.",
    });

    render(
      <ReviewInspectorPanel controller={controller} workspace={workspace} />,
    );

    expect(screen.getByText("Range invalid")).toBeInTheDocument();
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
    expect(screen.getByText("Object track delete failed.")).toBeInTheDocument();
    expect(screen.getByText("Workspace reload failed.")).toBeInTheDocument();
  });

  it("renders export controls and fresh-export guidance from backend review truth", () => {
    const controller = createController({
      canCreateExport: true,
      currentReviewState: "exported",
      exportError: "Export route failed.",
      exportRequestStatus: "loading",
      selectedObjectSummary: null,
      selectedVideo: {
        ...selectedVideo,
        review_state: "exported",
      },
    });
    const workspace = createWorkspace();

    render(
      <ReviewInspectorPanel controller={controller} workspace={workspace} />,
    );

    expect(screen.getByRole("button", { name: "Export" })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Export JSON" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Export PNGs" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Building export artifact...")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Current export is still fresh. Run export again in this session to get a new download link.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Export route failed.")).toBeInTheDocument();
    expect(screen.getByText("object-1")).toBeInTheDocument();
    expect(screen.getByText("pedestrian_01")).toBeInTheDocument();
    expect(screen.getByText("7-11")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "Manual2"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "Missing1"),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "Propagated2"),
    ).toBeInTheDocument();
  });

  it("toggles mask visibility between hidden and remembered opacity", () => {
    const setMaskOpacityPercent = vi.fn();
    const hiddenWorkspace = createWorkspace();

    const { rerender } = render(
      <ReviewInspectorPanel
        controller={createController({
          maskOpacityPercent: 73,
          setMaskOpacityPercent,
        })}
        workspace={hiddenWorkspace}
      />,
    );

    screen.getByRole("button", { name: "Toggle Visibility" }).click();
    expect(setMaskOpacityPercent).toHaveBeenCalledWith(0);

    rerender(
      <ReviewInspectorPanel
        controller={createController({
          maskOpacityPercent: 0,
          setMaskOpacityPercent,
        })}
        workspace={hiddenWorkspace}
      />,
    );

    screen.getByRole("button", { name: "Toggle Visibility" }).click();
    expect(setMaskOpacityPercent).toHaveBeenLastCalledWith(73);
  });

  it("opens a propagated frame from inspector job results", () => {
    const controller = createController({
      canCancelPropagation: true,
      propagatedFrameIndices: [12],
      propagationJob: {
        errorMessage: null,
        jobId: "job-1",
        progressCurrent: 1,
        progressTotal: 1,
        result: {
          persistedFrameCount: 1,
          persistedFrameIndices: [12],
        },
        status: "completed",
        type: "sam2_propagation",
      },
    });
    const workspace = createWorkspace({
      loadExactFrame: vi.fn(async () => {}),
    });

    render(
      <ReviewInspectorPanel controller={controller} workspace={workspace} />,
    );

    screen.getByRole("button", { name: "Open propagated frame 12" }).click();

    expect(controller.pausePlaybackContext).toHaveBeenCalledTimes(1);
    expect(workspace.loadExactFrame).toHaveBeenCalledWith(12);
  });

  it("prefers the latest export download link over fresh-export copy", () => {
    render(
      <ReviewInspectorPanel
        controller={createController({
          canCreateExport: true,
          currentReviewState: "exported",
          exportDownloadUrl: "/api/exports/export-123",
        })}
        workspace={createWorkspace()}
      />,
    );

    const link = screen.getByRole("link", { name: "Download latest export" });
    expect(link).toHaveAttribute("href", "/api/exports/export-123");
    expect(
      screen.queryByText(/Current export is still fresh/),
    ).not.toBeInTheDocument();
  });

  it("shows zero-state selection guidance while video selection is still loading", () => {
    render(
      <ReviewInspectorPanel
        controller={createController({
          selectedObjectId: "",
          selectedObjectReviewSummary: null,
          selectedObjectSummary: null,
          selectedVideo: null,
        })}
        workspace={createWorkspace({
          selectionStatus: "loading",
        })}
      />,
    );

    expect(screen.getByText("Loading selected video...")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pick a video from indexed list to open review workspace.",
      ),
    ).toBeInTheDocument();
  });
});
