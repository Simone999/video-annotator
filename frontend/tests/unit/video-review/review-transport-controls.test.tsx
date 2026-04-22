// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewTransportControls } from "../../../src/features/video-review/components/review-transport-controls";
import type { LiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";

const sampleVideo = {
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
    annotatedFrameIndices: [7, 12, 18],
    canCancelPropagation: false,
    canLoadNextFrame: true,
    canLoadPreviousFrame: true,
    canMutateCurrentFrame: true,
    canStartPropagation: true,
    currentFrameBox: null,
    currentFrameIndex: 12,
    exactFrameImageUrl: null,
    exactFrameReady: true,
    frameInputError: null,
    frameInputRef: createRef<HTMLInputElement>(),
    frameInputValue: "12",
    handleCreateObject: vi.fn(async () => {}),
    handleDeleteManualBox: vi.fn(),
    handleFrameJump: vi.fn(),
    handleFrameStep: vi.fn(),
    handleFrameSubmit: vi.fn(),
    handleManualBoxCommit: vi.fn(),
    handlePlaybackToggle: vi.fn(),
    handleRunSam2: vi.fn(),
    handleStartPropagation: vi.fn(),
    isPlaybackActive: false,
    keyframeIndices: [7, 18],
    manualBoxError: null,
    maskOpacityPercent: 58,
    newObjectLabel: "",
    nextAnnotatedFrameIndex: 18,
    nextKeyframeIndex: 18,
    objectPanelError: null,
    objectSummaries: [],
    pausePlaybackContext: vi.fn(),
    playbackSource: "/api/videos/video-123/source",
    playbackVideoRef: { current: null },
    previousAnnotatedFrameIndex: 7,
    previousKeyframeIndex: 7,
    propagatedFrameIndices: [],
    propagationDirection: "forward",
    propagationEndFrameValue: "41",
    propagationInputError: null,
    propagationJob: null,
    propagationStatus: "idle",
    sam2Annotations: [],
    sam2DraftBox: null,
    selectedFrameAnnotation: null,
    selectedObjectId: "object-1",
    selectedObjectReviewSummary: null,
    selectedObjectReviewSummaryError: null,
    selectedObjectReviewSummaryStatus: "idle",
    selectedObjectSummary: {
      color: "#00ffaa",
      id: "object-1",
      label: "pedestrian_01",
      status: "active",
    },
    selectedRange: {
      boundaryFrameIdx: 41,
      endFrameIdx: 41,
      startFrameIdx: 12,
    },
    selectedSavedManualAnnotation: null,
    selectedVideo: sampleVideo,
    setFrameInputValue: vi.fn(),
    setIsPlaybackActive: vi.fn(),
    setMaskOpacityPercent: vi.fn(),
    setNewObjectLabel: vi.fn(),
    setPropagationDirection: vi.fn(),
    setPropagationEndFrameValue: vi.fn(),
    visibleDraftBox: null,
    ...overrides,
  } as LiveReviewController;
}

function mockBounds(
  element: HTMLElement,
  bounds: { x: number; y: number; width: number; height: number },
) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    bottom: bounds.y + bounds.height,
    height: bounds.height,
    left: bounds.x,
    right: bounds.x + bounds.width,
    top: bounds.y,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
    toJSON: () => bounds,
  });
}

describe("ReviewTransportControls", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("maps slider keyboard shortcuts onto canonical frame handlers", () => {
    const controller = createController();
    render(<ReviewTransportControls controller={controller} />);

    const scrubber = screen.getByRole("slider", { name: "Timeline scrubber" });

    fireEvent.keyDown(scrubber, { key: "ArrowLeft" });
    fireEvent.keyDown(scrubber, { key: "ArrowRight" });
    fireEvent.keyDown(scrubber, { key: "Home" });
    fireEvent.keyDown(scrubber, { key: "End" });
    fireEvent.keyDown(scrubber, { key: "PageDown" });

    expect(controller.handleFrameStep).toHaveBeenNthCalledWith(1, -1);
    expect(controller.handleFrameStep).toHaveBeenNthCalledWith(2, 1);
    expect(controller.handleFrameJump).toHaveBeenNthCalledWith(1, 0);
    expect(controller.handleFrameJump).toHaveBeenNthCalledWith(2, 41);
  });

  it("releases pointer capture after drag scrub and keeps marker clicks on exact frames", () => {
    const controller = createController();
    render(<ReviewTransportControls controller={controller} />);

    const scrubber = screen.getByRole("slider", { name: "Timeline scrubber" });
    mockBounds(scrubber, { height: 24, width: 410, x: 10, y: 20 });

    const setPointerCapture = vi.fn();
    const hasPointerCapture = vi.fn(() => true);
    const releasePointerCapture = vi.fn();
    Object.assign(scrubber, {
      hasPointerCapture,
      releasePointerCapture,
      setPointerCapture,
    });

    fireEvent.pointerDown(scrubber, {
      button: 0,
      clientX: 130,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerMove(scrubber, {
      buttons: 1,
      clientX: 210,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerUp(scrubber, {
      clientX: 210,
      clientY: 24,
      pointerId: 1,
    });

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
    expect(controller.handleFrameJump).toHaveBeenCalledWith(20);

    fireEvent.click(
      screen.getByRole("button", { name: "Annotated frame marker at 18" }),
    );
    expect(controller.handleFrameJump).toHaveBeenLastCalledWith(18);
  });

  it("treats zero-width scrubbers as no-op and renders one-frame tracks at zero percent", () => {
    const controller = createController();
    render(<ReviewTransportControls controller={controller} />);

    const scrubber = screen.getByRole("slider", { name: "Timeline scrubber" });
    mockBounds(scrubber, { height: 24, width: 0, x: 10, y: 20 });

    fireEvent.pointerDown(scrubber, {
      button: 0,
      clientX: 10,
      clientY: 24,
      pointerId: 1,
    });
    fireEvent.pointerMove(scrubber, {
      buttons: 1,
      clientX: 40,
      clientY: 24,
      pointerId: 1,
    });

    expect(controller.handleFrameJump).not.toHaveBeenCalled();

    const singleFrameController = createController({
      annotatedFrameIndices: [0],
      currentFrameIndex: 0,
      keyframeIndices: [0],
      selectedRange: {
        boundaryFrameIdx: 0,
        endFrameIdx: 0,
        startFrameIdx: 0,
      },
      selectedVideo: {
        ...sampleVideo,
        frame_count: 1,
      },
    });
    const { container } = render(
      <ReviewTransportControls controller={singleFrameController} />,
    );

    const timeline = screen.getAllByRole("region", {
      name: "Review timeline",
    })[1];
    expect(within(timeline).getByText("0 / 0")).toBeInTheDocument();
    const currentMarker = within(timeline).getByRole("button", {
      name: "Annotated frame marker at 0",
    });
    expect(currentMarker).toHaveStyle({ left: "0%" });
    expect(container.querySelector(".timeline-playhead")).toHaveStyle({
      left: "calc(0% - 1px)",
    });
  });
});
