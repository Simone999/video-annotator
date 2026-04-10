# Video Annotation Reviewer + SAM2 Implementation Spec

## 1. Product goal

Build a local-first web application for reviewing and editing video annotations with exact frame control.

The application must support:

* watching a video with pause/play
* exact frame-by-frame navigation
* jumping to a specific frame number
* drawing boxes and masks on a frame
* modifying and deleting masks
* using SAM2 as a preliminary annotator from user prompts
* propagating masks across a selected frame range
* exporting annotations in a deterministic machine-readable format

This product is not a general annotation platform. It is a focused internal tool for a narrow workflow.

---

## 2. Product summary

### Problem

Existing tools are either too generic, inaccurate for exact frame review, or too heavy for a narrow workflow.

### Solution

A small custom reviewer where:

* the backend owns the canonical frame index
* the frontend displays both a playback video and an exact frame annotation surface
* SAM2 is used as an assistive segmentation/tracking engine
* exports are simple and tailored to downstream pipelines

### Key product principle

The browser video element is only for playback and rough navigation.
The backend-decoded frame image is the source of truth for annotation.

---

## 3. Users and use cases

### Primary user

A technical annotator or ML engineer reviewing sparse annotations on long videos.

### Main workflows

1. Open a video and inspect existing annotations
2. Jump to a frame number
3. Step one frame backward or forward
4. Draw a box on a frame
5. Convert the box to a SAM2 mask
6. Propagate that mask forward/backward through a frame window
7. Correct the mask manually if needed
8. Delete a bad mask
9. Save and export annotations

---

## 4. Scope

### In scope for v1

* single-user local deployment
* exact frame retrieval from backend
* video playback pane
* annotation pane for exact frame image
* rectangle drawing
* mask viewing and editing
* delete mask on frame
* delete whole object track
* SAM2 interactive prompt from box
* SAM2 propagation over selected frame range
* JSON export
* PNG mask export
* import existing boxes from current pipeline format

### Out of scope for v1

* multi-user collaboration
* comments and review queue
* authentication
* audit log
* polygon editing beyond simple mask brush editing
* cloud deployment
* large-scale annotation management
* auto-labeling without user prompt

---

## 5. Functional requirements

### 5.1 Video browsing

The app must:

* list available videos
* open a video
* show metadata: fps, total frames, resolution, duration
* play and pause the video
* scrub along the timeline
* jump to exact frame number
* move frame-by-frame in both directions
* jump to previous/next annotated frame
* jump to previous/next keyframe

### 5.2 Annotation visualization

The app must:

* show all annotations for the current frame
* overlay boxes
* overlay masks with adjustable opacity
* show object ids and labels
* list all objects in a side panel
* highlight the selected object

### 5.3 Box annotation

The user must be able to:

* create a box on the current frame
* move and resize a box
* delete a box
* assign a label to a box
* assign or reuse an object id

### 5.4 Mask annotation

The user must be able to:

* view a mask on the current frame
* create a mask via SAM2 from a box
* paint on a mask with add brush
* erase from a mask with erase brush
* delete a mask on a frame
* delete all masks for an object
* mark a frame as a manual correction keyframe

### 5.5 SAM2 assistance

The app must allow:

* starting a SAM2 session for a video
* sending a prompt box on a specific frame
* receiving the generated mask for that same frame
* refining a mask on a frame with updated prompt
* propagating an object forward, backward, or both
* canceling a propagation job
* showing propagation progress incrementally

### 5.6 Persistence

The app must:

* autosave edits or save on explicit action
* persist object ids, labels, frame annotations, masks, and keyframes
* persist exportable project state locally

### 5.7 Export

The app must export:

* native JSON
* binary mask images per frame per object
* optional box-only export

---

## 6. Non-functional requirements

* local-first
* deterministic frame indexing
* stable save format
* responsive UI for long videos
* frame retrieval under 250 ms for local cached frames, acceptable under 750 ms uncached
* propagation progress must stream back incrementally
* app must remain usable while propagation is in progress
* predictable keyboard controls
* clear failure states for missing model, GPU issues, or corrupt media

---

## 7. Product decisions

### 7.1 Canonical frame source

Canonical frame index comes from backend decoding, not from browser time math.

### 7.2 Two-pane design

Use:

* playback pane for watching
* exact frame pane for annotation

### 7.3 Annotation truth source

Annotation operations are bound to exact backend frame index N.

### 7.4 SAM2 integration model

SAM2 is an assistive service, not the storage system.

### 7.5 Persistence model

Store metadata in a DB and masks on disk.

---

## 8. System architecture

### 8.1 High-level architecture

Components:

* React frontend
* FastAPI backend
* local database
* frame extraction service
* SAM2 worker service
* local file storage for masks and exports

### 8.2 Frontend responsibilities

* render video playback pane
* render exact frame annotation canvas
* keyboard shortcuts
* object list
* timeline markers
* state management for current video, frame, selection, tools
* call backend APIs
* render streamed SAM2 updates

### 8.3 Backend responsibilities

* index videos
* decode exact frames
* serve frames as images
* persist annotations
* manage exports
* manage SAM2 sessions and jobs
* translate between frontend payloads and SAM2 predictor API

### 8.4 Worker responsibilities

* long-running SAM2 propagation
* optional background export jobs
* GPU-bound inference isolation

---

## 9. Recommended tech stack

### Frontend

* React
* TypeScript
* Vite
* Zustand or Redux Toolkit
* Konva or Fabric.js for overlay editing
* React Query for data fetching

### Backend

* FastAPI
* Python 3.12
* Pydantic
* SQLAlchemy or SQLModel
* Uvicorn

### Video/frame handling

* TorchCodec for exact frame decode
* optional ffmpeg for thumbnails and transcode utilities

### Storage

* SQLite for v1
* Postgres optional later
* local filesystem for masks and exports

### SAM2

* official `sam2` package from Meta repo
* one dedicated inference module or worker

---

## 10. Reuse from SAM2 demo

Reuse aggressively from the demo backend, selectively from the frontend. (`~/projects/sam2/demo`)

### Reuse directly or with light adaptation

* session lifecycle logic
* predictor wrapper
* prompt submission flow
* propagation flow
* RLE mask serialization helpers
* multipart streaming pattern for propagation results

### Use only as reference

* GraphQL schema
* demo-specific frontend layout
* gallery/upload flows
* generic demo UX

### Do not copy into core app without review

* Flask app structure
* demo-only auth, gallery, or static asset assumptions

---

## 11. Core domain model

### Video

* id
* filepath
* name
* width
* height
* fps
* frame_count
* duration_seconds
* created_at

### ObjectTrack

* id
* video_id
* label
* color
* status
* created_at
* updated_at

### FrameAnnotation

* id
* video_id
* frame_idx
* object_id
* is_keyframe
* source (`manual`, `sam2`, `sam2_edited`, `imported`)
* box_x
* box_y
* box_w
* box_h
* mask_path
* mask_rle optional
* created_at
* updated_at

### Sam2Session

* id
* video_id
* status
* predictor_state_ref
* created_at
* last_used_at

### Job

* id
* type
* video_id
* object_id optional
* status
* progress_current
* progress_total
* payload_json
* result_json
* error_message
* created_at
* updated_at

---

## 12. Frame indexing contract

This is a critical part of the product.

Rules:

* frame indices are zero-based everywhere internally unless there is a strong external reason not to
* the backend is the source of truth for frame count and exact frame decoding
* the frontend never derives canonical frame ids from `currentTime`
* when playback updates, the frontend can display approximate playback position and backend frame estimate, but annotation actions must always use explicit backend frame requests

If external tools use one-based indices, adapters must convert at the edges.

---

## 13. API design

## 13.1 Video APIs

### GET `/api/videos`

Returns all indexed videos.

### GET `/api/videos/{video_id}`

Returns metadata for one video.

### GET `/api/videos/{video_id}/manifest`

Returns frame_count, fps, duration, annotated frames, keyframes, object summary.

### GET `/api/videos/{video_id}/frame/{frame_idx}`

Returns exact frame image.
Optional query params:

* `format=png|jpeg`
* `width=` preview scale

### GET `/api/videos/{video_id}/thumbnails`

Returns timeline thumbnail strip for a frame range.

## 13.2 Annotation APIs

### GET `/api/videos/{video_id}/annotations`

Returns all objects and frame annotations for a video.

### PUT `/api/videos/{video_id}/annotations/frame/{frame_idx}`

Upserts annotations for one frame.

Request body:

* list of objects on that frame
* boxes
* masks
* metadata

### DELETE `/api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`

Deletes annotation for one object on one frame.

### POST `/api/videos/{video_id}/objects`

Creates a new object track.

### PATCH `/api/videos/{video_id}/objects/{object_id}`

Updates label/color/status.

### DELETE `/api/videos/{video_id}/objects/{object_id}`

Deletes the whole object track and all linked frame annotations.

## 13.3 SAM2 APIs

### POST `/api/videos/{video_id}/sam2/session`

Creates or reuses a SAM2 session for the video.

### DELETE `/api/videos/{video_id}/sam2/session/{session_id}`

Closes the SAM2 session and frees resources.

### POST `/api/videos/{video_id}/sam2/prompt-box`

Input:

* session_id
* frame_idx
* object_id
* box_xyxy_px or box_xywh_px

Output:

* same frame index
* mask RLE or mask PNG reference
* confidence metadata if available

### POST `/api/videos/{video_id}/sam2/refine-mask`

Input:

* session_id
* frame_idx
* object_id
* optional positive/negative points
* optional edited mask seed

Output:

* updated mask for that frame

### POST `/api/videos/{video_id}/sam2/propagate`

Input:

* session_id
* start_frame_idx
* end_frame_idx optional
* direction `forward|backward|both`
* object_ids

Output:

* job id
* or stream of frame-wise updates

### POST `/api/jobs/{job_id}/cancel`

Cancels propagation.

### GET `/api/jobs/{job_id}`

Returns status and progress.

## 13.4 Export APIs

### POST `/api/videos/{video_id}/export`

Creates export package.

Request options:

* `native_json`
* `png_masks`
* `boxes_only`
* `include_unannotated=false`

### GET `/api/exports/{export_id}`

Downloads export package.

---

## 14. API payload shapes

### 14.1 Manifest response

```json
{
  "video": {
    "id": "vid_001",
    "filepath": "/data/patient_001/video.mp4",
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92
  },
  "annotated_frames": [120, 121, 130, 220],
  "keyframes": [120, 130],
  "objects": [
    {"id": 1, "label": "left"},
    {"id": 2, "label": "right"}
  ]
}
```

### 14.2 Frame annotations response

```json
{
  "video_id": "vid_001",
  "frame_idx": 120,
  "annotations": [
    {
      "object_id": 1,
      "label": "left",
      "is_keyframe": true,
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
      "mask": {
        "type": "png",
        "path": "masks/vid_001/object_1/frame_000120.png"
      }
    }
  ]
}
```

### 14.3 SAM2 prompt-box request

```json
{
  "session_id": "sam2_sess_01",
  "frame_idx": 120,
  "object_id": 1,
  "box_xyxy_px": [620, 280, 760, 470]
}
```

### 14.4 SAM2 frame result

```json
{
  "frame_idx": 120,
  "results": [
    {
      "object_id": 1,
      "mask": {
        "type": "rle",
        "size": [1080, 1920],
        "counts": "..."
      }
    }
  ]
}
```

---

## 15. Native export format

Directory layout:

```text
export/
  annotations.json
  masks/
    vid_001/
      object_1/
        frame_000120.png
        frame_000121.png
      object_2/
        frame_000220.png
```

### `annotations.json`

```json
{
  "version": 1,
  "videos": [
    {
      "video_id": "vid_001",
      "filepath": "/data/patient_001/video.mp4",
      "fps": 25.0,
      "frame_count": 8123,
      "objects": [
        {
          "id": 1,
          "label": "left",
          "frames": {
            "120": {
              "is_keyframe": true,
              "source": "manual",
              "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
              "mask_path": "masks/vid_001/object_1/frame_000120.png"
            },
            "121": {
              "is_keyframe": false,
              "source": "sam2",
              "mask_path": "masks/vid_001/object_1/frame_000121.png"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 16. Frontend UX spec

## 16.1 Main layout

Three-column layout:

* left: video list and object list
* center: playback pane and annotation pane
* right: inspector, controls, and timeline details

## 16.2 Center area

Top: playback video
Bottom: exact frame annotation canvas

Alternative: toggle tabs if screen space is limited.

## 16.3 Timeline

Timeline must show:

* current playback position
* current exact frame index
* annotated frame markers
* keyframe markers
* propagation range selection

## 16.4 Keyboard shortcuts

* `Space`: play/pause
* `<`: previous frame
* `>`: next frame
* `Shift+ >`: previous annotated frame
* `Shift+ <`: next annotated frame
* `g`: jump to frame dialog
* `b`: box tool
* `m`: mask brush tool
* `e`: erase brush
* `Delete`: delete selected annotation
* `s`: save

## 16.5 Annotation tools

* select
* box
* brush add
* brush erase
* pan/zoom

## 16.6 Object panel

Must show:

* object id
* label
* color
* visibility toggle
* lock toggle
* delete object action
* current frame presence indicator

---

## 17. Backend implementation notes

## 17.1 Frame service

Responsibilities:

* decode exact frame N from video
* cache recently requested frames
* return image bytes efficiently

Implementation notes:

* use TorchCodec for exact decode
* maintain LRU cache of frame images or tensors
* optionally prefetch nearby frames on frame stepping

## 17.2 Annotation service

Responsibilities:

* CRUD for objects and frame annotations
* save masks on disk
* normalize and validate boxes
* record source and keyframe info

## 17.3 SAM2 service

Responsibilities:

* create predictor instance
* initialize predictor state on video
* accept box prompt
* refine with points or mask if needed
* propagate over selected range
* serialize masks to RLE or PNG
* manage resource cleanup

## 17.4 Job service

Responsibilities:

* run propagation asynchronously
* track progress
* stream results
* allow cancel

---

## 18. SAM2 adapter spec

### Goal

Hide raw SAM2 predictor details behind a narrow internal interface.

### Interface

```python
class Sam2VideoService:
    def create_session(self, video_path: str) -> str: ...
    def close_session(self, session_id: str) -> None: ...
    def prompt_box(self, session_id: str, frame_idx: int, object_id: int, box_xyxy_px: list[int]) -> MaskResult: ...
    def refine(self, session_id: str, frame_idx: int, object_id: int, positive_points: list[list[float]] | None = None, negative_points: list[list[float]] | None = None, seed_mask: bytes | None = None) -> MaskResult: ...
    def propagate(self, session_id: str, start_frame_idx: int, direction: str, end_frame_idx: int | None = None, object_ids: list[int] | None = None): ...
```

### Expected internal mapping

* build predictor once per worker
* `init_state(video_path)` when session starts
* `add_new_points_or_box(...)` for box prompting
* `propagate_in_video(...)` for tracking
* threshold masks
* convert to PNG or RLE

### Cleanup

* close sessions explicitly
* clear model state on session close
* ensure GPU memory is released as much as possible

---

## 19. Sequence diagrams in prose

### 19.1 Open video

1. User selects video
2. Frontend requests manifest and annotation summary
3. Frontend opens playback pane with video URL
4. Frontend initializes annotation pane to first annotated frame or frame 0

### 19.2 Jump to frame

1. User enters frame number
2. Frontend requests exact frame image from backend
3. Frontend updates annotation pane to that frame
4. Playback pane optionally seeks approximately to the same time

### 19.3 Box to SAM2 mask

1. User draws box on exact frame canvas
2. Frontend saves temporary box
3. Frontend calls `prompt-box`
4. Backend creates or reuses session
5. Backend runs SAM2 prompt on that frame
6. Backend returns mask
7. Frontend overlays mask
8. User accepts or edits
9. Frontend saves final annotation

### 19.4 Propagate

1. User selects object and range
2. User clicks propagate
3. Frontend calls propagation endpoint
4. Backend schedules job or opens stream
5. Backend yields frame-wise masks
6. Frontend updates timeline markers and cached annotations progressively
7. User can cancel
8. Final results are persisted

---

## 20. Error handling

Must handle:

* video decode failure
* unsupported codec
* SAM2 model missing
* GPU unavailable
* out-of-memory
* corrupt mask file
* save conflict
* failed export
* cancelled propagation

User-visible errors must be concise and actionable.

---

## 21. Testing strategy

## 21.1 Unit tests

* frame index conversions
* box normalization
* mask serialization and deserialization
* annotation CRUD rules
* export generation
* job state transitions

## 21.2 Integration tests

* decode exact frame N repeatedly and compare checksum
* save then reload annotations
* prompt box returns mask on same frame
* propagation writes expected sequence of results
* object deletion removes related frame annotations

## 21.3 UI tests

* jump to frame
* frame stepping
* draw box
* delete mask
* export flow

## 21.4 Golden tests

Maintain a small test video fixture and frozen expected outputs for:

* exact frame image hashes
* exported JSON
* mask PNG checksums

---

## 22. Performance plan

### v1 optimizations

* LRU frame cache
* thumbnail cache
* prefetch neighboring frames on step forward/backward
* scale-down preview for non-annotation playback when needed
* stream propagation results instead of batching everything

### Later optimizations

* background frame decoding queue
* multi-resolution frame pyramid
* shared memory transport for decoded frames

---

## 23. Security and privacy

For v1 local-only deployment:

* no external upload required
* all data remains local
* API bound to localhost by default
* no telemetry

---

## 24. Deployment model

### Local development

* frontend dev server
* FastAPI backend
* local SQLite DB
* local masks/export folder
* local GPU SAM2 worker

### Local production-like

* frontend built static assets served by backend or reverse proxy
* backend as one process
* SAM2 worker as separate process

---

## 25. Repo structure

```text
repo/
  frontend/
    src/
      app/
      components/
      features/
        video/
        annotations/
        sam2/
      api/
      state/
      utils/
  backend/
    app/
      api/
      core/
      db/
      models/
      schemas/
      services/
        video_frames.py
        annotations.py
        sam2_service.py
        exports.py
        jobs.py
      workers/
      tests/
  data/
  exports/
  masks/
  docs/
    product/
    engineering/
```

---

## 26. Documentation set required for implementation

The agent should create and maintain these docs:

### A. Product requirements document

Must contain:

* problem
* users
* scope
* success criteria
* non-goals

### B. Architecture decision record

Must capture:

* why backend-decoded frame is canonical
* why FastAPI + React
* why SAM2 is isolated behind adapter service
* why masks are stored on disk

### C. API spec

Must define:

* endpoints
* request/response examples
* error codes
* streaming behavior

### D. Data model spec

Must define:

* DB schema
* file layout
* frame indexing contract
* object and mask lifecycle rules

### E. Frontend interaction spec

Must define:

* layout
* keyboard shortcuts
* tools
* selection rules
* timeline behavior

### F. SAM2 integration spec

Must define:

* session lifecycle
* prompt flow
* propagation flow
* serialization format
* cleanup behavior

### G. Export spec

Must define:

* native JSON schema
* mask directory layout
* versioning strategy

### H. Test plan

Must define:

* unit tests
* integration tests
* UI tests
* golden fixtures

### I. Runbook

Must define:

* dev startup
* model download
* cache cleanup
* common failure recovery

---

## 28. Definition of done

The product is done for v1 when:

* a user can open a video
* jump to an exact frame number
* step frame by frame
* draw or edit a box
* generate a SAM2 mask from that box
* correct the mask manually
* propagate the object across a selected range
* delete bad masks or whole tracks
* export the final annotations as JSON + PNG masks

---

## 29. Risks and mitigations

### Risk: browser playback and frame mismatch

Mitigation:

* never use playback pane as annotation truth source

### Risk: GPU memory leaks or stale sessions

Mitigation:

* explicit session close
* job isolation
* resource monitoring

### Risk: slow propagation on long videos

Mitigation:

* range-limited propagation
* streaming progress
* cancellation support

### Risk: mask storage explosion

Mitigation:

* save only annotated or propagated frames
* optional compression

---

## 30. Suggested implementation order for the agent

1. Create repo scaffolding and docs
2. Implement video indexing and exact frame endpoint
3. Build frame viewer and navigation UI
4. Implement object and box CRUD
5. Implement annotation persistence
6. Implement mask overlay and editing
7. Integrate SAM2 session + prompt-box
8. Integrate propagation
9. Implement export
10. Add tests, fixtures, and polish

---

## 31. Instructions for the implementation agent

### Constraints

* optimize for correctness and exact frame review over feature breadth
* avoid premature abstraction
* do not use browser video time as canonical annotation index
* keep all frame and annotation payloads explicit and deterministic
* prefer small typed modules

### Expected output from agent

The agent should produce:

* code
* migration scripts if needed
* tests
* docs listed above
* sample fixture data
* a runnable local setup

### Mandatory acceptance demo

The agent must provide a short demo flow:

1. load one sample video
2. jump to frame 120
3. draw a box
4. run SAM2 on that frame
5. propagate forward 30 frames
6. erase a region on one propagated frame
7. export the result

---

## 32. Nice-to-have v2 ideas

* multiple annotators
* comments and review states
* positive/negative click refinement UI
* interpolation for manual boxes
* side-by-side model comparison
* temporal smoothing utilities
* import/export adapters for external annotation tools
* background thumbnail generation

---

## 33. Final recommendation

Build the product as a narrow, exact-frame reviewer with SAM2 assistance.
Do not try to replicate a full annotation platform in v1.
Use the official SAM2 demo backend patterns for inference sessions and propagation, but keep your own application architecture and UX.
