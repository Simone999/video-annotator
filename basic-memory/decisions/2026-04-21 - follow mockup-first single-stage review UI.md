---
title: 2026-04-21 - follow mockup-first single-stage review UI
type: decision
canonical: true
domain: decisions
aliases:
- single stage review ui
- review ui mockup
- mockup first review
permalink: video-annotator/decisions/2026-04-21-follow-mockup-first-single-stage-review-ui
tags:
- decision
- frontend
- ux
- docs
---

# 2026-04-21 - follow mockup-first single-stage review UI

- Date: 2026-04-21

## Decision

Follow agreed annotation mockup as screen-shape source of truth. Review UI is no longer described as separate playback pane plus exact-frame pane. New target is single review surface with video playback and overlayed annotations.

## Why

Old docs and memory described two-pane review. Agreed mockup and product direction changed:
- library screen selects work first
- annotation screen uses one stage
- playback still exists on stage
- mutating actions stay paused-only on canonical backend frame
- backend `frame_idx` truth must survive layout change

## Consequences

- Product, UX, API, architecture, and feature docs must stop claiming separate playback and exact-frame panes as current target.
- Library state model must be documented explicitly.
- Confidence and selected-object summary contracts must be documented explicitly.
- Historical docs that still describe old layout must be marked superseded, not silently rewritten as if no decision changed.

## Observations
- [decision] Mockup-first UI truth now targets library-first flow plus single-stage review surface #decision #frontend
- [guardrail] Single-stage playback UI does not weaken canonical backend `frame_idx` truth #frames #guardrail
- [rule] Edit and SAM2 actions remain paused-only even though playback stays visible on stage #editing #sam2
- [docs] Historical two-pane docs must be marked superseded #docs #history

## Relations
- indexed_by [[Decisions Index]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Frame Indexing Contract]]

## Contract details

- Current shipped video library states: `not_started`, `in_progress`, `ready`, `exported`.
- Planned blocked import extension adds `started` for imported boxes before the first manual review save.
- Progress bar means propagation completion only and is visible only while `in_progress`.
- `mask_confidence` is present for untouched SAM2-generated masks, `null` for manual-only rows, and `null` after reviewer correction.
- Selected-object summary contract target includes `bbox_xyxy_px`, `mask_confidence`, and `track_summary { frames, propagated, corrected }`.
- Current durable truth now lives in [[Product Requirements]], [[Frontend Interaction Spec]], [[Architecture]], [[Data Model]], [[Export Format]], and [[API]]. Supporting repo docs such as `docs/runbooks/dev-setup.md` and `docs/ui/video-library.html` remain reference-only. Retired summary docs for this migration now live under `archive/docs/`, while older pre-move API history still lives at legacy path `docs/archived/engineering/api.md`.
