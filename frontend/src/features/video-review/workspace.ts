import { useEffect, useState } from "react";

import {
  createObjectTrack,
  deleteFrameAnnotation as deleteFrameAnnotationRequest,
  getExactVideoFrame,
  getFrameAnnotations,
  getVideoManifest,
  listIndexedVideos,
  upsertFrameAnnotations as upsertFrameAnnotationsRequest,
  type ExactVideoFrame,
  type FrameAnnotation,
  type ObjectTrackSummary,
  VideoReviewApiError,
  type IndexedVideo,
} from "./api";
import {
  useVideoReviewState,
  type AnnotationBoxDraft,
  type VideoReviewState,
} from "./state";

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
  createObject: (label: string) => Promise<ObjectTrackSummary>;
  deleteFrameAnnotation: (frameIdx: number, objectId: number) => Promise<void>;
  loadFrameAnnotations: (frameIdx: number) => Promise<void>;
  loadExactFrame: (frameIdx: number) => Promise<void>;
  saveFrameAnnotations: (
    frameIdx: number,
    annotations: readonly FrameAnnotation[],
  ) => Promise<void>;
  selectObject: (objectId: number | null) => void;
  selectVideo: (videoId: string) => Promise<void>;
  setDraftAnnotationBox: (draft: AnnotationBoxDraft | null) => void;
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
      const manifest = await getVideoManifest({ videoId });
      dispatch({
        manifest,
        type: "manifest-loaded",
      });
      setSelectionStatus("ready");
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      setSelectionStatus("error");
    }
  }

  async function loadFrameAnnotations(frameIdx: number): Promise<void> {
    if (reviewState.selectedVideo === null) {
      setErrorMessage("Select a video before loading annotations.");
      return;
    }

    try {
      const frameAnnotations = await getFrameAnnotations({
        frameIdx,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        annotations: frameAnnotations.annotations,
        frameIdx: frameAnnotations.frame_idx,
        type: "frame-annotations-received",
      });
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      throw error;
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
      void loadFrameAnnotations(frameIdx).catch(() => undefined);
    } catch (error: unknown) {
      setExactFrame(null);
      setExactFrameErrorMessage(formatWorkspaceError(error));
      setExactFrameStatus("error");
    }
  }

  async function createObject(label: string): Promise<ObjectTrackSummary> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before creating an object.");
    }

    try {
      const objectTrack = await createObjectTrack({
        label,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        object: objectTrack,
        type: "object-created",
      });
      return objectTrack;
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      throw error;
    }
  }

  async function saveFrameAnnotations(
    frameIdx: number,
    annotations: readonly FrameAnnotation[],
  ): Promise<void> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before saving annotations.");
    }

    try {
      const frameAnnotations = await upsertFrameAnnotationsRequest({
        annotations,
        frameIdx,
        videoId: reviewState.selectedVideo.id,
      });
      dispatch({
        annotations: frameAnnotations.annotations,
        frameIdx: frameAnnotations.frame_idx,
        type: "frame-annotations-received",
      });
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      throw error;
    }
  }

  async function deleteFrameAnnotation(
    frameIdx: number,
    objectId: number,
  ): Promise<void> {
    if (reviewState.selectedVideo === null) {
      throw new Error("Select a video before deleting annotations.");
    }

    try {
      await deleteFrameAnnotationRequest({
        frameIdx,
        objectId,
        videoId: reviewState.selectedVideo.id,
      });
      await loadFrameAnnotations(frameIdx);
    } catch (error: unknown) {
      setErrorMessage(formatWorkspaceError(error));
      throw error;
    }
  }

  function selectObject(objectId: number | null): void {
    dispatch({
      objectId,
      type: "selected-object-set",
    });
  }

  function setDraftAnnotationBox(draft: AnnotationBoxDraft | null): void {
    dispatch({
      draft,
      type: "draft-annotation-box-set",
    });
  }

  return {
    activeVideoId,
    createObject,
    deleteFrameAnnotation,
    errorMessage,
    exactFrame,
    exactFrameErrorMessage,
    exactFrameStatus,
    indexedVideos,
    listStatus,
    loadFrameAnnotations,
    loadExactFrame,
    reviewState,
    saveFrameAnnotations,
    selectObject,
    selectVideo,
    setDraftAnnotationBox,
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
