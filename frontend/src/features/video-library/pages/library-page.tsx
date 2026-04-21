import { useNavigate } from "react-router";

import { VideoLibraryScreen } from "../components/video-library-screen";
import { VideoLibraryStatusPanel } from "../components/video-library-status-panel";
import { useVideoLibraryRouteData } from "../hooks/use-video-library-route-data";

export function VideoLibraryRoutePage() {
  const navigate = useNavigate();
  const { libraryData, loadError, selectedVideo, setSelectedVideoId } =
    useVideoLibraryRouteData();

  if (loadError !== null) {
    return (
      <VideoLibraryStatusPanel copy={loadError} title="Library load failed" />
    );
  }

  if (libraryData === null) {
    return (
      <VideoLibraryStatusPanel
        copy="Fetching backend review state for default library route."
        title="Loading library summaries"
      />
    );
  }

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
