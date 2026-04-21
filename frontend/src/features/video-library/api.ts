import type { VideoLibraryVideoState } from "./types";

export type VideoLibraryApiVideoReviewSummary = {
  annotated_frame_count: number;
  imported_frame_count: number;
  keyframe_count: number;
  last_annotated_frame_idx: number | null;
  last_reviewed_frame_idx: number | null;
  manual_frame_count: number;
  object_count: number;
  propagated_frame_count: number;
};

export type VideoLibraryApiVideo = {
  display_name: string;
  duration_seconds: number | null;
  fps: number;
  frame_count: number;
  height: number;
  id: string;
  propagation_progress_percent: number | null;
  review_state: VideoLibraryVideoState;
  review_summary: VideoLibraryApiVideoReviewSummary;
  source_path: string;
  width: number;
};

export class VideoLibraryApiError extends Error {
  readonly status: number;

  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "VideoLibraryApiError";
    this.status = status;
    this.detail = detail;
  }
}

type FetchLike = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetchFn?: FetchLike;
};

const DEFAULT_API_BASE_URL = "/api";

export async function listVideoLibraryVideos(
  options: ClientOptions = {},
): Promise<VideoLibraryApiVideo[]> {
  const response = await runJsonRequest("/videos", {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
  });

  return parseVideoList(response, "videos");
}

async function runJsonRequest(
  path: string,
  options: {
    baseUrl?: string;
    fetchFn?: FetchLike;
    headers?: HeadersInit;
    method?: string;
  },
): Promise<unknown> {
  const response = await runRequest(path, options);
  return (await response.json()) as unknown;
}

async function runRequest(
  path: string,
  options: {
    baseUrl?: string;
    fetchFn?: FetchLike;
    headers?: HeadersInit;
    method?: string;
  },
): Promise<Response> {
  const fetchFn = options.fetchFn ?? fetch;
  const response = await fetchFn(buildApiUrl(path, options.baseUrl), {
    headers: options.headers,
    method: options.method,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response;
}

function buildApiUrl(path: string, baseUrl = DEFAULT_API_BASE_URL): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function parseApiError(
  response: Response,
): Promise<VideoLibraryApiError> {
  const detail = await parseErrorDetail(response);
  return new VideoLibraryApiError(response.status, detail);
}

async function parseErrorDetail(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("application/json")) {
    const payload = (await response.json()) as unknown;
    if (
      isObject(payload) &&
      typeof payload.detail === "string" &&
      payload.detail.length > 0
    ) {
      return payload.detail;
    }
  }

  return response.statusText || "Request failed";
}

function parseVideoList(
  payload: unknown,
  path: string,
): VideoLibraryApiVideo[] {
  if (!Array.isArray(payload)) {
    throw new Error(`${path} must be an array`);
  }

  return payload.map((video, index) =>
    parseVideo(video, `${path}[${String(index)}]`),
  );
}

function parseVideo(payload: unknown, path: string): VideoLibraryApiVideo {
  const object = expectObject(payload, path);

  return {
    display_name: expectString(object.display_name, `${path}.display_name`),
    duration_seconds: expectNullableNumber(
      object.duration_seconds,
      `${path}.duration_seconds`,
    ),
    fps: expectNumber(object.fps, `${path}.fps`),
    frame_count: expectInteger(object.frame_count, `${path}.frame_count`),
    height: expectInteger(object.height, `${path}.height`),
    id: expectString(object.id, `${path}.id`),
    propagation_progress_percent: expectNullableInteger(
      object.propagation_progress_percent,
      `${path}.propagation_progress_percent`,
    ),
    review_state: expectReviewState(
      object.review_state,
      `${path}.review_state`,
    ),
    review_summary: parseReviewSummary(
      object.review_summary,
      `${path}.review_summary`,
    ),
    source_path: expectString(object.source_path, `${path}.source_path`),
    width: expectInteger(object.width, `${path}.width`),
  };
}

function parseReviewSummary(
  payload: unknown,
  path: string,
): VideoLibraryApiVideoReviewSummary {
  const object = expectObject(payload, path);

  return {
    annotated_frame_count: expectInteger(
      object.annotated_frame_count,
      `${path}.annotated_frame_count`,
    ),
    imported_frame_count: expectInteger(
      object.imported_frame_count,
      `${path}.imported_frame_count`,
    ),
    keyframe_count: expectInteger(
      object.keyframe_count,
      `${path}.keyframe_count`,
    ),
    last_annotated_frame_idx: expectNullableInteger(
      object.last_annotated_frame_idx,
      `${path}.last_annotated_frame_idx`,
    ),
    last_reviewed_frame_idx: expectNullableInteger(
      object.last_reviewed_frame_idx,
      `${path}.last_reviewed_frame_idx`,
    ),
    manual_frame_count: expectInteger(
      object.manual_frame_count,
      `${path}.manual_frame_count`,
    ),
    object_count: expectInteger(object.object_count, `${path}.object_count`),
    propagated_frame_count: expectInteger(
      object.propagated_frame_count,
      `${path}.propagated_frame_count`,
    ),
  };
}

function expectObject(payload: unknown, path: string): Record<string, unknown> {
  if (!isObject(payload)) {
    throw new Error(`${path} must be an object`);
  }

  return payload;
}

function expectString(payload: unknown, path: string): string {
  if (typeof payload !== "string") {
    throw new Error(`${path} must be a string`);
  }

  return payload;
}

function expectNumber(payload: unknown, path: string): number {
  if (typeof payload !== "number" || Number.isNaN(payload)) {
    throw new Error(`${path} must be a number`);
  }

  return payload;
}

function expectInteger(payload: unknown, path: string): number {
  const value = expectNumber(payload, path);
  if (!Number.isInteger(value)) {
    throw new Error(`${path} must be an integer`);
  }

  return value;
}

function expectNullableInteger(payload: unknown, path: string): number | null {
  if (payload === null) {
    return null;
  }

  return expectInteger(payload, path);
}

function expectNullableNumber(payload: unknown, path: string): number | null {
  if (payload === null) {
    return null;
  }

  return expectNumber(payload, path);
}

function expectReviewState(
  payload: unknown,
  path: string,
): VideoLibraryVideoState {
  if (
    payload === "not_started" ||
    payload === "started" ||
    payload === "in_progress" ||
    payload === "ready" ||
    payload === "exported"
  ) {
    return payload;
  }

  throw new Error(`${path} must be a known review state`);
}

function isObject(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}
