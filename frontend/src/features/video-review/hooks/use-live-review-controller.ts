import { useEffect, useRef, useState, type SyntheticEvent } from "react";

import {
  createVideoExport,
  getFrameAnnotationMaskUrl,
  getExportDownloadUrl,
  getIndexedVideoPlaybackUrl,
  getSelectedObjectSummary,
  type SelectedObjectSummaryResponse,
  type Sam2PropagationDirection,
} from "../api";
import type { VideoReviewWorkspace } from "../workspace";
import { formatWorkspaceError } from "./workspace-utils";

export type LiveReviewController = ReturnType<typeof useLiveReviewController>;

type SelectedObjectSummaryStatus = "error" | "idle" | "loading" | "ready";

type SelectedObjectReviewSummaryState = {
  requestKey: string | null;
  summary: SelectedObjectSummaryResponse | null;
  error: string | null;
  status: SelectedObjectSummaryStatus;
};

type SelectedRangeState = {
  startFrameIdx: number;
  endFrameIdx: number;
};

type RefineBrushMode = "add" | "erase";

type RefineCanvasPoint = {
  x: number;
  y: number;
};

type ExportRequestStatus = "error" | "idle" | "loading" | "ready";

type PlaybackFrameMetadata = {
  mediaTime: number;
};

type PlaybackVideoElement = HTMLVideoElement & {
  cancelVideoFrameCallback?: (handle: number) => void;
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: PlaybackFrameMetadata) => void,
  ) => number;
};

const REVIEW_OBJECT_COLORS = [
  "#04B84C",
  "#FB6A22",
  "#FFC300",
  "#0285FF",
  "#924FF7",
  "#FF66AD",
] as const;

export function useLiveReviewController({
  initialVideoId,
  workspace,
}: {
  initialVideoId: string | null;
  workspace: VideoReviewWorkspace;
}) {
  const selectedVideo = workspace.reviewState.selectedVideo;
  const currentFrameIndex = workspace.reviewState.currentFrameIndex;
  const objectSummaries = workspace.reviewState.annotation.objectSummaries;
  const annotatedFrameIndices =
    workspace.reviewState.annotation.annotatedFrameIndices;
  const keyframeIndices = workspace.reviewState.annotation.keyframeIndices;
  const initialPropagationRangeEndFrameValue =
    selectedVideo === null ? "0" : String(selectedVideo.frame_count - 1);
  const initialPropagationSeedFrameValue =
    selectedVideo === null
      ? "0"
      : String(annotatedFrameIndices[0] ?? currentFrameIndex);
  const initialVideoSelectionRef = useRef<string | null>(null);
  const landingFrameLoadRef = useRef<string | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const frameInputRef = useRef<HTMLInputElement | null>(null);
  const currentFrameIndexRef = useRef(0);
  const propagationDirectionRef = useRef<Sam2PropagationDirection>("both");
  const propagationRangeStartFrameValueRef = useRef("0");
  const propagationEndFrameValueRef = useRef(
    initialPropagationRangeEndFrameValue,
  );
  const propagationSeedFrameValueRef = useRef(initialPropagationSeedFrameValue);
  const selectedObjectSummaryRequestIdRef = useRef(0);
  currentFrameIndexRef.current = currentFrameIndex;
  const playbackSource =
    selectedVideo === null
      ? null
      : getIndexedVideoPlaybackUrl({ videoId: selectedVideo.id });
  const [frameInputValue, setFrameInputValue] = useState("0");
  const [frameInputError, setFrameInputError] = useState<string | null>(null);
  const [propagationDirection, setPropagationDirection] =
    useState<Sam2PropagationDirection>("both");
  const [propagationRangeStartFrameValue, setPropagationRangeStartFrameValue] =
    useState("0");
  const [propagationEndFrameValue, setPropagationEndFrameValue] = useState(
    initialPropagationRangeEndFrameValue,
  );
  const [propagationSeedFrameValue, setPropagationSeedFrameValue] = useState(
    initialPropagationSeedFrameValue,
  );
  const [newObjectLabel, setNewObjectLabel] = useState("");
  const [newObjectColor, setNewObjectColor] = useState<string>(
    REVIEW_OBJECT_COLORS[0],
  );
  const [objectPanelError, setObjectPanelError] = useState<string | null>(null);
  const [manualBoxError, setManualBoxError] = useState<string | null>(null);
  const [objectDeleteError, setObjectDeleteError] = useState<string | null>(
    null,
  );
  const [propagationInputError, setPropagationInputError] = useState<
    string | null
  >(null);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(currentFrameIndex);
  const [maskOpacityPercent, setMaskOpacityPercent] = useState(58);
  const [isMaskRefineActive, setIsMaskRefineActive] = useState(false);
  const [refineBrushMode, setRefineBrushMode] =
    useState<RefineBrushMode>("add");
  const [refinePositivePoints, setRefinePositivePoints] = useState<
    RefineCanvasPoint[]
  >([]);
  const [refineNegativePoints, setRefineNegativePoints] = useState<
    RefineCanvasPoint[]
  >([]);
  const [refineValidationError, setRefineValidationError] = useState<
    string | null
  >(null);
  const [maskCleanupError, setMaskCleanupError] = useState<string | null>(null);
  const [exportRequestStatus, setExportRequestStatus] =
    useState<ExportRequestStatus>("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [latestExportId, setLatestExportId] = useState<string | null>(null);
  const [
    selectedObjectReviewSummaryState,
    setSelectedObjectReviewSummaryState,
  ] = useState<SelectedObjectReviewSummaryState>({
    error: null,
    requestKey: null,
    status: "idle",
    summary: null,
  });
  const exactFrameImageUrl = useObjectUrl(workspace.exactFrame?.blob ?? null);
  const pendingPausedFrameIndexRef = useRef<number | null>(null);
  const skipPauseCommitRef = useRef(false);
  const previewFrameIndexRef = useRef(currentFrameIndex);
  const playbackPreviewAnimationFrameRef = useRef<number | null>(null);
  const playbackPreviewVideoFrameRequestRef = useRef<number | null>(null);
  previewFrameIndexRef.current = previewFrameIndex;
  const selectedObjectId =
    workspace.reviewState.annotation.selectedObjectId ?? "";
  const currentReviewState = selectedVideo?.review_state ?? "not_started";
  const exportDownloadUrl =
    latestExportId === null
      ? null
      : getExportDownloadUrl({
          exportId: latestExportId,
        });
  const sam2DraftBox = workspace.reviewState.sam2.draftBox;
  const savedManualAnnotationsForCurrentFrame =
    workspace.reviewState.annotation.savedManualAnnotationsByFrame[
      currentFrameIndex
    ] ?? {};
  const selectedSavedManualAnnotation =
    selectedObjectId.trim().length === 0
      ? null
      : (savedManualAnnotationsForCurrentFrame[selectedObjectId.trim()] ??
        null);
  const visibleDraftBox =
    sam2DraftBox !== null &&
    matchesSavedManualAnnotationBox(
      sam2DraftBox,
      selectedSavedManualAnnotation?.box_xywh_norm ?? null,
    )
      ? null
      : sam2DraftBox;
  const propagationJob = workspace.reviewState.sam2.propagation.job;
  const propagationStatus = workspace.reviewState.sam2.propagation.status;
  const refineStatus = workspace.reviewState.sam2.refine.status;
  const refineErrorMessage = workspace.reviewState.sam2.refine.errorMessage;
  const propagatedFrameIndices =
    propagationJob?.result?.persistedFrameIndices ?? [];
  const exactFrameReady =
    workspace.exactFrameStatus === "ready" && exactFrameImageUrl !== null;
  const canMutateCurrentFrame =
    selectedVideo !== null && exactFrameReady && !isPlaybackActive;
  const canCancelPropagation = isSam2JobActive(propagationJob?.status ?? null);
  const objectSummaryById = new Map(
    objectSummaries.map((objectSummary) => [objectSummary.id, objectSummary]),
  );
  const sam2Annotations = selectedVideo
    ? mapFrameAnnotationsToCanvasAnnotations({
        annotations: workspace.reviewState.sam2.frameAnnotations,
        frameIdx: currentFrameIndex,
        objectSummaryById,
        selectedObjectId,
        videoId: selectedVideo.id,
      })
    : [];
  const playbackAnnotations = selectedVideo
    ? mapFrameAnnotationsToCanvasAnnotations({
        annotations:
          workspace.annotatedFrameAnnotationsByFrame?.[previewFrameIndex] ?? [],
        frameIdx: previewFrameIndex,
        objectSummaryById,
        selectedObjectId,
        videoId: selectedVideo.id,
      })
    : [];
  const selectedObjectSummary =
    selectedObjectId.trim().length === 0
      ? null
      : (objectSummaries.find(
          (object) => object.id === selectedObjectId.trim(),
        ) ?? null);
  const selectedFrameAnnotation =
    selectedObjectId.trim().length === 0
      ? null
      : (workspace.reviewState.sam2.frameAnnotations.find(
          (annotation) => annotation.object_id === selectedObjectId.trim(),
        ) ?? null);
  const currentFrameBox =
    selectedSavedManualAnnotation?.box_xywh_norm ??
    selectedFrameAnnotation?.box_xywh_norm ??
    null;
  const canStartMaskRefine =
    canMutateCurrentFrame &&
    selectedObjectId.trim().length > 0 &&
    selectedFrameAnnotation !== null &&
    selectedFrameAnnotation.mask !== null;
  const canSaveMaskRefine =
    canStartMaskRefine &&
    refineStatus !== "loading" &&
    refinePositivePoints.length + refineNegativePoints.length > 0;
  const canDeleteFrameMask =
    canMutateCurrentFrame &&
    refineStatus !== "loading" &&
    selectedFrameAnnotation !== null &&
    selectedFrameAnnotation.mask !== null;
  const canDeleteObjectMasks =
    canMutateCurrentFrame &&
    refineStatus !== "loading" &&
    selectedFrameAnnotation !== null &&
    selectedFrameAnnotation.mask !== null;
  const canDeleteObjectTrack =
    canMutateCurrentFrame && selectedObjectId.trim().length > 0;
  const canCreateExport =
    selectedVideo !== null && exportRequestStatus !== "loading";
  const selectedAnnotationRefreshKey = [
    selectedSavedManualAnnotation?.object_id ?? "none",
    selectedSavedManualAnnotation === null
      ? "none"
      : selectedSavedManualAnnotation.box_xywh_norm.join(","),
    selectedFrameAnnotation?.source ?? "none",
    selectedFrameAnnotation?.mask?.path ?? "none",
  ].join(":");
  const selectedRange =
    selectedVideo === null
      ? null
      : resolveSelectedRangeState({
          endFrameValue: propagationEndFrameValue,
          frameCount: selectedVideo.frame_count,
          startFrameValue: propagationRangeStartFrameValue,
        });
  const parsedPropagationSeedFrameIdx =
    selectedVideo === null
      ? null
      : resolvePropagationSeedFrameIndex({
          frameCount: selectedVideo.frame_count,
          seedFrameValue: propagationSeedFrameValue,
        });
  const canStartPropagation =
    canMutateCurrentFrame &&
    selectedRange !== null &&
    parsedPropagationSeedFrameIdx !== null &&
    parsedPropagationSeedFrameIdx >= selectedRange.startFrameIdx &&
    parsedPropagationSeedFrameIdx <= selectedRange.endFrameIdx &&
    workspace.reviewState.sam2.session.sessionId !== null &&
    selectedObjectId.trim().length > 0 &&
    propagationStatus !== "loading" &&
    !isSam2JobActive(propagationJob?.status ?? null);
  const selectedObjectSummaryStartFrameIdx =
    selectedRange?.startFrameIdx ?? null;
  const selectedObjectSummaryEndFrameIdx = selectedRange?.endFrameIdx ?? null;
  const selectedObjectSummaryRequestKey =
    selectedVideo === null ||
    selectedObjectId.trim().length === 0 ||
    selectedObjectSummaryStartFrameIdx === null ||
    selectedObjectSummaryEndFrameIdx === null
      ? null
      : [
          selectedVideo.id,
          selectedObjectId.trim(),
          String(currentFrameIndex),
          String(selectedObjectSummaryStartFrameIdx),
          String(selectedObjectSummaryEndFrameIdx),
        ].join(":");
  const selectedObjectReviewSummary =
    selectedObjectSummaryRequestKey !== null &&
    selectedObjectReviewSummaryState.requestKey ===
      selectedObjectSummaryRequestKey
      ? selectedObjectReviewSummaryState.summary
      : null;
  const selectedObjectReviewSummaryError =
    selectedObjectSummaryRequestKey !== null &&
    selectedObjectReviewSummaryState.requestKey ===
      selectedObjectSummaryRequestKey
      ? selectedObjectReviewSummaryState.error
      : null;
  const selectedObjectReviewSummaryStatus =
    selectedObjectSummaryRequestKey === null
      ? "idle"
      : selectedObjectReviewSummaryState.requestKey ===
          selectedObjectSummaryRequestKey
        ? selectedObjectReviewSummaryState.status
        : "loading";
  const canLoadPreviousFrame =
    selectedVideo !== null &&
    currentFrameIndex > 0 &&
    workspace.exactFrameStatus !== "loading";
  const canLoadNextFrame =
    selectedVideo !== null &&
    currentFrameIndex < selectedVideo.frame_count - 1 &&
    workspace.exactFrameStatus !== "loading";
  const previousAnnotatedFrameIndex = resolvePreviousFrameIndex({
    currentFrameIndex,
    frameIndices: annotatedFrameIndices,
  });
  const nextAnnotatedFrameIndex = resolveNextFrameIndex({
    currentFrameIndex,
    frameIndices: annotatedFrameIndices,
  });
  const previousKeyframeIndex = resolvePreviousFrameIndex({
    currentFrameIndex,
    frameIndices: keyframeIndices,
  });
  const nextKeyframeIndex = resolveNextFrameIndex({
    currentFrameIndex,
    frameIndices: keyframeIndices,
  });

  useEffect(() => {
    setFrameInputValue(String(currentFrameIndex));
    setFrameInputError(null);
  }, [currentFrameIndex, selectedVideo?.id]);

  useEffect(() => {
    setNewObjectLabel("");
    setNewObjectColor(REVIEW_OBJECT_COLORS[0]);
    setObjectPanelError(null);
    setIsPlaybackActive(false);
    setMaskOpacityPercent(58);
  }, [selectedVideo?.id]);

  useEffect(() => {
    setExportRequestStatus("idle");
    setExportError(null);
    setLatestExportId(null);
  }, [selectedVideo?.id]);

  useEffect(() => {
    setManualBoxError(null);
    setMaskCleanupError(null);
    setObjectDeleteError(null);
  }, [currentFrameIndex, selectedObjectId, selectedVideo?.id]);

  useEffect(() => {
    setIsMaskRefineActive(false);
    setRefineBrushMode("add");
    setRefineNegativePoints([]);
    setRefinePositivePoints([]);
    setRefineValidationError(null);
  }, [currentFrameIndex, selectedObjectId, selectedVideo?.id]);

  useEffect(() => {
    if (refineStatus !== "ready") {
      return;
    }

    setIsMaskRefineActive(false);
    setRefineBrushMode("add");
    setRefineNegativePoints([]);
    setRefinePositivePoints([]);
    setRefineValidationError(null);
  }, [refineStatus]);

  useEffect(() => {
    if (selectedVideo === null) {
      setPropagationDirection("both");
      setPropagationRangeStartFrameValue("0");
      setPropagationEndFrameValue("0");
      setPropagationSeedFrameValue("0");
      propagationDirectionRef.current = "both";
      propagationRangeStartFrameValueRef.current = "0";
      propagationEndFrameValueRef.current = "0";
      propagationSeedFrameValueRef.current = "0";
      setPropagationInputError(null);
      setSelectedObjectReviewSummaryState({
        error: null,
        requestKey: null,
        status: "idle",
        summary: null,
      });
      return;
    }

    setPropagationDirection("both");
    setPropagationRangeStartFrameValue("0");
    setPropagationEndFrameValue(String(selectedVideo.frame_count - 1));
    setPropagationSeedFrameValue(
      String(annotatedFrameIndices[0] ?? currentFrameIndexRef.current),
    );
    propagationDirectionRef.current = "both";
    propagationRangeStartFrameValueRef.current = "0";
    propagationEndFrameValueRef.current = String(selectedVideo.frame_count - 1);
    propagationSeedFrameValueRef.current = String(
      annotatedFrameIndices[0] ?? currentFrameIndexRef.current,
    );
    setPropagationInputError(null);
  }, [annotatedFrameIndices, selectedVideo?.frame_count, selectedVideo?.id]);

  useEffect(() => {
    if (isPlaybackActive) {
      return;
    }

    if (pendingPausedFrameIndexRef.current !== null) {
      if (currentFrameIndex !== pendingPausedFrameIndexRef.current) {
        return;
      }

      pendingPausedFrameIndexRef.current = null;
    }

    previewFrameIndexRef.current = currentFrameIndex;
    setPreviewFrameIndex(currentFrameIndex);
  }, [currentFrameIndex, isPlaybackActive]);

  useEffect(() => {
    if (selectedVideo === null) {
      return;
    }

    const nextSelectedRange = resolveSelectedRangeState({
      endFrameValue: propagationEndFrameValue,
      frameCount: selectedVideo.frame_count,
      startFrameValue: propagationRangeStartFrameValue,
    });
    if (nextSelectedRange === null) {
      return;
    }

    const parsedSeedFrameIdx = resolvePropagationSeedFrameIndex({
      frameCount: selectedVideo.frame_count,
      seedFrameValue: propagationSeedFrameValueRef.current,
    });
    if (
      parsedSeedFrameIdx !== null &&
      parsedSeedFrameIdx >= nextSelectedRange.startFrameIdx &&
      parsedSeedFrameIdx <= nextSelectedRange.endFrameIdx
    ) {
      return;
    }

    const nextSeedFrameIdx = resolveDefaultPropagationSeedFrameIndex({
      annotatedFrameIndices,
      currentFrameIndex,
      rangeEndFrameIdx: nextSelectedRange.endFrameIdx,
      rangeStartFrameIdx: nextSelectedRange.startFrameIdx,
    });
    const nextSeedValue = String(nextSeedFrameIdx);
    if (propagationSeedFrameValueRef.current === nextSeedValue) {
      return;
    }

    propagationSeedFrameValueRef.current = nextSeedValue;
    setPropagationSeedFrameValue(nextSeedValue);
    setPropagationInputError(null);
  }, [
    annotatedFrameIndices,
    currentFrameIndex,
    propagationEndFrameValue,
    propagationRangeStartFrameValue,
    selectedVideo,
  ]);

  useEffect(() => {
    const trimmedObjectId = selectedObjectId.trim();
    if (
      selectedVideo === null ||
      trimmedObjectId.length === 0 ||
      selectedObjectSummaryStartFrameIdx === null ||
      selectedObjectSummaryEndFrameIdx === null ||
      selectedObjectSummaryRequestKey === null
    ) {
      setSelectedObjectReviewSummaryState({
        error: null,
        requestKey: null,
        status: "idle",
        summary: null,
      });
      return;
    }

    const requestId = selectedObjectSummaryRequestIdRef.current + 1;
    selectedObjectSummaryRequestIdRef.current = requestId;
    setSelectedObjectReviewSummaryState({
      error: null,
      requestKey: selectedObjectSummaryRequestKey,
      status: "loading",
      summary: null,
    });

    void (async () => {
      try {
        const summary = await getSelectedObjectSummary({
          endFrameIdx: selectedObjectSummaryEndFrameIdx,
          frameIdx: currentFrameIndex,
          objectId: trimmedObjectId,
          startFrameIdx: selectedObjectSummaryStartFrameIdx,
          videoId: selectedVideo.id,
        });
        if (selectedObjectSummaryRequestIdRef.current !== requestId) {
          return;
        }

        setSelectedObjectReviewSummaryState({
          error: null,
          requestKey: selectedObjectSummaryRequestKey,
          status: "ready",
          summary,
        });
      } catch (error: unknown) {
        if (selectedObjectSummaryRequestIdRef.current !== requestId) {
          return;
        }

        setSelectedObjectReviewSummaryState({
          error: formatWorkspaceError(error),
          requestKey: selectedObjectSummaryRequestKey,
          status: "error",
          summary: null,
        });
      }
    })();

    return () => {
      if (selectedObjectSummaryRequestIdRef.current === requestId) {
        selectedObjectSummaryRequestIdRef.current += 1;
      }
    };
  }, [
    currentFrameIndex,
    selectedObjectId,
    selectedAnnotationRefreshKey,
    selectedObjectSummaryEndFrameIdx,
    selectedObjectSummaryRequestKey,
    selectedObjectSummaryStartFrameIdx,
    selectedVideo,
  ]);

  useEffect(() => {
    if (initialVideoId === null || workspace.listStatus !== "ready") {
      return;
    }

    if (initialVideoSelectionRef.current === initialVideoId) {
      return;
    }

    if (!workspace.indexedVideos.some((video) => video.id === initialVideoId)) {
      return;
    }

    initialVideoSelectionRef.current = initialVideoId;
    void workspace.selectVideo(initialVideoId);
  }, [initialVideoId, workspace.indexedVideos, workspace.listStatus]);

  useEffect(() => {
    if (selectedVideo === null || workspace.selectionStatus !== "ready") {
      return;
    }

    const landingFrameIndex = resolveLandingFrameIndex({
      annotatedFrameIndices,
    });
    const landingFrameLoadKey = [
      selectedVideo.id,
      String(landingFrameIndex),
    ].join(":");
    if (landingFrameLoadRef.current === landingFrameLoadKey) {
      return;
    }

    landingFrameLoadRef.current = landingFrameLoadKey;
    setFrameInputValue(String(landingFrameIndex));
    void workspace.loadExactFrame(landingFrameIndex);
  }, [
    annotatedFrameIndices,
    selectedVideo,
    workspace.loadExactFrame,
    workspace.selectionStatus,
  ]);

  useEffect(() => {
    return () => {
      if (playbackPreviewAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(playbackPreviewAnimationFrameRef.current);
      }
      const playbackElement =
        playbackVideoRef.current as PlaybackVideoElement | null;
      if (
        playbackElement !== null &&
        playbackPreviewVideoFrameRequestRef.current !== null &&
        typeof playbackElement.cancelVideoFrameCallback === "function"
      ) {
        playbackElement.cancelVideoFrameCallback(
          playbackPreviewVideoFrameRequestRef.current,
        );
      }
    };
  }, []);

  function cancelPlaybackPreviewSync() {
    if (playbackPreviewAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(playbackPreviewAnimationFrameRef.current);
      playbackPreviewAnimationFrameRef.current = null;
    }

    const playbackElement =
      playbackVideoRef.current as PlaybackVideoElement | null;
    if (
      playbackElement !== null &&
      playbackPreviewVideoFrameRequestRef.current !== null &&
      typeof playbackElement.cancelVideoFrameCallback === "function"
    ) {
      playbackElement.cancelVideoFrameCallback(
        playbackPreviewVideoFrameRequestRef.current,
      );
    }
    playbackPreviewVideoFrameRequestRef.current = null;
  }

  function syncPreviewFrameFromPlayback(
    playbackElement: HTMLVideoElement,
    playbackCurrentTime: number,
  ) {
    if (selectedVideo === null) {
      return;
    }

    const nextPreviewFrameIndex = resolvePlaybackPreviewFrameIndex({
      fps: selectedVideo.fps,
      frameCount: selectedVideo.frame_count,
      playbackCurrentTime,
    });
    previewFrameIndexRef.current = nextPreviewFrameIndex;
    setPreviewFrameIndex(nextPreviewFrameIndex);
  }

  function startPlaybackPreviewSync(playbackElement: HTMLVideoElement) {
    if (selectedVideo === null) {
      return;
    }

    cancelPlaybackPreviewSync();
    const typedPlaybackElement = playbackElement as PlaybackVideoElement;

    if (typeof typedPlaybackElement.requestVideoFrameCallback === "function") {
      const handleFrame = (_now: number, metadata: PlaybackFrameMetadata) => {
        syncPreviewFrameFromPlayback(playbackElement, metadata.mediaTime);
        playbackPreviewVideoFrameRequestRef.current =
          typedPlaybackElement.requestVideoFrameCallback(handleFrame);
      };

      playbackPreviewVideoFrameRequestRef.current =
        typedPlaybackElement.requestVideoFrameCallback(handleFrame);
      return;
    }

    const handleAnimationFrame = () => {
      syncPreviewFrameFromPlayback(
        playbackElement,
        playbackElement.currentTime,
      );
      playbackPreviewAnimationFrameRef.current =
        window.requestAnimationFrame(handleAnimationFrame);
    };
    playbackPreviewAnimationFrameRef.current =
      window.requestAnimationFrame(handleAnimationFrame);
  }

  function pausePlaybackContext(options?: { skipCommit?: boolean }) {
    if (!isPlaybackActive) {
      return;
    }

    skipPauseCommitRef.current = options?.skipCommit ?? false;
    cancelPlaybackPreviewSync();
    setIsPlaybackActive(false);

    if (playbackVideoRef.current === null) {
      return;
    }

    try {
      playbackVideoRef.current.pause();
    } catch {
      // jsdom does not implement media playback; keep state authoritative.
    }
  }

  function loadFrame(frameIdx: number) {
    setFrameInputError(null);
    setFrameInputValue(String(frameIdx));
    previewFrameIndexRef.current = frameIdx;
    setPreviewFrameIndex(frameIdx);
    pausePlaybackContext({
      skipCommit: true,
    });
    void workspace.loadExactFrame(frameIdx);
  }

  function handleCreateExport() {
    if (selectedVideo === null) {
      setExportRequestStatus("error");
      setExportError("Select a video before exporting review output.");
      return;
    }

    setExportRequestStatus("loading");
    setExportError(null);
    void createVideoExport({
      videoId: selectedVideo.id,
    })
      .then(async (response) => {
        setLatestExportId(response.export_id);
        triggerExportDownload(
          getExportDownloadUrl({
            exportId: response.export_id,
          }),
        );
        await workspace.refreshSelectedVideo(selectedVideo.id);
        setExportRequestStatus("ready");
      })
      .catch((error: unknown) => {
        setExportRequestStatus("error");
        setExportError(formatWorkspaceError(error));
      });
  }

  function handleFrameSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedVideo === null) {
      setFrameInputError("Select a video before loading exact frames.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const parsedFrameIdx = Number(
      typeof formData.get("frame-number") === "string"
        ? formData.get("frame-number")
        : frameInputValue,
    );
    if (
      !Number.isInteger(parsedFrameIdx) ||
      parsedFrameIdx < 0 ||
      parsedFrameIdx >= selectedVideo.frame_count
    ) {
      setFrameInputError(
        `Enter frame 0-${String(selectedVideo.frame_count - 1)}.`,
      );
      return;
    }

    loadFrame(parsedFrameIdx);
  }

  function handleFrameStep(delta: -1 | 1) {
    if (selectedVideo === null) {
      return;
    }

    const nextFrameIdx = clampFrameIndex({
      frameCount: selectedVideo.frame_count,
      frameIdx: currentFrameIndex + delta,
    });

    if (nextFrameIdx === currentFrameIndex) {
      return;
    }

    loadFrame(nextFrameIdx);
  }

  function handleFrameJump(frameIdx: number | null) {
    if (frameIdx === null) {
      return;
    }

    loadFrame(frameIdx);
  }

  async function handleCreateObject(colorOverride?: string) {
    if (selectedVideo === null) {
      setObjectPanelError("Select a video before creating objects.");
      return;
    }

    const trimmedLabel = newObjectLabel.trim();
    if (trimmedLabel.length === 0) {
      setObjectPanelError("Enter object label before creating object.");
      return;
    }

    setObjectPanelError(null);
    await workspace.createObject(trimmedLabel, colorOverride ?? newObjectColor);
    setNewObjectLabel("");
    setNewObjectColor(REVIEW_OBJECT_COLORS[0]);
    await workspace.refreshSelectedVideo(selectedVideo.id);
  }

  function handleRunSam2() {
    if (
      selectedVideo === null ||
      sam2DraftBox === null ||
      selectedObjectId.trim().length === 0
    ) {
      return;
    }

    void workspace.runSam2PromptBox({
      boxXyxyPx: draftBoxToPixelBox({
        draftBox: sam2DraftBox,
        videoHeight: selectedVideo.height,
        videoWidth: selectedVideo.width,
      }),
      frameIdx: currentFrameIndex,
      objectId: selectedObjectId.trim(),
    });
  }

  function handleManualBoxCommit(box: {
    x: number;
    y: number;
    w: number;
    h: number;
  }) {
    if (selectedVideo === null) {
      return;
    }

    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setManualBoxError("Select object before drawing manual box.");
      return;
    }

    setManualBoxError(null);
    const selectedVideoId = selectedVideo.id;
    const boxXywhNorm = normalizeDraftBoxTuple(box);
    void workspace
      .saveManualAnnotation({
        boxXywhNorm,
        frameIdx: currentFrameIndex,
        objectId: trimmedObjectId,
      })
      .then(async () => {
        setLatestExportId(null);
        setExportRequestStatus("idle");
        setExportError(null);
        await workspace.refreshSelectedVideo(selectedVideoId);
      })
      .catch((error: unknown) => {
        setManualBoxError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Manual box save failed.",
        );
      });
  }

  function handleDeleteManualBox() {
    if (selectedVideo === null) {
      return;
    }

    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setManualBoxError("Select object before deleting manual box.");
      return;
    }

    setManualBoxError(null);
    const selectedVideoId = selectedVideo.id;
    void workspace
      .deleteManualAnnotation({
        frameIdx: currentFrameIndex,
        objectId: trimmedObjectId,
      })
      .then(async () => {
        setLatestExportId(null);
        setExportRequestStatus("idle");
        setExportError(null);
        await workspace.refreshSelectedVideo(selectedVideoId);
      })
      .catch((error: unknown) => {
        setManualBoxError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Manual box delete failed.",
        );
      });
  }

  function handleMaskRefineToggle() {
    if (isMaskRefineActive) {
      setIsMaskRefineActive(false);
      setRefineNegativePoints([]);
      setRefinePositivePoints([]);
      setRefineValidationError(null);
      return;
    }

    if (!canStartMaskRefine) {
      setRefineValidationError(
        "Pause playback on saved mask frame before correcting mask.",
      );
      return;
    }

    setIsMaskRefineActive(true);
    setRefineValidationError(null);
  }

  function handleDeleteFrameMask() {
    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setMaskCleanupError("Select object before clearing frame mask.");
      return;
    }

    if (!canDeleteFrameMask) {
      setMaskCleanupError(
        "Pause playback on saved mask frame before clearing mask.",
      );
      return;
    }

    setMaskCleanupError(null);
    void workspace
      .deleteFrameAnnotationMask({
        frameIdx: currentFrameIndex,
        objectId: trimmedObjectId,
      })
      .then(async () => {
        setLatestExportId(null);
        setExportRequestStatus("idle");
        setExportError(null);
        await workspace.refreshSelectedVideo(selectedVideo.id);
      })
      .catch((error: unknown) => {
        setMaskCleanupError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Frame mask cleanup failed.",
        );
      });
  }

  function handleDeleteObjectMasks() {
    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setMaskCleanupError("Select object before clearing object masks.");
      return;
    }

    if (!canDeleteObjectMasks) {
      setMaskCleanupError(
        "Pause playback on saved mask frame before clearing object masks.",
      );
      return;
    }

    setMaskCleanupError(null);
    void workspace
      .deleteObjectMasks({
        objectId: trimmedObjectId,
      })
      .then(async () => {
        setLatestExportId(null);
        setExportRequestStatus("idle");
        setExportError(null);
        await workspace.refreshSelectedVideo(selectedVideo.id);
        return workspace.loadExactFrame(currentFrameIndex);
      })
      .catch((error: unknown) => {
        setMaskCleanupError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Object mask cleanup failed.",
        );
      });
  }

  function handleDeleteObjectTrack() {
    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setObjectDeleteError("Select object before deleting object track.");
      return;
    }

    if (!canDeleteObjectTrack) {
      setObjectDeleteError("Pause playback before deleting object track.");
      return;
    }

    setObjectDeleteError(null);
    void workspace
      .deleteObjectTrack({
        objectId: trimmedObjectId,
      })
      .then(async () => {
        setLatestExportId(null);
        setExportRequestStatus("idle");
        setExportError(null);
        await workspace.refreshSelectedVideo(selectedVideo.id);
        return workspace.loadExactFrame(currentFrameIndex);
      })
      .catch((error: unknown) => {
        setObjectDeleteError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Object track delete failed.",
        );
      });
  }

  function handleRefineBrushModeChange(nextMode: RefineBrushMode) {
    setIsMaskRefineActive(true);
    setRefineBrushMode(nextMode);
    setRefineValidationError(null);
  }

  function handleClearRefinePoints() {
    setRefineNegativePoints([]);
    setRefinePositivePoints([]);
    setRefineValidationError(null);
  }

  function handleRefineStrokeCommit(points: readonly RefineCanvasPoint[]) {
    if (!isMaskRefineActive || points.length === 0) {
      return;
    }

    setRefineValidationError(null);
    if (refineBrushMode === "erase") {
      setRefineNegativePoints((currentPoints) => [...currentPoints, ...points]);
      return;
    }

    setRefinePositivePoints((currentPoints) => [...currentPoints, ...points]);
  }

  function handleSaveRefinedMask() {
    const trimmedObjectId = selectedObjectId.trim();
    if (selectedVideo === null) {
      return;
    }

    if (!canStartMaskRefine) {
      setRefineValidationError(
        "Pause playback on saved mask frame before correcting mask.",
      );
      return;
    }

    if (trimmedObjectId.length === 0) {
      setRefineValidationError("Select object before correcting mask.");
      return;
    }

    if (refinePositivePoints.length + refineNegativePoints.length === 0) {
      setRefineValidationError("Add brush or erase stroke before saving.");
      return;
    }

    setRefineValidationError(null);
    void workspace
      .runSam2RefineMask({
        frameIdx: currentFrameIndex,
        negativePoints: refineNegativePoints.map((point) =>
          refineCanvasPointToPixelPoint({
            point,
            videoHeight: selectedVideo.height,
            videoWidth: selectedVideo.width,
          }),
        ),
        objectId: trimmedObjectId,
        positivePoints: refinePositivePoints.map((point) =>
          refineCanvasPointToPixelPoint({
            point,
            videoHeight: selectedVideo.height,
            videoWidth: selectedVideo.width,
          }),
        ),
      })
      .then(async () => {
        setLatestExportId(null);
        setExportRequestStatus("idle");
        setExportError(null);
        await workspace.refreshSelectedVideo(selectedVideo.id);
      });
  }

  function handleStartPropagation() {
    if (selectedVideo === null) {
      setPropagationInputError("Select a video before starting propagation.");
      return;
    }

    const nextSelectedRange = resolveSelectedRangeState({
      endFrameValue: propagationEndFrameValueRef.current,
      frameCount: selectedVideo.frame_count,
      startFrameValue: propagationRangeStartFrameValueRef.current,
    });
    const nextSeedFrameIdx = resolvePropagationSeedFrameIndex({
      frameCount: selectedVideo.frame_count,
      seedFrameValue: propagationSeedFrameValueRef.current,
    });

    if (nextSelectedRange === null) {
      setPropagationInputError(
        `Enter valid range 0-${String(selectedVideo.frame_count - 1)}.`,
      );
      return;
    }

    if (
      nextSeedFrameIdx === null ||
      nextSeedFrameIdx < nextSelectedRange.startFrameIdx ||
      nextSeedFrameIdx > nextSelectedRange.endFrameIdx
    ) {
      setPropagationInputError("Seed frame must stay inside selected range.");
      return;
    }

    setPropagationInputError(null);
    void workspace.startSam2Propagation({
      direction: propagationDirectionRef.current,
      objectIds: [selectedObjectId.trim()],
      rangeEndFrameIdx: nextSelectedRange.endFrameIdx,
      rangeStartFrameIdx: nextSelectedRange.startFrameIdx,
      seedFrameIdx: nextSeedFrameIdx,
    });
  }

  function handlePropagationDirectionChange(
    nextDirection: Sam2PropagationDirection,
  ) {
    propagationDirectionRef.current = nextDirection;
    setPropagationDirection(nextDirection);
    setPropagationInputError(null);
  }

  function syncPropagationSeedFrameValue(
    nextStartFrameValue: string,
    nextEndFrameValue: string,
  ) {
    if (selectedVideo === null) {
      return;
    }

    const nextSelectedRange = resolveSelectedRangeState({
      endFrameValue: nextEndFrameValue,
      frameCount: selectedVideo.frame_count,
      startFrameValue: nextStartFrameValue,
    });
    if (nextSelectedRange === null) {
      return;
    }

    const parsedSeedFrameIdx = resolvePropagationSeedFrameIndex({
      frameCount: selectedVideo.frame_count,
      seedFrameValue: propagationSeedFrameValueRef.current,
    });
    if (
      parsedSeedFrameIdx !== null &&
      parsedSeedFrameIdx >= nextSelectedRange.startFrameIdx &&
      parsedSeedFrameIdx <= nextSelectedRange.endFrameIdx
    ) {
      return;
    }

    const nextSeedFrameIdx = resolveDefaultPropagationSeedFrameIndex({
      annotatedFrameIndices,
      currentFrameIndex,
      rangeEndFrameIdx: nextSelectedRange.endFrameIdx,
      rangeStartFrameIdx: nextSelectedRange.startFrameIdx,
    });
    const nextSeedValue = String(nextSeedFrameIdx);
    if (propagationSeedFrameValueRef.current === nextSeedValue) {
      return;
    }

    propagationSeedFrameValueRef.current = nextSeedValue;
    setPropagationSeedFrameValue(nextSeedValue);
  }

  function handlePropagationStartFrameValueChange(nextValue: string) {
    propagationRangeStartFrameValueRef.current = nextValue;
    setPropagationRangeStartFrameValue(nextValue);
    syncPropagationSeedFrameValue(
      nextValue,
      propagationEndFrameValueRef.current,
    );
    setPropagationInputError(null);
  }

  function handlePropagationEndFrameValueChange(nextValue: string) {
    propagationEndFrameValueRef.current = nextValue;
    setPropagationEndFrameValue(nextValue);
    syncPropagationSeedFrameValue(
      propagationRangeStartFrameValueRef.current,
      nextValue,
    );
    setPropagationInputError(null);
  }

  function handlePropagationSeedFrameValueChange(nextValue: string) {
    propagationSeedFrameValueRef.current = nextValue;
    setPropagationSeedFrameValue(nextValue);
    setPropagationInputError(null);
  }

  function handlePlaybackToggle() {
    if (playbackVideoRef.current === null) {
      return;
    }

    if (isPlaybackActive) {
      pausePlaybackContext();
      return;
    }

    setIsPlaybackActive(true);
    if (selectedVideo !== null) {
      playbackVideoRef.current.currentTime =
        previewFrameIndexRef.current / selectedVideo.fps;
      setPreviewFrameIndex(previewFrameIndexRef.current);
    }

    try {
      void playbackVideoRef.current.play();
    } catch {
      // jsdom does not implement media playback; keep state authoritative.
    }
  }

  function resolvePlaybackEventVideoElement(
    event?: SyntheticEvent<HTMLVideoElement>,
  ): HTMLVideoElement | null {
    return event?.currentTarget ?? playbackVideoRef.current;
  }

  function handlePlaybackLoadedMetadata(
    event?: SyntheticEvent<HTMLVideoElement>,
  ) {
    const playbackElement = resolvePlaybackEventVideoElement(event);
    if (playbackElement === null || selectedVideo === null) {
      return;
    }

    playbackElement.currentTime =
      previewFrameIndexRef.current / selectedVideo.fps;
    setPreviewFrameIndex(previewFrameIndexRef.current);
  }

  function handlePlaybackPlay(event?: SyntheticEvent<HTMLVideoElement>) {
    setIsPlaybackActive(true);
    const playbackElement = resolvePlaybackEventVideoElement(event);
    if (playbackElement === null || selectedVideo === null) {
      return;
    }

    if (playbackElement.currentTime === 0 && previewFrameIndexRef.current > 0) {
      playbackElement.currentTime =
        previewFrameIndexRef.current / selectedVideo.fps;
    }

    setPreviewFrameIndex(
      resolvePlaybackPreviewFrameIndex({
        fps: selectedVideo.fps,
        frameCount: selectedVideo.frame_count,
        playbackCurrentTime: playbackElement.currentTime,
      }),
    );
    startPlaybackPreviewSync(playbackElement);
  }

  function handlePlaybackTimeUpdate(event?: SyntheticEvent<HTMLVideoElement>) {
    const playbackElement = resolvePlaybackEventVideoElement(event);
    if (playbackElement === null || selectedVideo === null) {
      return;
    }

    setPreviewFrameIndex(
      resolvePlaybackPreviewFrameIndex({
        fps: selectedVideo.fps,
        frameCount: selectedVideo.frame_count,
        playbackCurrentTime: playbackElement.currentTime,
      }),
    );
  }

  function handlePlaybackPause(event?: SyntheticEvent<HTMLVideoElement>) {
    const wasPlaybackActive = isPlaybackActive;
    cancelPlaybackPreviewSync();
    setIsPlaybackActive(false);

    if (skipPauseCommitRef.current) {
      skipPauseCommitRef.current = false;
      return;
    }

    if (!wasPlaybackActive) {
      return;
    }

    const playbackElement = resolvePlaybackEventVideoElement(event);
    if (selectedVideo === null) {
      return;
    }

    const pausedFrameIdx =
      playbackElement === null
        ? previewFrameIndex
        : resolvePlaybackPreviewFrameIndex({
            fps: selectedVideo.fps,
            frameCount: selectedVideo.frame_count,
            playbackCurrentTime: playbackElement.currentTime,
          });
    pendingPausedFrameIndexRef.current = pausedFrameIdx;
    previewFrameIndexRef.current = pausedFrameIdx;
    setPreviewFrameIndex(pausedFrameIdx);
    setFrameInputError(null);
    setFrameInputValue(String(pausedFrameIdx));
    if (pausedFrameIdx === currentFrameIndex && exactFrameReady) {
      pendingPausedFrameIndexRef.current = null;
      return;
    }

    void workspace.loadExactFrame(pausedFrameIdx);
  }

  useEffect(() => {
    function handleWindowKeyDown(event: KeyboardEvent) {
      if (
        selectedVideo === null ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isInteractiveKeyboardTarget(event.target)
      ) {
        return;
      }

      if (
        event.code === "Space" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        handlePlaybackToggle();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleFrameStep(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleFrameStep(1);
        return;
      }

      if (event.key.toLowerCase() === "g") {
        event.preventDefault();
        frameInputRef.current?.focus();
        frameInputRef.current?.select();
        return;
      }

      if (event.key.toLowerCase() === "m" && canStartMaskRefine) {
        event.preventDefault();
        handleRefineBrushModeChange("add");
        return;
      }

      if (event.key.toLowerCase() === "e" && canStartMaskRefine) {
        event.preventDefault();
        handleRefineBrushModeChange("erase");
        return;
      }

      if (
        event.key === "Delete" &&
        canMutateCurrentFrame &&
        selectedSavedManualAnnotation !== null
      ) {
        event.preventDefault();
        handleDeleteManualBox();
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [
    canMutateCurrentFrame,
    canStartMaskRefine,
    selectedSavedManualAnnotation,
    selectedVideo,
  ]);

  return {
    annotatedFrameIndices,
    canCancelPropagation,
    canDeleteFrameMask,
    canDeleteObjectMasks,
    canDeleteObjectTrack,
    canCreateExport,
    canLoadNextFrame,
    canLoadPreviousFrame,
    canMutateCurrentFrame,
    canSaveMaskRefine,
    canStartMaskRefine,
    canStartPropagation,
    currentFrameBox,
    currentFrameIndex,
    exactFrameImageUrl,
    exactFrameReady,
    exportDownloadUrl,
    exportError,
    exportRequestStatus,
    frameInputError,
    frameInputRef,
    frameInputValue,
    handleCreateObject,
    handleDeleteFrameMask,
    handleDeleteObjectMasks,
    handleDeleteObjectTrack,
    handleDeleteManualBox,
    handleFrameJump,
    handleFrameStep,
    handleFrameSubmit,
    handleClearRefinePoints,
    handleCreateExport,
    handleManualBoxCommit,
    handleMaskRefineToggle,
    handlePlaybackLoadedMetadata,
    handlePlaybackPause,
    handlePlaybackPlay,
    handlePlaybackTimeUpdate,
    handlePlaybackToggle,
    handleRefineBrushModeChange,
    handleRefineStrokeCommit,
    handleRunSam2,
    handleSaveRefinedMask,
    handleStartPropagation,
    isPlaybackActive,
    isMaskRefineActive,
    manualBoxError,
    objectDeleteError,
    maskCleanupError,
    maskOpacityPercent,
    currentReviewState,
    newObjectColor,
    newObjectLabel,
    objectPanelError,
    objectColorOptions: REVIEW_OBJECT_COLORS,
    objectSummaries,
    pausePlaybackContext,
    playbackSource,
    playbackVideoRef,
    previewFrameIndex,
    previousAnnotatedFrameIndex,
    previousKeyframeIndex,
    propagatedFrameIndices,
    propagationDirection,
    propagationEndFrameValue,
    propagationInputError,
    propagationJob,
    propagationRangeStartFrameValue,
    propagationSeedFrameValue,
    propagationStatus,
    playbackAnnotations,
    refineBrushMode,
    refineErrorMessage,
    refineNegativePoints,
    refinePositivePoints,
    refineStatus,
    refineValidationError,
    sam2Annotations,
    sam2DraftBox,
    keyframeIndices,
    selectedFrameAnnotation,
    selectedObjectId,
    selectedObjectSummary,
    selectedObjectReviewSummary,
    selectedObjectReviewSummaryError,
    selectedObjectReviewSummaryStatus,
    selectedRange,
    selectedSavedManualAnnotation,
    selectedVideo,
    setFrameInputValue,
    setIsPlaybackActive,
    setMaskOpacityPercent,
    setNewObjectColor,
    setNewObjectLabel,
    setPropagationDirection: handlePropagationDirectionChange,
    setPropagationEndFrameValue: handlePropagationEndFrameValueChange,
    setPropagationRangeStartFrameValue: handlePropagationStartFrameValueChange,
    setPropagationSeedFrameValue: handlePropagationSeedFrameValueChange,
    visibleDraftBox,
    nextAnnotatedFrameIndex,
    nextKeyframeIndex,
  };
}

function mapFrameAnnotationsToCanvasAnnotations(options: {
  annotations: readonly {
    box_xywh_norm: [number, number, number, number] | null;
    mask: { path: string } | null;
    object_id: string;
  }[];
  frameIdx: number;
  objectSummaryById: Map<string, { color: string }>;
  selectedObjectId: string;
  videoId: string;
}) {
  return options.annotations.map((annotation) => ({
    box:
      annotation.box_xywh_norm === null
        ? null
        : {
            h: annotation.box_xywh_norm[3],
            w: annotation.box_xywh_norm[2],
            x: annotation.box_xywh_norm[0],
            y: annotation.box_xywh_norm[1],
          },
    color:
      options.objectSummaryById.get(annotation.object_id)?.color ??
      REVIEW_OBJECT_COLORS[0],
    isSelected: annotation.object_id === options.selectedObjectId,
    maskUrl:
      annotation.mask === null
        ? null
        : getFrameAnnotationMaskUrl({
            frameIdx: options.frameIdx,
            objectId: annotation.object_id,
            videoId: options.videoId,
          }),
    objectId: annotation.object_id,
  }));
}

function triggerExportDownload(downloadUrl: string) {
  const anchorElement = document.createElement("a");
  anchorElement.href = downloadUrl;
  anchorElement.download = "";
  anchorElement.rel = "noreferrer";
  anchorElement.style.display = "none";
  document.body.append(anchorElement);
  anchorElement.click();
  anchorElement.remove();
}

function clampFrameIndex(options: {
  frameIdx: number;
  frameCount: number;
}): number {
  return Math.min(Math.max(options.frameIdx, 0), options.frameCount - 1);
}

function resolveSelectedRangeState(options: {
  endFrameValue: string;
  frameCount: number;
  startFrameValue: string;
}): SelectedRangeState | null {
  const parsedStartFrameIdx = Number(options.startFrameValue);
  const parsedEndFrameIdx = Number(options.endFrameValue);
  if (
    !Number.isInteger(parsedStartFrameIdx) ||
    !Number.isInteger(parsedEndFrameIdx) ||
    parsedStartFrameIdx < 0 ||
    parsedEndFrameIdx < 0 ||
    parsedStartFrameIdx >= options.frameCount ||
    parsedEndFrameIdx >= options.frameCount ||
    parsedStartFrameIdx > parsedEndFrameIdx
  ) {
    return null;
  }

  return {
    endFrameIdx: parsedEndFrameIdx,
    startFrameIdx: parsedStartFrameIdx,
  };
}

function resolvePropagationSeedFrameIndex(options: {
  frameCount: number;
  seedFrameValue: string;
}): number | null {
  const parsedSeedFrameIdx = Number(options.seedFrameValue);
  if (
    !Number.isInteger(parsedSeedFrameIdx) ||
    parsedSeedFrameIdx < 0 ||
    parsedSeedFrameIdx >= options.frameCount
  ) {
    return null;
  }

  return parsedSeedFrameIdx;
}

function resolveDefaultPropagationSeedFrameIndex(options: {
  annotatedFrameIndices: readonly number[];
  currentFrameIndex: number;
  rangeEndFrameIdx: number;
  rangeStartFrameIdx: number;
}): number {
  for (const frameIdx of options.annotatedFrameIndices) {
    if (
      frameIdx >= options.rangeStartFrameIdx &&
      frameIdx <= options.rangeEndFrameIdx
    ) {
      return frameIdx;
    }
  }

  if (
    options.currentFrameIndex >= options.rangeStartFrameIdx &&
    options.currentFrameIndex <= options.rangeEndFrameIdx
  ) {
    return options.currentFrameIndex;
  }

  return options.rangeStartFrameIdx;
}

function resolvePlaybackPreviewFrameIndex(options: {
  fps: number;
  frameCount: number;
  playbackCurrentTime: number;
}): number {
  return clampFrameIndex({
    frameCount: options.frameCount,
    frameIdx: Math.round(options.playbackCurrentTime * options.fps),
  });
}

function draftBoxToPixelBox(options: {
  draftBox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  videoWidth: number;
  videoHeight: number;
}): [number, number, number, number] {
  const x1 = Math.floor(options.draftBox.x * options.videoWidth);
  const y1 = Math.floor(options.draftBox.y * options.videoHeight);
  const x2 = Math.ceil(
    (options.draftBox.x + options.draftBox.w) * options.videoWidth,
  );
  const y2 = Math.ceil(
    (options.draftBox.y + options.draftBox.h) * options.videoHeight,
  );

  return [x1, y1, x2, y2];
}

function matchesSavedManualAnnotationBox(
  draftBox: {
    x: number;
    y: number;
    w: number;
    h: number;
  },
  savedBox: readonly [number, number, number, number] | null,
): boolean {
  if (savedBox === null) {
    return false;
  }

  const normalizedDraftBox = normalizeDraftBoxTuple(draftBox);
  return (
    normalizedDraftBox[0] === savedBox[0] &&
    normalizedDraftBox[1] === savedBox[1] &&
    normalizedDraftBox[2] === savedBox[2] &&
    normalizedDraftBox[3] === savedBox[3]
  );
}

function normalizeDraftBoxTuple(box: {
  x: number;
  y: number;
  w: number;
  h: number;
}): [number, number, number, number] {
  return [
    roundNormalizedBoxCoordinate(box.x),
    roundNormalizedBoxCoordinate(box.y),
    roundNormalizedBoxCoordinate(box.w),
    roundNormalizedBoxCoordinate(box.h),
  ];
}

function refineCanvasPointToPixelPoint(options: {
  point: RefineCanvasPoint;
  videoWidth: number;
  videoHeight: number;
}): [number, number] {
  return [
    Math.round(options.point.x * options.videoWidth),
    Math.round(options.point.y * options.videoHeight),
  ];
}

function roundNormalizedBoxCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function useObjectUrl(blob: Blob | null): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob === null) {
      setObjectUrl(null);
      return;
    }

    const nextObjectUrl = URL.createObjectURL(blob);
    setObjectUrl(nextObjectUrl);

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [blob]);

  return objectUrl;
}

function isSam2JobActive(status: string | null): boolean {
  return status === "queued" || status === "running" || status === "cancelling";
}

function resolveLandingFrameIndex(options: {
  annotatedFrameIndices: readonly number[];
}): number {
  return options.annotatedFrameIndices[0] ?? 0;
}

function resolvePreviousFrameIndex(options: {
  currentFrameIndex: number;
  frameIndices: readonly number[];
}): number | null {
  for (let index = options.frameIndices.length - 1; index >= 0; index -= 1) {
    const frameIndex = options.frameIndices[index];
    if (frameIndex < options.currentFrameIndex) {
      return frameIndex;
    }
  }

  return null;
}

function resolveNextFrameIndex(options: {
  currentFrameIndex: number;
  frameIndices: readonly number[];
}): number | null {
  for (const frameIndex of options.frameIndices) {
    if (frameIndex > options.currentFrameIndex) {
      return frameIndex;
    }
  }

  return null;
}

function isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  );
}
