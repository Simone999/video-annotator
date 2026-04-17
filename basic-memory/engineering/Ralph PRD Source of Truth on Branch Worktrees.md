---
title: Ralph PRD Source of Truth on Branch Worktrees
type: note
permalink: video-annotator/engineering/ralph-prd-source-of-truth-on-branch-worktrees
tags:
- engineering
- ralph
- workflow
- branching
---

# Ralph PRD Source of Truth on Branch Worktrees

During `US-001` for `m-1: Annotation Foundation`, the target branch `ralph/m-1-annotation-foundation` already contained the correct backend `ObjectTrack` implementation, but its branch-local `tools/ralph/prd.json` and `tools/ralph/progress.md` still reflected older milestone-01 backlog state. The task prompt and memory notes were newer than the files inside that worktree.

Future Ralph iterations should treat the prompt-provided PRD path and current milestone memory as the first authority, then verify whether the checked-out branch's local Ralph files match. If branch-local Ralph files lag behind, sync them before choosing the next story, or you can waste time implementing the wrong backlog.

Likely search queries:
- ralph prd mismatch branch worktree
- tools/ralph stale backlog on branch
- annotation foundation branch has old milestone prd

## Observations
- [workflow] Ralph branch worktrees can contain stale `tools/ralph/*` backlog files even when code and memories are already on a newer milestone.
- [guardrail] Before selecting a story, compare the prompt-provided `prd.json` and `progress.md` with the checked-out branch copies.
- [guardrail] If code already satisfies the story but Ralph files disagree, verify with tests first, then sync backlog files instead of rewriting implementation.
- [verification] Backend-only Ralph stories still need root `npm run lint`, `npm run typecheck`, and `npm run test` because repo green bar depends on frontend workspace tooling too.

## Relations
- relates_to [[m-1: Annotation Foundation]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Engineering Memory Index]]
