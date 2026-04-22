// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { VideoLibraryData } from "../../../src/features/video-library/types";

const { loadVideoLibraryDataMock } = vi.hoisted(() => ({
  loadVideoLibraryDataMock: vi.fn(),
}));

vi.mock("../../../src/features/video-library/loader", () => ({
  loadVideoLibraryData: loadVideoLibraryDataMock,
}));

import { useVideoLibraryRouteData } from "../../../src/features/video-library/hooks/use-video-library-route-data";

const sampleData: VideoLibraryData = {
  summaryMetrics: [
    {
      label: "Total Videos",
      tone: "default",
      value: "2",
    },
  ],
  videos: [
    {
      contextLine: "fixture / one",
      detailLine: "Masks: 2 objects",
      displayName: "alpha.mp4",
      fps: 24,
      frameCount: 240,
      id: "video-alpha",
      lastReviewedLabel: "Frame 12",
      previewAlt: "alpha preview",
      previewImageUrl: "data:image/svg+xml,%3Csvg/%3E",
      propagationProgressPercent: null,
      resolution: {
        height: 1080,
        width: 1920,
      },
      state: "ready",
    },
    {
      contextLine: "fixture / two",
      detailLine: "Masks: 1 object",
      displayName: "beta.mp4",
      fps: 24,
      frameCount: 120,
      id: "video-beta",
      lastReviewedLabel: "Frame 4",
      previewAlt: "beta preview",
      previewImageUrl: "data:image/svg+xml,%3Csvg/%3E",
      propagationProgressPercent: null,
      resolution: {
        height: 720,
        width: 1280,
      },
      state: "not_started",
    },
  ],
};

describe("useVideoLibraryRouteData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads library data and defaults selection to first video", async () => {
    loadVideoLibraryDataMock.mockResolvedValue(sampleData);

    const { result } = renderHook(() => useVideoLibraryRouteData());

    await waitFor(() => {
      expect(result.current.libraryData).toEqual(sampleData);
    });

    expect(result.current.loadError).toBeNull();
    expect(result.current.selectedVideoId).toBe("video-alpha");
    expect(result.current.selectedVideo?.id).toBe("video-alpha");
  });

  it("surfaces load failure as route-level error state", async () => {
    loadVideoLibraryDataMock.mockRejectedValue(new Error("Library broke"));

    const { result } = renderHook(() => useVideoLibraryRouteData());

    await waitFor(() => {
      expect(result.current.loadError).toBe("Library broke");
    });

    expect(result.current.libraryData).toBeNull();
    expect(result.current.selectedVideo).toBeNull();
  });

  it("keeps selection empty when library data has no videos", async () => {
    loadVideoLibraryDataMock.mockResolvedValue({
      summaryMetrics: sampleData.summaryMetrics,
      videos: [],
    });

    const { result } = renderHook(() => useVideoLibraryRouteData());

    await waitFor(() => {
      expect(result.current.libraryData?.videos).toEqual([]);
    });

    expect(result.current.selectedVideoId).toBeNull();
    expect(result.current.selectedVideo).toBeNull();

    act(() => {
      result.current.setSelectedVideoId("video-missing");
    });

    expect(result.current.selectedVideo).toBeNull();
  });

  it("falls back to default error copy for non-Error rejections", async () => {
    loadVideoLibraryDataMock.mockRejectedValue("boom");

    const { result } = renderHook(() => useVideoLibraryRouteData());

    await waitFor(() => {
      expect(result.current.loadError).toBe(
        "Library summaries failed to load.",
      );
    });

    expect(result.current.libraryData).toBeNull();
  });
});
