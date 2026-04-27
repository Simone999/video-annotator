// @vitest-environment jsdom

import type { SyntheticEvent } from "react";
import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { initialVideoReviewState } from "../../../src/features/video-review/state";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";
import { useLiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import {
  createReviewState,
  createWorkspace,
  sampleVideo,
} from "./use-live-review-controller-test-helpers";

const exactFrame = {
  blob: new Blob(["frame-7"], { type: "image/png" }),
  mediaType: "image/png",
} as const;

type PlaybackFrameCallback = (
  now: number,
  metadata: { mediaTime: number },
) => void;

type PlaybackTestElement = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: PlaybackFrameCallback) => number;
};

function createPlaybackElement(options?: {
  requestVideoFrameCallback?: (callback: PlaybackFrameCallback) => number;
}): PlaybackTestElement {
  return {
    currentTime: 0,
    pause: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    requestVideoFrameCallback: options?.requestVideoFrameCallback,
  } as unknown as PlaybackTestElement;
}

describe("useLiveReviewController propagation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks independent range and seed defaults without coupling to viewed frame changes", async () => {
    const { result, rerender } = renderHook(
      ({ workspace }: { workspace: VideoReviewWorkspace }) =>
        useLiveReviewController({
          initialVideoId: null,
          workspace,
        }),
      {
        initialProps: {
          workspace: createWorkspace({
            exactFrame,
            exactFrameStatus: "ready",
            reviewState: createReviewState({
              currentFrameIndex: 7,
              selectedVideo: sampleVideo,
            }),
          }),
        },
      },
    );

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        endFrameIdx: 41,
        startFrameIdx: 0,
      });
      expect(result.current.propagationSeedFrameValue).toBe("7");
    });
    expect(result.current.propagationDirection).toBe("both");
    expect(result.current.propagationRangeStartFrameValue).toBe("0");
    expect(result.current.propagationEndFrameValue).toBe("41");

    act(() => {
      result.current.setPropagationDirection("backward");
      result.current.setPropagationRangeStartFrameValue("3");
      result.current.setPropagationEndFrameValue("9");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        endFrameIdx: 9,
        startFrameIdx: 3,
      });
    });
    expect(result.current.propagationSeedFrameValue).toBe("7");

    rerender({
      workspace: createWorkspace({
        exactFrame,
        exactFrameStatus: "ready",
        reviewState: createReviewState({
          currentFrameIndex: 18,
          selectedVideo: sampleVideo,
        }),
      }),
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        endFrameIdx: 9,
        startFrameIdx: 3,
      });
    });
    expect(result.current.propagationSeedFrameValue).toBe("7");

    act(() => {
      result.current.setPropagationRangeStartFrameValue("12");
      result.current.setPropagationEndFrameValue("9");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toBeNull();
    });
  });

  it("validates explicit range and seed inputs, then starts propagation with new contract fields", () => {
    const startSam2Propagation = vi.fn(() => Promise.resolve());
    const baseReviewState = createReviewState();
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame,
          exactFrameStatus: "ready",
          reviewState: createReviewState({
            annotation: {
              ...baseReviewState.annotation,
              selectedObjectId: "object-1",
            },
            currentFrameIndex: 7,
            sam2: {
              ...baseReviewState.sam2,
              session: {
                ...baseReviewState.sam2.session,
                errorMessage: null,
                reused: false,
                sessionId: "sam2-session-1",
                status: "ready",
              },
            },
            selectedVideo: sampleVideo,
          }),
          startSam2Propagation,
        }),
      }),
    );

    act(() => {
      result.current.setPropagationRangeStartFrameValue("12");
      result.current.setPropagationEndFrameValue("6");
      result.current.handleStartPropagation();
    });

    expect(result.current.propagationInputError).toBe(
      "Enter valid range 0-41.",
    );
    expect(startSam2Propagation).not.toHaveBeenCalled();

    act(() => {
      result.current.setPropagationRangeStartFrameValue("3");
      result.current.setPropagationEndFrameValue("11");
      result.current.setPropagationSeedFrameValue("7");
      result.current.handleStartPropagation();
    });

    expect(startSam2Propagation).toHaveBeenCalledWith({
      direction: "both",
      objectIds: ["object-1"],
      rangeEndFrameIdx: 11,
      rangeStartFrameIdx: 3,
      seedFrameIdx: 7,
    });

    act(() => {
      result.current.setPropagationSeedFrameValue("12");
      result.current.handleStartPropagation();
    });

    expect(result.current.propagationInputError).toBe(
      "Seed frame must stay inside selected range.",
    );
  });

  it("keeps selected range stable when canonical frame changes later", async () => {
    const { result, rerender } = renderHook(
      ({ workspace }: { workspace: VideoReviewWorkspace }) =>
        useLiveReviewController({
          initialVideoId: null,
          workspace,
        }),
      {
        initialProps: {
          workspace: createWorkspace({
            exactFrame,
            exactFrameStatus: "ready",
            reviewState: createReviewState({
              currentFrameIndex: 7,
              selectedVideo: sampleVideo,
            }),
          }),
        },
      },
    );

    act(() => {
      result.current.setPropagationRangeStartFrameValue("4");
      result.current.setPropagationEndFrameValue("9");
      result.current.setPropagationSeedFrameValue("7");
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        endFrameIdx: 9,
        startFrameIdx: 4,
      });
    });

    rerender({
      workspace: createWorkspace({
        exactFrame: {
          blob: new Blob(["frame-18"], { type: "image/png" }),
          mediaType: "image/png",
        },
        exactFrameStatus: "ready",
        reviewState: createReviewState({
          currentFrameIndex: 18,
          selectedVideo: sampleVideo,
        }),
      }),
    });

    await waitFor(() => {
      expect(result.current.selectedRange).toEqual({
        endFrameIdx: 9,
        startFrameIdx: 4,
      });
    });
    expect(result.current.propagationSeedFrameValue).toBe("7");
  });

  it("re-centers stale seed onto the first annotated frame inside the selected range", async () => {
    const baseReviewState = createReviewState();
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame,
          exactFrameStatus: "ready",
          reviewState: createReviewState({
            annotation: {
              ...baseReviewState.annotation,
              annotatedFrameIndices: [7, 18],
              selectedObjectId: "object-1",
            },
            currentFrameIndex: 11,
            sam2: {
              ...baseReviewState.sam2,
              session: {
                errorMessage: null,
                reused: false,
                sessionId: "sam2-session-1",
                status: "ready",
              },
            },
            selectedVideo: sampleVideo,
          }),
        }),
      }),
    );

    await waitFor(() => {
      expect(result.current.propagationSeedFrameValue).toBe("7");
    });

    act(() => {
      result.current.setPropagationSeedFrameValue("0");
      result.current.setPropagationRangeStartFrameValue("7");
      result.current.setPropagationEndFrameValue("11");
    });

    await waitFor(() => {
      expect(result.current.propagationSeedFrameValue).toBe("7");
    });
  });

  it("commits paused preview frame back onto canonical frame", () => {
    const loadExactFrame = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame,
          exactFrameStatus: "ready",
          loadExactFrame,
          reviewState: createReviewState({
            currentFrameIndex: 7,
            selectedVideo: sampleVideo,
          }),
        }),
      }),
    );

    act(() => {
      result.current.handlePlaybackPlay();
    });
    act(() => {
      result.current.handlePlaybackTimeUpdate({
        currentTarget: {
          currentTime: 0.5,
        },
      } as SyntheticEvent<HTMLVideoElement>);
    });

    expect(result.current.previewFrameIndex).toBe(12);

    act(() => {
      result.current.handlePlaybackPause();
    });

    expect(loadExactFrame).toHaveBeenCalledWith(12);
  });

  it("resumes playback from the shown paused frame instead of stale exact-frame state", () => {
    const loadExactFrame = vi.fn(() => Promise.resolve());
    const playbackElement = createPlaybackElement();
    const { result, unmount } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame,
          exactFrameStatus: "ready",
          loadExactFrame,
          reviewState: createReviewState({
            currentFrameIndex: 7,
            selectedVideo: sampleVideo,
          }),
          selectionStatus: "ready",
        }),
      }),
    );

    act(() => {
      result.current.playbackVideoRef.current = playbackElement;
      result.current.handlePlaybackToggle();
    });

    act(() => {
      playbackElement.currentTime = 0.5;
      result.current.handlePlaybackPause({
        currentTarget: playbackElement,
      } as never);
    });

    expect(loadExactFrame).toHaveBeenCalledWith(12);

    act(() => {
      result.current.handlePlaybackToggle();
    });

    expect(playbackElement.currentTime).toBeCloseTo(12 / sampleVideo.fps);

    unmount();
  });

  it("updates preview frame from requestVideoFrameCallback while playback stays active", async () => {
    let playbackFrameCallback: PlaybackFrameCallback | null = null;
    const playbackElement = createPlaybackElement({
      requestVideoFrameCallback: vi.fn((callback: PlaybackFrameCallback) => {
        playbackFrameCallback = callback;
        return 1;
      }),
    });
    const { result, unmount } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          reviewState: createReviewState({
            currentFrameIndex: 7,
            selectedVideo: sampleVideo,
          }),
          selectionStatus: "ready",
        }),
      }),
    );

    act(() => {
      result.current.playbackVideoRef.current = playbackElement;
      result.current.handlePlaybackPlay({
        currentTarget: playbackElement,
      } as never);
    });

    await waitFor(() => {
      expect(playbackElement.requestVideoFrameCallback).toHaveBeenCalledTimes(
        1,
      );
    });

    act(() => {
      playbackFrameCallback?.(0, { mediaTime: 0.5 });
    });

    expect(result.current.previewFrameIndex).toBe(12);
    expect(playbackElement.requestVideoFrameCallback).toHaveBeenCalledTimes(2);

    unmount();
  });

  it("falls back to requestAnimationFrame for preview updates when requestVideoFrameCallback is unavailable", async () => {
    let animationFrameCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrameCallback = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const playbackElement = createPlaybackElement();
    const { result, unmount } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          reviewState: createReviewState({
            currentFrameIndex: 7,
            selectedVideo: sampleVideo,
          }),
          selectionStatus: "ready",
        }),
      }),
    );

    act(() => {
      result.current.playbackVideoRef.current = playbackElement;
      result.current.handlePlaybackPlay({
        currentTarget: playbackElement,
      } as never);
    });

    await waitFor(() => {
      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    act(() => {
      playbackElement.currentTime = 0.5;
      animationFrameCallback?.(0);
    });

    expect(result.current.previewFrameIndex).toBe(12);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);

    unmount();
  });

  it("drops canonical-frame wording from object delete playback errors", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          bbox_xyxy_px: [384, 270, 960, 648],
          label: "pedestrian_01",
          mask_confidence: 0.91,
          object_id: "object-1",
          track_summary: {
            corrected: 0,
            frames: 1,
            propagated: 0,
          },
          video_id: sampleVideo.id,
        }),
        {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
        },
      ),
    );
    const playbackElement = createPlaybackElement();
    const { result, unmount } = renderHook(() =>
      useLiveReviewController({
        initialVideoId: null,
        workspace: createWorkspace({
          exactFrame,
          exactFrameStatus: "ready",
          reviewState: createReviewState({
            annotation: {
              ...initialVideoReviewState.annotation,
              objectSummaries: [
                {
                  color: "#00ffaa",
                  id: "object-1",
                  label: "pedestrian_01",
                  status: "active",
                },
              ],
              selectedObjectId: "object-1",
            },
            currentFrameIndex: 7,
            selectedVideo: sampleVideo,
          }),
          selectionStatus: "ready",
        }),
      }),
    );

    act(() => {
      result.current.playbackVideoRef.current = playbackElement;
      result.current.handlePlaybackPlay({
        currentTarget: playbackElement,
      } as never);
    });

    act(() => {
      result.current.handleDeleteObjectTrack();
    });

    expect(result.current.objectDeleteError).toBe(
      "Pause playback before deleting object track.",
    );

    unmount();
  });
});
