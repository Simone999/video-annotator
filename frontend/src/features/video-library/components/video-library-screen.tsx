import type { VideoLibrarySummaryMetric, VideoLibraryVideo } from "../types";
import { VideoLibraryFilters } from "./video-library-filters";
import { VideoLibraryHeader } from "./video-library-header";
import { VideoLibrarySummaryMetrics } from "./video-library-summary-metrics";
import { VideoLibraryVideoGrid } from "./video-library-video-grid";

export function VideoLibraryScreen({
  onOpenReview,
  onSelectVideo,
  selectedVideoId,
  summaryMetrics,
  videos,
}: {
  onOpenReview: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string | null;
  summaryMetrics: VideoLibrarySummaryMetric[];
  videos: VideoLibraryVideo[];
}) {
  return (
    <div
      className="app-shell state-palette-scope min-h-screen bg-surface-container-lowest text-slate-100"
      data-state-palette="library"
    >
      <VideoLibraryHeader />

      <div className="relative flex h-full flex-1 pt-12">
        <main className="flex-1 overflow-y-auto p-6 text-on-surface lg:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                Video Library
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-label text-on-surface-variant">
                Browse local videos, choose work, and open a video for
                annotation review.
              </p>
            </div>
          </div>
          <VideoLibrarySummaryMetrics summaryMetrics={summaryMetrics} />
          <VideoLibraryFilters />
          <VideoLibraryVideoGrid
            onOpenReview={onOpenReview}
            onSelectVideo={onSelectVideo}
            selectedVideoId={selectedVideoId}
            videos={videos}
          />
        </main>
      </div>
    </div>
  );
}
