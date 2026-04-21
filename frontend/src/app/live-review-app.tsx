import "../app/app.css";
import { useEffect, useState, type SyntheticEvent } from "react";

import {
  ExactFrameCanvas,
  getFrameAnnotationMaskUrl,
  getIndexedVideoPlaybackUrl,
  type Sam2PropagationDirection,
  useVideoReviewWorkspace,
} from "../features/video-review";

export function LiveReviewApp() {
  const workspace = useVideoReviewWorkspace();
  const selectedVideo = workspace.reviewState.selectedVideo;
  const currentFrameIndex = workspace.reviewState.currentFrameIndex;
  const objectSummaries = workspace.reviewState.annotation.objectSummaries;
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
  const canStartPropagation =
    selectedVideo !== null &&
    workspace.exactFrame !== null &&
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
  const canLoadPreviousFrame =
    selectedVideo !== null &&
    currentFrameIndex > 0 &&
    workspace.exactFrameStatus !== "loading";
  const canLoadNextFrame =
    selectedVideo !== null &&
    currentFrameIndex < selectedVideo.frame_count - 1 &&
    workspace.exactFrameStatus !== "loading";

  useEffect(() => {
    setFrameInputValue(String(currentFrameIndex));
    setFrameInputError(null);
  }, [currentFrameIndex, selectedVideo?.id]);

  useEffect(() => {
    setNewObjectLabel("");
    setObjectPanelError(null);
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

    setFrameInputError(null);
    void workspace.loadExactFrame(parsedFrameIdx);
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

    setFrameInputError(null);
    void workspace.loadExactFrame(nextFrameIdx);
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

  return (
    <main className="app-shell">
      <section className="workspace-shell" aria-labelledby="workspace-title">
        <aside className="side-panel side-panel--left" aria-label="Video list">
          <p className="panel-kicker">Indexed videos</p>
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

        <div className="center-column">
          <section
            className="surface surface--playback"
            aria-label="Playback pane"
          >
            <p className="surface-kicker">Playback pane</p>
            <div className="surface-frame">
              {selectedVideo === null ? (
                <>
                  <span className="surface-label">Playback preview</span>
                  <p className="surface-copy">
                    Select an indexed video to load contextual playback.
                  </p>
                </>
              ) : (
                <>
                  <video
                    aria-label="Playback preview"
                    className="playback-video"
                    controls
                    preload="metadata"
                    src={playbackSource ?? undefined}
                  />
                  <p className="surface-copy">
                    Playback stays contextual only. Canonical review frame comes
                    from backend frame index state.
                  </p>
                </>
              )}
            </div>
          </section>

          <section
            className="surface surface--exact"
            aria-label="Exact-frame pane"
            style={{ overflowAnchor: "none" }}
          >
            <p className="surface-kicker">Exact-frame pane</p>
            <div className="surface-frame">
              {selectedVideo === null ? (
                <>
                  <span className="surface-label">Exact-frame preview</span>
                  <p className="surface-copy">
                    Select a video, then jump to canonical frame N from backend
                    exact-frame service.
                  </p>
                </>
              ) : (
                <>
                  <form
                    className="exact-frame-form"
                    onSubmit={handleFrameSubmit}
                  >
                    <label className="exact-frame-field">
                      <span className="exact-frame-field-label">
                        Frame number
                      </span>
                      <input
                        aria-label="Frame number"
                        className="exact-frame-input"
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
                  </form>
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
                  {workspace.exactFrameStatus === "ready" &&
                  exactFrameImageUrl !== null ? (
                    <>
                      <span className="surface-label">
                        Canonical frame {currentFrameIndex}
                      </span>
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
                        onAnnotationTransformCommit={handleManualBoxCommit}
                        onDraftBoxCommit={handleManualBoxCommit}
                        onDraftBoxChange={workspace.setSam2DraftBox}
                      />
                      <div className="sam2-controls">
                        <button
                          className="exact-frame-button"
                          disabled={selectedSavedManualAnnotation === null}
                          type="button"
                          onClick={handleDeleteManualBox}
                        >
                          Delete saved box
                        </button>
                        <button
                          className="exact-frame-button"
                          disabled={
                            sam2DraftBox === null ||
                            selectedObjectId.trim().length === 0 ||
                            workspace.reviewState.sam2.prompt.status ===
                              "loading"
                          }
                          type="button"
                          onClick={handleRunSam2}
                        >
                          Run SAM2
                        </button>
                        {sam2DraftBox === null ? (
                          <p className="surface-copy">
                            Draw box on exact frame to seed SAM2.
                          </p>
                        ) : (
                          <p className="surface-copy">
                            Draft box ready for {selectedObjectId}
                          </p>
                        )}
                        {manualBoxError !== null ? (
                          <p className="surface-copy">{manualBoxError}</p>
                        ) : null}
                        {workspace.reviewState.sam2.prompt.status ===
                        "loading" ? (
                          <p className="surface-copy">Running SAM2...</p>
                        ) : null}
                        {workspace.reviewState.sam2.prompt.errorMessage !==
                        null ? (
                          <p className="surface-copy">
                            {workspace.reviewState.sam2.prompt.errorMessage}
                          </p>
                        ) : null}
                        <section
                          className="sam2-propagation-panel"
                          aria-label="SAM2 propagation controls"
                        >
                          <p className="surface-label">
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
                                  event.target
                                    .value as Sam2PropagationDirection,
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
                          {workspace.reviewState.sam2.session.sessionId ===
                          null ? (
                            <p className="surface-copy">
                              Run SAM2 on current object before propagation.
                            </p>
                          ) : null}
                          {propagationInputError !== null ? (
                            <p className="surface-copy">
                              {propagationInputError}
                            </p>
                          ) : null}
                          {propagationStatus === "loading" &&
                          propagationJob === null ? (
                            <p className="surface-copy">
                              Starting propagation...
                            </p>
                          ) : null}
                          {workspace.reviewState.sam2.propagation
                            .errorMessage !== null ? (
                            <p className="surface-copy">
                              {
                                workspace.reviewState.sam2.propagation
                                  .errorMessage
                              }
                            </p>
                          ) : null}
                          {propagationJob !== null ? (
                            <>
                              <p className="surface-copy">
                                Propagation job {propagationJob.status}
                              </p>
                              <p className="surface-copy">
                                Progress {propagationJob.progressCurrent} /{" "}
                                {propagationJob.progressTotal}
                              </p>
                              {propagatedFrameIndices.length > 0 ? (
                                <div className="sam2-propagation-results">
                                  <p className="surface-copy">
                                    Saved propagated frames
                                  </p>
                                  <div className="sam2-propagation-frame-list">
                                    {propagatedFrameIndices.map((frameIdx) => (
                                      <button
                                        key={frameIdx}
                                        className="exact-frame-button"
                                        type="button"
                                        onClick={() => {
                                          void workspace.loadExactFrame(
                                            frameIdx,
                                          );
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
                      </div>
                    </>
                  ) : (
                    <p className="surface-copy">
                      Playback time stays separate. Re-enter frame N to confirm
                      canonical backend image.
                    </p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <aside
          className="side-panel side-panel--right"
          aria-label="Backend metadata"
        >
          <p className="panel-kicker">Backend metadata</p>
          <h2 className="panel-title">Review target</h2>
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
                  <dt>Display name</dt>
                  <dd>{selectedVideo.display_name}</dd>
                </div>
                <div className="metadata-row">
                  <dt>Frame count</dt>
                  <dd>{selectedVideo.frame_count}</dd>
                </div>
                <div className="metadata-row">
                  <dt>FPS</dt>
                  <dd>{formatFramesPerSecond(selectedVideo.fps)}</dd>
                </div>
                <div className="metadata-row">
                  <dt>Resolution</dt>
                  <dd>
                    {selectedVideo.width} x {selectedVideo.height}
                  </dd>
                </div>
                <div className="metadata-row">
                  <dt>Duration</dt>
                  <dd>{formatDuration(selectedVideo.duration_seconds)}</dd>
                </div>
              </dl>
              <p className="panel-copy">{selectedVideo.source_path}</p>
              <p className="panel-copy">
                Selection uses backend detail fetch, not list payload as source
                of truth.
              </p>
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

function isSam2JobActive(status: string | null): boolean {
  return status === "queued" || status === "running" || status === "cancelling";
}
