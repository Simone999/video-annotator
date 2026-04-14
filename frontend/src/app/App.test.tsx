// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

    expect(await screen.findByText("Selected video")).toBeTruthy();
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
});

function createJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
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
