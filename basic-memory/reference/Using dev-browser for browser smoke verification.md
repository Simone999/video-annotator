---
title: Using dev-browser for browser smoke verification
type: note
permalink: video-annotator/reference/using-dev-browser-for-browser-smoke-verification
tags:
- dev-browser
- browser
- browser-smoke
- verification
- playwright
- testing
- frontend
---

# Using dev-browser for browser smoke verification

`dev-browser` is external browser automation CLI already installed in this environment. In this repo, use it for manual browser smoke, visual verification, and small repeated browser checks on local stack. Do not treat it as default replacement for frontend integration or committed Playwright E2E.

## What it is

- CLI for controlling local or external browsers with sandboxed JavaScript scripts.
- Scripts run in QuickJS WASM sandbox, not Node.
- `browser.getPage("name")` returns full Playwright `Page` objects.
- Named pages persist across runs inside one daemon-managed browser.
- Local truth on 2026-04-21: `dev-browser --help` works from repo shell, so Codex can use CLI directly without extra skill install.

## When to use it here

- one-off browser smoke after frontend work
- visual verification on local stack
- screenshot capture for task or feature evidence
- incremental debugging of default host or `?app=live-review` workflows
- attach to running Chrome with `--connect` when existing browser state matters
- avoid adding committed Playwright suites when one manual smoke gives enough proof

## Repo guardrails

- Backend frame index stays canonical. Never derive annotation truth from browser playback time.
- Keep scripts small. One script should navigate, inspect, click, or capture one thing.
- Prefer stable page names like `library` or `live-review` so failed smoke can resume.
- On local dev servers, prefer `page.goto(url, { waitUntil: "domcontentloaded" })`.
- Record screenshot artifact paths and smoke outcomes honestly in task or feature notes.
- If browser wiring itself is not under test, choose frontend or backend integration before browser smoke.

## Main commands

| Command | Use in this repo |
| --- | --- |
| `dev-browser --help` | Check current CLI contract and built-in LLM usage guide. |
| `dev-browser <<'EOF' ... EOF` | Run one small inline smoke script. |
| `dev-browser run script.js` | Re-run a saved smoke or debugging script. |
| `dev-browser --browser live-review < script.js` | Keep separate browser state for one workflow. |
| `dev-browser --connect` | Attach to running Chrome when current tab or auth state matters. |
| `dev-browser --headless` | Run unattended smoke when visible browser not needed. |
| `dev-browser status` | Inspect daemon state if browser behavior looks stale. |
| `dev-browser stop` | Reset daemon-managed browser state before rerun. |

## Common repo workflows

### Default host smoke

1. Start `npm run backend:dev:e2e` and `npm run frontend:dev:e2e`.
2. Open default app URL with `domcontentloaded` wait.
3. Verify backend-backed library rows render, open one review, then use `Back to Library`.
4. Save screenshot only when task needs visual proof.

### `?app=live-review` smoke

1. Start fresh local stack.
2. Open current frontend dev URL with `?app=live-review`.
3. Select indexed video, then verify exact-frame or review controls from canonical frame labels, not playback time.
4. Use this path for frame stepping, manual box, or navigation smoke that must touch live review workspace.

### Screenshot artifact flow

1. Capture with `const path = await saveScreenshot(await page.screenshot(), "name.png");`.
2. Log returned path.
3. Copy artifact path into task or feature note only if it was real evidence.

## Minimal examples

### Default host open-review smoke

```js
const page = await browser.getPage("library");
await page.goto("http://127.0.0.1:5174", { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: /Open Review/i }).first().click();
console.log(JSON.stringify({
  url: page.url(),
  title: await page.title(),
}, null, 2));
```

### Live-review exact-frame smoke

```js
const page = await browser.getPage("live-review");
await page.goto("http://127.0.0.1:5174/?app=live-review", { waitUntil: "domcontentloaded" });
await page.getByLabel("Frame number").fill("3");
await page.getByRole("button", { name: "Load frame" }).click();
console.log(await page.getByText(/Canonical frame/i).textContent());
```

### Unknown page inspection

```js
const page = await browser.getPage("main");
const result = await page.snapshotForAI({ track: "main" });
console.log(result.full);
```

## Gotchas

- Stale backend listeners on `127.0.0.1:8000` can fake regressions. Restart current-code backend before trusting manifest errors.
- Clean e2e state may need seeded objects or keyframes before annotated or keyframe controls can be proven.
- Current tasks have used `5173`, `5174`, and `5175`; check active frontend port before hard-coding URLs.
- After script failure, reconnect to same named page and save screenshot before retrying. State often survives.

## Sources

- Local `dev-browser --help` output on 2026-04-21.
- Upstream `SawyerHood/dev-browser` README and skill docs.
- Repo task memory for exact-frame, manual-box, and review-navigation browser smoke patterns.

## Observations

- [tooling] `dev-browser` is repo-approved CLI for manual browser smoke, visual verification, and screenshot evidence on local stack. #dev-browser #browser #testing
- [technique] Keep `dev-browser` scripts small and named by workflow so smoke can resume after failure. #dev-browser #workflow
- [guardrail] Verify canonical frame labels and persisted state, never browser playback time, when using `dev-browser` on live review. #exact-frame #dev-browser
- [pattern] Default host smoke usually proves library -> review -> back flow, while `?app=live-review` smoke usually proves exact-frame or review ergonomics. #browser-smoke #live-review #library
- [gotcha] Stale backend listeners on `127.0.0.1:8000` can fake regressions; restart current-code backend before trusting manifest errors. #dev-browser #gotcha
- [gotcha] Clean e2e state may need seeded objects or keyframes before annotated or keyframe controls can be proven. #dev-browser #gotcha
- [retrieval] Use this note for dev-browser, browser smoke, visual verification CLI, screenshot artifact, or live-review browser workflow queries. #dev-browser #browser-smoke #verification

## Relations
- indexed_by [[Reference Index]]
- relates_to [[Memory Index]]
- relates_to [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[e2e-tests]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[Video Ingest and Exact-Frame Review]]