---
title: Fix review play export and exact-frame loading
type: plan
status: done
permalink: video-annotator/plans/fix-review-play-export-and-exact-frame-loading
tags:
- plan
- frontend
- backend
- review
- export
- playback
---

# Fix review play export and exact-frame loading

Fix review stage bugs that still break play, export truth, and paused frame loading.

## Summary
- Goal: make play work from paused review state, remove paused-frame flash, and collapse export to one honest full-package flow.
- Success criteria: play works from exact-frame review, paused frame keeps old exact image until next exact image arrives, and one Export button creates one zip with `annotations.json` and mask PNGs.
- Audience: stage-2 task session in current repo state.

## Current State
- Existing behavior: paused exact-frame UI unmounts playback `<video>`, so play toggle can lose media ref.
- Main gaps: paused frame load briefly falls back to video; export UI and API still pretend to offer multiple profiles.
- Constraints: backend frame index stays annotation truth; do not add stop button; keep old exact frame visible while next exact frame loads.

## Assumptions And Open Questions
- Locked assumptions:
  - while video plays, preview frame index may stay browser-timed
  - when paused, backend exact frame for that same shown index stays edit truth
  - export becomes one full package only
- Open questions:
  - none after user decisions on export and paused-frame behavior

## Affected Features
- [[Video Ingest and Exact-Frame Review]]
- [[Export]]

## Task Breakdown
1. [[Fix review play export and exact-frame loading task]] — add tests and implement review stage state cleanup.
2. [[Fix review play export and exact-frame loading task]] — collapse export API and UI to one honest flow.
3. [[Fix review play export and exact-frame loading task]] — update docs and durable notes after code is green.

## Handoff Notes
- Read current review controller, review surface panel, exact-frame hook, export API client, export route, and export service first.
- Keep changes surgical: no review-shell redesign, no propagation redesign, no export artifact format change beyond single-profile route cleanup.
- Verify frontend and backend slices with fresh commands before any success claim.
