// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

const { liveReviewRenderSpy } = vi.hoisted(() => ({
  liveReviewRenderSpy: vi.fn(),
}));

vi.mock("../components/live-review-screen", () => ({
  LiveReviewScreen: ({
    initialVideoId,
  }: {
    initialVideoId?: string | null;
  }) => {
    liveReviewRenderSpy({ initialVideoId });

    return <div>Initial video: {initialVideoId ?? "none"}</div>;
  },
}));

import { VideoReviewRoutePage } from "./review-page";

describe("VideoReviewRoutePage", () => {
  it("reads video id from route params and passes it into live review adapter", async () => {
    render(
      <MemoryRouter initialEntries={["/review/video-route"]}>
        <Routes>
          <Route element={<VideoReviewRoutePage />} path="/review/:videoId" />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Initial video: video-route"),
    ).toBeInTheDocument();
    expect(liveReviewRenderSpy).toHaveBeenCalledWith({
      initialVideoId: "video-route",
    });
  });
});
