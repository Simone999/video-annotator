import type { UiShellData } from "./types";

function createPreviewDataUrl({
  accent,
  background,
  title,
}: {
  accent: string;
  background: string;
  title: string;
}): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#091120" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#bg)" />
      <circle cx="510" cy="96" r="54" fill="${accent}" fill-opacity="0.24" />
      <rect
        x="84"
        y="86"
        width="472"
        height="188"
        rx="20"
        fill="none"
        stroke="${accent}"
        stroke-opacity="0.65"
        stroke-width="4"
      />
      <path
        d="M196 142 L196 218 L276 180 Z"
        fill="${accent}"
        fill-opacity="0.78"
      />
      <text
        x="84"
        y="314"
        fill="#f8fafc"
        font-family="Inter, sans-serif"
        font-size="30"
        font-weight="700"
      >
        ${title}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const uiShellFixtureData: UiShellData = {
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
    {
      contextLine: "urban_night / sparse-review",
      detailLine: "Masks: 14 objects",
      displayName: "street_scene_014.mp4",
      fps: 24,
      frameCount: 5000,
      id: "street_scene_014",
      lastReviewedLabel: "Frame 1842",
      previewAlt: "Night street video preview",
      previewImageUrl: createPreviewDataUrl({
        accent: "#fb923c",
        background: "#24140c",
        title: "Street Scene",
      }),
      propagationProgressPercent: 68,
      resolution: {
        height: 1080,
        width: 1920,
      },
      state: "in_progress",
    },
    {
      contextLine: "validation_set / ready-review",
      detailLine: "Boxes only: 6 objects",
      displayName: "tunnel_cam_007.mp4",
      fps: 30,
      frameCount: 8512,
      id: "tunnel_cam_007",
      lastReviewedLabel: "Not Started",
      previewAlt: "Tunnel video preview",
      previewImageUrl: createPreviewDataUrl({
        accent: "#67e8f9",
        background: "#12263c",
        title: "Tunnel Cam",
      }),
      propagationProgressPercent: null,
      resolution: {
        height: 1440,
        width: 2560,
      },
      state: "ready",
    },
    {
      contextLine: "warehouse / shipped-export",
      detailLine: "JSON + PNG masks",
      displayName: "loading_bay_102.mp4",
      fps: 25,
      frameCount: 12480,
      id: "loading_bay_102",
      lastReviewedLabel: "Frame 12480",
      previewAlt: "Loading bay video preview",
      previewImageUrl: createPreviewDataUrl({
        accent: "#94a3b8",
        background: "#1c2029",
        title: "Loading Bay",
      }),
      propagationProgressPercent: null,
      resolution: {
        height: 1080,
        width: 1920,
      },
      state: "exported",
    },
  ],
};
