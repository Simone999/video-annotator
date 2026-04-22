---
title: Extract frontend style system and screenshot coverage
type: plan
status: active
permalink: video-annotator/plans/extract-frontend-style-system-and-screenshot-coverage
tags:
- plan
- frontend
- styles
- mockup
- screenshots
---

# Extract frontend style system and screenshot coverage

Move route chrome and shared UI styling into one global frontend style system, then save missing UI screenshots under `docs/ui`.

## Summary
- Goal: move frontend global styling to `frontend/src/styles/`, align route chrome to mockups and `docs/ui/DESIGN.md`, and add screenshot evidence for no-mockup surfaces.
- Success criteria: one Tailwind entry at `frontend/src/styles/app.css`, whole frontend route and status chrome uses the new style system, and missing route or standalone-panel screenshots land in `docs/ui`.
- Audience: annotators and engineers using the local review tool.

## Current State
- Existing behavior: frontend still imports `frontend/src/app/app.css`; route pages use a mix of long inline Tailwind strings and leftover global CSS. Mockups exist for library and review only.
- Main gaps: no centralized token or base layer under `frontend/src/styles/`; no one shared icon or font plumbing for mockup parity; no committed screenshots for not-found, route status states, or standalone status panels.
- Constraints: keep app local-first except approved remote font or icon parity; keep backend frame index canonical; keep runtime data honest even when mockups show future values; keep repeated chrome in named CSS classes and one-off layout inline.

## Assumptions And Open Questions
- Locked assumptions:
  - `docs/ui/DESIGN.md` wins when it conflicts with older library mockup token values.
  - whole frontend means `/`, `/review/:videoId`, their status shells, not-found, and existing standalone panels or stories.
  - remote parity is allowed for Inter, JetBrains Mono, and Material Symbols.
  - repeated chrome moves to named classes; one-off spacing and layout can stay inline utilities.
- Open questions:
  - none current

## Affected Features
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

## Task Breakdown
1. [[Extract frontend style foundation]] — creates `frontend/src/styles/`, moves global import to `main.tsx`, and defines tokens, base rules, and repeated chrome utilities.
2. [[Migrate frontend chrome onto style system]] — rewires whole frontend route and status surfaces onto the new style system with honest runtime values.
3. [[Capture no-mockup UI screenshots]] — adds status-panel stories and saves route plus standalone screenshot artifacts in `docs/ui`.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `docs/ui/DESIGN.md`, `docs/ui/video-library.html`, `docs/ui/video-annotation.html`, `[[Video Ingest and Exact-Frame Review]]`, and `[[SAM2 Shell and Runtime]]`.
- Task 1 must finish before any route migration. Task 2 must finish before screenshot capture so artifacts match final CSS.
- Write test first for each task. Verify red, then green.
- Per user request, commit at end of each task.
- Browser screenshots must come from fresh current-code local stack. Story screenshots can come from Storybook.

