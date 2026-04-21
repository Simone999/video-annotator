import { useState, type Dispatch } from "react";

import {
  getFrameAnnotations,
  getExactVideoFrame,
  type ExactVideoFrame,
  type IndexedVideo,
} from "../api";
import type { VideoReviewAction } from "../state";
import type { ExactFrameStatus } from "../workspace-types";
import { formatWorkspaceError } from "./workspace-utils";

export function useExactFrame({
  dispatch,
  selectedVideo,
}: {
  dispatch: Dispatch<VideoReviewAction>;
  selectedVideo: IndexedVideo | null;
}) {
  const [exactFrame, setExactFrame] = useState<ExactVideoFrame | null>(null);
  const [exactFrameErrorMessage, setExactFrameErrorMessage] = useState<
    string | null
  >(null);
  const [exactFrameStatus, setExactFrameStatus] =
    useState<ExactFrameStatus>("idle");

  function resetExactFrameState() {
    setExactFrame(null);
    setExactFrameErrorMessage(null);
    setExactFrameStatus("idle");
  }

  async function loadExactFrame(frameIdx: number): Promise<void> {
    if (selectedVideo === null) {
      setExactFrame(null);
      setExactFrameErrorMessage("Select a video before loading exact frames.");
      setExactFrameStatus("error");
      return;
    }

    setExactFrameErrorMessage(null);
    setExactFrameStatus("loading");

    try {
      const [frame, annotations] = await Promise.all([
        getExactVideoFrame({
          frameIdx,
          videoId: selectedVideo.id,
        }),
        getFrameAnnotations({
          frameIdx,
          videoId: selectedVideo.id,
        }),
      ]);
      setExactFrame(frame);
      setExactFrameStatus("ready");
      dispatch({
        annotations: annotations.annotations,
        frameIdx,
        type: "frame-loaded",
      });
    } catch (error: unknown) {
      setExactFrame(null);
      setExactFrameErrorMessage(formatWorkspaceError(error));
      setExactFrameStatus("error");
    }
  }

  return {
    exactFrame,
    exactFrameErrorMessage,
    exactFrameStatus,
    loadExactFrame,
    resetExactFrameState,
  };
}
