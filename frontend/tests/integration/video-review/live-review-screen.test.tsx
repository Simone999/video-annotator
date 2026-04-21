// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
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

  it("bootstraps live review from initial video id for direct review routes", async () => {
    const requestedFrameIndices: number[] = [];
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
    );

    render(<LiveReviewScreen initialVideoId={sampleVideo.id} />);

    expect(
      await screen.findByRole("heading", { name: "Review surface" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Canonical frame 7")).toBeInTheDocument();
    expect(await screen.findByAltText("Exact frame 7")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Open street_scene_014.mp4",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(requestedFrameIndices).toEqual([7]);
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

  it("runs SAM2, polls propagation, cancels job, and reopens persisted masks", async () => {
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
      http.post("/api/videos/:videoId/sam2/propagate", () =>
        HttpResponse.json(
          {
            job_id: "job-1",
            progress_current: 0,
            progress_total: 2,
            status: "queued",
          },
          { status: 202 },
        ),
      ),
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

    const endFrameInput = screen.getByLabelText("Propagation end frame");
    await user.clear(endFrameInput);
    await user.type(endFrameInput, "9");
    await user.click(screen.getByRole("button", { name: "Start propagation" }));

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
