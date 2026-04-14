# Milestone 3: SAM2 Prompt + Propagation

## Goal

Use SAM2 to generate a preliminary mask from a box and propagate it over a selected frame range.

## Scope

- create/reuse SAM2 session
- prompt a box on a frame
- receive same-frame mask
- save mask
- propagate forward/backward
- show progress
- cancel job

## Acceptance criteria

A user can:
1. draw a box on frame N
2. click “Run SAM2”
3. receive a mask on frame N
4. propagate it forward for K frames
5. inspect saved masks on resulting frames

## Constraints

- SAM2 must be isolated behind a service adapter
- propagation must not freeze the UI
- results must be persisted deterministically

## Validation

- integration test for session creation
- integration test for prompt-box flow
- integration test for propagation job lifecycle