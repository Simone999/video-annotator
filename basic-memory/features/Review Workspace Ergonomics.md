---
title: Review Workspace Ergonomics
type: note
permalink: video-annotator/features/review-workspace-ergonomics
tags:
- feature
- frontend
- workspace
- ergonomics
---

# Review Workspace Ergonomics

This feature owns operator speed and navigation quality after the exact-frame and manual-box foundations are real.

## Summary

- Goal: make the review workspace fast enough that users do not have to type raw frame numbers or hunt visually for state
- Primary users: reviewers navigating long videos with sparse annotations
- Owning task note: [[Testing review workspace ergonomics]]

## Scope

- In scope:
  - exact-frame default load behavior on video open
  - annotated-frame navigation
  - keyframe navigation
  - timeline markers
  - keyboard shortcuts
  - adjustable mask opacity
  - richer object panel signals
- Out of scope:
  - manual box persistence itself
  - SAM2 runtime
  - export and import

## Current State

- Shipped behavior: opening a video loads playback plus workspace state, resets canonical frame state to `0`, exact-frame jump and step work, and the object panel shows current object basics.
- Known gaps: no auto-fetch on open, no annotated or keyframe navigation, no timeline, no shortcuts, no mask opacity control, and no richer object-panel signals exist yet.
- Current blockers: none beyond the remaining frontend workflow and interaction work.

## Target Behavior

- Reviewer opens one video and lands on a useful exact frame immediately, preferably frame `0` or first annotated frame.
- Reviewer can jump across annotated frames or keyframes without repeated raw typing.
- Timeline communicates playback position, exact frame position, and annotation markers together.
- Keyboard shortcuts make repeat review fast and predictable.
- Object panel exposes enough state to support fast scan and selection decisions.

## Contracts and Dependencies

- Backend contracts:
  - manifest must expose `annotated_frames`, `keyframes`, and object summary
- Frontend contracts:
  - canonical exact-frame state stays separate from playback state
  - marker-driven navigation consumes manifest data rather than browser-time estimates
  - any opacity control must only affect visualization, not persisted truth
- Data or storage contracts:
  - manifest marker lists remain the canonical source for annotated-frame and keyframe navigation state
- External dependencies:
  - exact-frame review foundations
  - annotation foundation and manual box workflow

## Evidence

- Specs:
  - [[Frontend Interaction Spec]]
  - [[Product Requirements]]
  - [[API]]
- Milestone notes:
  - [[m-2: Review Workspace Completion]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Testing review workspace ergonomics]]

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

- [status] Workspace fundamentals exist, but ergonomics layer remains clearly partial.
- [dependency] Backend marker data already exists, so most remaining work is frontend workflow and interaction design.
- [guardrail] Marker-driven navigation and shortcuts must still preserve backend `frame_idx` as truth.
- [retrieval] Use this note for review workspace ergonomics, annotated-frame navigation, keyframe navigation, or shortcut workflow queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
