import { describe, expect, it, vi } from "vitest";

import {
  createVideoObject,
  deleteManualFrameAnnotation,
  getExactVideoFrame,
  getVideoManifest,
  listIndexedVideos,
  upsertManualFrameAnnotation,
  type IndexedVideo,
  type ManualFrameAnnotation,
  type VideoManifest,
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

const sampleManifest: VideoManifest = {
  video: {
    id: "video-123",
    frame_count: 42,
    fps: 24,
    width: 1920,
    height: 1080,
    duration_seconds: 1.75,
  },
  objects: [
    {
      id: "object-123",
      label: "left hand",
      color: "#00ffaa",
      status: "active",
    },
  ],
  annotated_frames: [7, 11],
  keyframes: [7],
};

const sampleManualAnnotation: ManualFrameAnnotation = {
  video_id: "video-123",
  frame_idx: 7,
  object_id: "object-123",
  is_keyframe: true,
  source: "manual",
  box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
  mask: {
    path: null,
  },
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

  it("parses manifest payloads at the frontend boundary", async () => {
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

  it("rejects invalid manifest payloads", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...sampleManifest,
          objects: [{ ...sampleManifest.objects[0], color: 123 }],
        }),
        {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
        },
      ),
    );

    await expect(
      getVideoManifest({
        baseUrl: "/api",
        fetchFn,
        videoId: "video-123",
      }),
    ).rejects.toThrow("manifest.objects[0].color");
  });

  it("creates one stable object through the typed frontend client", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(sampleManifest.objects[0]), {
        headers: {
          "content-type": "application/json",
        },
        status: 201,
      }),
    );

    const objectTrack = await createVideoObject({
      baseUrl: "/api",
      fetchFn,
      label: "left hand",
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith("/api/videos/video-123/objects", {
      body: JSON.stringify({
        label: "left hand",
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    expect(objectTrack).toEqual(sampleManifest.objects[0]);
  });

  it("upserts one manual annotation through the typed frontend client", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(sampleManualAnnotation), {
        headers: {
          "content-type": "application/json",
        },
        status: 200,
      }),
    );

    const annotation = await upsertManualFrameAnnotation({
      baseUrl: "/api",
      box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
      fetchFn,
      frameIdx: 7,
      is_keyframe: true,
      objectId: "object-123",
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/videos/video-123/annotations/frame/7",
      {
        body: JSON.stringify({
          box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
          is_keyframe: true,
          object_id: "object-123",
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PUT",
      },
    );
    expect(annotation).toEqual(sampleManualAnnotation);
  });

  it("deletes one manual annotation through the typed frontend client", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    await deleteManualFrameAnnotation({
      baseUrl: "/api",
      fetchFn,
      frameIdx: 7,
      objectId: "object-123",
      videoId: "video-123",
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "/api/videos/video-123/annotations/frame/7/object/object-123",
      {
        headers: {
          Accept: "application/json",
        },
        method: "DELETE",
      },
    );
  });
});
