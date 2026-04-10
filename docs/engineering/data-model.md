# Data Model Spec

This document defines the SQLite metadata contract for the local-first
video annotation reviewer.

It intentionally covers only the metadata needed to index local videos. Later
milestones will define annotation, object, mask, SAM2, propagation, and export
data models.

## Contract Scope

- Uses a single SQLite `videos` table for indexed video metadata.
- The database lives under `data/`, which is the repository-owned location for
  SQLite-backed project metadata.
- `masks/` is reserved for later mask artifacts.
- `exports/` is reserved for later export outputs.

This document does not define a specific database filename or subdirectory.
Only the repository-owned storage boundary is part of the contract here.

## Frame Indexing Contract

- Backend-decoded frames are canonical.
- Internal frame indices are zero-based everywhere unless a later external
  boundary requires conversion.
- Browser `currentTime` never defines canonical annotation identity.
- Annotation create, edit, and delete operations must continue to bind to an
  explicit backend frame index in later milestone documents.

## `videos` Table

Stores one row per indexed local video.

### Required fields

- `video_id`: stable video identifier assigned by the backend and persisted
  unchanged
- `filepath`: local absolute or repository-relative file path used for indexing
- `fps`: frames per second for the indexed video
- `frame_count`: total number of decoded frames
- `width`: frame width in pixels
- `height`: frame height in pixels
- `duration_seconds`: total video duration in seconds

### Minimal constraints

The table must prevent duplicate indexing of the same local file and keep the
stored metadata internally consistent.

Recommended constraints:

```sql
CREATE TABLE videos (
  video_id TEXT PRIMARY KEY,
  filepath TEXT NOT NULL UNIQUE,
  fps REAL NOT NULL CHECK (fps > 0),
  frame_count INTEGER NOT NULL CHECK (frame_count > 0),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  duration_seconds REAL NOT NULL CHECK (duration_seconds >= 0)
);
```

The important contract points are:

- `video_id` is stable and unique.
- `filepath` is unique so the same file is not indexed twice.
- Numeric fields are required and must remain valid for indexed videos.

## Deferred Later-Milestone Data

The following are intentionally out of scope for Milestone 0 and will be
defined in later milestone documents:

- object lifecycle and object-track storage
- annotation lifecycle and frame-level write rules
- mask storage layout and mask persistence rules
- SAM2 session and prompt state
- propagation jobs and progress state
- export packaging and export manifest data

Those concerns should not be inferred from this document.
