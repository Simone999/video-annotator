import "../app/app.css";
import {
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from "react";

import {
  getIndexedVideoPlaybackUrl,
  type AnnotationBoxDraft,
  type FrameAnnotation,
  useVideoReviewWorkspace,
} from "../features/video-review";

export function App() {
  const workspace = useVideoReviewWorkspace();
  const selectedVideo = workspace.reviewState.selectedVideo;
  const currentFrameIndex = workspace.reviewState.currentFrameIndex;
  const currentFrameAnnotations =
    workspace.reviewState.frameAnnotationsByFrame[currentFrameIndex] ?? [];
  const selectedObjectSummary =
    workspace.reviewState.selectedObjectId === null
      ? null
      : (workspace.reviewState.objects.find(
          (objectTrack) =>
            objectTrack.id === workspace.reviewState.selectedObjectId,
        ) ?? null);
  const selectedPersistedAnnotation =
    selectedObjectSummary === null
      ? null
      : (currentFrameAnnotations.find(
          (annotation) => annotation.object_id === selectedObjectSummary.id,
        ) ?? null);
  const currentDraftAnnotation = getCurrentDraftAnnotation({
    currentFrameIndex,
    draft: workspace.reviewState.draftAnnotationBox,
    selectedObjectId: workspace.reviewState.selectedObjectId,
  });
  const playbackSource =
    selectedVideo === null
      ? null
      : getIndexedVideoPlaybackUrl({ videoId: selectedVideo.id });
  const [frameInputValue, setFrameInputValue] = useState("0");
  const [frameInputError, setFrameInputError] = useState<string | null>(null);
  const [newObjectLabel, setNewObjectLabel] = useState("");
  const [createObjectError, setCreateObjectError] = useState<string | null>(
    null,
  );
  const [isCreatingObject, setIsCreatingObject] = useState(false);
  const [boxSaveError, setBoxSaveError] = useState<string | null>(null);
  const [boxDeleteError, setBoxDeleteError] = useState<string | null>(null);
  const [isSavingBox, setIsSavingBox] = useState(false);
  const [isDeletingBox, setIsDeletingBox] = useState(false);
  const [annotationGesture, setAnnotationGesture] =
    useState<AnnotationPointerGesture | null>(null);
  const exactFrameImageUrl = useObjectUrl(workspace.exactFrame?.blob ?? null);
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
    setCreateObjectError(null);
    setIsCreatingObject(false);
  }, [selectedVideo?.id]);

  useEffect(() => {
    setBoxSaveError(null);
    setBoxDeleteError(null);
    setIsSavingBox(false);
    setIsDeletingBox(false);
    setAnnotationGesture(null);
  }, [
    currentFrameIndex,
    selectedVideo?.id,
    workspace.reviewState.selectedObjectId,
  ]);

  function handleFrameSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedVideo === null) {
      setFrameInputError("Select a video before loading exact frames.");
      return;
    }

    const parsedFrameIdx = Number(frameInputValue);
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

  function handleObjectCreate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedVideo === null) {
      setCreateObjectError("Select a video before creating an object.");
      return;
    }

    const trimmedLabel = newObjectLabel.trim();
    if (trimmedLabel.length === 0) {
      setCreateObjectError("Enter object label before saving.");
      return;
    }

    setCreateObjectError(null);
    setIsCreatingObject(true);

    void (async () => {
      try {
        await workspace.createObject(trimmedLabel);
        setNewObjectLabel("");
      } catch (error: unknown) {
        if (error instanceof Error && error.message.length > 0) {
          setCreateObjectError(error.message);
        } else {
          setCreateObjectError("Could not create object.");
        }
      } finally {
        setIsCreatingObject(false);
      }
    })();
  }

  function handleAnnotationPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      event.button !== 0 ||
      selectedObjectSummary === null ||
      workspace.exactFrameStatus !== "ready"
    ) {
      return;
    }

    const point = getNormalizedOverlayPoint(event);
    if (point === null) {
      return;
    }

    const editableAnnotation = getEditableAnnotation({
      currentFrameAnnotations,
      currentFrameIndex,
      draft: currentDraftAnnotation,
      selectedObjectId: selectedObjectSummary.id,
    });
    const editMode = getAnnotationEditMode({
      selectedObjectId: selectedObjectSummary.id,
      target: event.target,
    });
    const pointerTarget = event.currentTarget as HTMLDivElement & {
      setPointerCapture?: (pointerId: number) => void;
    };
    if (typeof pointerTarget.setPointerCapture === "function") {
      pointerTarget.setPointerCapture(event.pointerId);
    }
    setBoxSaveError(null);

    if (editableAnnotation !== null && editMode !== null) {
      workspace.setDraftAnnotationBox(editableAnnotation);
      setAnnotationGesture(
        editMode === "move"
          ? {
              box: editableAnnotation.box_xywh_norm,
              kind: "move",
              offset: {
                x: point.x - editableAnnotation.box_xywh_norm[0],
                y: point.y - editableAnnotation.box_xywh_norm[1],
              },
              pointerId: event.pointerId,
            }
          : {
              box: editableAnnotation.box_xywh_norm,
              kind: "resize",
              pointerId: event.pointerId,
            },
      );
      return;
    }

    setAnnotationGesture({
      kind: "draw",
      origin: point,
      pointerId: event.pointerId,
    });
    workspace.setDraftAnnotationBox({
      box_xywh_norm: [point.x, point.y, 0, 0],
      frameIdx: currentFrameIndex,
      objectId: selectedObjectSummary.id,
    });
  }

  function handleAnnotationPointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      annotationGesture === null ||
      selectedObjectSummary === null ||
      annotationGesture.pointerId !== event.pointerId
    ) {
      return;
    }

    const point = getNormalizedOverlayPoint(event);
    if (point === null) {
      return;
    }

    workspace.setDraftAnnotationBox({
      box_xywh_norm: getNextGestureBox({
        gesture: annotationGesture,
        point,
      }),
      frameIdx: currentFrameIndex,
      objectId: selectedObjectSummary.id,
    });
  }

  function handleAnnotationPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      annotationGesture === null ||
      selectedObjectSummary === null ||
      annotationGesture.pointerId !== event.pointerId
    ) {
      return;
    }

    const point = getNormalizedOverlayPoint(event);
    const pointerTarget = event.currentTarget as HTMLDivElement & {
      releasePointerCapture?: (pointerId: number) => void;
    };
    if (typeof pointerTarget.releasePointerCapture === "function") {
      pointerTarget.releasePointerCapture(event.pointerId);
    }
    setAnnotationGesture(null);

    if (point === null) {
      if (annotationGesture.kind === "draw") {
        workspace.setDraftAnnotationBox(null);
      }
      return;
    }

    const box = getNextGestureBox({
      gesture: annotationGesture,
      point,
    });
    if (box[2] <= 0 || box[3] <= 0) {
      workspace.setDraftAnnotationBox(null);
      return;
    }

    workspace.setDraftAnnotationBox({
      box_xywh_norm: box,
      frameIdx: currentFrameIndex,
      objectId: selectedObjectSummary.id,
    });
  }

  function handleAnnotationPointerCancel() {
    setAnnotationGesture(null);
    workspace.setDraftAnnotationBox(null);
  }

  function handleDraftClear() {
    setAnnotationGesture(null);
    setBoxSaveError(null);
    setBoxDeleteError(null);
    workspace.setDraftAnnotationBox(null);
  }

  function handleDraftSave() {
    if (
      currentDraftAnnotation === null ||
      workspace.reviewState.selectedObjectId === null
    ) {
      return;
    }

    setBoxSaveError(null);
    setBoxDeleteError(null);
    setIsSavingBox(true);

    void (async () => {
      try {
        await workspace.saveFrameAnnotations(currentFrameIndex, [
          {
            box_xywh_norm: currentDraftAnnotation.box_xywh_norm,
            is_keyframe: true,
            object_id: workspace.reviewState.selectedObjectId ?? 0,
            source: "manual",
          },
        ]);
        workspace.setDraftAnnotationBox(null);
      } catch (error: unknown) {
        setBoxSaveError(formatActionError(error, "Could not save box."));
      } finally {
        setIsSavingBox(false);
      }
    })();
  }

  function handleAnnotationDelete() {
    if (selectedPersistedAnnotation === null) {
      return;
    }

    setAnnotationGesture(null);
    setBoxSaveError(null);
    setBoxDeleteError(null);
    setIsDeletingBox(true);

    void (async () => {
      try {
        await workspace.deleteFrameAnnotation(
          currentFrameIndex,
          selectedPersistedAnnotation.object_id,
        );
        workspace.setDraftAnnotationBox(null);
      } catch (error: unknown) {
        setBoxDeleteError(formatActionError(error, "Could not delete box."));
      } finally {
        setIsDeletingBox(false);
      }
    })();
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
                      <div className="exact-frame-visual">
                        <img
                          alt={`Exact frame ${String(currentFrameIndex)}`}
                          className="exact-frame-image"
                          src={exactFrameImageUrl}
                        />
                        <div
                          aria-label="Draw annotation box"
                          className="annotation-overlay"
                          onPointerCancel={handleAnnotationPointerCancel}
                          onPointerDown={handleAnnotationPointerDown}
                          onPointerMove={handleAnnotationPointerMove}
                          onPointerUp={handleAnnotationPointerUp}
                        >
                          {currentFrameAnnotations.map((annotation) => {
                            if (
                              currentDraftAnnotation !== null &&
                              annotation.object_id ===
                                currentDraftAnnotation.objectId
                            ) {
                              return null;
                            }

                            const objectLabel =
                              workspace.reviewState.objects.find(
                                (objectTrack) =>
                                  objectTrack.id === annotation.object_id,
                              )?.label ??
                              `Object ${String(annotation.object_id)}`;
                            const isEditable =
                              selectedObjectSummary?.id ===
                              annotation.object_id;

                            return (
                              <div
                                key={annotation.object_id}
                                aria-label={`Annotation box ${objectLabel}`}
                                className={`annotation-overlay-box${isEditable ? " annotation-overlay-box--editable" : ""}`}
                                data-annotation-object-id={String(
                                  annotation.object_id,
                                )}
                                data-frame-idx={String(currentFrameIndex)}
                                style={getAnnotationBoxStyle(
                                  annotation.box_xywh_norm,
                                )}
                              >
                                <span className="annotation-overlay-label">
                                  {objectLabel}
                                </span>
                                {isEditable ? (
                                  <div
                                    aria-label={`Resize annotation box ${objectLabel}`}
                                    className="annotation-overlay-resize-handle"
                                    data-annotation-object-id={String(
                                      annotation.object_id,
                                    )}
                                    data-annotation-resize-handle="true"
                                  />
                                ) : null}
                              </div>
                            );
                          })}
                          {currentDraftAnnotation !== null &&
                          selectedObjectSummary !== null ? (
                            <div
                              aria-label={`Draft annotation box ${selectedObjectSummary.label}`}
                              className="annotation-overlay-box annotation-overlay-box--draft annotation-overlay-box--editable"
                              data-annotation-object-id={String(
                                selectedObjectSummary.id,
                              )}
                              data-frame-idx={String(currentFrameIndex)}
                              style={getAnnotationBoxStyle(
                                currentDraftAnnotation.box_xywh_norm,
                              )}
                            >
                              <span className="annotation-overlay-label">
                                {selectedObjectSummary.label}
                              </span>
                              <div
                                aria-label={`Resize annotation box ${selectedObjectSummary.label}`}
                                className="annotation-overlay-resize-handle"
                                data-annotation-object-id={String(
                                  selectedObjectSummary.id,
                                )}
                                data-annotation-resize-handle="true"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="annotation-toolbar">
                        <p className="surface-copy">
                          {selectedObjectSummary === null
                            ? "Select object before drawing box."
                            : currentDraftAnnotation !== null
                              ? `Draft ready for ${selectedObjectSummary.label} on frame ${String(currentFrameIndex)}.`
                              : selectedPersistedAnnotation !== null
                                ? `Drag, resize, or delete saved box for ${selectedObjectSummary.label}.`
                                : `Drag on exact frame to draw box for ${selectedObjectSummary.label}.`}
                        </p>
                        <div className="annotation-toolbar-actions">
                          <button
                            className="exact-frame-button"
                            disabled={
                              currentDraftAnnotation === null || isSavingBox
                            }
                            type="button"
                            onClick={handleDraftSave}
                          >
                            {isSavingBox ? "Saving..." : "Save box"}
                          </button>
                          <button
                            className="exact-frame-button"
                            disabled={currentDraftAnnotation === null}
                            type="button"
                            onClick={handleDraftClear}
                          >
                            Clear draft
                          </button>
                          <button
                            className="exact-frame-button"
                            disabled={
                              currentDraftAnnotation !== null ||
                              selectedPersistedAnnotation === null ||
                              isDeletingBox
                            }
                            type="button"
                            onClick={handleAnnotationDelete}
                          >
                            {isDeletingBox ? "Deleting..." : "Delete box"}
                          </button>
                        </div>
                      </div>
                      {boxSaveError !== null ? (
                        <p className="surface-copy">{boxSaveError}</p>
                      ) : null}
                      {boxDeleteError !== null ? (
                        <p className="surface-copy">{boxDeleteError}</p>
                      ) : null}
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
                Selection bootstraps from backend manifest, not list payload as
                source of truth.
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
                Selection bootstraps from backend manifest, not list payload as
                source of truth.
              </p>
            </>
          )}
          {workspace.errorMessage !== null ? (
            <p className="panel-copy">{workspace.errorMessage}</p>
          ) : null}
          {selectedVideo !== null ? (
            <section
              className="object-panel"
              aria-labelledby="object-panel-title"
            >
              <div className="object-panel-header">
                <p className="panel-kicker">Objects</p>
                <h3 id="object-panel-title" className="object-panel-title">
                  Objects
                </h3>
                <p className="panel-copy">
                  {formatObjectCount(workspace.reviewState.objects.length)}{" "}
                  ready for exact-frame work.
                </p>
                <p className="panel-copy">
                  {workspace.reviewState.selectedObjectId === null
                    ? "Select object before box work."
                    : `Selected object id: ${String(workspace.reviewState.selectedObjectId)}`}
                </p>
              </div>
              <form
                className="object-create-form"
                onSubmit={handleObjectCreate}
              >
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
                  disabled={isCreatingObject}
                  type="submit"
                >
                  {isCreatingObject ? "Creating..." : "Create object"}
                </button>
              </form>
              {createObjectError !== null ? (
                <p className="panel-copy">{createObjectError}</p>
              ) : null}
              {workspace.reviewState.objects.length > 0 ? (
                <ul className="object-list" aria-label="Objects">
                  {workspace.reviewState.objects.map((objectTrack) => (
                    <li key={objectTrack.id}>
                      <button
                        aria-pressed={
                          workspace.reviewState.selectedObjectId ===
                          objectTrack.id
                        }
                        className="video-list-button"
                        type="button"
                        onClick={() => {
                          workspace.selectObject(objectTrack.id);
                        }}
                      >
                        Select object {objectTrack.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="panel-copy">
                  No objects yet. Create stable target before drawing boxes.
                </p>
              )}
            </section>
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

function formatObjectCount(value: number): string {
  return `${String(value)} object${value === 1 ? "" : "s"}`;
}

function getAnnotationBoxStyle(box: [number, number, number, number]) {
  return {
    height: formatPercent(box[3]),
    left: formatPercent(box[0]),
    top: formatPercent(box[1]),
    width: formatPercent(box[2]),
  };
}

function getCurrentDraftAnnotation(options: {
  draft: AnnotationBoxDraft | null;
  currentFrameIndex: number;
  selectedObjectId: number | null;
}): AnnotationBoxDraft | null {
  if (
    options.draft === null ||
    options.selectedObjectId === null ||
    options.draft.frameIdx !== options.currentFrameIndex ||
    options.draft.objectId !== options.selectedObjectId
  ) {
    return null;
  }

  return options.draft;
}

function getEditableAnnotation(options: {
  currentFrameAnnotations: readonly FrameAnnotation[];
  currentFrameIndex: number;
  draft: AnnotationBoxDraft | null;
  selectedObjectId: number;
}): AnnotationBoxDraft | null {
  if (options.draft !== null) {
    return options.draft;
  }

  const persistedAnnotation = options.currentFrameAnnotations.find(
    (annotation) => annotation.object_id === options.selectedObjectId,
  );
  if (persistedAnnotation === undefined) {
    return null;
  }

  return {
    box_xywh_norm: [...persistedAnnotation.box_xywh_norm],
    frameIdx: options.currentFrameIndex,
    objectId: options.selectedObjectId,
  };
}

function getNormalizedOverlayPoint(
  event: ReactPointerEvent<HTMLDivElement>,
): AnnotationPoint | null {
  const bounds = event.currentTarget.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  return {
    x: clampNormalizedValue((event.clientX - bounds.left) / bounds.width),
    y: clampNormalizedValue((event.clientY - bounds.top) / bounds.height),
  };
}

function getNormalizedBox(
  origin: AnnotationPoint,
  current: AnnotationPoint,
): [number, number, number, number] {
  const left = Math.min(origin.x, current.x);
  const top = Math.min(origin.y, current.y);
  const right = Math.max(origin.x, current.x);
  const bottom = Math.max(origin.y, current.y);

  return [left, top, right - left, bottom - top];
}

function getAnnotationEditMode(options: {
  selectedObjectId: number;
  target: EventTarget | null;
}): AnnotationEditMode | null {
  if (!(options.target instanceof HTMLElement)) {
    return null;
  }

  const resizeHandle = options.target.closest<HTMLElement>(
    "[data-annotation-resize-handle='true']",
  );
  if (
    resizeHandle !== null &&
    Number(resizeHandle.dataset.annotationObjectId) === options.selectedObjectId
  ) {
    return "resize";
  }

  const annotationBox = options.target.closest<HTMLElement>(
    "[data-annotation-object-id]",
  );
  if (
    annotationBox !== null &&
    Number(annotationBox.dataset.annotationObjectId) ===
      options.selectedObjectId
  ) {
    return "move";
  }

  return null;
}

function getNextGestureBox(options: {
  gesture: AnnotationPointerGesture;
  point: AnnotationPoint;
}): [number, number, number, number] {
  if (options.gesture.kind === "draw") {
    return roundNormalizedBox(
      getNormalizedBox(options.gesture.origin, options.point),
    );
  }

  if (options.gesture.kind === "move") {
    return roundNormalizedBox(
      moveNormalizedBox({
        box: options.gesture.box,
        point: options.point,
        pointerOffset: options.gesture.offset,
      }),
    );
  }

  return roundNormalizedBox(
    resizeNormalizedBox({
      box: options.gesture.box,
      point: options.point,
    }),
  );
}

function moveNormalizedBox(options: {
  box: [number, number, number, number];
  point: AnnotationPoint;
  pointerOffset: AnnotationPoint;
}): [number, number, number, number] {
  const width = options.box[2];
  const height = options.box[3];
  const left = clampNormalizedValue(options.point.x - options.pointerOffset.x);
  const top = clampNormalizedValue(options.point.y - options.pointerOffset.y);

  return [Math.min(left, 1 - width), Math.min(top, 1 - height), width, height];
}

function resizeNormalizedBox(options: {
  box: [number, number, number, number];
  point: AnnotationPoint;
}): [number, number, number, number] {
  const left = options.box[0];
  const top = options.box[1];
  const right = clampNormalizedValue(options.point.x);
  const bottom = clampNormalizedValue(options.point.y);

  return [
    left,
    top,
    Math.max(right - left, 0.01),
    Math.max(bottom - top, 0.01),
  ];
}

function clampNormalizedValue(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function formatPercent(value: number): string {
  return `${String(Number((value * 100).toFixed(4)))}%`;
}

function roundNormalizedBox(
  box: [number, number, number, number],
): [number, number, number, number] {
  return [
    roundNormalizedValue(box[0]),
    roundNormalizedValue(box[1]),
    roundNormalizedValue(box[2]),
    roundNormalizedValue(box[3]),
  ];
}

function roundNormalizedValue(value: number): number {
  return Number(value.toFixed(6));
}

function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}

type AnnotationPoint = {
  x: number;
  y: number;
};

type AnnotationEditMode = "move" | "resize";

type AnnotationPointerGesture =
  | {
      kind: "draw";
      origin: AnnotationPoint;
      pointerId: number;
    }
  | {
      box: [number, number, number, number];
      kind: "move";
      offset: AnnotationPoint;
      pointerId: number;
    }
  | {
      box: [number, number, number, number];
      kind: "resize";
      pointerId: number;
    };
