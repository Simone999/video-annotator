import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReviewRouteStatusPanel } from "./review-route-status-panel";

const meta = {
  component: ReviewRouteStatusPanel,
  parameters: {
    layout: "fullscreen",
  },
  title: "Video Review/ReviewRouteStatusPanel",
} satisfies Meta<typeof ReviewRouteStatusPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    copy: "Preparing live review workspace for street_scene_014.mp4.",
    routeVideoId: "video-123",
    title: "Opening review workspace",
    tone: "loading",
  },
};

export const Unavailable: Story = {
  args: {
    copy: "Requested review route is not indexed in local library.",
    onBackToLibrary: () => {},
    routeVideoId: "video-missing",
    title: "Review unavailable",
    tone: "error",
  },
};
