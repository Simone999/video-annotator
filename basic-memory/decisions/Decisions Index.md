---
title: Decisions Index
type: note
permalink: video-annotator/decisions/decisions-index
tags:
- decision
- memory
- index
---

# Decisions Index

This folder keeps durable decision notes for project, process, and workflow choices that should stay easy to find after the task that caused them is done.

Use this folder when you need to answer what we decided, when we decided it, or where one durable non-ADR decision lives.

Store one decision per note. Start from `[[Decision Template]]`. Name the file `YYYY-MM-DD - <verb-first title>.md`. Put `- Date: YYYY-MM-DD` near the top of the note body. If a decision also needs a formal architecture record, keep the ADR in `docs/engineering/adrs/` and link both notes.

```text
decisions/
├── Decisions Index.md
├── Decision Template.md
├── 2026-04-17 - store durable decisions in decisions folder.md
├── 2026-04-21 - follow mockup-first single-stage review UI.md
├── 2026-04-21 - keep frontend page ownership in features and frontend tests outside src.md
└── 2026-04-22 - keep durable memory in basic-memory and move transient tracking to archive.md
```

## Observations
- [navigation] This note is the folder map for durable decision memory.
- [scope] Store one durable project, process, or workflow decision per note in this folder.
- [template] Start new decision notes from `[[Decision Template]]` so the decision statement, why, consequences, and links stay consistent.
- [format] Decision note filenames start with `YYYY-MM-DD - ` and each note body includes `- Date: YYYY-MM-DD`.
- [boundary] Formal architecture decisions can also live in `docs/engineering/adrs/`, but this folder is the memory entrypoint for durable decisions.
- [retrieval] This note is the entrypoint for durable decision memory.

## Relations
- indexes [[Memory Index]]
- indexes [[Decision Template]]
- indexes [[2026-04-17 - store durable decisions in decisions folder]]
- [[2026-04-21 - follow mockup-first single-stage review UI]]
- [[2026-04-21 - keep frontend page ownership in features and frontend tests outside src]]
- [[2026-04-22 - keep durable memory in basic-memory and move transient tracking to archive]]
