---
title: US-006 frontend video list selection patterns
type: note
permalink: video-annotator/engineering/us-006-frontend-video-list-selection-patterns
tags:
- frontend
- milestone-01
- ui
- testing
---

# US-006 frontend video list selection patterns

Milestone-01 selection UI now loads indexed videos on mount, shows loading and empty states in the left panel, and fetches video detail on selection before treating a video as the active review target. The implementation keeps presentation in `frontend/src/app/App.tsx` small by moving list and selection orchestration into `frontend/src/features/video-review/workspace.ts`, while reusing the existing feature reducer for canonical frame state.

## Observations
- [pattern] Keep indexed-video list loading and selected-video detail fetches in a feature hook so UI components can stay mostly declarative #frontend #state
- [pattern] Frontend UI tests work with `// @vitest-environment jsdom` plus `@testing-library/react` in this repo #frontend #testing
- [gotcha] With workspace `moduleResolution: Bundler`, React UI test tooling may need a local `react-dom` subpath compatibility declaration in `frontend/src/types/react-dom-compat.d.ts` even when `@types/react-dom` is installed #typescript #testing
- [technique] Browser verification for frontend-only stories can use Playwright against local Vite dev server and intercept `/api/videos` routes to validate UI flow without backend fixture setup #playwright #verification

## Relations
- extends [[US-005 frontend video review data module patterns]]
- relates_to [[tools/ralph/progress]]
- relates_to [[frontend/src/features/video-review/workspace.ts]]
- relates_to [[frontend/src/app/App.tsx]]