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

export type ObjectTrackSummary = {
  id: number;
  label: string;
  color: string | null;
  status: string;
};

export type VideoManifest = {
  video: IndexedVideo;
  objects: ObjectTrackSummary[];
  annotated_frame_indices: number[];
  keyframe_indices: number[];
};

export type FrameAnnotation = {
  object_id: number;
  is_keyframe: boolean;
  source: string;
  box_xywh_norm: [number, number, number, number];
};

export type FrameAnnotations = {
  video_id: string;
  frame_idx: number;
  annotations: FrameAnnotation[];
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

type ObjectRequestOptions = VideoRequestOptions & {
  objectId: number;
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

export async function getVideoManifest(
  options: VideoRequestOptions,
): Promise<VideoManifest> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/manifest`,
    options,
  );
  return parseVideoManifest(response, "manifest");
}

export async function createObjectTrack(
  options: VideoRequestOptions & {
    label: string;
  },
): Promise<ObjectTrackSummary> {
  const response = await runJsonRequest(`/videos/${options.videoId}/objects`, {
    ...options,
    body: {
      label: options.label,
    },
    method: "POST",
  });
  return parseObjectTrackSummary(response, "object");
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

export async function getFrameAnnotations(
  options: FrameRequestOptions,
): Promise<FrameAnnotations> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}`,
    options,
  );
  return parseFrameAnnotations(response, "frameAnnotations");
}

export async function upsertFrameAnnotations(
  options: FrameRequestOptions & {
    annotations: readonly FrameAnnotation[];
  },
): Promise<FrameAnnotations> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}`,
    {
      ...options,
      body: {
        annotations: options.annotations,
      },
      method: "PUT",
    },
  );
  return parseFrameAnnotations(response, "frameAnnotations");
}

export async function deleteFrameAnnotation(
  options: ObjectRequestOptions & {
    frameIdx: number;
  },
): Promise<void> {
  await runRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}/object/${String(options.objectId)}`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
      },
      method: "DELETE",
    },
  );
}

export function getIndexedVideoPlaybackUrl(
  options: VideoRequestOptions,
): string {
  return buildApiUrl(`/videos/${options.videoId}/source`, options.baseUrl);
}

async function runJsonRequest(
  path: string,
  options: ClientOptions & {
    body?: unknown;
    method?: "GET" | "POST" | "PUT";
  },
): Promise<unknown> {
  const response = await runRequest(path, {
    baseUrl: options.baseUrl,
    body: options.body,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
    },
    method: options.method,
  });

  return (await response.json()) as unknown;
}

async function runRequest(
  path: string,
  options: {
    baseUrl?: string;
    body?: unknown;
    fetchFn?: FetchLike;
    headers: HeadersInit;
    method?: "DELETE" | "GET" | "POST" | "PUT";
  },
): Promise<Response> {
  const fetchFn = options.fetchFn ?? fetch;
  const requestInit: RequestInit = {
    headers: options.headers,
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
    ...(options.method === undefined ? {} : { method: options.method }),
  };
  const response = await fetchFn(
    buildApiUrl(path, options.baseUrl),
    requestInit,
  );

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

function parseVideoManifest(payload: unknown, path: string): VideoManifest {
  const value = assertObject(payload, path);

  return {
    annotated_frame_indices: parseIntegerList(
      value.annotated_frame_indices,
      `${path}.annotated_frame_indices`,
    ),
    keyframe_indices: parseIntegerList(
      value.keyframe_indices,
      `${path}.keyframe_indices`,
    ),
    objects: parseObjectTrackSummaryList(value.objects, `${path}.objects`),
    video: parseIndexedVideo(value.video, `${path}.video`),
  };
}

function parseObjectTrackSummaryList(
  payload: unknown,
  path: string,
): ObjectTrackSummary[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload.map((objectTrack, index) =>
    parseObjectTrackSummary(objectTrack, `${path}[${String(index)}]`),
  );
}

function parseObjectTrackSummary(
  payload: unknown,
  path: string,
): ObjectTrackSummary {
  const value = assertObject(payload, path);

  return {
    color: assertNullableString(value.color, `${path}.color`),
    id: assertInteger(value.id, `${path}.id`),
    label: assertString(value.label, `${path}.label`),
    status: assertString(value.status, `${path}.status`),
  };
}

function parseFrameAnnotations(
  payload: unknown,
  path: string,
): FrameAnnotations {
  const value = assertObject(payload, path);

  return {
    annotations: parseFrameAnnotationList(
      value.annotations,
      `${path}.annotations`,
    ),
    frame_idx: assertInteger(value.frame_idx, `${path}.frame_idx`),
    video_id: assertString(value.video_id, `${path}.video_id`),
  };
}

function parseFrameAnnotationList(
  payload: unknown,
  path: string,
): FrameAnnotation[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload.map((annotation, index) =>
    parseFrameAnnotation(annotation, `${path}[${String(index)}]`),
  );
}

function parseFrameAnnotation(payload: unknown, path: string): FrameAnnotation {
  const value = assertObject(payload, path);

  return {
    box_xywh_norm: parseNormalizedBox(
      value.box_xywh_norm,
      `${path}.box_xywh_norm`,
    ),
    is_keyframe: assertBoolean(value.is_keyframe, `${path}.is_keyframe`),
    object_id: assertInteger(value.object_id, `${path}.object_id`),
    source: assertString(value.source, `${path}.source`),
  };
}

function parseNormalizedBox(
  payload: unknown,
  path: string,
): [number, number, number, number] {
  if (!Array.isArray(payload) || payload.length !== 4) {
    throw new Error(`Expected ${path} to be an array of four numbers`);
  }

  return payload.map((value, index) =>
    assertNormalizedNumber(value, `${path}[${String(index)}]`),
  ) as [number, number, number, number];
}

function parseIntegerList(payload: unknown, path: string): number[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload.map((value, index) =>
    assertInteger(value, `${path}[${String(index)}]`),
  );
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

function assertNullableString(payload: unknown, path: string): string | null {
  if (payload === null) {
    return null;
  }

  return assertString(payload, path);
}

function assertNumber(payload: unknown, path: string): number {
  if (typeof payload !== "number" || Number.isNaN(payload)) {
    throw new Error(`Expected ${path} to be a number`);
  }

  return payload;
}

function assertInteger(payload: unknown, path: string): number {
  const value = assertNumber(payload, path);

  if (!Number.isInteger(value)) {
    throw new Error(`Expected ${path} to be an integer`);
  }

  return value;
}

function assertBoolean(payload: unknown, path: string): boolean {
  if (typeof payload !== "boolean") {
    throw new Error(`Expected ${path} to be a boolean`);
  }

  return payload;
}

function assertNormalizedNumber(payload: unknown, path: string): number {
  const value = assertNumber(payload, path);

  if (value < 0 || value > 1) {
    throw new Error(`Expected ${path} to be between 0 and 1`);
  }

  return value;
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
