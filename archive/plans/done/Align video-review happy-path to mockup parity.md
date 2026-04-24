---
title: Align video-review happy-path to mockup parity
type: plan
status: done
permalink: video-annotator/plans/align-video-review-happy-path-to-mockup-parity
tags:
- plan
- frontend
- review
- ui
- mockup
---

# Align video-review happy-path to mockup parity

Bring the loaded `/review/:videoId` route back toward `docs/ui/video-review-1920x1080.png` and `docs/ui/video-review.html` without dropping real review behaviors that still ship.

## Summary
- Goal: match the happy-path review shell to the mockup while keeping real route bootstrap, paused-only edit rules, export, and current advanced review flows.
- Success criteria: topbar, left panel, surface header, transport, and inspector follow mockup direction; legacy review tests stay green where those contracts still matter.
- Audience: annotators using the local-first review route and engineers auditing UI drift.

## Current State
- Existing behavior: review shell drifted from mockup and still exposed older accessibility and copy contracts through tests.
- Main gaps: topbar density, annotations panel structure, transport structure, inspector ordering, duplicate frame-control names, and missing legacy helper copy.
- Constraints: backend-decoded frame index stays canonical, playback stays contextual only, and advanced SAM2/mask flows remain real behavior for now.

## Assumptions And Open Questions
- Locked assumptions:
  - export stays visible in the right sidebar even if hidden in the PNG crop
  - `+ New Object` opens a dialog, not inline label entry, on the happy path
  - current route loading, empty, and error shells remain acceptable
  - playback-vs-canonical status messaging stays
  - mask tools and current SAM2 workflow stay for now
- Open questions:
  - advanced review states still need dedicated mockups before future drift audits can judge them strictly

## Affected Features
- [[Video Ingest and Exact-Frame Review]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

## Task Breakdown
1. [[Align video-review happy-path to mockup parity]] — rebuild loaded route shell, restore required compatibility hooks, and verify review tests.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `docs/ui/video-review-1920x1080.png`, `docs/ui/video-review.html`, and the owning review feature notes.
- Use mockup shape for the happy path, but keep advanced behavior where no dedicated mockup exists yet.
- If future drift work touches refine, propagation, or new-object dialog states, call out missing state-specific mockups before claiming mismatch.
