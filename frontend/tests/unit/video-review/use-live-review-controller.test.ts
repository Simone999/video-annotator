// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { initialVideoReviewState } from "../../../src/features/video-review/state";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import {
  createReviewState,
  createWorkspace,
  sampleVideo,
} from "./use-live-review-controller-test-helpers";

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
      reviewState: createReviewState({
        annotation: {
          ...initialVideoReviewState.annotation,
          annotatedFrameIndices: [7, 12],
        },
        selectedVideo: sampleVideo,
      }),
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

  it("starts export download immediately and keeps backend review refresh", async () => {
    const refreshSelectedVideo = vi.fn(async () => {});
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ export_id: "export-123" }), {
        headers: {
          "content-type": "application/json",
        },
        status: 201,
      }),
    );

    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          refreshSelectedVideo,
          reviewState: createReviewState({
            selectedVideo: sampleVideo,
          }),
          selectionStatus: "idle",
        }),
      }),
    );

    act(() => {
      result.current.handleCreateExport();
    });

    await waitFor(() => {
      expect(refreshSelectedVideo).toHaveBeenCalledWith(sampleVideo.id);
    });
    await waitFor(() => {
      expect(result.current.exportDownloadUrl).toBe("/api/exports/export-123");
    });

    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
  });
});
