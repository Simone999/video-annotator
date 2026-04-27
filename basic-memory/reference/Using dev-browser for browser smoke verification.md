---
title: Using dev-browser for browser smoke verification
type: reference
canonical: true
domain: browser
aliases:
- dev-browser
- browser smoke
- screenshot verification
permalink: video-annotator/reference/using-dev-browser-for-browser-smoke-verification
tags:
- dev-browser
- browser
- browser-smoke
- verification
- testing
- frontend
---

# Using dev-browser for browser smoke verification

`dev-browser` is the repo-approved CLI for manual browser smoke, visual verification, and small repeated browser checks on the local stack. It is not the default replacement for frontend integration tests or committed Playwright E2E.

## Use it here for

- one-off browser smoke after frontend work
- visual verification on the local stack
- screenshot capture for task or feature evidence
- incremental debugging of default-host or route-owned live-review workflows
- attaching to a running Chrome when existing browser state matters

## Repo guardrails

- Backend frame index stays canonical. Never derive annotation truth from browser playback time.
- Keep scripts small. One script should navigate, inspect, click, or capture one thing.
- Prefer stable page names like `library` or `live-review`.
- On local dev servers, prefer `page.goto(url, { waitUntil: "domcontentloaded" })`.
- Record screenshot artifact paths and smoke outcomes honestly in archive notes or durable evidence summaries.

## Main commands

- `dev-browser --help` for current CLI contract
- `dev-browser <<'EOF' ... EOF` for one small inline smoke
- `dev-browser run script.js` for a saved smoke script
- `dev-browser --browser live-review < script.js` for stable named browser state
- `dev-browser --connect` to attach to an existing Chrome
- `dev-browser --headless` for unattended smoke
- `dev-browser status` and `dev-browser stop` when daemon state looks stale

## Common repo flows

- Default host smoke: start `backend:bootstrap:e2e`, `backend:dev:e2e`, and `frontend:dev:e2e`, then verify library -> review -> back flow.
- Route-owned live-review smoke: start a fresh stack, open one real `/review/:videoId` route, and verify exact-frame behavior from labels, not playback time.
- Seeded jump-control smoke: run `npm run backend:seed:e2e:review-navigation` before opening the review route when manifest markers must exist.

## Gotchas

- Stale backend listeners on `127.0.0.1:8000` can fake regressions.
- `backend:dev:e2e` only starts the server; it does not reset or seed data.
- Clean baseline E2E state leaves manifest jump controls disabled by design until real annotation rows exist.
- Repo E2E default frontend port is `3000`; normal Vite dev still commonly uses `5173`.

## Observations

- [tooling] `dev-browser` is repo-approved CLI for manual browser smoke, visual verification, and screenshot evidence on local stack. #dev-browser #browser #testing
- [technique] Keep `dev-browser` scripts small and named by workflow so smoke can resume after failure. #dev-browser #workflow
- [guardrail] Verify exact-frame labels and persisted state, never browser playback time, when using `dev-browser` on live review. #exact-frame #dev-browser
- [gotcha] Stale backend listeners on `127.0.0.1:8000` can fake regressions; restart current-code backend before trusting manifest errors. #dev-browser #gotcha
- [retrieval] Use this note for dev-browser, browser smoke, screenshot verification, or live-review browser workflow queries. #search

## Relations

- indexed_by [[Reference Index]]
- relates_to [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[e2e-tests]]
