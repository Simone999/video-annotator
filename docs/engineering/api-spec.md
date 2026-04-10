# Milestone 0 API Spec

This document is the Milestone 0 backend API contract for the local-first
video annotation reviewer.

It intentionally defines only the approved Milestone 0 routes:

- `GET /api/health`
- `POST /api/videos/index`
- `GET /api/videos`
- `GET /api/videos/{video_id}`

Everything else is deferred to later milestones and is listed explicitly at the
end of this document.

## Contract Principles

- Backend-decoded frames are canonical.
- Frame indices are zero-based internally everywhere unless a later external
  boundary requires conversion.
- Canonical annotation identity must never be derived from browser
  `currentTime`.
- Annotation create, edit, and delete operations are always bound to an
  explicit backend frame index.

These rules apply to the video indexing flow as well. The API may expose video
metadata, but it does not shift canonical frame identity into the browser.

## `GET /api/health`

### Purpose

Return a minimal service health signal so the local backend can be checked
without touching video storage or decoding paths.

### Request

```http
GET /api/health
```

### Response example

```json
{
  "status": "ok"
}
```

### Milestone 0 error behavior

- `503 Service Unavailable` if the backend process is up but cannot serve the
  API normally.
- `500 Internal Server Error` for unexpected failures in the health handler.

The health route should stay dependency-light. It should not require a video to
be indexed before returning success.

## `POST /api/videos/index`

### Purpose

Register a local video for backend indexing so the backend can decode the video,
persist its metadata, and make it available through the video list and metadata
routes.

This route is the Milestone 0 entry point for the video indexing flow.

### Request example

```json
{
  "filepath": "/data/patient_001/video.mp4"
}
```

### Response example

```json
{
  "video": {
    "video_id": "vid_001",
    "filepath": "/data/patient_001/video.mp4",
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92
  }
}
```

The `video` object is the same metadata shape returned by `GET /api/videos` and
`GET /api/videos/{video_id}`.

### Milestone 0 error behavior

- `400 Bad Request` if the payload is missing `filepath` or the request body
  shape is invalid.
- `404 Not Found` if the referenced local file does not exist.
- `422 Unprocessable Content` if the file exists but cannot be decoded or does
  not satisfy the backend's indexing requirements.
- `500 Internal Server Error` for storage, indexing, or unexpected backend
  failures.

If the same local file is indexed more than once, Milestone 0 should return the
existing indexed record instead of creating a duplicate record.

## `GET /api/videos`

### Purpose

Return the current set of indexed videos so the UI can populate the video list
and open an existing project without re-indexing.

### Request

```http
GET /api/videos
```

### Response example

```json
{
  "videos": [
    {
      "video_id": "vid_001",
      "filepath": "/data/patient_001/video.mp4",
      "fps": 25.0,
      "frame_count": 8123,
      "width": 1920,
      "height": 1080,
      "duration_seconds": 324.92
    }
  ]
}
```

### Milestone 0 error behavior

- `500 Internal Server Error` if the backend cannot read the indexed video
  catalog.

An empty catalog is not an error. The route should return an empty `videos`
array when no videos have been indexed yet.

## `GET /api/videos/{video_id}`

### Purpose

Return the persisted metadata for one indexed video so the frontend can open
that video and prepare later frame-level operations.

### Request

```http
GET /api/videos/vid_001
```

### Response example

```json
{
  "video_id": "vid_001",
  "filepath": "/data/patient_001/video.mp4",
  "fps": 25.0,
  "frame_count": 8123,
  "width": 1920,
  "height": 1080,
  "duration_seconds": 324.92
}
```

### Milestone 0 error behavior

- `404 Not Found` if `video_id` does not match an indexed video.
- `500 Internal Server Error` if the backend cannot load the stored metadata.

## Deferred Later-Milestone APIs

The following API families are intentionally deferred and must not be implied
by this Milestone 0 contract:

- Manifest: `GET /api/videos/{video_id}/manifest`
- Exact frame image: `GET /api/videos/{video_id}/frame/{frame_idx}`
- Thumbnails: `GET /api/videos/{video_id}/thumbnails`
- Annotations: `GET /api/videos/{video_id}/annotations`
- Annotation upserts and deletes: frame-level annotation writes, object-track
  creation, update, and delete routes
- SAM2: session, prompt-box, refine-mask, and propagation routes
- Export: export package creation and download routes
- Jobs: job status and cancel routes
- Streaming progress: any SSE, websocket, or other incremental propagation
  progress transport

Later-milestone documents will define these routes, payloads, and failure modes
once the corresponding product behavior exists.
