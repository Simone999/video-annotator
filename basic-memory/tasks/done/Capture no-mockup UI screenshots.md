---
id: task-capture-no-mockup-ui-screenshots
title: Capture no-mockup UI screenshots
status: done
completed: 2026-04-22 05:14:42 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- screenshots
- storybook
- docs-ui
permalink: video-annotator/tasks/done/capture-no-mockup-ui-screenshots
---

# Capture no-mockup UI screenshots

## Creation Phase

### Description

Save screenshot artifacts in `docs/ui` for route states and standalone panels that have no existing mockup, after the new style system is fully live.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Migrate frontend chrome onto style system]]
- `docs/ui/DESIGN.md`

Stage-2 rule: write concrete tests and implementation plan before code. Use one subagent review before task close.

### Scope

- In scope: route-state screenshots, standalone status-panel stories, Exact Frame Canvas screenshot, saved files under `docs/ui`, and honest memory verification notes.
- Out of scope: new route behavior, backend changes, or screenshot coverage for every leaf component.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] `docs/ui` contains committed screenshots for no-mockup route states and standalone panels agreed in the plan.
- [x] `VideoLibraryStatusPanel` and `ReviewRouteStatusPanel` have standalone stories or equivalent render targets for screenshot capture.
- [x] Screenshot evidence reflects current real CSS and honest runtime state.

### Test Intent

- Frontend: add failing structural tests for required stories or screenshot targets and expected `docs/ui` artifact files.
- Manual: capture route-state screenshots from fresh local stack and standalone panel screenshots from Storybook.

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code.
- [x] Relevant tests and quality checks pass.
- [x] Own review plus one reviewer attempt are recorded honestly.
- [x] Feature notes, task note, and memory notes record screenshot truth honestly.

## Planning Phase

### Planned Integration Tests

- Frontend:
  - add a tooling-style test that asserts these screenshot files exist in `docs/ui`: `not-found-route.png`, `video-library-status-loading.png`, `video-library-status-error.png`, `review-route-status-loading.png`, `review-route-status-error.png`, and `exact-frame-canvas.png`
  - assert these story files exist: `frontend/src/features/video-library/components/video-library-status-panel.stories.tsx`, `frontend/src/features/video-review/components/review-route-status-panel.stories.tsx`, and existing `frontend/src/features/video-review/exact-frame-canvas.stories.tsx`
  - assert Storybook preview imports `frontend/src/styles/app.css` so screenshot stories use the live style system

### Planned E2E Tests

- Frontend:
  - manual browser screenshot capture for `/missing-route` from local frontend dev server
  - manual Storybook screenshot capture for loading or error library status, loading or unavailable review status, and Exact Frame Canvas from one styled preview

### Planned Implementation

- Step 1: write failing file or story existence tests first.
- Step 2: add status-panel stories, fix Storybook preview to import `frontend/src/styles/app.css`, and add any light wrapper needed for clean standalone rendering.
- Step 3: capture `not-found-route.png` from the real app route plus the five component screenshots from Storybook and save them under `docs/ui`.
- Step 4: record screenshot paths and capture truth in memory.

### Feature Matrix Updates

- update recent verification or manual evidence sections if screenshot artifacts become new durable references

## Execution Phase

### Implementation Notes

- Wrote failing tooling test `frontend/tests/unit/tooling/no-mockup-screenshot-artifacts.test.ts` first. Red run failed on missing story files, missing screenshot artifacts, and stale Storybook preview import.
- Added standalone stories for `VideoLibraryStatusPanel` and `ReviewRouteStatusPanel`, and updated existing `ExactFrameCanvas` story with a fullscreen wrapper so the screenshot reads like the live review stage.
- Fixed Storybook preview to import `frontend/src/styles/app.css` instead of deleted `frontend/src/app/app.css`.
- Capture work exposed one real CSS ordering bug: remote font `@import` lines cannot live in `base.css` once `app.css` imports `tokens.css` first. Moved those URL imports to the top of `frontend/src/styles/app.css`.
- Capture work exposed one real style regression: `ExactFrameCanvas` lost its overlay classes when legacy `app.css` was removed. Rehomed those classes into `frontend/src/styles/utilities.css` with the current tokenized style system instead of restoring the deleted file.
- Added `.storybook/**/*.ts` to frontend typed lint and typecheck coverage so Storybook preview changes do not bypass verification.
- Captured `docs/ui/not-found-route.png` from local frontend dev server on `127.0.0.1:3001`.
- Captured `docs/ui/video-library-status-loading.png`, `docs/ui/video-library-status-error.png`, `docs/ui/review-route-status-loading.png`, `docs/ui/review-route-status-error.png`, and `docs/ui/exact-frame-canvas.png` from Storybook on `127.0.0.1:6006` using explicit ready selectors and settle waits.
- One reviewer was requested repeatedly for the final screenshot slice, but each wait timed out before any findings were returned. No second reviewer ran in parallel after the user asked for one reviewer only.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend exec -- vitest run --coverage=false tests/unit/tooling/no-mockup-screenshot-artifacts.test.ts`
- `curl -sf http://127.0.0.1:3001/not-found-check`
- `curl -sf "http://127.0.0.1:6006/iframe.html?id=video-library-videolibrarystatuspanel--loading&viewMode=story"`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark http://127.0.0.1:3001/missing-route docs/ui/not-found-route.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-library-videolibrarystatuspanel--loading&viewMode=story" docs/ui/video-library-status-loading.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-library-videolibrarystatuspanel--error&viewMode=story" docs/ui/video-library-status-error.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-review-reviewroutestatuspanel--loading&viewMode=story" docs/ui/review-route-status-loading.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-review-reviewroutestatuspanel--unavailable&viewMode=story" docs/ui/review-route-status-error.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "[aria-label='Exact frame canvas']" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-review-exactframecanvas--selected-annotation&viewMode=story" docs/ui/exact-frame-canvas.png`
- `file docs/ui/not-found-route.png docs/ui/video-library-status-loading.png docs/ui/video-library-status-error.png docs/ui/review-route-status-loading.png docs/ui/review-route-status-error.png docs/ui/exact-frame-canvas.png`
- `npm --workspace frontend exec -- vitest run --coverage=false tests/unit/tooling/frontend-style-entry.test.ts tests/unit/tooling/no-mockup-screenshot-artifacts.test.ts tests/integration/video-review/live-review-screen.test.tsx`
- `npm --workspace frontend exec -- prettier --check .storybook/preview.ts eslint.config.mjs tsconfig.json src/features/video-library/components/video-library-status-panel.stories.tsx src/features/video-review/components/review-route-status-panel.stories.tsx src/features/video-review/exact-frame-canvas.stories.tsx src/styles/app.css src/styles/base.css src/styles/utilities.css tests/unit/tooling/no-mockup-screenshot-artifacts.test.ts`
- `npm --workspace frontend exec -- prettier --write eslint.config.mjs`
- `npm --workspace frontend exec -- eslint .storybook/preview.ts src/features/video-library/components/video-library-status-panel.stories.tsx src/features/video-review/components/review-route-status-panel.stories.tsx src/features/video-review/exact-frame-canvas.stories.tsx tests/unit/tooling/no-mockup-screenshot-artifacts.test.ts --max-warnings=0`
- `npm --workspace frontend run typecheck`
- Results:
- Red tooling test failed first for missing stories and screenshot artifacts.
- Screenshot artifact tooling test now passes.
- Storybook and frontend dev servers both responded locally before capture.
- All six screenshot files exist and are valid `1440 x 1100` PNG files.
- Frontend tooling plus one review integration suite passed: `15` tests green. jsdom still prints expected `HTMLMediaElement` play or pause not-implemented warnings during review tests.
- Prettier initially flagged `eslint.config.mjs`; formatter was applied and re-check passed.
- ESLint passed on touched Storybook preview, story files, and tooling test.
- Frontend `typecheck` passed after `.storybook/**/*.ts` joined typed coverage.
- Reviewer truth: one reviewer thread was attempted multiple times but timed out without findings, so close-out relies on local verification and manual screenshot spot checks.

### Final Summary

- `docs/ui` now includes six no-mockup screenshot artifacts for route status and Exact Frame Canvas surfaces.
- Storybook now renders with the real shared style system, and the screenshot task hardened that path by fixing preview imports, font import ordering, and missing Exact Frame Canvas utility rules.
- Screenshot capture is now frozen by one tooling test that checks story targets, Storybook style entry, and committed artifact files.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
