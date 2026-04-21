import { useNavigate, useParams } from "react-router";

import { LiveReviewScreen } from "../components/live-review-screen";

export function VideoReviewRoutePage() {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();

  return (
    <LiveReviewScreen
      initialVideoId={videoId ?? null}
      onBackToLibrary={() => {
        void navigate("/");
      }}
    />
  );
}
