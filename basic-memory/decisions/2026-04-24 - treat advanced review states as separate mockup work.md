---
title: 2026-04-24 - treat advanced review states as separate mockup work
type: note
permalink: video-annotator/decisions/2026-04-24-treat-advanced-review-states-as-separate-mockup-work
canonical: true
domain: review
aliases:
- review drift advanced states
- review state mockups
- mask refine mockup
- propagation mockup
- new object dialog mockup
tags:
- decision
- review
- ui
- mockup
- drift
- sam2
- masks
---

# 2026-04-24 - treat advanced review states as separate mockup work

- Date: 2026-04-24

## Decision

Future review-drift audits must split base happy-path shell drift from advanced review-state drift.

Base happy path uses `docs/ui/video-review-1920x1080.png` and `docs/ui/video-review.html`.
Advanced states need their own mockups before anyone can call them mismatches.

## Locked truth

- Export stays in right sidebar. PNG crop hides it, HTML shows it.
- `+ New Object` opens dialog for label entry.
- Current loading, empty, and error route shells stay valid.
- Playback-vs-canonical status messaging stays.
- Current mask tools and SAM2 workflow stay for now.

## Missing dedicated mockups

- new object dialog
- mask correction active state
- propagation running state
- propagation completed state

## Consequences

- When future drift review sees one of those advanced states, agent must say decision/mockup missing.
- Agent must not claim strict mismatch for those states until dedicated mockup exists.
- Base loaded happy path still should match committed review mockup.

## Observations

- [decision] Review drift audits must separate happy-path shell drift from advanced-state drift. #review #mockup #drift
- [rule] Export is not missing from product; it is only outside the PNG crop and still present in review HTML/sidebar truth. #export #review
- [rule] New object creation on happy path is dialog-driven, not inline sidebar entry. #objects #review
- [todo] Advanced review states still need dedicated mockups: new object dialog, refine active, propagation running, propagation complete. #mockup #sam2 #masks

## Relations

- indexed_by [[Decisions Index]]
- relates_to [[2026-04-21 - follow mockup-first single-stage review UI]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[SAM2 Shell and Runtime]]