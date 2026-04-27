import { DEFAULT_API_BASE_URL } from "../../shared/api/base-url";

export type IndexedVideo = {
  id: string;
  source_path: string;
  display_name: string;
  frame_count: number;
  fps: number;
  width: number;
  height: number;
  duration_seconds: number | null;
  review_state?:
    | "not_started"
    | "started"
    | "in_progress"
    | "ready"
    | "exported";
};

export type ExactVideoFrame = {
  blob: Blob;
  mediaType: string;
};

export type ObjectSummary = {
  id: string;
  label: string;
  color: string;
  status: string;
};

export type VideoManifestVideo = {
  id: string;
  frame_count: number;
  fps: number;
  width: number;
  height: number;
  duration_seconds: number | null;
};

export type VideoManifest = {
  video: VideoManifestVideo;
  annotated_frames: number[];
  keyframes: number[];
  objects: ObjectSummary[];
};

export type Sam2SessionResponse = {
  session_id: string;
  reused: boolean;
};

export type Sam2MaskReference = {
  path: string;
};

export type AnnotationMaskReference = {
  path: string | null;
};

export type Sam2FrameAnnotation = {
  object_id: string;
  source: string;
  box_xywh_norm: [number, number, number, number];
  mask: Sam2MaskReference;
};

export type Sam2PromptBoxResponse = {
  frame_idx: number;
  annotation: Sam2FrameAnnotation;
};

export type Sam2RefineMaskAnnotation = {
  object_id: string;
  source: string;
  box_xywh_norm: [number, number, number, number] | null;
  mask: Sam2MaskReference;
  mask_confidence: number | null;
};

export type Sam2RefineMaskResponse = {
  frame_idx: number;
  annotation: Sam2RefineMaskAnnotation;
};

export type FrameAnnotation = {
  object_id: string;
  source: string;
  box_xywh_norm: [number, number, number, number] | null;
  mask: Sam2MaskReference | null;
};

export type FrameAnnotationsResponse = {
  frame_idx: number;
  annotations: FrameAnnotation[];
};

export type AnnotatedFrameAnnotationsResponse =
  readonly FrameAnnotationsResponse[];

export type CreateVideoObjectResponse = ObjectSummary;

export type CreateVideoExportResponse = {
  export_id: string;
};

export type ManualFrameAnnotation = {
  video_id: string;
  frame_idx: number;
  object_id: string;
  is_keyframe: boolean;
  source: string;
  box_xywh_norm: [number, number, number, number];
  mask: AnnotationMaskReference | null;
};

export type SelectedObjectTrackSummary = {
  frames: number;
  manual: number | null;
  missing: number | null;
  propagated: number;
  corrected: number | null;
};

export type SelectedObjectSummaryResponse = {
  video_id: string;
  object_id: string;
  label: string;
  bbox_xyxy_px: [number, number, number, number] | null;
  mask_confidence: number | null;
  track_summary: SelectedObjectTrackSummary;
};

export type Sam2PropagationDirection = "forward" | "backward" | "both";

export type Sam2PropagationJobResponse = {
  job_id: string;
  status: string;
  progress_current: number;
  progress_total: number;
};

export type Sam2JobStatusResponse = {
  job_id: string;
  type: string;
  status: string;
  progress_current: number;
  progress_total: number;
  result: Sam2PropagationResultResponse | null;
  error_message: string | null;
};

export type Sam2PropagationResultResponse = {
  persisted_frame_count: number;
  persisted_frame_indices: number[];
};

export type Sam2JobCancelResponse = {
  job_id: string;
  status: string;
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
  width?: number;
};

type ThumbnailSpriteRequestOptions = VideoRequestOptions & {
  startFrameIdx: number;
  count: number;
  width: number;
};

type CreateVideoObjectRequestOptions = VideoRequestOptions & {
  label: string;
  color?: string;
};

type CreateVideoExportRequestOptions = VideoRequestOptions;

type ManualFrameAnnotationRequestOptions = FrameRequestOptions & {
  objectId: string;
};

type ObjectMaskCleanupRequestOptions = VideoRequestOptions & {
  objectId: string;
};

type ObjectTrackDeleteRequestOptions = VideoRequestOptions & {
  objectId: string;
};

type SelectedObjectSummaryRequestOptions = VideoRequestOptions & {
  objectId: string;
  frameIdx: number;
  startFrameIdx: number;
  endFrameIdx: number;
};

type UpsertManualFrameAnnotationRequestOptions =
  ManualFrameAnnotationRequestOptions & {
    boxXywhNorm: readonly [number, number, number, number];
    isKeyframe: boolean;
  };

type Sam2PromptBoxRequestOptions = VideoRequestOptions & {
  sessionId: string;
  frameIdx: number;
  objectId: string;
  boxXyxyPx: readonly [number, number, number, number];
};

type Sam2RefineMaskRequestOptions = VideoRequestOptions & {
  sessionId: string;
  frameIdx: number;
  objectId: string;
  positivePoints: readonly [number, number][];
  negativePoints: readonly [number, number][];
};

type Sam2PropagationRequestOptions = VideoRequestOptions & {
  sessionId: string;
  direction: Sam2PropagationDirection;
  objectIds: readonly string[];
  seedFrameIdx?: number;
  rangeStartFrameIdx?: number;
  rangeEndFrameIdx?: number;
  startFrameIdx?: number;
  endFrameIdx?: number;
};

type JobRequestOptions = ClientOptions & {
  jobId: string;
};

export async function listIndexedVideos(
  options: ClientOptions = {},
): Promise<IndexedVideo[]> {
  const response = await runJsonRequest("/videos", {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
  });
  return parseIndexedVideoList(response, "videos");
}

export async function getIndexedVideo(
  options: VideoRequestOptions,
): Promise<IndexedVideo> {
  const response = await runJsonRequest(`/videos/${options.videoId}`, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
  });
  return parseIndexedVideo(response, "video");
}

export async function getVideoManifest(
  options: VideoRequestOptions,
): Promise<VideoManifest> {
  const response = await runJsonRequest(`/videos/${options.videoId}/manifest`, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
  });

  return parseVideoManifest(response, "manifest");
}

export async function getExactVideoFrame(
  options: FrameRequestOptions,
): Promise<ExactVideoFrame> {
  const response = await runRequest(getExactVideoFramePath(options), {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "image/png",
    },
  });

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

export function getExactVideoFrameUrl(options: FrameRequestOptions): string {
  return buildApiUrl(getExactVideoFramePath(options), options.baseUrl);
}

export function getVideoThumbnailSpriteUrl(
  options: ThumbnailSpriteRequestOptions,
): string {
  const searchParams = new URLSearchParams();
  searchParams.set("start_frame_idx", String(options.startFrameIdx));
  searchParams.set("count", String(options.count));
  searchParams.set("width", String(options.width));

  return buildApiUrl(
    `/videos/${options.videoId}/thumbnails/sprite?${searchParams.toString()}`,
    options.baseUrl,
  );
}

export function getFrameAnnotationMaskUrl(
  options: VideoRequestOptions & {
    frameIdx: number;
    objectId: string;
  },
): string {
  return buildApiUrl(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}/object/${options.objectId}/mask`,
    options.baseUrl,
  );
}

export function getExportDownloadUrl(
  options: ClientOptions & {
    exportId: string;
  },
): string {
  return buildApiUrl(`/exports/${options.exportId}`, options.baseUrl);
}

export async function createVideoObject(
  options: CreateVideoObjectRequestOptions,
): Promise<CreateVideoObjectResponse> {
  const response = await runJsonRequest(`/videos/${options.videoId}/objects`, {
    baseUrl: options.baseUrl,
    body: JSON.stringify({
      color: options.color,
      label: options.label,
    }),
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseObjectSummary(response, "object");
}

export async function createVideoExport(
  options: CreateVideoExportRequestOptions,
): Promise<CreateVideoExportResponse> {
  const response = await runJsonRequest(`/videos/${options.videoId}/export`, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
    method: "POST",
  });

  return parseCreateVideoExportResponse(response, "export");
}

export async function createSam2Session(
  options: VideoRequestOptions,
): Promise<Sam2SessionResponse> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/sam2/session`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
      },
      method: "POST",
    },
  );

  return parseSam2SessionResponse(response, "session");
}

export async function closeSam2Session(
  options: VideoRequestOptions & {
    sessionId: string;
  },
): Promise<void> {
  await runRequest(
    `/videos/${options.videoId}/sam2/session/${options.sessionId}`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      method: "DELETE",
    },
  );
}

export async function runSam2PromptBox(
  options: Sam2PromptBoxRequestOptions,
): Promise<Sam2PromptBoxResponse> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/sam2/prompt-box`,
    {
      baseUrl: options.baseUrl,
      body: JSON.stringify({
        box_xyxy_px: [...options.boxXyxyPx],
        frame_idx: options.frameIdx,
        object_id: options.objectId,
        session_id: options.sessionId,
      }),
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  return parseSam2PromptBoxResponse(response, "prompt");
}

export async function runSam2RefineMask(
  options: Sam2RefineMaskRequestOptions,
): Promise<Sam2RefineMaskResponse> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/sam2/refine-mask`,
    {
      baseUrl: options.baseUrl,
      body: JSON.stringify({
        frame_idx: options.frameIdx,
        negative_points: options.negativePoints,
        object_id: options.objectId,
        positive_points: options.positivePoints,
        session_id: options.sessionId,
      }),
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  return parseSam2RefineMaskResponse(response, "refine");
}

export async function getFrameAnnotations(
  options: FrameRequestOptions,
): Promise<FrameAnnotationsResponse> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseFrameAnnotationsResponse(response, "annotations");
}

export async function listAnnotatedFrameAnnotations(
  options: VideoRequestOptions,
): Promise<AnnotatedFrameAnnotationsResponse> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/annotations/annotated-frames`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseAnnotatedFrameAnnotationsResponse(response, "annotated_frames");
}

export async function getSelectedObjectSummary(
  options: SelectedObjectSummaryRequestOptions,
): Promise<SelectedObjectSummaryResponse> {
  const searchParams = new URLSearchParams({
    end_frame_idx: String(options.endFrameIdx),
    frame_idx: String(options.frameIdx),
    start_frame_idx: String(options.startFrameIdx),
  });
  const response = await runJsonRequest(
    `/videos/${options.videoId}/objects/${options.objectId}/summary?${searchParams.toString()}`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
      },
    },
  );

  return parseSelectedObjectSummaryResponse(response, "summary");
}

export async function upsertManualFrameAnnotation(
  options: UpsertManualFrameAnnotationRequestOptions,
): Promise<ManualFrameAnnotation> {
  const response = await runJsonRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}`,
    {
      baseUrl: options.baseUrl,
      body: JSON.stringify({
        box_xywh_norm: [...options.boxXywhNorm],
        is_keyframe: options.isKeyframe,
        object_id: options.objectId,
      }),
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
    },
  );

  return parseManualFrameAnnotation(response, "annotation");
}

export async function deleteManualFrameAnnotation(
  options: ManualFrameAnnotationRequestOptions,
): Promise<void> {
  await runRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}/object/${options.objectId}`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      method: "DELETE",
    },
  );
}

export async function deleteFrameAnnotationMask(
  options: ManualFrameAnnotationRequestOptions,
): Promise<void> {
  await runRequest(
    `/videos/${options.videoId}/annotations/frame/${String(options.frameIdx)}/object/${options.objectId}/mask`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      method: "DELETE",
    },
  );
}

export async function deleteObjectMasks(
  options: ObjectMaskCleanupRequestOptions,
): Promise<void> {
  await runRequest(
    `/videos/${options.videoId}/annotations/object/${options.objectId}/masks`,
    {
      baseUrl: options.baseUrl,
      fetchFn: options.fetchFn,
      method: "DELETE",
    },
  );
}

export async function deleteObjectTrack(
  options: ObjectTrackDeleteRequestOptions,
): Promise<void> {
  await runRequest(`/videos/${options.videoId}/objects/${options.objectId}`, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    method: "DELETE",
  });
}

export async function startSam2Propagation(
  options: Sam2PropagationRequestOptions,
): Promise<Sam2PropagationJobResponse> {
  const normalizedOptions = normalizeSam2PropagationRequestOptions(options);
  const response = await runJsonRequest(
    `/videos/${options.videoId}/sam2/propagate`,
    {
      baseUrl: options.baseUrl,
      body: JSON.stringify({
        direction: normalizedOptions.direction,
        object_ids: [...normalizedOptions.objectIds],
        range_end_frame_idx: normalizedOptions.rangeEndFrameIdx,
        range_start_frame_idx: normalizedOptions.rangeStartFrameIdx,
        seed_frame_idx: normalizedOptions.seedFrameIdx,
        session_id: normalizedOptions.sessionId,
      }),
      fetchFn: options.fetchFn,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  return parseSam2PropagationJobResponse(response, "job");
}

function getExactVideoFramePath(options: FrameRequestOptions): string {
  const searchParams = new URLSearchParams();
  if (options.width !== undefined) {
    searchParams.set("width", String(options.width));
  }

  const basePath = `/videos/${options.videoId}/frame/${String(options.frameIdx)}`;
  if (searchParams.size === 0) {
    return basePath;
  }

  return `${basePath}?${searchParams.toString()}`;
}

function normalizeSam2PropagationRequestOptions(
  options: Sam2PropagationRequestOptions,
): {
  direction: Sam2PropagationDirection;
  objectIds: readonly string[];
  rangeEndFrameIdx: number;
  rangeStartFrameIdx: number;
  seedFrameIdx: number;
  sessionId: string;
} {
  const seedFrameIdx = options.seedFrameIdx ?? options.startFrameIdx;
  const legacyBoundaryFrameIdx = options.endFrameIdx ?? seedFrameIdx;
  const rangeStartFrameIdx =
    options.rangeStartFrameIdx ??
    Math.min(
      seedFrameIdx ?? legacyBoundaryFrameIdx ?? 0,
      legacyBoundaryFrameIdx ?? 0,
    );
  const rangeEndFrameIdx =
    options.rangeEndFrameIdx ??
    Math.max(
      seedFrameIdx ?? legacyBoundaryFrameIdx ?? 0,
      legacyBoundaryFrameIdx ?? 0,
    );

  if (
    seedFrameIdx === undefined ||
    !Number.isInteger(rangeStartFrameIdx) ||
    !Number.isInteger(rangeEndFrameIdx)
  ) {
    throw new Error(
      "Propagation request requires seed/start/end frame values.",
    );
  }

  return {
    direction: options.direction,
    objectIds: options.objectIds,
    rangeEndFrameIdx,
    rangeStartFrameIdx,
    seedFrameIdx,
    sessionId: options.sessionId,
  };
}

export async function getSam2Job(
  options: JobRequestOptions,
): Promise<Sam2JobStatusResponse> {
  const response = await runJsonRequest(`/jobs/${options.jobId}`, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
  });

  return parseSam2JobStatusResponse(response, "job");
}

export async function cancelSam2Job(
  options: JobRequestOptions,
): Promise<Sam2JobCancelResponse> {
  const response = await runJsonRequest(`/jobs/${options.jobId}/cancel`, {
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: {
      Accept: "application/json",
    },
    method: "POST",
  });

  return parseSam2JobCancelResponse(response, "job");
}

async function runJsonRequest(
  path: string,
  options: {
    baseUrl?: string;
    body?: string;
    fetchFn?: FetchLike;
    headers?: HeadersInit;
    method?: string;
  },
): Promise<unknown> {
  const response = await runRequest(path, {
    body: options.body,
    baseUrl: options.baseUrl,
    fetchFn: options.fetchFn,
    headers: options.headers,
    method: options.method,
  });

  return (await response.json()) as unknown;
}

async function runRequest(
  path: string,
  options: {
    body?: BodyInit;
    baseUrl?: string;
    fetchFn?: FetchLike;
    headers?: HeadersInit;
    method?: string;
  },
): Promise<Response> {
  const fetchFn = options.fetchFn ?? fetch;
  const response = await fetchFn(buildApiUrl(path, options.baseUrl), {
    body: options.body,
    headers: options.headers,
    method: options.method,
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
    review_state: parseOptionalReviewState(
      value.review_state,
      `${path}.review_state`,
    ),
  };
}

function parseOptionalReviewState(
  payload: unknown,
  path: string,
): IndexedVideo["review_state"] {
  if (payload === undefined) {
    return undefined;
  }

  if (typeof payload !== "string") {
    throw new Error(`Expected ${path} to be a valid review state`);
  }

  switch (payload) {
    case "not_started":
    case "started":
    case "in_progress":
    case "ready":
    case "exported":
      return payload;
    default:
      throw new Error(`Expected ${path} to be a valid review state`);
  }
}

function parseVideoManifest(payload: unknown, path: string): VideoManifest {
  const value = assertObject(payload, path);

  return {
    annotated_frames: assertArray(
      value.annotated_frames,
      `${path}.annotated_frames`,
    ).map((frameIdx, index) =>
      assertNumber(frameIdx, `${path}.annotated_frames[${String(index)}]`),
    ),
    keyframes: assertArray(value.keyframes, `${path}.keyframes`).map(
      (frameIdx, index) =>
        assertNumber(frameIdx, `${path}.keyframes[${String(index)}]`),
    ),
    objects: assertArray(value.objects, `${path}.objects`).map(
      (objectSummary, index) =>
        parseObjectSummary(objectSummary, `${path}.objects[${String(index)}]`),
    ),
    video: parseVideoManifestVideo(value.video, `${path}.video`),
  };
}

function parseVideoManifestVideo(
  payload: unknown,
  path: string,
): VideoManifestVideo {
  const value = assertObject(payload, path);

  return {
    duration_seconds: assertNullableNumber(
      value.duration_seconds,
      `${path}.duration_seconds`,
    ),
    fps: assertNumber(value.fps, `${path}.fps`),
    frame_count: assertNumber(value.frame_count, `${path}.frame_count`),
    height: assertNumber(value.height, `${path}.height`),
    id: assertString(value.id, `${path}.id`),
    width: assertNumber(value.width, `${path}.width`),
  };
}

function parseObjectSummary(payload: unknown, path: string): ObjectSummary {
  const value = assertObject(payload, path);

  return {
    color: assertString(value.color, `${path}.color`),
    id: assertString(value.id, `${path}.id`),
    label: assertString(value.label, `${path}.label`),
    status: assertString(value.status, `${path}.status`),
  };
}

function parseCreateVideoExportResponse(
  payload: unknown,
  path: string,
): CreateVideoExportResponse {
  const value = assertObject(payload, path);

  return {
    export_id: assertString(value.export_id, `${path}.export_id`),
  };
}

function parseSam2SessionResponse(
  payload: unknown,
  path: string,
): Sam2SessionResponse {
  const value = assertObject(payload, path);

  return {
    reused: assertBoolean(value.reused, `${path}.reused`),
    session_id: assertString(value.session_id, `${path}.session_id`),
  };
}

function parseSam2PromptBoxResponse(
  payload: unknown,
  path: string,
): Sam2PromptBoxResponse {
  const value = assertObject(payload, path);

  return {
    annotation: parseSam2FrameAnnotation(
      value.annotation,
      `${path}.annotation`,
    ),
    frame_idx: assertNumber(value.frame_idx, `${path}.frame_idx`),
  };
}

function parseSam2RefineMaskResponse(
  payload: unknown,
  path: string,
): Sam2RefineMaskResponse {
  const value = assertObject(payload, path);

  return {
    annotation: parseSam2RefineMaskAnnotation(
      value.annotation,
      `${path}.annotation`,
    ),
    frame_idx: assertNumber(value.frame_idx, `${path}.frame_idx`),
  };
}

function parseSam2FrameAnnotation(
  payload: unknown,
  path: string,
): Sam2FrameAnnotation {
  const value = assertObject(payload, path);

  return {
    box_xywh_norm: assertNumberTuple4(
      value.box_xywh_norm,
      `${path}.box_xywh_norm`,
    ),
    mask: parseSam2MaskReference(value.mask, `${path}.mask`),
    object_id: assertString(value.object_id, `${path}.object_id`),
    source: assertString(value.source, `${path}.source`),
  };
}

function parseSam2RefineMaskAnnotation(
  payload: unknown,
  path: string,
): Sam2RefineMaskAnnotation {
  const value = assertObject(payload, path);

  return {
    box_xywh_norm: assertNullableNumberTuple4(
      value.box_xywh_norm,
      `${path}.box_xywh_norm`,
    ),
    mask: parseSam2MaskReference(value.mask, `${path}.mask`),
    mask_confidence: assertNullableNumber(
      value.mask_confidence,
      `${path}.mask_confidence`,
    ),
    object_id: assertString(value.object_id, `${path}.object_id`),
    source: assertString(value.source, `${path}.source`),
  };
}

function parseFrameAnnotationsResponse(
  payload: unknown,
  path: string,
): FrameAnnotationsResponse {
  const value = assertObject(payload, path);

  return {
    annotations: assertArray(value.annotations, `${path}.annotations`).map(
      (annotation, index) =>
        parseFrameAnnotation(
          annotation,
          `${path}.annotations[${String(index)}]`,
        ),
    ),
    frame_idx: assertNumber(value.frame_idx, `${path}.frame_idx`),
  };
}

function parseAnnotatedFrameAnnotationsResponse(
  payload: unknown,
  path: string,
): AnnotatedFrameAnnotationsResponse {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload.map((frameAnnotations, index) =>
    parseFrameAnnotationsResponse(
      frameAnnotations,
      `${path}[${String(index)}]`,
    ),
  );
}

function parseFrameAnnotation(payload: unknown, path: string): FrameAnnotation {
  const value = assertObject(payload, path);

  return {
    box_xywh_norm: assertNullableNumberTuple4(
      value.box_xywh_norm,
      `${path}.box_xywh_norm`,
    ),
    mask:
      assertNullableObject(value.mask, `${path}.mask`) === null
        ? null
        : parseSam2MaskReference(value.mask, `${path}.mask`),
    object_id: assertString(value.object_id, `${path}.object_id`),
    source: assertString(value.source, `${path}.source`),
  };
}

function parseManualFrameAnnotation(
  payload: unknown,
  path: string,
): ManualFrameAnnotation {
  const value = assertObject(payload, path);

  return {
    box_xywh_norm: assertNumberTuple4(
      value.box_xywh_norm,
      `${path}.box_xywh_norm`,
    ),
    frame_idx: assertNumber(value.frame_idx, `${path}.frame_idx`),
    is_keyframe: assertBoolean(value.is_keyframe, `${path}.is_keyframe`),
    mask:
      assertNullableObject(value.mask, `${path}.mask`) === null
        ? null
        : parseAnnotationMaskReference(value.mask, `${path}.mask`),
    object_id: assertString(value.object_id, `${path}.object_id`),
    source: assertString(value.source, `${path}.source`),
    video_id: assertString(value.video_id, `${path}.video_id`),
  };
}

function parseSelectedObjectSummaryResponse(
  payload: unknown,
  path: string,
): SelectedObjectSummaryResponse {
  const value = assertObject(payload, path);

  return {
    bbox_xyxy_px: assertNullableNumberTuple4(
      value.bbox_xyxy_px,
      `${path}.bbox_xyxy_px`,
    ),
    label: assertString(value.label, `${path}.label`),
    mask_confidence: assertNullableNumber(
      value.mask_confidence,
      `${path}.mask_confidence`,
    ),
    object_id: assertString(value.object_id, `${path}.object_id`),
    track_summary: parseSelectedObjectTrackSummary(
      value.track_summary,
      `${path}.track_summary`,
    ),
    video_id: assertString(value.video_id, `${path}.video_id`),
  };
}

function parseSelectedObjectTrackSummary(
  payload: unknown,
  path: string,
): SelectedObjectTrackSummary {
  const value = assertObject(payload, path);

  return {
    corrected: assertNullableNumber(value.corrected, `${path}.corrected`),
    frames: assertNumber(value.frames, `${path}.frames`),
    manual: assertNullableNumber(value.manual, `${path}.manual`),
    missing: assertNullableNumber(value.missing, `${path}.missing`),
    propagated: assertNumber(value.propagated, `${path}.propagated`),
  };
}

function parseSam2MaskReference(
  payload: unknown,
  path: string,
): Sam2MaskReference {
  const value = assertObject(payload, path);

  return {
    path: assertString(value.path, `${path}.path`),
  };
}

function parseAnnotationMaskReference(
  payload: unknown,
  path: string,
): AnnotationMaskReference {
  const value = assertObject(payload, path);

  return {
    path: assertNullableString(value.path, `${path}.path`),
  };
}

function parseSam2PropagationJobResponse(
  payload: unknown,
  path: string,
): Sam2PropagationJobResponse {
  const value = assertObject(payload, path);

  return {
    job_id: assertString(value.job_id, `${path}.job_id`),
    progress_current: assertNumber(
      value.progress_current,
      `${path}.progress_current`,
    ),
    progress_total: assertNumber(
      value.progress_total,
      `${path}.progress_total`,
    ),
    status: assertString(value.status, `${path}.status`),
  };
}

function parseSam2JobStatusResponse(
  payload: unknown,
  path: string,
): Sam2JobStatusResponse {
  const value = assertObject(payload, path);

  return {
    error_message: assertNullableString(
      value.error_message,
      `${path}.error_message`,
    ),
    job_id: assertString(value.job_id, `${path}.job_id`),
    progress_current: assertNumber(
      value.progress_current,
      `${path}.progress_current`,
    ),
    progress_total: assertNumber(
      value.progress_total,
      `${path}.progress_total`,
    ),
    result: parseSam2PropagationResultResponse(value.result, `${path}.result`),
    status: assertString(value.status, `${path}.status`),
    type: assertString(value.type, `${path}.type`),
  };
}

function parseSam2PropagationResultResponse(
  payload: unknown,
  path: string,
): Sam2PropagationResultResponse | null {
  if (payload === null) {
    return null;
  }

  const value = assertObject(payload, path);

  return {
    persisted_frame_count: assertNumber(
      value.persisted_frame_count,
      `${path}.persisted_frame_count`,
    ),
    persisted_frame_indices: assertArray(
      value.persisted_frame_indices,
      `${path}.persisted_frame_indices`,
    ).map((frameIdx, index) =>
      assertNumber(
        frameIdx,
        `${path}.persisted_frame_indices[${String(index)}]`,
      ),
    ),
  };
}

function parseSam2JobCancelResponse(
  payload: unknown,
  path: string,
): Sam2JobCancelResponse {
  const value = assertObject(payload, path);

  return {
    job_id: assertString(value.job_id, `${path}.job_id`),
    status: assertString(value.status, `${path}.status`),
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

function assertBoolean(payload: unknown, path: string): boolean {
  if (typeof payload !== "boolean") {
    throw new Error(`Expected ${path} to be a boolean`);
  }

  return payload;
}

function assertNullableNumber(payload: unknown, path: string): number | null {
  if (payload === null) {
    return null;
  }

  return assertNumber(payload, path);
}

function assertNullableString(payload: unknown, path: string): string | null {
  if (payload === null) {
    return null;
  }

  return assertString(payload, path);
}

function assertNullableObject(
  payload: unknown,
  path: string,
): Record<string, unknown> | null {
  if (payload === null) {
    return null;
  }

  return assertObject(payload, path);
}

function assertArray(payload: unknown, path: string): unknown[] {
  if (!Array.isArray(payload)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return payload;
}

function assertNumberTuple4(
  payload: unknown,
  path: string,
): [number, number, number, number] {
  if (!Array.isArray(payload) || payload.length !== 4) {
    throw new Error(`Expected ${path} to be an array of length 4`);
  }

  return [
    assertNumber(payload[0], `${path}[0]`),
    assertNumber(payload[1], `${path}[1]`),
    assertNumber(payload[2], `${path}[2]`),
    assertNumber(payload[3], `${path}[3]`),
  ];
}

function assertNullableNumberTuple4(
  payload: unknown,
  path: string,
): [number, number, number, number] | null {
  if (payload === null) {
    return null;
  }

  return assertNumberTuple4(payload, path);
}

function isObject(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}
