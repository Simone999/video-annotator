import { describe, expect, it, vi } from "vitest";

import {
  getExactVideoFrame,
  listIndexedVideos,
  type IndexedVideo,
} from "./api";

const sampleVideo: IndexedVideo = {
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  display_name: "sample.mp4",
  frame_count: 42,
  fps: 24,
  width: 1920,
  height: 1080,
  duration_seconds: 1.75,
};

describe("video review api", () => {
  it("parses the indexed video list at the frontend boundary", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([sampleVideo]), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const videos = await listIndexedVideos({
      baseUrl: "/api",
      fetchFn,
    });

    expect(fetchFn).toHaveBeenCalledWith("/api/videos", {
      headers: {
        Accept: "application/json",
      },
    });
    expect(videos).toEqual([sampleVideo]);
  });

  it("rejects invalid indexed video payloads", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([{ id: 12 }]), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    await expect(
      listIndexedVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos[0].id");
  });

  it("returns exact-frame image bytes for a canonical frame index", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Blob(["png-bytes"], { type: "image/png" }), {
        headers: {
          "content-type": "image/png",
        },
        status: 200,
      }),
    );

    const frame = await getExactVideoFrame({
      baseUrl: "/api",
      fetchFn,
      frameIdx: 8,
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith("/api/videos/video-123/frame/8", {
      headers: {
        Accept: "image/png",
      },
    });
    expect(frame.mediaType).toBe("image/png");
    await expect(frame.blob.text()).resolves.toBe("png-bytes");
  });
});
