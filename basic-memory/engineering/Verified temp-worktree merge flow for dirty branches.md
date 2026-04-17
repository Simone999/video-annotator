---
title: Verified temp-worktree merge flow for dirty branches
type: note
permalink: video-annotator/engineering/verified-temp-worktree-merge-flow-for-dirty-branches-1
tags:
- engineering
- git
- workflow
- verification
---

# Verified temp-worktree merge flow for dirty branches

When a target branch is checked out in a dirty worktree and a second branch must be merged into it, a safe path is to create a detached temporary worktree, perform the merge there, and keep verification turned on. In this repo, `--no-verify` is a bad shortcut during merges because hook failures can expose real cross-branch breakage instead of mere tool absence.

The reliable sequence was:
1. create a detached temp worktree from the current branch HEAD
2. merge the other branch there and resolve conflicts
3. make the temp worktree runnable by installing workspace dependencies if hooks need frontend tools
4. run repo checks for real (`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test`)
5. commit the merge only after checks pass
6. copy only the verified changed paths back into the dirty main worktree when those paths do not overlap local dirty files
7. move branch refs with `git update-ref` after the verified file set is already in place

This task also showed one merge pitfall: taking one branch wholesale on shared backend surfaces can strip symbols that other branch code still imports. In this repo, shared files like `backend/app/api/videos.py`, `backend/app/db/models.py`, `backend/app/schemas/__init__.py`, and `backend/app/services/__init__.py` may need semantic union rather than one-side selection.

Likely search queries:
- dirty worktree merge temp worktree verify hooks
- no verify hides merge bugs
- update-ref after verified temp merge

## Observations
- [workflow] For dirty-branch merges, create and verify the merge commit in a detached temp worktree before moving live branch refs. #git #workflow
- [guardrail] Do not use `--no-verify` for merge commits in this repo; hook failures can reveal real merge bugs, not just inconvenience. #verification #git
- [technique] If verified merge files do not overlap local dirty files, copy those tracked paths into the dirty worktree first, then move refs with `git update-ref`. #git #worktree
- [risk] Shared backend surface files often need semantic merge, not `ours` or `theirs`, because SAM2 and annotation-foundation code import overlapping exports. #backend #merge

## Relations
- relates_to [[Ralph PRD Source of Truth on Branch Worktrees]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Engineering Memory Index]]