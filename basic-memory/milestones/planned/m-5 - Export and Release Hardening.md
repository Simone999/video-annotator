---
title: 'm-5: Export and Release Hardening'
type: note
status: planned
permalink: video-annotator/milestones/m-5-export-and-release-hardening
tags:
- milestone
- roadmap
- export
- release
---

# m-5: Export and Release Hardening

## Goal

Let one reviewed sample video export deterministic JSON plus PNG masks and meet the release bar for export handoff. This milestone is release hardening work, not another annotation-editing slice.

## What To Implement

- export API and artifact generation for JSON plus PNG masks
- deterministic output that matches the export contract
- golden checks and a release verification checklist for the end-to-end review flow

## Checklist

- [ ] export creation and download routes exist
- [ ] exported JSON and PNG masks match the contract deterministically
- [ ] release verification proves review, SAM2, correction, and export together on one sample video

## Related Features

- [[Export]]

## Related Tasks

- [[Testing export]]
