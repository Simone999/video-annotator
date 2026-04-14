.PHONY: format format-check lint lint-fix typecheck check precommit-install backend-install frontend-install

UV_CACHE_DIR := /tmp/uv-cache
NPM_CONFIG_CACHE := /tmp/npm-cache
PRE_COMMIT_HOME := /tmp/pre-commit-cache

format: backend-format frontend-format

format-check: backend-format-check frontend-format-check

lint: backend-lint frontend-lint

lint-fix: backend-lint-fix frontend-lint-fix

typecheck: backend-typecheck frontend-typecheck

check: format-check lint typecheck

precommit-install: backend-install frontend-install
	cd backend && PRE_COMMIT_HOME=$(PRE_COMMIT_HOME) UV_CACHE_DIR=$(UV_CACHE_DIR) uv run --group dev pre-commit install --config ../.pre-commit-config.yaml

backend-install:
	UV_CACHE_DIR=$(UV_CACHE_DIR) uv sync --project backend --group dev

frontend-install:
	NPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm --prefix frontend install

backend-format:
	cd backend && UV_CACHE_DIR=$(UV_CACHE_DIR) uv run --group dev ruff format app

backend-format-check:
	cd backend && UV_CACHE_DIR=$(UV_CACHE_DIR) uv run --group dev ruff format --check app

backend-lint:
	cd backend && UV_CACHE_DIR=$(UV_CACHE_DIR) uv run --group dev ruff check app

backend-lint-fix:
	cd backend && UV_CACHE_DIR=$(UV_CACHE_DIR) uv run --group dev ruff check --fix app

backend-typecheck:
	cd backend && UV_CACHE_DIR=$(UV_CACHE_DIR) uv run --group dev pyright

frontend-format:
	NPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm --prefix frontend run format

frontend-format-check:
	NPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm --prefix frontend run format:check

frontend-lint:
	NPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm --prefix frontend run lint

frontend-lint-fix:
	NPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm --prefix frontend run lint:fix

frontend-typecheck:
	NPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm --prefix frontend run typecheck
