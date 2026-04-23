---
title: Todo Tasks Index
type: note
permalink: video-annotator/tasks/todo/index
tags:
- task
- memory
- index
- todo
---

# Todo Tasks Index

This note explains `basic-memory/tasks/todo/`. Use it when you need the folder meaning for concrete task notes not started yet.

## Status Meaning

- concrete task notes with `status: todo` live here
- keep todo notes in creation phase only until task session starts
- split large backlog slices until each task fits one implementation PR and one Ralph iteration

## Current Todo Tasks
- [[Add object-track delete and summary reset]]
- [[Review m-4 parity and drift]]
- [[Persist export records]]
- [[Build native JSON exporter]]
- [[Build mask and boxes-only export]]
- [[Add export API and client]]
- [[Wire export UI and exported state]]
- [[Review m-5 parity and drift]]
- [[Containerize backend E2E bootstrap]]
- [[Containerize frontend E2E app]]
- [[Support Playwright Docker mode]]
- [[Add Docker E2E commands and docs]]
- [[Review m-7 hardening checkpoint]]
- [[Run release verification workflow]]
- [[Review m-7 parity and drift]]

## Observations
- [routing] Concrete task notes with `status: todo` live in `tasks/todo/`.
- [discipline] Todo notes now split roadmap work into one-iteration slices with explicit review checkpoints.
- [guardrail] UI-touching todo tasks should preserve current 1920x1080 route direction from committed `docs/ui` PNGs; matching HTML mockups are guides only. #ui #tasks
- [retrieval] Use this note for todo-task folder meaning or backlog routing queries.

## Relations
- indexed_by [[Tasks Index]]
- relates_to [[Task]]
