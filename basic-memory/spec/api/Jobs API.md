---
title: Jobs API
type: spec
canonical: true
domain: api
aliases:
- jobs api
- job status api
- job cancel api
permalink: video-annotator/spec/api/jobs-api
tags:
- spec
- api
- jobs
- propagation
---

# Jobs API

Route contracts for async job polling and cancellation.

## Routes

### `GET /api/jobs/{job_id}`

Return job status and progress.

#### Response

```json
{
  "job_id": "job_001",
  "type": "sam2_propagation",
  "status": "running",
  "progress_current": 15,
  "progress_total": 60,
  "result": {
    "object_ids": ["object-1"],
    "persisted_frame_count": 15,
    "persisted_frame_indices": [121, 122, 123]
  },
  "error_message": null
}
```

### `POST /api/jobs/{job_id}/cancel`

Cancel running job.

#### Response

```json
{
  "job_id": "job_001",
  "status": "cancelling"
}
```

## Observations
- [route] Job reads own propagation status, progress counters, result summary, and explicit `error_message`. #jobs #api
- [route] Cancel route moves running work toward `cancelling`. #jobs #api
- [boundary] Job routes surface async propagation truth after create-job response returns. #jobs #sam2 #api

## Relations
- indexed_by [[API]]
- relates_to [[SAM2 API]]
- relates_to [[Test Plan]]
