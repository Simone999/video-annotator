import { useState, type PointerEvent } from "react";

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
  imageUrl: string;
  onDraftBoxCommit?: (box: Sam2DraftBox) => void;
  onDraftBoxChange: (box: Sam2DraftBox | null) => void;
};

type PointerPoint = {
  x: number;
  y: number;
};

export function ExactFrameCanvas(props: ExactFrameCanvasProps) {
  const [dragStart, setDragStart] = useState<PointerPoint | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    const point = getPointerPoint(event);
    if (point === null) {
      return;
    }

    setDragStart(point);
    props.onDraftBoxChange(null);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStart === null) {
      return;
    }

    const point = getPointerPoint(event);
    if (point === null) {
      return;
    }

    props.onDraftBoxChange(normalizeDraftBox(dragStart, point));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStart === null) {
      return;
    }

    const point = getPointerPoint(event);
    setDragStart(null);
    if (point === null) {
      props.onDraftBoxChange(null);
      return;
    }

    const draftBox = normalizeDraftBox(dragStart, point);
    props.onDraftBoxChange(draftBox);
    if (draftBox !== null) {
      props.onDraftBoxCommit?.(draftBox);
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
      <img alt={props.alt} className="exact-frame-image" src={props.imageUrl} />
      {props.annotations.map((annotation) => (
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
            />
          ) : null}
          {annotation.box !== null ? (
            <div
              aria-label={`Saved annotation box for ${annotation.objectId}`}
              className={
                annotation.isSelected
                  ? "exact-frame-box exact-frame-box--annotation exact-frame-box--selected"
                  : "exact-frame-box exact-frame-box--annotation"
              }
              style={boxStyle(annotation.box)}
            />
          ) : null}
        </div>
      ))}
      {props.draftBox !== null ? (
        <div className="exact-frame-overlay">
          <div
            className="exact-frame-box exact-frame-box--draft"
            style={boxStyle(props.draftBox)}
          />
        </div>
      ) : null}
    </div>
  );
}

function getPointerPoint(
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

function normalizeDraftBox(
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

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
