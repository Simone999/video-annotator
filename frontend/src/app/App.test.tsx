// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseVideoReviewWorkspace } = vi.hoisted(() => ({
  mockUseVideoReviewWorkspace: vi.fn(() => {
    throw new Error("App should not render live review workspace by default.");
  }),
}));

vi.mock("../features/video-review", () => ({
  ExactFrameCanvas: () => null,
  getFrameAnnotationMaskUrl: vi.fn(),
  getIndexedVideoPlaybackUrl: vi.fn(),
  useVideoReviewWorkspace: mockUseVideoReviewWorkspace,
}));

import { App } from "./App";

describe("App", () => {
  beforeEach(() => {
    mockUseVideoReviewWorkspace.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders fixture-backed library shell by default", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("street_scene_014.mp4")).toBeInTheDocument();
    expect(mockUseVideoReviewWorkspace).not.toHaveBeenCalled();
  });

  it("proves shell workflow through default app host without live review wiring", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Open Review street_scene_014.mp4",
      }),
    );

    expect(
      await screen.findByRole("button", { name: "Back to Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Selected Object")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play fixture video" }),
    ).toBeInTheDocument();

    const inspector = screen.getByLabelText("Selected object inspector");
    expect(
      screen.getByRole("button", { name: "Select pedestrian_03" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(
      screen.getByRole("button", { name: "Select pedestrian_01" }),
    );

    expect(
      screen.getByRole("button", { name: "Select pedestrian_01" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(inspector).getByText("pedestrian_01")).toBeInTheDocument();
    expect(
      within(inspector).getByText("[288, 322, 442, 772]"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to Library" }));

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "street_scene_014.mp4" }),
    ).toHaveAttribute("data-selected", "true");

    await user.click(
      screen.getByRole("button", {
        name: "Open Review street_scene_014.mp4",
      }),
    );

    const reopenedInspector = await screen.findByLabelText(
      "Selected object inspector",
    );
    expect(
      screen.getByRole("button", { name: "Select pedestrian_01" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(reopenedInspector).getByText("pedestrian_01"),
    ).toBeInTheDocument();
    expect(mockUseVideoReviewWorkspace).not.toHaveBeenCalled();
  });
});
