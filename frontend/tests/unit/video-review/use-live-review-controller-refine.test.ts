// @vitest-environment jsdom

import { act } from "react";
import { renderHook } from "@testing-library/react";
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

describe("useLiveReviewController mask refine", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("switches refine brush modes from keyboard shortcuts on paused saved-mask frame", () => {
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
      selectionStatus: "ready",
    });
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace,
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
});
