// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Sam2DraftBox } from "../../../src/features/video-review/state";
import {
  appendRefinePointToInteraction,
  ExactFrameCanvas,
  moveBox,
  normalizeDraftBox,
  pointInsideBox,
} from "../../../src/features/video-review/exact-frame-canvas";

describe("ExactFrameCanvas", () => {
  afterEach(() => {
    cleanup();
  });

  it("commits sampled refine stroke points in refine mode", () => {
    const onDraftBoxChange = vi.fn();
    const onRefineStrokeCommit = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[]}
        draftBox={null}
        editableAnnotation={null}
        imageUrl="blob:frame-7"
        interactionMode="refine"
        maskOpacity={0.58}
        onDraftBoxChange={onDraftBoxChange}
        onRefineStrokeCommit={onRefineStrokeCommit}
        refineBrushMode="erase"
        refineNegativePoints={[{ x: 0.25, y: 0.3 }]}
        refinePositivePoints={[{ x: 0.55, y: 0.6 }]}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 100,
      clientY: 60,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(canvas, {
      buttons: 1,
      clientX: 150,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 150,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(onDraftBoxChange).toHaveBeenCalledWith(null);
    expect(onRefineStrokeCommit).toHaveBeenCalledWith([
      { x: 0.25, y: 0.3 },
      { x: 0.375, y: 0.4 },
    ]);
    expect(screen.getByAltText("Exact frame 7")).toHaveAttribute(
      "draggable",
      "false",
    );
    expect(screen.getByText("Erase brush")).toBeInTheDocument();
  });

  it("does not start interactions when canvas bounds are invalid", () => {
    const onDraftBoxChange = vi.fn();
    const onRefineStrokeCommit = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[]}
        draftBox={null}
        editableAnnotation={null}
        imageUrl="blob:frame-7"
        interactionMode="refine"
        maskOpacity={0.58}
        onDraftBoxChange={onDraftBoxChange}
        onRefineStrokeCommit={onRefineStrokeCommit}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 0, width: 0, x: 0, y: 0 });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(onDraftBoxChange).not.toHaveBeenCalled();
    expect(onRefineStrokeCommit).not.toHaveBeenCalled();
  });

  it("clears zero-area draft boxes instead of committing them", () => {
    const onDraftBoxChange = vi.fn();
    const onDraftBoxCommit = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[]}
        draftBox={null}
        editableAnnotation={null}
        imageUrl="blob:frame-7"
        maskOpacity={0.58}
        onDraftBoxChange={onDraftBoxChange}
        onDraftBoxCommit={onDraftBoxCommit}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 120,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 120,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(onDraftBoxChange).toHaveBeenLastCalledWith(null);
    expect(onDraftBoxCommit).not.toHaveBeenCalled();
  });

  it("moves editable annotations and renders selected overlays", () => {
    const onAnnotationTransformCommit = vi.fn();
    const onDraftBoxChange = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[
          {
            box: {
              h: 0.2,
              w: 0.3,
              x: 0.1,
              y: 0.15,
            },
            isSelected: true,
            maskUrl: "blob:mask-selected",
            objectId: "object-1",
          },
          {
            box: null,
            isSelected: false,
            maskUrl: null,
            objectId: "object-2",
          },
        ]}
        draftBox={null}
        editableAnnotation={{
          box: {
            h: 0.2,
            w: 0.3,
            x: 0.1,
            y: 0.15,
          },
          objectId: "object-1",
        }}
        imageUrl="blob:frame-7"
        maskOpacity={0.58}
        onAnnotationTransformCommit={onAnnotationTransformCommit}
        onDraftBoxChange={onDraftBoxChange}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 80,
      clientY: 60,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(canvas, {
      buttons: 1,
      clientX: 140,
      clientY: 90,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 140,
      clientY: 90,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(onDraftBoxChange).toHaveBeenCalledWith(null);
    const [movedBox] = (onAnnotationTransformCommit.mock.calls[0] ?? []) as [
      Sam2DraftBox?,
    ];
    expect(movedBox).toBeDefined();
    expect(movedBox?.w).toBeCloseTo(0.3);
    expect(movedBox?.h).toBeCloseTo(0.2);
    expect(movedBox?.x).toBeCloseTo(0.25);
    expect(movedBox?.y).toBeCloseTo(0.3);
    expect(screen.getByAltText("SAM2 mask for object-1")).toHaveClass(
      "exact-frame-mask--selected",
    );
    expect(
      screen.getByLabelText("Resize saved annotation box for object-1"),
    ).toBeInTheDocument();
  });

  it("resizes editable annotations from the bottom-right handle", () => {
    const onAnnotationTransformCommit = vi.fn();
    const onDraftBoxChange = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[
          {
            box: {
              h: 0.2,
              w: 0.3,
              x: 0.1,
              y: 0.15,
            },
            isSelected: false,
            maskUrl: null,
            objectId: "object-1",
          },
        ]}
        draftBox={null}
        editableAnnotation={{
          box: {
            h: 0.2,
            w: 0.3,
            x: 0.1,
            y: 0.15,
          },
          objectId: "object-1",
        }}
        imageUrl="blob:frame-7"
        maskOpacity={0.58}
        onAnnotationTransformCommit={onAnnotationTransformCommit}
        onDraftBoxChange={onDraftBoxChange}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    fireEvent.pointerDown(
      screen.getByLabelText("Resize saved annotation box for object-1"),
      {
        button: 0,
        buttons: 1,
        pointerId: 1,
        pointerType: "mouse",
      },
    );
    fireEvent.pointerMove(canvas, {
      buttons: 1,
      clientX: 220,
      clientY: 120,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 220,
      clientY: 120,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(onDraftBoxChange).toHaveBeenCalledWith(null);
    const [resizedBox] = (onAnnotationTransformCommit.mock.calls[0] ?? []) as [
      Sam2DraftBox?,
    ];
    expect(resizedBox).toBeDefined();
    expect(resizedBox?.w).toBeCloseTo(0.45);
    expect(resizedBox?.h).toBeCloseTo(0.45);
    expect(resizedBox?.x).toBeCloseTo(0.1);
    expect(resizedBox?.y).toBeCloseTo(0.15);
  });

  it("ignores non-primary pointer starts and dedupes near-identical refine points", () => {
    const onDraftBoxChange = vi.fn();
    const onRefineStrokeCommit = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[]}
        draftBox={null}
        editableAnnotation={null}
        imageUrl="blob:frame-7"
        interactionMode="refine"
        maskOpacity={0.58}
        onDraftBoxChange={onDraftBoxChange}
        onRefineStrokeCommit={onRefineStrokeCommit}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    mockCanvasBounds(canvas, { height: 200, width: 400, x: 0, y: 0 });

    fireEvent.pointerDown(canvas, {
      button: 1,
      buttons: 1,
      clientX: 100,
      clientY: 60,
      pointerId: 1,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 120,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 100,
      clientY: 60,
      pointerId: 2,
      pointerType: "mouse",
    });
    fireEvent.pointerMove(canvas, {
      buttons: 1,
      clientX: 110,
      clientY: 64,
      pointerId: 2,
      pointerType: "mouse",
    });
    fireEvent.pointerUp(canvas, {
      clientX: 110,
      clientY: 64,
      pointerId: 2,
      pointerType: "mouse",
    });

    expect(onRefineStrokeCommit).toHaveBeenCalledWith([{ x: 0.25, y: 0.3 }]);
  });

  it("clears active interactions when pointer-up loses canvas bounds", () => {
    const onDraftBoxChange = vi.fn();
    const onDraftBoxCommit = vi.fn();

    render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[]}
        draftBox={null}
        editableAnnotation={null}
        imageUrl="blob:frame-7"
        maskOpacity={0.58}
        onDraftBoxChange={onDraftBoxChange}
        onDraftBoxCommit={onDraftBoxCommit}
      />,
    );

    const canvas = screen.getByLabelText("Exact frame canvas");
    const boundsSpy = mockCanvasBounds(canvas, {
      height: 200,
      width: 400,
      x: 0,
      y: 0,
    });

    fireEvent.pointerDown(canvas, {
      button: 0,
      buttons: 1,
      clientX: 120,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });
    boundsSpy.mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({ height: 0, width: 0, x: 0, y: 0 }),
    });
    fireEvent.pointerUp(canvas, {
      clientX: 120,
      clientY: 80,
      pointerId: 1,
      pointerType: "mouse",
    });

    expect(onDraftBoxChange).toHaveBeenLastCalledWith(null);
    expect(onDraftBoxCommit).not.toHaveBeenCalled();
  });

  it("tints boxes and masks with object colors", () => {
    const { container } = render(
      <ExactFrameCanvas
        alt="Exact frame 7"
        annotations={[
          {
            box: {
              h: 0.2,
              w: 0.3,
              x: 0.1,
              y: 0.15,
            },
            color: "#00ffaa",
            isSelected: true,
            maskUrl: "blob:mask-selected",
            objectId: "object-1",
          },
        ]}
        draftBox={{
          h: 0.1,
          w: 0.2,
          x: 0.4,
          y: 0.45,
        }}
        draftColor="#ffaa00"
        editableAnnotation={{
          box: {
            h: 0.2,
            w: 0.3,
            x: 0.1,
            y: 0.15,
          },
          objectId: "object-1",
        }}
        imageUrl="blob:frame-7"
        maskOpacity={0.58}
        onDraftBoxChange={vi.fn()}
      />,
    );

    expect(
      screen
        .getByLabelText("Saved annotation box for object-1")
        .getAttribute("style"),
    ).toContain("border-color: rgb(0, 255, 170)");
    expect(
      container.querySelector(".exact-frame-mask-tint")?.getAttribute("style"),
    ).toContain("background-color: rgb(0, 255, 170)");
    expect(
      container.querySelector(".exact-frame-box--draft")?.getAttribute("style"),
    ).toContain("border-color: rgb(255, 170, 0)");
  });

  it("normalizes reversed draft boxes and rejects zero-area results", () => {
    const normalizedBox = normalizeDraftBox(
      { x: 0.6, y: 0.7 },
      { x: 0.2, y: 0.3 },
    );
    expect(normalizedBox).toBeDefined();
    expect(normalizedBox?.w).toBeCloseTo(0.4);
    expect(normalizedBox?.h).toBeCloseTo(0.4);
    expect(normalizedBox?.x).toBeCloseTo(0.2);
    expect(normalizedBox?.y).toBeCloseTo(0.3);
    expect(
      normalizeDraftBox({ x: 0.25, y: 0.4 }, { x: 0.25, y: 0.8 }),
    ).toBeNull();
  });

  it("clamps moved boxes inside normalized canvas bounds", () => {
    expect(
      moveBox({
        box: {
          h: 0.25,
          w: 0.3,
          x: 0.2,
          y: 0.2,
        },
        offset: {
          x: 0.05,
          y: 0.05,
        },
        point: {
          x: 1.2,
          y: -0.1,
        },
      }),
    ).toEqual({
      h: 0.25,
      w: 0.3,
      x: 0.7,
      y: 0,
    });
  });

  it("treats box edges as selectable and dedupes only nearby refine points", () => {
    expect(
      pointInsideBox(
        { x: 0.4, y: 0.5 },
        {
          h: 0.3,
          w: 0.3,
          x: 0.1,
          y: 0.2,
        },
      ),
    ).toBe(true);
    expect(
      pointInsideBox(
        { x: 0.41, y: 0.51 },
        {
          h: 0.3,
          w: 0.3,
          x: 0.1,
          y: 0.2,
        },
      ),
    ).toBe(false);

    expect(
      appendRefinePointToInteraction(
        {
          points: [{ x: 0.25, y: 0.3 }],
          type: "refine",
        },
        { x: 0.26, y: 0.31 },
      ),
    ).toEqual({
      points: [{ x: 0.25, y: 0.3 }],
      type: "refine",
    });
    expect(
      appendRefinePointToInteraction(
        {
          points: [{ x: 0.25, y: 0.3 }],
          type: "refine",
        },
        { x: 0.5, y: 0.5 },
      ),
    ).toEqual({
      points: [
        { x: 0.25, y: 0.3 },
        { x: 0.5, y: 0.5 },
      ],
      type: "refine",
    });
  });
});

function mockCanvasBounds(
  element: HTMLElement,
  bounds: { x: number; y: number; width: number; height: number },
) {
  return vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    bottom: bounds.y + bounds.height,
    height: bounds.height,
    left: bounds.x,
    right: bounds.x + bounds.width,
    top: bounds.y,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
    toJSON: () => bounds,
  });
}
