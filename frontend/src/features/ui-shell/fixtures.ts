import type {
  UiShellFixtureData,
  UiShellReviewData,
  UiShellReviewThumbnail,
} from "./types";
import { createPreviewDataUrl } from "../video-library/preview";

export const uiShellFixtureData: UiShellFixtureData = {
  source: "fixture",
  summaryMetrics: [
    {
      label: "Total Videos",
      tone: "default",
      value: "193",
    },
    {
      label: "Started",
      tone: "primary",
      value: "21",
    },
    {
      label: "In Progress",
      tone: "secondary",
      value: "38",
    },
    {
      label: "Ready for Review",
      tone: "tertiary",
      value: "5",
    },
    {
      label: "Exported",
      tone: "default",
      value: "83",
    },
  ],
  videos: [
    createFixtureVideo({
      contextLine: "urban_night / sparse-review",
      currentFrame: 1842,
      detailLine: "Masks: 14 objects",
      displayName: "street_scene_014.mp4",
      fps: 24,
      frameCount: 5000,
      id: "street_scene_014",
      lastReviewedLabel: "Frame 1842",
      previewAlt: "Night street video preview",
      previewBackground: "#24140c",
      previewAccent: "#fb923c",
      previewTitle: "Street Scene",
      propagationProgressPercent: 68,
      rangeEnd: 1900,
      rangeStart: 1842,
      resolution: {
        height: 1080,
        width: 1920,
      },
      state: "in_progress",
    }),
    createFixtureVideo({
      contextLine: "validation_set / ready-review",
      currentFrame: 912,
      detailLine: "Boxes only: 6 objects",
      displayName: "tunnel_cam_007.mp4",
      fps: 30,
      frameCount: 8512,
      id: "tunnel_cam_007",
      lastReviewedLabel: "Not Started",
      previewAlt: "Tunnel video preview",
      previewBackground: "#12263c",
      previewAccent: "#67e8f9",
      previewTitle: "Tunnel Cam",
      propagationProgressPercent: null,
      rangeEnd: 970,
      rangeStart: 912,
      resolution: {
        height: 1440,
        width: 2560,
      },
      state: "ready",
    }),
    createFixtureVideo({
      contextLine: "warehouse / shipped-export",
      currentFrame: 12422,
      detailLine: "JSON + PNG masks",
      displayName: "loading_bay_102.mp4",
      fps: 25,
      frameCount: 12480,
      id: "loading_bay_102",
      lastReviewedLabel: "Frame 12480",
      previewAlt: "Loading bay video preview",
      previewBackground: "#1c2029",
      previewAccent: "#94a3b8",
      previewTitle: "Loading Bay",
      propagationProgressPercent: null,
      rangeEnd: 12480,
      rangeStart: 12422,
      resolution: {
        height: 1080,
        width: 1920,
      },
      state: "exported",
    }),
  ],
};

function buildReviewThumbnails(
  stageImageUrl: string,
): UiShellReviewThumbnail[] {
  return [
    {
      badgeLabel: null,
      id: "thumb-01",
      imageUrl: stageImageUrl,
      tone: "default",
    },
    {
      badgeLabel: null,
      id: "thumb-02",
      imageUrl: stageImageUrl,
      tone: "default",
    },
    {
      badgeLabel: "manual",
      id: "thumb-03",
      imageUrl: stageImageUrl,
      tone: "current",
    },
    {
      badgeLabel: null,
      id: "thumb-04",
      imageUrl: null,
      tone: "default",
    },
    {
      badgeLabel: null,
      id: "thumb-05",
      imageUrl: null,
      tone: "default",
    },
    {
      badgeLabel: null,
      id: "thumb-06",
      imageUrl: null,
      tone: "default",
    },
  ];
}

function buildReviewData({
  currentFrame,
  rangeEnd,
  rangeStart,
  stageImageUrl,
}: {
  currentFrame: number;
  rangeEnd: number;
  rangeStart: number;
  stageImageUrl: string;
}): UiShellReviewData {
  return {
    currentFrame,
    manualMarkerPercents: [45, 62, 80],
    missingMarkerPercent: 71,
    objectCountLabel: "14 OBJ",
    objects: [
      {
        bboxLabel: "[288, 322, 442, 772]",
        boxState: "present",
        classLabel: "Pedestrian",
        confidenceLabel: "0.89",
        id: "pedestrian_01",
        maskState: "missing",
        stageOverlay: {
          heightPercent: 25,
          leftPercent: 15,
          topPercent: 30,
          widthPercent: 8,
        },
        visible: true,
      },
      {
        bboxLabel: "[824, 420, 932, 790]",
        boxState: "present",
        classLabel: "Pedestrian",
        confidenceLabel: "0.91",
        id: "pedestrian_02",
        maskState: "present",
        stageOverlay: null,
        visible: true,
      },
      {
        bboxLabel: "[1114, 453, 1230, 802]",
        boxState: "present",
        classLabel: "Pedestrian",
        confidenceLabel: "0.94",
        id: "pedestrian_03",
        maskState: "present",
        stageOverlay: {
          heightPercent: 32,
          leftPercent: 58,
          topPercent: 42,
          widthPercent: 6,
        },
        visible: true,
      },
      {
        bboxLabel: "[1362, 418, 1680, 716]",
        boxState: "present",
        classLabel: "Vehicle",
        confidenceLabel: "0.72",
        id: "vehicle_01",
        maskState: "missing",
        stageOverlay: null,
        visible: false,
      },
    ],
    rangeEnd,
    rangeStart,
    selectedObjectId: "pedestrian_03",
    thumbnails: buildReviewThumbnails(stageImageUrl),
    timelineCursorPercent: 45,
    timelineRangeEndPercent: 80,
    timelineRangeStartPercent: 45,
    trackCorrected: 3,
    trackFrames: 58,
    trackPropagated: 55,
  };
}

function createFixtureVideo({
  contextLine,
  currentFrame,
  detailLine,
  displayName,
  fps,
  frameCount,
  id,
  lastReviewedLabel,
  previewAlt,
  previewBackground,
  previewAccent,
  previewTitle,
  propagationProgressPercent,
  rangeEnd,
  rangeStart,
  resolution,
  state,
}: {
  contextLine: string;
  currentFrame: number;
  detailLine: string;
  displayName: string;
  fps: number;
  frameCount: number;
  id: string;
  lastReviewedLabel: string;
  previewAlt: string;
  previewBackground: string;
  previewAccent: string;
  previewTitle: string;
  propagationProgressPercent: number | null;
  rangeEnd: number;
  rangeStart: number;
  resolution: {
    height: number;
    width: number;
  };
  state: UiShellFixtureData["videos"][number]["state"];
}) {
  const previewImageUrl = createPreviewDataUrl({
    accent: previewAccent,
    background: previewBackground,
    title: previewTitle,
  });

  return {
    contextLine,
    detailLine,
    displayName,
    fps,
    frameCount,
    id,
    lastReviewedLabel,
    previewAlt,
    previewImageUrl,
    propagationProgressPercent,
    review: buildReviewData({
      currentFrame,
      rangeEnd,
      rangeStart,
      stageImageUrl: previewImageUrl,
    }),
    resolution,
    state,
  };
}
