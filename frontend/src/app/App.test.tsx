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
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    await waitFor(() => {
      expect(screen.getByAltText("Exact frame 7").getAttribute("src")).toBe(
        "blob:frame-7-b",
      );
    });
    expect(createObjectUrlSpy).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:frame-7-a");
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
