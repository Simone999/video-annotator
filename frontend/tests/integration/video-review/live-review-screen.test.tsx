// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";
import { LiveReviewScreen } from "../../../src/features/video-review/components/live-review-screen";

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

describe("LiveReviewScreen", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a single-stage review surface and loads exact frames without treating playback as canonical truth", async () => {
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

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Review surface" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Live review surface" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Playback pane")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Exact-frame pane")).not.toBeInTheDocument();
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

  it("bootstraps direct review routes through route-owned loading and loaded shells", async () => {
    const requestedFrameIndices: number[] = [];
    const handleBackToLibrary = vi.fn();
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
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
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", () =>
        HttpResponse.json({
          bbox_xyxy_px: null,
          frame_idx: 0,
          mask_confidence: null,
          object_id: "object-1",
          track_summary: {
            corrected: null,
            frames: null,
            propagated: null,
          },
        }),
      ),
    );

    render(
      <LiveReviewScreen
        initialVideoId={sampleVideo.id}
        onBackToLibrary={handleBackToLibrary}
      />,
    );

    expect(screen.getByRole("main")).toHaveClass("route-status-screen");
    expect(
      screen.getByRole("heading", { name: "Opening review workspace" })
        .parentElement,
    ).toHaveClass("route-status-card");
    expect(
      screen.getByRole("heading", { name: "Opening review workspace" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Choose review target")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    ).not.toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: sampleVideo.display_name }),
    ).toBeInTheDocument();
    expect(screen.getByText("Video Annotation").closest("nav")).toHaveClass(
      "app-topbar",
    );
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Review chrome" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Help" })).toBeDisabled();
    expect(
      screen
        .getByRole("button", { name: "Settings" })
        .querySelector(".material-symbol"),
    ).toHaveClass("text-[24px]");
    expect(
      screen.queryByRole("button", { name: "Save Session" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Export" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Route-owned review workspace"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Review overview")).toHaveClass(
      "workspace-panel",
    );
    expect(screen.getByLabelText("Live review surface")).toHaveClass(
      "workspace-stage",
    );
    expect(screen.getByLabelText("Selected object inspector")).toHaveClass(
      "workspace-panel",
    );
    expect(
      screen.queryByText("Indexed videos", { exact: false }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to Library" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(await screen.findByAltText("Exact frame 7")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    ).not.toBeInTheDocument();
    expect(requestedFrameIndices).toEqual([7]);
  });

  it("renders review chrome plus selected-object summary truth from backend", async () => {
    const user = userEvent.setup();
    const initialSummaryFrameCount = sampleVideo.frame_count - 7;
    const shortenedSummaryFrameCount = 9 - 7 + 1;

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
          keyframes: [7],
          objects: [
            {
              color: "#00ffaa",
              id: "object-1",
              label: "pedestrian_01",
              status: "active",
            },
            {
              color: "#ff8844",
              id: "object-2",
              label: "pedestrian_02",
              status: "active",
            },
          ],
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params, request }) => {
          const url = new URL(request.url);
          const startFrameIdx = Number(url.searchParams.get("start_frame_idx"));
          const endFrameIdx = Number(url.searchParams.get("end_frame_idx"));

          if (params.objectId === "object-2") {
            return HttpResponse.json({
              bbox_xyxy_px: [18, 28, 118, 168],
              label: "pedestrian_02",
              mask_confidence: 0.83,
              object_id: "object-2",
              track_summary: {
                corrected: 1,
                frames: endFrameIdx - startFrameIdx + 1,
                propagated: 2,
              },
              video_id: params.videoId,
            });
          }

          return HttpResponse.json({
            bbox_xyxy_px: [12, 24, 96, 144],
            label: "pedestrian_01",
            mask_confidence: null,
            object_id: "object-1",
            track_summary: {
              corrected: null,
              frames: endFrameIdx - startFrameIdx + 1,
              propagated: 5,
            },
            video_id: params.videoId,
          });
        },
      ),
    );

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save Session" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Export" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Review chrome" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Settings" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Help" })).toBeDisabled();
    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Primary" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("street_scene_014.mp4")).toBeInTheDocument();
    expect(screen.getByText("1920×1080")).toBeInTheDocument();
    expect(screen.getByText("24 FPS")).toBeInTheDocument();
    expect(screen.getByText("42 Frames")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Annotations · Frame 7" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 OBJ")).toBeInTheDocument();
    const inspector = screen.getByRole("complementary", {
      name: "Selected object inspector",
    });
    const labelRowLabel = within(inspector).getByText("Label");
    const idRowLabel = within(inspector).getByText("ID");
    expect(
      labelRowLabel.compareDocumentPosition(idRowLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      await within(inspector).findByText("[12, 24, 96, 144]"),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByText(String(initialSummaryFrameCount)),
    ).toBeInTheDocument();
    expect(within(inspector).getByText("5")).toBeInTheDocument();
    expect(
      within(inspector).getAllByText("Unavailable").length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByText(
        "Unavailable until selected-object summary route is wired.",
      ),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /pedestrian_02/i,
      }),
    );

    expect(
      await within(inspector).findByText("[18, 28, 118, 168]"),
    ).toBeInTheDocument();
    expect(within(inspector).getByText("0.83")).toBeInTheDocument();
    expect(within(inspector).getByText("1")).toBeInTheDocument();

    expect(within(inspector).getByText("Range 7-41")).toBeInTheDocument();
    expect(screen.getByLabelText("Range direction")).toBeInTheDocument();
    const endFrameInput = screen.getByLabelText("Range boundary frame");
    expect(
      screen.queryByText(/before interaction wiring lands/i),
    ).not.toBeInTheDocument();
    await user.clear(endFrameInput);
    await user.type(endFrameInput, "9");

    await waitFor(() => {
      expect(
        within(inspector).queryByText(String(initialSummaryFrameCount)),
      ).not.toBeInTheDocument();
      expect(
        within(inspector).getByText(String(shortenedSummaryFrameCount)),
      ).toBeInTheDocument();
      expect(within(inspector).getByText("Range 7-9")).toBeInTheDocument();
    });
    const timeline = screen.getByRole("region", { name: "Review timeline" });
    expect(within(timeline).getByText("7-9")).toBeInTheDocument();
    expect(
      within(timeline).getAllByLabelText(/Annotated frame marker at/i),
    ).toHaveLength(1);
    expect(
      within(timeline).getAllByLabelText(/Keyframe marker at/i),
    ).toHaveLength(1);
    expect(document.querySelectorAll("#workspace-title")).toHaveLength(1);
  });

  it("keeps missing current-frame annotation truth honest and relies on custom playback controls", async () => {
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", ({ params }) =>
        HttpResponse.json({
          bbox_xyxy_px: null,
          label: "pedestrian_01",
          mask_confidence: null,
          object_id: params.objectId,
          track_summary: {
            corrected: null,
            frames: 35,
            propagated: 0,
          },
          video_id: params.videoId,
        }),
      ),
    );

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();

    const objectRow = screen
      .getAllByText("pedestrian_01")[0]
      ?.closest("button");
    expect(objectRow).not.toBeNull();
    expect(
      within(objectRow as HTMLButtonElement).getAllByText("—"),
    ).toHaveLength(2);
    expect(screen.getByLabelText("Playback preview")).not.toHaveAttribute(
      "controls",
    );
    expect(
      screen.getByText("Selected object has no mask on current frame."),
    ).toBeInTheDocument();
  });

  it("reloads selected-object summary from current object, frame, and range state", async () => {
    const summaryRequests: Array<{
      endFrameIdx: string;
      frameIdx: string;
      objectId: string;
      startFrameIdx: string;
    }> = [];

    server.use(
      http.get("/api/videos", () =>
        HttpResponse.json([
          {
            ...sampleVideo,
            frame_count: 50,
          },
        ]),
      ),
      http.get("/api/videos/:videoId", () =>
        HttpResponse.json({
          ...sampleVideo,
          frame_count: 50,
        }),
      ),
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
            {
              color: "#ff8844",
              id: "object-2",
              label: "pedestrian_02",
              status: "active",
            },
          ],
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: 50,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params, request }) => {
          const url = new URL(request.url);
          summaryRequests.push({
            endFrameIdx: url.searchParams.get("end_frame_idx") ?? "",
            frameIdx: url.searchParams.get("frame_idx") ?? "",
            objectId: String(params.objectId),
            startFrameIdx: url.searchParams.get("start_frame_idx") ?? "",
          });

          return HttpResponse.json({
            bbox_xyxy_px: [12, 24, 96, 144],
            label:
              params.objectId === "object-1"
                ? "pedestrian_01"
                : "pedestrian_02",
            mask_confidence: null,
            object_id: params.objectId,
            track_summary: {
              corrected: null,
              frames: 10,
              propagated: params.objectId === "object-1" ? 4 : 6,
            },
            video_id: params.videoId,
          });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();

    await waitFor(() => {
      expect(summaryRequests).toContainEqual({
        endFrameIdx: "49",
        frameIdx: "7",
        objectId: "object-1",
        startFrameIdx: "7",
      });
    });

    const directionSelect = screen.getByLabelText("Range direction");
    await user.selectOptions(directionSelect, "backward");

    const endFrameInput = screen.getByLabelText("Range boundary frame");
    await user.clear(endFrameInput);
    await user.type(endFrameInput, "3");

    await waitFor(() => {
      expect(summaryRequests).toContainEqual({
        endFrameIdx: "7",
        frameIdx: "7",
        objectId: "object-1",
        startFrameIdx: "3",
      });
    });

    await user.click(
      screen.getByRole("button", {
        name: /pedestrian_02/i,
      }),
    );

    await waitFor(() => {
      expect(summaryRequests).toContainEqual({
        endFrameIdx: "7",
        frameIdx: "7",
        objectId: "object-2",
        startFrameIdx: "3",
      });
    });

    await user.click(screen.getByRole("button", { name: "Next frame" }));

    expect(await screen.findByText("Canonical frame 8")).toBeInTheDocument();
    await waitFor(() => {
      expect(summaryRequests).toContainEqual({
        endFrameIdx: "8",
        frameIdx: "8",
        objectId: "object-2",
        startFrameIdx: "3",
      });
    });
    expect(summaryRequests).not.toContainEqual({
      endFrameIdx: "7",
      frameIdx: "8",
      objectId: "object-2",
      startFrameIdx: "3",
    });
    expect(summaryRequests).not.toContainEqual({
      endFrameIdx: "8",
      frameIdx: "8",
      objectId: "object-2",
      startFrameIdx: "0",
    });
  });

  it("ignores stale selected-object summary responses when newer selection wins", async () => {
    const delayedObjectOneResponses: Array<() => void> = [];
    const user = userEvent.setup();

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
          keyframes: [7],
          objects: [
            {
              color: "#00ffaa",
              id: "object-1",
              label: "pedestrian_01",
              status: "active",
            },
            {
              color: "#ff8844",
              id: "object-2",
              label: "pedestrian_02",
              status: "active",
            },
          ],
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        async ({ params }) => {
          const summaryPayload =
            params.objectId === "object-2"
              ? {
                  bbox_xyxy_px: [18, 28, 118, 168],
                  label: "pedestrian_02",
                  mask_confidence: 0.83,
                  object_id: "object-2",
                  track_summary: {
                    corrected: 1,
                    frames: 35,
                    propagated: 2,
                  },
                  video_id: params.videoId,
                }
              : {
                  bbox_xyxy_px: [12, 24, 96, 144],
                  label: "pedestrian_01",
                  mask_confidence: null,
                  object_id: "object-1",
                  track_summary: {
                    corrected: null,
                    frames: 35,
                    propagated: 5,
                  },
                  video_id: params.videoId,
                };

          if (params.objectId === "object-1") {
            await new Promise<void>((resolve) => {
              delayedObjectOneResponses.push(resolve);
            });
          }

          return HttpResponse.json(summaryPayload);
        },
      ),
    );

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();

    const inspector = screen.getByRole("complementary", {
      name: "Selected object inspector",
    });
    expect(
      await within(inspector).findByText("Loading selected-range summary..."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /pedestrian_02/i,
      }),
    );

    expect(
      await within(inspector).findByText("[18, 28, 118, 168]"),
    ).toBeInTheDocument();
    expect(within(inspector).getByText("0.83")).toBeInTheDocument();

    delayedObjectOneResponses.forEach((resolve) => {
      resolve();
    });

    await waitFor(() => {
      expect(
        within(inspector).queryByText("[12, 24, 96, 144]"),
      ).not.toBeInTheDocument();
      expect(
        within(inspector).getByText("[18, 28, 118, 168]"),
      ).toBeInTheDocument();
    });
  });

  it("renders designed unavailable shell with real backend error text for direct review route failures", async () => {
    const handleBackToLibrary = vi.fn();
    const user = userEvent.setup();

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get(
        "/api/videos/:videoId/manifest",
        () =>
          new HttpResponse(null, {
            status: 500,
            statusText: "Internal Server Error",
          }),
      ),
    );

    render(
      <LiveReviewScreen
        initialVideoId={sampleVideo.id}
        onBackToLibrary={handleBackToLibrary}
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Review unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Review surface" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to Library" }));
    expect(handleBackToLibrary).toHaveBeenCalledTimes(1);
  });

  it("auto-loads first annotated frame and jumps through annotated and keyframe markers", async () => {
    const requestedFrameIndices: number[] = [];
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7, 12, 18],
          keyframes: [7, 18],
          objects: [
            {
              color: "#00ffaa",
              id: "object-1",
              label: "pedestrian_01",
              status: "active",
            },
          ],
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
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
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params, request }) =>
          HttpResponse.json({
            bbox_xyxy_px: null,
            frame_idx: Number(
              new URL(request.url).searchParams.get("frame_idx") ?? "0",
            ),
            label: "pedestrian_01",
            mask_confidence: null,
            object_id: String(params.objectId),
            track_summary: {
              corrected: null,
              frames: null,
              propagated: null,
            },
          }),
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(requestedFrameIndices).toEqual([7]);
    expect(screen.getByLabelText("Frame number")).toHaveValue(7);
    const timeline = screen.getByRole("region", { name: "Review timeline" });
    expect(within(timeline).getByText("7 / 41")).toBeInTheDocument();
    expect(within(timeline).getByText("7-41")).toBeInTheDocument();
    expect(
      within(timeline).getAllByLabelText(/Annotated frame marker at/i),
    ).toHaveLength(3);
    expect(
      within(timeline).getAllByLabelText(/Keyframe marker at/i),
    ).toHaveLength(2);
    expect(
      screen.getByRole("group", { name: "Exact frame fallback" }),
    ).toContainElement(screen.getByLabelText("Frame number"));

    await user.click(
      screen.getByRole("button", { name: "Next annotated frame" }),
    );
    expect(await screen.findByText("Canonical frame 12")).toBeInTheDocument();
    expect(screen.getByLabelText("Frame number")).toHaveValue(12);

    await user.click(screen.getByRole("button", { name: "Next keyframe" }));
    expect(await screen.findByText("Canonical frame 18")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next keyframe" }),
    ).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Previous annotated frame" }),
    );
    expect(await screen.findByText("Canonical frame 12")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous keyframe" }));
    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous keyframe" }),
    ).toBeDisabled();

    expect(requestedFrameIndices).toEqual([7, 12, 18, 12, 7]);
  });

  it("loads canonical frames from timeline scrubber and markers while pausing contextual playback", async () => {
    const requestedFrameIndices: number[] = [];
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7, 12, 18],
          keyframes: [7, 18],
          objects: [
            {
              color: "#00ffaa",
              id: "object-1",
              label: "pedestrian_01",
              status: "active",
            },
          ],
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
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
        ({ params }) =>
          HttpResponse.json({
            annotations: [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params, request }) =>
          HttpResponse.json({
            bbox_xyxy_px: null,
            frame_idx: Number(
              new URL(request.url).searchParams.get("frame_idx") ?? "0",
            ),
            label: "pedestrian_01",
            mask_confidence: null,
            object_id: String(params.objectId),
            track_summary: {
              corrected: null,
              frames: null,
              propagated: null,
            },
          }),
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Play context" }));
    expect(
      screen.getByRole("button", { name: "Pause playback" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Annotated frame marker at 12",
      }),
    );
    expect(await screen.findByText("Canonical frame 12")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play context" })).toBeVisible();

    const timelineScrubber = screen.getByRole("slider", {
      name: "Timeline scrubber",
    });
    mockTimelineBounds(timelineScrubber, {
      height: 24,
      width: 410,
      x: 10,
      y: 20,
    });

    fireEvent.pointerDown(timelineScrubber, {
      button: 0,
      clientX: 135,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerMove(timelineScrubber, {
      buttons: 1,
      clientX: 210,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerUp(timelineScrubber, {
      clientX: 210,
      clientY: 24,
      pointerId: 1,
    });

    expect(await screen.findByText("Canonical frame 20")).toBeInTheDocument();
    expect(screen.getByLabelText("Frame number")).toHaveValue(20);
    expect(requestedFrameIndices).toEqual([7, 12, 20]);
  });

  it("supports live review keyboard shortcuts without relying on browser playback time", async () => {
    const deleteRequests: number[] = [];
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get("/api/videos/:videoId/frame/:frameIdx", ({ params }) => {
        const frameIdx = Number(params.frameIdx);
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
          return HttpResponse.json({
            annotations:
              frameIdx === 7
                ? [
                    {
                      box_xywh_norm: [0.1, 0.15, 0.3, 0.25],
                      mask: null,
                      object_id: "object-1",
                      source: "manual",
                    },
                  ]
                : [],
            frame_idx: frameIdx,
          });
        },
      ),
      http.delete(
        "/api/videos/:videoId/annotations/frame/:frameIdx/object/:objectId",
        ({ params }) => {
          deleteRequests.push(Number(params.frameIdx));
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    await screen.findByText("Canonical frame 7");
    expect(
      await screen.findByLabelText("Saved annotation box for object-1"),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { code: "Space", key: " " });
    expect(
      await screen.findByText(
        "Playback active. Pause to return to canonical frame 7.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run SAM2" })).toBeDisabled();

    fireEvent.keyDown(window, { code: "Space", key: " " });
    expect(
      await screen.findByText(
        "Paused stage is edit-ready. Draw, move, resize, delete, and SAM2 actions use backend frame 7.",
      ),
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { code: "KeyG", key: "g" });
    const frameInput = screen.getByLabelText("Frame number");
    expect(frameInput).toHaveFocus();

    frameInput.blur();
    fireEvent.keyDown(window, { code: "Delete", key: "Delete" });
    await waitFor(() => {
      expect(deleteRequests).toEqual([7]);
    });
    await waitFor(() => {
      expect(
        screen.queryByLabelText("Saved annotation box for object-1"),
      ).not.toBeInTheDocument();
    });

    fireEvent.keyDown(window, { code: "ArrowRight", key: "ArrowRight" });
    expect(await screen.findByText("Canonical frame 8")).toBeInTheDocument();
  });

  it("adjusts selected mask opacity on the live review stage", async () => {
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get("/api/videos/:videoId/frame/:frameIdx", ({ params }) => {
        const frameIdx = Number(params.frameIdx);
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
          return HttpResponse.json({
            annotations: [
              {
                box_xywh_norm: [0.1, 0.15, 0.3, 0.25],
                mask: {
                  path: `masks/video-123/object-1/frame_${String(frameIdx).padStart(6, "0")}.png`,
                },
                object_id: "object-1",
                source: "sam2",
              },
            ],
            frame_idx: frameIdx,
          });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    const mask = await screen.findByAltText("SAM2 mask for object-1");
    expect(mask).toHaveStyle({ opacity: "0.58" });

    fireEvent.change(screen.getByLabelText("Mask opacity"), {
      target: { value: "25" },
    });

    expect(mask).toHaveStyle({ opacity: "0.25" });
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("keeps mutating actions paused-only on the live review stage", async () => {
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get("/api/videos/:videoId/frame/:frameIdx", ({ params }) => {
        const frameIdx = Number(params.frameIdx);
        return new HttpResponse(new Blob([`frame-${String(frameIdx)}`]), {
          headers: {
            "content-type": "image/png",
          },
          status: 200,
        });
      }),
      http.get("/api/videos/:videoId/annotations/frame/:frameIdx", () =>
        HttpResponse.json({
          annotations: [],
          frame_idx: 7,
        }),
      ),
      http.put(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        async ({ request }) => {
          const payload = (await request.json()) as {
            box_xywh_norm: [number, number, number, number];
            is_keyframe: boolean;
            object_id: string;
          };

          return HttpResponse.json({
            box_xywh_norm: payload.box_xywh_norm,
            frame_idx: 7,
            is_keyframe: payload.is_keyframe,
            mask: {
              path: null,
            },
            object_id: payload.object_id,
            source: "manual",
            video_id: sampleVideo.id,
          });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    const frameInput = screen.getByLabelText("Frame number");
    await user.clear(frameInput);
    await user.type(frameInput, "7");
    await user.click(screen.getByRole("button", { name: "Load frame" }));
    await screen.findByText("Canonical frame 7");

    const canvas = await screen.findByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    drawBox(canvas, {
      end: { x: 200, y: 100 },
      start: { x: 40, y: 20 },
    });

    const playback = screen.getByLabelText("Playback preview");
    const runSam2Button = await screen.findByRole("button", {
      name: "Run SAM2",
    });

    expect(runSam2Button).toBeEnabled();

    fireEvent.play(playback);

    expect(
      await screen.findByText(
        "Pause playback before mutating canonical frame data.",
      ),
    ).toBeInTheDocument();
    expect(runSam2Button).toBeDisabled();

    fireEvent.pause(playback);

    await waitFor(() => {
      expect(runSam2Button).toBeEnabled();
    });
  });

  it("creates object and persists draw, reload, move, resize, and delete manual boxes", async () => {
    const objectSummaries: Array<{
      color: string;
      id: string;
      label: string;
      status: "active";
    }> = [];
    const manualAnnotationsByFrame: Record<
      number,
      Record<
        string,
        {
          box_xywh_norm: [number, number, number, number];
          is_keyframe: boolean;
          object_id: string;
        }
      >
    > = {};
    const manualAnnotationWrites: Array<{
      box_xywh_norm: [number, number, number, number];
      frame_idx: number;
      object_id: string;
    }> = [];

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: Object.keys(manualAnnotationsByFrame).map(Number),
          keyframes: Object.keys(manualAnnotationsByFrame).map(Number),
          objects: objectSummaries,
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get("/api/videos/:videoId/frame/:frameIdx", ({ params }) => {
        const frameIdx = Number(params.frameIdx);
        return new HttpResponse(new Blob([`frame-${String(frameIdx)}`]), {
          headers: {
            "content-type": "image/png",
          },
          status: 200,
        });
      }),
      http.post("/api/videos/:videoId/objects", async ({ request }) => {
        const payload = (await request.json()) as { label: string };
        const nextObject = {
          color: "#00ffaa",
          id: `object-${String(objectSummaries.length + 1)}`,
          label: payload.label,
          status: "active" as const,
        };
        objectSummaries.push(nextObject);
        return HttpResponse.json(nextObject, { status: 201 });
      }),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) => {
          const frameIdx = Number(params.frameIdx);
          return HttpResponse.json({
            annotations: Object.values(
              manualAnnotationsByFrame[frameIdx] ?? {},
            ).map((annotation) => ({
              box_xywh_norm: annotation.box_xywh_norm,
              mask: null,
              object_id: annotation.object_id,
              source: "manual",
            })),
            frame_idx: frameIdx,
          });
        },
      ),
      http.put(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        async ({ params, request }) => {
          const frameIdx = Number(params.frameIdx);
          const payload = (await request.json()) as {
            box_xywh_norm: [number, number, number, number];
            is_keyframe: boolean;
            object_id: string;
          };
          manualAnnotationsByFrame[frameIdx] = {
            ...(manualAnnotationsByFrame[frameIdx] ?? {}),
            [payload.object_id]: payload,
          };
          manualAnnotationWrites.push({
            box_xywh_norm: payload.box_xywh_norm,
            frame_idx: frameIdx,
            object_id: payload.object_id,
          });

          return HttpResponse.json({
            box_xywh_norm: payload.box_xywh_norm,
            frame_idx: frameIdx,
            is_keyframe: payload.is_keyframe,
            mask: {
              path: null,
            },
            object_id: payload.object_id,
            source: "manual",
            video_id: sampleVideo.id,
          });
        },
      ),
      http.delete(
        "/api/videos/:videoId/annotations/frame/:frameIdx/object/:objectId",
        ({ params }) => {
          const frameIdx = Number(params.frameIdx);
          const objectId = String(params.objectId);
          const frameAnnotations = manualAnnotationsByFrame[frameIdx] ?? {};
          const remainingAnnotations = Object.fromEntries(
            Object.entries(frameAnnotations).filter(
              ([annotationObjectId]) => annotationObjectId !== objectId,
            ),
          ) as typeof frameAnnotations;
          manualAnnotationsByFrame[frameIdx] = remainingAnnotations;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    await user.type(screen.getByLabelText("New object label"), "left hand");
    await user.click(screen.getByRole("button", { name: "Create object" }));

    const selectedObject = await screen.findByRole("button", {
      name: /left hand/i,
    });
    expect(selectedObject).toHaveAttribute("aria-pressed", "true");

    const frameInput = screen.getByLabelText("Frame number");
    await user.clear(frameInput);
    await user.type(frameInput, "7");
    await user.click(screen.getByRole("button", { name: "Load frame" }));
    await screen.findByText("Canonical frame 7");

    const canvas = await screen.findByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    drawBox(canvas, {
      end: { x: 200, y: 100 },
      start: { x: 40, y: 20 },
    });

    const savedBox = await screen.findByLabelText(
      "Saved annotation box for object-1",
    );
    expect(savedBox).toHaveStyle({
      height: "40%",
      left: "10%",
      top: "10%",
      width: "40%",
    });
    expect(manualAnnotationWrites).toEqual([
      {
        box_xywh_norm: [0.1, 0.1, 0.4, 0.4],
        frame_idx: 7,
        object_id: "object-1",
      },
    ]);

    await user.click(screen.getByRole("button", { name: "Load frame" }));
    await waitFor(() => {
      expect(
        screen.getByLabelText("Saved annotation box for object-1"),
      ).toHaveStyle({
        height: "40%",
        left: "10%",
        top: "10%",
        width: "40%",
      });
    });

    const reloadedCanvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(reloadedCanvas, { height: 200, width: 400, x: 0, y: 0 });

    moveBox(
      reloadedCanvas,
      screen.getByLabelText("Saved annotation box for object-1"),
      {
        end: { x: 120, y: 60 },
        start: { x: 80, y: 40 },
      },
    );

    await waitFor(() => {
      expect(manualAnnotationWrites).toHaveLength(2);
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText("Saved annotation box for object-1"),
      ).toHaveStyle({
        height: "40%",
        left: "20%",
        top: "20%",
        width: "40%",
      });
    });

    const movedCanvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(movedCanvas, { height: 200, width: 400, x: 0, y: 0 });

    resizeBox(
      movedCanvas,
      await screen.findByLabelText("Resize saved annotation box for object-1"),
      { x: 320, y: 140 },
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText("Saved annotation box for object-1"),
      ).toHaveStyle({
        height: "50%",
        left: "20%",
        top: "20%",
        width: "60%",
      });
    });

    await user.click(screen.getByRole("button", { name: "Load frame" }));
    await waitFor(() => {
      expect(
        screen.getByLabelText("Saved annotation box for object-1"),
      ).toHaveStyle({
        height: "50%",
        left: "20%",
        top: "20%",
        width: "60%",
      });
    });

    await user.click(screen.getByRole("button", { name: "Delete saved box" }));
    await waitFor(() => {
      expect(
        screen.queryByLabelText("Saved annotation box for object-1"),
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Load frame" }));
    await waitFor(() => {
      expect(
        screen.queryByLabelText("Saved annotation box for object-1"),
      ).not.toBeInTheDocument();
    });
  });

  it("collects paused refine strokes, saves corrected mask, and refreshes summary truth", async () => {
    const refineRequests: Array<{
      frame_idx: number;
      negative_points: number[][];
      object_id: string;
      positive_points: number[][];
      session_id: string;
    }> = [];
    let currentAnnotation = {
      box_xywh_norm: [0.2, 0.25, 0.3, 0.35] as [number, number, number, number],
      mask: {
        path: "masks/video-123/object-1/frame_000007.png",
      },
      object_id: "object-1",
      source: "sam2" as "sam2" | "sam2_edited",
    };

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [
              {
                ...currentAnnotation,
              },
            ],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", ({ params }) =>
        HttpResponse.json({
          bbox_xyxy_px: [384, 270, 960, 648],
          label: "pedestrian_01",
          mask_confidence: currentAnnotation.source === "sam2" ? 0.91 : null,
          object_id: params.objectId,
          track_summary: {
            corrected: currentAnnotation.source === "sam2" ? null : 1,
            frames: 35,
            propagated: 5,
          },
          video_id: params.videoId,
        }),
      ),
      http.post("/api/videos/:videoId/sam2/session", () =>
        HttpResponse.json({
          reused: false,
          session_id: "sam2-session-1",
        }),
      ),
      http.post(
        "/api/videos/:videoId/sam2/refine-mask",
        async ({ request }) => {
          const payload = (await request.json()) as {
            frame_idx: number;
            negative_points: number[][];
            object_id: string;
            positive_points: number[][];
            session_id: string;
          };
          refineRequests.push(payload);
          currentAnnotation = {
            ...currentAnnotation,
            source: "sam2_edited",
          };

          return HttpResponse.json({
            annotation: {
              ...currentAnnotation,
              mask_confidence: null,
            },
            frame_idx: payload.frame_idx,
          });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    const inspector = screen.getByRole("complementary", {
      name: "Selected object inspector",
    });
    expect(within(inspector).getByText("SAM2 mask")).toBeInTheDocument();
    expect(within(inspector).getByText("Unavailable")).toBeInTheDocument();

    const correctMaskButton = screen.getByRole("button", {
      name: "Correct mask",
    });
    expect(correctMaskButton).toBeEnabled();

    fireEvent.play(screen.getByLabelText("Playback preview"));
    await waitFor(() => {
      expect(correctMaskButton).toBeDisabled();
    });

    fireEvent.pause(screen.getByLabelText("Playback preview"));
    await waitFor(() => {
      expect(correctMaskButton).toBeEnabled();
    });

    await user.click(correctMaskButton);
    await user.click(screen.getByRole("button", { name: "Erase brush" }));

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    drawBrushStroke(canvas, {
      end: { x: 150, y: 80 },
      start: { x: 100, y: 60 },
    });
    await user.click(screen.getByRole("button", { name: "Add brush" }));
    drawBrushStroke(canvas, {
      end: { x: 260, y: 120 },
      start: { x: 220, y: 100 },
    });

    await user.click(
      screen.getByRole("button", { name: "Save corrected mask" }),
    );

    await waitFor(() => {
      expect(refineRequests).toEqual([
        {
          frame_idx: 7,
          negative_points: [
            [480, 324],
            [720, 432],
          ],
          object_id: "object-1",
          positive_points: [
            [1056, 540],
            [1248, 648],
          ],
          session_id: "sam2-session-1",
        },
      ]);
    });
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(within(inspector).getByText("sam2_edited")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(within(inspector).getByText("1")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Save corrected mask" }),
    ).not.toBeInTheDocument();
  });

  it("cleans only current-frame mask and preserves adjacent-frame mask truth", async () => {
    const cleanupRequests: Array<{
      frameIdx: number;
      objectId: string;
    }> = [];
    const annotationsByFrame = new Map<
      number,
      Array<{
        box_xywh_norm: [number, number, number, number] | null;
        mask: { path: string } | null;
        object_id: string;
        source: "sam2" | "sam2_edited";
      }>
    >([
      [
        7,
        [
          {
            box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
            mask: {
              path: "masks/video-123/object-1/frame_000007.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ],
      ],
      [
        8,
        [
          {
            box_xywh_norm: null,
            mask: {
              path: "masks/video-123/object-1/frame_000008.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ],
      ],
    ]);

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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: annotationsByFrame.get(Number(params.frameIdx)) ?? [],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params }) => {
          const currentFrameAnnotation =
            annotationsByFrame
              .get(7)
              ?.find(
                (annotation) => annotation.object_id === params.objectId,
              ) ?? null;

          return HttpResponse.json({
            bbox_xyxy_px: currentFrameAnnotation?.box_xywh_norm
              ? [384, 270, 960, 648]
              : null,
            label: "pedestrian_01",
            mask_confidence: currentFrameAnnotation?.mask ? 0.91 : null,
            object_id: params.objectId,
            track_summary: {
              corrected: null,
              frames: currentFrameAnnotation?.mask ? 2 : 1,
              propagated: 1,
            },
            video_id: params.videoId,
          });
        },
      ),
      http.delete(
        "/api/videos/:videoId/annotations/frame/:frameIdx/object/:objectId/mask",
        ({ params }) => {
          cleanupRequests.push({
            frameIdx: Number(params.frameIdx),
            objectId: String(params.objectId),
          });
          annotationsByFrame.set(7, [
            {
              box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
              mask: null,
              object_id: "object-1",
              source: "sam2",
            },
          ]);
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Remove mask on this frame only. Keep object and other frames.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear frame mask" }));

    await waitFor(() => {
      expect(cleanupRequests).toEqual([
        {
          frameIdx: 7,
          objectId: "object-1",
        },
      ]);
    });
    await waitFor(() => {
      expect(
        screen.queryByAltText("SAM2 mask for object-1"),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByText("Selected object has no mask on current frame."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next frame" }));

    expect(await screen.findByText("Canonical frame 8")).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
  });

  it("shows frame-local cleanup errors and keeps current mask visible", async () => {
    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [
              {
                box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
                mask: {
                  path: "masks/video-123/object-1/frame_000007.png",
                },
                object_id: "object-1",
                source: "sam2",
              },
            ],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", ({ params }) =>
        HttpResponse.json({
          bbox_xyxy_px: [384, 270, 960, 648],
          label: "pedestrian_01",
          mask_confidence: 0.91,
          object_id: params.objectId,
          track_summary: {
            corrected: null,
            frames: 2,
            propagated: 1,
          },
          video_id: params.videoId,
        }),
      ),
      http.delete(
        "/api/videos/:videoId/annotations/frame/:frameIdx/object/:objectId/mask",
        () =>
          HttpResponse.json(
            {
              detail: "Mask cleanup blocked",
            },
            { status: 409 },
          ),
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    const cleanupButton = screen.getByRole("button", {
      name: "Clear frame mask",
    });

    fireEvent.play(screen.getByLabelText("Playback preview"));
    await waitFor(() => {
      expect(cleanupButton).toBeDisabled();
    });

    fireEvent.pause(screen.getByLabelText("Playback preview"));
    await waitFor(() => {
      expect(cleanupButton).toBeEnabled();
    });

    await user.click(cleanupButton);

    expect(await screen.findByText("Mask cleanup blocked")).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
  });

  it("clears selected object masks across frames without touching other objects", async () => {
    const cleanupRequests: Array<{ objectId: string }> = [];
    const selectedObjectMaskFrames = new Set([7, 8]);
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
            {
              color: "#ff8800",
              id: "object-2",
              label: "cyclist_02",
              status: "active",
            },
          ],
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) => {
          const frameIdx = Number(params.frameIdx);

          return HttpResponse.json({
            annotations: [
              ...(selectedObjectMaskFrames.has(frameIdx)
                ? [
                    {
                      box_xywh_norm:
                        frameIdx === 7 ? [0.2, 0.25, 0.3, 0.35] : null,
                      mask: {
                        path: `masks/video-123/object-1/frame_${String(frameIdx).padStart(6, "0")}.png`,
                      },
                      object_id: "object-1",
                      source: "sam2",
                    },
                  ]
                : []),
              {
                box_xywh_norm: frameIdx === 7 ? [0.45, 0.2, 0.2, 0.25] : null,
                mask: {
                  path: `masks/video-123/object-2/frame_${String(frameIdx).padStart(6, "0")}.png`,
                },
                object_id: "object-2",
                source: "sam2",
              },
            ],
            frame_idx: frameIdx,
          });
        },
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", ({ params }) =>
        HttpResponse.json({
          bbox_xyxy_px:
            params.objectId === "object-1" && selectedObjectMaskFrames.has(7)
              ? [384, 270, 960, 648]
              : [960, 216, 1344, 486],
          label:
            params.objectId === "object-1" ? "pedestrian_01" : "cyclist_02",
          mask_confidence: params.objectId === "object-1" ? 0.91 : 0.87,
          object_id: params.objectId,
          track_summary: {
            corrected: null,
            frames: 2,
            propagated:
              params.objectId === "object-1"
                ? selectedObjectMaskFrames.size - 1
                : 1,
          },
          video_id: params.videoId,
        }),
      ),
      http.delete(
        "/api/videos/:videoId/annotations/object/:objectId/masks",
        ({ params }) => {
          cleanupRequests.push({
            objectId: String(params.objectId),
          });
          selectedObjectMaskFrames.clear();
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Remove selected object masks on all frames. Keep object track and boxes.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-2"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Clear object masks" }),
    );

    await waitFor(() => {
      expect(cleanupRequests).toEqual([{ objectId: "object-1" }]);
    });
    await waitFor(() => {
      expect(
        screen.queryByAltText("SAM2 mask for object-1"),
      ).not.toBeInTheDocument();
    });
    expect(
      await screen.findByAltText("SAM2 mask for object-2"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next frame" }));

    expect(await screen.findByText("Canonical frame 8")).toBeInTheDocument();
    expect(
      screen.queryByAltText("SAM2 mask for object-1"),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-2"),
    ).toBeInTheDocument();
  });

  it("deletes selected object track, reloads manifest truth, and clears stale inspector summary", async () => {
    const deleteRequests: Array<{ objectId: string }> = [];
    let manifestObjects = [
      {
        color: "#00ffaa",
        id: "object-1",
        label: "pedestrian_01",
        status: "active",
      },
      {
        color: "#ffaa00",
        id: "object-2",
        label: "cyclist_02",
        status: "active",
      },
    ];

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
          keyframes: [7],
          objects: manifestObjects,
          video: {
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get("/api/videos/:videoId/annotations/frame/:frameIdx", () =>
        HttpResponse.json({
          annotations:
            manifestObjects.length === 2
              ? [
                  {
                    box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
                    mask: {
                      path: "masks/video-123/object-1/frame_000007.png",
                    },
                    object_id: "object-1",
                    source: "sam2",
                  },
                  {
                    box_xywh_norm: [0.45, 0.2, 0.2, 0.25],
                    mask: {
                      path: "masks/video-123/object-2/frame_000007.png",
                    },
                    object_id: "object-2",
                    source: "sam2",
                  },
                ]
              : [
                  {
                    box_xywh_norm: [0.45, 0.2, 0.2, 0.25],
                    mask: {
                      path: "masks/video-123/object-2/frame_000007.png",
                    },
                    object_id: "object-2",
                    source: "sam2",
                  },
                ],
          frame_idx: 7,
        }),
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params }) => {
          if (params.objectId === "object-1" && manifestObjects.length === 1) {
            return HttpResponse.json(
              {
                detail: "Object track not found",
              },
              { status: 404 },
            );
          }

          return HttpResponse.json({
            bbox_xyxy_px:
              params.objectId === "object-1"
                ? [384, 270, 960, 648]
                : [960, 216, 1344, 486],
            label:
              params.objectId === "object-1" ? "pedestrian_01" : "cyclist_02",
            mask_confidence: params.objectId === "object-1" ? 0.91 : 0.87,
            object_id: params.objectId,
            track_summary: {
              corrected: params.objectId === "object-1" ? 1 : null,
              frames: 1,
              propagated: 0,
            },
            video_id: params.videoId,
          });
        },
      ),
      http.delete("/api/videos/:videoId/objects/:objectId", ({ params }) => {
        deleteRequests.push({
          objectId: String(params.objectId),
        });
        manifestObjects = [manifestObjects[1]];
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("2 OBJ")).toBeInTheDocument();
    const inspector = screen.getByLabelText("Selected object inspector");
    expect(within(inspector).getByText("pedestrian_01")).toBeInTheDocument();
    expect(await within(inspector).findByText("0.91")).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-2"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete object track" }),
    );

    await waitFor(() => {
      expect(deleteRequests).toEqual([{ objectId: "object-1" }]);
    });
    await waitFor(() => {
      expect(screen.getByText("1 OBJ")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(within(inspector).getByText("cyclist_02")).toBeInTheDocument();
    });
    expect(
      within(inspector).queryByText("pedestrian_01"),
    ).not.toBeInTheDocument();
    expect(within(inspector).getByText("0.87")).toBeInTheDocument();
    expect(
      screen.queryByAltText("SAM2 mask for object-1"),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-2"),
    ).toBeInTheDocument();
  });

  it("disables frame-local cleanup while corrected mask save is in flight", async () => {
    let resolveRefineRequest!: () => void;
    const refinePending = new Promise<void>((resolve) => {
      resolveRefineRequest = () => {
        resolve();
      };
    });

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [
              {
                box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
                mask: {
                  path: "masks/video-123/object-1/frame_000007.png",
                },
                object_id: "object-1",
                source: "sam2",
              },
            ],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", ({ params }) =>
        HttpResponse.json({
          bbox_xyxy_px: [384, 270, 960, 648],
          label: "pedestrian_01",
          mask_confidence: 0.91,
          object_id: params.objectId,
          track_summary: {
            corrected: null,
            frames: 2,
            propagated: 1,
          },
          video_id: params.videoId,
        }),
      ),
      http.post("/api/videos/:videoId/sam2/session", () =>
        HttpResponse.json({
          reused: false,
          session_id: "sam2-session-1",
        }),
      ),
      http.post("/api/videos/:videoId/sam2/refine-mask", async () => {
        await refinePending;
        return HttpResponse.json({
          annotation: {
            box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
            mask: {
              path: "masks/video-123/object-1/frame_000007.png",
            },
            mask_confidence: null,
            object_id: "object-1",
            source: "sam2_edited",
          },
          frame_idx: 7,
        });
      }),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Correct mask" }));

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });
    drawBrushStroke(canvas, {
      end: { x: 260, y: 120 },
      start: { x: 220, y: 100 },
    });

    await user.click(
      screen.getByRole("button", { name: "Save corrected mask" }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Clear frame mask" }),
      ).toBeDisabled();
    });

    resolveRefineRequest();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Clear frame mask" }),
      ).toBeEnabled();
    });
  });

  it("supports refine keyboard brushes plus clear and cancel reset controls", async () => {
    const currentAnnotation = {
      box_xywh_norm: [0.2, 0.25, 0.3, 0.35] as [number, number, number, number],
      mask: {
        path: "masks/video-123/object-1/frame_000007.png",
      },
      object_id: "object-1",
      source: "sam2" as "sam2" | "sam2_edited",
    };

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get(
        "/api/videos/:videoId/frame/:frameIdx",
        ({ params }) =>
          new HttpResponse(new Blob([`frame-${String(params.frameIdx)}`]), {
            headers: {
              "content-type": "image/png",
            },
            status: 200,
          }),
      ),
      http.get(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        ({ params }) =>
          HttpResponse.json({
            annotations: [
              {
                ...currentAnnotation,
              },
            ],
            frame_idx: Number(params.frameIdx),
          }),
      ),
      http.get("/api/videos/:videoId/objects/:objectId/summary", ({ params }) =>
        HttpResponse.json({
          bbox_xyxy_px: [384, 270, 960, 648],
          label: "pedestrian_01",
          mask_confidence: currentAnnotation.source === "sam2" ? 0.91 : null,
          object_id: params.objectId,
          track_summary: {
            corrected: currentAnnotation.source === "sam2" ? null : 1,
            frames: 35,
            propagated: 5,
          },
          video_id: params.videoId,
        }),
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Correct mask" }));

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    fireEvent.keyDown(window, { code: "KeyE", key: "e" });
    expect(
      screen.getByText(/erase prompts for same-frame refine/i),
    ).toBeInTheDocument();

    drawBrushStroke(canvas, {
      end: { x: 150, y: 80 },
      start: { x: 100, y: 60 },
    });

    expect(screen.getByText("2 points")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear strokes" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Clear strokes" }));
    expect(screen.getByText("0 points")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save corrected mask" }),
    ).toBeDisabled();

    fireEvent.keyDown(window, { code: "KeyM", key: "m" });
    expect(
      screen.getByText(/add prompts for same-frame refine/i),
    ).toBeInTheDocument();

    drawBrushStroke(canvas, {
      end: { x: 260, y: 120 },
      start: { x: 220, y: 100 },
    });
    expect(screen.getByText("2 points")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel correction" }));
    expect(
      screen.queryByRole("button", { name: "Save corrected mask" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Correct mask" }));
    expect(screen.getByText("0 points")).toBeInTheDocument();
  });

  it("runs SAM2, polls propagation, cancels job, and reopens persisted masks", async () => {
    const propagationRequests: Array<{
      direction: string;
      end_frame_idx: number | null;
      object_ids: string[];
      session_id: string;
      start_frame_idx: number;
    }> = [];
    const annotationsByFrame: Record<
      number,
      Array<{
        box_xywh_norm: [number, number, number, number] | null;
        mask: { path: string } | null;
        object_id: string;
        source: "manual" | "sam2";
      }>
    > = {
      7: [],
    };
    let jobStatusRequestCount = 0;

    server.use(
      http.get("/api/videos", () => HttpResponse.json([sampleVideo])),
      http.get("/api/videos/:videoId", () => HttpResponse.json(sampleVideo)),
      http.get("/api/videos/:videoId/manifest", () =>
        HttpResponse.json({
          annotated_frames: [7],
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
            duration_seconds: sampleVideo.duration_seconds,
            fps: sampleVideo.fps,
            frame_count: sampleVideo.frame_count,
            height: sampleVideo.height,
            id: sampleVideo.id,
            width: sampleVideo.width,
          },
        }),
      ),
      http.get("/api/videos/:videoId/frame/:frameIdx", ({ params }) => {
        const frameIdx = Number(params.frameIdx);
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
          return HttpResponse.json({
            annotations: annotationsByFrame[frameIdx] ?? [],
            frame_idx: frameIdx,
          });
        },
      ),
      http.get(
        "/api/videos/:videoId/objects/:objectId/summary",
        ({ params, request }) =>
          HttpResponse.json({
            bbox_xyxy_px: null,
            frame_idx: Number(
              new URL(request.url).searchParams.get("frame_idx") ?? "0",
            ),
            label: "pedestrian_01",
            mask_confidence: null,
            object_id: String(params.objectId),
            track_summary: {
              corrected: null,
              frames: null,
              propagated: null,
            },
          }),
      ),
      http.put(
        "/api/videos/:videoId/annotations/frame/:frameIdx",
        async ({ params, request }) => {
          const frameIdx = Number(params.frameIdx);
          const payload = (await request.json()) as {
            box_xywh_norm: [number, number, number, number];
            is_keyframe: boolean;
            object_id: string;
          };
          annotationsByFrame[frameIdx] = [
            {
              box_xywh_norm: payload.box_xywh_norm,
              mask: null,
              object_id: payload.object_id,
              source: "manual",
            },
          ];

          return HttpResponse.json({
            box_xywh_norm: payload.box_xywh_norm,
            frame_idx: frameIdx,
            is_keyframe: payload.is_keyframe,
            mask: {
              path: null,
            },
            object_id: payload.object_id,
            source: "manual",
            video_id: sampleVideo.id,
          });
        },
      ),
      http.post("/api/videos/:videoId/sam2/session", () =>
        HttpResponse.json({
          reused: false,
          session_id: "sam2-session-1",
        }),
      ),
      http.post("/api/videos/:videoId/sam2/prompt-box", async ({ request }) => {
        const payload = (await request.json()) as {
          object_id: string;
        };
        const sam2Annotation = {
          box_xywh_norm: [0.1, 0.1, 0.4, 0.4] as [
            number,
            number,
            number,
            number,
          ],
          mask: {
            path: "masks/video-123/object-1/frame_000007.png",
          },
          object_id: payload.object_id,
          source: "sam2" as const,
        };
        annotationsByFrame[7] = [
          ...annotationsByFrame[7].filter(
            (annotation) => annotation.object_id !== payload.object_id,
          ),
          sam2Annotation,
        ];

        return HttpResponse.json({
          annotation: sam2Annotation,
          frame_idx: 7,
        });
      }),
      http.post("/api/videos/:videoId/sam2/propagate", async ({ request }) => {
        propagationRequests.push(
          (await request.json()) as {
            direction: string;
            end_frame_idx: number | null;
            object_ids: string[];
            session_id: string;
            start_frame_idx: number;
          },
        );

        return HttpResponse.json(
          {
            job_id: "job-1",
            progress_current: 0,
            progress_total: 2,
            status: "queued",
          },
          { status: 202 },
        );
      }),
      http.get("/api/jobs/:jobId", () => {
        jobStatusRequestCount += 1;
        annotationsByFrame[8] = [
          {
            box_xywh_norm: null,
            mask: {
              path: "masks/video-123/object-1/frame_000008.png",
            },
            object_id: "object-1",
            source: "sam2",
          },
        ];

        if (jobStatusRequestCount === 1) {
          return HttpResponse.json({
            error_message: null,
            job_id: "job-1",
            progress_current: 1,
            progress_total: 2,
            result: {
              persisted_frame_count: 1,
              persisted_frame_indices: [8],
            },
            status: "running",
            type: "sam2_propagation",
          });
        }

        return HttpResponse.json({
          error_message: null,
          job_id: "job-1",
          progress_current: 1,
          progress_total: 2,
          result: {
            persisted_frame_count: 1,
            persisted_frame_indices: [8],
          },
          status: "cancelled",
          type: "sam2_propagation",
        });
      }),
      http.post("/api/jobs/:jobId/cancel", () =>
        HttpResponse.json(
          {
            job_id: "job-1",
            status: "cancelling",
          },
          { status: 202 },
        ),
      ),
    );

    const user = userEvent.setup();

    render(<LiveReviewScreen />);

    await user.click(
      await screen.findByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    );

    const frameInput = screen.getByLabelText("Frame number");
    await user.clear(frameInput);
    await user.type(frameInput, "7");
    await user.click(screen.getByRole("button", { name: "Load frame" }));
    await screen.findByText("Canonical frame 7");

    const canvas = await screen.findByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    drawBox(canvas, {
      end: { x: 200, y: 100 },
      start: { x: 40, y: 20 },
    });

    await user.click(screen.getByRole("button", { name: "Run SAM2" }));
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();

    const timelineScrubber = screen.getByRole("slider", {
      name: "Timeline scrubber",
    });
    mockTimelineBounds(timelineScrubber, {
      height: 24,
      width: 410,
      x: 10,
      y: 20,
    });
    fireEvent.pointerDown(timelineScrubber, {
      button: 0,
      clientX: 80,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerMove(timelineScrubber, {
      buttons: 1,
      clientX: 126,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerUp(timelineScrubber, {
      clientX: 126,
      clientY: 24,
      pointerId: 1,
    });

    expect(await screen.findByText("Canonical frame 11")).toBeInTheDocument();
    const timeline = screen.getByRole("region", { name: "Review timeline" });
    await waitFor(() => {
      expect(within(timeline).getByText("11-41")).toBeInTheDocument();
    });

    const endFrameInput = screen.getByLabelText("Range boundary frame");
    await user.clear(endFrameInput);
    await user.type(endFrameInput, "6");
    await user.click(screen.getByRole("button", { name: "Start propagation" }));

    await waitFor(() => {
      expect(propagationRequests).toContainEqual({
        direction: "forward",
        end_frame_idx: 11,
        object_ids: ["object-1"],
        session_id: "sam2-session-1",
        start_frame_idx: 11,
      });
    });
    expect(
      await screen.findByText("Propagation job queued"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Propagation job running", undefined, {
        timeout: 2000,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Progress 1 / 2", undefined, {
        timeout: 2000,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Cancel propagation" }),
    );
    expect(
      await screen.findByText("Propagation job cancelling"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Propagation job cancelled", undefined, {
        timeout: 2000,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open frame 8" }));

    expect(await screen.findByText("Canonical frame 8")).toBeInTheDocument();
    expect(
      await screen.findByAltText("SAM2 mask for object-1"),
    ).toBeInTheDocument();
  }, 10000);
});

function mockCanvasBounds(
  element: HTMLElement,
  bounds: { x: number; y: number; width: number; height: number },
) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    bottom: bounds.y + bounds.height,
    height: bounds.height,
    left: bounds.x,
    right: bounds.x + bounds.width,
    top: bounds.y,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
    toJSON: () => bounds,
  });
}

function mockTimelineBounds(
  element: HTMLElement,
  bounds: { x: number; y: number; width: number; height: number },
) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    bottom: bounds.y + bounds.height,
    height: bounds.height,
    left: bounds.x,
    right: bounds.x + bounds.width,
    top: bounds.y,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
    toJSON: () => bounds,
  });
}

function drawBox(
  canvas: HTMLElement,
  points: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  },
) {
  fireEvent.pointerDown(canvas, {
    button: 0,
    buttons: 1,
    clientX: points.start.x,
    clientY: points.start.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerMove(canvas, {
    buttons: 1,
    clientX: points.end.x,
    clientY: points.end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerUp(canvas, {
    clientX: points.end.x,
    clientY: points.end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
}

function moveBox(
  canvas: HTMLElement,
  target: HTMLElement,
  points: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  },
) {
  fireEvent.pointerDown(target, {
    button: 0,
    buttons: 1,
    clientX: points.start.x,
    clientY: points.start.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerMove(canvas, {
    buttons: 1,
    clientX: points.end.x,
    clientY: points.end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerUp(canvas, {
    clientX: points.end.x,
    clientY: points.end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
}

function resizeBox(
  canvas: HTMLElement,
  handle: HTMLElement,
  end: { x: number; y: number },
) {
  fireEvent.pointerDown(handle, {
    button: 0,
    buttons: 1,
    clientX: end.x,
    clientY: end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerMove(canvas, {
    buttons: 1,
    clientX: end.x,
    clientY: end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerUp(canvas, {
    clientX: end.x,
    clientY: end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
}

function drawBrushStroke(
  canvas: HTMLElement,
  points: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  },
) {
  fireEvent.pointerDown(canvas, {
    button: 0,
    buttons: 1,
    clientX: points.start.x,
    clientY: points.start.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerMove(canvas, {
    buttons: 1,
    clientX: points.end.x,
    clientY: points.end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
  fireEvent.pointerUp(canvas, {
    clientX: points.end.x,
    clientY: points.end.y,
    pointerId: 1,
    pointerType: "mouse",
  });
}
