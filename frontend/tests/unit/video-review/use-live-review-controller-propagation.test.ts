// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import {
  createReviewState,
  createWorkspace,
  sampleVideo,
} from "./use-live-review-controller-test-helpers";

describe("useLiveReviewController propagation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
