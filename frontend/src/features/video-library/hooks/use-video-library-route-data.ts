import { useEffect, useState } from "react";

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

export function useVideoLibraryRouteData() {
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
        setLoadError(null);
        setSelectedVideoId(data.videos[0]?.id ?? null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setLibraryData(null);
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

  return {
    libraryData,
    loadError,
    selectedVideo: pickSelectedVideo({
      selectedVideoId,
      videos: libraryData?.videos ?? [],
    }),
    selectedVideoId,
    setSelectedVideoId,
  };
}
