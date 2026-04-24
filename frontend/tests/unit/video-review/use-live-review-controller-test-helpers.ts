import { vi } from "vitest";

import {
  initialSam2WorkspaceState,
  initialVideoReviewState,
  type VideoReviewState,
} from "../../../src/features/video-review/state";
import type { VideoReviewWorkspace } from "../../../src/features/video-review/workspace";

export const sampleVideo = {
  id: "video-123",
  source_path: "/tmp/sample.mp4",
  display_name: "sample.mp4",
  frame_count: 42,
  fps: 24,
  width: 1920,
  height: 1080,
  duration_seconds: 1.75,
} as const;

export function createReviewState(
  overrides?: Partial<VideoReviewState>,
): VideoReviewState {
  return {
    ...initialVideoReviewState,
    ...overrides,
    annotation: {
      ...initialVideoReviewState.annotation,
      ...overrides?.annotation,
    },
    sam2: {
      ...initialSam2WorkspaceState,
      ...overrides?.sam2,
      propagation: {
        ...initialSam2WorkspaceState.propagation,
        ...overrides?.sam2?.propagation,
      },
      prompt: {
        ...initialSam2WorkspaceState.prompt,
        ...overrides?.sam2?.prompt,
      },
      refine: {
        ...initialSam2WorkspaceState.refine,
        ...overrides?.sam2?.refine,
      },
      session: {
        ...initialSam2WorkspaceState.session,
        ...overrides?.sam2?.session,
      },
    },
  };
}

export function createWorkspace(options?: {
  createObject?: VideoReviewWorkspace["createObject"];
  exactFrame?: VideoReviewWorkspace["exactFrame"];
  exactFrameStatus?: VideoReviewWorkspace["exactFrameStatus"];
  indexedVideos?: VideoReviewWorkspace["indexedVideos"];
  listStatus?: VideoReviewWorkspace["listStatus"];
  loadExactFrame?: VideoReviewWorkspace["loadExactFrame"];
  refreshSelectedVideo?: VideoReviewWorkspace["refreshSelectedVideo"];
  reviewState?: VideoReviewState;
  runSam2RefineMask?: VideoReviewWorkspace["runSam2RefineMask"];
  selectVideo?: VideoReviewWorkspace["selectVideo"];
  selectionStatus?: VideoReviewWorkspace["selectionStatus"];
  startSam2Propagation?: VideoReviewWorkspace["startSam2Propagation"];
}): VideoReviewWorkspace {
  return {
    activeVideoId: null,
    cancelSam2PropagationJob: vi.fn(async () => {}),
    createObject: options?.createObject ?? vi.fn(async () => {}),
    createSam2Session: vi.fn(async () => {}),
    closeSam2Session: vi.fn(async () => {}),
    deleteFrameAnnotationMask: vi.fn(async () => {}),
    deleteObjectMasks: vi.fn(async () => {}),
    deleteObjectTrack: vi.fn(async () => {}),
    deleteManualAnnotation: vi.fn(async () => {}),
    errorMessage: null,
    exactFrame: options?.exactFrame ?? null,
    exactFrameErrorMessage: null,
    exactFrameStatus: options?.exactFrameStatus ?? "idle",
    indexedVideos: options?.indexedVideos ?? [],
    listStatus: options?.listStatus ?? "loading",
    loadExactFrame: options?.loadExactFrame ?? vi.fn(async () => {}),
    refreshSelectedVideo:
      options?.refreshSelectedVideo ?? vi.fn(async () => {}),
    refreshSam2PropagationJob: vi.fn(async () => {}),
    reviewState: options?.reviewState ?? initialVideoReviewState,
    runSam2RefineMask: options?.runSam2RefineMask ?? vi.fn(async () => {}),
    runSam2PromptBox: vi.fn(async () => {}),
    saveManualAnnotation: vi.fn(async () => {}),
    selectVideo: options?.selectVideo ?? vi.fn(async () => {}),
    selectionStatus: options?.selectionStatus ?? "idle",
    setSam2DraftBox: vi.fn(),
    setSam2SelectedObject: vi.fn(),
    startSam2Propagation:
      options?.startSam2Propagation ?? vi.fn(async () => {}),
  };
}
