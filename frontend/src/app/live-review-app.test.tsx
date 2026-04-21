// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { server } from "../test/msw/server";
import { LiveReviewApp } from "./live-review-app";

const sampleVideo = {
  id: "video-123",
  source_path: "/tmp/street_scene_014.mp4",
  display_name: "street_scene_014.mp4",
  frame_count: 42,
  fps: 24,
  width: 1920,
  height: 1080,
  duration_seconds: 1.75,
} as const;

describe("LiveReviewApp", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("selects a video, loads exact frames, and steps without treating playback as canonical truth", async () => {
    const requestedFrameIndices: number[] = [];
    const requestedAnnotationFrameIndices: number[] = [];
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7, 8],
          keyframes: [7],
          objects: [
            {
              color: "#00ffaa",
              id: "object-1",
              label: "pedestrian_01",
              status: "active",
            },
          ],
          video: {
            duration_seconds: 1.75,
            fps: 24,
            frame_count: 42,
            height: 1080,
            id: "video-123",
            width: 1920,
          },
        }),
      ),
      http.get("/api/videos/:videoId/frame/:frameIdx", ({ params }) => {
        const frameIdx = Number(params.frameIdx);
        requestedFrameIndices.push(frameIdx);

        return new HttpResponse(new Blob([`frame-${String(frameIdx)}`]), {
          headers: {
            "content-type": "image/png",
          },
          status: 200,
        });
      }),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) => {
          const frameIdx = Number(params.frameIdx);
          requestedAnnotationFrameIndices.push(frameIdx);

          return HttpResponse.json({
            annotations: [],
            frame_idx: frameIdx,
          });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewApp />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    expect(
      await screen.findByText(
        "Playback stays contextual only. Canonical review frame comes from backend frame index state.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Canonical frame 0")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Playback preview")).toHaveAttribute(
      "src",
      "/api/videos/video-123/source",
    );

    const frameInput = screen.getByLabelText("Frame number");
    await user.clear(frameInput);
    await user.type(frameInput, "7");
    await user.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(await screen.findByAltText("Exact frame 7")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next frame" }));

    expect(await screen.findByText("Canonical frame 8")).toBeInTheDocument();
    expect(await screen.findByAltText("Exact frame 8")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous frame" }));

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(requestedFrameIndices).toEqual([7, 8, 7]);
    expect(requestedAnnotationFrameIndices).toEqual([7, 8, 7]);
  });
});
