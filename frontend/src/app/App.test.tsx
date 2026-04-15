// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

const selectedVideoManifest = {
  annotated_frame_indices: [7],
  keyframe_indices: [7],
  objects: [
    {
      id: 9,
      label: "left hand",
      color: null,
      status: "active",
    },
  ],
  video: indexedVideos[1],
} as const;

const frameSevenAnnotations = {
  video_id: "video-456",
  frame_idx: 7,
  annotations: [
    {
      object_id: 9,
      is_keyframe: true,
      source: "manual",
      box_xywh_norm: [0.25, 0.1, 0.5, 0.2],
    },
  ],
} as const;

const frameEightAnnotations = {
  video_id: "video-456",
  frame_idx: 8,
  annotations: [
    {
      object_id: 9,
      is_keyframe: true,
      source: "manual",
      box_xywh_norm: [0.1, 0.35, 0.25, 0.3],
    },
  ],
} as const;

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

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
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
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/manifest", {
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

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
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

  it("renders manifest-backed object list for selected video", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    expect(
      await screen.findByRole("heading", { level: 3, name: "Objects" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Select object left hand" }));
    expect(
      screen.getByText("1 object ready for exact-frame work."),
    ).toBeTruthy();
  });

  it("creates new object from workspace and selects stable backend id", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse(indexedVideos));
        }

        if (url.endsWith("/api/videos/video-456/manifest")) {
          return Promise.resolve(createJsonResponse(selectedVideoManifest));
        }

        if (
          url.endsWith("/api/videos/video-456/objects") &&
          init?.method === "POST"
        ) {
          return Promise.resolve(
            createJsonResponse({
              color: null,
              id: 12,
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
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("New object label"), {
      target: { value: "right hand" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create object" }));

    expect(
      await screen.findByRole("button", { name: "Select object right hand" }),
    );
    expect(
      screen
        .getByRole("button", { name: "Select object right hand" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByText("Selected object id: 12")).toBeTruthy();
    expect(fetchSpy).toHaveBeenCalledWith("/api/videos/video-456/objects", {
      body: JSON.stringify({ label: "right hand" }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  });

  it("loads canonical exact frames from jump-to-frame input and allows same-frame reloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
      }

      if (url.endsWith("/api/videos/video-456/frame/7")) {
        return Promise.resolve(createImageResponse("frame-7-png"));
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
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/videos/video-456/annotations/frame/7",
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
    await waitFor(() => {
      expect(screen.getByAltText("Exact frame 7").getAttribute("src")).toBe(
        "blob:frame-7-b",
      );
    });
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:frame-7-a");
  });

  it("loads persisted annotations for canonical frame and renders overlay boxes", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
      }

      if (url.endsWith("/api/videos/video-456/frame/7")) {
        return Promise.resolve(createImageResponse("frame-7-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/7")) {
        return Promise.resolve(createJsonResponse(frameSevenAnnotations));
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

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
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    fireEvent.change(await screen.findByLabelText("Frame number"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    const overlay = await screen.findByLabelText("Annotation box left hand");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/videos/video-456/annotations/frame/7",
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
    expect(overlay.getAttribute("data-frame-idx")).toBe("7");
    expect(overlay.style.left).toBe("25%");
    expect(overlay.style.top).toBe("10%");
    expect(overlay.style.width).toBe("50%");
    expect(overlay.style.height).toBe("20%");
  });

  it("shows only overlay boxes for the selected canonical frame index", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
      }

      if (url.endsWith("/api/videos/video-456/frame/7")) {
        return Promise.resolve(createImageResponse("frame-7-png"));
      }

      if (url.endsWith("/api/videos/video-456/frame/8")) {
        return Promise.resolve(createImageResponse("frame-8-png"));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/7")) {
        return Promise.resolve(createJsonResponse(frameSevenAnnotations));
      }

      if (url.endsWith("/api/videos/video-456/annotations/frame/8")) {
        return Promise.resolve(createJsonResponse(frameEightAnnotations));
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });

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
      await screen.findByRole("button", { name: "Open sample-b.mp4" }),
    );

    const frameInput = await screen.findByLabelText("Frame number");
    fireEvent.change(frameInput, {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    expect(
      await screen.findByLabelText("Annotation box left hand"),
    ).toBeTruthy();

    fireEvent.change(frameInput, {
      target: { value: "8" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Load frame" }));

    await waitFor(() => {
      const overlay = screen.getByLabelText("Annotation box left hand");
      expect(overlay.getAttribute("data-frame-idx")).toBe("8");
      expect(overlay.style.left).toBe("10%");
      expect(overlay.style.top).toBe("35%");
      expect(overlay.style.width).toBe("25%");
      expect(overlay.style.height).toBe("30%");
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/videos/video-456/annotations/frame/8",
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
    expect(screen.queryByText("No saved boxes on this frame.")).toBeNull();
  });

  it("steps to previous and next exact frames while clamping at video bounds", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      const url = getRequestUrl(input);

      if (url.endsWith("/api/videos")) {
        return Promise.resolve(createJsonResponse(indexedVideos));
      }

      if (url.endsWith("/api/videos/video-456/manifest")) {
        return Promise.resolve(createJsonResponse(selectedVideoManifest));
      }

      if (url.endsWith("/api/videos/video-456/frame/0")) {
        return Promise.resolve(createImageResponse("frame-0-png"));
      }

      if (url.endsWith("/api/videos/video-456/frame/1")) {
        return Promise.resolve(createImageResponse("frame-1-png"));
      }

      if (url.endsWith("/api/videos/video-456/frame/82")) {
        return Promise.resolve(createImageResponse("frame-82-png"));
      }

      if (url.endsWith("/api/videos/video-456/frame/83")) {
        return Promise.resolve(createImageResponse("frame-83-png"));
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

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}
