# Video Annotation Reviewer + SAM2 Implementation Spec

## 1. Product goal

Build a local-first web application for reviewing and editing video annotations with exact frame control.

The application must support:

* browsing a video library and selecting work
* watching a video with pause/play
* exact frame-by-frame navigation
* jumping to a specific frame number
* drawing boxes and masks on a paused canonical frame
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
* the frontend displays one main review surface with playback video and overlayed annotations
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

1. Open the video library and select work
2. Open a video and inspect existing annotations
3. Jump to a frame number
4. Step one frame backward or forward
5. Draw a box on the paused review frame
6. Convert the box to a SAM2 mask
7. Propagate that mask forward/backward through a frame window
8. Correct the mask manually if needed
9. Delete a bad mask
10. Save and export annotations

---

## 4. Scope

### In scope for v1

* single-user local deployment
* video library entry screen
* exact frame retrieval from backend
* one main review surface with playback and overlayed annotations
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
* show review state in the library
* show propagation progress only while a video is in progress
* import existing boxes from the current pipeline format
* let the user open a selected video into the main review surface
* show for each library card: preview image, display name, state badge, frame count, FPS, resolution, last reviewed frame or `Not Started`, one state detail line, and `Open Review`
* play and pause the video
* scrub along the timeline
* jump to exact frame number
* move frame-by-frame in both directions
* jump to previous/next annotated frame
* jump to previous/next keyframe

### 5.2 Annotation visualization

The app must:

* show all annotations for the current frame on the main review surface
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

Edit, save, delete, and SAM2 actions are paused-only and must target the canonical backend current frame.

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

### 7.2 Single review surface

Use one main review surface:

* playback remains available in the surface
* annotations overlay the video
* there is no separate playback pane

### 7.3 Paused-only review actions

Edit, save, delete, and SAM2 actions must run only when playback is paused on the canonical backend frame.

### 7.4 Annotation truth source

Annotation operations are bound to exact backend frame index N.

### 7.5 SAM2 integration model

SAM2 is an assistive service, not the storage system.

### 7.6 Persistence model

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

* render a video library entry screen
* render the main review surface with playback and overlayed annotations
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
* review_state (`not_started`, `started`, `in_progress`, `ready`, `exported`)
* propagation_progress optional, visible only while `review_state = in_progress`
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
* mask_confidence optional
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

### SelectedObjectSummary

Derived review response, not a persisted table.

Shipped response fields:

* video_id
* object_id
* label
* bbox_xyxy_px
* mask_confidence optional
* track_summary { frames, propagated, corrected }

Counter semantics:

* `track_summary.frames`: total frames in selected range
* `track_summary.propagated`: frames in selected range with propagated mask for this object
* `track_summary.corrected`: propagated masks later fixed by reviewer in selected range
* only untouched `source = "sam2"` rows may expose numeric `mask_confidence`
* corrected count comes from non-keyframe `source = "sam2_edited"` rows; corrected keyframes do not increment it

---

## 12. Frame indexing contract

This is a critical part of the product.

Rules:

* frame indices are zero-based everywhere internally unless there is a strong external reason not to
* the backend is the source of truth for frame count and exact frame decoding
* the frontend never derives canonical frame ids from `currentTime`
* when playback updates, the frontend can display approximate playback position and backend frame estimate, but annotation actions must always use explicit backend frame requests
* browser time never becomes annotation truth

If external tools use one-based indices, adapters must convert at the edges.

---

## 13. API design

The following library review-state fields and selected-object summary endpoint are shipped backend contracts. This spec keeps the high-level shape and current nullability caveats aligned with the runtime docs.

## 13.1 Video APIs

### GET `/api/videos`

Returns all indexed videos.

Response items include:

* `review_state`: `not_started`, `started`, `in_progress`, `ready`, `exported`
* `propagation_progress_percent`: propagation completion only, shown only when `review_state = in_progress`

State meanings:

* `not_started`: indexed video with no imported boxes and no saved review output yet
* `started`: imported boxes exist, but the reviewer has not saved a manual review edit yet
* `in_progress`: propagation job is currently running for the video
* `ready`: current saved state is ready for manual review or export
* `exported`: latest export reflects current saved review state

State transitions:

* importing boxes moves a video to `started`
* the first manual save moves `not_started` or `started` to `ready`
* pressing `Propagate` moves `ready` to `in_progress`, then back to `ready` when propagation finishes
* any manual edit after `exported` moves the video back to `ready`
* importing new boxes over already reviewed or exported work resets the video to `started` until the next manual save

### GET `/api/videos/{video_id}`

Returns metadata for one video.

### GET `/api/videos/{video_id}/manifest`

Returns frame_count, fps, duration, annotated frames, keyframes, object summary.

Manifest responses include the same review-state fields used by the library screen plus derived review-summary facts for the library view.

### GET `/api/videos/{video_id}/frame/{frame_idx}`

Returns exact frame image.
Optional query params:

* `format=png|jpeg`
* `width=` preview scale

### GET `/api/videos/{video_id}/thumbnails`

Returns timeline thumbnail strip for a frame range.

### GET `/api/videos/{video_id}/objects/{object_id}/summary`

Returns the selected-object summary for the review surface.

Query params:

* `frame_idx`
* `start_frame_idx`
* `end_frame_idx`

Response fields:

* `label`
* `bbox_xyxy_px`
* `mask_confidence`
* `track_summary` with `frames`, `propagated`, and `corrected`

This endpoint now ships. `mask_confidence` is numeric only for untouched `source = "sam2"` current-frame rows. `track_summary.corrected` counts non-keyframe `source = "sam2_edited"` rows in selected range.

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

Frame annotation responses should include `mask_confidence` when an untouched SAM2-generated mask is still authoritative. Manual-only rows use `null`, and reviewer-corrected masks use `null`.

### DELETE `/api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`

Deletes annotation for one object on one frame.

### DELETE `/api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask`

Deletes only saved mask for one object on one frame.

Notes:

* preserve annotation row only when it still has box truth
* clear `mask_path`, `mask_rle`, and `mask_confidence`
* delete mask-only propagated rows instead of leaving empty annotation ghosts
* do not touch adjacent-frame rows for same object

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
* positive and/or negative point prompts

Notes:

* backend seeds SAM2 from persisted same-frame mask PNG; client does not send seed path
* preserve existing box truth; propagated rows without stored box stay `box_xywh_norm = null`

Output:

* same-frame persisted annotation payload with `source = "sam2_edited"` and `mask_confidence = null`

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

Response:

```json
{
  "export_id": "export-1234abcd"
}
```

Current honest option pairs:

* `native_json=true`, `png_masks=true`, `boxes_only=false`
* `native_json=true`, `png_masks=false`, `boxes_only=true`

### GET `/api/exports/{export_id}`

Downloads export package as `application/zip`.

---

## 14. API payload shapes

### 14.1 Manifest response

```json
{
  "video": {
    "id": "vid_001",
    "review_state": "in_progress",
    "propagation_progress_percent": 68,
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92,
    "review_summary": {
      "object_count": 3,
      "annotated_frame_count": 58,
      "imported_frame_count": 0,
      "keyframe_count": 3,
      "manual_frame_count": 3,
      "propagated_frame_count": 55,
      "last_annotated_frame_idx": 220,
      "last_reviewed_frame_idx": 130
    }
  },
  "annotated_frames": [120, 121, 130, 220],
  "keyframes": [120, 130],
  "objects": [
    {"id": "object-001", "label": "left"},
    {"id": "object-002", "label": "right"}
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
      "mask": null
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

### 14.5 Selected object summary

```json
{
  "video_id": "vid_001",
  "object_id": "object-001",
  "label": "Pedestrian",
  "bbox_xyxy_px": [620, 280, 760, 470],
  "mask_confidence": null,
  "track_summary": {
    "frames": 42,
    "propagated": 39,
    "corrected": 3
  }
}
```

`bbox_xyxy_px` and `mask_confidence` are scoped to `frame_idx`. `track_summary` is scoped to `start_frame_idx` and `end_frame_idx`. `mask_confidence` is numeric only for untouched `source = "sam2"` rows. `track_summary.corrected` counts non-keyframe `source = "sam2_edited"` rows.

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

* left: navigation rail and object list
* center: main review surface with playback and overlayed annotations
* right: inspector, controls, and timeline details

## 16.2 Center area

The center area is one review surface, not separate playback and exact-frame panes.

Playback remains visible in the surface, with overlays and frame-specific editing controls layered onto the canonical backend frame when paused.

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

Edit, save, delete, and SAM2 actions remain disabled until playback is paused on the canonical backend frame.

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
3. Frontend opens the main review surface with video playback and overlays
4. Frontend initializes the canonical frame controls to the first annotated frame or frame 0

### 19.2 Jump to frame

1. User enters frame number
2. Frontend requests exact frame image from backend
3. Frontend updates the main review surface to that frame
4. Playback remains contextual and may seek approximately to the same time

### 19.3 Box to SAM2 mask

1. User pauses playback on the canonical backend frame
2. User draws box on the main review surface
3. Frontend saves temporary box
4. Frontend calls `prompt-box`
5. Backend creates or reuses session
6. Backend runs SAM2 prompt on that frame
7. Backend returns mask
8. Frontend overlays mask
9. User accepts or edits
10. Frontend saves final annotation

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
* delete mask on one frame without dropping adjacent masks
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
      features/
        video-library/
          components/
          hooks/
          pages/
        video-review/
          components/
          hooks/
          pages/
    tests/
      unit/
      integration/
      e2e/
  backend/
    app/
      api/
      db/
      schemas/
      services/
        video_indexing.py
        review_summaries.py
        video_frames.py
        manual_frame_annotations.py
        sam2.py
    scripts/
  data/
  exports/
  masks/
  docs/
    engineering/
    runbooks/
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

* never use browser playback as annotation truth source

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
