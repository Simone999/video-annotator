// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewVideoListPanel } from "../../../src/features/video-review/components/review-video-list-panel";
import type { LiveReviewController } from "../../../src/features/video-review/hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";

afterEach(() => {
  cleanup();
});

function createController(
  overrides?: Partial<LiveReviewController>,
): LiveReviewController {
  return {
    currentFrameIndex: 7,
    handleCreateObject: vi.fn(async () => {}),
    newObjectLabel: "",
    objectPanelError: null,
    objectSummaries: [],
    selectedObjectId: "",
    selectedVideo: null,
    setNewObjectLabel: vi.fn(),
    ...overrides,
  } as unknown as LiveReviewController;
}

function createWorkspace(
  overrides?: Partial<VideoReviewWorkspace>,
): VideoReviewWorkspace {
  return {
    activeVideoId: null,
    errorMessage: null,
    indexedVideos: [],
    listStatus: "loading",
    reviewState: {
      annotation: {
        savedManualAnnotationsByFrame: {},
      },
      currentFrameIndex: 7,
      sam2: {
        frameAnnotations: [],
      },
    },
    selectVideo: vi.fn(async () => {}),
    selectionStatus: "idle",
    setSam2SelectedObject: vi.fn(),
    ...overrides,
  } as unknown as VideoReviewWorkspace;
}

describe("ReviewVideoListPanel", () => {
  it("renders no-selection route states for loading, empty, error, and ready catalogs", async () => {
    const user = userEvent.setup();
    const onBackToLibrary = vi.fn();
    const selectVideo = vi.fn(async () => {});
    const { rerender } = render(
      <ReviewVideoListPanel
        controller={createController()}
        onBackToLibrary={onBackToLibrary}
        routeMode
        workspace={createWorkspace({
          listStatus: "loading",
        })}
      />,
    );

    expect(screen.getByText("Review route")).toBeInTheDocument();
    expect(screen.getByText("Route-owned review workspace")).toBeInTheDocument();
    expect(screen.getByText("Loading indexed videos...")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to Library" }));
    expect(onBackToLibrary).toHaveBeenCalledTimes(1);

    rerender(
      <ReviewVideoListPanel
        controller={createController()}
        routeMode={false}
        workspace={createWorkspace({
          errorMessage: "List fetch failed.",
          listStatus: "error",
        })}
      />,
    );
    expect(screen.getByText("Indexed videos")).toBeInTheDocument();
    expect(
      screen.getByText("Canonical exact-frame index: 7"),
    ).toBeInTheDocument();
    expect(screen.getByText("List fetch failed.")).toBeInTheDocument();

    rerender(
      <ReviewVideoListPanel
        controller={createController()}
        routeMode={false}
        workspace={createWorkspace({
          listStatus: "empty",
        })}
      />,
    );
    expect(screen.getByText("No indexed videos found yet.")).toBeInTheDocument();

    rerender(
      <ReviewVideoListPanel
        controller={createController()}
        routeMode={false}
        workspace={createWorkspace({
          activeVideoId: "video-2",
          indexedVideos: [
            {
              display_name: "alpha.mp4",
              duration_seconds: 1.0,
              fps: 24,
              frame_count: 24,
              height: 1080,
              id: "video-1",
              source_path: "/tmp/alpha.mp4",
              width: 1920,
            },
            {
              display_name: "beta.mp4",
              duration_seconds: 1.0,
              fps: 24,
              frame_count: 24,
              height: 1080,
              id: "video-2",
              source_path: "/tmp/beta.mp4",
              width: 1920,
            },
          ],
          listStatus: "ready",
          selectVideo,
        })}
      />,
    );

    const betaButton = screen.getByRole("button", { name: /Open beta.mp4/i });
    expect(screen.getByRole("list", { name: "Indexed videos" })).toBeInTheDocument();
    expect(betaButton).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: /Open alpha.mp4/i }));
    expect(selectVideo).toHaveBeenCalledWith("video-1");
  });

  it("renders selected-video objects with box or mask truth and create-object affordances", async () => {
    const user = userEvent.setup();
    const setSam2SelectedObject = vi.fn();
    const setNewObjectLabel = vi.fn();
    const handleCreateObject = vi.fn(async () => {});

    render(
      <ReviewVideoListPanel
        controller={createController({
          handleCreateObject,
          newObjectLabel: "new target",
          objectPanelError: "Create failed.",
          objectSummaries: [
            {
              color: "#00ffaa",
              id: "object-1",
              label: "pedestrian_01",
              status: "active",
            },
            {
              color: "#ffaa00",
              id: "object-2",
              label: "cyclist_02",
              status: "active",
            },
          ],
          selectedObjectId: "object-1",
          selectedVideo: {
            display_name: "sample.mp4",
            duration_seconds: 1.75,
            fps: 24,
            frame_count: 42,
            height: 1080,
            id: "video-123",
            source_path: "/tmp/sample.mp4",
            width: 1920,
          },
          setNewObjectLabel,
        })}
        onBackToLibrary={vi.fn()}
        routeMode
        workspace={createWorkspace({
          reviewState: {
            annotation: {
              savedManualAnnotationsByFrame: {
                7: {
                  "object-1": {
                    box_xywh_norm: [0.1, 0.2, 0.3, 0.4],
                    frame_idx: 7,
                    is_keyframe: true,
                    mask: null,
                    object_id: "object-1",
                    source: "manual",
                    video_id: "video-123",
                  },
                },
              },
            },
            currentFrameIndex: 7,
            sam2: {
              frameAnnotations: [
                {
                  box_xywh_norm: [0.2, 0.25, 0.3, 0.35],
                  mask: {
                    path: "masks/video-123/object-1/frame_000007.png",
                  },
                  object_id: "object-1",
                  source: "sam2",
                },
              ],
            },
          },
          setSam2SelectedObject,
        })}
      />,
    );

    expect(screen.getByText("Annotations · Frame 7")).toBeInTheDocument();
    expect(screen.getByText("2 OBJ")).toBeInTheDocument();
    expect(screen.getByText("pedestrian_01")).toBeInTheDocument();
    expect(screen.getByText("cyclist_02")).toBeInTheDocument();
    const selectedRow = screen.getByRole("button", { name: /pedestrian_01/i });
    const unselectedRow = screen.getByRole("button", { name: /cyclist_02/i });
    expect(within(selectedRow).getByText("Box")).toBeInTheDocument();
    expect(within(selectedRow).getByText("Mask")).toBeInTheDocument();
    expect(within(unselectedRow).getAllByText("—")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Create object" })).toBeEnabled();
    expect(screen.getByText("Create failed.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /pedestrian_01/i }));
    expect(setSam2SelectedObject).toHaveBeenCalledWith("object-1");

    await user.type(screen.getByRole("textbox", { name: "New object label" }), "A");
    expect(setNewObjectLabel).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Create object" }));
    expect(handleCreateObject).toHaveBeenCalledTimes(1);
  });
});
