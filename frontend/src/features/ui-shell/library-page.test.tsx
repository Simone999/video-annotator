// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { UiShellLibraryPage } from "./library-page";
import type { UiShellSummaryMetric, UiShellVideo } from "./types";

afterEach(() => {
  cleanup();
});

const summaryMetrics: UiShellSummaryMetric[] = [
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
  state: UiShellVideo["state"];
}): UiShellVideo {
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
    review: {
      currentFrame: 12,
      manualMarkerPercents: [20],
      missingMarkerPercent: 48,
      objectCountLabel: "1 OBJ",
      objects: [
        {
          bboxLabel: "[1, 2, 3, 4]",
          boxState: "present",
          classLabel: "Fixture",
          confidenceLabel: "0.90",
          id: "fixture_01",
          maskState: "present",
          stageOverlay: null,
          visible: true,
        },
      ],
      rangeEnd: 24,
      rangeStart: 12,
      selectedObjectId: "fixture_01",
      thumbnails: [],
      timelineCursorPercent: 20,
      timelineRangeEndPercent: 48,
      timelineRangeStartPercent: 20,
      trackCorrected: 0,
      trackFrames: 12,
      trackPropagated: 12,
    },
    resolution: {
      height: 1080,
      width: 1920,
    },
    state,
  };
}

describe("UiShellLibraryPage", () => {
  it("shows propagation progress only for in-progress videos and uses actual percent", () => {
    render(
      <UiShellLibraryPage
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
