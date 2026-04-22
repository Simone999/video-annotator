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
- one review checkpoint after five tasks, then final UI truth and milestone-end review

## Checklist

- [ ] prompt and propagation stop relying on placeholder runtime behavior
- [ ] confidence flows through backend reads and frontend UI honestly
- [ ] both review tasks fix docs, index, and runtime or UI drift found during the pass

## Related Features

- [[SAM2 Shell and Runtime]]

## Related Tasks

- [[Persist SAM2 confidence metadata]]
- [[Implement real SAM2 prompt adapter]]
- [[Integrate prompt runtime persistence]]
- [[Implement real SAM2 propagation adapter]]
- [[Integrate propagation job runtime persistence]]
- [[Review m-3 runtime checkpoint]]
- [[Review m-3 runtime parity]]

## Observations

- [status] m-3 now drops refine and cleanup scope; those move to m-4 #m-3 #scope
- [status] propagation work is split between adapter boundary and job persistence so one task does not carry both runtime and orchestration risk #m-3 #tasks
- [review] m-3 now has required review cadence after task five and at milestone end #m-3 #review
