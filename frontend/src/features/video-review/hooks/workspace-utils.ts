import { VideoReviewApiError } from "../api";
import type { Sam2PropagationJob } from "../state";

export const SAM2_JOB_POLL_INTERVAL_MS = 1000;

export function formatWorkspaceError(error: unknown): string {
  if (error instanceof VideoReviewApiError) {
    return error.detail;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return "Video review request failed.";
}

export function mergeCancelledJobState(
  job: Sam2PropagationJob,
  status: string,
): Sam2PropagationJob {
  return {
    ...job,
    status,
  };
}

export function isSam2JobActive(status: string | null): boolean {
  return status === "queued" || status === "running" || status === "cancelling";
}
