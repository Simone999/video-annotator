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
    currentFrameIndex: 7,
    exactFrameImageUrl: null,
    exactFrameReady: true,
    frameInputError: null,
    frameInputRef: createRef<HTMLInputElement>(),
    frameInputValue: "7",
    handleCreateObject: vi.fn(async () => {}),
    handleDeleteManualBox: vi.fn(),
    handleFrameJump: vi.fn(),
    handleFrameStep: vi.fn(),
    handleFrameSubmit: vi.fn(),
    handleManualBoxCommit: vi.fn(),
    handlePlaybackLoadedMetadata: vi.fn(),
    handlePlaybackPause: vi.fn(),
    handlePlaybackPlay: vi.fn(),
    handlePlaybackTimeUpdate: vi.fn(),
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
    previewFrameIndex: 12,
    previousAnnotatedFrameIndex: 7,
    previousKeyframeIndex: 7,
    propagatedFrameIndices: [],
    propagationDirection: "both",
    propagationEndFrameValue: "9",
    propagationInputError: null,
    propagationJob: null,
    propagationRangeStartFrameValue: "4",
    propagationSeedFrameValue: "7",
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
      endFrameIdx: 9,
      startFrameIdx: 4,
    },
    selectedSavedManualAnnotation: null,
    selectedVideo: sampleVideo,
    setFrameInputValue: vi.fn(),
    setIsPlaybackActive: vi.fn(),
    setMaskOpacityPercent: vi.fn(),
    setNewObjectLabel: vi.fn(),
    setPropagationDirection: vi.fn(),
    setPropagationEndFrameValue: vi.fn(),
    setPropagationRangeStartFrameValue: vi.fn(),
    setPropagationSeedFrameValue: vi.fn(),
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

  it("maps slider keyboard shortcuts onto viewed-frame handlers", () => {
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

  it("maps visible track start onto frame zero even with scrubber padding", () => {
    const controller = createController();
    render(<ReviewTransportControls controller={controller} />);

    const scrubber = screen.getByRole("slider", { name: "Timeline scrubber" });
    mockBounds(scrubber, { height: 24, width: 410, x: 10, y: 20 });

    fireEvent.pointerDown(scrubber, {
      button: 0,
      clientX: 22,
      clientY: 24,
      pointerId: 1,
    });

    expect(controller.handleFrameJump).toHaveBeenCalledWith(0);
  });

  it("renders sprite-backed preview thumbnails and keeps viewed-frame playhead separate from selected range", () => {
    const controller = createController();
    const { container } = render(
      <ReviewTransportControls controller={controller} />,
    );

    expect(screen.getByLabelText("Range start frame")).toHaveValue(4);
    expect(screen.getByLabelText("Range end frame")).toHaveValue(9);
    expect(screen.getByLabelText("Propagation seed frame")).toHaveValue(7);

    const timeline = screen.getByRole("region", { name: "Review timeline" });
    expect(within(timeline).getByText("4-9")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Timeline scrubber" }),
    ).toHaveAttribute("aria-valuenow", "12");

    const previewButton = screen.getByRole("button", { name: "Open frame 12" });
    const previewImage = within(previewButton).getByAltText("Preview frame 12");
    expect(previewImage).toHaveAttribute(
      "src",
      "/api/videos/video-123/thumbnails/sprite?start_frame_idx=6&count=12&width=112",
    );
    expect(previewImage.getAttribute("style")).toContain("left: -600%");
    expect(previewImage.getAttribute("style")).toContain("width: 1200%");
    const preloadSpriteImages = Array.from(
      container.querySelectorAll('img[src*="/thumbnails/sprite"]'),
    ).map((image) => image.getAttribute("src"));
    expect(preloadSpriteImages).toEqual(
      expect.arrayContaining([
        "/api/videos/video-123/thumbnails/sprite?start_frame_idx=6&count=12&width=112",
        "/api/videos/video-123/thumbnails/sprite?start_frame_idx=0&count=12&width=112",
        "/api/videos/video-123/thumbnails/sprite?start_frame_idx=12&count=12&width=112",
      ]),
    );
  });

  it("syncs range handles and start or end inputs without scrubbing current frame", () => {
    const controller = createController();
    render(<ReviewTransportControls controller={controller} />);

    fireEvent.change(screen.getByLabelText("Range start frame"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Range end frame"), {
      target: { value: "11" },
    });
    fireEvent.change(screen.getByLabelText("Propagation seed frame"), {
      target: { value: "8" },
    });

    expect(controller.setPropagationRangeStartFrameValue).toHaveBeenCalledWith(
      "3",
    );
    expect(controller.setPropagationEndFrameValue).toHaveBeenCalledWith("11");
    expect(controller.setPropagationSeedFrameValue).toHaveBeenCalledWith("8");

    const scrubber = screen.getByRole("slider", { name: "Timeline scrubber" });
    mockBounds(scrubber, { height: 24, width: 410, x: 10, y: 20 });

    const endHandle = screen.getByRole("button", { name: "Range end handle" });
    const setPointerCapture = vi.fn();
    const hasPointerCapture = vi.fn(() => true);
    const releasePointerCapture = vi.fn();
    Object.assign(endHandle, {
      hasPointerCapture,
      releasePointerCapture,
      setPointerCapture,
    });

    fireEvent.pointerDown(endHandle, {
      button: 0,
      clientX: 126,
      clientY: 24,
      pointerId: 2,
    });
    fireEvent.pointerMove(endHandle, {
      buttons: 1,
      clientX: 210,
      clientY: 24,
      pointerId: 2,
    });
    fireEvent.pointerUp(endHandle, {
      clientX: 210,
      clientY: 24,
      pointerId: 2,
    });

    expect(controller.setPropagationEndFrameValue).toHaveBeenCalledWith("20");
    expect(controller.handleFrameJump).not.toHaveBeenCalledWith(20);
    expect(setPointerCapture).toHaveBeenCalledWith(2);
    expect(releasePointerCapture).toHaveBeenCalledWith(2);
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
      previewFrameIndex: 0,
      propagationEndFrameValue: "0",
      propagationRangeStartFrameValue: "0",
      propagationSeedFrameValue: "0",
      selectedRange: {
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
    expect(currentMarker).toHaveStyle({ left: "12px" });
    expect(container.querySelector(".timeline-playhead")).toHaveStyle({
      left: "11px",
    });
  });
});
