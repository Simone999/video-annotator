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
- Owning feature note is updated
- Owning task note is updated when relevant
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
- keep default-host swaps isolated in `frontend/src/app/App.tsx`; preserve any live review harness in `frontend/src/app/live-review-app.tsx` so shell work does not mutate `frontend/src/features/video-review`
- keep opt-in live-review browser proof behind `?app=live-review` in `frontend/src/app/App.tsx`; default host must stay shell-first, and app-host tests should mock `./live-review-app` when proving routing only
- keep app-root shell workflow proof in `frontend/src/app/App.test.tsx`; mock `../features/video-review` there so default-host tests stay focused on shell routing instead of live workspace state
- keep default-host live library fetching inside `frontend/src/features/ui-shell/api.ts` and `frontend/src/features/ui-shell/loader.ts`; do not fold backend library-summary parsing into `frontend/src/features/video-review/api.ts`
- keep `frontend/src/features/ui-shell/shell-host.test.tsx` loader-mocked when preserving fixture review-shell proof, and keep `frontend/src/app/App.test.tsx` on mocked HTTP plus mocked `./live-review-app` when proving live library host behavior
- do not treat default `frontend/src/app/App.tsx` shell proof as live review proof; live ergonomics work must mount `frontend/src/app/live-review-app.tsx` or another harness that exercises `useVideoReviewWorkspace`
- keep `frontend/src/features/ui-shell/library-page.tsx` presentational; local shell page switches and selected fixture state belong in `frontend/src/features/ui-shell/shell-host.tsx`
- keep `frontend/src/features/ui-shell/review-page.tsx` presentational; shell-local selected object state belongs in `frontend/src/features/ui-shell/shell-host.tsx`
- keep explicit shell navigation affordances such as `Back to Library` prop-driven from `frontend/src/features/ui-shell/shell-host.tsx`; do not add router or page-local navigation state inside presentational shell pages
- gate library propagation UI on `video.state === "in_progress"`; do not infer progress visibility from percent presence alone
- do not treat fixture-shell `Exported` badges or `annotations.json + masks/*.png` mock copy as real export proof; export stories need live backend routes, artifact generation, and download-workflow evidence
- derive live library `review_state`, `propagation_progress_percent`, and `review_summary` in `backend/app/services/review_summaries.py` from persisted annotation sources plus active `sam2_propagation` jobs; do not emit `exported` without stored export evidence
- add explicit `afterEach(cleanup)` in multi-test frontend integration files; do not rely on implicit Testing Library cleanup between repeated `render` calls
- re-query `Exact frame canvas` after `Load frame` in `frontend/src/app/live-review-app` DOM or browser tests; exact-frame reload can remount the canvas node, so stale element refs can drop later drag or resize events
- reuse manifest `annotated_frames` and `keyframes` from `backend/app/api/videos.py` and `frontend/src/features/video-review/workspace.ts` for useful-frame landing and annotated or keyframe navigation before adding new frame-summary routes
- treat `frontend/src/app/live-review-app.tsx` as old split-pane live harness; m-2 runtime UX work should migrate behavior into one single-stage review surface instead of extending both panes further
- prefer real timers in `frontend/src/app/live-review-app.test.tsx` polling workflows; fake timers can stall Testing Library `findBy...` waits around MSW-backed job polling
- for Ralph testing-plan stories on unshipped features, cite prerequisite shipped evidence in task or feature notes and keep absent workflows blocked with exact reasons; do not add placeholder green suites
