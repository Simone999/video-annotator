import { DEFAULT_API_BASE_URL } from "../../shared/api/base-url";
import { listVideoLibraryVideos, type VideoLibraryApiVideo } from "./api";
import type {
  VideoLibraryData,
  VideoLibrarySummaryMetric,
  VideoLibraryVideo,
  VideoLibraryVideoState,
} from "./types";

const apiBaseUrl = DEFAULT_API_BASE_URL.replace(/\/$/, "");
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
    previewAlt: `Preview frame for ${video.display_name}`,
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
    return "Local library";
  }

  const pathSegments = trimmed
    .split(/[\\/]/)
    .filter((segment) => segment.length > 0);
  const parentFolder = pathSegments.at(-2);
  if (parentFolder === undefined) {
    return "Local library";
  }

  const folderLabel = humanizePathSegment(parentFolder);
  return folderLabel.length > 0
    ? `Local folder · ${folderLabel}`
    : "Local library";
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
  const previewFrameIdx = video.review_summary.last_reviewed_frame_idx ?? 0;
  return `${apiBaseUrl}/videos/${encodeURIComponent(video.id)}/frame/${String(previewFrameIdx)}`;
}

function humanizePathSegment(segment: string): string {
  return segment
    .replace(/\.[^.]+$/, "")
    .split(/[_-]+/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatNoun(count: number, noun: string): string {
  const suffix = count === 1 ? "" : "s";
  return `${formatCount(count)} ${noun}${suffix}`;
}

function formatCount(value: number): string {
  return formatter.format(value);
}
