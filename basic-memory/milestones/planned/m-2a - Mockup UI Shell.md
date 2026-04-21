---
title: 'm-2a: Mockup UI Shell'
type: note
status: planned
permalink: video-annotator/milestones/m-2a-mockup-ui-shell
tags:
- milestone
- roadmap
- frontend
- ui
- mockup
---

# m-2a: Mockup UI Shell

## Goal

Ship the mockup-first frontend shell only. This milestone is UI-only: no backend work, no new review business logic, and no live contract wiring.

## What To Implement

- fixture-backed UI shell as default app entry
- video library screen from `docs/ui/video-library.html`
- review screen from `docs/ui/video-annotation.html`
- local page actions between library and review
- frontend UI integration tests for the shell

## Guardrails

- keep backend and `/api` contract work out of scope
- keep `frontend/src/features/video-review` logic untouched unless one tiny host adapter is truly needed
- use local page state only; no router library
- use static frontend fixtures and mocked HTTP only

## Checklist

- [ ] default app opens the fixture-backed library shell
- [ ] library shell matches the mockup and opens review for one chosen fixture video
- [ ] review shell matches the mockup with local state only
- [ ] navigation between pages works with no router
- [ ] frontend integration tests prove the shell behavior

## Related Features

- [[Review Workspace Ergonomics]]
- [[Frontend Interaction Spec]]

## Related Tasks

- [[Build UI shell fixture foundation]]
- [[Build video library mockup shell]]
- [[Build review page mockup shell]]
- [[Wire page actions and local UI state]]
- [[Add UI integration tests for shell]]
- [[Review m-2 and m-2a code and grow backlog]]

## Observations

- [scope] This milestone is UI-only and must not pull backend or live review logic into the shell work. #frontend #ui
- [guardrail] Local page state and static fixture data are the chosen shell boundaries. #frontend #fixtures
- [testing] Frontend integration is the default proof layer for the shell; browser E2E is optional and must be justified. #testing #ui

## Relations

- indexed_by [[Planned Milestones Index]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Frontend Interaction Spec]]
