// @vitest-environment jsdom

import { act } from "react";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import {
  createReviewState,
  createWorkspace,
  sampleVideo,
} from "./use-live-review-controller-test-helpers";

describe("useLiveReviewController object actions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
