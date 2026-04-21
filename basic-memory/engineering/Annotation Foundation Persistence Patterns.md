---
title: Annotation Foundation Persistence Patterns
type: note
permalink: video-annotator/engineering/annotation-foundation-persistence-patterns
tags:
- engineering
- annotation
- persistence
- patterns
---

# Annotation Foundation Persistence Patterns

This note captures the durable implementation rules behind manifest-backed object identity and manual frame annotation persistence.

## Observations
- [pattern] Parse manifest, object-create, and manual-annotation payloads at the frontend API boundary before reducer updates.
- [pattern] Store saved manual annotations by backend `frame_idx` then `object_id`, separate from canonical `currentFrameIndex`.
- [pattern] Manual frame annotation writes must validate video ownership, frame bounds, and object ownership in one backend service layer.
- [pattern] Manual writes upsert by `(video_id, frame_idx, object_id)` and clear persisted mask metadata so manual rows reopen with `mask: null`.
- [guardrail] Frame-scoped annotation reads must include manual rows even when mask data is null, or saved-box reload breaks.

## Relations
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[API]]
- relates_to [[Data Model]]
