// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { server } from "../../setup/msw/server";
import { VideoLibraryRoutePage } from "../../../src/features/video-library/pages/library-page";
import { VideoReviewRoutePage } from "../../../src/features/video-review/pages/review-page";

afterEach(() => {
  cleanup();
});

const videoId = "video-export";
const objectId = "object-1";
const videoDisplayName = "export-ready.mp4";

describe("export UI flow", () => {
  it("exports from review route, shows download affordance, and returns library state to ready after later manual edit", async () => {
    let currentReviewState: "exported" | "ready" = "ready";

    server.use(
      http.get("/api/videos", () =>
        HttpResponse.json([
          buildVideoPayload({
            reviewState: currentReviewState,
          }),
        ]),
      ),
      http.get("/api/videos/:requestedVideoId", ({ params }) => {
        if (params.requestedVideoId !== videoId) {
          return HttpResponse.json({ detail: "Indexed video not found" }, { status: 404 });
        }

        return HttpResponse.json(
          buildVideoPayload({
            reviewState: currentReviewState,
          }),
        );
      }),
      http.get("/api/videos/:requestedVideoId/manifest", ({ params }) => {
        if (params.requestedVideoId !== videoId) {
          return HttpResponse.json({ detail: "Indexed video not found" }, { status: 404 });
        }

        return HttpResponse.json({
          annotated_frames: [7, 18],
          keyframes: [7, 18],
          objects: [
            {
              color: "#00ffaa",
              id: objectId,
              label: "pedestrian_01",
              status: "active",
            },
          ],
          video: {
            duration_seconds: 1.75,
            fps: 24,
            frame_count: 42,
            height: 1080,
            id: videoId,
            propagation_progress_percent: null,
            review_state: currentReviewState,
            review_summary: {
              annotated_frame_count: 2,
              imported_frame_count: 0,
              keyframe_count: 2,
              last_annotated_frame_idx: 18,
              last_reviewed_frame_idx: 18,
              manual_frame_count: 2,
              object_count: 1,
              propagated_frame_count: 0,
            },
            width: 1920,
          },
        });
      }),
      http.get("/api/videos/:requestedVideoId/frame/:frameIdx", ({ params }) => {
        if (params.requestedVideoId !== videoId) {
          return HttpResponse.json({ detail: "Indexed video not found" }, { status: 404 });
        }

        return new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
          headers: {
            "content-type": "image/png",
          },
          status: 200,
        });
      }),
      http.get("/api/videos/:requestedVideoId/annotations/frame/:frameIdx", ({ params }) => {
        if (params.requestedVideoId !== videoId) {
          return HttpResponse.json({ detail: "Indexed video not found" }, { status: 404 });
        }

        return HttpResponse.json({
          annotations: [
            {
              box_xywh_norm: [0.25, 0.2, 0.35, 0.4],
              mask: null,
              object_id: objectId,
              source: "manual",
            },
          ],
          frame_idx: Number(params.frameIdx),
        });
      }),
      http.get("/api/videos/:requestedVideoId/objects/:requestedObjectId/summary", ({ params }) => {
        if (
          params.requestedVideoId !== videoId ||
          params.requestedObjectId !== objectId
        ) {
          return HttpResponse.json({ detail: "Object track not found" }, { status: 404 });
        }

        return HttpResponse.json({
          bbox_xyxy_px: [480, 216, 1100, 820],
          frame_idx: 7,
          label: "pedestrian_01",
          mask_confidence: null,
          object_id: objectId,
          track_summary: {
            corrected: null,
            frames: 1,
            propagated: 0,
          },
          video_id: videoId,
        });
      }),
      http.post("/api/videos/:requestedVideoId/export", ({ params }) => {
        if (params.requestedVideoId !== videoId) {
          return HttpResponse.json({ detail: "Indexed video not found" }, { status: 404 });
        }

        currentReviewState = "exported";
        return HttpResponse.json({ export_id: "export-123" }, { status: 201 });
      }),
      http.delete(
        "/api/videos/:requestedVideoId/annotations/frame/:frameIdx/object/:requestedObjectId",
        ({ params }) => {
          if (
            params.requestedVideoId !== videoId ||
            params.requestedObjectId !== objectId
          ) {
            return HttpResponse.json(
              { detail: "Manual annotation not found" },
              { status: 404 },
            );
          }

          if (params.frameIdx === "18") {
            currentReviewState = "ready";
          }
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<VideoLibraryRoutePage />} path="/" />
          <Route element={<VideoReviewRoutePage />} path="/review/:videoId" />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("article", { name: videoDisplayName }),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`video-card-badge-${videoId}`)).toHaveTextContent(
      "Ready",
    );

    await user.click(
      screen.getByRole("article", {
        name: videoDisplayName,
      }),
    );

    expect(
      await screen.findByRole("heading", { name: videoDisplayName }),
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole("button", { name: "Export PNGs" }),
    );

    const downloadLink = await screen.findByRole("link", {
      name: "Download latest export",
    });
    expect(downloadLink).toHaveAttribute("href", "/api/exports/export-123");

    await user.click(screen.getByRole("button", { name: "Back to Library" }));

    const exportedCard = await screen.findByRole("article", {
      name: videoDisplayName,
    });
    expect(
      within(exportedCard).getByTestId(`video-card-badge-${videoId}`),
    ).toHaveTextContent("Exported");

    await user.click(exportedCard);

    expect(
      await screen.findByRole("heading", { name: videoDisplayName }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Next annotated frame" }),
    );
    expect(await screen.findByText("Canonical frame 18")).toBeInTheDocument();
    const deleteSavedBoxButton = await screen.findByRole("button", {
      name: "Delete saved box",
    });
    await waitFor(() => {
      expect(deleteSavedBoxButton).toBeEnabled();
    });
    await user.click(deleteSavedBoxButton);

    await waitFor(() => {
      expect(screen.queryByText("Download latest export")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Back to Library" }));

    const readyCard = await screen.findByRole("article", {
      name: videoDisplayName,
    });
    expect(
      within(readyCard).getByTestId(`video-card-badge-${videoId}`),
    ).toHaveTextContent("Ready");
  });
});

function buildVideoPayload(options: {
  reviewState: "exported" | "ready";
}) {
  return {
    display_name: videoDisplayName,
    duration_seconds: 1.75,
    fps: 24,
    frame_count: 42,
    height: 1080,
    id: videoId,
    propagation_progress_percent: null,
    review_state: options.reviewState,
      review_summary: {
      annotated_frame_count: 2,
      imported_frame_count: 0,
      keyframe_count: 2,
      last_annotated_frame_idx: 18,
      last_reviewed_frame_idx: 18,
      manual_frame_count: 2,
      object_count: 1,
      propagated_frame_count: 0,
    },
    source_path: "/tmp/export-ready.mp4",
    width: 1920,
  };
}
