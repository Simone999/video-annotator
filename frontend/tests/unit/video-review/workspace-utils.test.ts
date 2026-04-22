import { describe, expect, it } from "vitest";

import { VideoReviewApiError } from "../../../src/features/video-review/api";
import {
  formatWorkspaceError,
  isSam2JobActive,
  mergeCancelledJobState,
} from "../../../src/features/video-review/hooks/workspace-utils";

describe("workspace utils", () => {
  it("formats api, generic, and fallback error messages", () => {
    expect(
      formatWorkspaceError(new VideoReviewApiError(500, "backend broke")),
    ).toBe("backend broke");
    expect(formatWorkspaceError(new Error("plain error"))).toBe("plain error");
    expect(formatWorkspaceError({ reason: "unknown" })).toBe(
      "Video review request failed.",
    );
  });

  it("keeps active sam2 job statuses active and merges cancelled state", () => {
    expect(isSam2JobActive("queued")).toBe(true);
    expect(isSam2JobActive("running")).toBe(true);
    expect(isSam2JobActive("cancelling")).toBe(true);
    expect(isSam2JobActive("completed")).toBe(false);

    expect(
      mergeCancelledJobState(
        {
          errorMessage: null,
          jobId: "job-1",
          progressCurrent: 1,
          progressTotal: 2,
          result: null,
          status: "running",
          type: "sam2_propagation",
        },
        "cancelled",
      ),
    ).toEqual({
      errorMessage: null,
      jobId: "job-1",
      progressCurrent: 1,
      progressTotal: 2,
      result: null,
      status: "cancelled",
      type: "sam2_propagation",
    });
  });
});
