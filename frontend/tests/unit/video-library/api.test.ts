import { describe, expect, it, vi } from "vitest";

import {
  VideoLibraryApiError,
  listVideoLibraryVideos,
  type VideoLibraryApiVideo,
} from "../../../src/features/video-library/api";

const sampleVideo: VideoLibraryApiVideo = {
  display_name: "sample.mp4",
  duration_seconds: 1.75,
  fps: 24,
  frame_count: 42,
  height: 1080,
  id: "video-123",
  propagation_progress_percent: 50,
  review_state: "in_progress",
  review_summary: {
    annotated_frame_count: 4,
    imported_frame_count: 1,
    keyframe_count: 2,
    last_annotated_frame_idx: 7,
    last_reviewed_frame_idx: 5,
    manual_frame_count: 2,
    object_count: 3,
    propagated_frame_count: 2,
  },
  source_path: "/tmp/session/sample.mp4",
  width: 1920,
};

describe("video library api", () => {
  it("parses indexed library videos and trims trailing slash from base url", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify([sampleVideo]), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const videos = await listVideoLibraryVideos({
      baseUrl: "/api/",
      fetchFn,
    });

    expect(fetchFn).toHaveBeenCalledWith("/api/videos", {
      headers: {
        Accept: "application/json",
      },
      method: undefined,
    });
    expect(videos).toEqual([sampleVideo]);
  });

  it("maps json api error detail when backend returns one", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ detail: "library broke" }), {
        headers: {
          "content-type": "application/json",
        },
        status: 500,
        statusText: "Server Error",
      }),
    );

    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toEqual(new VideoLibraryApiError(500, "library broke"));
  });

  it("falls back to status text when json detail is empty or non-json", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "" }), {
          headers: {
            "content-type": "application/json",
          },
          status: 400,
          statusText: "Bad Request",
        }),
      )
      .mockResolvedValueOnce(
        new Response("plain error", {
          headers: {
            "content-type": "text/plain",
          },
          status: 503,
          statusText: "Service Unavailable",
        }),
      );

    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toEqual(new VideoLibraryApiError(400, "Bad Request"));

    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toEqual(new VideoLibraryApiError(503, "Service Unavailable"));
  });

  it("falls back to generic request failed when status text is empty", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("broken", {
        headers: {
          "content-type": "text/plain",
        },
        status: 500,
        statusText: "",
      }),
    );

    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toEqual(new VideoLibraryApiError(500, "Request failed"));
  });

  it("rejects malformed top-level and nested payloads", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ not: "an array" }), {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(["bad-object"]), {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...sampleVideo,
              fps: "24",
            },
          ]),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...sampleVideo,
              frame_count: 42.5,
            },
          ]),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...sampleVideo,
              duration_seconds: "1.75",
            },
          ]),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...sampleVideo,
              propagation_progress_percent: 50.5,
            },
          ]),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...sampleVideo,
              review_state: "paused",
            },
          ]),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              ...sampleVideo,
              review_summary: {
                ...sampleVideo.review_summary,
                last_reviewed_frame_idx: "bad",
              },
            },
          ]),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      );

    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos must be an array");
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos[0] must be an object");
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos[0].fps must be a number");
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos[0].frame_count must be an integer");
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos[0].duration_seconds must be a number");
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow(
      "videos[0].propagation_progress_percent must be an integer",
    );
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow("videos[0].review_state must be a known review state");
    await expect(
      listVideoLibraryVideos({
        baseUrl: "/api",
        fetchFn,
      }),
    ).rejects.toThrow(
      "videos[0].review_summary.last_reviewed_frame_idx must be a number",
    );
  });
});
