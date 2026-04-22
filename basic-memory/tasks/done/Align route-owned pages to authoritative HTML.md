---
id: task-align-route-owned-pages-to-authoritative-html
title: Align route-owned pages to authoritative HTML
status: done
completed: 2026-04-22 02:54:30 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- routing
- html
- review
- library
permalink: video-annotator/tasks/align-route-owned-pages-to-authoritative-html
---

# Align route-owned pages to authoritative HTML

## Creation Phase

### Description

Align the shipped `/` library route and `/review/:videoId` review route to `docs/ui/video-library.html` plus `docs/ui/video-review.html` without inventing runtime data that backend contracts cannot prove yet.

### Scope

- In scope: route-owned layout, chrome, hierarchy, and Tailwind styling for the library and review pages; honest placeholder slots where HTML shows future data; frontend integration coverage for the new structure
- Out of scope: selected-object summary route wiring, selected-range controls, timeline transport behavior, export behavior, or backend contract changes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Library route visually follows the authoritative HTML structure: fixed top bar, fixed left rail, full-width summary strip, flat filter controls, and hard-edged video cards with honest live backend data
- [x] Review route visually follows the authoritative HTML chrome: top nav metadata bar, left annotation list shell, central review stage chrome, and right inspector sections
- [x] Review route keeps missing summary or range data honest with placeholder or disabled copy instead of fake confidence, corrected counts, or export truth
- [x] Existing live review exact-frame and route-loading behavior still works after the UI polish
- [x] Frontend integration tests cover the new route-owned structure and honest placeholder states

### Test Intent

- Frontend: write failing integration assertions for library chrome structure and review chrome plus honest placeholder copy before implementation
- Browser: run at least one route smoke after implementation if the stack is stable enough
- Backend: none

### Definition of Done

- [x] Relevant frontend integration tests pass
- [x] Route UI task note records exact verification truth
- [x] Feature or overview notes touched by UI truth changes are updated honestly

## Planning Phase

### Planned Integration Tests

- Add one library-screen test that freezes the HTML-driven chrome shape without asserting fake data
- Add one live-review-screen test that freezes the review chrome and honest placeholder text for unimplemented summary or range slots

### Planned E2E Tests

- Reuse existing route browser proof only if integration changes risk direct-route or back-to-library regressions

### Planned Implementation

- Step 1: add failing integration assertions for library chrome and review chrome
- Step 2: reshape library route components toward the authoritative HTML while preserving current honest data mapping
- Step 3: reshape review route chrome around existing controller state while keeping selected-summary and range slots clearly pending
- Step 4: run targeted frontend tests, then optional route browser smoke, then update memory wrap-up

### Feature Matrix Updates

- Update `[[Video Ingest and Exact-Frame Review]]` for route-owned library and review shell parity plus honest placeholder copy
- Update `[[SAM2 Shell and Runtime]]` so pending summary and range slots stay explicit instead of implied by mockup-only values

## Execution Phase

### Implementation Notes

- Added failing integration coverage in `frontend/tests/integration/video-library/video-library-screen.test.tsx` and `frontend/tests/integration/video-review/live-review-screen.test.tsx`, then verified red state before UI edits.
- Reshaped library route chrome around fixed top bar, fixed left rail, flat summary strip, rectangular filters, and harder-edged cards in `frontend/src/features/video-library/components/`.
- Reshaped review route chrome around fixed top metadata bar, compact annotation rail, operator-style stage shell, and inspector-first layout in `frontend/src/features/video-review/components/`.
- Kept pending selected-object summary and selected-range work honest by rendering explicit placeholder copy in review transport and inspector panels instead of fake values.
- Follow-up fixes made desktop rail offsets responsive, expanded rails on keyboard focus, kept missing current-frame annotation truth honest for box and mask labels, and removed unreachable native playback controls under the paused exact-frame overlay.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- tests/integration/video-library/video-library-screen.test.tsx tests/integration/video-review/live-review-screen.test.tsx`
  - `npm --workspace frontend run test -- tests/integration/video-review/live-review-screen.test.tsx -t "keeps missing current-frame annotation truth honest and relies on custom playback controls"`
  - `npm --workspace frontend run test -- tests/integration/app/app-routes.test.tsx tests/integration/video-review/review-page.test.tsx`
  - `npm run typecheck`
  - `FRONTEND_E2E_PORT=3100 npm run test:e2e -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
- Results:
  - Targeted new integration tests passed after UI edits; jsdom still prints known `HTMLMediaElement` play or pause warnings during live review tests.
  - Follow-up regression test for missing current-frame annotation truth plus custom playback controls failed first, then passed after the review fixes.
  - Wider route integration tests passed.
  - `npm run typecheck` passed.
  - Optional Playwright route rerun failed for real-stack reasons outside this UI slice: local `127.0.0.1:8000` was already occupied, seeded bedroom video manifest returned `500`, and browser snapshot showed `Review unavailable` plus `Failed to fetch`. Browser evidence for this task stays blocked by backend stack hygiene, not route-shell DOM.
  - Own review checked the task diff for mobile layout waste, keyboard rail access, undefined-annotation truth, and paused-stage playback behavior.
  - Subagent review round 1: one spec response was stale against the current worktree and was rejected after manual file check; one quality review found real mobile-offset and hover-only rail issues, which were fixed.
  - Subagent review round 2: spec review approved; quality review found real undefined-annotation and overlay-control issues, which were fixed and covered by the follow-up regression test.
  - Final quality follow-up flagged duplicate `workspace-title`, but direct-route loaded state only renders one of those headings at a time, so no code change was needed.

### Final Summary

- Library and review routes now match authoritative HTML chrome more closely without inventing export, confidence, corrected-count, or selected-range truth.
- Exact-frame and route-loading behavior stayed covered through existing route integration tests plus the new shell-specific assertions.
- Browser smoke remains blocked by backend stack hygiene on local port `8000`, so this task closes on integration proof and honest note updates.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
