import {
  type Sam2PropagationDirection,
  type ExactVideoFrame,
  type IndexedVideo,
} from "./api";
import { useState } from "react";
import { useExactFrame } from "./hooks/use-exact-frame";
import { useIndexedVideos } from "./hooks/use-indexed-videos";
import { useSam2Workspace } from "./hooks/use-sam2-workspace";
import { useVideoSelection } from "./hooks/use-video-selection";
import {
  useVideoReviewState,
  type Sam2DraftBox,
  type VideoReviewState,
} from "./state";
import type {
  ExactFrameStatus,
  VideoListStatus,
  VideoSelectionStatus,
} from "./workspace-types";

export type VideoReviewWorkspaceState = {
  reviewState: VideoReviewState;
  indexedVideos: readonly IndexedVideo[];
  activeVideoId: string | null;
  errorMessage: string | null;
  exactFrame: ExactVideoFrame | null;
  exactFrameErrorMessage: string | null;
  exactFrameStatus: ExactFrameStatus;
  listStatus: VideoListStatus;
  selectionStatus: VideoSelectionStatus;
};

export type VideoReviewWorkspace = VideoReviewWorkspaceState & {
  cancelSam2PropagationJob: () => Promise<void>;
  createObject: (label: string) => Promise<void>;
  closeSam2Session: () => Promise<void>;
  createSam2Session: () => Promise<void>;
  deleteFrameAnnotationMask: (options: {
    frameIdx: number;
    objectId: string;
  }) => Promise<void>;
  deleteObjectMasks: (options: { objectId: string }) => Promise<void>;
  deleteObjectTrack: (options: { objectId: string }) => Promise<void>;
  deleteManualAnnotation: (options: {
    frameIdx: number;
    objectId: string;
  }) => Promise<void>;
  loadExactFrame: (frameIdx: number) => Promise<void>;
  refreshSam2PropagationJob: () => Promise<void>;
  runSam2RefineMask: (options: {
    frameIdx: number;
    objectId: string;
    positivePoints: readonly [number, number][];
    negativePoints: readonly [number, number][];
  }) => Promise<void>;
  saveManualAnnotation: (options: {
    boxXywhNorm: readonly [number, number, number, number];
    frameIdx: number;
    objectId: string;
  }) => Promise<void>;
  setSam2DraftBox: (box: Sam2DraftBox | null) => void;
  setSam2SelectedObject: (objectId: string) => void;
  runSam2PromptBox: (options: {
    frameIdx: number;
    objectId: string;
    boxXyxyPx: readonly [number, number, number, number];
  }) => Promise<void>;
  selectVideo: (videoId: string) => Promise<void>;
  startSam2Propagation: (options: {
    startFrameIdx: number;
    endFrameIdx?: number;
    direction: Sam2PropagationDirection;
    objectIds: readonly string[];
  }) => Promise<void>;
};

export function useVideoReviewWorkspace(): VideoReviewWorkspace {
  const [reviewState, dispatch] = useVideoReviewState();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { indexedVideos, listStatus } = useIndexedVideos({
    setErrorMessage,
  });
  const {
    exactFrame,
    exactFrameErrorMessage,
    exactFrameStatus,
    loadExactFrame,
    resetExactFrameState,
  } = useExactFrame({
    dispatch,
    selectedVideo: reviewState.selectedVideo,
  });
  const { activeVideoId, selectVideo, selectionStatus } = useVideoSelection({
    dispatch,
    resetExactFrameState,
    setErrorMessage,
  });
  const {
    cancelSam2PropagationJob,
    closeSam2Session,
    createObject,
    createSam2Session,
    deleteFrameAnnotationMask,
    deleteObjectMasks,
    deleteObjectTrack,
    deleteManualAnnotation,
    refreshSam2PropagationJob,
    runSam2RefineMask,
    runSam2PromptBox,
    saveManualAnnotation,
    setSam2DraftBox,
    setSam2SelectedObject,
    startSam2Propagation,
  } = useSam2Workspace({
    dispatch,
    reviewState,
    setErrorMessage,
  });

  return {
    activeVideoId,
    cancelSam2PropagationJob,
    createObject,
    closeSam2Session,
    createSam2Session,
    deleteFrameAnnotationMask,
    deleteObjectMasks,
    deleteObjectTrack,
    errorMessage,
    exactFrame,
    exactFrameErrorMessage,
    exactFrameStatus,
    indexedVideos,
    listStatus,
    loadExactFrame,
    deleteManualAnnotation,
    refreshSam2PropagationJob,
    reviewState,
    runSam2RefineMask,
    saveManualAnnotation,
    runSam2PromptBox,
    setSam2DraftBox,
    setSam2SelectedObject,
    selectVideo,
    selectionStatus,
    startSam2Propagation,
  };
}
