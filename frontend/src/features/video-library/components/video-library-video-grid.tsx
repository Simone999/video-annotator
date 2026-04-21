import type { VideoLibraryVideo } from "../types";
import { VideoLibraryVideoCard } from "./video-library-video-card";

export function VideoLibraryVideoGrid({
  onOpenReview,
  onSelectVideo,
  selectedVideoId,
  videos,
}: {
  onOpenReview: (videoId: string) => void;
  onSelectVideo: (videoId: string) => void;
  selectedVideoId: string | null;
  videos: VideoLibraryVideo[];
}) {
  return (
    <section
      aria-label="Library videos"
      className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
    >
      {videos.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/50 px-6 py-10">
          <h2 className="text-xl font-semibold text-slate-50">
            No indexed videos yet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Add local videos to backend catalog, then reload library.
          </p>
        </div>
      ) : null}

      {videos.map((video) => (
        <VideoLibraryVideoCard
          key={video.id}
          isSelected={video.id === selectedVideoId}
          onOpenReview={onOpenReview}
          onSelectVideo={onSelectVideo}
          video={video}
        />
      ))}
    </section>
  );
}
