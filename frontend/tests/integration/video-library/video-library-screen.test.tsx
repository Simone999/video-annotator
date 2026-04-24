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
    state: null,
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
  it("uses the screenshot-aligned library shell without the shared app rail", () => {
    render(
      <VideoLibraryScreen
        onOpenReview={() => {}}
        onSelectVideo={() => {}}
        selectedVideoId={null}
        summaryMetrics={[
          {
            label: "Total Videos",
            state: null,
            value: "12",
          },
          {
            label: "Started",
            state: "started",
            value: "3",
          },
          {
            label: "In Progress",
            state: "in_progress",
            value: "2",
          },
          {
            label: "Ready for Review",
            state: "ready",
            value: "1",
          },
          {
            label: "Exported",
            state: "exported",
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

    const shell = screen.getByRole("banner").parentElement;
    const header = screen.getByRole("banner");

    expect(shell).toHaveAttribute("data-state-palette", "library");
    expect(shell).toHaveClass("state-palette-scope");
    expect(header).toHaveClass(
      "bg-slate-950/80",
      "bg-slate-900",
      "font-['Inter']",
      "tabular-nums",
    );
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Library summary" })).toHaveClass(
      "mb-6",
      "w-full",
      "border-b",
      "border-t",
      "border-outline-variant/20",
    );
    expect(
      screen.getByRole("region", { name: "Library filters" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Library videos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "progress_video.mp4" }),
    ).toHaveClass("video-card-shell", "stateful-card");
    expect(
      screen.getByText(
        "Browse local videos, choose work, and open a video for annotation review.",
      ),
    ).toBeInTheDocument();

    const main = screen.getByRole("main");
    const mainWrapper = main.parentElement;
    const heading = screen.getByRole("heading", { name: "Video Library" });
    const summary = screen.getByRole("list", { name: "Library summary" });
    const filters = screen.getByRole("region", { name: "Library filters" });
    const videos = screen.getByRole("region", { name: "Library videos" });

    expect(
      heading.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      summary.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      filters.compareDocumentPosition(videos) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(main.className).not.toContain("lg:ml-16");
    expect(main.firstElementChild?.className).not.toContain("max-w");
    expect(mainWrapper).toHaveClass("flex", "flex-1", "pt-12", "h-full", "relative");
    expect(main).toHaveClass("flex-1", "p-6", "lg:p-8", "text-on-surface");
    expect(main.className).not.toContain("pt-20");
  });

  it("keeps topbar chrome compact and leaves search in the filter row", () => {
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
      screen.queryByRole("textbox", { name: "Search library navigation" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Filter library videos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Library settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sort videos by recent activity" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Open Review / }),
    ).not.toBeInTheDocument();

    expect(
      screen
        .getByRole("button", { name: "Library settings" })
        .querySelector(".material-symbol"),
    ).toHaveClass("text-[24px]");

    const searchInput = screen.getByRole("textbox", {
      name: "Filter library videos",
    });
    expect(searchInput.parentElement?.tagName).toBe("DIV");
    expect(searchInput.parentElement).toHaveClass(
      "relative",
      "flex",
      "items-center",
      "bg-surface-container-low",
      "px-3",
      "h-11",
    );
    expect(searchInput).toHaveClass(
      "appearance-none",
      "border-none",
      "bg-transparent",
      "p-0",
      "text-sm",
      "text-on-surface",
      "placeholder-on-surface-variant",
      "placeholder:text-slate-500",
    );
    expect(searchInput.previousElementSibling).toHaveClass(
      "mr-2",
      "text-sm",
      "text-on-surface-variant",
      "text-slate-500",
    );
    expect(
      screen.getByRole("button", { name: "Filter videos by status" }),
    ).toHaveClass(
      "flex",
      "text-sm",
      "text-on-surface",
    );
    expect(
      screen.getByRole("button", { name: "Sort videos by recent activity" }),
    ).toHaveClass(
      "flex",
      "text-sm",
      "text-on-surface",
    );

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

  it("renders state-based summary tiles while total videos stays neutral", () => {
    render(
      <VideoLibraryScreen
        onOpenReview={() => {}}
        onSelectVideo={() => {}}
        selectedVideoId={null}
        summaryMetrics={[
          {
            label: "Total Videos",
            state: null,
            value: "12",
          },
          {
            label: "Exported",
            state: "exported",
            value: "6",
          },
        ]}
        videos={[]}
      />,
    );

    const totalTile = screen.getByText("Total Videos").closest("li");
    const exportedTile = screen.getByText("Exported").closest("li");
    const totalLabel = screen.getByText("Total Videos");
    const totalValue = screen.getByText("12");
    const exportedValue = screen.getByText("6");

    expect(totalTile).not.toHaveAttribute("data-state");
    expect(exportedTile).toHaveAttribute("data-state", "exported");
    expect(totalTile).toHaveClass(
      "bg-surface-container-low",
      "p-4",
      "flex",
      "flex-col",
      "justify-center",
    );
    expect(exportedTile).toHaveClass(
      "state-context",
      "bg-surface-container-low",
      "p-4",
      "flex",
      "flex-col",
      "justify-center",
    );
    expect(totalLabel).toHaveClass("font-label", "text-xs", "tracking-widest");
    expect(totalValue).toHaveClass("text-on-surface", "tabular-nums");
    expect(exportedValue).toHaveClass("state-color", "tabular-nums");
  });
});
