#!/usr/bin/env sh
set -eu

uv run --no-sync --no-dev alembic upgrade head
uv run --no-sync --no-dev python -m scripts.seed_e2e
