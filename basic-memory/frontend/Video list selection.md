---
title: Video list selection
type: note
permalink: video-annotator/frontend/video-list-selection
tags:
- frontend
- ui
- selection
---

# Video list selection

This note answers how the review workspace chooses an active video. The list
pane loads indexed videos on mount, shows explicit loading and empty states,
and fetches full video detail before a selected entry becomes the active review
target.

The implementation keeps list orchestration in feature-level workspace logic so
top-level UI components can stay mostly declarative. Tests for this flow are
normal DOM-oriented React tests, not browser-time or media-decoder tests.

## Observations
- [behavior] Load indexed videos on mount and show explicit loading and empty states in the list pane. #frontend #ui
- [pattern] Fetch video detail on selection before treating a video as the active review target. #frontend #state
- [pattern] Keep list loading and selection orchestration in feature workspace logic so UI components stay declarative. #frontend #architecture
- [technique] UI tests in this repo use `// @vitest-environment jsdom` with `@testing-library/react`. #testing #vitest
- [gotcha] With `moduleResolution: Bundler`, React UI tests may need a local `react-dom` subpath compatibility declaration even when `@types/react-dom` is installed. #typescript #testing

## Relations
- depends_on [[Video catalog API]]
- relates_to [[Video review workspace state]]
- relates_to [[Playback pane contract]]
