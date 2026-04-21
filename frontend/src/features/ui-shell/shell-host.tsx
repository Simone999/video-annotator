import { useEffect, useState } from "react";

import { UiShellLibraryPage } from "./library-page";
import { loadUiShellData } from "./loader";
import { UiShellReviewPage } from "./review-page";
import type {
  UiShellData,
  UiShellPage,
  UiShellReviewObject,
  UiShellVideo,
} from "./types";

function pickSelectedVideo({
  selectedVideoId,
  videos,
}: {
  selectedVideoId: string | null;
  videos: UiShellVideo[];
}): UiShellVideo | null {
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

    void loadUiShellData()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setShellData(data);
        setSelectedVideoId(data.videos[0]?.id ?? null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setLoadError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Shell fixtures failed to load.",
        );
      });

    return () => {
      isActive = false;
    };
  }, []);

  const selectedVideo = pickSelectedVideo({
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
    if (selectedVideo === null) {
      setSelectedObjectId(null);
      return;
    }

    setSelectedObjectId(selectedVideo.review.selectedObjectId);
  }, [selectedVideo]);

  if (loadError !== null) {
    return (
      <div className="app-shell ui-shell">
        <section className="ui-shell-panel">
          <p className="ui-shell-kicker">Mockup UI shell foundation</p>
          <h1 className="ui-shell-title">Shell load failed</h1>
          <p className="ui-shell-copy">{loadError}</p>
        </section>
      </div>
    );
  }

  if (shellData === null) {
    return (
      <div className="app-shell ui-shell">
        <section className="ui-shell-panel">
          <p className="ui-shell-kicker">Mockup UI shell foundation</p>
          <h1 className="ui-shell-title">Loading shell fixtures</h1>
          <p className="ui-shell-copy">
            Preparing default library host from local static data.
          </p>
        </section>
      </div>
    );
  }

  if (currentPage === "review") {
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
    <UiShellLibraryPage
      onOpenReview={(videoId) => {
        setSelectedVideoId(videoId);
        setCurrentPage("review");
      }}
      onSelectVideo={setSelectedVideoId}
      selectedVideoId={selectedVideo?.id ?? null}
      summaryMetrics={shellData.summaryMetrics}
      videos={shellData.videos}
    />
  );
}
