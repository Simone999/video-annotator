import "../app/app.css";

import { LiveReviewApp } from "./live-review-app";
import { UiShellApp } from "../features/ui-shell";

export function App() {
  if (shouldRenderLiveReviewHarness()) {
    return <LiveReviewApp />;
  }

  return <UiShellApp />;
}

function shouldRenderLiveReviewHarness(): boolean {
  const query = new URLSearchParams(window.location.search);
  return query.get("app") === "live-review";
}
