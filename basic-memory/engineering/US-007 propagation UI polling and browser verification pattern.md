---
title: US-007 propagation UI polling and browser verification pattern
type: note
permalink: video-annotator/engineering/us-007-propagation-ui-polling-and-browser-verification-pattern
tags:
- frontend
- sam2
- jobs
- playwright
---

# US-007 propagation UI polling and browser verification pattern

Milestone-03 propagation controls now live in the exact-frame pane, but the implementation keeps concerns split cleanly. The rendered component owns direction and end-frame form inputs because they are transient UI choices tied to the current visible frame. The shared `useVideoReviewWorkspace()` hook still owns session state, job state, and polling, so the same propagation job can stay visible while the user keeps navigating canonical exact frames.

Auto polling only runs while the persisted job is in an active status: `queued`, `running`, or `cancelling`. Terminal statuses stop polling and leave the last job snapshot in shared state for UI display. This keeps progress deterministic and prevents job updates from mutating canonical `currentFrameIndex`.

Browser verification had one non-obvious trap: the draw-box gesture depends on a local `dragStart` state update between pointer phases. In browser automation, firing pointer down, move, and up in one synchronous block leaves `dragStart` unset for later phases, so `Run SAM2` never enables. Reliable verification needs staged pointer phases across renders.

## Observations
- [pattern] Keep SAM2 propagation form inputs local to the rendered exact-frame panel, but keep job/session state and polling inside `useVideoReviewWorkspace()` #frontend #sam2 #state
- [pattern] Poll `GET /api/jobs/{job_id}` only while job status is `queued`, `running`, or `cancelling`; terminal statuses should stop polling and preserve the last job snapshot for UI display #frontend #jobs
- [pattern] Propagation UI should show job progress without mutating canonical `currentFrameIndex`, so next/previous exact-frame navigation can stay usable during background work #frontend #ux
- [gotcha] Browser-side draw-box automation must stage pointer down, pointer move, and pointer up across separate render turns; same-tick dispatch leaves `dragStart` unset and the prompt action disabled #playwright #testing
- [verification] Browser pass succeeded on local Vite app with mocked `/api` routes, including queued -> running -> cancelling -> cancelled job flow and navigation from frame `7` to frame `8`; screenshot saved at `/tmp/us007-propagation-ui.png` #playwright #validation

## Relations
- extends [[US-005 frontend SAM2 workspace client and state patterns]]
- extends [[US-006 exact-frame SAM2 reload and overlay pattern]]
- extends [[US-004 SAM2 propagation job lifecycle patterns]]
- relates_to [[Milestone 3: SAM2 Prompt + Propagation]]