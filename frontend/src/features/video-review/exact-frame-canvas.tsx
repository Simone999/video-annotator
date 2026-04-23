import { useRef, useState, type PointerEvent } from "react";

import type { Sam2DraftBox } from "./state";

export type ExactFrameCanvasAnnotation = {
  objectId: string;
  maskUrl: string | null;
  box: Sam2DraftBox | null;
  isSelected: boolean;
};

type ExactFrameCanvasProps = {
  alt: string;
  annotations: readonly ExactFrameCanvasAnnotation[];
  draftBox: Sam2DraftBox | null;
  editableAnnotation: {
    objectId: string;
    box: Sam2DraftBox;
  } | null;
  imageUrl: string;
  interactionMode?: "box" | "refine";
  maskOpacity: number;
  onAnnotationTransformCommit?: (box: Sam2DraftBox) => void;
  onDraftBoxCommit?: (box: Sam2DraftBox) => void;
  onDraftBoxChange: (box: Sam2DraftBox | null) => void;
  onRefineStrokeCommit?: (
    points: readonly {
      x: number;
      y: number;
    }[],
  ) => void;
  refineBrushMode?: "add" | "erase";
  refineNegativePoints?: readonly {
    x: number;
    y: number;
  }[];
  refinePositivePoints?: readonly {
    x: number;
    y: number;
  }[];
};

type PointerPoint = {
  x: number;
  y: number;
};

type CanvasInteraction =
  | {
      type: "draw";
      start: PointerPoint;
    }
  | {
      type: "refine";
      points: PointerPoint[];
    }
  | {
      type: "move";
      box: Sam2DraftBox;
      offset: PointerPoint;
    }
  | {
      type: "resize";
      anchor: PointerPoint;
    };

export function ExactFrameCanvas(props: ExactFrameCanvasProps) {
  const interactionRef = useRef<CanvasInteraction | null>(null);
  const [interactionPreviewBox, setInteractionPreviewBox] =
    useState<Sam2DraftBox | null>(null);
  const interactionPreviewBoxRef = useRef<Sam2DraftBox | null>(null);
  const interactionMode = props.interactionMode ?? "box";

  function updateInteraction(nextInteraction: CanvasInteraction | null) {
    interactionRef.current = nextInteraction;
  }

  function updateInteractionPreviewBox(nextBox: Sam2DraftBox | null) {
    interactionPreviewBoxRef.current = nextBox;
    setInteractionPreviewBox(nextBox);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    const point = getPointerPoint(event);
    if (point === null) {
      return;
    }

    if (interactionMode === "refine") {
      updateInteraction({
        points: [point],
        type: "refine",
      });
      updateInteractionPreviewBox(null);
      props.onDraftBoxChange(null);
      return;
    }

    if (
      props.editableAnnotation !== null &&
      pointInsideBox(point, props.editableAnnotation.box)
    ) {
      updateInteraction({
        box: props.editableAnnotation.box,
        offset: {
          x: point.x - props.editableAnnotation.box.x,
          y: point.y - props.editableAnnotation.box.y,
        },
        type: "move",
      });
      updateInteractionPreviewBox(props.editableAnnotation.box);
      props.onDraftBoxChange(null);
      return;
    }

    updateInteraction({
      start: point,
      type: "draw",
    });
    updateInteractionPreviewBox(null);
    props.onDraftBoxChange(null);
  }

  function handleResizeHandlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
  ) {
    if (
      event.button !== 0 ||
      props.editableAnnotation === null ||
      interactionMode === "refine"
    ) {
      return;
    }

    event.stopPropagation();
    updateInteraction({
      anchor: {
        x: props.editableAnnotation.box.x,
        y: props.editableAnnotation.box.y,
      },
      type: "resize",
    });
    updateInteractionPreviewBox(props.editableAnnotation.box);
    props.onDraftBoxChange(null);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    if (interaction === null) {
      return;
    }

    const point = getPointerPoint(event);
    if (point === null) {
      return;
    }

    switch (interaction.type) {
      case "draw":
        props.onDraftBoxChange(normalizeDraftBox(interaction.start, point));
        break;
      case "refine":
        updateInteraction(appendRefinePointToInteraction(interaction, point));
        break;
      case "move":
        updateInteractionPreviewBox(
          moveBox({
            box: interaction.box,
            offset: interaction.offset,
            point,
          }),
        );
        break;
      case "resize":
        updateInteractionPreviewBox(
          normalizeDraftBox(interaction.anchor, point),
        );
        break;
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const interaction = interactionRef.current;
    if (interaction === null) {
      return;
    }

    const point = getPointerPoint(event);
    updateInteraction(null);
    updateInteractionPreviewBox(null);
    if (point === null) {
      props.onDraftBoxChange(null);
      return;
    }

    if (interaction.type === "draw") {
      const draftBox = normalizeDraftBox(interaction.start, point);
      props.onDraftBoxChange(draftBox);
      if (draftBox !== null) {
        props.onDraftBoxCommit?.(draftBox);
      }
      return;
    }

    if (interaction.type === "refine") {
      const points = appendRefinePointToInteraction(interaction, point).points;
      props.onDraftBoxChange(null);
      if (points.length > 0) {
        props.onRefineStrokeCommit?.(points);
      }
      return;
    }

    const nextAnnotationBox =
      interaction.type === "move"
        ? moveBox({
            box: interaction.box,
            offset: interaction.offset,
            point,
          })
        : normalizeDraftBox(interaction.anchor, point);
    props.onDraftBoxChange(null);
    if (nextAnnotationBox !== null) {
      props.onAnnotationTransformCommit?.(nextAnnotationBox);
    }
  }

  return (
    <div
      aria-label="Exact frame canvas"
      className="exact-frame-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <img
        alt={props.alt}
        className="exact-frame-image"
        draggable={false}
        src={props.imageUrl}
      />
      {props.annotations.map((annotation) => {
        const annotationBox =
          annotation.objectId === props.editableAnnotation?.objectId &&
          interactionPreviewBox !== null
            ? interactionPreviewBox
            : annotation.box;

        return (
          <div
            key={annotation.objectId}
            className="exact-frame-overlay exact-frame-overlay--annotation"
          >
            {annotation.maskUrl !== null ? (
              <img
                alt={`SAM2 mask for ${annotation.objectId}`}
                className={
                  annotation.isSelected
                    ? "exact-frame-mask exact-frame-mask--selected"
                    : "exact-frame-mask"
                }
                src={annotation.maskUrl}
                style={{ opacity: props.maskOpacity }}
              />
            ) : null}
            {annotationBox !== null ? (
              <div
                aria-label={`Saved annotation box for ${annotation.objectId}`}
                className={
                  annotation.isSelected
                    ? "exact-frame-box exact-frame-box--annotation exact-frame-box--selected"
                    : "exact-frame-box exact-frame-box--annotation"
                }
                style={boxStyle(annotationBox)}
              />
            ) : null}
            {annotation.objectId === props.editableAnnotation?.objectId &&
            annotationBox !== null ? (
              <button
                aria-label={`Resize saved annotation box for ${annotation.objectId}`}
                className="exact-frame-box-handle"
                style={resizeHandleStyle(annotationBox)}
                type="button"
                onPointerDown={handleResizeHandlePointerDown}
              />
            ) : null}
          </div>
        );
      })}
      {props.draftBox !== null ? (
        <div className="exact-frame-overlay">
          <div
            className="exact-frame-box exact-frame-box--draft"
            style={boxStyle(props.draftBox)}
          />
        </div>
      ) : null}
      {props.refinePositivePoints?.map((point, index) => (
        <div
          key={`refine-add-${String(index)}`}
          className="exact-frame-overlay"
        >
          <div
            aria-hidden="true"
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950/80 bg-cyan-300"
            style={pointStyle(point)}
          />
        </div>
      ))}
      {props.refineNegativePoints?.map((point, index) => (
        <div
          key={`refine-erase-${String(index)}`}
          className="exact-frame-overlay"
        >
          <div
            aria-hidden="true"
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950/80 bg-rose-300"
            style={pointStyle(point)}
          />
        </div>
      ))}
      {interactionMode === "refine" ? (
        <div className="exact-frame-overlay">
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
            {props.refineBrushMode === "erase" ? "Erase brush" : "Add brush"}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function getPointerPoint(
  event: PointerEvent<HTMLDivElement>,
): PointerPoint | null {
  const bounds = event.currentTarget.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return null;
  }

  return {
    x: clamp((event.clientX - bounds.left) / bounds.width),
    y: clamp((event.clientY - bounds.top) / bounds.height),
  };
}

export function moveBox(options: {
  box: Sam2DraftBox;
  offset: PointerPoint;
  point: PointerPoint;
}): Sam2DraftBox {
  return {
    h: options.box.h,
    w: options.box.w,
    x: clampToRange(options.point.x - options.offset.x, 0, 1 - options.box.w),
    y: clampToRange(options.point.y - options.offset.y, 0, 1 - options.box.h),
  };
}

export function normalizeDraftBox(
  start: PointerPoint,
  end: PointerPoint,
): Sam2DraftBox | null {
  const box = {
    h: Math.abs(end.y - start.y),
    w: Math.abs(end.x - start.x),
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
  };
  if (box.w <= 0 || box.h <= 0) {
    return null;
  }

  return box;
}

function boxStyle(box: Sam2DraftBox) {
  return {
    height: `${String(box.h * 100)}%`,
    left: `${String(box.x * 100)}%`,
    top: `${String(box.y * 100)}%`,
    width: `${String(box.w * 100)}%`,
  };
}

function resizeHandleStyle(box: Sam2DraftBox) {
  return {
    left: `calc(${String((box.x + box.w) * 100)}% - 0.5rem)`,
    top: `calc(${String((box.y + box.h) * 100)}% - 0.5rem)`,
  };
}

function pointStyle(point: PointerPoint) {
  return {
    left: `${String(point.x * 100)}%`,
    top: `${String(point.y * 100)}%`,
  };
}

export function pointInsideBox(
  point: PointerPoint,
  box: Sam2DraftBox,
): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.w &&
    point.y >= box.y &&
    point.y <= box.y + box.h
  );
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function appendRefinePointToInteraction(
  interaction: Extract<CanvasInteraction, { type: "refine" }>,
  point: PointerPoint,
): Extract<CanvasInteraction, { type: "refine" }> {
  const lastPoint = interaction.points.at(-1) ?? null;
  if (lastPoint !== null && distanceBetweenPoints(lastPoint, point) < 0.06) {
    return interaction;
  }

  return {
    points: [...interaction.points, point],
    type: "refine",
  };
}

function distanceBetweenPoints(
  left: PointerPoint,
  right: PointerPoint,
): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}
