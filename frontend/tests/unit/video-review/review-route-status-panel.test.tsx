// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ReviewRouteStatusPanel } from "../../../src/features/video-review/components/review-route-status-panel";

afterEach(() => {
  cleanup();
});

describe("ReviewRouteStatusPanel", () => {
  it("renders loading and error route states with optional actions", async () => {
    const user = userEvent.setup();
    const onBackToLibrary = vi.fn();
    const { rerender } = render(
      <ReviewRouteStatusPanel
        copy="Loading review workspace."
        onBackToLibrary={onBackToLibrary}
        routeVideoId="video-123"
        title="Loading"
        tone="loading"
      />,
    );

    expect(screen.getByText("Review route")).toBeInTheDocument();
    expect(screen.getByText("Video id video-123")).toHaveClass("text-sky-100");

    await user.click(screen.getByRole("button", { name: "Back to Library" }));
    expect(onBackToLibrary).toHaveBeenCalledTimes(1);

    rerender(
      <ReviewRouteStatusPanel
        copy="Review route failed."
        routeVideoId={null}
        title="Unavailable"
        tone="error"
      />,
    );

    expect(screen.getByText("Review route failed.")).toBeInTheDocument();
    expect(screen.queryByText(/Video id/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back to Library" })).not.toBeInTheDocument();
  });
});
