// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VideoLibraryVideoCard } from "../../../src/features/video-library/components/video-library-video-card";
import type { VideoLibraryVideo } from "../../../src/features/video-library/types";

const baseVideo: VideoLibraryVideo = {
  contextLine: "Local folder · Review Batch",
  detailLine: "Ready: 2 objects across 8 annotated frames",
  displayName: "ready.mp4",
  fps: 24,
  frameCount: 1234,
  id: "video-1",
  lastReviewedLabel: "Frame 8",
  previewAlt: "Preview frame for ready.mp4",
  previewImageUrl: "/api/videos/video-1/frame/8",
  propagationProgressPercent: null,
  resolution: {
    height: 1080,
    width: 1920,
  },
  state: "ready",
};

describe("VideoLibraryVideoCard", () => {
  afterEach(() => {
    cleanup();
  });

  it.each([
    ["not_started", "Not Started"],
    ["started", "Started"],
    ["in_progress", "In Progress"],
    ["ready", "Ready"],
    ["exported", "Exported"],
  ] as const)(
    "renders state label and generic state-driven styling hooks for %s cards",
    (state, label) => {
      render(
        <VideoLibraryVideoCard
          isSelected={state === "ready"}
          onOpenReview={vi.fn()}
          onSelectVideo={vi.fn()}
          video={{
            ...baseVideo,
            detailLine: `${label} detail`,
            propagationProgressPercent: state === "in_progress" ? 40 : null,
            state,
          }}
        />,
      );

      const card = screen.getByRole("article", { name: baseVideo.displayName });

      expect(card).toHaveAttribute("data-selected", String(state === "ready"));
      expect(card).toHaveAttribute("data-state", state);
      expect(card).toHaveClass("stateful-card");
      expect(
        screen.getByTestId(`video-card-accent-${baseVideo.id}`),
      ).toHaveClass("video-card-accent", "state-fill");
      expect(
        screen.getByTestId(`video-card-badge-${baseVideo.id}`),
      ).toHaveClass("video-card-badge", "state-border", "tabular-nums");
      expect(screen.getByAltText(baseVideo.previewAlt)).toHaveClass("h-40");
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(`${label} detail`)).toBeInTheDocument();
    },
  );

  it("shows propagation progress only for in-progress videos with numeric progress", () => {
    const { rerender } = render(
      <VideoLibraryVideoCard
        isSelected={false}
        onOpenReview={vi.fn()}
        onSelectVideo={vi.fn()}
        video={{
          ...baseVideo,
          detailLine: "Propagation active: 2 objects across 6 annotated frames",
          propagationProgressPercent: 40,
          state: "in_progress",
        }}
      />,
    );

    expect(
      screen.getByLabelText("Propagation completion ready.mp4 40 percent"),
    ).toBeInTheDocument();
    expect(screen.getByText("Propagation completion: 40%")).toBeInTheDocument();

    rerender(
      <VideoLibraryVideoCard
        isSelected={false}
        onOpenReview={vi.fn()}
        onSelectVideo={vi.fn()}
        video={{
          ...baseVideo,
          propagationProgressPercent: null,
          state: "in_progress",
        }}
      />,
    );

    expect(
      screen.queryByLabelText("Propagation completion ready.mp4 40 percent"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Progress hidden until in_progress"),
    ).toBeInTheDocument();
  });

  it("formats resolution and frame count and triggers card actions", async () => {
    const user = userEvent.setup();
    const onOpenReview = vi.fn();
    const onSelectVideo = vi.fn();

    render(
      <VideoLibraryVideoCard
        isSelected={false}
        onOpenReview={onOpenReview}
        onSelectVideo={onSelectVideo}
        video={baseVideo}
      />,
    );

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("1920×1080")).toBeInTheDocument();
    expect(screen.getByAltText(baseVideo.previewAlt)).toHaveAttribute(
      "src",
      baseVideo.previewImageUrl,
    );
    expect(screen.getByText(baseVideo.displayName)).toHaveClass(
      "text-on-surface",
      "leading-tight",
    );
    expect(screen.getByText(baseVideo.contextLine)).toHaveClass(
      "text-on-surface-variant",
    );
    expect(screen.getByText("Frames")).toHaveClass("text-on-surface-variant");
    expect(screen.getByText("1,234")).toHaveClass(
      "text-on-surface",
      "tabular-nums",
    );
    expect(screen.getByText("24")).toHaveClass("text-on-surface", "tabular-nums");
    expect(screen.getByText("Frame 8")).toHaveClass(
      "text-on-surface",
      "tabular-nums",
    );
    expect(screen.getByText(baseVideo.detailLine).parentElement).toHaveClass(
      "text-on-surface-variant",
      "mt-1",
    );
    expect(
      screen.getByRole("button", {
        name: `More actions for ${baseVideo.displayName}`,
      }),
    ).toHaveClass("text-on-surface-variant");
    expect(
      screen
        .getByRole("button", {
          name: `More actions for ${baseVideo.displayName}`,
        })
        .querySelector(".material-symbol"),
    ).toHaveClass("text-lg");

    await user.click(
      screen.getByRole("button", {
        name: `More actions for ${baseVideo.displayName}`,
      }),
    );
    await user.click(screen.getByRole("article", { name: baseVideo.displayName }));

    expect(onSelectVideo).toHaveBeenCalledWith(baseVideo.id);
    expect(onOpenReview).toHaveBeenCalledWith(baseVideo.id);
  });

  it("treats exported previews like the HTML contract", () => {
    render(
      <VideoLibraryVideoCard
        isSelected={false}
        onOpenReview={vi.fn()}
        onSelectVideo={vi.fn()}
        video={{
          ...baseVideo,
          state: "exported",
        }}
      />,
    );

    expect(screen.getByAltText(baseVideo.previewAlt)).toHaveClass(
      "opacity-40",
      "grayscale",
    );
  });

  it("uses HTML-equivalent progress row typography and track colors", () => {
    render(
      <VideoLibraryVideoCard
        isSelected={false}
        onOpenReview={vi.fn()}
        onSelectVideo={vi.fn()}
        video={{
          ...baseVideo,
          detailLine: "Masks: 14 objects",
          displayName: "progress.mp4",
          propagationProgressPercent: 68,
          state: "in_progress",
        }}
      />,
    );

    expect(screen.getByText("Masks: 14 objects").parentElement).toHaveClass(
      "mt-1",
      "text-on-surface-variant",
    );
    expect(screen.getByText("Propagation completion: 68%")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Propagation completion progress.mp4 68 percent"),
    ).toHaveClass("bg-surface-container-highest");
  });
});
