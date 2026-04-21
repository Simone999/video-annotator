// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
          <p>Live review harness</p>
          <p>Initial video: {initialVideoId ?? "none"}</p>
          {onBackToLibrary ? (
            <button type="button" onClick={onBackToLibrary}>
              Return to library
            </button>
          ) : null}
        </div>
      );
    },
  }),
);

import { App } from "../../../src/app/App";

function createJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
    },
    status: 200,
  });
}

describe("App", () => {
  beforeEach(() => {
    liveReviewRenderSpy.mockClear();
    vi.stubGlobal("fetch", vi.fn());
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders live library route from backend review summaries by default", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createJsonResponse([
        {
          display_name: "alpha_ready.mp4",
          duration_seconds: 5.0,
          fps: 24,
          frame_count: 120,
          height: 360,
          id: "video-alpha",
          propagation_progress_percent: null,
          review_state: "ready",
          review_summary: {
            annotated_frame_count: 3,
            imported_frame_count: 0,
            keyframe_count: 1,
            last_annotated_frame_idx: 24,
            last_reviewed_frame_idx: 24,
            manual_frame_count: 1,
            object_count: 2,
            propagated_frame_count: 1,
          },
          source_path: "/tmp/videos/ready/alpha_ready.mp4",
          width: 640,
        },
        {
          display_name: "beta_progress.mp4",
          duration_seconds: 10.0,
          fps: 30,
          frame_count: 240,
          height: 720,
          id: "video-beta",
          propagation_progress_percent: 50,
          review_state: "in_progress",
          review_summary: {
            annotated_frame_count: 4,
            imported_frame_count: 0,
            keyframe_count: 1,
            last_annotated_frame_idx: 88,
            last_reviewed_frame_idx: 80,
            manual_frame_count: 1,
            object_count: 1,
            propagated_frame_count: 2,
          },
          source_path: "/tmp/videos/progress/beta_progress.mp4",
          width: 1280,
        },
      ]),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("alpha_ready.mp4")).toBeInTheDocument();
    expect(screen.queryByText("street_scene_014.mp4")).not.toBeInTheDocument();
    const summary = screen.getByRole("list", { name: "Library summary" });
    expect(within(summary).getByText("Total Videos")).toBeInTheDocument();
    expect(within(summary).getByText("2")).toBeInTheDocument();
    expect(within(summary).getByText("In Progress")).toBeInTheDocument();
    expect(within(summary).getAllByText("1")).not.toHaveLength(0);
    expect(within(summary).getByText("Ready for Review")).toBeInTheDocument();
  });

  it("uses operator-facing card copy instead of raw source paths on library route", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createJsonResponse([
        {
          display_name: "alpha_ready.mp4",
          duration_seconds: 5.0,
          fps: 24,
          frame_count: 120,
          height: 360,
          id: "video-alpha",
          propagation_progress_percent: null,
          review_state: "ready",
          review_summary: {
            annotated_frame_count: 3,
            imported_frame_count: 0,
            keyframe_count: 1,
            last_annotated_frame_idx: 24,
            last_reviewed_frame_idx: 24,
            manual_frame_count: 1,
            object_count: 2,
            propagated_frame_count: 1,
          },
          source_path: "/tmp/videos/ready/alpha_ready.mp4",
          width: 640,
        },
      ]),
    );

    render(<App />);

    const readyCard = await screen.findByRole("article", {
      name: "alpha_ready.mp4",
    });

    expect(within(readyCard).getByText("Ready")).toBeInTheDocument();
    expect(
      within(readyCard).getByText("Local folder · Ready"),
    ).toBeInTheDocument();
    expect(
      within(readyCard).queryByText("/tmp/videos/ready"),
    ).not.toBeInTheDocument();
    expect(within(readyCard).getByText("Frame 24")).toBeInTheDocument();
    expect(
      within(readyCard).getByText("Ready: 2 objects across 3 annotated frames"),
    ).toBeInTheDocument();
  });

  it("uses backend frame previews from last reviewed frame or frame zero", async () => {
    vi.mocked(fetch).mockResolvedValue(
      createJsonResponse([
        {
          display_name: "alpha_ready.mp4",
          duration_seconds: 5.0,
          fps: 24,
          frame_count: 120,
          height: 360,
          id: "video-alpha",
          propagation_progress_percent: null,
          review_state: "ready",
          review_summary: {
            annotated_frame_count: 3,
            imported_frame_count: 0,
            keyframe_count: 1,
            last_annotated_frame_idx: 24,
            last_reviewed_frame_idx: 24,
            manual_frame_count: 1,
            object_count: 2,
            propagated_frame_count: 1,
          },
          source_path: "/tmp/videos/ready/alpha_ready.mp4",
          width: 640,
        },
        {
          display_name: "beta_progress.mp4",
          duration_seconds: 10.0,
          fps: 30,
          frame_count: 240,
          height: 720,
          id: "video-beta",
          propagation_progress_percent: 50,
          review_state: "in_progress",
          review_summary: {
            annotated_frame_count: 4,
            imported_frame_count: 0,
            keyframe_count: 1,
            last_annotated_frame_idx: 88,
            last_reviewed_frame_idx: null,
            manual_frame_count: 1,
            object_count: 1,
            propagated_frame_count: 2,
          },
          source_path: "/tmp/videos/progress/beta_progress.mp4",
          width: 1280,
        },
      ]),
    );

    render(<App />);

    const readyPreview = await screen.findByRole("img", {
      name: "Preview frame for alpha_ready.mp4",
    });
    expect(readyPreview).toHaveAttribute(
      "src",
      "/api/videos/video-alpha/frame/24",
    );
    expect(readyPreview.getAttribute("src")).not.toContain("data:image");

    const progressPreview = screen.getByRole("img", {
      name: "Preview frame for beta_progress.mp4",
    });
    expect(progressPreview).toHaveAttribute(
      "src",
      "/api/videos/video-beta/frame/0",
    );

    const progressCard = screen.getByRole("article", {
      name: "beta_progress.mp4",
    });
    expect(within(progressCard).getByText("In Progress")).toBeInTheDocument();
    expect(
      within(progressCard).getByLabelText(
        "Propagation completion beta_progress.mp4 50 percent",
      ),
    ).toBeInTheDocument();
  });

  it("shows empty-library copy when backend returns no indexed videos", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse([]));

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No indexed videos yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add local videos to backend catalog, then reload library.",
      ),
    ).toBeInTheDocument();
  });

  it("shows live-library load failures on default host", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Backend unavailable."));

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Library load failed" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Backend unavailable.")).toBeInTheDocument();
  });

  it("navigates from library route to review route with selected backend video id", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      createJsonResponse([
        {
          display_name: "alpha_ready.mp4",
          duration_seconds: 5.0,
          fps: 24,
          frame_count: 120,
          height: 360,
          id: "video-alpha",
          propagation_progress_percent: null,
          review_state: "ready",
          review_summary: {
            annotated_frame_count: 3,
            imported_frame_count: 0,
            keyframe_count: 1,
            last_annotated_frame_idx: 24,
            last_reviewed_frame_idx: 24,
            manual_frame_count: 1,
            object_count: 2,
            propagated_frame_count: 1,
          },
          source_path: "/tmp/videos/ready/alpha_ready.mp4",
          width: 640,
        },
      ]),
    );

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Open Review alpha_ready.mp4",
      }),
    );

    expect(await screen.findByText("Live review harness")).toBeInTheDocument();
    expect(screen.getByText("Initial video: video-alpha")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/review/video-alpha");
    const lastLiveReviewRender = liveReviewRenderSpy.mock.lastCall as
      | [
          {
            initialVideoId?: string | null;
            onBackToLibrary?: () => void;
          },
        ]
      | undefined;
    expect(lastLiveReviewRender?.[0].initialVideoId).toBe("video-alpha");
    expect(lastLiveReviewRender?.[0].onBackToLibrary).toEqual(
      expect.any(Function),
    );
    await user.click(screen.getByRole("button", { name: "Return to library" }));
    expect(window.location.pathname).toBe("/");
  });

  it("ignores legacy live-review query param and stays on routed library host", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse([]));
    window.history.replaceState({}, "", "/?app=live-review");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Live review harness")).not.toBeInTheDocument();
  });

  it("resolves review route from video id path param", async () => {
    vi.mocked(fetch).mockResolvedValue(createJsonResponse([]));
    window.history.replaceState({}, "", "/review/video-route");

    render(<App />);

    expect(await screen.findByText("Live review harness")).toBeInTheDocument();
    expect(screen.getByText("Initial video: video-route")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Video Library" }),
    ).not.toBeInTheDocument();
  });

  it("renders small not-found route with way back to library", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(createJsonResponse([]));
    window.history.replaceState({}, "", "/missing-route");

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to Library" }));

    expect(
      await screen.findByRole("heading", { name: "Video Library" }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });
});
