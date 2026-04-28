---
title: Feature Template
type: template
canonical: false
domain: features
aliases:
- feature note template
- feature template
permalink: video-annotator/features/feature-template
tags:
- feature
- memory
- template
---

# Feature Template

Use this note only when new capability area needs its first feature note. Keep note small, durable, and point detailed execution history back to Backlog task IDs or titles plus older `archive/` history when relevant.

```markdown
---
title: <Feature Name>
type: feature
canonical: true
domain: <domain>
aliases:
- <query variant>
- <query variant>
status: active
permalink: video-annotator/features/<feature-slug>
tags:
- feature
- <area-tag>
---

# <Feature Name>

Short statement of what this feature is for and why it matters.

## Target Behavior

- User-visible workflow 1
- User-visible workflow 2

## Contracts

- Backend contracts:
- Frontend contracts:
- Storage or data contracts:

## Verification Strategy

- Durable evidence:
- Future backend or frontend proof:
- Manual or browser proof:
```

## Observations
- [template] This note is the blank shape for one canonical feature note. #feature
- [workflow] Feature notes should stay compact, hold durable capability truth only, and link live task history to Backlog. #workflow
- [retrieval] Templates are scaffolding only and should not compete with canonical leaf notes in search. #search

## Relations
- relates_to [[Features Index]]
- relates_to [[Task]]
