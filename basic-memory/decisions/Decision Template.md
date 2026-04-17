---
title: Decision Template
type: note
permalink: video-annotator/decisions/decision-template
tags:
- decision
- memory
- template
---

# Decision Template

This is the canonical blank decision note shape. Use it when a durable project, process, or workflow decision needs its own note under `decisions/`.

```markdown
---
title: YYYY-MM-DD - <verb-first title>
type: note
permalink: video-annotator/decisions/<date-and-slug>
tags:
- decision
- <area-tag>
---

# YYYY-MM-DD - <verb-first title>

- Date: YYYY-MM-DD

## Decision

One short paragraph with the decision itself.

## Why

Short explanation of why this decision was made and what tradeoff it resolves.

## Consequences

- Result 1
- Result 2

## Links

- Related notes:
- Related docs:

## Observations
- [decision] State the durable decision.
- [why] State the reason or tradeoff.
- [consequence] State one lasting effect of the decision.

## Relations
- part_of [[Decisions Index]]
- relates_to [[Memory Index]]

<!-- Example -->

# 2026-04-17 - store durable decisions in decisions folder

- Date: 2026-04-17

## Decision

Durable project, process, and workflow decisions live in `basic-memory/decisions/` as one note per decision instead of one rolling root log.

## Why

One note per decision keeps each decision dated, linkable, and easy to find without mixing unrelated choices into one long file.

## Consequences

- Future durable decisions use `basic-memory/decisions/`.
- Decision notes use dated filenames and include `- Date: YYYY-MM-DD`.
- Agents test `search_notes` privately and do not write search queries into memory.

## Links

- Related notes: [[Decisions Index]]
- Related docs: `docs/engineering/adrs/` when the decision also needs a formal architecture record.

## Observations
- [decision] Durable decisions live in `basic-memory/decisions/` as one note per decision.
- [format] Decision notes include `- Date: YYYY-MM-DD`.
- [workflow] Agents test `search_notes` privately instead of recording queries in memory.

## Relations
- part_of [[Decisions Index]]
- relates_to [[Memory Index]]
```

## Observations
- [template] This note is the canonical blank shape for one durable decision note.
- [format] Decision notes use dated titles and include `- Date: YYYY-MM-DD` near the top of the note body.
- [workflow] The template keeps decision statement, rationale, consequences, and links consistent across decision notes.
- [example] The fenced markdown block includes one concrete example so authors can see the expected level of detail.

## Relations
- relates_to [[Decisions Index]]