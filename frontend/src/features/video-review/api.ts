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

export type ManifestVideo = {
  id: string;
  frame_count: number;
  fps: number;
  width: number;
  height: number;
  duration_seconds: number | null;
};

export type ObjectTrackSummary = {
  id: string;
  label: string;
  color: string;
  status: string;
};

export type VideoManifest = {
  video: ManifestVideo;
  objects: ObjectTrackSummary[];
  annotated_frames: number[];
  keyframes: number[];
};

export type AnnotationMaskSummary = {
  path: string | null;
};

export type ManualFrameAnnotation = {
  video_id: string;
  frame_idx: number;
  object_id: string;
  is_keyframe: boolean;
  source: string;
  box_xywh_norm: number[];
  mask: AnnotationMaskSummary;
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

type CreateObjectRequestOptions = VideoRequestOptions & {
  label: string;
};

type UpsertManualFrameAnnotationOptions = FrameRequestOptions & {
  objectId: string;
  is_keyframe: boolean;
  box_xywh_norm: number[];
};

type DeleteManualFrameAnnotationOptions = FrameRequestOptions & {
  objectId: string;
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

export async function createVideoObject(
  options: CreateObjectRequestOptions,
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

export async function upsertManualFrameAnnotation(
  options: UpsertManualFrameAnnotationOptions,
): Promise<ManualFrameAnnotation> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}`,
    {
      ...options,
      body: {
        box_xywh_norm: options.box_xywh_norm,
        is_keyframe: options.is_keyframe,
        object_id: options.objectId,
      },
      method: "PUT",
    },
  );
  return parseManualFrameAnnotation(response, "annotation");
}

export async function deleteManualFrameAnnotation(
  options: DeleteManualFrameAnnotationOptions,
): Promise<void> {
  await runRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}/object/${options.objectId}`,
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

export function getIndexedVideoPlaybackUrl(
  options: VideoRequestOptions,
): string {
  return buildApiUrl(`/videos/${options.videoId}/source`, options.baseUrl);
}

async function runJsonRequest(
  path: string,
  options: ClientOptions & {
    body?: unknown;
    method?: string;
  },
): Promise<unknown> {
  const hasBody = options.body !== undefined;
  const response = await runRequest(path, {
    baseUrl: options.baseUrl,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
    },
    method: options.method,
  });

  return (await response.json()) as unknown;
}

async function runRequest(
  path: string,
  options: {
    baseUrl?: string;
    body?: BodyInit;
    fetchFn?: FetchLike;
    headers: HeadersInit;
    method?: string;
  },
): Promise<Response> {
  const fetchFn = options.fetchFn ?? fetch;
  const requestInit: RequestInit = {
    headers: options.headers,
  };

  if (options.body !== undefined) {
    requestInit.body = options.body;
  }

  if (options.method !== undefined) {
    requestInit.method = options.method;
  }

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
    annotated_frames: assertIntegerArray(
      value.annotated_frames,
      `${path}.annotated_frames`,
    ),
    keyframes: assertIntegerArray(value.keyframes, `${path}.keyframes`),
    objects: parseObjectTrackSummaryList(value.objects, `${path}.objects`),
    video: parseManifestVideo(value.video, `${path}.video`),
  };
}

function parseManifestVideo(payload: unknown, path: string): ManifestVideo {
  const value = assertObject(payload, path);

  return {
    duration_seconds: assertNullableNumber(
      value.duration_seconds,
      `${path}.duration_seconds`,
    ),
    fps: assertNumber(value.fps, `${path}.fps`),
    frame_count: assertInteger(value.frame_count, `${path}.frame_count`),
    height: assertInteger(value.height, `${path}.height`),
    id: assertString(value.id, `${path}.id`),
    width: assertInteger(value.width, `${path}.width`),
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
    color: assertString(value.color, `${path}.color`),
    id: assertString(value.id, `${path}.id`),
    label: assertString(value.label, `${path}.label`),
    status: assertString(value.status, `${path}.status`),
  };
}

function parseManualFrameAnnotation(
  payload: unknown,
  path: string,
): ManualFrameAnnotation {
  const value = assertObject(payload, path);

  return {
    box_xywh_norm: assertNumberArray(
      value.box_xywh_norm,
      `${path}.box_xywh_norm`,
      4,
    ),
    frame_idx: assertInteger(value.frame_idx, `${path}.frame_idx`),
    is_keyframe: assertBoolean(value.is_keyframe, `${path}.is_keyframe`),
    mask: parseAnnotationMaskSummary(value.mask, `${path}.mask`),
    object_id: assertString(value.object_id, `${path}.object_id`),
    source: assertString(value.source, `${path}.source`),
    video_id: assertString(value.video_id, `${path}.video_id`),
  };
}

function parseAnnotationMaskSummary(
  payload: unknown,
  path: string,
): AnnotationMaskSummary {
  const value = assertObject(payload, path);

  return {
    path: value.path === null ? null : assertString(value.path, `${path}.path`),
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

function assertInteger(payload: unknown, path: string): number {
  const value = assertNumber(payload, path);
  if (!Number.isInteger(value)) {
    throw new Error(`Expected ${path} to be an integer`);
  }

  return value;
}

function assertNullableNumber(payload: unknown, path: string): number | null {
  if (payload === null) {
    return null;
  }

  return assertNumber(payload, path);
}

function assertBoolean(payload: unknown, path: string): boolean {
  if (typeof payload !== "boolean") {
    throw new Error(`Expected ${path} to be a boolean`);
  }

  return payload;
}

function assertIntegerArray(payload: unknown, path: string): number[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload.map((value, index) =>
    assertInteger(value, `${path}[${String(index)}]`),
  );
}

function assertNumberArray(
  payload: unknown,
  path: string,
  expectedLength?: number,
): number[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  if (expectedLength !== undefined && payload.length !== expectedLength) {
    throw new Error(
      `Expected ${path} to contain ${String(expectedLength)} numbers`,
    );
  }

  return payload.map((value, index) =>
    assertNumber(value, `${path}[${String(index)}]`),
  );
}

function isObject(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}
