# Export Format

## Goal

Exports must be deterministic, easy to parse, and lossless for downstream pipelines.

## Directory layout

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

## `annotations.json`

```json
{
  "version": 1,
  "videos": [
    {
      "video_id": "vid_001",
      "filepath": "/data/videos/patient_001.mp4",
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

Current backend native JSON export keeps persisted stable string object ids and relative `mask_path` values as-is. When a row has no box, omit `box_xywh_norm`. When a row has no mask, omit `mask_path`. Do not emit absolute filesystem paths or `null` placeholders for absent export fields.

## Rules

* `version` is mandatory
* frame keys are strings in JSON
* mask paths are relative to export root
* object ids stay persisted strings
* boxes are normalized `xywh`
* missing box is allowed if only a mask exists
* missing mask is allowed for box-only annotations

## Export modes

### Native JSON + PNG masks

Primary format.

### Boxes-only

Useful for pipelines that do not consume masks.

## Determinism requirements

* stable object ordering
* stable frame ordering
* stable file naming
* no implicit conversion during export
