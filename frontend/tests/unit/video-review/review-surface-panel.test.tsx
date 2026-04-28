// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewSurfacePanel } from "../../../src/features/video-review/components/review-surface-panel";
import type { LiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";

vi.mock(
  "../../../src/features/video-review/components/review-transport-controls",
  () => ({
    ReviewTransportControls: () => <div>Transport</div>,
  }),
);

vi.mock("../../../src/features/video-review/exact-frame-canvas", () => ({
  ExactFrameCanvas: () => <div aria-label="Exact frame canvas">Canvas</div>,
  ExactFrameOverlay: () => (
    <div aria-label="Playback annotation overlay">Overlay</div>
  ),
}));

const selectedVideo = {
  display_name: "sample.mp4",
  duration_seconds: 1.75,
  fps: 24,
  frame_count: 42,
  height: 1080,
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  width: 1920,
} as const;

function createController(
  overrides?: Partial<LiveReviewController>,
): LiveReviewController {
  return {
    canLoadNextFrame: true,
    canLoadPreviousFrame: true,
    canSaveMaskRefine: false,
    currentFrameIndex: 7,
    exactFrameImageUrl: "/frames/7.png",
    exactFrameReady: true,
    frameInputError: null,
    frameInputRef: { current: null },
    frameInputValue: "7",
    handleFrameStep: vi.fn(),
    handleFrameSubmit: vi.fn((event?: Event) => {
      event?.preventDefault();
    }),
    handleManualBoxCommit: vi.fn(),
    handlePlaybackLoadedMetadata: vi.fn(),
    handlePlaybackPause: vi.fn(),
    handlePlaybackPlay: vi.fn(),
    handlePlaybackTimeUpdate: vi.fn(),
    handlePlaybackToggle: vi.fn(),
    isMaskRefineActive: false,
    isPlaybackActive: false,
    newObjectColor: "#00ffaa",
    playbackAnnotations: [],
    playbackSource: "/api/videos/video-123/source",
    playbackVideoRef: { current: null },
    previewFrameIndex: 7,
    sam2Annotations: [],
    selectedObjectSummary: {
      color: "#00ffaa",
      id: "object-1",
      label: "pedestrian_01",
      status: "active",
    },
    selectedSavedManualAnnotation: null,
    selectedVideo,
    setFrameInputValue: vi.fn(),
    visibleDraftBox: null,
    ...overrides,
  } as unknown as LiveReviewController;
}

function createWorkspace(
  overrides?: Partial<VideoReviewWorkspace>,
): VideoReviewWorkspace {
  return {
    exactFrameErrorMessage: null,
    exactFrameStatus: "ready",
    reviewState: {
      sam2: {
        prompt: {
          errorMessage: null,
          status: "idle",
        },
      },
    },
    selectionStatus: "ready",
    setSam2DraftBox: vi.fn(),
    ...overrides,
  } as unknown as VideoReviewWorkspace;
}

describe("ReviewSurfacePanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows paused exact-frame canvas in the shared stage and wires zoom controls", () => {
    const controller = createController();
    render(
      <ReviewSurfacePanel
        controller={controller}
        workspace={createWorkspace()}
      />,
    );

    expect(controller.playbackVideoRef.current).toBeInstanceOf(
      HTMLVideoElement,
    );
    expect(screen.getByLabelText("Exact frame canvas")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("125%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fit frame" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("keeps previous exact frame visible while next exact frame is loading", () => {
    render(
      <ReviewSurfacePanel
        controller={createController({
          currentFrameIndex: 7,
          exactFrameReady: false,
          previewFrameIndex: 8,
        })}
        workspace={createWorkspace({
          exactFrameStatus: "loading",
        })}
      />,
    );

    expect(screen.getByLabelText("Exact frame canvas")).toBeInTheDocument();
  });

  it("shows playback video with overlay while playing", () => {
    render(
      <ReviewSurfacePanel
        controller={createController({
          exactFrameReady: false,
          isPlaybackActive: true,
          playbackAnnotations: [
            {
              box: null,
              color: "#00ffaa",
              isSelected: true,
              maskUrl: null,
              objectId: "object-1",
            },
          ],
        })}
        workspace={createWorkspace({
          exactFrameStatus: "idle",
        })}
      />,
    );

    expect(screen.getByLabelText("Playback preview")).toBeInTheDocument();
    expect(screen.getByText("Overlay")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Exact frame canvas"),
    ).not.toBeInTheDocument();
  });

  it("shows refine and frame-load status messages while paused on exact frame", () => {
    render(
      <ReviewSurfacePanel
        controller={createController({
          exactFrameReady: true,
          frameInputError: "Frame must be in range.",
          isMaskRefineActive: true,
          refineBrushMode: "erase",
        })}
        workspace={createWorkspace({
          exactFrameErrorMessage: "Frame load failed.",
        })}
      />,
    );

    expect(screen.getByText("Exact frame loaded")).toBeInTheDocument();
    expect(screen.getByText("Frame must be in range.")).toBeInTheDocument();
    expect(screen.getByText("Frame load failed.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Mask correction active. Drag erase brush on paused exact frame 7.",
      ),
    ).toBeInTheDocument();
  });
});
