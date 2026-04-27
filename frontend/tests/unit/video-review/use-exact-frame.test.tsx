// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  ExactVideoFrame,
  IndexedVideo,
} from "../../../src/features/video-review/api";

const { getExactVideoFrameMock, getFrameAnnotationsMock } = vi.hoisted(() => ({
  getExactVideoFrameMock: vi.fn(),
  getFrameAnnotationsMock: vi.fn(),
}));

vi.mock("../../../src/features/video-review/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../src/features/video-review/api")
  >("../../../src/features/video-review/api");

  return {
    ...actual,
    getExactVideoFrame: getExactVideoFrameMock,
    getFrameAnnotations: getFrameAnnotationsMock,
  };
});

import { useExactFrame } from "../../../src/features/video-review/hooks/use-exact-frame";

const sampleVideo: IndexedVideo = {
  display_name: "sample.mp4",
  duration_seconds: 1.75,
  fps: 24,
  frame_count: 42,
  height: 1080,
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  width: 1920,
};

const sampleFrame: ExactVideoFrame = {
  blob: new Blob(["frame-7"], { type: "image/png" }),
  mediaType: "image/png",
};

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return {
    promise,
    reject,
    resolve,
  };
}

describe("useExactFrame", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fails fast when no video is selected", async () => {
    const dispatch = vi.fn();
    const { result } = renderHook(() =>
      useExactFrame({
        dispatch,
        selectedVideo: null,
      }),
    );

    await act(async () => {
      await result.current.loadExactFrame(7);
    });

    expect(result.current.exactFrame).toBeNull();
    expect(result.current.exactFrameErrorMessage).toBe(
      "Select a video before loading exact frames.",
    );
    expect(result.current.exactFrameStatus).toBe("error");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("loads exact frame and dispatches canonical annotations", async () => {
    const dispatch = vi.fn();
    getExactVideoFrameMock.mockResolvedValue(sampleFrame);
    getFrameAnnotationsMock.mockResolvedValue({
      annotations: [
        {
          box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
          mask: null,
          object_id: "object-1",
          source: "manual",
        },
      ],
      frame_idx: 7,
    });

    const { result } = renderHook(() =>
      useExactFrame({
        dispatch,
        selectedVideo: sampleVideo,
      }),
    );

    await act(async () => {
      await result.current.loadExactFrame(7);
    });

    await waitFor(() => {
      expect(result.current.exactFrameStatus).toBe("ready");
    });

    expect(result.current.exactFrame).toEqual(sampleFrame);
    expect(result.current.exactFrameErrorMessage).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({
      annotations: [
        {
          box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
          mask: null,
          object_id: "object-1",
          source: "manual",
        },
      ],
      frameIdx: 7,
      type: "frame-loaded",
    });
  });

  it("surfaces backend failures as exact-frame error state", async () => {
    const dispatch = vi.fn();
    getExactVideoFrameMock.mockRejectedValue(new Error("Frame load broke"));

    const { result } = renderHook(() =>
      useExactFrame({
        dispatch,
        selectedVideo: sampleVideo,
      }),
    );

    await act(async () => {
      await result.current.loadExactFrame(7);
    });

    await waitFor(() => {
      expect(result.current.exactFrameStatus).toBe("error");
    });

    expect(result.current.exactFrame).toBeNull();
    expect(result.current.exactFrameErrorMessage).toBe("Frame load broke");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("ignores stale exact-frame responses when a newer frame load wins", async () => {
    const dispatch = vi.fn();
    const firstFrame = createDeferred<ExactVideoFrame>();
    const secondFrame = createDeferred<ExactVideoFrame>();
    const firstAnnotations = createDeferred<{
      annotations: [];
      frame_idx: number;
    }>();
    const secondAnnotations = createDeferred<{
      annotations: [];
      frame_idx: number;
    }>();

    getExactVideoFrameMock
      .mockReturnValueOnce(firstFrame.promise)
      .mockReturnValueOnce(secondFrame.promise);
    getFrameAnnotationsMock
      .mockReturnValueOnce(firstAnnotations.promise)
      .mockReturnValueOnce(secondAnnotations.promise);

    const { result } = renderHook(() =>
      useExactFrame({
        dispatch,
        selectedVideo: sampleVideo,
      }),
    );

    let firstLoad!: Promise<void>;
    let secondLoad!: Promise<void>;

    act(() => {
      firstLoad = result.current.loadExactFrame(7);
    });
    act(() => {
      secondLoad = result.current.loadExactFrame(8);
    });

    secondFrame.resolve({
      blob: new Blob(["frame-8"], { type: "image/png" }),
      mediaType: "image/png",
    });
    secondAnnotations.resolve({
      annotations: [],
      frame_idx: 8,
    });

    await act(async () => {
      await secondLoad;
    });
    await waitFor(() => {
      expect(result.current.exactFrameStatus).toBe("ready");
    });
    await expect(result.current.exactFrame?.blob.text()).resolves.toBe(
      "frame-8",
    );

    firstFrame.resolve(sampleFrame);
    firstAnnotations.resolve({
      annotations: [],
      frame_idx: 7,
    });
    await act(async () => {
      await firstLoad;
    });

    await expect(result.current.exactFrame?.blob.text()).resolves.toBe(
      "frame-8",
    );
    expect(dispatch).toHaveBeenLastCalledWith({
      annotations: [],
      frameIdx: 8,
      type: "frame-loaded",
    });
  });
});
