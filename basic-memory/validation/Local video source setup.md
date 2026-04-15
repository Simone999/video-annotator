---
title: Local video source setup
type: note
permalink: video-annotator/validation/local-video-source-setup
tags:
- validation
- indexing
- filesystem
---

# Local video source setup

This note answers where local review videos should live and why symlinked files
outside the source tree are a bad fit for the current indexing contract. Review
videos belong inside `data/videos/` so backend startup can discover them and
derive stable ids from their paths relative to the configured source directory.

The storage model is local-first. Media stays on disk, while the database
stores metadata needed for review and lookup. That contract breaks down if the
source tree is sidestepped with files that resolve outside the expected root.

## Observations
- [constraint] Put real review videos inside `data/videos/` so startup indexing discovers them automatically. #indexing #filesystem
- [gotcha] Use a real file under that tree, not a symlink that resolves outside it, because stable video ids are derived from paths relative to the source directory. #ids #filesystem
- [pattern] Local review stays local-first: the database stores metadata and source media stays on disk. #architecture #storage

## Relations
- relates_to [[Startup indexing]]
- relates_to [[Backend dev startup command]]
- relates_to [[Live video smoke validation]]
