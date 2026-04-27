import { useState, type Dispatch, type SetStateAction } from "react";

import {
  getIndexedVideo,
  getVideoManifest,
  listAnnotatedFrameAnnotations,
  type FrameAnnotationsResponse,
} from "../api";
import type { VideoReviewAction } from "../state";
import type { VideoSelectionStatus } from "../workspace-types";
import { formatWorkspaceError } from "./workspace-utils";

export function useVideoSelection({
  clearAnnotatedFrameAnnotations,
  dispatch,
  replaceAnnotatedFrameAnnotations,
  resetExactFrameState,
  setErrorMessage,
}: {
  clearAnnotatedFrameAnnotations: () => void;
  dispatch: Dispatch<VideoReviewAction>;
  replaceAnnotatedFrameAnnotations: (
    frames: readonly FrameAnnotationsResponse[],
  ) => void;
  resetExactFrameState: () => void;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
}) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [selectionStatus, setSelectionStatus] =
    useState<VideoSelectionStatus>("idle");

  async function selectVideo(videoId: string): Promise<void> {
    setActiveVideoId(videoId);
    setErrorMessage(null);
    resetExactFrameState();
    clearAnnotatedFrameAnnotations();
    setSelectionStatus("loading");

    try {
      const [video, manifest, annotatedFrames] = await Promise.all([
        getIndexedVideo({ videoId }),
        getVideoManifest({ videoId }),
        listAnnotatedFrameAnnotations({ videoId }).catch(() => []),
      ]);
      dispatch({
        type: "video-selected",
        video,
      });
      dispatch({
        annotatedFrameIndices: manifest.annotated_frames,
        keyframeIndices: manifest.keyframes,
        objectSummaries: manifest.objects,
        type: "manifest-loaded",
      });
      replaceAnnotatedFrameAnnotations(annotatedFrames);
      setSelectionStatus("ready");
    } catch (error: unknown) {
      clearAnnotatedFrameAnnotations();
      setErrorMessage(formatWorkspaceError(error));
      setSelectionStatus("error");
    }
  }

  async function refreshSelectedVideo(videoId: string): Promise<void> {
    try {
      const video = await getIndexedVideo({ videoId });
      dispatch({
        type: "video-refreshed",
        video,
      });
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
    }
  }

  return {
    activeVideoId,
    refreshSelectedVideo,
    selectVideo,
    selectionStatus,
  };
}
