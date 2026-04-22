// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VideoLibraryScreen } from "../../../src/features/video-library/components/video-library-screen";
import type {
  VideoLibrarySummaryMetric,
  VideoLibraryVideo,
} from "../../../src/features/video-library/types";

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
  it("uses the authoritative library chrome shell with fixed header and rail layout", () => {
    render(
      <VideoLibraryScreen
        onOpenReview={() => {}}
        onSelectVideo={() => {}}
        selectedVideoId={null}
        summaryMetrics={[
          {
            label: "Total Videos",
            tone: "default",
            value: "12",
          },
          {
            label: "Started",
            tone: "primary",
            value: "3",
          },
          {
            label: "In Progress",
            tone: "secondary",
            value: "2",
          },
          {
            label: "Ready for Review",
            tone: "tertiary",
            value: "1",
          },
          {
            label: "Exported",
            tone: "default",
            value: "6",
          },
        ]}
        videos={[
          createVideo({
            displayName: "progress_video.mp4",
            id: "progress",
            propagationProgressPercent: 55,
            state: "in_progress",
          }),
        ]}
      />,
    );

    expect(screen.getByRole("banner").className).toContain("fixed");
    expect(screen.getByRole("banner").className).toContain("top-0");
    expect(screen.getByRole("banner").className).toContain("w-full");

    const primaryNav = screen.getByRole("navigation", { name: "Primary" });
    expect(primaryNav.className).toContain("fixed");
    expect(primaryNav.className).toContain("w-16");
    expect(primaryNav.className).toContain("focus-within:w-64");

    expect(screen.getByRole("main").className).toContain("lg:ml-16");
    expect(
      screen.getByRole("list", { name: "Library summary" }).className,
    ).toContain("gap-px");

    expect(
      screen.getByRole("button", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Videos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Exported" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Local Status" }),
    ).toBeInTheDocument();
  });

  it("keeps chrome controls accessible without raw icon fallback text", () => {
    render(
      <VideoLibraryScreen
        onOpenReview={() => {}}
        onSelectVideo={() => {}}
        selectedVideoId={null}
        summaryMetrics={summaryMetrics}
        videos={[
          createVideo({
            displayName: "progress_video.mp4",
            id: "progress",
            propagationProgressPercent: 55,
            state: "in_progress",
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("textbox", { name: "Search library navigation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Filter library videos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Library settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sort videos by recent activity" }),
    ).toBeInTheDocument();

    expect(screen.queryByText(/^search$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^settings$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^expand_more$/)).not.toBeInTheDocument();
  });

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
