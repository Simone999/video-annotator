---
title: Why FrameAnnotation keeps video_id
type: note
permalink: video-annotator/backend/why-frameannotation-keeps-video-id
tags:
- backend
- persistence
- annotations
- data-model
---

# Why FrameAnnotation keeps video_id

This note answers one specific data-model question: why does
`FrameAnnotation` keep `video_id` even though `object_id` already points at
`ObjectTrack`?

The short answer is that annotation identity and annotation APIs are
video-scoped. `ObjectTrack` is stable within one video, but the backend still
looks up, validates, and persists frame annotations in the context of a
selected video and a canonical backend frame index. Keeping `video_id` explicit
in the row shape matches the way annotation routes, uniqueness rules, and exact
frame review work in practice.

## Observations
- [answer] The answer to "why does `FrameAnnotation` keep `video_id`" is that annotation APIs and annotation identity stay video-scoped. #backend #api
- [decision] Keep `FrameAnnotation.video_id` even though `object_id` references `ObjectTrack`, because annotation reads and writes remain video-scoped. #backend #data-model
- [constraint] Annotation identity is tied to a selected video and a canonical backend frame index, not only to an object track. #frame-index #annotations
- [constraint] The row shape should match the annotation API surface, which addresses annotations under `/api/videos/{video_id}/...`. #api #backend

## Relations
- relates_to [[FrameAnnotation row constraints]]
- relates_to [[Exact frame API]]
- relates_to [[Video review workspace state]]
