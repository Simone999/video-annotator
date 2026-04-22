---
title: Align Mockup-First UI Docs and Memory
type: plan
permalink: video-annotator/plans/active/align-mockup-first-ui-docs-and-memory
status: done
tags:
- plan
- docs
- frontend
- api
- memory
---

# Align Mockup-First UI Docs and Memory

Update repo docs, UI mockups, and current-truth memory notes so they match the newly agreed mockup-first review model.

## Summary
- Goal: align product, UX, API, architecture, and feature truth around the mockup-first library and single-stage review model.
- Success criteria: current-truth docs and memory stop describing a separate playback pane, library state and progress rules are documented, confidence and inspector-summary contracts are documented, and stale historical docs are archived or marked superseded.
- Audience: future implementers, reviewers, and agents using docs or memory as source of truth.

## Current State
- Existing behavior: repo docs and memory still describe a two-pane review workflow in multiple current-truth notes.
- Main gaps: UI mockups and source-of-truth notes disagree; library state and progress semantics are missing; confidence and selected-object summary contracts are missing.
- Constraints: keep backend `frame_idx` canonical; this pass updates docs and memory only and must not silently claim runtime support that code does not yet have.

## Assumptions And Open Questions
- Locked assumptions:
  - single review surface replaces separate playback and exact-frame panes
  - playback still exists on the main stage with overlays
  - create/edit/delete and SAM2 actions are paused-only
  - library states are `not_started`, `started`, `in_progress`, `ready`, and `exported`
  - progress bar is propagation-only and visible only for `in_progress`
  - mask confidence is nullable and cleared after manual correction
  - selected-object inspector uses a dedicated backend summary contract
- Open questions:
  - none for this docs-and-memory pass

## Affected Features
- [[Video Ingest and Exact-Frame Review]]
- [[Review Workspace Ergonomics]]
- [[SAM2 Shell and Runtime]]
- [[Export]]

## Task Breakdown
1. [[Rewrite mockup-first UI docs and memory]] — rewrites repo docs, mockups, and current-truth memory around the agreed UI and contract model

## Handoff Notes
- Read `[[Workflow]]`, `[[Product Requirements]]`, `[[Frontend Interaction Spec]]`, `[[Architecture]]`, and `[[API]]` first.
- Treat docs and memory as planned truth for upcoming implementation where runtime support does not yet exist.
- Historical docs must be marked superseded instead of being silently rewritten as if the old model never existed.

## Outcome
- Completed on 2026-04-21.
- Repo docs, mockup HTML, screenshot artifacts, and current-truth memory notes were aligned to the agreed mockup-first library and single-stage review model.
