---
title: 'm-6: Import Existing Boxes'
type: note
permalink: video-annotator/milestones/m-6-import-existing-boxes
tags:
- milestone
- roadmap
- import
- blocked
---

# m-6: Import Existing Boxes

This milestone stays blocked until import contract becomes real memory, not guesswork.

## Status
Blocked.

## Goal
Import existing boxes from the current pipeline format into durable object and frame annotation state.

## Blocker
- `[[Import Contract]]` says v1 import exists in scope, but exact field mapping is still unknown.

## Acceptance Gate
- Import field mapping is written down in memory first.
- Imported objects and frame boxes map cleanly onto m-1 persistence primitives.
- Import tests prove deterministic translation from pipeline input to stored object and frame annotation state.

## Evidence
- `[[Import Contract]]` explicitly says exact pipeline field mapping is still open and should not be invented.
- Current backend and frontend code contain no import routes or import UI.

## Dumb Subagent Check
No dumb subagent should implement m-6 yet. First write the missing import memory. Only then split this milestone into executable tasks.

## Observations
- [status] m-6 is blocked by missing contract memory, not by missing coding time.
- [guardrail] Never invent pipeline mapping details just to make milestone numbering look tidy.

## Relations
- part_of [[Milestones Index]]
- depends_on [[Import Contract]]
- depends_on [[m-1: Annotation Foundation]]
- depends_on [[Test Plan]]
- relates_to [[Task Breakdown Guide]]
