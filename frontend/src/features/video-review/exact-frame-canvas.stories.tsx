import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExactFrameCanvas } from "./exact-frame-canvas";

const frameImageUrl =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='640' height='360' fill='%230f172a'/><rect x='96' y='72' width='160' height='96' fill='%231e293b' opacity='0.72'/><rect x='352' y='120' width='144' height='104' fill='%231e40af' opacity='0.24'/><path d='M0 300h640' stroke='%23334155' stroke-width='2'/><path d='M0 88h640' stroke='%23334155' stroke-width='2' opacity='0.55'/></svg>";

const meta = {
  component: ExactFrameCanvas,
  decorators: [
    (Story) => (
      <div className="app-shell min-h-screen px-8 py-10">
        <div className="workspace-stage mx-auto max-w-5xl p-6">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
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
