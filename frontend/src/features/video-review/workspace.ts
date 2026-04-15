import { useEffect, useState } from "react";

import {
  getExactVideoFrame,
  getIndexedVideo,
  listIndexedVideos,
  type ExactVideoFrame,
  VideoReviewApiError,
  type IndexedVideo,
} from "./api";
import { useVideoReviewState, type VideoReviewState } from "./state";

type VideoListStatus = "loading" | "ready" | "empty" | "error";
type VideoSelectionStatus = "idle" | "loading" | "ready" | "error";
type ExactFrameStatus = "idle" | "loading" | "ready" | "error";

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
  loadExactFrame: (frameIdx: number) => Promise<void>;
  selectVideo: (videoId: string) => Promise<void>;
};

export function useVideoReviewWorkspace(): VideoReviewWorkspace {
  const [reviewState, dispatch] = useVideoReviewState();
  const [indexedVideos, setIndexedVideos] = useState<
    VideoReviewWorkspaceState["indexedVideos"]
  >([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exactFrame, setExactFrame] = useState<ExactVideoFrame | null>(null);
  const [exactFrameErrorMessage, setExactFrameErrorMessage] = useState<
    string | null
  >(null);
  const [exactFrameStatus, setExactFrameStatus] =
    useState<ExactFrameStatus>("idle");
  const [listStatus, setListStatus] = useState<VideoListStatus>("loading");
  const [selectionStatus, setSelectionStatus] =
    useState<VideoSelectionStatus>("idle");

  useEffect(() => {
    let isCancelled = false;

    async function loadVideos() {
      try {
        const videos = await listIndexedVideos();

        if (isCancelled) {
          return;
        }

        setIndexedVideos(videos);
        setListStatus(videos.length === 0 ? "empty" : "ready");
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        setIndexedVideos([]);
        setErrorMessage(formatWorkspaceError(error));
        setListStatus("error");
      }
    }

    void loadVideos();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function selectVideo(videoId: string): Promise<void> {
    setActiveVideoId(videoId);
    setErrorMessage(null);
    setExactFrame(null);
    setExactFrameErrorMessage(null);
    setExactFrameStatus("idle");
    setSelectionStatus("loading");

    try {
      const video = await getIndexedVideo({ videoId });
      dispatch({
        type: "video-selected",
        video,
      });
      setSelectionStatus("ready");
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      setSelectionStatus("error");
    }
  }

  async function loadExactFrame(frameIdx: number): Promise<void> {
    if (reviewState.selectedVideo === null) {
      setExactFrame(null);
      setExactFrameErrorMessage("Select a video before loading exact frames.");
      setExactFrameStatus("error");
      return;
    }

    setExactFrameErrorMessage(null);
    setExactFrameStatus("loading");

    try {
      const frame = await getExactVideoFrame({
        frameIdx,
        videoId: reviewState.selectedVideo.id,
      });
      setExactFrame(frame);
      setExactFrameStatus("ready");
      dispatch({
        type: "frame-index-set",
        frameIdx,
      });
    } catch (error: unknown) {
      setExactFrame(null);
      setExactFrameErrorMessage(formatWorkspaceError(error));
      setExactFrameStatus("error");
    }
  }

  return {
    activeVideoId,
    errorMessage,
    exactFrame,
    exactFrameErrorMessage,
    exactFrameStatus,
    indexedVideos,
    listStatus,
    loadExactFrame,
    reviewState,
    selectVideo,
    selectionStatus,
  };
}

function formatWorkspaceError(error: unknown): string {
  if (error instanceof VideoReviewApiError) {
    return error.detail;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Video review request failed.";
}
