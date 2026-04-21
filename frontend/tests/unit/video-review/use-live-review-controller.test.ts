// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
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

function createWorkspace(options?: {
  indexedVideos?: VideoReviewWorkspace["indexedVideos"];
  listStatus?: VideoReviewWorkspace["listStatus"];
  loadExactFrame?: VideoReviewWorkspace["loadExactFrame"];
  reviewState?: VideoReviewState;
  selectVideo?: VideoReviewWorkspace["selectVideo"];
  selectionStatus?: VideoReviewWorkspace["selectionStatus"];
}): VideoReviewWorkspace {
  return {
    activeVideoId: null,
    cancelSam2PropagationJob: vi.fn(async () => {}),
    createObject: vi.fn(async () => {}),
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
    startSam2Propagation: vi.fn(async () => {}),
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
});
