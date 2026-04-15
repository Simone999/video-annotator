// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useVideoReviewWorkspace } from "./workspace";

const sampleVideo = {
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  display_name: "sample.mp4",
  frame_count: 42,
  fps: 24,
  width: 1920,
  height: 1080,
  duration_seconds: 1.75,
} as const;

describe("video review workspace SAM2 state", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks session, prompt, and propagation job state without replacing canonical frame index", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation(
      (input: RequestInfo | URL, init?: RequestInit) => {
        const url = getRequestUrl(input);

        if (url.endsWith("/api/videos")) {
          return Promise.resolve(createJsonResponse([sampleVideo]));
        }

        if (url.endsWith("/api/videos/video-123")) {
          return Promise.resolve(createJsonResponse(sampleVideo));
        }

        if (url.endsWith("/api/videos/video-123/frame/7")) {
          return Promise.resolve(createImageResponse("frame-7-png"));
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
                box_xywh_norm: [0.1, 0.2, 0.25, 0.25],
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
              progress_total: 4,
            }),
          );
        }

        if (url.endsWith("/api/jobs/job-1")) {
          return Promise.resolve(
            createJsonResponse({
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
          );
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

    const { result } = renderHook(() => useVideoReviewWorkspace());

    await waitFor(() => {
      expect(result.current.listStatus).toBe("ready");
    });

    await act(async () => {
      await result.current.selectVideo("video-123");
    });

    await act(async () => {
      await result.current.loadExactFrame(7);
    });

    expect(result.current.reviewState.currentFrameIndex).toBe(7);

    await act(async () => {
      await result.current.createSam2Session();
    });

    expect(result.current.reviewState.sam2.session.sessionId).toBe(
      "sam2-session-1",
    );
    expect(result.current.reviewState.sam2.session.status).toBe("ready");
    expect(result.current.reviewState.currentFrameIndex).toBe(7);

    await act(async () => {
      await result.current.runSam2PromptBox({
        boxXyxyPx: [10, 20, 30, 40],
        frameIdx: 7,
        objectId: "object-1",
      });
    });

    expect(result.current.reviewState.sam2.prompt.status).toBe("ready");
    expect(
      result.current.reviewState.sam2.prompt.response?.annotation.object_id,
    ).toBe("object-1");
    expect(result.current.reviewState.currentFrameIndex).toBe(7);

    await act(async () => {
      await result.current.startSam2Propagation({
        direction: "forward",
        endFrameIdx: 11,
        objectIds: ["object-1"],
        startFrameIdx: 7,
      });
    });

    expect(result.current.reviewState.sam2.propagation.status).toBe("ready");
    expect(result.current.reviewState.sam2.propagation.job?.progressTotal).toBe(
      4,
    );
    expect(result.current.reviewState.currentFrameIndex).toBe(7);

    await act(async () => {
      await result.current.refreshSam2PropagationJob();
    });

    expect(result.current.reviewState.sam2.propagation.job).toEqual({
      errorMessage: null,
      jobId: "job-1",
      progressCurrent: 2,
      progressTotal: 4,
      result: {
        persisted_frame_count: 2,
        persisted_frame_indices: [8, 9],
      },
      status: "running",
      type: "sam2_propagation",
    });
    expect(result.current.reviewState.currentFrameIndex).toBe(7);

    await act(async () => {
      await result.current.cancelSam2PropagationJob();
    });

    expect(result.current.reviewState.sam2.propagation.job?.status).toBe(
      "cancelling",
    );
    expect(result.current.reviewState.currentFrameIndex).toBe(7);
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
  return typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;
}
