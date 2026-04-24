// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";

type LiveReviewRenderProps = {
  initialVideoId?: string | null;
  onBackToLibrary: () => void;
};

const { liveReviewRenderSpy, navigateSpy } = vi.hoisted(() => ({
  liveReviewRenderSpy: vi.fn<(props: LiveReviewRenderProps) => void>(),
  navigateSpy: vi.fn(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

vi.mock(
  "../../../src/features/video-review/components/live-review-screen",
  () => ({
    LiveReviewScreen: ({
      initialVideoId,
      onBackToLibrary,
    }: {
      initialVideoId?: string | null;
      onBackToLibrary: () => void;
    }) => {
      liveReviewRenderSpy({ initialVideoId, onBackToLibrary });
      return (
        <button type="button" onClick={onBackToLibrary}>
          Return to library
        </button>
      );
    },
  }),
);

import { VideoReviewRoutePage } from "../../../src/features/video-review/pages/review-page";

afterEach(() => {
  cleanup();
  liveReviewRenderSpy.mockClear();
  navigateSpy.mockClear();
});

describe("VideoReviewRoutePage", () => {
  it("passes route video id into live review screen and navigates back to library", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/review/video-123"]}>
        <Routes>
          <Route element={<VideoReviewRoutePage />} path="/review/:videoId" />
        </Routes>
      </MemoryRouter>,
    );

    expect(liveReviewRenderSpy).toHaveBeenCalledTimes(1);
    const [props] = liveReviewRenderSpy.mock.calls[0];
    expect(props.initialVideoId).toBe("video-123");
    expect(typeof props.onBackToLibrary).toBe("function");

    await user.click(screen.getByRole("button", { name: "Return to library" }));
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });
});
