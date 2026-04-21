import { useState, type Dispatch, type SetStateAction } from "react";

import { getIndexedVideo, getVideoManifest } from "../api";
import type { VideoReviewAction } from "../state";
import type { VideoSelectionStatus } from "../workspace-types";
import { formatWorkspaceError } from "./workspace-utils";

export function useVideoSelection({
  dispatch,
  resetExactFrameState,
  setErrorMessage,
}: {
  dispatch: Dispatch<VideoReviewAction>;
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
    setSelectionStatus("loading");

    try {
      const [video, manifest] = await Promise.all([
        getIndexedVideo({ videoId }),
        getVideoManifest({ videoId }),
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
      setSelectionStatus("ready");
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      setSelectionStatus("error");
    }
  }

  return {
    activeVideoId,
    selectVideo,
    selectionStatus,
  };
}
