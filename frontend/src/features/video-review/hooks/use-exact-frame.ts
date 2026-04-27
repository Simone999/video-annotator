import { useRef, useState, type Dispatch } from "react";

import {
  type FrameAnnotation,
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
  syncAnnotatedFrameAnnotations,
}: {
  dispatch: Dispatch<VideoReviewAction>;
  selectedVideo: IndexedVideo | null;
  syncAnnotatedFrameAnnotations?: (
    frameIdx: number,
    annotations: readonly FrameAnnotation[],
  ) => void;
}) {
  const [exactFrame, setExactFrame] = useState<ExactVideoFrame | null>(null);
  const [exactFrameErrorMessage, setExactFrameErrorMessage] = useState<
    string | null
  >(null);
  const [exactFrameStatus, setExactFrameStatus] =
    useState<ExactFrameStatus>("idle");
  const latestFrameRequestIdRef = useRef(0);

  function resetExactFrameState() {
    latestFrameRequestIdRef.current += 1;
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

    const requestId = latestFrameRequestIdRef.current + 1;
    latestFrameRequestIdRef.current = requestId;
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
      if (latestFrameRequestIdRef.current !== requestId) {
        return;
      }
      setExactFrame(frame);
      setExactFrameStatus("ready");
      syncAnnotatedFrameAnnotations?.(frameIdx, annotations.annotations);
      dispatch({
        annotations: annotations.annotations,
        frameIdx,
        type: "frame-loaded",
      });
    } catch (error: unknown) {
      if (latestFrameRequestIdRef.current !== requestId) {
        return;
      }
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
