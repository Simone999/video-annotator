---
title: Reorganize Memory Notes and Add Status Folders Implementation Plan
type: plan
permalink: video-annotator/plans/reorganize-memory-notes-and-add-status-folders-implementation-plan
status: draft
tags:
- plan
- memory
- workflow
- cleanup
- status-folders
---

# Reorganize Memory Notes and Add Status Folders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `basic-memory/` so plans, milestones, and tasks use explicit lifecycle status where appropriate, `Workflow.md` stays canonical for task phase truth, engineering noise is merged or deleted, and test routing lives in `[[Tests Index]]` instead of `[[e2e-tests]]`.

**Architecture:** Treat this as a memory-structure migration, not a product-code change. Add small schema notes for plans and milestones, create status subfolders with router-only index notes, move concrete notes with Basic Memory `move_note` so permalinks survive, and rewrite only the notes that define durable workflow truth. Keep feature-note fake example rows, keep `sam2-demo/` intact, and aggressively collapse engineering notes so only durable product or testing guidance remains.

**Tech Stack:** Basic Memory MCP, Markdown, YAML frontmatter, `rg`, repo-local shell checks.

---

## File Structure

### Create
- `basic-memory/schema/Plan.md`
- `basic-memory/schema/Milestone.md`
- `basic-memory/plans/draft/Draft Plans Index.md`
- `basic-memory/plans/active/Active Plans Index.md`
- `basic-memory/plans/done/Done Plans Index.md`
- `basic-memory/milestones/planned/Planned Milestones Index.md`
- `basic-memory/milestones/in_progress/In Progress Milestones Index.md`
- `basic-memory/milestones/blocked/Blocked Milestones Index.md`
- `basic-memory/milestones/done/Done Milestones Index.md`
- `basic-memory/engineering/Annotation Foundation Persistence Patterns.md`

### Modify
- `basic-memory/Memory Index.md`
- `basic-memory/schema/Schema Index.md`
- `basic-memory/plans/Plans Index.md`
- `basic-memory/plans/Plan Template.md`
- `basic-memory/milestones/Milestones Index.md`
- `basic-memory/tasks/Tasks Index.md`
- `basic-memory/tasks/todo/Todo Tasks Index.md`
- `basic-memory/tasks/in_progress/In Progress Tasks Index.md`
- `basic-memory/tasks/blocked/Blocked Tasks Index.md`
- `basic-memory/tasks/done/Done Tasks Index.md`
- `basic-memory/tasks/todo/Testing annotation foundation and manual box workflow.md`
- `basic-memory/tasks/todo/Testing export.md`
- `basic-memory/tasks/todo/Testing mask editing and cleanup.md`
- `basic-memory/tasks/todo/Testing review workspace ergonomics.md`
- `basic-memory/tasks/todo/Testing SAM2 shell and runtime.md`
- `basic-memory/tasks/todo/Testing video ingest and exact-frame review.md`
- `basic-memory/tasks/blocked/Testing import existing boxes.md`
- `basic-memory/tests/Tests Index.md`
- `basic-memory/tests/e2e-tests.md`
- `basic-memory/tests/Testing tools.md`
- `basic-memory/features/Annotation Foundation and Manual Box Workflow.md`
- `basic-memory/features/SAM2 Shell and Runtime.md`
- `basic-memory/engineering/Engineering Memory Index.md`
- `basic-memory/spec/engineering/Data Model.md`
- `basic-memory/spec/engineering/SAM2 Integration.md`

### Move
- `basic-memory/plans/Add root workflow note plan.md` -> `basic-memory/plans/done/Add root workflow note plan.md`
- `basic-memory/plans/Audit test guidance and browser E2E harness plan.md` -> `basic-memory/plans/done/Audit test guidance and browser E2E harness plan.md`
- `basic-memory/plans/Feature notes and test matrix workflow plan.md` -> `basic-memory/plans/done/Feature notes and test matrix workflow plan.md`
- `basic-memory/plans/Rebuild staged workflow plan.md` -> `basic-memory/plans/done/Rebuild staged workflow plan.md`
- `basic-memory/plans/Reorganize Memory Notes and Add Status Folders Implementation Plan.md` -> `basic-memory/plans/active/Reorganize Memory Notes and Add Status Folders Implementation Plan.md`
- `basic-memory/plans/tests-guidance-agent-audit-prompt.md` -> `basic-memory/tests/Test Guidance Audit Prompt.md`
- `basic-memory/engineering/auditing-test-guidance-with-dumb-agents.md` -> `basic-memory/tests/Test Guidance Audit.md`
- `basic-memory/milestones/m-1 - Annotation Foundation.md` -> `basic-memory/milestones/done/m-1 - Annotation Foundation.md`
- `basic-memory/milestones/m-2 - Review Workspace Completion.md` -> `basic-memory/milestones/in_progress/m-2 - Review Workspace Completion.md`
- `basic-memory/milestones/m-3 - SAM2 Runtime and Refinement.md` -> `basic-memory/milestones/planned/m-3 - SAM2 Runtime and Refinement.md`
- `basic-memory/milestones/m-4 - Mask Editing and Cleanup.md` -> `basic-memory/milestones/planned/m-4 - Mask Editing and Cleanup.md`
- `basic-memory/milestones/m-5 - Export and Release Hardening.md` -> `basic-memory/milestones/planned/m-5 - Export and Release Hardening.md`
- `basic-memory/milestones/m-6 - Import Existing Boxes.md` -> `basic-memory/milestones/blocked/m-6 - Import Existing Boxes.md`

### Delete After Merge
- `basic-memory/engineering/Frontend annotation foundation client and state pattern.md`
- `basic-memory/engineering/Manual frame annotation route pattern.md`
- `basic-memory/engineering/Video-scoped create route pattern.md`
- `basic-memory/engineering/SAM2 session and job persistence contract.md`
- `basic-memory/engineering/Ralph PRD Source of Truth on Branch Worktrees.md`
- `basic-memory/engineering/Verified temp-worktree merge flow for dirty branches.md`

## Task 1: Add Plan And Milestone Status Schemas And Folder Routers

**Files:**
- Create: `basic-memory/schema/Plan.md`
- Create: `basic-memory/schema/Milestone.md`
- Create: `basic-memory/plans/draft/Draft Plans Index.md`
- Create: `basic-memory/plans/active/Active Plans Index.md`
- Create: `basic-memory/plans/done/Done Plans Index.md`
- Create: `basic-memory/milestones/planned/Planned Milestones Index.md`
- Create: `basic-memory/milestones/in_progress/In Progress Milestones Index.md`
- Create: `basic-memory/milestones/blocked/Blocked Milestones Index.md`
- Create: `basic-memory/milestones/done/Done Milestones Index.md`
- Modify: `basic-memory/schema/Schema Index.md`
- Modify: `basic-memory/Memory Index.md`
- Modify: `basic-memory/plans/Plans Index.md`
- Modify: `basic-memory/milestones/Milestones Index.md`

- [ ] **Step 1: Capture the current gap before editing**

Run:
```bash
rg -n '^status:' basic-memory/plans basic-memory/milestones basic-memory/schema
```
Expected: task notes may already have `status`, but plans and milestones do not yet have canonical schema notes or status-folder routing.

- [ ] **Step 2: Create `Plan` schema note with exact lifecycle enum**

Create `basic-memory/schema/Plan.md` with this content:

```markdown
---
title: Plan
type: schema
entity: Plan
version: 1
schema:
  status(enum): [draft, active, done]
  completed?: string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/plan
tags:
- schema
- plan
---

# Plan

Canonical plan schema lives in frontmatter. Keep plan note metadata aligned with that `schema:` block.

## Conventions

- `status` is the plan lifecycle enum.
- `completed` stores completion metadata when a plan is fully executed or superseded.
- `tags` keeps searchable labels.
- plan body carries the implementation handoff, task breakdown, and execution notes when relevant.

## Observations
- [schema] Plan notes need a small lifecycle model so draft, active, and completed plans route cleanly.
- [schema] Template and index notes are reference notes, not concrete plan instances.
- [schema] Concrete plans should live in the status folder that matches frontmatter `status` once the folder structure exists.

## Relations
- relates_to [[Plan Template]]
- relates_to [[Plans Index]]
- relates_to [[Workflow]]
```

- [ ] **Step 3: Create `Milestone` schema note with roadmap lifecycle enum**

Create `basic-memory/schema/Milestone.md` with this content:

```markdown
---
title: Milestone
type: schema
entity: Milestone
version: 1
schema:
  status(enum): [planned, in_progress, blocked, done]
  completed?: string
  tags?(array): string
settings:
  validation: warn
permalink: video-annotator/schema/milestone
tags:
- schema
- milestone
---

# Milestone

Canonical milestone schema lives in frontmatter. Keep milestone note metadata aligned with that `schema:` block.

## Conventions

- `status` is the milestone lifecycle enum.
- `completed` stores completion metadata when a milestone is finished.
- `tags` keeps searchable labels.
- milestone body should describe milestone intent, implementation checklist, and related tasks or features, not drifting code-history notes.

## Observations
- [schema] Milestones need explicit roadmap state so planned, active, blocked, and done work route cleanly.
- [schema] Milestones should describe what the milestone is and what it still requires, not mixed audit logs.
- [schema] Concrete milestones should live in the status folder that matches frontmatter `status` once the folder structure exists.

## Relations
- relates_to [[Milestones Index]]
- relates_to [[Workflow]]
```

- [ ] **Step 4: Rewrite the root plan and milestone indexes as router-only notes**

Replace the folder-tree and guidance in `basic-memory/plans/Plans Index.md` so it explicitly routes to `draft/`, `active/`, `done/`, keeps `Plan Template` at root, and does not list concrete plan notes in relations.

Replace the folder-tree and guidance in `basic-memory/milestones/Milestones Index.md` so it explicitly routes to `planned/`, `in_progress/`, `blocked/`, `done/`, keeps milestone meaning at root, and does not list concrete milestone notes in relations.

Use these exact status meanings in both root notes:

```markdown
- `draft/`: plan exists but is still being shaped or reviewed.
- `active/`: plan is current execution handoff.
- `done/`: plan is historical but still useful for audit.
```

```markdown
- `planned/`: milestone is queued but not yet active.
- `in_progress/`: milestone is current roadmap focus.
- `blocked/`: milestone cannot move until an external dependency or contract is resolved.
- `done/`: milestone is finished and kept for roadmap history.
```

- [ ] **Step 5: Create status-folder index notes that explain folders only**

Create these short router notes with no concrete note lists:

```markdown
# Draft Plans Index

This note explains `basic-memory/plans/draft/`.
Use this folder for concrete plan notes with `status: draft`.
Do not keep template notes or folder routers here.
```

```markdown
# Active Plans Index

This note explains `basic-memory/plans/active/`.
Use this folder for concrete plan notes with `status: active`.
This is the current handoff folder for plans being executed.
```

```markdown
# Done Plans Index

This note explains `basic-memory/plans/done/`.
Use this folder for concrete plan notes with `status: done`.
Keep finished plans here for audit and later retrieval.
```

Apply the same pattern to milestone status folders with titles `Planned Milestones Index`, `In Progress Milestones Index`, `Blocked Milestones Index`, and `Done Milestones Index`, using the milestone status names exactly.

- [ ] **Step 6: Update top-level routers to include the new schema and folder shape**

Modify `basic-memory/schema/Schema Index.md` so it routes to `[[Plan]]`, `[[Milestone]]`, and `[[Task]]`.

Modify `basic-memory/Memory Index.md` so its tree and routing text mention that `plans/` and `milestones/` now have status subfolders instead of flat concrete-note storage.

- [ ] **Step 7: Verify router notes do not enumerate concrete plans or milestones**

Run:
```bash
rg -n 'indexes \[\[(m-[1-6]:|Add root workflow note plan|Feature notes and test matrix workflow plan|Rebuild staged workflow plan|Audit test guidance and browser E2E harness plan)\]\]' basic-memory/plans basic-memory/milestones
```
Expected: no matches.

- [ ] **Step 8: Commit router and schema work**

Run:
```bash
git add basic-memory/schema basic-memory/plans basic-memory/milestones basic-memory/Memory\ Index.md
git commit -m "MEMORY - add plan and milestone status schemas"
```
Expected: one commit containing only schema and router-note changes.

### Task 2: Rehome And Normalize Plan Notes

**Files:**
- Modify: `basic-memory/plans/Plan Template.md`
- Move: `basic-memory/plans/Add root workflow note plan.md`
- Move: `basic-memory/plans/Audit test guidance and browser E2E harness plan.md`
- Move: `basic-memory/plans/Feature notes and test matrix workflow plan.md`
- Move: `basic-memory/plans/Rebuild staged workflow plan.md`
- Move: `basic-memory/plans/Reorganize Memory Notes and Add Status Folders Implementation Plan.md`
- Move: `basic-memory/plans/tests-guidance-agent-audit-prompt.md`
- Modify: moved concrete plan notes to add frontmatter `status`
- Modify: `basic-memory/tests/Tests Index.md`

- [ ] **Step 1: Add `status` to the plan template frontmatter block**

Update the fenced example in `basic-memory/plans/Plan Template.md` so the frontmatter starts like this:

```markdown
---
title: <Plan Title>
type: plan
status: draft
permalink: video-annotator/plans/<plan-slug>
tags:
- plan
- <area-tag>
---
```

Keep the rest of the template structure unchanged.

- [ ] **Step 2: Move completed historical plans into `plans/done/` and set `status: done`**

Use Basic Memory `move_note` for these four notes:

```python
move_note(project="video-annotator", identifier="Add root workflow note plan", destination_path="plans/done/Add root workflow note plan.md")
move_note(project="video-annotator", identifier="Audit test guidance and browser E2E harness plan", destination_path="plans/done/Audit test guidance and browser E2E harness plan.md")
move_note(project="video-annotator", identifier="Feature notes and test matrix workflow plan", destination_path="plans/done/Feature notes and test matrix workflow plan.md")
move_note(project="video-annotator", identifier="Rebuild staged workflow plan", destination_path="plans/done/Rebuild staged workflow plan.md")
```

Then add `status: done` to each moved note frontmatter.

- [ ] **Step 3: Move the current implementation plan into `plans/active/` and set `status: active`**

Run:

```python
move_note(project="video-annotator", identifier="Reorganize Memory Notes and Add Status Folders Implementation Plan", destination_path="plans/active/Reorganize Memory Notes and Add Status Folders Implementation Plan.md")
```

Then set its frontmatter to `status: active`.

- [ ] **Step 4: Move the audit prompt out of `plans/` and into `tests/`**

Run:

```python
move_note(project="video-annotator", identifier="tests-guidance-agent-audit-prompt", destination_path="tests/Test Guidance Audit Prompt.md")
```

Then update its title and heading to `Test Guidance Audit Prompt` so the note reads like durable test-reference material instead of a live plan.

- [ ] **Step 5: Update `Tests Index` so it routes to the two durable audit reference notes**

Add both of these under the durable test-note list in `basic-memory/tests/Tests Index.md`:

```markdown
- [[Test Guidance Audit]]
- [[Test Guidance Audit Prompt]]
```

Do not add any concrete plan note links back into `Plans Index`.

- [ ] **Step 6: Verify concrete plan notes now live only in status folders**

Run:
```bash
find basic-memory/plans -maxdepth 1 -type f | sort
```
Expected: root keeps only `Plans Index.md`, `Plan Template.md`, and no concrete plan notes.

Run:
```bash
find basic-memory/plans/done basic-memory/plans/active -maxdepth 1 -type f | sort
```
Expected: concrete plan notes live under `done/` or `active/` with matching frontmatter `status`.

- [ ] **Step 7: Commit plan-note reorganization**

Run:
```bash
git add basic-memory/plans basic-memory/tests
git commit -m "MEMORY - reorganize concrete plan notes"
```
Expected: one commit containing plan moves, status updates, and the test-audit prompt move.

### Task 3: Rebuild Milestone Notes Around Milestone Intent

**Files:**
- Move: `basic-memory/milestones/m-1 - Annotation Foundation.md`
- Move: `basic-memory/milestones/m-2 - Review Workspace Completion.md`
- Move: `basic-memory/milestones/m-3 - SAM2 Runtime and Refinement.md`
- Move: `basic-memory/milestones/m-4 - Mask Editing and Cleanup.md`
- Move: `basic-memory/milestones/m-5 - Export and Release Hardening.md`
- Move: `basic-memory/milestones/m-6 - Import Existing Boxes.md`
- Modify: all six milestone notes after moving

- [ ] **Step 1: Move milestone notes into folders that match roadmap state**

Use these exact destinations:

```python
move_note(project="video-annotator", identifier="m-1: Annotation Foundation", destination_path="milestones/done/m-1 - Annotation Foundation.md")
move_note(project="video-annotator", identifier="m-2: Review Workspace Completion", destination_path="milestones/in_progress/m-2 - Review Workspace Completion.md")
move_note(project="video-annotator", identifier="m-3: SAM2 Runtime and Refinement", destination_path="milestones/planned/m-3 - SAM2 Runtime and Refinement.md")
move_note(project="video-annotator", identifier="m-4: Mask Editing and Cleanup", destination_path="milestones/planned/m-4 - Mask Editing and Cleanup.md")
move_note(project="video-annotator", identifier="m-5: Export and Release Hardening", destination_path="milestones/planned/m-5 - Export and Release Hardening.md")
move_note(project="video-annotator", identifier="m-6: Import Existing Boxes", destination_path="milestones/blocked/m-6 - Import Existing Boxes.md")
```

- [ ] **Step 2: Add frontmatter `status` that matches each destination folder**

Use these exact status values:
- `m-1`: `done`
- `m-2`: `in_progress`
- `m-3`: `planned`
- `m-4`: `planned`
- `m-5`: `planned`
- `m-6`: `blocked`

- [ ] **Step 3: Rewrite each milestone body to milestone-only structure**

Use this exact section shape for every milestone note:

```markdown
## Goal

One short paragraph stating what this milestone delivers.

## What To Implement

- concrete capability 1
- concrete capability 2
- concrete capability 3

## Checklist

- [ ] milestone outcome 1
- [ ] milestone outcome 2
- [ ] milestone outcome 3

## Related Features

- [[feature-note-1]]
- [[feature-note-2]]

## Related Tasks

- [[task-note-1]]
- [[task-note-2]]
```

Delete these drift-prone sections everywhere they appear:
- `## Status` in body text
- `## Current Code Already Has`
- `## Missing`
- `## Acceptance Gate`
- `## Evidence`
- `## Dumb Subagent Check`
- any dated audit-update sections
- any likely-search-query sections

- [ ] **Step 4: Fill the milestone-specific content with exact feature and task links**

Use these exact milestone-to-feature mappings:
- `m-1` -> `[[Annotation Foundation and Manual Box Workflow]]`, `[[Testing annotation foundation and manual box workflow]]`
- `m-2` -> `[[Review Workspace Ergonomics]]`, `[[Testing review workspace ergonomics]]`
- `m-3` -> `[[SAM2 Shell and Runtime]]`, `[[Testing SAM2 shell and runtime]]`
- `m-4` -> `[[Mask Editing and Cleanup]]`, `[[Testing mask editing and cleanup]]`
- `m-5` -> `[[Export]]`, `[[Testing export]]`
- `m-6` -> `[[Import Existing Boxes]]`, `[[Testing import existing boxes]]`

- [ ] **Step 5: Verify milestone notes no longer carry stale code-history sections**

Run:
```bash
rg -n 'Current Code Already Has|Acceptance Gate|Dumb Subagent Check|Likely Search Queries|Audit Update|Current Truth|Implication' basic-memory/milestones
```
Expected: no matches.

- [ ] **Step 6: Commit milestone rewrite and moves**

Run:
```bash
git add basic-memory/milestones
git commit -m "MEMORY - rebuild milestone notes around roadmap intent"
```
Expected: one commit containing only milestone moves, status metadata, and body rewrites.

### Task 4: Realign Task Notes And Task Indexes To `Workflow.md`

**Files:**
- Modify: `basic-memory/tasks/Tasks Index.md`
- Modify: `basic-memory/tasks/todo/Todo Tasks Index.md`
- Modify: `basic-memory/tasks/in_progress/In Progress Tasks Index.md`
- Modify: `basic-memory/tasks/blocked/Blocked Tasks Index.md`
- Modify: `basic-memory/tasks/done/Done Tasks Index.md`
- Modify: `basic-memory/tasks/todo/Testing annotation foundation and manual box workflow.md`
- Modify: `basic-memory/tasks/todo/Testing export.md`
- Modify: `basic-memory/tasks/todo/Testing mask editing and cleanup.md`
- Modify: `basic-memory/tasks/todo/Testing review workspace ergonomics.md`
- Modify: `basic-memory/tasks/todo/Testing SAM2 shell and runtime.md`
- Modify: `basic-memory/tasks/todo/Testing video ingest and exact-frame review.md`
- Modify: `basic-memory/tasks/blocked/Testing import existing boxes.md`

- [ ] **Step 1: Rewrite all task router notes to explain folders only**

Delete every `## Current Tasks` section from the four state-folder index notes.

Replace it with folder-only guidance like this exact shape:

```markdown
## Status Meaning

- concrete task notes with `status: todo` live here
- keep not-yet-started tasks in template-aligned phase order
- move the note when frontmatter `status` changes
```

Use the matching status name in each file.

- [ ] **Step 2: Make `Tasks Index` a router for reference notes and state folders, not a concrete task inventory**

Keep the reading order and reference-note routing in `basic-memory/tasks/Tasks Index.md`.
Remove any wording that suggests the root note should inventory concrete task names.
Add one short rule that not-yet-started concrete task notes must keep only Creation phase filled, while later phases stay present but blank/template-shaped until work actually starts.

- [ ] **Step 3: Strip planning truth out of every `todo` task note and return later phases to the template**

For these six files:
- `basic-memory/tasks/todo/Testing annotation foundation and manual box workflow.md`
- `basic-memory/tasks/todo/Testing export.md`
- `basic-memory/tasks/todo/Testing mask editing and cleanup.md`
- `basic-memory/tasks/todo/Testing review workspace ergonomics.md`
- `basic-memory/tasks/todo/Testing SAM2 shell and runtime.md`
- `basic-memory/tasks/todo/Testing video ingest and exact-frame review.md`

keep these sections filled:
- `Description`
- `Scope`
- `Affected Features`
- `Acceptance Criteria`
- `Test Intent`
- `Definition of Done`

Reset these sections to the blank `Task Template` shape:

```markdown
### Planned Integration Tests

- Backend:
- Frontend:

### Planned E2E Tests

- Backend:
- Frontend:

### Planned Implementation

- Step 1:
- Step 2:

### Feature Matrix Updates

- Feature note updates needed before or during execution:
```

Keep `Execution Phase` and `Wrap-Up Phase` present, but blank like the template.

- [ ] **Step 4: Remove the non-template `Default automated boundary` section from `Testing video ingest and exact-frame review`**

Move any still-useful boundary guidance into `Test Intent` wording, then delete the extra heading so the note matches `Task Template` exactly.

- [ ] **Step 5: Realign the blocked import task the same way unless execution has truly started**

In `basic-memory/tasks/blocked/Testing import existing boxes.md`, keep blocker truth in Creation phase and return Planning, Execution, and Wrap-Up sections to the blank template shape.
Do not delete the blocker logic; just keep it where template-aligned not-yet-started tasks can still use it.

- [ ] **Step 6: Verify not-yet-done task notes now match template phase usage**

Run:
```bash
rg -n 'freeze |Read `\[\[|Browser smoke only|Before coding:|After verification:' basic-memory/tasks/todo basic-memory/tasks/blocked
```
Expected: no planning-phase concrete content remains in not-yet-started tasks.

Run:
```bash
rg -n '## Current Tasks' basic-memory/tasks
```
Expected: no matches.

- [ ] **Step 7: Commit task realignment**

Run:
```bash
git add basic-memory/tasks
git commit -m "MEMORY - align task notes to workflow phases"
```
Expected: one commit containing only task-note and task-router updates.

### Task 5: Collapse Engineering Notes And Preserve Only Durable Value

**Files:**
- Create: `basic-memory/engineering/Annotation Foundation Persistence Patterns.md`
- Modify: `basic-memory/engineering/Engineering Memory Index.md`
- Modify: `basic-memory/features/Annotation Foundation and Manual Box Workflow.md`
- Modify: `basic-memory/features/SAM2 Shell and Runtime.md`
- Modify: `basic-memory/spec/engineering/Data Model.md`
- Modify: `basic-memory/spec/engineering/SAM2 Integration.md`
- Move: `basic-memory/engineering/auditing-test-guidance-with-dumb-agents.md`
- Delete: six low-value or merged engineering notes listed above

- [ ] **Step 1: Merge the three annotation-foundation implementation notes into one concise engineering note**

Create `basic-memory/engineering/Annotation Foundation Persistence Patterns.md` with these exact sections:

```markdown
# Annotation Foundation Persistence Patterns

This note captures the durable implementation rules behind manifest-backed object identity and manual frame annotation persistence.

## Observations
- [pattern] Parse manifest, object-create, and manual-annotation payloads at the frontend API boundary before reducer updates.
- [pattern] Store saved manual annotations by backend `frame_idx` then `object_id`, separate from canonical `currentFrameIndex`.
- [pattern] Manual frame annotation writes must validate video ownership, frame bounds, and object ownership in one backend service layer.
- [pattern] Manual writes upsert by `(video_id, frame_idx, object_id)` and clear persisted mask metadata so manual rows reopen with `mask: null`.
- [guardrail] Frame-scoped annotation reads must include manual rows even when mask data is null, or saved-box reload breaks.

## Relations
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[API]]
- relates_to [[Data Model]]
```

- [ ] **Step 2: Repoint feature-note links away from deleted engineering notes**

In `basic-memory/features/Annotation Foundation and Manual Box Workflow.md`, replace links to `[[Frontend annotation foundation client and state pattern]]` and `[[Manual frame annotation route pattern]]` with `[[Annotation Foundation Persistence Patterns]]`.

In `basic-memory/features/SAM2 Shell and Runtime.md`, replace the link to `[[SAM2 session and job persistence contract]]` with the canonical spec notes `[[SAM2 Integration]]` and `[[Data Model]]`.

- [ ] **Step 3: Move the test-guidance audit report into `tests/`**

Run:

```python
move_note(project="video-annotator", identifier="auditing-test-guidance-with-dumb-agents", destination_path="tests/Test Guidance Audit.md")
```

Then rename the title and heading to `Test Guidance Audit`.

- [ ] **Step 4: Merge the SAM2 persistence note into spec and delete the standalone engineering note**

Move the persistence rules from `SAM2 session and job persistence contract` into these exact homes:
- `basic-memory/spec/engineering/Data Model.md`: table or paragraph explaining persisted `sam2_sessions` and `jobs` state
- `basic-memory/spec/engineering/SAM2 Integration.md`: runtime boundary rule that predictor internals stay out of DB

After those spec notes are updated, delete `basic-memory/engineering/SAM2 session and job persistence contract.md`.

- [ ] **Step 5: Delete pure process noise that should not survive as engineering memory**

Delete these two notes without replacement:
- `basic-memory/engineering/Ralph PRD Source of Truth on Branch Worktrees.md`
- `basic-memory/engineering/Verified temp-worktree merge flow for dirty branches.md`

These are process-history notes, not durable product or testing truth.

- [ ] **Step 6: Delete the three merged annotation-foundation notes and rebuild `Engineering Memory Index`**

After the merged note exists and links are repointed, delete:
- `basic-memory/engineering/Frontend annotation foundation client and state pattern.md`
- `basic-memory/engineering/Manual frame annotation route pattern.md`
- `basic-memory/engineering/Video-scoped create route pattern.md`

Then rewrite `basic-memory/engineering/Engineering Memory Index.md` so it lists only surviving engineering notes. Root relations should point only to the surviving notes.

- [ ] **Step 7: Verify `engineering/` now contains only durable survivors**

Run:
```bash
find basic-memory/engineering -maxdepth 1 -type f | sort
```
Expected files:
- `Engineering Memory Index.md`
- `Annotation Foundation Persistence Patterns.md`
- `Exact-frame pane scroll anchoring fix.md`

Run:
```bash
rg -n 'Frontend annotation foundation client and state pattern|Manual frame annotation route pattern|Video-scoped create route pattern|SAM2 session and job persistence contract|Ralph PRD Source of Truth on Branch Worktrees|Verified temp-worktree merge flow for dirty branches' basic-memory
```
Expected: no surviving links except maybe historical mentions inside this active implementation plan note.

- [ ] **Step 8: Commit engineering cleanup**

Run:
```bash
git add basic-memory/engineering basic-memory/features basic-memory/spec/engineering basic-memory/tests
git commit -m "MEMORY - collapse engineering notes"
```
Expected: one commit containing the merged engineering note, moved audit notes, spec updates, and deletions.

### Task 6: Extract Test Routing From `e2e-tests` And Run Final Consistency Checks

**Files:**
- Modify: `basic-memory/tests/e2e-tests.md`
- Modify: `basic-memory/tests/Tests Index.md` if any link wording still points readers back into `e2e-tests` for routing

- [ ] **Step 1: Remove the routing questionnaire from `e2e-tests` and replace it with a single pointer to `Tests Index`**

Replace the entire `## Pick the right test note` section in `basic-memory/tests/e2e-tests.md` with this exact text:

```markdown
## Routing

Need help choosing the test layer first? Start with [[Tests Index]].
Use this note only after browser E2E is already the chosen boundary.
```

Do not change the rest of the E2E guidance.

- [ ] **Step 2: Keep the feature-table fake example rows intact**

Do not edit the example rows in any feature-note integration, E2E, or manual tables. This task is a guardrail step: verify that feature-note example rows remain present and unchanged while routing moves out of `e2e-tests`.

Run:
```bash
rg -n 'Example integration scenario|Example e2e scenario|Example manual scenario' basic-memory/features
```
Expected: matches remain in the feature notes.

- [ ] **Step 3: Run final structural audits**

Run:
```bash
find basic-memory/plans -maxdepth 2 -type f | sort
find basic-memory/milestones -maxdepth 2 -type f | sort
find basic-memory/tasks -maxdepth 2 -type f | sort
```
Expected: plan and milestone concrete notes live in status folders; task reference notes remain at task root; task state indexes still exist but no longer enumerate concrete tasks.

Run:
```bash
rg -n '## Current Tasks|Likely search queries|Search query `' basic-memory/plans basic-memory/milestones basic-memory/engineering
```
Expected: no matches in those folders.

- [ ] **Step 4: Re-run note discovery checks for the new structure**

Use Basic Memory search with these exact queries:

```text
plan status folders memory cleanup
milestone status planned in progress blocked done
engineering note cleanup annotation foundation patterns
```

Expected: the moved and rewritten notes are discoverable without adding concrete note names back into root indexes.

- [ ] **Step 5: Commit final routing and consistency cleanup**

Run:
```bash
git add basic-memory/tests basic-memory/plans basic-memory/milestones basic-memory/tasks basic-memory/engineering basic-memory/schema basic-memory/Memory\ Index.md
git commit -m "MEMORY - finalize note routing cleanup"
```
Expected: final cleanup commit with only note-routing and consistency changes.

## Self-Review

### Spec coverage
- add status to milestones frontmatter: covered in Task 1 and Task 3
- keep `Workflow.md` as source of truth and align tasks to their phase: covered in Task 4
- merge or delete noisy engineering notes: covered in Task 5
- add status to plans and use subfolders; keep indexes explanatory only: covered in Task 1 and Task 2
- keep `sam2-demo/` intact: enforced by omission from all task file lists
- extract routing from `e2e-tests` but keep the rest: covered in Task 6
- keep fake examples in feature tables: protected in Task 6
- keep task-template repetition in tasks and align not-yet-done tasks to template: covered in Task 4
- milestone notes should describe milestone intent, not mixed existence/history logs: covered in Task 3

### Placeholder scan
- No `TBD`, `TODO`, `implement later`, or `similar to Task N` text is used as an instruction.
- All file paths are exact.
- All move destinations and lifecycle enums are explicit.
- All verification commands have expected outcomes.

### Type consistency
- plan status enum is always `draft | active | done`
- milestone status enum is always `planned | in_progress | blocked | done`
- task status enum stays `todo | in_progress | blocked | done`
- concrete plan and milestone notes move into folders that match their frontmatter `status`
- task notes keep full template sections, but only Creation phase is filled before execution starts
