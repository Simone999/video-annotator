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
  videos: [
    {
      detailLine: "Imported boxes: 12 objects",
      displayName: "street_scene_014.mp4",
      fps: 24,
      frameCount: 5000,
      id: "street_scene_014",
      lastReviewedLabel: "Frame 1842",
      previewAlt: "Street scene review fixture preview",
      previewImageUrl: createPreviewDataUrl({
        accent: "#4f9cff",
        background: "#12243d",
        title: "Street Scene",
      }),
      propagationProgressPercent: null,
      resolution: {
        height: 1080,
        width: 1920,
      },
      state: "started",
    },
    {
      detailLine: "Propagation completion: 68%",
      displayName: "warehouse_lane_102.mp4",
      fps: 30,
      frameCount: 8512,
      id: "warehouse_lane_102",
      lastReviewedLabel: "Frame 4108",
      previewAlt: "Warehouse lane review fixture preview",
      previewImageUrl: createPreviewDataUrl({
        accent: "#fb923c",
        background: "#2f160f",
        title: "Warehouse Lane",
      }),
      propagationProgressPercent: 68,
      resolution: {
        height: 1440,
        width: 2560,
      },
      state: "in_progress",
    },
    {
      detailLine: "Export package: JSON + PNG masks",
      displayName: "loading_bay_207.mp4",
      fps: 25,
      frameCount: 12480,
      id: "loading_bay_207",
      lastReviewedLabel: "Frame 12480",
      previewAlt: "Loading bay review fixture preview",
      previewImageUrl: createPreviewDataUrl({
        accent: "#22c55e",
        background: "#0d2219",
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
