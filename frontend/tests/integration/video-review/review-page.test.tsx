// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

const { liveReviewRenderSpy } = vi.hoisted(() => ({
  liveReviewRenderSpy: vi.fn(),
}));

vi.mock(
  "../../../src/features/video-review/components/live-review-screen",
  () => ({
    LiveReviewScreen: ({
      initialVideoId,
      onBackToLibrary,
    }: {
      initialVideoId?: string | null;
      onBackToLibrary?: () => void;
    }) => {
      liveReviewRenderSpy({ initialVideoId, onBackToLibrary });

      return (
        <div>
          <div>Initial video: {initialVideoId ?? "none"}</div>
          <button onClick={onBackToLibrary} type="button">
            Back to library
          </button>
        </div>
      );
    },
  }),
);

import { VideoReviewRoutePage } from "../../../src/features/video-review/pages/review-page";

describe("VideoReviewRoutePage", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

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
    const lastRender = liveReviewRenderSpy.mock.lastCall as
      | [
          {
            initialVideoId?: string | null;
            onBackToLibrary?: () => void;
          },
        ]
      | undefined;
    expect(lastRender).toBeDefined();
    if (lastRender === undefined) {
      throw new Error("Live review screen did not render.");
    }

    expect(lastRender[0].initialVideoId).toBe("video-route");
    expect(typeof lastRender[0].onBackToLibrary).toBe("function");
  });

  it("navigates back to the library route from the review route", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/review/video-route"]}>
        <Routes>
          <Route element={<VideoReviewRoutePage />} path="/review/:videoId" />
          <Route element={<div>Library route</div>} path="/" />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(
      await screen.findByRole("button", { name: "Back to library" }),
    );

    expect(await screen.findByText("Library route")).toBeInTheDocument();
  });
});
