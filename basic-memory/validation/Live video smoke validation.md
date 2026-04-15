---
title: Live video smoke validation
type: note
permalink: video-annotator/validation/live-video-smoke-validation
tags:
- validation
- smoke-test
- exact-frame
---

# Live video smoke validation

This note answers what a real local smoke pass needs to prove and why mocked
browser checks are not enough. Mocked UI tests are still useful, but they can
hide integration failures in the local stack, such as broken backend startup
commands or file-layout assumptions that only show up with a real indexed
video.

A valid smoke pass uses a real local video and exercises the actual end-to-end
review path. The important outcome is not a task checkbox. It is confidence
that local startup, routing, playback, exact-frame fetching, and repeatability
all agree on the same backend-owned video state.

## Observations
- [lesson] Mocked browser checks can miss local-stack integration failures, so the review workflow needs at least one unmocked browser smoke pass. #validation #playwright
- [check] A valid smoke pass proves video list load, selection, metadata display, playback load, jump to a specific exact frame, and previous and next stepping. #validation #workflow
- [check] Repeated requests for the same `video_id` and `frame_idx` should return identical exact-frame bytes. #backend #repeatability

## Relations
- relates_to [[Backend dev startup command]]
- relates_to [[Local video source setup]]
- relates_to [[Jump to frame interaction]]
- relates_to [[Frame stepping interaction]]
