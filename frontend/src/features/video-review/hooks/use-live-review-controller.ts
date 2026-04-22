import { useEffect, useRef, useState, type SyntheticEvent } from "react";

import {
  getFrameAnnotationMaskUrl,
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
  boundaryFrameIdx: number;
  startFrameIdx: number;
  endFrameIdx: number;
};

export function useLiveReviewController({
  initialVideoId,
  workspace,
}: {
  initialVideoId: string | null;
  workspace: VideoReviewWorkspace;
}) {
  const initialVideoSelectionRef = useRef<string | null>(null);
  const landingFrameLoadRef = useRef<string | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const frameInputRef = useRef<HTMLInputElement | null>(null);
  const selectedObjectSummaryRequestIdRef = useRef(0);
  const selectedVideo = workspace.reviewState.selectedVideo;
  const currentFrameIndex = workspace.reviewState.currentFrameIndex;
  const objectSummaries = workspace.reviewState.annotation.objectSummaries;
  const annotatedFrameIndices =
    workspace.reviewState.annotation.annotatedFrameIndices;
  const keyframeIndices = workspace.reviewState.annotation.keyframeIndices;
  const playbackSource =
    selectedVideo === null
      ? null
      : getIndexedVideoPlaybackUrl({ videoId: selectedVideo.id });
  const [frameInputValue, setFrameInputValue] = useState("0");
  const [frameInputError, setFrameInputError] = useState<string | null>(null);
  const [propagationDirection, setPropagationDirection] =
    useState<Sam2PropagationDirection>("forward");
  const [propagationEndFrameValue, setPropagationEndFrameValue] = useState("0");
  const [newObjectLabel, setNewObjectLabel] = useState("");
  const [objectPanelError, setObjectPanelError] = useState<string | null>(null);
  const [manualBoxError, setManualBoxError] = useState<string | null>(null);
  const [propagationInputError, setPropagationInputError] = useState<
    string | null
  >(null);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [maskOpacityPercent, setMaskOpacityPercent] = useState(58);
  const [selectedRange, setSelectedRange] = useState<SelectedRangeState | null>(
    null,
  );
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
  const selectedObjectId =
    workspace.reviewState.annotation.selectedObjectId ?? "";
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
  const propagatedFrameIndices =
    propagationJob?.result?.persistedFrameIndices ?? [];
  const exactFrameReady =
    workspace.exactFrameStatus === "ready" && exactFrameImageUrl !== null;
  const canMutateCurrentFrame =
    selectedVideo !== null && exactFrameReady && !isPlaybackActive;
  const canStartPropagation =
    canMutateCurrentFrame &&
    workspace.reviewState.sam2.session.sessionId !== null &&
    selectedObjectId.trim().length > 0 &&
    propagationStatus !== "loading" &&
    !isSam2JobActive(propagationJob?.status ?? null);
  const canCancelPropagation = isSam2JobActive(propagationJob?.status ?? null);
  const sam2Annotations = selectedVideo
    ? workspace.reviewState.sam2.frameAnnotations.map((annotation) => ({
        box:
          annotation.box_xywh_norm === null
            ? null
            : {
                h: annotation.box_xywh_norm[3],
                w: annotation.box_xywh_norm[2],
                x: annotation.box_xywh_norm[0],
                y: annotation.box_xywh_norm[1],
              },
        isSelected: annotation.object_id === selectedObjectId,
        maskUrl:
          annotation.mask === null
            ? null
            : getFrameAnnotationMaskUrl({
                frameIdx: currentFrameIndex,
                objectId: annotation.object_id,
                videoId: selectedVideo.id,
              }),
        objectId: annotation.object_id,
      }))
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
    setObjectPanelError(null);
    setIsPlaybackActive(false);
    setMaskOpacityPercent(58);
  }, [selectedVideo?.id]);

  useEffect(() => {
    setManualBoxError(null);
  }, [currentFrameIndex, selectedObjectId, selectedVideo?.id]);

  useEffect(() => {
    if (selectedVideo === null) {
      setSelectedRange(null);
      return;
    }

    setSelectedRange(
      resolveSelectedRangeState({
        boundaryFrameValue: propagationEndFrameValue,
        currentFrameIndex,
        direction: propagationDirection,
        frameCount: selectedVideo.frame_count,
      }),
    );
  }, [
    currentFrameIndex,
    propagationDirection,
    propagationEndFrameValue,
    selectedVideo?.frame_count,
    selectedVideo?.id,
  ]);

  useEffect(() => {
    if (selectedVideo === null) {
      setPropagationEndFrameValue("0");
      setPropagationInputError(null);
      setSelectedRange(null);
      setSelectedObjectReviewSummaryState({
        error: null,
        requestKey: null,
        status: "idle",
        summary: null,
      });
      return;
    }

    setPropagationEndFrameValue(
      String(
        defaultPropagationEndFrame({
          direction: propagationDirection,
          frameCount: selectedVideo.frame_count,
        }),
      ),
    );
    setPropagationInputError(null);
  }, [propagationDirection, selectedVideo?.frame_count, selectedVideo?.id]);

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

    if (landingFrameLoadRef.current === selectedVideo.id) {
      return;
    }

    landingFrameLoadRef.current = selectedVideo.id;
    const landingFrameIndex = resolveLandingFrameIndex({
      annotatedFrameIndices,
    });
    setFrameInputValue(String(landingFrameIndex));
    void workspace.loadExactFrame(landingFrameIndex);
  }, [
    annotatedFrameIndices,
    selectedVideo,
    workspace.loadExactFrame,
    workspace.selectionStatus,
  ]);

  function pausePlaybackContext() {
    if (!isPlaybackActive) {
      return;
    }

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
    pausePlaybackContext();
    void workspace.loadExactFrame(frameIdx);
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

  async function handleCreateObject() {
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
    await workspace.createObject(trimmedLabel);
    setNewObjectLabel("");
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
    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setManualBoxError("Select object before drawing manual box.");
      return;
    }

    setManualBoxError(null);
    const boxXywhNorm = normalizeDraftBoxTuple(box);
    void workspace
      .saveManualAnnotation({
        boxXywhNorm,
        frameIdx: currentFrameIndex,
        objectId: trimmedObjectId,
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
    const trimmedObjectId = selectedObjectId.trim();
    if (trimmedObjectId.length === 0) {
      setManualBoxError("Select object before deleting manual box.");
      return;
    }

    setManualBoxError(null);
    void workspace
      .deleteManualAnnotation({
        frameIdx: currentFrameIndex,
        objectId: trimmedObjectId,
      })
      .catch((error: unknown) => {
        setManualBoxError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Manual box delete failed.",
        );
      });
  }

  function handleStartPropagation() {
    if (selectedVideo === null) {
      setPropagationInputError("Select a video before starting propagation.");
      return;
    }

    if (selectedRange === null) {
      setPropagationInputError(
        `Enter frame 0-${String(selectedVideo.frame_count - 1)}.`,
      );
      return;
    }

    setPropagationInputError(null);
    void workspace.startSam2Propagation({
      direction: propagationDirection,
      endFrameIdx: selectedRange.boundaryFrameIdx,
      objectIds: [selectedObjectId.trim()],
      startFrameIdx: currentFrameIndex,
    });
  }

  function handlePropagationDirectionChange(
    nextDirection: Sam2PropagationDirection,
  ) {
    setPropagationDirection(nextDirection);
    if (selectedVideo === null) {
      setPropagationEndFrameValue("0");
      setSelectedRange(null);
      return;
    }

    const nextBoundaryValue = String(
      defaultPropagationEndFrame({
        direction: nextDirection,
        frameCount: selectedVideo.frame_count,
      }),
    );
    setPropagationEndFrameValue(nextBoundaryValue);
    setPropagationInputError(null);
    setSelectedRange(
      resolveSelectedRangeState({
        boundaryFrameValue: nextBoundaryValue,
        currentFrameIndex,
        direction: nextDirection,
        frameCount: selectedVideo.frame_count,
      }),
    );
  }

  function handlePropagationEndFrameValueChange(nextValue: string) {
    setPropagationEndFrameValue(nextValue);
    if (selectedVideo === null) {
      setSelectedRange(null);
      return;
    }

    setSelectedRange(
      resolveSelectedRangeState({
        boundaryFrameValue: nextValue,
        currentFrameIndex,
        direction: propagationDirection,
        frameCount: selectedVideo.frame_count,
      }),
    );
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

    try {
      void playbackVideoRef.current.play();
    } catch {
      // jsdom does not implement media playback; keep state authoritative.
    }
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
  }, [canMutateCurrentFrame, selectedSavedManualAnnotation, selectedVideo]);

  return {
    canCancelPropagation,
    canLoadNextFrame,
    canLoadPreviousFrame,
    canMutateCurrentFrame,
    canStartPropagation,
    currentFrameBox,
    currentFrameIndex,
    exactFrameImageUrl,
    exactFrameReady,
    frameInputError,
    frameInputRef,
    frameInputValue,
    handleCreateObject,
    handleDeleteManualBox,
    handleFrameJump,
    handleFrameStep,
    handleFrameSubmit,
    handleManualBoxCommit,
    handlePlaybackToggle,
    handleRunSam2,
    handleStartPropagation,
    isPlaybackActive,
    manualBoxError,
    maskOpacityPercent,
    newObjectLabel,
    objectPanelError,
    objectSummaries,
    pausePlaybackContext,
    playbackSource,
    playbackVideoRef,
    previousAnnotatedFrameIndex,
    previousKeyframeIndex,
    propagatedFrameIndices,
    propagationDirection,
    propagationEndFrameValue,
    propagationInputError,
    propagationJob,
    propagationStatus,
    sam2Annotations,
    sam2DraftBox,
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
    setNewObjectLabel,
    setPropagationDirection: handlePropagationDirectionChange,
    setPropagationEndFrameValue: handlePropagationEndFrameValueChange,
    visibleDraftBox,
    nextAnnotatedFrameIndex,
    nextKeyframeIndex,
  };
}

function clampFrameIndex(options: {
  frameIdx: number;
  frameCount: number;
}): number {
  return Math.min(Math.max(options.frameIdx, 0), options.frameCount - 1);
}

function defaultPropagationEndFrame(options: {
  direction: Sam2PropagationDirection;
  frameCount: number;
}): number {
  if (options.direction === "backward") {
    return 0;
  }

  return options.frameCount - 1;
}

function resolveSelectedRangeState(options: {
  currentFrameIndex: number;
  direction: Sam2PropagationDirection;
  boundaryFrameValue: string;
  frameCount: number;
}): SelectedRangeState | null {
  const parsedBoundaryFrameIdx = Number(options.boundaryFrameValue);
  if (
    !Number.isInteger(parsedBoundaryFrameIdx) ||
    parsedBoundaryFrameIdx < 0 ||
    parsedBoundaryFrameIdx >= options.frameCount
  ) {
    return null;
  }

  if (options.direction === "backward") {
    const boundaryFrameIdx = Math.min(
      parsedBoundaryFrameIdx,
      options.currentFrameIndex,
    );
    return {
      boundaryFrameIdx,
      endFrameIdx: options.currentFrameIndex,
      startFrameIdx: boundaryFrameIdx,
    };
  }

  if (options.direction === "both") {
    if (parsedBoundaryFrameIdx >= options.currentFrameIndex) {
      return {
        boundaryFrameIdx: parsedBoundaryFrameIdx,
        endFrameIdx: parsedBoundaryFrameIdx,
        startFrameIdx: 0,
      };
    }

    return {
      boundaryFrameIdx: parsedBoundaryFrameIdx,
      endFrameIdx: options.frameCount - 1,
      startFrameIdx: parsedBoundaryFrameIdx,
    };
  }

  const boundaryFrameIdx = Math.max(
    parsedBoundaryFrameIdx,
    options.currentFrameIndex,
  );
  return {
    boundaryFrameIdx,
    endFrameIdx: boundaryFrameIdx,
    startFrameIdx: options.currentFrameIndex,
  };
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
