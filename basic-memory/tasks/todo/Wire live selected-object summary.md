---
title: Wire live selected-object summary
type: note
permalink: video-annotator/tasks/wire-live-selected-object-summary
id: task-wire-live-selected-object-summary
status: todo
steps:
- creation
tags:
- task
- frontend
- inspector
- summary
- review
---

# Wire live selected-object summary

## Creation Phase

### Description

Use the shipped selected-object summary backend contract on the live review path so the inspector shows bbox, nullable confidence, and selected-range counters from persisted truth instead of local guesses or missing UI. This is the live frontend consumer for the selected-object summary mask confidence route. Start from `frontend/src/features/video-review/api.ts`, `workspace.ts`, and `frontend/src/app/live-review-app.tsx`.

### Scope

- In scope: typed API client for `GET /api/videos/{video_id}/objects/{object_id}/summary`, workspace state or loading flow for selected-object summary, live inspector rendering for bbox or confidence or `frames / propagated / corrected`, and frontend tests or browser proof
- Out of scope: changing backend summary semantics, inventing non-null confidence or corrected values, or shipping export actions

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Frontend has typed client support for the selected-object summary route and loads it from live review state
- [ ] Inspector renders bbox, nullable confidence, and selected-range counters from backend summary data for the selected object
- [ ] Inspector copy favors reviewer-facing label or summary first and keeps raw technical ids secondary
- [ ] Frontend integration and browser proof cover object change or range change and resulting summary refresh

### Test Intent

- Backend: none; selected-object summary route already has backend API integration coverage
- Frontend: prove summary fetch happens for selected object and current range, and UI renders honest nullable values without local fake counters
- Manual: browser-check that inspector summary updates as selected object or range changes

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Browser verification recorded honestly
- [ ] Feature note updated if inspector truth changes
- [ ] Verification recorded honestly
