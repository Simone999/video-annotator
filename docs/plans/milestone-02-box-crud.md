# Milestone 2: Box CRUD

## Goal

Allow manual creation, editing, loading, and deletion of boxes on exact frames.

## Scope

- object creation
- object list
- box overlay
- draw box
- resize/move box
- delete box
- save/load frame annotations

## Acceptance criteria

A user can:
1. create an object
2. draw a box on frame N
3. reload the page and still see it
4. move/resize the box
5. delete it

## Constraints

- all box operations are attached to an explicit frame index
- boxes are saved as normalized `xywh`
- object identity is explicit and stable

## Validation

- backend integration tests for annotation CRUD
- UI smoke test for drawing and editing