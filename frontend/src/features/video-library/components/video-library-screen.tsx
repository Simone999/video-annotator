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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <VideoLibraryHeader />

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 pb-10 pt-5 lg:px-6 xl:px-8">
        <VideoLibrarySidebar />

        <main className="flex-1">
          <section className="rounded-[1.85rem] border border-white/10 bg-white/[0.04] px-5 py-6 shadow-[0_24px_80px_rgba(2,6,23,0.28)] md:px-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-[-0.01em] text-slate-50">
                  Video Library
                </h1>
                <p className="max-w-xl text-sm leading-6 text-slate-300">
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
          </section>
        </main>
      </div>
    </div>
  );
}
