# Product Requirements

## Problem

Current annotation workflows are too generic for exact-frame video review. This product targets a narrow local-first workflow where the user inspects existing annotations, corrects them at a specific backend frame, and exports deterministic results for downstream pipelines.

The browser video element is only for playback and rough navigation. Canonical annotation work must happen against backend-decoded frames.

## Users

- Primary user: a technical annotator or ML engineer reviewing sparse annotations on long videos.
- Secondary user: a downstream pipeline owner who depends on stable, machine-readable exports and deterministic frame references.

## Scope

### Full v1 product scope

- Single-user local deployment.
- Exact frame retrieval from the backend.
- A playback pane for watching video.
- An exact-frame annotation pane for editing the canonical frame image.
- Rectangle drawing.
- Mask viewing and editing.
- Delete mask on a frame.
- Delete a whole object track.
- SAM2 prompt-based mask assistance from a box.
- SAM2 propagation over a selected frame range.
- JSON export.
- PNG mask export.
- Import of existing boxes from the current pipeline format.

### Milestone 0 delivery state

- Repo scaffold and baseline documentation only.
- No implemented annotation workflow yet.
- No verified API, UI, persistence, or SAM2 behavior yet.
- No build, lint, typecheck, or test commands should be implied until matching config exists.

## Success Criteria

- The product stays local-first and deterministic.
- Backend-decoded frames remain the canonical source for annotation.
- Frame indices are zero-based internally and stay stable across save and export paths.
- Annotation create, edit, and delete actions are always bound to an explicit backend frame index.
- The UI supports exact frame review and does not depend on browser `currentTime` for canonical annotation identity.
- Exports are stable, repeatable, and machine-readable.
- Propagation can report incremental progress and remain cancellable without freezing the UI.

## Non-Goals

- Multi-user collaboration.
- Comments or review queues.
- Authentication.
- Audit logging.
- Cloud deployment.
- Large-scale annotation management.
- Polygon editing beyond simple mask brush editing.
- Auto-labeling without a user prompt.

## Product Invariants

- The product is a narrow local-first video annotation reviewer, not a general annotation platform.
- Backend-decoded frames are canonical.
- Zero-based frame indices are used internally everywhere unless converting at an external boundary.
- Canonical annotation frame IDs must never be derived from browser `currentTime`.
- Every annotation create, edit, or delete operation must be bound to an explicit backend frame index.
- SAM2 is an assistive service, not the storage system.
- Local persistence belongs on the filesystem and in the database, not in browser state alone.
