# Repo guidelines

## Preliminary
- Use `caveman:full` style to talk with user, write docs and tasks.
- Use `basic-memory` MCP as knowledge base. Search and write durable notes (see below).
- Use `archive/` for transient works and notes.
- Make no assumptions. If notes/docs do not answer, ask user and record answer.
- `docs/` are supporting reference. Rather than updating docs, create or update memory notes.
- Do not add references to tasks/milestones out of tracking files/memories.

## Basic Memory - Durable notes
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
  * features, decisions, process guides, schemas
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
4. Add frontmatter metadata that helps routing:
  * `type`: `feature`, `decision`, `process`, `spec`, `test_guide`, `reference`, `engineering`, `index`, or `template`
  * `canonical: true` for owning leaf notes, `false` for indexes and templates
  * `domain`: short area such as `review`, `sam2`, `export`, `workflow`, `testing`
  * `aliases`: 2-5 likely search variants when note is a high-value router or leaf
5. Use metadata with search semantics in mind:
  * `type` is deterministic via `search_notes(note_types=[...])`
  * frontmatter `tags` are deterministic via `search_notes(tags=[...])`
  * `aliases` help free-text recall, not deterministic filtering
6. Keep indexes and templates lean. They route; they do not own topical truth.
  * index `Observations` should hold only 1-2 routing facts
  * index `Relations` should stay sparse; body links already create graph edges
7. Test `search_notes` with those queries and ensure note is found
8. Update dir index

Do NOT write those queries in the note

### Memory Boundaries

- memories holds durable knowledge only.
- `archive/` holds transient task, plan, milestone, and audit history.

### Memory Map
All durable dirs have an index. Add new durable dir when none of the current one matches.

```text
basic-memory/                 # memory root
├── decisions/                # durable project, process, and workflow decisions
├── sam2-demo/                # sam2 demo codebase findings notes
├── engineering/              # evergreen engineering learnings and bug/contract notes
├── features/                 # source-of-truth feature notes with template verification sections
├── notes/                    # general notes
├── process/                  # workflow, guides, and reusable templates
├── reference/                # external tool, command, and supporting reference notes
├── schema/                   # note schemas such as Task
├── spec/                     # canonical spec set
└── tests/                    # durable cross-feature testing guides and indexes
```

## Archive - Transient
Transient data lives under `archive/` not in memories.

```text
archive/
├── tasks/                    # active and historical task notes
├── plans/                    # active and historical plan notes
├── milestones/               # active and historical milestone notes
├── notes/                    # historical audits and snapshots
└── docs/                     # retired repo docs snapshots
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

When behavior or contracts change, update owning Basic Memory notes first.
Update live supporting docs under `docs/` only when they still own reference
material.

Update the affected current sources from this minimum set when they are
relevant:
- relevant API and spec notes under `basic-memory/spec/api/`
- `basic-memory/spec/engineering/Architecture.md`
- `basic-memory/spec/engineering/Data Model.md`
- `basic-memory/spec/engineering/Export Format.md`

Retired repo summaries such as `archive/docs/spec.md`,
`archive/docs/product/prd.md`, and `archive/docs/engineering/*.md` are history
only.

## Workflow

Before coding:
1. read this file
2. read `Workflow`
3. follow the staged process described there

- Use the full staged workflow for substantial work, i.e. for any multi-step behavior change.
- Stage 1 is request breakdown and task creation.
- Stage 2 is task implementation in a separate task session.
- Tiny mechanical edits may use a lighter path, but still require test thinking before code, verification after code, and docs or memory updates when relevant.

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

- Corrected-mask persistence reuses `FrameAnnotation.source = "sam2_edited"`. Selected-object summary `track_summary.corrected` counts only non-keyframe corrected rows; corrected keyframes keep `is_keyframe = true` but do not increment that counter.
- Exported library state should come from persisted `export_records.review_output_updated_at` matching the latest non-imported `FrameAnnotation.updated_at`; later review edits must fall stale exports back to `ready`.
- Frontend review export state should refresh backend `review_state` after export creation and persisted review edits; do not infer stale-versus-exported locally from the current frame because older-frame edits can leave the latest export fresh.
- Export create route should return stable `export_id` only; frontend download links should build `/api/exports/{export_id}` from that id instead of guessing filesystem paths.
- Native JSON export should preserve persisted string `ObjectTrack.id` values and relative `mask_path` values as-is; omit missing `box_xywh_norm` or `mask_path` keys instead of exporting `null` or absolute filesystem paths.
- PNG export artifacts should copy persisted mask files into the export root at those same relative `mask_path` locations; boxes-only export must omit both copied mask files and exported `mask_path` keys.
- Refine-mask backend should seed SAM2 from persisted same-frame mask PNG and preserve existing box/keyframe truth; do not invent bbox data during corrected rewrites.
- Frame-local mask cleanup should preserve row truth only when box data exists; clear mask fields on keyframe rows, but delete mask-only propagated rows so summary counts do not keep ghost frames.
- Whole-object mask cleanup should reuse that same row-by-row clear-or-delete contract across all selected-object frames, and frontend should reload current frame after cleanup so deleted propagated rows versus cleared keyframe rows stay honest.
- Whole-track delete should refetch manifest before reloading current frame so selected-object fallback, overlay removal, and inspector summary reset come from backend truth instead of stale local object state.
- Exact-frame canvas images must stay `draggable={false}` or browser image-drag can steal box/refine pointer gestures from the review stage.
- Review-route chrome should follow committed `docs/ui/video-review-1920x1080.png`, not shared dashboard shell patterns; do not reintroduce left app rail or placeholder session/export actions on `/review/:videoId`.
