// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewInspectorPanel } from "../../../src/features/video-review/components/review-inspector-panel";
import type { LiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";

describe("ReviewInspectorPanel", () => {
  it("shows unavailable duration and invalid range when review state lacks those values", () => {
    const controller = {
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
      handleClearRefinePoints: vi.fn(),
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
      manualBoxError: null,
      maskCleanupError: null,
      maskOpacityPercent: 58,
      objectDeleteError: "Object track delete failed.",
      pausePlaybackContext: vi.fn(),
      propagatedFrameIndices: [],
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
      selectedObjectId: "",
      selectedObjectReviewSummary: null,
      selectedObjectReviewSummaryError: null,
      selectedObjectReviewSummaryStatus: "idle",
      selectedObjectSummary: null,
      selectedRange: null,
      selectedSavedManualAnnotation: null,
      selectedVideo: {
        display_name: "sample.mp4",
        duration_seconds: null,
        fps: 24,
        frame_count: 42,
        height: 1080,
        id: "video-123",
        source_path: "/tmp/sample.mp4",
        width: 1920,
      },
      setMaskOpacityPercent: vi.fn(),
    } as unknown as LiveReviewController;
    const workspace = {
      cancelSam2PropagationJob: vi.fn(async () => {}),
      errorMessage: "Workspace reload failed.",
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
    } as unknown as VideoReviewWorkspace;

    render(
      <ReviewInspectorPanel controller={controller} workspace={workspace} />,
    );

    expect(screen.getByText("Range invalid")).toBeInTheDocument();
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
    expect(screen.getByText("Object track delete failed.")).toBeInTheDocument();
    expect(screen.getByText("Workspace reload failed.")).toBeInTheDocument();
  });
});
