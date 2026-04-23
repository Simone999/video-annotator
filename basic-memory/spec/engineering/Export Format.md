---
title: Export Format
type: spec
canonical: true
domain: engineering
permalink: video-annotator/spec/engineering/export-format
tags:
- spec
- engineering
- export
- data-format
---

# Export Format

Export output is a small versioned package for downstream tools. One export root holds one `annotations.json` manifest plus optional PNG mask files. Layout stays deterministic so pipelines can find frame/object data without guessing names or scanning unrelated files.

Directory shape is:
```text
export/
  annotations.json
  masks/
    vid_001/
      object_1/
        frame_000120.png
        frame_000121.png
      object_2/
        frame_000220.png
```
The mask tree encodes identity in the path itself: `vid_001` is the video id, `object_1` is the object id, and `frame_000120.png` is the canonical backend frame index with zero padding. Each exported frame/object mask therefore has one stable file location.

`annotations.json` is the package contract. It carries the export schema `version`, video metadata, object metadata, and per-frame annotation payloads. Frame entries keep annotation facts such as `is_keyframe`, `source`, and `box_xywh_norm`, and add `mask_path` when a PNG mask belongs to that frame/object pair.
```json
{
  "version": 1,
  "videos": [
    {
      "video_id": "vid_001",
      "filepath": "/data/patient_001/video.mp4",
      "fps": 25.0,
      "frame_count": 8123,
      "objects": [
        {
          "id": "object-1",
          "label": "left",
          "frames": {
            "120": {
              "is_keyframe": true,
              "source": "manual",
              "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
              "mask_path": "masks/vid_001/object_1/frame_000120.png"
            },
            "121": {
              "is_keyframe": false,
              "source": "sam2",
              "mask_path": "masks/vid_001/object_1/frame_000121.png"
            }
          }
        }
      ]
    }
  ]
}
```
Consumers should treat `version` as the schema switch for native export parsing.

Current shipped native JSON behavior keeps persisted stable string object ids and persisted relative `mask_path` values as-is. When a frame row has no box, omit `box_xywh_norm`. When a frame row has no mask, omit `mask_path`. The export should not invent `null` placeholders or absolute filesystem paths.

Supported export modes come from export request options. `native_json` generates the structured annotation manifest, `png_masks` emits binary mask images per frame per object, and `boxes_only` supports box-only export for flows that do not need raster masks. `include_unannotated=false` keeps unannotated frames out of the package. In practice: generate annotations JSON with `native_json`, export PNG masks with `png_masks`, and use box-only export when downstream work needs boxes but not mask files.

This format stays local-first and machine-readable. The JSON manifest is the index; the mask files are the heavy binary artifacts; and the path convention keeps every mask tied back to one `video_id`, one `object_id`, and one canonical frame index.

## Observations
- [format] Export package root contains `annotations.json` and an optional `masks/` tree #export
- [contract] `annotations.json` is the native versioned schema for exported annotations #schema
- [layout] Mask paths encode `video_id`, `object_id`, and canonical backend `frame_idx` in deterministic folders and filenames #masks
- [payload] Per-frame entries can carry `is_keyframe`, `source`, `box_xywh_norm`, and `mask_path` #annotations
- [rule] Native JSON keeps string object ids and relative mask paths from persisted truth, and omits missing optional keys #json
- [option] Supported export options are `native_json`, `png_masks`, `boxes_only`, and `include_unannotated=false` #api

## Relations
- pairs_with [[Data Model]]
- relates_to [[API]]
- relates_to [[Delivery Plan and Risks]]
