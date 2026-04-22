# Repo guidelines

## Preliminary
- Use `caveman:full` style to talk with user, write docs and tasks.
- Use `basic-memory` MCP as knowledge base. Search and write durable notes (see below).
- Make no assumptions. If notes/docs do not answer, ask user and record answer.
- `docs/` are supporting reference. Rather than updating docs, create or update memory notes.
- Do not add references to tasks/milestones out of tracking files/memories. 

## Basic Memory
- project: `video-annotator`
- skills: `memory-*`

Use memory notes as a structured, searchable, hierarchical graph knowledge base.

### Create/Update a note when:
- Useful for future work
- You have a doubt
- Solved hard problem
- Learned something required significant effort
- User corrects you
- Fixed a bug
- Information you expected to find in memory is missing
- Changed or defined new:
  * features, plans, milestones, tasks, decisions
  * **techniques**: concrete method with steps to follow
  * **patterns**: way of thinking about problems
  * **reference**: API docs, syntax guides, tool docs

### Don't create a note when:
- Relevant only to current task
- Poor effort
- Standard practice

### How to write a note

Basic memory use full-text + vector-based search and allow deterministic filters.

1. Think 3 distinct (< 5 words) queries a dumb agent with no context might use
2. Use descriptive naming: active voice, verb-first: `creating-skill` not `skill-creation`
3. Add tags agent would search for:
  * Error messages: "Hook timed out", "ENOTEMPTY", "race condition"
  * Symptoms: "flaky", "hanging", "zombie", "pollution"
  * Tools: Actual commands, library names, file types
4. Test `search_notes` with those queries and ensure note is found
5. Update dir index

Do NOT write those queries in the note

### Memory Map
All dirs have an index. Add new dir when none of the current one matches.

```text
basic-memory/                 # memory root
├── decisions/                # durable project, process, and workflow decisions
├── sam2-demo/                # sam2 demo notes
├── engineering/              # evergreen engineering learnings and bug/contract notes
├── features/                 # source-of-truth feature notes with template verification sections
├── milestones/               # milestone status and audit notes
├── notes/                    # general notes
├── plans/                    # stored implementation and audit plans
├── reference/                # external tool, command, and supporting reference notes
├── schema/                   # note schemas such as Task
├── spec/                     # canonical spec set
├── tests/                    # durable cross-feature testing guides and indexes
└── tasks/                    # task references at root plus state folders for concrete tasks
```

## Product constraints
- The backend-decoded frame index is canonical.
- Never use browser video time as the source of annotation truth.
- Keep the app local-first.
- Prefer small typed modules and clear service boundaries.

## Architecture rules

- Frontend: React + TypeScript
- Backend: FastAPI + Python 3.12
- Parse data shapes at boundaries
- Exact frame retrieval through the backend video frame service.
- SAM2 isolated behind a dedicated adapter/service module.
- Persist metadata in the DB and masks on disk.

## Code style

### Python
- Python 3.12 via `uv`
- strong typing (Pyright strict mode): PEP 695 type parameters, `Annotated`. No `TypeVar`, `Generic`
- create stubs for poor typed third-party code.
- no `from __future__ import annotations` unless strictly necessary
- use `is` for enum member identity checks, including `StrEnum`, use `==` only for value comparison
- prefer `Sequence[T]` over `tuple[T, ...]`
- google docstring with typed `Args:`
- small clear functions
- service-oriented modules
- avoid giant files

### Frontend
- domain-oriented feature folders
- typed API clients
- follow `[[React best practices]]`: use thin route or page components, split-by-responsibility, hooks, and local-state guidance
- UI consistent with mockups in `docs/ui` and `docs/ui/DESIGN.md`

## Required docs

When behavior or contracts change, update the relevant docs under `docs/`.

Update the affected docs from this minimum set when they are relevant:
- `docs/engineering/api.md`
- `docs/engineering/data-model.md`
- `docs/engineering/architecture.md`

## Workflow

Before coding:
1. read this file
2. read `Workflow`
3. follow the staged process described there

- Use the full staged workflow for substantial work, i.e. for any multi-step behavior change.
- Stage 1 is request breakdown and task creation.
- Stage 2 is task implementation in a separate task session.
- Tiny mechanical edits may use a lighter path, but still require test thinking before code, verification after code, and honest docs or memory updates when relevant.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Done when

A task is done only if:
- Relevant tests pass
- Types/lint pass
- Owning feature and task note is updated when relevant
- Concrete test planning and verification truth is recorded in task or testing notes
- Any manual execution that was actually run is recorded honestly
- Docs (memory) updated if API or behavior changed 
- Struggles, user corrections, and impactful decisions in memory

## Commands

### Frontend
- dev: `npm run dev`
- tests: `npm run test`

### Backend
- dev: `npm run backend:dev`
- tests: `uv run --project backend pytest`

### Quality commands

- `npm run format`
- `npm run lint:fix`
- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Git Workflow

- Use feature branches for tasks, for example `tasks/task-123-feature-name`.
- Commit format: `TASK-123 - Title of task`
- PR title format: `{taskId} - {taskTitle}`
- Use `gh` PRs and issues.

## Patterns
- keep app-wide frontend wiring in `frontend/src/app/{App,providers,router,store}.tsx`; keep route pages, route-param reads, and review composition inside feature folders
- use real frontend paths `/` and `/review/:videoId`; do not reintroduce query-string app switching
- keep route-level app tests focused on URL behavior and route ownership; if they need mocks, mock feature seams such as `frontend/src/features/video-review/components/live-review-screen.tsx` instead of rebuilding app-owned review entrypoints
- keep frontend Vitest suites under `frontend/tests/unit/` or `frontend/tests/integration/`; `frontend/tests/component/` is legacy and structure tests should fail if it returns
- focused frontend Vitest file reruns should use raw `vitest` with coverage disabled, because `npm --workspace frontend run test -- <file>` still enforces global 90% coverage gates and can false-fail targeted verification
- keep frontend-owned Playwright specs and browser fixtures under `frontend/tests/e2e/`; keep shared Playwright harness files under repo-root `tests/e2e/`
- route-owned library cards should use backend frame previews from `/api/videos/:videoId/frame/:frameIdx` with `last_reviewed_frame_idx ?? 0`, and hide raw `source_path` behind short operator-facing copy
- choose frontend integration vs browser E2E from `basic-memory/tests/frontend-integration-tests.md` and `basic-memory/tests/e2e-tests.md`, not from whatever current files already exist
- use Tailwind utilities for new or touched route or page UI; avoid growing legacy global CSS unless style truly must stay app-wide
- keep live review single-stage and backend-frame-canonical; pause contextual playback before exact-frame jumps or canonical mutations, and keep mutating controls disabled while playback is active
- keep live review selected range as one inclusive canonical-frame state; temporary propagation direction or end-frame controls should update that shared state, and summary or propagation logic must not derive a second range source
- source review timeline markers from manifest data already loaded in workspace/controller (`annotatedFrameIndices`, `keyframeIndices`); do not refetch or derive marker truth from summary payloads or browser playback
- persist `FrameAnnotation.mask_confidence` only for untouched `source = "sam2"` rows; manual or corrected rewrites must clear it, and frame-read or summary serializers should force non-SAM2 rows back to `null`
- keep `POST /api/videos/:videoId/sam2/prompt-box` response aligned with persisted prompt annotation truth; surface nullable `mask_confidence` immediately instead of forcing a frame reload to see confidence
- real SAM2 prompt runtime keeps `POST /sam2/session` lightweight and lazily loads predictor state on first prompt; configure `SAM2_CONFIG_PATH` as `configs/...yaml` or a file path under a `configs/` tree, and expect prompt route `503` errors when runtime deps, checkpoint, or requested device are unavailable
- real SAM2 propagation runtime should reuse same `Sam2Service` lazy predictor state as prompt work; if backend memory lost an open session between `POST /sam2/session` or prompt use and propagation start, recreate process-local runtime session state from the persisted open DB row before queuing work, map `direction = "both"` onto forward/reverse `propagate_in_video(...)` calls that mirror `_resolve_target_frame_indices`, let job persistence filter out seeded start frame instead of trimming it inside adapter code, and surface missing source-file recovery as route `409` instead of worker-thread failure
- if review timeline keeps horizontal visual inset, share one constant between scrubber pointer math and rendered marker/playhead/range positioning; otherwise clicks and markers drift by a few frames
- local Playwright runs reuse existing frontend server on `FRONTEND_E2E_PORT` (default `3000`); if that port is busy with another app, set `FRONTEND_E2E_PORT` to a free port before browser verification so E2E targets video-annotator instead of unrelated UI
- browser proof that depends on seeded backend data must also verify `127.0.0.1:8000` is a fresh current-code `backend:dev:e2e`; Playwright `reuseExistingServer` will reuse stale repo backends too, and that can surface false `Failed to fetch` route failures or wrong video seed state
- derive review transport scrubber math in browser or test automation from live slider `aria-valuemax` or loaded frame count; seeded review videos may not match the older 42-frame sample fixture
- derive selected-object summary frame counters in browser or test automation from live selected-range defaults plus actual video `frame_count`; default forward range spans current canonical frame through last frame until reviewer changes boundary
- treat dated milestone audit notes under `basic-memory/milestones/` as historical snapshots; when current truth changes, update current routers like milestone notes, `Repo Current State and Feature Matrix`, and roadmap parity audits instead of rewriting those dated reports
- backend Docker E2E image should copy repo fixture videos into `/app/data/videos`, keep mutable SQLite and mask state under `/var/lib/video-annotator-e2e`, and use `uv run --no-sync --no-dev` for container commands so runtime or init steps do not re-sync dev dependencies
- frontend Docker E2E app should build from `frontend/` context with `frontend/Dockerfile.e2e`, `frontend/.dockerignore`, and local `frontend/package-lock.json`; when frontend deps change, sync that local lockfile too or container `npm ci` will fail even if root workspace install still works
