import { useParams } from "react-router";

import { LiveReviewApp } from "../../../app/live-review-app";

export function VideoReviewRoutePage() {
  const { videoId } = useParams<{ videoId: string }>();

  return <LiveReviewApp initialVideoId={videoId ?? null} />;
}
