import { describe, expect, it, vi } from "vitest";

import {
  cancelSam2Job,
  createVideoObject,
  createSam2Session,
  deleteManualFrameAnnotation,
  getExactVideoFrame,
  getVideoManifest,
  getSam2Job,
  listIndexedVideos,
  runSam2PromptBox,
  startSam2Propagation,
  upsertManualFrameAnnotation,
  type IndexedVideo,
} from "../../../src/features/video-review/api";

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

  it("parses SAM2 session creation and prompt-box payloads at the frontend boundary", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ session_id: "sam2-session-1", reused: false }),
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
          JSON.stringify({
            frame_idx: 8,
            annotation: {
              object_id: "object-1",
              source: "sam2",
              box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
              mask: {
                path: "masks/video-123/object-1/frame_000008.png",
              },
            },
          }),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      );

    const session = await createSam2Session({
      baseUrl: "/api",
      fetchFn,
      videoId: "video-123",
    });

    const promptResponse = await runSam2PromptBox({
      baseUrl: "/api",
      boxXyxyPx: [10, 20, 30, 40],
      fetchFn,
      frameIdx: 8,
      objectId: "object-1",
      sessionId: "sam2-session-1",
      videoId: "video-123",
    });

    expect(session).toEqual({
      reused: false,
      session_id: "sam2-session-1",
    });
    expect(promptResponse).toEqual({
      annotation: {
        box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
        mask: {
          path: "masks/video-123/object-1/frame_000008.png",
        },
        object_id: "object-1",
        source: "sam2",
      },
      frame_idx: 8,
    });
    expect(fetchFn).toHaveBeenNthCalledWith(
      1,
      "/api/videos/video-123/sam2/session",
      {
        headers: {
          Accept: "application/json",
        },
        method: "POST",
      },
    );
    expect(fetchFn).toHaveBeenNthCalledWith(
      2,
      "/api/videos/video-123/sam2/prompt-box",
      {
        body: JSON.stringify({
          box_xyxy_px: [10, 20, 30, 40],
          frame_idx: 8,
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

  it("parses propagation job payloads and rejects malformed job responses", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            job_id: "job-1",
            progress_current: 0,
            progress_total: 4,
            status: "queued",
          }),
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
          JSON.stringify({
            error_message: null,
            job_id: "job-1",
            progress_current: 2,
            progress_total: 4,
            result: {
              persisted_frame_count: 2,
              persisted_frame_indices: [8, 9],
            },
            status: "running",
            type: "sam2_propagation",
          }),
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
          JSON.stringify({ job_id: "job-1", status: "cancelling" }),
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
          JSON.stringify({
            error_message: null,
            job_id: 17,
            progress_current: 2,
            progress_total: 4,
            result: null,
            status: "running",
            type: "sam2_propagation",
          }),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      );

    const startedJob = await startSam2Propagation({
      baseUrl: "/api",
      direction: "forward",
      endFrameIdx: 11,
      fetchFn,
      objectIds: ["object-1"],
      sessionId: "sam2-session-1",
      startFrameIdx: 7,
      videoId: "video-123",
    });
    const job = await getSam2Job({
      baseUrl: "/api",
      fetchFn,
      jobId: "job-1",
    });
    const cancelledJob = await cancelSam2Job({
      baseUrl: "/api",
      fetchFn,
      jobId: "job-1",
    });

    expect(startedJob).toEqual({
      job_id: "job-1",
      progress_current: 0,
      progress_total: 4,
      status: "queued",
    });
    expect(job).toEqual({
      error_message: null,
      job_id: "job-1",
      progress_current: 2,
      progress_total: 4,
      result: {
        persisted_frame_count: 2,
        persisted_frame_indices: [8, 9],
      },
      status: "running",
      type: "sam2_propagation",
    });
    expect(cancelledJob).toEqual({
      job_id: "job-1",
      status: "cancelling",
    });

    await expect(
      getSam2Job({
        baseUrl: "/api",
        fetchFn,
        jobId: "job-1",
      }),
    ).rejects.toThrow("job.job_id");
  });

  it("parses manifest, object-create, and manual-annotation payloads", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            annotated_frames: [3, 5],
            keyframes: [5],
            objects: [
              {
                color: "#00ffaa",
                id: "object-1",
                label: "left hand",
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
          JSON.stringify({
            color: "#00ffaa",
            id: "object-2",
            label: "right hand",
            status: "active",
          }),
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
          JSON.stringify({
            box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
            frame_idx: 5,
            is_keyframe: true,
            mask: {
              path: null,
            },
            object_id: "object-2",
            source: "manual",
            video_id: "video-123",
          }),
          {
            headers: {
              "content-type": "application/json",
            },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 204,
        }),
      );

    const manifest = await getVideoManifest({
      baseUrl: "/api",
      fetchFn,
      videoId: "video-123",
    });
    const createdObject = await createVideoObject({
      baseUrl: "/api",
      fetchFn,
      label: "right hand",
      videoId: "video-123",
    });
    const manualAnnotation = await upsertManualFrameAnnotation({
      baseUrl: "/api",
      boxXywhNorm: [0.1, 0.2, 0.3, 0.4],
      fetchFn,
      frameIdx: 5,
      isKeyframe: true,
      objectId: "object-2",
      videoId: "video-123",
    });
    await deleteManualFrameAnnotation({
      baseUrl: "/api",
      fetchFn,
      frameIdx: 5,
      objectId: "object-2",
      videoId: "video-123",
    });

    expect(manifest).toEqual({
      annotated_frames: [3, 5],
      keyframes: [5],
      objects: [
        {
          color: "#00ffaa",
          id: "object-1",
          label: "left hand",
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
    });
    expect(createdObject).toEqual({
      color: "#00ffaa",
      id: "object-2",
      label: "right hand",
      status: "active",
    });
    expect(manualAnnotation).toEqual({
      box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
      frame_idx: 5,
      is_keyframe: true,
      mask: {
        path: null,
      },
      object_id: "object-2",
      source: "manual",
      video_id: "video-123",
    });
    expect(fetchFn).toHaveBeenNthCalledWith(
      1,
      "/api/videos/video-123/manifest",
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
    expect(fetchFn).toHaveBeenNthCalledWith(
      2,
      "/api/videos/video-123/objects",
      {
        body: JSON.stringify({
          label: "right hand",
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );
    expect(fetchFn).toHaveBeenNthCalledWith(
      3,
      "/api/videos/video-123/annotations/frame/5",
      {
        body: JSON.stringify({
          box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
          is_keyframe: true,
          object_id: "object-2",
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PUT",
      },
    );
    expect(fetchFn).toHaveBeenNthCalledWith(
      4,
      "/api/videos/video-123/annotations/frame/5/object/object-2",
      {
        method: "DELETE",
      },
    );
  });

  it("rejects malformed manifest payloads", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          annotated_frames: ["not-frame"],
          keyframes: [],
          objects: [],
          video: {
            duration_seconds: null,
            fps: 24,
            frame_count: 42,
            height: 1080,
            id: "video-123",
            width: 1920,
          },
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
    ).rejects.toThrow("manifest.annotated_frames[0]");
  });
});
