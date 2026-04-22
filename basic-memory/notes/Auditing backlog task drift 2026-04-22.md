---
title: Auditing backlog task drift 2026-04-22
type: note
permalink: video-annotator/notes/auditing-backlog-task-drift-2026-04-22
tags:
- notes
- tasks
- backlog
- audit
- routing
---

# Auditing backlog task drift 2026-04-22

Backlog audit checked two things only: whether current repo truth still has uncovered implementation gaps without task notes, and whether existing todo task notes drifted away from shipped state or workflow routing.

Result:
- no missing implementation-task gaps were found
- one active task note was misrouted in `todo/`
- one stale duplicate todo remained after shipped frontend SAM2 UI work
- a few remaining task notes needed explicit prerequisite wording so later task sessions do not silently guess ordering

## Findings

- `[[Add Docker Compose E2E stack]]` already contains planning, execution, verification, and checked work items, so it is active work, not creation-phase todo routing.
- `[[Wire SAM2 runtime UI truth]]` was stale duplicate backlog after current frontend already shipped SAM2 request-state handling and selected-object confidence or summary truth through existing controller and inspector work.
- `[[Add selected-range state]]`, `[[Build timeline transport UI]]`, `[[Wire range transport and propagation]]`, and `[[Implement refine-mask backend]]` needed clearer dependency wording so creation-phase readers do not guess sequencing.
- No new concrete task note needed to be created. Remaining implementation gaps already route through existing todo or blocked tasks.

## Observations

- [audit] No uncaptured implementation backlog gap was found during this pass. #tasks #audit
- [routing] `[[Add Docker Compose E2E stack]]` belongs in `tasks/in_progress/`, not `tasks/todo/`, because the note already records execution truth. #tasks #routing #docker
- [duplicate] `[[Wire SAM2 runtime UI truth]]` became stale after shipped frontend request-state and inspector-summary work; remaining m-3 work is backend runtime or persistence plus review. #tasks #sam2 #duplicate
- [dependency] `[[Build timeline transport UI]]` and `[[Wire range transport and propagation]]` depend on `[[Add selected-range state]]`, and `[[Implement refine-mask backend]]` depends on `[[Define corrected-mask contract]]`. #tasks #dependency

## Relations

- relates_to [[Todo Tasks Index]]
- relates_to [[In Progress Tasks Index]]
- relates_to [[Done Tasks Index]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[m-3: Real SAM2 Runtime]]
