---
title: Engineering Index
type: index
canonical: false
domain: engineering
permalink: video-annotator/spec/engineering/engineering-index
tags:
- spec
- engineering
- index
---

# Engineering Index

This folder holds engineering contracts that keep frame truth, persistence, SAM2, export, and testing aligned. Route-specific HTTP contracts live under [[API]].

```text
engineering/
├── Engineering Index
├── Frame Indexing Contract
├── Architecture
├── Data Model
├── SAM2 Integration
├── Export Format
├── Test Plan
└── Import Contract
```

Read frame contract first, then follow architecture, storage, route contracts, SAM2, export, testing, and import.

## Observations
- [navigation] This folder groups the durable backend contracts in one place.
- [sequence] Frame truth leads every other engineering decision.
- [boundary] Route paths, payloads, and errors live under [[API]]; cross-cutting invariants stay here.

## Relations
- indexes [[Spec Index]]
- indexes [[Frame Indexing Contract]]
- indexes [[Architecture]]
- indexes [[Data Model]]
- indexes [[SAM2 Integration]]
- indexes [[Export Format]]
- indexes [[Test Plan]]
- indexes [[Import Contract]]
- relates_to [[API]]
