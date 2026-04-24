---
title: Align library shell to screenshot and semantic tones
type: plan
status: done
permalink: video-annotator/plans/align-library-shell-to-screenshot-and-semantic-tones
tags:
- plan
- frontend
- library
- ui
- styles
- screenshots
---

# Align library shell to screenshot and semantic tones

Bring the live `/` route back into parity with `docs/ui/video-library.png`, then leave semantic tone hooks in place so review-first shared CSS can land without another markup rewrite.

## Summary
- Goal: remove library shell drift from the committed screenshot and replace hardcoded route-color decisions with semantic tone hooks.
- Success criteria: no left rail on the library route, shell order matches screenshot, video cards use semantic tone mapping, and tests lock the new structure.
- Audience: annotators using the local-first review tool and engineers maintaining route parity.

## Current State
- Existing behavior: library route still renders shared app rail chrome and mixes screenshot-aligned blocks with older shell structure.
- Main gaps: top-level shell does not match `docs/ui/video-library.png`; card state colors still map directly to Tailwind colors; tests protect old rail assumptions instead of screenshot truth.
- Constraints: `docs/ui/video-library.png` is the contract, `docs/ui/video-library.html` is support only, and runtime data must stay honest.

## Assumptions And Open Questions
- Locked assumptions:
  - library keeps its current behavior and data flow
  - this slice changes markup and styling hooks only
  - review route remains future base theme owner, but not in this first task
- Open questions:
  - none current

## Affected Features
- [[Video Ingest and Exact-Frame Review]]

## Task Breakdown
1. [[Rebuild library screenshot shell]] — locks library DOM to screenshot truth and semantic tone hooks.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `docs/ui/video-library.png`, `docs/ui/video-library.html`, and [[Video Ingest and Exact-Frame Review]].
- Write failing frontend tests first for shell parity and semantic tone mapping.
- Keep changes surgical: no route-behavior or API changes.

## Outcome
- Library route dropped the old shared app rail and topbar nav search.
- Card state styling now uses generic `stateful-card` and `state-*` hooks rather than `.video-library-*` classes.
- `docs/ui/video-library.html` was synced to the accepted borderless search field and ghost-button three-dots hover.
