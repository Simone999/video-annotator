---
title: 'm-6: Import Existing Boxes'
type: note
status: blocked
permalink: video-annotator/milestones/m-6-import-existing-boxes
tags:
- milestone
- roadmap
- import
- blocked
---

# m-6: Import Existing Boxes

## Goal

Import existing boxes from the current pipeline format into durable object and frame annotation state with an explicit field mapping.

## What To Implement

- define the import field mapping and translation rules first
- translate imported boxes into object and frame annotation persistence primitives
- verify deterministic import behavior with focused import tests

## Checklist

- [ ] import field mapping is written down before implementation starts
- [ ] imported data maps cleanly onto object and frame annotation storage
- [ ] import verification proves deterministic translation from pipeline input to stored state

## Related Features

- [[Import Existing Boxes]]

## Related Tasks

- [[Testing import existing boxes]]
