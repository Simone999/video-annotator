import "../app/app.css";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";

import {
  ExactFrameCanvas,
  getFrameAnnotationMaskUrl,
  getIndexedVideoPlaybackUrl,
  type Sam2PropagationDirection,
  useVideoReviewWorkspace,
} from "../features/video-review";

export function LiveReviewApp({
  initialVideoId = null,
  onBackToLibrary,
}: {
  initialVideoId?: string | null;
  onBackToLibrary?: () => void;
}) {
  const workspace = useVideoReviewWorkspace();
  const initialVideoSelectionRef = useRef<string | null>(null);
  const landingFrameLoadRef = useRef<string | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const frameInputRef = useRef<HTMLInputElement | null>(null);
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
      setPropagationEndFrameValue("0");
      setPropagationInputError(null);
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
  }, [
    currentFrameIndex,
    propagationDirection,
    selectedVideo?.frame_count,
    selectedVideo?.id,
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

    const parsedEndFrameIdx = Number(propagationEndFrameValue);
    if (
      !Number.isInteger(parsedEndFrameIdx) ||
      parsedEndFrameIdx < 0 ||
      parsedEndFrameIdx >= selectedVideo.frame_count
    ) {
      setPropagationInputError(
        `Enter frame 0-${String(selectedVideo.frame_count - 1)}.`,
      );
      return;
    }

    setPropagationInputError(null);
    void workspace.startSam2Propagation({
      direction: propagationDirection,
      endFrameIdx: parsedEndFrameIdx,
      objectIds: [selectedObjectId.trim()],
      startFrameIdx: currentFrameIndex,
    });
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

  return (
    <main className="app-shell">
      <section
        className="workspace-shell workspace-shell--single-stage"
        aria-labelledby="workspace-title"
      >
        <aside className="side-panel side-panel--left" aria-label="Video list">
          <p className="panel-kicker">Indexed videos</p>
          {onBackToLibrary ? (
            <button
              className="exact-frame-button"
              type="button"
              onClick={onBackToLibrary}
            >
              Back to Library
            </button>
          ) : null}
          <h2 id="workspace-title" className="panel-title">
            {selectedVideo?.display_name ?? "Choose review target"}
          </h2>
          <p className="panel-copy">
            Canonical exact-frame index:{" "}
            {workspace.reviewState.currentFrameIndex}
          </p>
          <div className="video-list-panel">
            {workspace.listStatus === "loading" ? (
              <p className="panel-copy">Loading indexed videos...</p>
            ) : null}

            {workspace.listStatus === "empty" ? (
              <p className="panel-copy">No indexed videos found yet.</p>
            ) : null}

            {workspace.listStatus === "error" ? (
              <p className="panel-copy">{workspace.errorMessage}</p>
            ) : null}

            {workspace.listStatus === "ready" ? (
              <ul className="video-list" aria-label="Indexed videos">
                {workspace.indexedVideos.map((video) => (
                  <li key={video.id}>
                    <button
                      className="video-list-button"
                      aria-pressed={workspace.activeVideoId === video.id}
                      type="button"
                      onClick={() => {
                        void workspace.selectVideo(video.id);
                      }}
                    >
                      Open {video.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <section className="object-panel" aria-label="Review objects">
            <p className="panel-kicker">Review objects</p>
            {selectedVideo === null ? (
              <p className="panel-copy">
                Select video before choosing persisted objects.
              </p>
            ) : (
              <>
                <div className="object-create-form">
                  <label className="exact-frame-field">
                    <span className="exact-frame-field-label">
                      New object label
                    </span>
                    <input
                      aria-label="New object label"
                      className="exact-frame-input"
                      type="text"
                      value={newObjectLabel}
                      onChange={(event) => {
                        setNewObjectLabel(event.target.value);
                      }}
                    />
                  </label>
                  <button
                    className="exact-frame-button"
                    disabled={newObjectLabel.trim().length === 0}
                    type="button"
                    onClick={() => {
                      void handleCreateObject();
                    }}
                  >
                    Create object
                  </button>
                </div>
                {objectPanelError !== null ? (
                  <p className="panel-copy">{objectPanelError}</p>
                ) : null}
                <div className="object-list" role="list">
                  {objectSummaries.map((objectSummary) => (
                    <button
                      key={objectSummary.id}
                      aria-pressed={selectedObjectId === objectSummary.id}
                      className="object-list-button"
                      type="button"
                      onClick={() => {
                        workspace.setSam2SelectedObject(objectSummary.id);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="object-color-chip"
                        style={{ backgroundColor: objectSummary.color }}
                      />
                      <span className="object-list-copy">
                        <span className="object-list-label">
                          {objectSummary.label}
                        </span>
                        <span className="object-list-meta">
                          {objectSummary.id}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </aside>

        <section className="review-surface" aria-label="Live review surface">
          <header className="review-surface-header">
            <div>
              <p className="surface-kicker">Live review</p>
              <h2 className="panel-title">Review surface</h2>
              <p className="surface-copy">
                Playback stays contextual only. Canonical review frame comes
                from backend frame index state.
              </p>
            </div>
            <dl className="review-surface-meta">
              <div>
                <dt>Video</dt>
                <dd>{selectedVideo?.display_name ?? "No selection"}</dd>
              </div>
              <div>
                <dt>Frame</dt>
                <dd>
                  {exactFrameReady
                    ? `Frame ${String(currentFrameIndex)}`
                    : "Not loaded"}
                </dd>
              </div>
              <div>
                <dt>FPS</dt>
                <dd>
                  {selectedVideo === null
                    ? "Unavailable"
                    : formatFramesPerSecond(selectedVideo.fps)}
                </dd>
              </div>
            </dl>
          </header>

          <div className="review-stage-card">
            {selectedVideo === null ? (
              <div className="surface-frame review-stage-placeholder">
                <span className="surface-label">Playback review stage</span>
                <p className="surface-copy">
                  Select an indexed video, then load canonical backend frames
                  onto one live review surface.
                </p>
              </div>
            ) : (
              <>
                <div className="review-stage-frame">
                  <video
                    ref={playbackVideoRef}
                    aria-label="Playback preview"
                    className="playback-video review-stage-video"
                    controls
                    preload="metadata"
                    src={playbackSource ?? undefined}
                    onEnded={() => {
                      setIsPlaybackActive(false);
                    }}
                    onPause={() => {
                      setIsPlaybackActive(false);
                    }}
                    onPlay={() => {
                      setIsPlaybackActive(true);
                    }}
                  />
                  {exactFrameImageUrl !== null && !isPlaybackActive ? (
                    <div className="review-stage-canvas">
                      <ExactFrameCanvas
                        alt={`Exact frame ${String(currentFrameIndex)}`}
                        annotations={sam2Annotations}
                        draftBox={visibleDraftBox}
                        editableAnnotation={
                          selectedSavedManualAnnotation === null
                            ? null
                            : {
                                box: {
                                  h: selectedSavedManualAnnotation
                                    .box_xywh_norm[3],
                                  w: selectedSavedManualAnnotation
                                    .box_xywh_norm[2],
                                  x: selectedSavedManualAnnotation
                                    .box_xywh_norm[0],
                                  y: selectedSavedManualAnnotation
                                    .box_xywh_norm[1],
                                },
                                objectId:
                                  selectedSavedManualAnnotation.object_id,
                              }
                        }
                        imageUrl={exactFrameImageUrl}
                        maskOpacity={maskOpacityPercent / 100}
                        onAnnotationTransformCommit={handleManualBoxCommit}
                        onDraftBoxCommit={handleManualBoxCommit}
                        onDraftBoxChange={workspace.setSam2DraftBox}
                      />
                    </div>
                  ) : null}

                  <div className="review-stage-chip-row">
                    <span className="review-stage-chip">
                      Playback {isPlaybackActive ? "active" : "paused"}
                    </span>
                    <span className="review-stage-chip">
                      Frame {currentFrameIndex}
                    </span>
                    {exactFrameReady ? (
                      <span className="review-stage-chip">
                        Exact frame loaded
                      </span>
                    ) : null}
                  </div>

                  {isPlaybackActive ? (
                    <div className="review-stage-banner">
                      Playback active. Pause to return to canonical frame{" "}
                      {currentFrameIndex}.
                    </div>
                  ) : null}
                </div>

                <div className="review-stage-status">
                  <span className="surface-label">
                    {exactFrameReady
                      ? `Canonical frame ${String(currentFrameIndex)}`
                      : "No canonical frame loaded"}
                  </span>
                  {frameInputError !== null ? (
                    <p className="surface-copy">{frameInputError}</p>
                  ) : null}
                  {workspace.exactFrameErrorMessage !== null ? (
                    <p className="surface-copy">
                      {workspace.exactFrameErrorMessage}
                    </p>
                  ) : null}
                  {workspace.exactFrameStatus === "loading" ? (
                    <p className="surface-copy">Loading exact frame...</p>
                  ) : null}
                  {!exactFrameReady &&
                  workspace.exactFrameStatus !== "loading" ? (
                    <p className="surface-copy">
                      Load frame to bring backend-decoded canonical image onto
                      stage.
                    </p>
                  ) : null}
                  {isPlaybackActive ? (
                    <p className="surface-copy">
                      Pause playback before mutating canonical frame data.
                    </p>
                  ) : exactFrameReady ? (
                    <p className="surface-copy">
                      Paused stage is edit-ready. Draw, move, resize, delete,
                      and SAM2 actions use backend frame {currentFrameIndex}.
                    </p>
                  ) : (
                    <p className="surface-copy">
                      Playback time stays separate. Load exact frame before
                      mutating review data.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedVideo !== null ? (
            <footer className="review-surface-footer">
              <form
                className="exact-frame-form review-surface-frame-form"
                onSubmit={handleFrameSubmit}
              >
                <label className="exact-frame-field">
                  <span className="exact-frame-field-label">Frame number</span>
                  <input
                    aria-label="Frame number"
                    className="exact-frame-input"
                    ref={frameInputRef}
                    inputMode="numeric"
                    min={0}
                    max={selectedVideo.frame_count - 1}
                    name="frame-number"
                    step={1}
                    type="number"
                    value={frameInputValue}
                    onChange={(event) => {
                      setFrameInputValue(event.target.value);
                    }}
                  />
                </label>
                <button className="exact-frame-button" type="submit">
                  Load frame
                </button>
                <div className="exact-frame-nav">
                  <button
                    aria-label="Previous frame"
                    className="exact-frame-button"
                    disabled={!canLoadPreviousFrame}
                    type="button"
                    onClick={() => {
                      handleFrameStep(-1);
                    }}
                  >
                    Previous frame
                  </button>
                  <button
                    aria-label="Next frame"
                    className="exact-frame-button"
                    disabled={!canLoadNextFrame}
                    type="button"
                    onClick={() => {
                      handleFrameStep(1);
                    }}
                  >
                    Next frame
                  </button>
                </div>
                <div className="exact-frame-nav">
                  <button
                    className="exact-frame-button"
                    disabled={previousAnnotatedFrameIndex === null}
                    type="button"
                    onClick={() => {
                      handleFrameJump(previousAnnotatedFrameIndex);
                    }}
                  >
                    Previous annotated frame
                  </button>
                  <button
                    className="exact-frame-button"
                    disabled={nextAnnotatedFrameIndex === null}
                    type="button"
                    onClick={() => {
                      handleFrameJump(nextAnnotatedFrameIndex);
                    }}
                  >
                    Next annotated frame
                  </button>
                </div>
                <div className="exact-frame-nav">
                  <button
                    className="exact-frame-button"
                    disabled={previousKeyframeIndex === null}
                    type="button"
                    onClick={() => {
                      handleFrameJump(previousKeyframeIndex);
                    }}
                  >
                    Previous keyframe
                  </button>
                  <button
                    className="exact-frame-button"
                    disabled={nextKeyframeIndex === null}
                    type="button"
                    onClick={() => {
                      handleFrameJump(nextKeyframeIndex);
                    }}
                  >
                    Next keyframe
                  </button>
                </div>
                <button
                  className="exact-frame-button"
                  type="button"
                  onClick={handlePlaybackToggle}
                >
                  {isPlaybackActive ? "Pause playback" : "Play context"}
                </button>
              </form>
            </footer>
          ) : null}
        </section>

        <aside
          className="side-panel side-panel--right"
          aria-label="Selected object inspector"
        >
          <p className="panel-kicker">Inspector</p>
          <h2 className="panel-title">Selected object</h2>
          {workspace.selectionStatus === "loading" ? (
            <p className="panel-copy">Loading selected video...</p>
          ) : null}
          {selectedVideo === null ? (
            <>
              <p className="panel-copy">
                Pick a video from indexed list to open review workspace.
              </p>
              <p className="panel-copy">
                Selection uses backend detail fetch, not list payload as source
                of truth.
              </p>
            </>
          ) : (
            <>
              <dl className="metadata-list">
                <div className="metadata-row">
                  <dt>Label</dt>
                  <dd>
                    {selectedObjectSummary?.label ?? "No object selected"}
                  </dd>
                </div>
                <div className="metadata-row">
                  <dt>Object id</dt>
                  <dd>{selectedObjectId.trim() || "None"}</dd>
                </div>
                <div className="metadata-row">
                  <dt>Current box</dt>
                  <dd>
                    {formatCurrentBoxLabel({
                      boxXywhNorm: currentFrameBox,
                      videoHeight: selectedVideo.height,
                      videoWidth: selectedVideo.width,
                    })}
                  </dd>
                </div>
                <div className="metadata-row">
                  <dt>Current source</dt>
                  <dd>
                    {formatCurrentAnnotationSource({
                      selectedFrameAnnotation,
                      selectedSavedManualAnnotation,
                    })}
                  </dd>
                </div>
                <div className="metadata-row">
                  <dt>Duration</dt>
                  <dd>{formatDuration(selectedVideo.duration_seconds)}</dd>
                </div>
              </dl>
              <p className="panel-copy">{selectedVideo.source_path}</p>

              <section className="object-panel">
                <p className="panel-kicker">Mask overlay</p>
                <label className="exact-frame-field">
                  <span className="exact-frame-field-label">Mask opacity</span>
                  <input
                    aria-label="Mask opacity"
                    className="exact-frame-input"
                    max={100}
                    min={0}
                    step={1}
                    type="range"
                    value={maskOpacityPercent}
                    onChange={(event) => {
                      setMaskOpacityPercent(Number(event.target.value));
                    }}
                  />
                </label>
                <p className="panel-copy">{maskOpacityPercent}%</p>
                {selectedFrameAnnotation?.mask === null ? (
                  <p className="panel-copy">
                    Selected object has no mask on current frame.
                  </p>
                ) : (
                  <p className="panel-copy">
                    Adjust selected mask overlay locally without changing
                    persisted data.
                  </p>
                )}
              </section>

              <section className="object-panel">
                <p className="panel-kicker">Box tools</p>
                <button
                  className="exact-frame-button"
                  disabled={
                    !canMutateCurrentFrame ||
                    selectedSavedManualAnnotation === null
                  }
                  type="button"
                  onClick={handleDeleteManualBox}
                >
                  Delete saved box
                </button>
                {manualBoxError !== null ? (
                  <p className="panel-copy">{manualBoxError}</p>
                ) : null}
              </section>

              <section className="object-panel">
                <p className="panel-kicker">SAM2 prompt</p>
                <button
                  className="exact-frame-button"
                  disabled={
                    !canMutateCurrentFrame ||
                    sam2DraftBox === null ||
                    selectedObjectId.trim().length === 0 ||
                    workspace.reviewState.sam2.prompt.status === "loading"
                  }
                  type="button"
                  onClick={handleRunSam2}
                >
                  Run SAM2
                </button>
                {sam2DraftBox === null ? (
                  <p className="panel-copy">
                    Draw box on exact frame to seed SAM2.
                  </p>
                ) : (
                  <p className="panel-copy">
                    Draft box ready for {selectedObjectId}
                  </p>
                )}
                {workspace.reviewState.sam2.prompt.status === "loading" ? (
                  <p className="panel-copy">Running SAM2...</p>
                ) : null}
                {workspace.reviewState.sam2.prompt.errorMessage !== null ? (
                  <p className="panel-copy">
                    {workspace.reviewState.sam2.prompt.errorMessage}
                  </p>
                ) : null}
              </section>

              <section
                className="object-panel"
                aria-label="SAM2 propagation controls"
              >
                <p className="panel-kicker">SAM2 propagation</p>
                <p className="panel-copy">
                  Propagate from frame {currentFrameIndex}
                </p>
                <label className="exact-frame-field">
                  <span className="exact-frame-field-label">
                    Propagation direction
                  </span>
                  <select
                    aria-label="Propagation direction"
                    className="exact-frame-input"
                    value={propagationDirection}
                    onChange={(event) => {
                      setPropagationDirection(
                        event.target.value as Sam2PropagationDirection,
                      );
                    }}
                  >
                    <option value="forward">Forward</option>
                    <option value="backward">Backward</option>
                    <option value="both">Both</option>
                  </select>
                </label>
                <label className="exact-frame-field">
                  <span className="exact-frame-field-label">
                    Propagation end frame
                  </span>
                  <input
                    aria-label="Propagation end frame"
                    className="exact-frame-input"
                    inputMode="numeric"
                    min={0}
                    max={selectedVideo.frame_count - 1}
                    step={1}
                    type="number"
                    value={propagationEndFrameValue}
                    onChange={(event) => {
                      setPropagationEndFrameValue(event.target.value);
                    }}
                  />
                </label>
                <div className="sam2-propagation-actions">
                  <button
                    className="exact-frame-button"
                    disabled={!canStartPropagation}
                    type="button"
                    onClick={handleStartPropagation}
                  >
                    Start propagation
                  </button>
                  {propagationJob !== null ? (
                    <button
                      className="exact-frame-button"
                      disabled={!canCancelPropagation}
                      type="button"
                      onClick={() => {
                        void workspace.cancelSam2PropagationJob();
                      }}
                    >
                      Cancel propagation
                    </button>
                  ) : null}
                </div>
                {workspace.reviewState.sam2.session.sessionId === null ? (
                  <p className="panel-copy">
                    Run SAM2 on current object before propagation.
                  </p>
                ) : null}
                {propagationInputError !== null ? (
                  <p className="panel-copy">{propagationInputError}</p>
                ) : null}
                {propagationStatus === "loading" && propagationJob === null ? (
                  <p className="panel-copy">Starting propagation...</p>
                ) : null}
                {workspace.reviewState.sam2.propagation.errorMessage !==
                null ? (
                  <p className="panel-copy">
                    {workspace.reviewState.sam2.propagation.errorMessage}
                  </p>
                ) : null}
                {propagationJob !== null ? (
                  <>
                    <p className="panel-copy">
                      Propagation job {propagationJob.status}
                    </p>
                    <p className="panel-copy">
                      Progress {propagationJob.progressCurrent} /{" "}
                      {propagationJob.progressTotal}
                    </p>
                    {propagatedFrameIndices.length > 0 ? (
                      <div className="sam2-propagation-results">
                        <p className="panel-copy">Saved propagated frames</p>
                        <div className="sam2-propagation-frame-list">
                          {propagatedFrameIndices.map((frameIdx) => (
                            <button
                              key={frameIdx}
                              className="exact-frame-button"
                              type="button"
                              onClick={() => {
                                pausePlaybackContext();
                                void workspace.loadExactFrame(frameIdx);
                              }}
                            >
                              Open frame {frameIdx}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </section>
            </>
          )}
          {workspace.errorMessage !== null ? (
            <p className="panel-copy">{workspace.errorMessage}</p>
          ) : null}
        </aside>
      </section>
    </main>
  );
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

function formatFramesPerSecond(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatDuration(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }

  return `${value.toFixed(2)}s`;
}

function formatCurrentBoxLabel(options: {
  boxXywhNorm: readonly [number, number, number, number] | null;
  videoWidth: number;
  videoHeight: number;
}): string {
  if (options.boxXywhNorm === null) {
    return "Unavailable";
  }

  const x1 = Math.floor(options.boxXywhNorm[0] * options.videoWidth);
  const y1 = Math.floor(options.boxXywhNorm[1] * options.videoHeight);
  const x2 = Math.ceil(
    (options.boxXywhNorm[0] + options.boxXywhNorm[2]) * options.videoWidth,
  );
  const y2 = Math.ceil(
    (options.boxXywhNorm[1] + options.boxXywhNorm[3]) * options.videoHeight,
  );

  return `[${String(x1)}, ${String(y1)}, ${String(x2)}, ${String(y2)}]`;
}

function formatCurrentAnnotationSource(options: {
  selectedFrameAnnotation: {
    source: string;
    mask: { path: string } | null;
  } | null;
  selectedSavedManualAnnotation: {
    source: string;
  } | null;
}): string {
  if (options.selectedSavedManualAnnotation !== null) {
    return "Manual box";
  }

  if (options.selectedFrameAnnotation === null) {
    return "No saved annotation on current frame";
  }

  if (
    options.selectedFrameAnnotation.source === "sam2" &&
    options.selectedFrameAnnotation.mask !== null
  ) {
    return "SAM2 mask";
  }

  return options.selectedFrameAnnotation.source;
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
