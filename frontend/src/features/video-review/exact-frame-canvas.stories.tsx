import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExactFrameCanvas } from "./exact-frame-canvas";

const frameImageUrl =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='640' height='360' fill='%230f172a'/><text x='320' y='180' fill='white' font-size='32' text-anchor='middle' dominant-baseline='middle'>Exact frame</text></svg>";

const meta = {
  component: ExactFrameCanvas,
  title: "Video Review/ExactFrameCanvas",
} satisfies Meta<typeof ExactFrameCanvas>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectedAnnotation: Story = {
  args: {
    alt: "Exact frame preview",
    annotations: [
      {
        box: {
          h: 0.24,
          w: 0.22,
          x: 0.16,
          y: 0.22,
        },
        isSelected: true,
        maskUrl: null,
        objectId: "object-1",
      },
    ],
    draftBox: {
      h: 0.18,
      w: 0.2,
      x: 0.54,
      y: 0.34,
    },
    editableAnnotation: {
      box: {
        h: 0.24,
        w: 0.22,
        x: 0.16,
        y: 0.22,
      },
      objectId: "object-1",
    },
    imageUrl: frameImageUrl,
    maskOpacity: 0.58,
    onAnnotationTransformCommit: () => {},
    onDraftBoxChange: () => {},
    onDraftBoxCommit: () => {},
  },
};
