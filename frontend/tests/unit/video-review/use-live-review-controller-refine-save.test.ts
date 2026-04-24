// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  initialSam2WorkspaceState,
  initialVideoReviewState,
} from "../../../src/features/video-review/state";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import {
  createReviewState,
  createWorkspace,
  sampleVideo,
} from "./use-live-review-controller-test-helpers";

describe("useLiveReviewController mask refine save", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps refine points to pixels when saving corrected mask", async () => {
    const runSam2RefineMask = vi.fn(async () => {});
    const workspace = createWorkspace({
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
    });
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace,
      }),
    );

    act(() => {
      result.current.handleMaskRefineToggle();
    });
    act(() => {
      result.current.handleRefineStrokeCommit([
        { x: 0.25, y: 0.3 },
        { x: 0.375, y: 0.4 },
      ]);
    });
    act(() => {
      result.current.handleRefineBrushModeChange("erase");
    });
    act(() => {
      result.current.handleRefineStrokeCommit([{ x: 0.55, y: 0.6 }]);
    });
    act(() => {
      result.current.handleSaveRefinedMask();
    });

    await waitFor(() => {
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
});
