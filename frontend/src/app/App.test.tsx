// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
  it("renders fixture-backed library shell by default", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("street_scene_014.mp4")).toBeInTheDocument();
    expect(mockUseVideoReviewWorkspace).not.toHaveBeenCalled();
  });
});
