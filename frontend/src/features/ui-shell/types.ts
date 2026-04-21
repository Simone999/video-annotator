export type UiShellPage = "library" | "review";

export type UiShellVideoState =
  | "not_started"
  | "started"
  | "in_progress"
  | "ready"
  | "exported";

export type UiShellVideo = {
  id: string;
  displayName: string;
  previewAlt: string;
  previewImageUrl: string;
  state: UiShellVideoState;
  frameCount: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  lastReviewedLabel: string;
  detailLine: string;
  propagationProgressPercent: number | null;
};

export type UiShellData = {
  videos: UiShellVideo[];
};
