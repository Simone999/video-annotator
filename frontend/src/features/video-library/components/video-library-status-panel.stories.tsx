import type { Meta, StoryObj } from "@storybook/react-vite";

import { VideoLibraryStatusPanel } from "./video-library-status-panel";

const meta = {
  component: VideoLibraryStatusPanel,
  parameters: {
    layout: "fullscreen",
  },
  title: "Video Library/VideoLibraryStatusPanel",
} satisfies Meta<typeof VideoLibraryStatusPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    copy: "Preparing indexed library rows from local backend state.",
    title: "Loading video library",
  },
};

export const Error: Story = {
  args: {
    copy: "Unable to load indexed videos from the local backend.",
    title: "Library unavailable",
  },
};
