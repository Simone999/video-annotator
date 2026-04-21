---
title: Add live review timeline and selected range controls
type: note
permalink: video-annotator/tasks/add-live-review-timeline-and-selected-range-controls
id: task-add-live-review-timeline-and-selected-range-controls
status: todo
steps:
- creation
tags:
- task
- frontend
- review
- navigation
- timeline
---

# Add live review timeline and selected range controls

## Creation Phase

### Description

Add timeline-first transport to the live review surface so reviewers can move through canonical frames and pick a selected range without relying on raw frame-number entry as the primary workflow. Start from `frontend/src/app/live-review-app.tsx`, existing manifest frame lists in `workspace.ts`, and the single-stage review shell already shipped.

### Scope

- In scope: live bottom-bar timeline or range controls, selected-range local state, manifest-backed markers for annotated frames or keyframes, and frontend tests or browser proof for the new transport flow
- Out of scope: backend contract changes, export behavior, or replacing canonical frame truth with browser playback time

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Live review footer exposes timeline-first transport with visible current-frame position and reviewer-controlled selected range
- [ ] Annotated-frame or keyframe markers come from existing manifest data instead of invented frontend summaries
- [ ] Raw `Frame number` entry is no longer required for core review navigation; if kept, it is clearly secondary fallback UI
- [ ] Frontend integration and browser proof cover range selection plus timeline-driven frame movement

### Test Intent

- Backend: none; manifest frame lists already exist and this task should reuse them
- Frontend: prove timeline markers render from manifest data, current-frame movement stays canonical, and selected range changes stay coherent with existing jump controls
- Manual: browser-check that timeline and range controls feel reviewer-first and do not break paused-only editing rules

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Browser verification recorded honestly
- [ ] Feature note updated if live transport truth changes
- [ ] Verification recorded honestly
