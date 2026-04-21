---
title: 'm-1: Annotation Foundation'
type: note
status: done
permalink: video-annotator/milestones/m-1-annotation-foundation
tags:
- milestone
- roadmap
- annotation
- box-crud
---

# m-1: Annotation Foundation

## Goal

Ship stable object identity, manifest-backed review state, and manual box CRUD without using browser playback time as annotation truth. This milestone established the persistence foundation later review and SAM2 work depend on.

## What To Implement

- stable per-video object identity and manifest summary reads
- manual box create, reload, edit, resize, and delete on exact backend frames
- frontend object selection flow backed by persisted objects instead of raw object-id typing

## Checklist

- [x] stable object identity persists per video
- [x] manual box CRUD persists and reloads by backend `frame_idx`
- [x] review UI uses persisted object selection for manual box work

## Related Features

- [[Annotation Foundation and Manual Box Workflow]]

## Related Tasks

- [[Testing annotation foundation and manual box workflow]]
