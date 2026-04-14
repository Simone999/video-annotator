export type IndexedVideo = {
  id: string;
  source_path: string;
  display_name: string;
  frame_count: number;
  fps: number;
  width: number;
  height: number;
  duration_seconds: number | null;
};

export type ExactVideoFrame = {
  blob: Blob;
  mediaType: string;
};

export class VideoReviewApiError extends Error {
  readonly status: number;

  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "VideoReviewApiError";
    this.status = status;
    this.detail = detail;
  }
}

type FetchLike = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetchFn?: FetchLike;
};

type VideoRequestOptions = ClientOptions & {
  videoId: string;
};

type FrameRequestOptions = VideoRequestOptions & {
  frameIdx: number;
};

const DEFAULT_API_BASE_URL = "/api";

export async function listIndexedVideos(
  options: ClientOptions = {},
): Promise<IndexedVideo[]> {
  const response = await runJsonRequest("/videos", options);
  return parseIndexedVideoList(response, "videos");
}

export async function getIndexedVideo(
  options: VideoRequestOptions,
): Promise<IndexedVideo> {
  const response = await runJsonRequest(`/videos/${options.videoId}`, options);
  return parseIndexedVideo(response, "video");
}

export async function getExactVideoFrame(
  options: FrameRequestOptions,
): Promise<ExactVideoFrame> {
  const response = await runRequest(
    `/videos/${options.videoId}/frame/${String(options.frameIdx)}`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      headers: {
        Accept: "image/png",
      },
    },
  );

  const mediaType = response.headers.get("content-type") ?? "";
  if (!mediaType.startsWith("image/png")) {
    throw new Error("Expected image/png exact-frame response");
  }

  return {
    blob: await response.blob(),
    mediaType,
  };
}

async function runJsonRequest(
  path: string,
  options: ClientOptions,
): Promise<unknown> {
  const response = await runRequest(path, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
  });

  return (await response.json()) as unknown;
}

async function runRequest(
  path: string,
  options: {
    baseUrl?: string;
    fetchFn?: FetchLike;
    headers: HeadersInit;
  },
): Promise<Response> {
  const fetchFn = options.fetchFn ?? fetch;
  const response = await fetchFn(buildApiUrl(path, options.baseUrl), {
    headers: options.headers,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response;
}

async function parseApiError(response: Response): Promise<VideoReviewApiError> {
  const detail = await parseErrorDetail(response);
  return new VideoReviewApiError(response.status, detail);
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

function buildApiUrl(path: string, baseUrl = DEFAULT_API_BASE_URL): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function parseIndexedVideoList(payload: unknown, path: string): IndexedVideo[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload.map((video, index) =>
    parseIndexedVideo(video, `${path}[${String(index)}]`),
  );
}

function parseIndexedVideo(payload: unknown, path: string): IndexedVideo {
  const value = assertObject(payload, path);

  return {
    id: assertString(value.id, `${path}.id`),
    source_path: assertString(value.source_path, `${path}.source_path`),
    display_name: assertString(value.display_name, `${path}.display_name`),
    frame_count: assertNumber(value.frame_count, `${path}.frame_count`),
    fps: assertNumber(value.fps, `${path}.fps`),
    width: assertNumber(value.width, `${path}.width`),
    height: assertNumber(value.height, `${path}.height`),
    duration_seconds: assertNullableNumber(
      value.duration_seconds,
      `${path}.duration_seconds`,
    ),
  };
}

function assertObject(payload: unknown, path: string): Record<string, unknown> {
  if (!isObject(payload)) {
    throw new Error(`Expected ${path} to be an object`);
  }

  return payload;
}

function assertString(payload: unknown, path: string): string {
  if (typeof payload !== "string") {
    throw new Error(`Expected ${path} to be a string`);
  }

  return payload;
}

function assertNumber(payload: unknown, path: string): number {
  if (typeof payload !== "number" || Number.isNaN(payload)) {
    throw new Error(`Expected ${path} to be a number`);
  }

  return payload;
}

function assertNullableNumber(payload: unknown, path: string): number | null {
  if (payload === null) {
    return null;
  }

  return assertNumber(payload, path);
}

function isObject(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}
