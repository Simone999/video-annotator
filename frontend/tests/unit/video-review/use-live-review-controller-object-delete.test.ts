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

it("runs whole-object delete then reloads current frame", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation(
    (input: RequestInfo | URL) => {
      const url =
        input instanceof URL
          ? input.toString()
          : typeof input === "string"
            ? input
            : input.url;

      if (url.includes("/api/videos/video-123/objects/object-1/summary")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              bbox_xyxy_px: [384, 270, 960, 648],
              label: "pedestrian_01",
              mask_confidence: 0.91,
              object_id: "object-1",
              track_summary: {
                corrected: 1,
                frames: 35,
                propagated: 2,
              },
              video_id: "video-123",
            }),
            {
              headers: {
                "content-type": "application/json",
              },
              status: 200,
            },
          ),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    },
  );

  const deleteObjectTrack = vi.fn(async () => {});
  const loadExactFrame = vi.fn(async () => {});
  const workspace: VideoReviewWorkspace = {
    activeVideoId: null,
    cancelSam2PropagationJob: vi.fn(async () => {}),
    closeSam2Session: vi.fn(async () => {}),
    createObject: vi.fn(async () => {}),
    createSam2Session: vi.fn(async () => {}),
    deleteFrameAnnotationMask: vi.fn(async () => {}),
    deleteManualAnnotation: vi.fn(async () => {}),
    deleteObjectMasks: vi.fn(async () => {}),
    deleteObjectTrack,
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
    refreshSelectedVideo: vi.fn(async () => {}),
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
          {
            color: "#ffaa00",
            id: "object-2",
            label: "cyclist_02",
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
    result.current.handleDeleteObjectTrack();
  });

  await waitFor(() => {
    expect(deleteObjectTrack).toHaveBeenCalledWith({
      objectId: "object-1",
    });
  });
  await waitFor(() => {
    expect(loadExactFrame).toHaveBeenCalledWith(7);
  });
});
