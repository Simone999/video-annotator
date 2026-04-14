# Milestone 1: Exact Frame Review

## Goal

Deliver a working slice that proves exact frame review is reliable.

## Scope

- video indexing
- video list
- video metadata
- playback pane
- exact frame endpoint
- frame image viewer
- jump to frame
- next/previous frame
- annotated-frame markers optional if cheap

## Must not include yet

- box editing
- mask editing
- SAM2
- export

## Acceptance criteria

A user can:
1. open a video
2. see metadata
3. watch the video in the playback pane
4. jump to frame N in the annotation pane
5. step to frame N-1 and N+1
6. reliably see the backend-decoded exact frame

## Key implementation constraints

- backend-decoded frame index is canonical
- browser video time is not annotation truth
- frame endpoint must support exact frame retrieval
- keep code small and typed

## Suggested tasks

### Backend
- add `Video` model
- implement video indexing service
- implement `GET /api/videos`
- implement `GET /api/videos/{video_id}`
- implement `GET /api/videos/{video_id}/frame/{frame_idx}`

### Frontend
- video list page
- selected video state
- playback pane
- exact frame pane
- frame number input
- prev/next frame actions

## Validation

- manual check on at least one video
- verify frame N remains stable across repeated requests
- verify frame stepping and jump input behave correctly