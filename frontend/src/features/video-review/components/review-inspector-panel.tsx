import { useEffect, useRef } from "react";

import { MaterialSymbolIcon } from "../../../shared/ui/material-symbol-icon";
import type { LiveReviewController } from "../hooks/use-live-review-controller";
import type { VideoReviewWorkspace } from "../workspace";

export function ReviewInspectorPanel({
  controller,
  workspace,
}: {
  controller: LiveReviewController;
  workspace: VideoReviewWorkspace;
}) {
  const selectedObjectId = controller.selectedObjectId.trim();
  const selectedObjectLabel =
    controller.selectedObjectReviewSummary?.label ??
    controller.selectedObjectSummary?.label ??
    "No object selected";
  const selectedObjectSummary = controller.selectedObjectReviewSummary;
  const selectedObjectSummaryStatus =
    controller.selectedObjectReviewSummaryStatus;
  const selectedObjectSummaryMessage = formatSelectedObjectSummaryMessage({
    error: controller.selectedObjectReviewSummaryError,
    hasSelectedObject: selectedObjectId.length > 0,
    status: selectedObjectSummaryStatus,
  });
  const rememberedMaskOpacityRef = useRef(
    controller.maskOpacityPercent > 0 ? controller.maskOpacityPercent : 58,
  );

  useEffect(() => {
    if (controller.maskOpacityPercent > 0) {
      rememberedMaskOpacityRef.current = controller.maskOpacityPercent;
    }
  }, [controller.maskOpacityPercent]);

  function handleToggleMaskVisibility() {
    if (controller.maskOpacityPercent === 0) {
      controller.setMaskOpacityPercent(rememberedMaskOpacityRef.current || 58);
      return;
    }

    rememberedMaskOpacityRef.current = controller.maskOpacityPercent;
    controller.setMaskOpacityPercent(0);
  }

  function handlePrepareBoxEdit() {
    controller.pausePlaybackContext();
  }

  return (
    <aside
      aria-label="Selected object inspector"
      className="workspace-panel z-10 flex h-full w-80 flex-shrink-0 flex-col overflow-y-auto overflow-x-hidden border-l border-outline-variant/20 bg-surface-container-low"
    >
      {workspace.selectionStatus === "loading" ? (
        <p className="console-copy px-4 py-4 text-sm leading-6">
          Loading selected video...
        </p>
      ) : null}

      {controller.selectedVideo === null ? (
        <div className="px-4 py-4">
          <p className="console-copy text-sm leading-6">
            Pick a video from indexed list to open review workspace.
          </p>
          <p className="console-copy mt-3 text-sm leading-6">
            Selection uses backend detail fetch, not list payload as source of
            truth.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-1">
            <SectionHeader icon="info" title="Selected Object" />
            <div className="flex flex-col gap-3 p-4 font-['JetBrains_Mono'] text-[11px]">
              <InfoRow
                label="ID"
                value={selectedObjectId.length > 0 ? selectedObjectId : "None"}
                valueClassName="text-primary-container font-bold text-[13px]"
              />
              <InfoRow
                label="Class"
                value={selectedObjectLabel}
                valueClassName="text-on-surface"
              />
              <InfoRow
                label="Confidence"
                value={formatSelectedObjectConfidence({
                  confidence: selectedObjectSummary?.mask_confidence ?? null,
                  status: selectedObjectSummaryStatus,
                })}
                valueClassName="text-tertiary-fixed-dim"
              />
              <InfoRow
                label="BBox [x1,y1,x2,y2]"
                value={formatSelectedObjectSummaryBox({
                  bboxXyxyPx: selectedObjectSummary?.bbox_xyxy_px ?? null,
                  status: selectedObjectSummaryStatus,
                })}
                valueClassName="text-on-surface"
              />

              <div className="mt-1 border border-outline-variant/15 bg-surface-container-lowest px-3 py-2">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider">
                  <span className="text-on-surface-variant">Track Summary</span>
                  <span className="font-bold text-primary-container">
                    {formatSelectedRangeLabel(controller.selectedRange)}
                  </span>
                </div>
                <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                  <MetricTile
                    label="Manual"
                    value={formatSelectedObjectSummaryMetric({
                      status: selectedObjectSummaryStatus,
                      value:
                        selectedObjectSummary?.track_summary.manual ?? null,
                    })}
                    valueClassName="font-bold text-tertiary-fixed-dim"
                  />
                  <MetricTile
                    label="Missing"
                    value={formatSelectedObjectSummaryMetric({
                      status: selectedObjectSummaryStatus,
                      value:
                        selectedObjectSummary?.track_summary.missing ?? null,
                    })}
                    valueClassName="font-bold text-error"
                  />
                  <MetricTile
                    label="Propagated"
                    value={formatSelectedObjectSummaryMetric({
                      status: selectedObjectSummaryStatus,
                      value:
                        selectedObjectSummary?.track_summary.propagated ?? null,
                    })}
                    valueClassName="font-bold text-primary-container"
                  />
                </div>
                {selectedObjectSummaryMessage !== null ? (
                  <p
                    className={`text-sm leading-6 ${
                      selectedObjectSummaryStatus === "error"
                        ? "text-rose-200"
                        : "text-slate-300"
                    }`}
                  >
                    {selectedObjectSummaryMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mb-1">
            <SectionHeader icon="crop_din" title="Box Tools" />
            <div className="grid grid-cols-2 gap-2 p-4">
              <ToolButton
                icon="edit"
                label="Edit Box"
                tone="primary"
                onClick={handlePrepareBoxEdit}
              />
              <ToolButton
                icon="add_box"
                label="Draw"
                onClick={handlePrepareBoxEdit}
              />
              <ToolButton
                ariaLabel="Delete saved box"
                className="col-span-2 mt-1"
                disabled={
                  !controller.canMutateCurrentFrame ||
                  controller.selectedSavedManualAnnotation === null
                }
                icon="delete"
                label="Delete Box"
                tone="danger"
                onClick={controller.handleDeleteManualBox}
              />
            </div>
            <div className="px-4 pb-4">
              <p className="text-sm leading-6 text-slate-300">
                Draw and edit happen directly on paused review stage.
              </p>
              {controller.manualBoxError !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {controller.manualBoxError}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Delete selected object track and all linked frame annotations.
              </p>
              <button
                aria-label="Delete object track"
                className="mt-3 inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-[10px] font-bold uppercase tracking-wider text-error transition-colors hover:bg-error-container/20 disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
                disabled={!controller.canDeleteObjectTrack}
                type="button"
                onClick={controller.handleDeleteObjectTrack}
              >
                Delete Track
              </button>
              {controller.objectDeleteError !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {controller.objectDeleteError}
                </p>
              ) : null}
            </div>
          </section>

          <section className="mb-1">
            <SectionHeader icon="polyline" title="Mask Tools" />
            <div className="flex flex-col gap-2 p-4">
              <ToolButton
                icon="visibility"
                label="Toggle Visibility"
                onClick={handleToggleMaskVisibility}
              />
              <ToolButton
                ariaLabel={
                  controller.isMaskRefineActive
                    ? "Cancel correction"
                    : "Correct mask"
                }
                disabled={!controller.canStartMaskRefine}
                icon="brush"
                label={
                  controller.isMaskRefineActive
                    ? "Cancel correction"
                    : "Correct mask"
                }
                onClick={controller.handleMaskRefineToggle}
              />
              <ToolButton
                ariaLabel="Clear frame mask"
                disabled={!controller.canDeleteFrameMask}
                icon="delete_sweep"
                label="Delete Mask"
                tone="danger"
                onClick={controller.handleDeleteFrameMask}
              />
            </div>
            <div className="px-4 pb-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  Mask opacity
                </span>
                <input
                  aria-label="Mask opacity"
                  className="accent-cyan-300"
                  max={100}
                  min={0}
                  step={1}
                  type="range"
                  value={controller.maskOpacityPercent}
                  onChange={(event) => {
                    controller.setMaskOpacityPercent(
                      Number(event.target.value),
                    );
                  }}
                />
              </label>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {controller.maskOpacityPercent}%
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Remove mask on this frame only. Keep object and other frames.
              </p>
              {controller.selectedFrameAnnotation?.mask == null ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Selected object has no mask on current frame.
                </p>
              ) : null}
              {!controller.canStartMaskRefine ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Pause playback to correct persisted mask on exact frame.
                </p>
              ) : null}
              {controller.isPlaybackActive ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Pause playback before mutating exact frame data.
                </p>
              ) : null}
              {controller.isMaskRefineActive ? (
                <div className="mt-4 border border-outline-variant/15 bg-surface-container-lowest px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                      Correction Brush
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                      {controller.refinePositivePoints.length +
                        controller.refineNegativePoints.length}{" "}
                      points
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ToolButton
                      ariaLabel="Add brush"
                      ariaPressed={controller.refineBrushMode === "add"}
                      label="Add brush"
                      onClick={() => {
                        controller.handleRefineBrushModeChange("add");
                      }}
                    />
                    <ToolButton
                      ariaLabel="Erase brush"
                      ariaPressed={controller.refineBrushMode === "erase"}
                      label="Erase brush"
                      onClick={() => {
                        controller.handleRefineBrushModeChange("erase");
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {controller.refineBrushMode === "erase"
                      ? "Erase prompts for same-frame refine."
                      : "Add prompts for same-frame refine."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      aria-label="Clear strokes"
                      className="inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-bright disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
                      disabled={
                        controller.refinePositivePoints.length +
                          controller.refineNegativePoints.length ===
                        0
                      }
                      type="button"
                      onClick={controller.handleClearRefinePoints}
                    >
                      Clear strokes
                    </button>
                    <button
                      aria-label="Save corrected mask"
                      className="inline-flex h-8 items-center justify-center border border-primary-container/30 bg-primary-container text-[10px] font-bold uppercase tracking-wider text-on-primary-fixed transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:bg-surface-container-high disabled:text-on-surface-variant"
                      disabled={!controller.canSaveMaskRefine}
                      type="button"
                      onClick={controller.handleSaveRefinedMask}
                    >
                      Save corrected mask
                    </button>
                  </div>
                </div>
              ) : null}
              {controller.maskCleanupError !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {controller.maskCleanupError}
                </p>
              ) : null}
              {controller.refineValidationError !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {controller.refineValidationError}
                </p>
              ) : null}
              {controller.refineErrorMessage !== null ? (
                <p className="mt-3 text-sm leading-6 text-rose-200">
                  {controller.refineErrorMessage}
                </p>
              ) : null}
              {controller.refineStatus === "loading" ? (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Saving corrected mask...
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Remove selected object masks on all frames. Keep object track
                and boxes.
              </p>
              <button
                aria-label="Clear object masks"
                className="mt-3 inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-[10px] font-bold uppercase tracking-wider text-error transition-colors hover:bg-error-container/20 disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
                disabled={!controller.canDeleteObjectMasks}
                type="button"
                onClick={controller.handleDeleteObjectMasks}
              >
                Clear Object Masks
              </button>
            </div>
          </section>

          <section className="mb-1 flex-1">
            <SectionHeader icon="auto_awesome" title="SAM2 Automation" />
            <div className="flex flex-col gap-3 p-4">
              <button
                aria-label="Run SAM2"
                className="inline-flex h-10 items-center justify-center gap-2 border border-outline-variant/30 bg-surface-container-highest font-headline text-[11px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-bright disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
                disabled={
                  !controller.canMutateCurrentFrame ||
                  controller.sam2DraftBox === null ||
                  controller.selectedObjectId.trim().length === 0 ||
                  workspace.reviewState.sam2.prompt.status === "loading"
                }
                type="button"
                onClick={controller.handleRunSam2}
              >
                <MaterialSymbolIcon
                  className="text-[16px] text-tertiary-fixed-dim"
                  name="magic_button"
                />
                Generate Mask
              </button>
              <div className="border border-outline-variant/15 bg-surface-container-lowest p-3">
                <div className="mb-2 text-[9px] uppercase tracking-wider text-on-surface-variant">
                  Tracking range
                </div>
                <div className="mb-3 flex items-center justify-between font-['JetBrains_Mono'] text-[10px]">
                  <span className="bg-surface-container px-2 py-1">
                    {controller.selectedRange?.startFrameIdx ??
                      controller.currentFrameIndex}
                  </span>
                  <MaterialSymbolIcon
                    className="text-[12px] text-outline"
                    name="arrow_forward"
                  />
                  <span className="bg-surface-container px-2 py-1">
                    {controller.selectedRange?.endFrameIdx ??
                      controller.currentFrameIndex}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <InfoAction label="Direction">
                    {controller.propagationDirection}
                  </InfoAction>
                  <InfoAction label="Boundary">
                    {controller.propagationEndFrameValue}
                  </InfoAction>
                </div>
                <button
                  aria-label="Start propagation"
                  className="relative mt-2 inline-flex h-8 w-full items-center justify-center gap-2 overflow-hidden bg-primary-container font-headline text-[11px] font-bold uppercase tracking-wider text-on-primary-fixed transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant"
                  disabled={!controller.canStartPropagation}
                  type="button"
                  onClick={controller.handleStartPropagation}
                >
                  <MaterialSymbolIcon
                    className="text-[16px]"
                    name="fast_forward"
                  />
                  Propagate
                </button>
              </div>

              {workspace.reviewState.sam2.session.sessionId === null ? (
                <p className="text-sm leading-6 text-slate-300">
                  Run SAM2 on current object before propagation.
                </p>
              ) : null}
              {workspace.reviewState.sam2.prompt.status === "loading" ? (
                <p className="text-sm leading-6 text-slate-300">
                  Running SAM2...
                </p>
              ) : null}
              {workspace.reviewState.sam2.prompt.errorMessage !== null ? (
                <p className="text-sm leading-6 text-rose-200">
                  {workspace.reviewState.sam2.prompt.errorMessage}
                </p>
              ) : null}
              {controller.propagationStatus === "loading" &&
              controller.propagationJob === null ? (
                <p className="text-sm leading-6 text-slate-300">
                  Starting propagation...
                </p>
              ) : null}
              {workspace.reviewState.sam2.propagation.errorMessage !== null ? (
                <p className="text-sm leading-6 text-rose-200">
                  {workspace.reviewState.sam2.propagation.errorMessage}
                </p>
              ) : null}
              {controller.propagationJob !== null ? (
                <div className="border border-outline-variant/15 bg-surface-container-lowest p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Propagation job {controller.propagationJob.status}
                    </p>
                    <button
                      className="inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-bright disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
                      disabled={!controller.canCancelPropagation}
                      type="button"
                      onClick={() => {
                        void workspace.cancelSam2PropagationJob();
                      }}
                    >
                      Cancel propagation
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Progress {controller.propagationJob.progressCurrent} /{" "}
                    {controller.propagationJob.progressTotal}
                  </p>
                  {controller.propagatedFrameIndices.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm leading-6 text-slate-300">
                        Saved propagated frames
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {controller.propagatedFrameIndices.map((frameIdx) => (
                          <button
                            aria-label={`Open propagated frame ${String(frameIdx)}`}
                            className="inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-bright"
                            key={frameIdx}
                            type="button"
                            onClick={() => {
                              controller.pausePlaybackContext();
                              void workspace.loadExactFrame(frameIdx);
                            }}
                          >
                            Open propagated {frameIdx}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <div className="mt-auto border-t border-outline-variant/20 bg-surface-container p-4">
            <div className="grid grid-cols-1 gap-2">
              <ExportButton
                disabled={!controller.canCreateExport}
                icon="download"
                label="Export"
                onClick={controller.handleCreateExport}
              />
            </div>
            <div className="mt-3 font-['JetBrains_Mono'] text-[10px] leading-relaxed text-on-surface-variant">
              Export uses backend-decoded frames as source of truth.
              <br />
              Output: one zip with annotations.json + masks/*.png
            </div>
            {controller.exportRequestStatus === "loading" ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Building export artifact...
              </p>
            ) : null}
            {controller.exportDownloadUrl ? (
              <a
                className="mt-3 inline-flex h-8 items-center justify-center border border-outline-variant/30 px-3 text-[10px] font-bold uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-bright"
                download
                href={controller.exportDownloadUrl}
              >
                Download latest export
              </a>
            ) : controller.currentReviewState === "exported" ? (
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Current export is still fresh. Run export again in this session
                to get a new download link.
              </p>
            ) : null}
            {controller.exportError !== null ? (
              <p className="mt-3 text-sm leading-6 text-rose-200">
                {controller.exportError}
              </p>
            ) : null}
          </div>
        </>
      )}

      {workspace.errorMessage !== null ? (
        <p className="px-4 py-4 text-sm leading-6 text-rose-200">
          {workspace.errorMessage}
        </p>
      ) : null}
    </aside>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 border-y border-outline-variant/10 bg-surface-container p-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      <MaterialSymbolIcon className="text-[14px]" name={icon} />
      {title}
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-end justify-between border-b border-outline-variant/15 pb-1">
      <span className="text-[10px] text-on-surface-variant">{label}</span>
      <span className={valueClassName ?? "text-on-surface"}>{value}</span>
    </div>
  );
}

function MetricTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="border border-outline-variant/10 bg-surface-container px-2 py-1">
      <div className="text-[9px] uppercase text-on-surface-variant">
        {label}
      </div>
      <div className={valueClassName ?? "font-bold text-on-surface"}>
        {value}
      </div>
    </div>
  );
}

function ToolButton({
  ariaLabel,
  ariaPressed,
  className,
  disabled = false,
  icon,
  label,
  onClick,
  tone = "default",
}: {
  ariaLabel?: string;
  ariaPressed?: boolean;
  className?: string;
  disabled?: boolean;
  icon?: string;
  label: string;
  onClick: () => void;
  tone?: "danger" | "default" | "primary";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary border-primary/30"
      : tone === "danger"
        ? "text-error border-outline-variant/30 hover:bg-error-container/20"
        : "text-on-surface border-outline-variant/30 hover:bg-surface-bright";

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`inline-flex h-8 items-center justify-center gap-2 border font-headline text-[10px] font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant ${toneClass}${className ? ` ${className}` : ""}`}
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {icon ? <MaterialSymbolIcon className="text-[14px]" name={icon} /> : null}
      {label}
    </button>
  );
}

function InfoAction({ children, label }: { children: string; label: string }) {
  return (
    <div className="border border-outline-variant/10 bg-surface-container px-2 py-1">
      <div className="text-[9px] uppercase text-on-surface-variant">
        {label}
      </div>
      <div className="mt-1 text-on-surface">{children}</div>
    </div>
  );
}

function ExportButton({
  disabled,
  icon,
  label,
  onClick,
}: {
  disabled: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-10 items-center justify-center gap-2 border border-outline-variant/50 bg-surface-container-highest font-headline text-[10px] font-bold uppercase tracking-wider text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:bg-surface-bright disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:text-on-surface-variant"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      <MaterialSymbolIcon className="text-[16px]" name={icon} />
      {label}
    </button>
  );
}

function formatSelectedObjectConfidence(options: {
  confidence: number | null;
  status: "error" | "idle" | "loading" | "ready";
}): string {
  if (options.status === "loading") {
    return "Loading...";
  }

  if (options.status !== "ready" || options.confidence === null) {
    return "Unavailable";
  }

  return options.confidence.toFixed(2);
}

function formatSelectedObjectSummaryBox(options: {
  bboxXyxyPx: readonly [number, number, number, number] | null;
  status: "error" | "idle" | "loading" | "ready";
}): string {
  if (options.status === "loading") {
    return "Loading...";
  }

  if (options.status !== "ready" || options.bboxXyxyPx === null) {
    return "Unavailable";
  }

  const [x1, y1, x2, y2] = options.bboxXyxyPx;

  return `[${String(x1)}, ${String(y1)}, ${String(x2)}, ${String(y2)}]`;
}

function formatSelectedObjectSummaryMetric(options: {
  status: "error" | "idle" | "loading" | "ready";
  value: number | null;
}): string {
  if (options.status === "loading") {
    return "Loading...";
  }

  if (options.status !== "ready" || options.value === null) {
    return "Unavailable";
  }

  return String(options.value);
}

function formatSelectedRangeLabel(
  selectedRange: LiveReviewController["selectedRange"],
): string {
  if (selectedRange === null) {
    return "Range invalid";
  }

  return `${String(selectedRange.startFrameIdx)}-${String(
    selectedRange.endFrameIdx,
  )}`;
}

function formatSelectedObjectSummaryMessage(options: {
  error: string | null;
  hasSelectedObject: boolean;
  status: "error" | "idle" | "loading" | "ready";
}): string | null {
  if (options.status === "loading") {
    return "Loading selected-range summary...";
  }

  if (options.status === "error") {
    return options.error ?? "Unable to load selected-range summary.";
  }

  if (options.status === "idle" && !options.hasSelectedObject) {
    return "Select object to load selected-range summary.";
  }

  return null;
}
