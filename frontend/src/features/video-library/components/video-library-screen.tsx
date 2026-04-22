import type { VideoLibrarySummaryMetric, VideoLibraryVideo } from "../types";
import { VideoLibraryFilters } from "./video-library-filters";
import { VideoLibraryHeader } from "./video-library-header";
import { VideoLibrarySidebar } from "./video-library-sidebar";
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
    <div className="app-shell min-h-screen text-slate-100">
      <VideoLibraryHeader />

      <div className="flex pt-12">
        <VideoLibrarySidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:ml-16 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-50">
                Video Library
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">
                Browse local videos, choose work, and open a video for
                annotation review.
              </p>
            </div>

            <VideoLibrarySummaryMetrics summaryMetrics={summaryMetrics} />
            <VideoLibraryFilters />
            <VideoLibraryVideoGrid
              onOpenReview={onOpenReview}
              onSelectVideo={onSelectVideo}
              selectedVideoId={selectedVideoId}
              videos={videos}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
