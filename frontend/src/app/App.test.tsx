// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

const indexedVideos = [
  {
    id: "video-123",
    source_path: "/videos/sample-a.mp4",
    display_name: "sample-a.mp4",
    frame_count: 42,
    fps: 24,
    width: 1920,
    height: 1080,
    duration_seconds: 1.75,
  },
  {
    id: "video-456",
    source_path: "/videos/sample-b.mp4",
    display_name: "sample-b.mp4",
    frame_count: 84,
    fps: 30,
    width: 1280,
    height: 720,
    duration_seconds: 2.8,
  },
] as const;

describe("app video review workspace", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows a loading state before indexed videos arrive", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(() => new Promise(() => undefined));

    render(<App />);

    expect(screen.getByText("Loading indexed videos...")).toBeTruthy();
  });

  it("renders an empty state when no indexed videos are available", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(createJsonResponse([]));

    render(<App />);

    expect(
      await screen.findByText("No indexed videos found yet."),
    ).toBeTruthy();
  });

  it("loads detail state and marks a selected video as active", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456")) {
        return Promise.resolve(createJsonResponse(indexedVideos[1]));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(
          createJsonResponse(createVideoManifestPayload(indexedVideos[1])),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    expect(await screen.findByText("Review target")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Open sample-b.mp4" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456", {
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("renders a playback pane and backend metadata for the selected video", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456")) {
        return Promise.resolve(createJsonResponse(indexedVideos[1]));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(
          createJsonResponse(createVideoManifestPayload(indexedVideos[1])),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    expect(await screen.findByLabelText("Playback preview")).toBeTruthy();
    expect(screen.getByText("Frame count")).toBeTruthy();
    expect(screen.getByText("84")).toBeTruthy();
    expect(screen.getByText("FPS")).toBeTruthy();
    expect(screen.getByText("30")).toBeTruthy();
    expect(screen.getByText("Resolution")).toBeTruthy();
    expect(screen.getByText("1280 x 720")).toBeTruthy();
    expect(screen.getByText("Duration")).toBeTruthy();
    expect(screen.getByText("2.80s")).toBeTruthy();
    expect(
      screen.getByText(
        "Playback stays contextual only. Canonical review frame comes from backend frame index state.",
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText("Playback preview").getAttribute("src")).toBe(
      "/api/videos/video-456/source",
    );
  });

  it("renders object panel from manifest data and removes raw object-id input", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456")) {
        return Promise.resolve(createJsonResponse(indexedVideos[1]));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(
          createJsonResponse(
            createVideoManifestPayload(indexedVideos[1], {
              objects: [
                {
                  color: "#00ffaa",
                  id: "object-1",
                  label: "left hand",
                  status: "active",
                },
                {
                  color: "#ff8855",
                  id: "object-2",
                  label: "right hand",
                  status: "active",
                },
              ],
            }),
          ),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    expect(await screen.findByText("Review objects")).toBeTruthy();
    expect(screen.getByText("object-1")).toBeTruthy();
    expect(screen.getByText("object-2")).toBeTruthy();
    expect(screen.queryByLabelText("Object ID")).toBeNull();

    const rightHandButton = screen.getByRole("button", { name: /right hand/i });
    fireEvent.click(rightHandButton);

    expect(rightHandButton.getAttribute("aria-pressed")).toBe("true");
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/manifest", {
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("creates a new object from panel and selects it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (
          url.endsWith("/api/videos/video-123/objects") &&
          init?.method === "POST"
        ) {
          expect(init.body).toBe(JSON.stringify({ label: "right hand" }));
          return Promise.resolve(
            createJsonResponse({
              color: "#ff8855",
              id: "object-2",
              label: "right hand",
              status: "active",
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("New object label"), {
      target: { value: "right hand" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create object" }));

    const createdObjectButton = await screen.findByRole("button", {
      name: /right hand/i,
    });

    expect(createdObjectButton.getAttribute("aria-pressed")).toBe("true");
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-123/objects", {
      body: JSON.stringify({
        label: "right hand",
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  });

  it("opts the exact-frame pane out of browser scroll anchoring", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValue(createJsonResponse(indexedVideos));

    render(<App />);

    expect(screen.getByLabelText("Exact-frame pane").style.overflowAnchor).toBe(
      "none",
    );
  });

  it("loads canonical exact frames from jump-to-frame input and allows same-frame reloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456")) {
        return Promise.resolve(createJsonResponse(indexedVideos[1]));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(
          createJsonResponse(createVideoManifestPayload(indexedVideos[1])),
        );
      }

      if (url.endsWith("/api/videos/video-456/frame/7")) {
        return Promise.resolve(createImageResponse("frame-7-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/7")) {
        return Promise.resolve(
          createJsonResponse({
            annotations: [],
            frame_idx: 7,
          }),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    const createObjectUrlSpy = vi
      .fn<(blob: Blob) => string>()
      .mockReturnValueOnce("blob:frame-7-a")
      .mockReturnValueOnce("blob:frame-7-b");
    const revokeObjectUrlSpy = vi.fn<(url: string) => void>();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectUrlSpy,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectUrlSpy,
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    const frameInput = await screen.findByLabelText("Frame number");
    fireEvent.change(frameInput, {
      target: { value: "7" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();
    expect(screen.getByText("Canonical frame 7")).toBeTruthy();
    expect(screen.getByText("Canonical exact-frame index: 7")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/frame/7", {
      headers: {
        Accept: "image/png",
      },
    });
    expect(screen.getByAltText("Exact frame 7").getAttribute("src")).toBe(
      "blob:frame-7-a",
    );

    fireEvent.change(frameInput, {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledTimes(7);
    await waitFor(() => {
      expect(screen.getByAltText("Exact frame 7").getAttribute("src")).toBe(
        "blob:frame-7-b",
      );
    });
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:frame-7-a");
  });

  it("persists a drawn manual box and reloads it on the same canonical frame", async () => {
    let frameAnnotationCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
        }

        if (
          url.endsWith("/api/videos/video-123/annotations/frame/7") &&
          init?.method === "PUT"
        ) {
          return Promise.resolve(
            createJsonResponse({
              box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
              frame_idx: 7,
              is_keyframe: true,
              mask: {
                path: null,
              },
              object_id: "object-1",
              source: "manual",
              video_id: "video-123",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/7")) {
          frameAnnotationCallCount += 1;

          return Promise.resolve(
            createJsonResponse({
              annotations:
                frameAnnotationCallCount === 1
                  ? []
                  : [
                      {
                        box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
                        mask: null,
                        object_id: "object-1",
                        source: "manual",
                      },
                    ],
              frame_idx: 7,
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn<(blob: Blob) => string>().mockReturnValue("blob:frame-7"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    const frameInput = await screen.findByLabelText("Frame number");
    fireEvent.change(frameInput, {
      target: { value: "7" },
    });
    await waitFor(() => {
      expect((frameInput as HTMLInputElement).value).toBe("7");
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();

    const exactFrameCanvas = screen.getByLabelText("Exact frame canvas");
    Object.defineProperty(exactFrameCanvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 100,
        height: 100,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }),
    });

    fireEvent.pointerDown(exactFrameCanvas, {
      button: 0,
      clientX: 10,
      clientY: 20,
      pointerId: 1,
    });
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 40,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 40,
      clientY: 60,
      pointerId: 1,
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/videos/video-123/annotations/frame/7",
        {
          body: JSON.stringify({
            box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
            is_keyframe: true,
            object_id: "object-1",
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PUT",
        },
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(
      await screen.findByLabelText("Saved annotation box for object-1"),
    ).toBeTruthy();
    expect(screen.getByText("Canonical exact-frame index: 7")).toBeTruthy();
    expect(frameAnnotationCallCount).toBe(2);
  });

  it("moves, resizes, and deletes a saved manual box on the current canonical frame", async () => {
    let readCallCount = 0;
    let putCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
        }

        if (
          url.endsWith("/api/videos/video-123/annotations/frame/7") &&
          init?.method === "PUT"
        ) {
          putCallCount += 1;
          const payload =
            putCallCount === 1
              ? {
                  box_xywh_norm: [0.4, 0.5, 0.3, 0.4],
                  frame_idx: 7,
                  is_keyframe: true,
                  mask: {
                    path: null,
                  },
                  object_id: "object-1",
                  source: "manual",
                  video_id: "video-123",
                }
              : {
                  box_xywh_norm: [0.4, 0.5, 0.45, 0.45],
                  frame_idx: 7,
                  is_keyframe: true,
                  mask: {
                    path: null,
                  },
                  object_id: "object-1",
                  source: "manual",
                  video_id: "video-123",
                };

          return Promise.resolve(createJsonResponse(payload));
        }

        if (
          url.endsWith(
            "/api/videos/video-123/annotations/frame/7/object/object-1",
          ) &&
          init?.method === "DELETE"
        ) {
          return Promise.resolve(
            new Response(null, {
              status: 204,
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/7")) {
          readCallCount += 1;
          const annotations =
            readCallCount >= 2
              ? []
              : [
                  {
                    box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
                    mask: null,
                    object_id: "object-1",
                    source: "manual",
                  },
                ];

          return Promise.resolve(
            createJsonResponse({
              annotations,
              frame_idx: 7,
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn<(blob: Blob) => string>().mockReturnValue("blob:frame-7"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("Frame number"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(
      await screen.findByLabelText("Saved annotation box for object-1"),
    ).toBeTruthy();

    const exactFrameCanvas = screen.getByLabelText("Exact frame canvas");
    Object.defineProperty(exactFrameCanvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 100,
        height: 100,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }),
    });

    fireEvent.pointerDown(exactFrameCanvas, {
      button: 0,
      clientX: 20,
      clientY: 30,
      pointerId: 1,
    });
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 50,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 50,
      clientY: 60,
      pointerId: 1,
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/videos/video-123/annotations/frame/7",
        {
          body: JSON.stringify({
            box_xywh_norm: [0.4, 0.5, 0.3, 0.4],
            is_keyframe: true,
            object_id: "object-1",
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PUT",
        },
      );
    });

    fireEvent.pointerDown(
      screen.getByLabelText("Resize saved annotation box for object-1"),
      {
        button: 0,
        clientX: 70,
        clientY: 90,
        pointerId: 2,
      },
    );
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 85,
      clientY: 95,
      pointerId: 2,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 85,
      clientY: 95,
      pointerId: 2,
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/videos/video-123/annotations/frame/7",
        {
          body: JSON.stringify({
            box_xywh_norm: [0.4, 0.5, 0.45, 0.45],
            is_keyframe: true,
            object_id: "object-1",
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PUT",
        },
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete saved box" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/videos/video-123/annotations/frame/7/object/object-1",
        {
          method: "DELETE",
        },
      );
    });

    expect(
      screen.queryByLabelText("Saved annotation box for object-1"),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    await waitFor(() => {
      expect(
        screen.queryByLabelText("Saved annotation box for object-1"),
      ).toBeNull();
    });
  });

  it("steps to previous and next exact frames while clamping at video bounds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456")) {
        return Promise.resolve(createJsonResponse(indexedVideos[1]));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(
          createJsonResponse(createVideoManifestPayload(indexedVideos[1])),
        );
      }

      if (url.endsWith("/api/videos/video-456/frame/0")) {
        return Promise.resolve(createImageResponse("frame-0-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/0")) {
        return Promise.resolve(
          createJsonResponse({
            annotations: [],
            frame_idx: 0,
          }),
        );
      }

      if (url.endsWith("/api/videos/video-456/frame/1")) {
        return Promise.resolve(createImageResponse("frame-1-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/1")) {
        return Promise.resolve(
          createJsonResponse({
            annotations: [],
            frame_idx: 1,
          }),
        );
      }

      if (url.endsWith("/api/videos/video-456/frame/82")) {
        return Promise.resolve(createImageResponse("frame-82-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/82")) {
        return Promise.resolve(
          createJsonResponse({
            annotations: [],
            frame_idx: 82,
          }),
        );
      }

      if (url.endsWith("/api/videos/video-456/frame/83")) {
        return Promise.resolve(createImageResponse("frame-83-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/83")) {
        return Promise.resolve(
          createJsonResponse({
            annotations: [],
            frame_idx: 83,
          }),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi
        .fn<(blob: Blob) => string>()
        .mockReturnValueOnce("blob:frame-0")
        .mockReturnValueOnce("blob:frame-1")
        .mockReturnValueOnce("blob:frame-82")
        .mockReturnValueOnce("blob:frame-83"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    fireEvent.click(await screen.findByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 0")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Previous frame" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Next frame" })
        .hasAttribute("disabled"),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Next frame" }));

    expect(await screen.findByAltText("Exact frame 1")).toBeTruthy();
    expect(screen.getByText("Canonical frame 1")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByDisplayValue("1")).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText("Frame number"), {
      target: { value: "83" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 83")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Next frame" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Previous frame" })
        .hasAttribute("disabled"),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Previous frame" }));

    expect(await screen.findByAltText("Exact frame 82")).toBeTruthy();
    expect(screen.getByText("Canonical frame 82")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByDisplayValue("82")).toBeTruthy();
    });
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/frame/0", {
      headers: {
        Accept: "image/png",
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/frame/1", {
      headers: {
        Accept: "image/png",
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/frame/83", {
      headers: {
        Accept: "image/png",
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/frame/82", {
      headers: {
        Accept: "image/png",
      },
    });
  });

  it("draws a box, runs SAM2, and keeps persisted mask overlay after reloading same frame", async () => {
    const frameAnnotationsByCall = [
      { annotations: [] },
      {
        annotations: [
          {
            object_id: "object-1",
            source: "sam2",
            box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
            mask: {
              path: "masks/video-123/object-1/frame_000007.png",
            },
          },
        ],
      },
    ];
    let frameAnnotationCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
        }

        if (
          url.endsWith("/api/videos/video-123/annotations/frame/7") &&
          init?.method === "PUT"
        ) {
          return Promise.resolve(
            createJsonResponse({
              box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
              frame_idx: 7,
              is_keyframe: true,
              mask: {
                path: null,
              },
              object_id: "object-1",
              source: "manual",
              video_id: "video-123",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/7")) {
          const payload =
            frameAnnotationsByCall[
              Math.min(
                frameAnnotationCallCount,
                frameAnnotationsByCall.length - 1,
              )
            ];
          frameAnnotationCallCount += 1;
          return Promise.resolve(
            createJsonResponse({ frame_idx: 7, ...payload }),
          );
        }

        if (
          url.endsWith("/api/videos/video-123/sam2/session") &&
          init?.method === "POST"
        ) {
          return Promise.resolve(
            createJsonResponse({
              reused: false,
              session_id: "sam2-session-1",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/sam2/prompt-box")) {
          expect(init?.method).toBe("POST");
          expect(init?.body).toBe(
            JSON.stringify({
              box_xyxy_px: [10, 20, 90, 60],
              frame_idx: 7,
              object_id: "object-1",
              session_id: "sam2-session-1",
            }),
          );
          return Promise.resolve(
            createJsonResponse({
              frame_idx: 7,
              annotation: {
                object_id: "object-1",
                source: "sam2",
                box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
                mask: {
                  path: "masks/video-123/object-1/frame_000007.png",
                },
              },
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn<(blob: Blob) => string>().mockReturnValue("blob:frame-7"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("Frame number"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();

    const exactFrameCanvas = screen.getByLabelText("Exact frame canvas");
    Object.defineProperty(exactFrameCanvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 1080,
        height: 1080,
        left: 0,
        right: 1920,
        top: 0,
        width: 1920,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }),
    });

    fireEvent.pointerDown(exactFrameCanvas, {
      button: 0,
      clientX: 10,
      clientY: 20,
      pointerId: 1,
    });
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });

    expect(screen.getByText("Draft box ready for object-1")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Run SAM2" }));

    expect(await screen.findByAltText("SAM2 mask for object-1")).toBeTruthy();
    expect(
      screen.getByAltText("SAM2 mask for object-1").getAttribute("src"),
    ).toBe("/api/videos/video-123/annotations/frame/7/object/object-1/mask");

    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("SAM2 mask for object-1")).toBeTruthy();
    expect(frameAnnotationCallCount).toBe(2);
  });

  it("shows SAM2 prompt errors without changing canonical frame index", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
        }

        if (
          url.endsWith("/api/videos/video-123/annotations/frame/7") &&
          init?.method === "PUT"
        ) {
          return Promise.resolve(
            createJsonResponse({
              box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
              frame_idx: 7,
              is_keyframe: true,
              mask: {
                path: null,
              },
              object_id: "object-1",
              source: "manual",
              video_id: "video-123",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/7")) {
          return Promise.resolve(
            createJsonResponse({ frame_idx: 7, annotations: [] }),
          );
        }

        if (
          url.endsWith("/api/videos/video-123/sam2/session") &&
          init?.method === "POST"
        ) {
          return Promise.resolve(
            createJsonResponse({
              reused: false,
              session_id: "sam2-session-1",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/sam2/prompt-box")) {
          return Promise.resolve(
            new Response(JSON.stringify({ detail: "Prompt failed" }), {
              headers: {
                "content-type": "application/json",
              },
              status: 400,
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn<(blob: Blob) => string>().mockReturnValue("blob:frame-7"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("Frame number"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));
    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();

    const exactFrameCanvas = screen.getByLabelText("Exact frame canvas");
    Object.defineProperty(exactFrameCanvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 1080,
        height: 1080,
        left: 0,
        right: 1920,
        top: 0,
        width: 1920,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }),
    });

    fireEvent.pointerDown(exactFrameCanvas, {
      button: 0,
      clientX: 10,
      clientY: 20,
      pointerId: 1,
    });
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "Run SAM2" }));

    expect(await screen.findByText("Prompt failed")).toBeTruthy();
    expect(screen.getByText("Canonical exact-frame index: 7")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/videos/video-123/sam2/prompt-box",
      {
        body: JSON.stringify({
          box_xyxy_px: [10, 20, 90, 60],
          frame_idx: 7,
          object_id: "object-1",
          session_id: "sam2-session-1",
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
  });

  it("shows propagation controls, polls live progress, allows cancel, and keeps frame navigation usable", async () => {
    let jobStatusCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
        }

        if (url.endsWith("/api/videos/video-123/frame/8")) {
          return Promise.resolve(createImageResponse("frame-8-png"));
        }

        if (
          url.endsWith("/api/videos/video-123/annotations/frame/7") &&
          init?.method === "PUT"
        ) {
          return Promise.resolve(
            createJsonResponse({
              box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
              frame_idx: 7,
              is_keyframe: true,
              mask: {
                path: null,
              },
              object_id: "object-1",
              source: "manual",
              video_id: "video-123",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/7")) {
          return Promise.resolve(
            createJsonResponse({
              annotations: [],
              frame_idx: 7,
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/8")) {
          return Promise.resolve(
            createJsonResponse({
              annotations: [],
              frame_idx: 8,
            }),
          );
        }

        if (
          url.endsWith("/api/videos/video-123/sam2/session") &&
          init?.method === "POST"
        ) {
          return Promise.resolve(
            createJsonResponse({
              reused: false,
              session_id: "sam2-session-1",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/sam2/prompt-box")) {
          return Promise.resolve(
            createJsonResponse({
              frame_idx: 7,
              annotation: {
                object_id: "object-1",
                source: "sam2",
                box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
                mask: {
                  path: "masks/video-123/object-1/frame_000007.png",
                },
              },
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/sam2/propagate")) {
          expect(init?.method).toBe("POST");
          expect(init?.body).toBe(
            JSON.stringify({
              direction: "forward",
              end_frame_idx: 11,
              object_ids: ["object-1"],
              session_id: "sam2-session-1",
              start_frame_idx: 7,
            }),
          );
          return Promise.resolve(
            createJsonResponse({
              job_id: "job-1",
              status: "queued",
              progress_current: 0,
              progress_total: 4,
            }),
          );
        }

        if (url.endsWith("/api/jobs/job-1")) {
          const payload =
            jobStatusCallCount === 0
              ? {
                  error_message: null,
                  job_id: "job-1",
                  progress_current: 2,
                  progress_total: 4,
                  result: null,
                  status: "running",
                  type: "sam2_propagation",
                }
              : {
                  error_message: null,
                  job_id: "job-1",
                  progress_current: 2,
                  progress_total: 4,
                  result: {
                    persisted_frame_count: 2,
                    persisted_frame_indices: [8, 9],
                  },
                  status: "cancelled",
                  type: "sam2_propagation",
                };
          jobStatusCallCount += 1;
          return Promise.resolve(createJsonResponse(payload));
        }

        if (url.endsWith("/api/jobs/job-1/cancel")) {
          return Promise.resolve(
            createJsonResponse({
              job_id: "job-1",
              status: "cancelling",
            }),
          );
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi
        .fn<(blob: Blob) => string>()
        .mockReturnValueOnce("blob:frame-7")
        .mockReturnValueOnce("blob:frame-8"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("Frame number"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();

    const exactFrameCanvas = screen.getByLabelText("Exact frame canvas");
    Object.defineProperty(exactFrameCanvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 1080,
        height: 1080,
        left: 0,
        right: 1920,
        top: 0,
        width: 1920,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }),
    });

    fireEvent.pointerDown(exactFrameCanvas, {
      button: 0,
      clientX: 10,
      clientY: 20,
      pointerId: 1,
    });
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "Run SAM2" }));
    expect(await screen.findByAltText("SAM2 mask for object-1")).toBeTruthy();

    expect(screen.getByLabelText("Propagation direction")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Forward" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Backward" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Both" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Propagation end frame"), {
      target: { value: "11" },
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Start propagation" }),
      );
      await Promise.resolve();
    });

    expect(screen.getByText("Propagation job queued")).toBeTruthy();
    expect(screen.getByText("Progress 0 / 4")).toBeTruthy();

    expect(
      await screen.findByText("Propagation job running", undefined, {
        timeout: 2000,
      }),
    ).toBeTruthy();
    expect(screen.getByText("Progress 2 / 4")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next frame" }));

    expect(await screen.findByAltText("Exact frame 8")).toBeTruthy();
    expect(screen.getByText("Canonical exact-frame index: 8")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cancel propagation" }),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Cancel propagation" }),
      );
      await Promise.resolve();
    });
    expect(screen.getByText("Propagation job cancelling")).toBeTruthy();

    expect(
      await screen.findByText("Propagation job cancelled", undefined, {
        timeout: 2000,
      }),
    ).toBeTruthy();
    expect(screen.getByText("Progress 2 / 4")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith("/api/jobs/job-1/cancel", {
      headers: {
        Accept: "application/json",
      },
      method: "POST",
    });
  });

  it("shows propagated frame summary after completion and reopens persisted masks from saved frames", async () => {
    let jobStatusCallCount = 0;
    let frameEightAnnotationCallCount = 0;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(indexedVideos[0]));
        }

        if (url.endsWith("/api/videos/video-123/manifest")) {
          return Promise.resolve(
            createJsonResponse(createVideoManifestPayload(indexedVideos[0])),
          );
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
        }

        if (url.endsWith("/api/videos/video-123/frame/8")) {
          return Promise.resolve(createImageResponse("frame-8-png"));
        }

        if (url.endsWith("/api/videos/video-123/frame/9")) {
          return Promise.resolve(createImageResponse("frame-9-png"));
        }

        if (
          url.endsWith("/api/videos/video-123/annotations/frame/7") &&
          init?.method === "PUT"
        ) {
          return Promise.resolve(
            createJsonResponse({
              box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
              frame_idx: 7,
              is_keyframe: true,
              mask: {
                path: null,
              },
              object_id: "object-1",
              source: "manual",
              video_id: "video-123",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/7")) {
          return Promise.resolve(
            createJsonResponse({
              annotations: [],
              frame_idx: 7,
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/8")) {
          frameEightAnnotationCallCount += 1;
          return Promise.resolve(
            createJsonResponse({
              annotations: [
                {
                  box_xywh_norm: [0.1, 0.2, 0.25, 0.25],
                  mask: {
                    path: "masks/video-123/object-1/frame_000008.png",
                  },
                  object_id: "object-1",
                  source: "sam2",
                },
              ],
              frame_idx: 8,
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/annotations/frame/9")) {
          return Promise.resolve(
            createJsonResponse({
              annotations: [
                {
                  box_xywh_norm: [0.12, 0.22, 0.21, 0.19],
                  mask: {
                    path: "masks/video-123/object-1/frame_000009.png",
                  },
                  object_id: "object-1",
                  source: "sam2",
                },
              ],
              frame_idx: 9,
            }),
          );
        }

        if (
          url.endsWith("/api/videos/video-123/sam2/session") &&
          init?.method === "POST"
        ) {
          return Promise.resolve(
            createJsonResponse({
              reused: false,
              session_id: "sam2-session-1",
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/sam2/prompt-box")) {
          return Promise.resolve(
            createJsonResponse({
              frame_idx: 7,
              annotation: {
                object_id: "object-1",
                source: "sam2",
                box_xywh_norm: [10 / 1920, 20 / 1080, 80 / 1920, 40 / 1080],
                mask: {
                  path: "masks/video-123/object-1/frame_000007.png",
                },
              },
            }),
          );
        }

        if (url.endsWith("/api/videos/video-123/sam2/propagate")) {
          return Promise.resolve(
            createJsonResponse({
              job_id: "job-1",
              status: "queued",
              progress_current: 0,
              progress_total: 2,
            }),
          );
        }

        if (url.endsWith("/api/jobs/job-1")) {
          const payload =
            jobStatusCallCount === 0
              ? {
                  error_message: null,
                  job_id: "job-1",
                  progress_current: 1,
                  progress_total: 2,
                  result: null,
                  status: "running",
                  type: "sam2_propagation",
                }
              : {
                  error_message: null,
                  job_id: "job-1",
                  progress_current: 2,
                  progress_total: 2,
                  result: {
                    persisted_frame_count: 2,
                    persisted_frame_indices: [8, 9],
                  },
                  status: "completed",
                  type: "sam2_propagation",
                };
          jobStatusCallCount += 1;
          return Promise.resolve(createJsonResponse(payload));
        }

        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      },
    );

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi
        .fn<(blob: Blob) => string>()
        .mockReturnValueOnce("blob:frame-7")
        .mockReturnValueOnce("blob:frame-8"),
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn<(url: string) => void>(),
      writable: true,
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-a.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("Frame number"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));
    expect(await screen.findByAltText("Exact frame 7")).toBeTruthy();

    const exactFrameCanvas = screen.getByLabelText("Exact frame canvas");
    Object.defineProperty(exactFrameCanvas, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        bottom: 1080,
        height: 1080,
        left: 0,
        right: 1920,
        top: 0,
        width: 1920,
        x: 0,
        y: 0,
        toJSON: () => undefined,
      }),
    });

    fireEvent.pointerDown(exactFrameCanvas, {
      button: 0,
      clientX: 10,
      clientY: 20,
      pointerId: 1,
    });
    fireEvent.pointerMove(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });
    fireEvent.pointerUp(exactFrameCanvas, {
      clientX: 90,
      clientY: 60,
      pointerId: 1,
    });

    fireEvent.click(screen.getByRole("button", { name: "Run SAM2" }));
    expect(await screen.findByAltText("SAM2 mask for object-1")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Propagation end frame"), {
      target: { value: "9" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Start propagation" }),
      );
      await Promise.resolve();
    });

    expect(
      await screen.findByText("Propagation job completed", undefined, {
        timeout: 3000,
      }),
    ).toBeTruthy();
    expect(screen.getByText("Saved propagated frames")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open frame 8" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open frame 9" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Open frame 8" }));

    expect(await screen.findByAltText("Exact frame 8")).toBeTruthy();
    expect(screen.getByText("Canonical exact-frame index: 8")).toBeTruthy();
    expect(await screen.findByAltText("SAM2 mask for object-1")).toBeTruthy();
    expect(
      screen.getByAltText("SAM2 mask for object-1").getAttribute("src"),
    ).toBe("/api/videos/video-123/annotations/frame/8/object/object-1/mask");
    expect(frameEightAnnotationCallCount).toBe(1);
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-123/frame/8", {
      headers: {
        Accept: "image/png",
      },
    });
  });
});

function createJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}

function createImageResponse(payload: string): Response {
  return new Response(new Blob([payload], { type: "image/png" }), {
    headers: {
      "content-type": "image/png",
    },
    status: 200,
  });
}

function createVideoManifestPayload(
  video: (typeof indexedVideos)[number],
  options: {
    objects?: readonly {
      color: string;
      id: string;
      label: string;
      status: string;
    }[];
  } = {},
): Record<string, unknown> {
  return {
    annotated_frames: [],
    keyframes: [],
    objects: options.objects ?? [
      {
        color: "#00ffaa",
        id: "object-1",
        label: "object-1",
        status: "active",
      },
    ],
    video: {
      duration_seconds: video.duration_seconds,
      fps: video.fps,
      frame_count: video.frame_count,
      height: video.height,
      id: video.id,
      width: video.width,
    },
  };
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}
