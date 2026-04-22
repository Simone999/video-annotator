// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  VideoListStatus,
  VideoSelectionStatus,
} from "../../../src/features/video-review/workspace-types";

const {
  reviewInspectorPanelSpy,
  reviewRouteStatusPanelSpy,
  reviewSurfacePanelSpy,
  reviewVideoListPanelSpy,
  useLiveReviewControllerMock,
  useVideoReviewWorkspaceMock,
} = vi.hoisted(() => ({
  reviewInspectorPanelSpy: vi.fn(),
  reviewRouteStatusPanelSpy: vi.fn(),
  reviewSurfacePanelSpy: vi.fn(),
  reviewVideoListPanelSpy: vi.fn(),
  useLiveReviewControllerMock: vi.fn(),
  useVideoReviewWorkspaceMock: vi.fn(),
}));

vi.mock(
  "../../../src/features/video-review/hooks/use-live-review-controller",
  () => ({
    useLiveReviewController: useLiveReviewControllerMock,
  }),
);

vi.mock("../../../src/features/video-review/workspace", () => ({
  useVideoReviewWorkspace: useVideoReviewWorkspaceMock,
}));

vi.mock(
  "../../../src/features/video-review/components/review-route-status-panel",
  () => ({
    ReviewRouteStatusPanel: (props: {
      copy: string;
      title: string;
      tone: "error" | "loading";
    }) => {
      reviewRouteStatusPanelSpy(props);
      return (
        <div>
          <h1>{props.title}</h1>
          <p>{props.copy}</p>
          <span>{props.tone}</span>
        </div>
      );
    },
  }),
);

vi.mock(
  "../../../src/features/video-review/components/review-video-list-panel",
  () => ({
    ReviewVideoListPanel: (props: { routeMode: boolean }) => {
      reviewVideoListPanelSpy(props);
      return <div>Video list panel</div>;
    },
  }),
);

vi.mock(
  "../../../src/features/video-review/components/review-surface-panel",
  () => ({
    ReviewSurfacePanel: (props: object) => {
      reviewSurfacePanelSpy(props);
      return <div>Surface panel</div>;
    },
  }),
);

vi.mock(
  "../../../src/features/video-review/components/review-inspector-panel",
  () => ({
    ReviewInspectorPanel: (props: object) => {
      reviewInspectorPanelSpy(props);
      return <div>Inspector panel</div>;
    },
  }),
);

import { LiveReviewScreen } from "../../../src/features/video-review/components/live-review-screen";

type ScreenWorkspace = {
  errorMessage: string | null;
  indexedVideos: Array<{
    display_name: string;
    id: string;
  }>;
  listStatus: VideoListStatus;
  selectionStatus: VideoSelectionStatus;
};

type ScreenController = {
  currentFrameIndex: number;
  selectedVideo: {
    display_name: string;
    fps: number;
    frame_count: number;
    id: string;
  } | null;
};

function createWorkspace(
  overrides?: Partial<ScreenWorkspace>,
): ScreenWorkspace {
  return {
    ...baseWorkspace(),
    ...overrides,
  };
}

function baseWorkspace(): ScreenWorkspace {
  return {
    errorMessage: null,
    indexedVideos: [
      {
        display_name: "route-video.mp4",
        id: "video-1",
      },
    ],
    listStatus: "ready" as const,
    selectionStatus: "ready" as const,
  };
}

function createController(
  overrides?: Partial<ScreenController>,
): ScreenController {
  return {
    ...baseController(),
    ...overrides,
  };
}

function baseController(): ScreenController {
  return {
    currentFrameIndex: 7,
    selectedVideo: {
      display_name: "route-video.mp4",
      fps: 23.976,
      frame_count: 42,
      id: "video-1",
    },
  };
}

describe("LiveReviewScreen", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders loading route shell while direct route waits for indexed videos", () => {
    useVideoReviewWorkspaceMock.mockReturnValue(
      createWorkspace({
        indexedVideos: [],
        listStatus: "loading",
      }),
    );
    useLiveReviewControllerMock.mockReturnValue(createController());

    render(<LiveReviewScreen initialVideoId="video-1" />);

    expect(screen.getByText("Opening review workspace")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Direct route owns video selection from URL. Preparing review workspace before live controls mount.",
      ),
    ).toBeInTheDocument();
    expect(reviewRouteStatusPanelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ tone: "loading" }),
    );
  });

  it("renders direct-route error shells for list errors, empty library, missing route video, and selection failures", () => {
    useLiveReviewControllerMock.mockReturnValue(createController());

    useVideoReviewWorkspaceMock.mockReturnValueOnce(
      createWorkspace({
        errorMessage: null,
        indexedVideos: [],
        listStatus: "error",
      }),
    );
    const { rerender } = render(<LiveReviewScreen initialVideoId="video-1" />);
    expect(
      screen.getByText("Unable to load indexed videos for review route."),
    ).toBeInTheDocument();

    useVideoReviewWorkspaceMock.mockReturnValueOnce(
      createWorkspace({
        indexedVideos: [],
        listStatus: "empty",
      }),
    );
    rerender(<LiveReviewScreen initialVideoId="video-1" />);
    expect(
      screen.getByText(
        "No indexed videos found yet, so direct review route cannot open a workspace.",
      ),
    ).toBeInTheDocument();

    useVideoReviewWorkspaceMock.mockReturnValueOnce(
      createWorkspace({
        indexedVideos: [
          {
            display_name: "other-video.mp4",
            id: "other-video",
          },
        ],
      }),
    );
    rerender(<LiveReviewScreen initialVideoId="video-1" />);
    expect(
      screen.getByText(
        "Requested review route is not indexed in local library.",
      ),
    ).toBeInTheDocument();

    useVideoReviewWorkspaceMock.mockReturnValueOnce(
      createWorkspace({
        errorMessage: null,
        selectionStatus: "error",
      }),
    );
    useLiveReviewControllerMock.mockReturnValueOnce(
      createController({
        selectedVideo: null,
      }),
    );
    rerender(<LiveReviewScreen initialVideoId="video-1" />);
    expect(
      screen.getByText("Video review request failed."),
    ).toBeInTheDocument();
  });

  it("renders selection-loading route shell once route video exists", () => {
    useVideoReviewWorkspaceMock.mockReturnValue(
      createWorkspace({
        selectionStatus: "idle",
      }),
    );
    useLiveReviewControllerMock.mockReturnValue(createController());

    render(<LiveReviewScreen initialVideoId="video-1" />);

    expect(
      screen.getByText("Preparing live review workspace for route-video.mp4."),
    ).toBeInTheDocument();
  });

  it("renders full review chrome when route shell resolves to null", () => {
    useVideoReviewWorkspaceMock.mockReturnValue(createWorkspace());
    useLiveReviewControllerMock.mockReturnValue(createController());

    render(<LiveReviewScreen initialVideoId={null} />);

    expect(screen.getByText("Video Annotation")).toBeInTheDocument();
    expect(screen.getByText("Video:")).toBeInTheDocument();
    expect(screen.getByText("route-video.mp4")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("23.98")).toBeInTheDocument();
    expect(screen.getByText("Video list panel")).toBeInTheDocument();
    expect(screen.getByText("Surface panel")).toBeInTheDocument();
    expect(screen.getByText("Inspector panel")).toBeInTheDocument();
    expect(reviewVideoListPanelSpy).toHaveBeenCalledWith(
      expect.objectContaining({ routeMode: false }),
    );
  });
});
