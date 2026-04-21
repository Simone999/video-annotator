// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VideoLibraryScreen } from "./components/video-library-screen";
import type { VideoLibrarySummaryMetric, VideoLibraryVideo } from "./types";

afterEach(() => {
  cleanup();
});

const summaryMetrics: VideoLibrarySummaryMetric[] = [
  {
    label: "Total Videos",
    tone: "default",
    value: "2",
  },
];

function createVideo({
  displayName,
  id,
  propagationProgressPercent,
  state,
}: {
  displayName: string;
  id: string;
  propagationProgressPercent: number | null;
  state: VideoLibraryVideo["state"];
}): VideoLibraryVideo {
  return {
    contextLine: "fixture / test",
    detailLine: "Masks: 2 objects",
    displayName,
    fps: 24,
    frameCount: 240,
    id,
    lastReviewedLabel: "Frame 12",
    previewAlt: `${displayName} preview`,
    previewImageUrl: "data:image/svg+xml,%3Csvg/%3E",
    propagationProgressPercent,
    resolution: {
      height: 1080,
      width: 1920,
    },
    state,
  };
}

describe("VideoLibraryScreen", () => {
  it("shows propagation progress only for in-progress videos and uses actual percent", () => {
    render(
      <VideoLibraryScreen
        onOpenReview={() => {}}
        onSelectVideo={() => {}}
        selectedVideoId={null}
        summaryMetrics={summaryMetrics}
        videos={[
          createVideo({
            displayName: "ready_video.mp4",
            id: "ready",
            propagationProgressPercent: 42,
            state: "ready",
          }),
          createVideo({
            displayName: "progress_video.mp4",
            id: "progress",
            propagationProgressPercent: 55,
            state: "in_progress",
          }),
        ]}
      />,
    );

    const readyCard = screen.getByRole("article", { name: "ready_video.mp4" });
    expect(
      within(readyCard).queryByLabelText(
        "Propagation completion ready_video.mp4 42 percent",
      ),
    ).not.toBeInTheDocument();
    expect(
      within(readyCard).queryByText("Propagation completion: 42%"),
    ).not.toBeInTheDocument();

    const progressCard = screen.getByRole("article", {
      name: "progress_video.mp4",
    });
    expect(
      within(progressCard).getByText("Propagation completion: 55%"),
    ).toBeInTheDocument();
    expect(
      within(progressCard).getByLabelText(
        "Propagation completion progress_video.mp4 55 percent",
      ),
    ).toBeInTheDocument();
  });
});
