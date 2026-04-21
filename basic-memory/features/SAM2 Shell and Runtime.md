---
title: SAM2 Shell and Runtime
type: note
permalink: video-annotator/features/sam2-shell-and-runtime
tags:
- feature
- sam2
- runtime
- propagation
---

# SAM2 Shell and Runtime

This feature owns SAM2 session lifecycle, same-frame prompt-box behavior, propagation job behavior, and the gap between shipped plumbing and real runtime inference.

## Summary

- Goal: let reviewers use SAM2 as assistive segmentation and propagation on canonical backend frames
- Primary users: reviewers who want same-frame mask generation and range propagation
- Owning task note: [[Testing SAM2 shell and runtime]]

## Scope

- In scope:
  - session create, reuse, and close lifecycle
  - prompt-box request path on one exact frame
  - propagation job start, poll, cancel, and persisted reopen
  - runtime adapter behavior for prompt and propagation
  - runtime failure surfaces for model, GPU, memory, or decode problems
- Out of scope:
  - manual brush editing and cleanup after masks exist
  - export packaging
  - import

## Current State

- Shipped behavior: session lifecycle, prompt-box shell, propagation jobs, polling, cancel, and persisted reopen all ship through the current backend and frontend shell.
- Known gaps: refine-mask API and UI, strong runtime error mapping, frontend session cleanup, and real adapter prompt or propagate implementation remain missing.
- Current blockers: live-runtime trust is blocked because default adapter prompt and propagate methods are not implemented.

## Target Behavior

- Reviewer can create or reuse a SAM2 session for one video, send prompt box on frame `N`, receive same-frame candidate mask, and persist accepted result.
- Reviewer can launch bounded propagation, see progress, cancel when needed, and reopen saved propagated masks later through normal frame reads.
- Runtime failures are concise and actionable.
- Runtime implementation is real, not only a fake adapter or placeholder shell.

## Contracts and Dependencies

- Backend contracts:
  - `POST /api/videos/{video_id}/sam2/session`
  - `DELETE /api/videos/{video_id}/sam2/session/{session_id}`
  - `POST /api/videos/{video_id}/sam2/prompt-box`
  - `POST /api/videos/{video_id}/sam2/propagate`
  - `GET /api/jobs/{job_id}`
  - `POST /api/jobs/{job_id}/cancel`
- Frontend contracts:
  - session id stays tied to selected video
  - prompt and propagation actions always use canonical backend `frame_idx`
  - reopened masks come from persisted frame reads, not transient runtime memory
- Data or storage contracts:
  - `Sam2Session`, `Job`, and SAM2-produced `FrameAnnotation` rows persist runtime state and reopen behavior
- External dependencies:
  - exact-frame review
  - annotation persistence
  - mask storage on disk
  - SAM2 adapter implementation and local runtime environment

## Evidence

- Specs:
  - [[SAM2 Integration]]
  - [[Architecture]]
  - [[API]]
  - [[Test Plan]]
- Milestone notes:
  - [[m-3: SAM2 Runtime and Refinement]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Testing SAM2 shell and runtime]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |
| INT-002 | frontend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Example e2e scenario | Real workflow or failure path | Local stack or fixture env | planned | Link or note |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Example manual scenario | Required environment | Concrete steps | What operator should see | ❌ Not Done | Write why and what is missing |

## Observations

- [status] Session lifecycle, prompt-box shell, propagation shell, polling, cancel, and persisted reopen ship.
- [gap] Real runtime implementation remains incomplete, so shell coverage is ahead of live inference trust.
- [gap] Refine-mask remains missing and should not be implied by prompt or propagation support.
- [retrieval] Use this note for SAM2 shell, runtime gap, prompt-box, or propagation workflow queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-3: SAM2 Runtime and Refinement]]
- relates_to [[SAM2 Integration]]
- relates_to [[Data Model]]
- relates_to [[API]]
