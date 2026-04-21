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

This feature owns operator speed and clarity after review foundations are real.

## Summary
- Goal: make single-stage review screen fast enough that user can navigate, inspect, and act without frame-truth confusion.
- Primary users: reviewers navigating long videos with sparse annotations.
- Owning task notes: [[Build UI shell fixture foundation]], [[Build video library mockup shell]], [[Build review page mockup shell]], [[Wire page actions and local UI state]], [[Add UI integration tests for shell]], and [[Testing review workspace ergonomics]]

## Scope
- In scope:
  - library-to-review navigation
  - single-stage review layout
  - transport and range controls
  - annotated overlays on playback stage
  - richer inspector signals
  - propagation progress presentation
- Out of scope:
  - persistence mechanics themselves
  - SAM2 runtime internals
  - export packaging

## Current State
- Shipped behavior: default frontend entry now opens a fixture-backed library shell with mockup chrome, summary metrics, richer card metadata, propagation-only progress, and local `Open Review` entry into the preserved review placeholder.
- Known gaps: review-screen mockup, explicit back-to-library action, selected-object shell state, and shell integration proof still land in follow-up tasks.
- Current blockers: none beyond frontend implementation work.

## Target Behavior
- User starts in library, then lands in one review surface with playback and overlayed annotations.
- User can play for context, pause on canonical frame, then edit or run SAM2.
- Inspector exposes bbox, nullable confidence, and selected-range summary.
- Progress UI means propagation completion only and shows only while propagation is active.

## Contracts and Dependencies
- Backend contracts:
  - video list and detail need derived review state
  - selected-object inspector needs dedicated summary endpoint
- Frontend contracts:
  - mutating actions are paused-only
  - canonical frame state stays separate from browser playback time
  - progress bar only represents propagation completion
- Data or storage contracts:
  - library state is derived from persisted review and export facts

## Observations
- [status] Ergonomics target changed from separate panes to single-stage review surface #frontend #ux
- [status] Default frontend entry now boots a fixture-backed shell host while the old live review UI stays preserved in `frontend/src/app/live-review-app.tsx` #frontend #ui
- [rule] Pause gates all mutating actions even though playback remains visible on stage #editing #ux
- [inspector] Mockup-first inspector needs backend summary data, not only manifest basics #inspector #api
- [progress] Progress UI is propagation-only, not generic review percent #progress #library
- [gap] Runtime frontend still needs implementation to catch up with new UX truth #gap #frontend

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
