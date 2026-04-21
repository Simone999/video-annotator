import { listVideoLibraryVideos, type VideoLibraryApiVideo } from "./api";
import { createPreviewDataUrl } from "./preview";
import type {
  VideoLibraryData,
  VideoLibrarySummaryMetric,
  VideoLibraryVideo,
  VideoLibraryVideoState,
} from "./types";

const formatter = new Intl.NumberFormat("en-US");

export async function loadVideoLibraryData(): Promise<VideoLibraryData> {
  const videos = await listVideoLibraryVideos();

  return {
    summaryMetrics: buildSummaryMetrics(videos),
    videos: videos.map(mapVideoLibraryVideo),
  };
}

function buildSummaryMetrics(
  videos: readonly VideoLibraryApiVideo[],
): VideoLibrarySummaryMetric[] {
  return [
    {
      label: "Total Videos",
      tone: "default",
      value: formatCount(videos.length),
    },
    {
      label: "Started",
      tone: "primary",
      value: formatCount(countVideosByState(videos, "started")),
    },
    {
      label: "In Progress",
      tone: "secondary",
      value: formatCount(countVideosByState(videos, "in_progress")),
    },
    {
      label: "Ready for Review",
      tone: "tertiary",
      value: formatCount(countVideosByState(videos, "ready")),
    },
    {
      label: "Exported",
      tone: "default",
      value: formatCount(countVideosByState(videos, "exported")),
    },
  ];
}

function countVideosByState(
  videos: readonly VideoLibraryApiVideo[],
  state: VideoLibraryVideoState,
): number {
  return videos.filter((video) => video.review_state === state).length;
}

function mapVideoLibraryVideo(video: VideoLibraryApiVideo): VideoLibraryVideo {
  return {
    contextLine: buildContextLine(video.source_path),
    detailLine: buildDetailLine(video),
    displayName: video.display_name,
    fps: video.fps,
    frameCount: video.frame_count,
    id: video.id,
    lastReviewedLabel: buildLastReviewedLabel(
      video.review_summary.last_reviewed_frame_idx,
    ),
    previewAlt: `${video.display_name} preview placeholder`,
    previewImageUrl: buildPreviewImageUrl(video),
    propagationProgressPercent: video.propagation_progress_percent,
    resolution: {
      height: video.height,
      width: video.width,
    },
    state: video.review_state,
  };
}

function buildContextLine(sourcePath: string): string {
  const trimmed = sourcePath.trim();
  if (trimmed.length === 0) {
    return "Local catalog";
  }

  const lastSlashIndex = trimmed.lastIndexOf("/");
  if (lastSlashIndex <= 0) {
    return "Local catalog";
  }

  return trimmed.slice(0, lastSlashIndex);
}

function buildLastReviewedLabel(frameIdx: number | null): string {
  if (frameIdx === null) {
    return "Not Started";
  }

  return `Frame ${String(frameIdx)}`;
}

function buildDetailLine(video: VideoLibraryApiVideo): string {
  const reviewSummary = video.review_summary;
  const objectCount = formatNoun(reviewSummary.object_count, "object");
  const annotatedFrameCount = formatNoun(
    reviewSummary.annotated_frame_count,
    "annotated frame",
  );
  const importedFrameCount = formatNoun(
    reviewSummary.imported_frame_count,
    "imported frame",
  );

  switch (video.review_state) {
    case "not_started":
      return "Not started yet";
    case "started":
      return `Imported: ${objectCount} across ${importedFrameCount}`;
    case "in_progress":
      return `Propagation active: ${objectCount} across ${annotatedFrameCount}`;
    case "ready":
      return `Ready: ${objectCount} across ${annotatedFrameCount}`;
    case "exported":
      return `Exported: ${objectCount} across ${annotatedFrameCount}`;
  }
}

function buildPreviewImageUrl(video: VideoLibraryApiVideo): string {
  const palette = getPreviewPalette(video.review_state);

  return createPreviewDataUrl({
    accent: palette.accent,
    background: palette.background,
    title: buildPreviewTitle(video.display_name),
  });
}

function getPreviewPalette(state: VideoLibraryVideoState): {
  accent: string;
  background: string;
} {
  switch (state) {
    case "not_started":
      return { accent: "#94a3b8", background: "#1f2937" };
    case "started":
      return { accent: "#f59e0b", background: "#1f2937" };
    case "in_progress":
      return { accent: "#67e8f9", background: "#12263c" };
    case "ready":
      return { accent: "#34d399", background: "#123524" };
    case "exported":
      return { accent: "#cbd5e1", background: "#1c2029" };
  }
}

function buildPreviewTitle(displayName: string): string {
  const baseName = displayName.replace(/\.[^.]+$/, "");
  const words = baseName.replace(/[_-]+/g, " ").trim();
  if (words.length === 0) {
    return "Video";
  }

  return words.slice(0, 24);
}

function formatNoun(count: number, noun: string): string {
  const suffix = count === 1 ? "" : "s";
  return `${formatCount(count)} ${noun}${suffix}`;
}

function formatCount(value: number): string {
  return formatter.format(value);
}
