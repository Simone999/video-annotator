---
title: 'm-3: Real SAM2 Runtime'
type: note
status: planned
permalink: video-annotator/milestones/m-3-real-sam2-runtime
tags:
- milestone
- roadmap
- sam2
- runtime
---

# m-3: Real SAM2 Runtime

## Goal

Replace placeholder SAM2 prompt and propagation runtime with real runtime behavior and honest UI truth.

## What To Implement

- confidence persistence for untouched SAM2 output
- real prompt and propagation runtime behind current service boundary
- frontend runtime status and confidence handling plus milestone review

## Checklist

- [ ] prompt and propagation stop relying on placeholder runtime behavior
- [ ] confidence flows through backend reads and frontend UI honestly
- [ ] milestone review fixes docs, index, and runtime/UI drift found during pass

## Related Features

- [[SAM2 Shell and Runtime]]

## Related Tasks

- [[Persist SAM2 confidence metadata]]
- [[Implement real SAM2 prompt adapter]]
- [[Integrate prompt runtime persistence]]
- [[Implement real SAM2 propagation runtime]]
- [[Wire SAM2 runtime UI truth]]
- [[Review m-3 runtime parity]]

## Observations

- [status] m-3 now drops refine and cleanup scope; those move to m-4 #m-3 #scope
- [status] milestone keeps one-iteration runtime slices plus final review checkpoint #m-3 #tasks
