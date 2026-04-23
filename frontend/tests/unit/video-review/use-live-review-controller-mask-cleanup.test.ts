// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  initialSam2WorkspaceState,
  initialVideoReviewState,
} from "../../../src/features/video-review/state";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";

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

it("runs whole-object cleanup then reloads current frame", async () => {
  const deleteObjectMasks = vi.fn(async () => {});
  const loadExactFrame = vi.fn(async () => {});
  const workspace: VideoReviewWorkspace = {
    activeVideoId: null,
    cancelSam2PropagationJob: vi.fn(async () => {}),
    closeSam2Session: vi.fn(async () => {}),
    createObject: vi.fn(async () => {}),
    createSam2Session: vi.fn(async () => {}),
    deleteFrameAnnotationMask: vi.fn(async () => {}),
    deleteManualAnnotation: vi.fn(async () => {}),
    deleteObjectMasks,
    errorMessage: null,
    exactFrame: {
      blob: new Blob(["frame-7"]),
      mediaType: "image/png",
    },
    exactFrameErrorMessage: null,
    exactFrameStatus: "ready",
    indexedVideos: [],
    listStatus: "ready",
    loadExactFrame,
    refreshSam2PropagationJob: vi.fn(async () => {}),
    reviewState: {
      ...initialVideoReviewState,
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
    },
    runSam2PromptBox: vi.fn(async () => {}),
    runSam2RefineMask: vi.fn(async () => {}),
    saveManualAnnotation: vi.fn(async () => {}),
    selectVideo: vi.fn(async () => {}),
    selectionStatus: "ready",
    setSam2DraftBox: vi.fn(),
    setSam2SelectedObject: vi.fn(),
    startSam2Propagation: vi.fn(async () => {}),
  };

  const { result } = renderHook(() =>
    useLiveReviewController({
      initialVideoId: null,
      workspace,
    }),
  );

  act(() => {
    result.current.handleDeleteObjectMasks();
  });

  await waitFor(() => {
    expect(deleteObjectMasks).toHaveBeenCalledWith({
      objectId: "object-1",
    });
  });
  await waitFor(() => {
    expect(loadExactFrame).toHaveBeenCalledWith(7);
  });
});
