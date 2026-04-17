---
title: 2026-04-17 - store durable decisions in decisions folder
type: note
permalink: video-annotator/decisions/2026-04-17-store-durable-decisions-in-decisions-folder
tags:
- decision
- memory
- workflow
- agents
---

# 2026-04-17 - store durable decisions in decisions folder

- Date: 2026-04-17

## Decision

Durable project, process, and workflow decisions live in `basic-memory/decisions/` as one note per decision instead of one rolling root log.

## Why

One note per decision keeps each decision dated, linkable, and easy to find without mixing unrelated choices into one long file.

## Consequences

- Future durable decisions belong in `basic-memory/decisions/`.
- Decision notes use dated filenames and include `- Date: YYYY-MM-DD`.
- Agents should think short search queries, test `search_notes`, and not write those queries into the note.

## Links

- Related notes: [[Decisions Index]], [[Decision Template]], [[Memory Index]]
- Related docs: `docs/engineering/adrs/` when a decision also needs a formal architecture record.

## Observations
- [decision] Durable project, process, and workflow decisions live in `basic-memory/decisions/` as one note per decision rather than one rolling root note. #memory #workflow
- [format] Decision note filenames start with `YYYY-MM-DD - ` and note bodies include `- Date: YYYY-MM-DD`. #memory #decisions
- [workflow] Agents should test `search_notes` for discoverability before finishing a note, but should not record those query strings in memory. #memory #search

## Relations
- part_of [[Decisions Index]]
- relates_to [[Decision Template]]
- relates_to [[Memory Index]]