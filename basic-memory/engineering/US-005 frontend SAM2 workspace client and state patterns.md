---
title: US-005 frontend SAM2 workspace client and state patterns
type: note
permalink: video-annotator/engineering/us-005-frontend-sam2-workspace-client-and-state-patterns
tags:
- frontend
- sam2
- state
- api
---

# US-005 frontend SAM2 workspace client and state patterns

## Summary
Frontend SAM2 support now lives inside `frontend/src/features/video-review`, with runtime parsing at the API boundary and normalized workspace state for session, prompt, and propagation flows.

## Learnings
- Parse backend SAM2 transport payloads in `api.ts` first, even when the response shape is small; keep snake_case at the wire boundary and normalize only when projecting into workspace state.
- Keep SAM2 side state separate from canonical `currentFrameIndex`; same-frame prompt and propagation actions should not mutate frame truth owned by exact-frame loading.
- Hook tests in this repo should import `act` from `react`, not from Testing Library, to avoid strict ESLint `no-unsafe-call` issues under the current type setup.

## Related
- [[frontend/src/features/video-review/api.ts]]
- [[frontend/src/features/video-review/state.ts]]
- [[frontend/src/features/video-review/workspace.ts]]
- [[tools/ralph/progress]]