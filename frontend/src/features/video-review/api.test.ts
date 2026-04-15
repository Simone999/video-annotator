import { describe, expect, it, vi } from "vitest";

import {
  createObjectTrack,
  getExactVideoFrame,
  getFrameAnnotations,
  getVideoManifest,
  listIndexedVideos,
  upsertFrameAnnotations,
  deleteFrameAnnotation,
  type FrameAnnotations,
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

const sampleManifest = {
  video: sampleVideo,
  objects: [
    {
      id: 9,
      label: "left hand",
      color: null,
      status: "active",
    },
  ],
  annotated_frame_indices: [3, 7],
  keyframe_indices: [7],
};

const sampleFrameAnnotations: FrameAnnotations = {
  video_id: "video-123",
  frame_idx: 7,
  annotations: [
    {
      object_id: 9,
      is_keyframe: true,
      source: "manual",
      box_xywh_norm: [0.2, 0.3, 0.1, 0.15],
    },
  ],
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

  it("parses the video manifest at the frontend boundary", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(sampleManifest), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const manifest = await getVideoManifest({
      baseUrl: "/api",
      fetchFn,
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith("/api/videos/video-123/manifest", {
      headers: {
        Accept: "application/json",
      },
    });
    expect(manifest).toEqual(sampleManifest);
  });

  it("creates a persisted object track with typed request and response parsing", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(sampleManifest.objects[0]), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const objectTrack = await createObjectTrack({
      baseUrl: "/api",
      fetchFn,
      label: "left hand",
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith("/api/videos/video-123/objects", {
      body: JSON.stringify({ label: "left hand" }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    expect(objectTrack).toEqual(sampleManifest.objects[0]);
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

  it("parses frame-scoped annotations at the frontend boundary", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(sampleFrameAnnotations), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const frameAnnotations = await getFrameAnnotations({
      baseUrl: "/api",
      fetchFn,
      frameIdx: 7,
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/videos/video-123/annotations/frame/7",
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
    expect(frameAnnotations).toEqual(sampleFrameAnnotations);
  });

  it("upserts frame annotations with normalized box payloads", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(sampleFrameAnnotations), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const response = await upsertFrameAnnotations({
      annotations: sampleFrameAnnotations.annotations,
      baseUrl: "/api",
      fetchFn,
      frameIdx: 7,
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/videos/video-123/annotations/frame/7",
      {
        body: JSON.stringify({
          annotations: sampleFrameAnnotations.annotations,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PUT",
      },
    );
    expect(response).toEqual(sampleFrameAnnotations);
  });

  it("deletes one frame annotation row without response parsing", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    await deleteFrameAnnotation({
      baseUrl: "/api",
      fetchFn,
      frameIdx: 7,
      objectId: 9,
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/videos/video-123/annotations/frame/7/object/9",
      {
        headers: {
          Accept: "application/json",
        },
        method: "DELETE",
      },
    );
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
