# Video Annotation Reviewer

A local-first web application for reviewing and editing video annotations with exact frame control.

## Why this exists

General-purpose tools are often awkward for narrow video-review workflows. This project is designed for:

- exact frame-by-frame review
- jumping to a specific frame number
- drawing and editing boxes and masks
- using SAM2 as a preliminary annotator
- propagating masks through a selected frame range
- exporting deterministic annotations for downstream pipelines

## Core principle

The backend-decoded frame is the source of truth for annotation.

The browser video player is used for playback and rough navigation only. Annotation actions must always target an explicit backend frame index.

## Features

- open and inspect local videos
- pause/play video
- exact frame stepping
- jump to a frame number
- draw/edit/delete boxes
- view/edit/delete masks
- use SAM2 from a box prompt
- propagate masks forward/backward
- export JSON + PNG masks

## Tech stack

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + Python 3.12
- Video decoding: TorchCodec
- Storage: SQLite + local filesystem
- SAM2: official Meta SAM2 package

## Repository layout

- `frontend/` — UI application
- `backend/` — API, persistence, video frame service, SAM2 integration
- `docs/` — product and engineering docs
- `data/` — local dev videos and fixtures
- `masks/` — saved mask rasters
- `exports/` — exported datasets

## Getting started

See `docs/runbooks/dev-setup.md`.

## Product constraints

- backend-decoded frame index is canonical
- never use browser video time as annotation truth
- keep payloads explicit and deterministic
- optimize for exact review over feature breadth

## Status

This repo is intended to be implemented milestone-by-milestone. See `docs/plans/`.