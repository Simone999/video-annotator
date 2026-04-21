import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { VideoLibraryScreen } from "../components/video-library-screen";
import { loadVideoLibraryData } from "../loader";
import type { VideoLibraryData, VideoLibraryVideo } from "../types";

function pickSelectedVideo<T extends VideoLibraryVideo>({
  selectedVideoId,
  videos,
}: {
  selectedVideoId: string | null;
  videos: T[];
}): T | null {
  if (videos.length === 0) {
    return null;
  }

  return videos.find((video) => video.id === selectedVideoId) ?? videos[0];
}

function LibraryStatusPanel({ copy, title }: { copy: string; title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Video library route
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-50">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
      </section>
    </main>
  );
}

export function VideoLibraryRoutePage() {
  const navigate = useNavigate();
  const [libraryData, setLibraryData] = useState<VideoLibraryData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void loadVideoLibraryData()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setLibraryData(data);
        setSelectedVideoId(data.videos[0]?.id ?? null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Library summaries failed to load.",
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (loadError !== null) {
    return <LibraryStatusPanel copy={loadError} title="Library load failed" />;
  }

  if (libraryData === null) {
    return (
      <LibraryStatusPanel
        copy="Fetching backend review state for default library route."
        title="Loading library summaries"
      />
    );
  }

  const selectedVideo = pickSelectedVideo({
    selectedVideoId,
    videos: libraryData.videos,
  });

  return (
    <VideoLibraryScreen
      onOpenReview={(videoId) => {
        void navigate(`/review/${encodeURIComponent(videoId)}`);
      }}
      onSelectVideo={setSelectedVideoId}
      selectedVideoId={selectedVideo?.id ?? null}
      summaryMetrics={libraryData.summaryMetrics}
      videos={libraryData.videos}
    />
  );
}
