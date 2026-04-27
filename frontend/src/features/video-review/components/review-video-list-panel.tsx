import { useEffect, useId, useRef, useState } from "react";

import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";
import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";

const DEFAULT_OBJECT_COLOR_OPTIONS = [
  { label: "Green", value: "#04B84C" },
  { label: "Orange", value: "#FB6A22" },
  { label: "Yellow", value: "#FFC300" },
  { label: "Blue", value: "#0285FF" },
  { label: "Violet", value: "#924FF7" },
  { label: "Pink", value: "#FF66AD" },
] as const;

export function ReviewVideoListPanel({
  controller,
  onBackToLibrary,
  routeMode,
  workspace,
}: {
  controller: LiveReviewController;
  onBackToLibrary?: () => void;
  routeMode: boolean;
  workspace: VideoReviewWorkspace;
}) {
  const selectedVideo = controller.selectedVideo;
  const savedManualAnnotationsForCurrentFrame =
    workspace.reviewState.annotation.savedManualAnnotationsByFrame[
      workspace.reviewState.currentFrameIndex
    ] ?? {};
  const currentFrameAnnotationsByObjectId = new Map(
    workspace.reviewState.sam2.frameAnnotations.map((annotation) => [
      annotation.object_id,
      annotation,
    ]),
  );
  const objectColorOptions = controller.objectColorOptions.map(
    (color, index) => ({
      label:
        index < DEFAULT_OBJECT_COLOR_OPTIONS.length
          ? DEFAULT_OBJECT_COLOR_OPTIONS[index].label
          : color,
      value: color,
    }),
  );
  const defaultCreateObjectColor = controller.newObjectColor;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [didAttemptCreateObject, setDidAttemptCreateObject] = useState(false);
  const [createObjectColor, setCreateObjectColor] = useState(
    defaultCreateObjectColor,
  );
  const createObjectDialogTitleId = useId();
  const createObjectDialogDescriptionId = useId();
  const createObjectInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isCreateDialogOpen) {
      return;
    }

    setCreateObjectColor(defaultCreateObjectColor);
    controller.setNewObjectColor(defaultCreateObjectColor);
    createObjectInputRef.current?.focus();
  }, [defaultCreateObjectColor, isCreateDialogOpen]);

  useEffect(() => {
    if (
      !isCreateDialogOpen ||
      !didAttemptCreateObject ||
      controller.objectPanelError !== null ||
      controller.newObjectLabel.trim().length > 0
    ) {
      return;
    }

    setIsCreateDialogOpen(false);
    setDidAttemptCreateObject(false);
    setCreateObjectColor(defaultCreateObjectColor);
    controller.setNewObjectColor(defaultCreateObjectColor);
  }, [
    defaultCreateObjectColor,
    controller.newObjectLabel,
    controller.objectPanelError,
    didAttemptCreateObject,
    isCreateDialogOpen,
  ]);

  function openCreateObjectDialog() {
    setDidAttemptCreateObject(false);
    setIsCreateDialogOpen(true);
  }

  function closeCreateObjectDialog() {
    setDidAttemptCreateObject(false);
    setIsCreateDialogOpen(false);
    setCreateObjectColor(defaultCreateObjectColor);
    controller.setNewObjectColor(defaultCreateObjectColor);
    if (controller.newObjectLabel.length > 0) {
      controller.setNewObjectLabel("");
    }
  }

  async function handleCreateObjectSubmit() {
    setDidAttemptCreateObject(true);

    try {
      await controller.handleCreateObject(createObjectColor);
    } catch {
      // Controller owns error state.
    }
  }

  return (
    <aside
      aria-label={routeMode ? "Review overview" : "Video list"}
      className="workspace-panel z-10 flex h-full w-72 flex-shrink-0 flex-col border-r border-outline-variant/15 bg-surface-container-low"
    >
      {selectedVideo === null ? (
        <div className="flex flex-1 flex-col px-5 py-5">
          <p className="console-kicker text-xs font-semibold tracking-[0.24em]">
            {routeMode ? "Review route" : "Indexed videos"}
          </p>
          {onBackToLibrary ? (
            <button
              className="ghost-button mt-4 inline-flex items-center self-start border border-white/15 px-4 py-2 text-sm font-medium"
              type="button"
              onClick={onBackToLibrary}
            >
              Back to Library
            </button>
          ) : null}
          <h1
            id="workspace-title"
            className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-slate-50"
          >
            Choose review target
          </h1>
          <p className="console-copy mt-2 text-sm leading-6">
            {routeMode
              ? "Route-owned review workspace"
              : `Canonical exact-frame index: ${String(workspace.reviewState.currentFrameIndex)}`}
          </p>

          <div className="mt-5 space-y-3">
            {workspace.listStatus === "loading" ? (
              <p className="console-copy text-sm leading-6">
                Loading indexed videos...
              </p>
            ) : null}

            {workspace.listStatus === "empty" ? (
              <p className="console-copy text-sm leading-6">
                No indexed videos found yet.
              </p>
            ) : null}

            {workspace.listStatus === "error" ? (
              <p className="text-sm leading-6 text-rose-200">
                {workspace.errorMessage}
              </p>
            ) : null}

            {workspace.listStatus === "ready" ? (
              <ul aria-label="Indexed videos" className="space-y-2">
                {workspace.indexedVideos.map((video) => (
                  <li key={video.id}>
                    <button
                      aria-pressed={workspace.activeVideoId === video.id}
                      className={
                        workspace.activeVideoId === video.id
                          ? "workspace-subpanel flex w-full items-center justify-between border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-left text-sm font-medium text-cyan-50 transition"
                          : "workspace-subpanel flex w-full items-center justify-between border border-white/10 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-slate-900/70"
                      }
                      type="button"
                      onClick={() => {
                        void workspace.selectVideo(video.id);
                      }}
                    >
                      <span>Open {video.display_name}</span>
                      <span
                        aria-hidden="true"
                        className="text-xs uppercase tracking-[0.18em] text-slate-400"
                      >
                        review
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="flex h-12 items-center gap-3 border-b border-outline-variant/15 bg-surface-container-lowest px-4 uppercase">
            {onBackToLibrary ? (
              <button
                aria-label="Back to Library"
                className="inline-flex items-center justify-center p-1 text-on-surface-variant transition-colors duration-150 hover:bg-surface-bright hover:text-on-surface"
                type="button"
                onClick={onBackToLibrary}
              >
                <MaterialSymbolIcon className="text-[18px]" name="arrow_back" />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <h2
                aria-label={`Annotations · Frame ${String(workspace.reviewState.currentFrameIndex)}`}
                className="font-headline text-[11px] font-bold tracking-widest text-on-surface-variant"
              >
                <span aria-hidden="true">Annotations</span>
              </h2>
              <p className="sr-only">
                Annotations · Frame {workspace.reviewState.currentFrameIndex}
              </p>
              <p className="sr-only">Route-owned review workspace</p>
            </div>
            <span className="bg-primary-container/10 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-primary-container">
              {controller.objectSummaries.length} OBJ
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {controller.objectSummaries.map((objectSummary) => {
              const frameAnnotation = currentFrameAnnotationsByObjectId.get(
                objectSummary.id,
              );
              const hasBox =
                Object.hasOwn(
                  savedManualAnnotationsForCurrentFrame,
                  objectSummary.id,
                ) || frameAnnotation?.box_xywh_norm != null;
              const hasMask = frameAnnotation?.mask != null;
              const hasCurrentFrameTruth = hasBox || hasMask;
              const isSelected =
                controller.selectedObjectId === objectSummary.id;

              return (
                <button
                  key={objectSummary.id}
                  aria-pressed={isSelected}
                  className={
                    isSelected
                      ? "group flex w-full items-center gap-2 border-l-2 border-primary-container bg-primary-container/10 px-3 py-2 text-left transition"
                      : "group flex w-full items-center gap-2 border-b border-outline-variant/5 border-l-2 border-transparent px-3 py-2 text-left transition hover:bg-surface-bright"
                  }
                  type="button"
                  onClick={() => {
                    workspace.setSam2SelectedObject(objectSummary.id);
                  }}
                >
                  <MaterialSymbolIcon
                    aria-hidden="true"
                    className={
                      hasCurrentFrameTruth
                        ? isSelected
                          ? "text-[14px] text-primary-container"
                          : "text-[14px] text-on-surface-variant transition-colors group-hover:text-primary-container"
                        : "text-[14px] text-on-surface-variant/40 transition-colors group-hover:text-primary-container"
                    }
                    name={
                      hasCurrentFrameTruth ? "visibility" : "visibility_off"
                    }
                  />
                  <span
                    className={
                      isSelected
                        ? "min-w-0 flex-1 truncate font-['JetBrains_Mono'] text-[11px] font-bold text-primary-container"
                        : hasCurrentFrameTruth
                          ? "min-w-0 flex-1 truncate font-['JetBrains_Mono'] text-[11px] text-on-surface"
                          : "min-w-0 flex-1 truncate font-['JetBrains_Mono'] text-[11px] text-on-surface-variant"
                    }
                  >
                    {objectSummary.label}
                  </span>
                  <span className="sr-only">{objectSummary.id}</span>
                  <span className="sr-only">{hasBox ? "Box" : "—"}</span>
                  <span className="sr-only">{hasMask ? "Mask" : "—"}</span>
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 border border-white/20"
                    style={{ backgroundColor: objectSummary.color }}
                  />
                </button>
              );
            })}
          </div>

          <div className="border-t border-outline-variant/15 bg-surface-container-lowest p-2">
            <label className="sr-only">
              <span>New object label</span>
              <input
                aria-label="New object label"
                type="text"
                value={controller.newObjectLabel}
                onChange={(event) => {
                  controller.setNewObjectLabel(event.target.value);
                }}
              />
            </label>
            <button
              aria-label="Create object"
              className="flex h-8 w-full cursor-pointer items-center justify-center gap-2 border border-outline-variant/30 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant transition-colors duration-150 hover:bg-surface-bright hover:text-on-surface"
              type="button"
              onClick={openCreateObjectDialog}
            >
              <MaterialSymbolIcon className="text-[14px]" name="add" />
              New Object
            </button>
            {!isCreateDialogOpen && controller.objectPanelError !== null ? (
              <p className="mt-2 text-xs leading-5 text-rose-200">
                {controller.objectPanelError}
              </p>
            ) : null}
          </div>

          {isCreateDialogOpen ? (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
              onClick={closeCreateObjectDialog}
            >
              <div
                aria-describedby={createObjectDialogDescriptionId}
                aria-labelledby={createObjectDialogTitleId}
                aria-modal="true"
                className="w-full max-w-sm border border-outline-variant/20 bg-surface-container-low shadow-2xl"
                role="dialog"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="border-b border-outline-variant/15 bg-surface-container-lowest px-4 py-3">
                  <h3
                    className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant"
                    id={createObjectDialogTitleId}
                  >
                    New Object
                  </h3>
                  <p
                    className="mt-1 text-xs text-on-surface-variant"
                    id={createObjectDialogDescriptionId}
                  >
                    Create manifest-backed object for review.
                  </p>
                </div>

                <form
                  className="p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleCreateObjectSubmit();
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                      New object label
                    </span>
                    <input
                      ref={createObjectInputRef}
                      aria-label="New object label"
                      className="border border-outline-variant/20 bg-surface-container-high px-3 py-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:border-primary-container/40"
                      type="text"
                      value={controller.newObjectLabel}
                      onChange={(event) => {
                        controller.setNewObjectLabel(event.target.value);
                      }}
                    />
                  </label>

                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                      Object color
                    </p>
                    <div className="mt-3 grid grid-cols-6 gap-2">
                      {objectColorOptions.map((colorOption) => {
                        const isSelected =
                          createObjectColor === colorOption.value;

                        return (
                          <label
                            className="cursor-pointer"
                            key={colorOption.value}
                          >
                            <input
                              aria-label={`Object color ${colorOption.label}`}
                              checked={isSelected}
                              className="sr-only"
                              name="new-object-color"
                              type="radio"
                              value={colorOption.value}
                              onChange={() => {
                                setCreateObjectColor(colorOption.value);
                                controller.setNewObjectColor(colorOption.value);
                              }}
                            />
                            <span
                              aria-hidden="true"
                              className={
                                isSelected
                                  ? "flex h-9 items-center justify-center border border-white/20 text-surface-container-lowest"
                                  : "block h-9 border border-white/20"
                              }
                              style={{ backgroundColor: colorOption.value }}
                            >
                              {isSelected ? (
                                <MaterialSymbolIcon
                                  className="text-[16px]"
                                  name="check"
                                />
                              ) : null}
                            </span>
                            <span className="sr-only">{colorOption.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {controller.objectPanelError !== null ? (
                    <p className="mt-3 text-sm leading-6 text-rose-200">
                      {controller.objectPanelError}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      className="inline-flex cursor-pointer items-center justify-center border border-outline-variant/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant transition-colors duration-150 hover:bg-surface-bright hover:text-on-surface"
                      type="button"
                      onClick={closeCreateObjectDialog}
                    >
                      Cancel
                    </button>
                    <button
                      aria-label="Create object"
                      className="inline-flex cursor-pointer items-center justify-center border border-primary-container/30 bg-primary-container/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-container disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                      disabled={controller.newObjectLabel.trim().length === 0}
                      type="submit"
                    >
                      Create Object
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </>
      )}
    </aside>
  );
}
