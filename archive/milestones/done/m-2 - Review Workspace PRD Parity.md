---
title: 'm-2: Review Workspace PRD Parity'
type: note
status: done
permalink: video-annotator/milestones/m-2-review-workspace-prd-parity
tags:
- milestone
- roadmap
- frontend
- review
---

# m-2: Review Workspace PRD Parity

## Goal

Close remaining live review PRD gaps without reopening deleted shell-era structure. This milestone only covers timeline/range transport and selected-object summary truth.

## What To Implement

- selected-range state plus interactive timeline transport on live review
- selected-object summary fetch and inspector rendering from backend truth
- review checkpoint that fixes docs, index, and UI drift before milestone closes

## Checklist

- [x] timeline and selected range replace raw frame entry as primary review transport
- [x] inspector shows bbox, confidence, and frames/propagated/corrected truth from backend summary route
- [x] milestone review fixes docs, index, and UI drift found during parity pass

## Related Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

## Related Tasks

- [[Add selected-range state]]
- [[Build timeline transport UI]]
- [[Wire range transport and propagation]]
- [[Load selected-object summary]]
- [[Render inspector summary truth]]
- [[Review m-2 parity and drift]]

## Observations

- [status] m-2 is completed historical review-route parity work and no longer owns active roadmap scope #m-2 #scope #done
- [status] tasks are split to fit one implementation iteration each and close with one review checkpoint #m-2 #tasks
- [status] timeline-first transport chrome now ships with manifest markers, footer range controls, and numeric exact-frame input demoted to fallback transport #m-2 #transport
- [status] direct timeline scrub or marker frame loads now ship on live review, inspector summary truth is closed, and remaining roadmap work begins at m-3 runtime trust #m-2 #transport #done
- [review] final parity pass fixed stale summary fetches, timeline inset drift, reviewer-facing range context, and current-truth note routing without reopening deleted shell-era structure #m-2 #review

## Relations

- indexed_by [[Done Milestones Index]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[SAM2 Shell and Runtime]]
