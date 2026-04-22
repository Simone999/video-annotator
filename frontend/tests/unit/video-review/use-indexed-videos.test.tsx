// @vitest-environment jsdom

import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { IndexedVideo } from "../../../src/features/video-review/api";

const { listIndexedVideosMock } = vi.hoisted(() => ({
  listIndexedVideosMock: vi.fn(),
}));

vi.mock("../../../src/features/video-review/api", async () => {
  const actual = await vi.importActual<
    typeof import("../../../src/features/video-review/api")
  >("../../../src/features/video-review/api");

  return {
    ...actual,
    listIndexedVideos: listIndexedVideosMock,
  };
});

import { useIndexedVideos } from "../../../src/features/video-review/hooks/use-indexed-videos";

function createDeferredPromise<T>() {
  let resolvePromise: ((value: T) => void) | null = null;
  let rejectPromise: ((reason?: unknown) => void) | null = null;
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  return {
    promise,
    reject(value: unknown) {
      if (rejectPromise === null) {
        throw new Error("Deferred promise reject was not initialized.");
      }
      rejectPromise(value);
    },
    resolve(value: T) {
      if (resolvePromise === null) {
        throw new Error("Deferred promise resolve was not initialized.");
      }
      resolvePromise(value);
    },
  };
}

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

describe("useIndexedVideos", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marks list as ready when videos load", async () => {
    const setErrorMessage = vi.fn();
    listIndexedVideosMock.mockResolvedValue([sampleVideo]);

    const { result } = renderHook(() => useIndexedVideos({ setErrorMessage }));

    await waitFor(() => {
      expect(result.current.listStatus).toBe("ready");
    });

    expect(result.current.indexedVideos).toEqual([sampleVideo]);
    expect(setErrorMessage).not.toHaveBeenCalled();
  });

  it("marks list as empty when backend returns no indexed videos", async () => {
    const setErrorMessage = vi.fn();
    listIndexedVideosMock.mockResolvedValue([]);

    const { result } = renderHook(() => useIndexedVideos({ setErrorMessage }));

    await waitFor(() => {
      expect(result.current.listStatus).toBe("empty");
    });

    expect(result.current.indexedVideos).toEqual([]);
    expect(setErrorMessage).not.toHaveBeenCalled();
  });

  it("surfaces formatted error state when loading videos fails", async () => {
    const setErrorMessage = vi.fn();
    listIndexedVideosMock.mockRejectedValue(new Error("Video list broke"));

    const { result } = renderHook(() => useIndexedVideos({ setErrorMessage }));

    await waitFor(() => {
      expect(result.current.listStatus).toBe("error");
    });

    expect(result.current.indexedVideos).toEqual([]);
    expect(setErrorMessage).toHaveBeenCalledWith("Video list broke");
  });

  it("ignores late success after unmount", async () => {
    const setErrorMessage = vi.fn();
    const deferred = createDeferredPromise<readonly IndexedVideo[]>();
    listIndexedVideosMock.mockReturnValue(deferred.promise);

    const { unmount } = renderHook(() => useIndexedVideos({ setErrorMessage }));

    unmount();

    await act(async () => {
      deferred.resolve([sampleVideo]);
      await deferred.promise;
    });

    expect(setErrorMessage).not.toHaveBeenCalled();
  });

  it("ignores late failure after unmount", async () => {
    const setErrorMessage = vi.fn();
    const deferred = createDeferredPromise<readonly IndexedVideo[]>();
    listIndexedVideosMock.mockReturnValue(deferred.promise);

    const { unmount } = renderHook(() => useIndexedVideos({ setErrorMessage }));

    unmount();

    await act(async () => {
      deferred.reject(new Error("late error"));
      try {
        await deferred.promise;
      } catch {
        return;
      }
    });

    expect(setErrorMessage).not.toHaveBeenCalled();
  });
});
