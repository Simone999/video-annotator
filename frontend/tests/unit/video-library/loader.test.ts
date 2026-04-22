import { afterEach, describe, expect, it, vi } from "vitest";

import type { VideoLibraryApiVideo } from "../../../src/features/video-library/api";

const { listVideoLibraryVideosMock } = vi.hoisted(() => ({
  listVideoLibraryVideosMock: vi.fn(),
}));

vi.mock("../../../src/features/video-library/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../src/features/video-library/api")
  >("../../../src/features/video-library/api");

  return {
    ...actual,
    listVideoLibraryVideos: listVideoLibraryVideosMock,
  };
});

import { loadVideoLibraryData } from "../../../src/features/video-library/loader";

describe("video library loader", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("maps all review states into summary metrics and operator-facing card copy", async () => {
    const videos: VideoLibraryApiVideo[] = [
      {
        display_name: "not-started.mp4",
        duration_seconds: 1.0,
        fps: 24,
        frame_count: 10,
        height: 720,
        id: "video-1",
        propagation_progress_percent: null,
        review_state: "not_started",
        review_summary: {
          annotated_frame_count: 0,
          imported_frame_count: 0,
          keyframe_count: 0,
          last_annotated_frame_idx: null,
          last_reviewed_frame_idx: null,
          manual_frame_count: 0,
          object_count: 0,
          propagated_frame_count: 0,
        },
        source_path: "   ",
        width: 1280,
      },
      {
        display_name: "started.mp4",
        duration_seconds: 1.0,
        fps: 24,
        frame_count: 20,
        height: 720,
        id: "video-2",
        propagation_progress_percent: null,
        review_state: "started",
        review_summary: {
          annotated_frame_count: 1,
          imported_frame_count: 1,
          keyframe_count: 1,
          last_annotated_frame_idx: 3,
          last_reviewed_frame_idx: 3,
          manual_frame_count: 1,
          object_count: 1,
          propagated_frame_count: 0,
        },
        source_path: "/tmp/review_batch/started.mp4",
        width: 1280,
      },
      {
        display_name: "in-progress.mp4",
        duration_seconds: 1.0,
        fps: 24,
        frame_count: 30,
        height: 1080,
        id: "video-3",
        propagation_progress_percent: 40,
        review_state: "in_progress",
        review_summary: {
          annotated_frame_count: 6,
          imported_frame_count: 1,
          keyframe_count: 2,
          last_annotated_frame_idx: 8,
          last_reviewed_frame_idx: 8,
          manual_frame_count: 2,
          object_count: 2,
          propagated_frame_count: 4,
        },
        source_path: "C:\\data\\clip-group\\in-progress.mp4",
        width: 1920,
      },
      {
        display_name: "ready.mp4",
        duration_seconds: 1.0,
        fps: 24,
        frame_count: 40,
        height: 1080,
        id: "video-4",
        propagation_progress_percent: null,
        review_state: "ready",
        review_summary: {
          annotated_frame_count: 8,
          imported_frame_count: 2,
          keyframe_count: 3,
          last_annotated_frame_idx: 11,
          last_reviewed_frame_idx: 11,
          manual_frame_count: 3,
          object_count: 2,
          propagated_frame_count: 5,
        },
        source_path: "/tmp/---/ready.mp4",
        width: 1920,
      },
      {
        display_name: "exported.mp4",
        duration_seconds: 1.0,
        fps: 24,
        frame_count: 50,
        height: 1080,
        id: "video-5",
        propagation_progress_percent: null,
        review_state: "exported",
        review_summary: {
          annotated_frame_count: 9,
          imported_frame_count: 2,
          keyframe_count: 3,
          last_annotated_frame_idx: 12,
          last_reviewed_frame_idx: 12,
          manual_frame_count: 3,
          object_count: 3,
          propagated_frame_count: 6,
        },
        source_path: "/tmp/exported-clips/exported.mp4",
        width: 1920,
      },
    ];
    listVideoLibraryVideosMock.mockResolvedValue(videos);

    const data = await loadVideoLibraryData();

    expect(data.summaryMetrics).toEqual([
      { label: "Total Videos", tone: "default", value: "5" },
      { label: "Started", tone: "primary", value: "1" },
      { label: "In Progress", tone: "secondary", value: "1" },
      { label: "Ready for Review", tone: "tertiary", value: "1" },
      { label: "Exported", tone: "default", value: "1" },
    ]);
    expect(data.videos).toEqual([
      {
        contextLine: "Local library",
        detailLine: "Not started yet",
        displayName: "not-started.mp4",
        fps: 24,
        frameCount: 10,
        id: "video-1",
        lastReviewedLabel: "Not Started",
        previewAlt: "Preview frame for not-started.mp4",
        previewImageUrl: "/api/videos/video-1/frame/0",
        propagationProgressPercent: null,
        resolution: {
          height: 720,
          width: 1280,
        },
        state: "not_started",
      },
      {
        contextLine: "Local folder · Review Batch",
        detailLine: "Imported: 1 object across 1 imported frame",
        displayName: "started.mp4",
        fps: 24,
        frameCount: 20,
        id: "video-2",
        lastReviewedLabel: "Frame 3",
        previewAlt: "Preview frame for started.mp4",
        previewImageUrl: "/api/videos/video-2/frame/3",
        propagationProgressPercent: null,
        resolution: {
          height: 720,
          width: 1280,
        },
        state: "started",
      },
      {
        contextLine: "Local folder · Clip Group",
        detailLine: "Propagation active: 2 objects across 6 annotated frames",
        displayName: "in-progress.mp4",
        fps: 24,
        frameCount: 30,
        id: "video-3",
        lastReviewedLabel: "Frame 8",
        previewAlt: "Preview frame for in-progress.mp4",
        previewImageUrl: "/api/videos/video-3/frame/8",
        propagationProgressPercent: 40,
        resolution: {
          height: 1080,
          width: 1920,
        },
        state: "in_progress",
      },
      {
        contextLine: "Local library",
        detailLine: "Ready: 2 objects across 8 annotated frames",
        displayName: "ready.mp4",
        fps: 24,
        frameCount: 40,
        id: "video-4",
        lastReviewedLabel: "Frame 11",
        previewAlt: "Preview frame for ready.mp4",
        previewImageUrl: "/api/videos/video-4/frame/11",
        propagationProgressPercent: null,
        resolution: {
          height: 1080,
          width: 1920,
        },
        state: "ready",
      },
      {
        contextLine: "Local folder · Exported Clips",
        detailLine: "Exported: 3 objects across 9 annotated frames",
        displayName: "exported.mp4",
        fps: 24,
        frameCount: 50,
        id: "video-5",
        lastReviewedLabel: "Frame 12",
        previewAlt: "Preview frame for exported.mp4",
        previewImageUrl: "/api/videos/video-5/frame/12",
        propagationProgressPercent: null,
        resolution: {
          height: 1080,
          width: 1920,
        },
        state: "exported",
      },
    ]);
  });
});
