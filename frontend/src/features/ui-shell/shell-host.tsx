import { useEffect, useState } from "react";

import { LiveReviewScreen } from "../video-review";
import {
  loadVideoLibraryData,
  VideoLibraryScreen,
  type VideoLibraryVideo,
} from "../video-library";
import { UiShellReviewPage } from "./review-page";
import type { UiShellData, UiShellPage, UiShellReviewObject } from "./types";

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

function pickSelectedObject({
  objects,
  selectedObjectId,
}: {
  objects: UiShellReviewObject[];
  selectedObjectId: string | null;
}): UiShellReviewObject | null {
  if (objects.length === 0) {
    return null;
  }

  return objects.find((object) => object.id === selectedObjectId) ?? objects[0];
}

export function UiShellApp() {
  const [shellData, setShellData] = useState<UiShellData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<UiShellPage>("library");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void loadVideoLibraryData()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setShellData({
          source: "live",
          ...data,
        });
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

  const selectedVideo =
    shellData?.source === "fixture"
      ? pickSelectedVideo({
          selectedVideoId,
          videos: shellData.videos,
        })
      : null;
  const selectedLibraryVideo = pickSelectedVideo({
    selectedVideoId,
    videos: shellData?.videos ?? [],
  });
  const selectedObject =
    selectedVideo === null
      ? null
      : pickSelectedObject({
          objects: selectedVideo.review.objects,
          selectedObjectId,
        });

  useEffect(() => {
    if (shellData?.source !== "fixture" || selectedVideo === null) {
      setSelectedObjectId(null);
      return;
    }

    setSelectedObjectId(selectedVideo.review.selectedObjectId);
  }, [selectedVideo, shellData?.source]);

  if (loadError !== null) {
    return (
      <div className="app-shell ui-shell">
        <section className="ui-shell-panel">
          <p className="ui-shell-kicker">Live library shell</p>
          <h1 className="ui-shell-title">Library load failed</h1>
          <p className="ui-shell-copy">{loadError}</p>
        </section>
      </div>
    );
  }

  if (shellData === null) {
    return (
      <div className="app-shell ui-shell">
        <section className="ui-shell-panel">
          <p className="ui-shell-kicker">Live library shell</p>
          <h1 className="ui-shell-title">Loading library summaries</h1>
          <p className="ui-shell-copy">
            Fetching backend review state for default library host.
          </p>
        </section>
      </div>
    );
  }

  if (currentPage === "review") {
    if (shellData.source === "live") {
      return (
        <LiveReviewScreen
          initialVideoId={selectedVideoId}
          onBackToLibrary={() => {
            setCurrentPage("library");
          }}
        />
      );
    }

    return (
      <UiShellReviewPage
        onBackToLibrary={() => {
          setCurrentPage("library");
        }}
        onSelectObject={setSelectedObjectId}
        selectedObject={selectedObject}
        selectedObjectId={selectedObjectId}
        video={selectedVideo}
      />
    );
  }

  return (
    <VideoLibraryScreen
      onOpenReview={(videoId) => {
        setSelectedVideoId(videoId);
        setCurrentPage("review");
      }}
      onSelectVideo={setSelectedVideoId}
      selectedVideoId={selectedLibraryVideo?.id ?? null}
      summaryMetrics={shellData.summaryMetrics}
      videos={shellData.videos}
    />
  );
}
