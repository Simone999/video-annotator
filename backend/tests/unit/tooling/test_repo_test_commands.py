"""Contract tests for repo-level test command coverage gates."""

import importlib.util
import json
from pathlib import Path
from typing import Any, cast

REPO_ROOT = Path(__file__).resolve().parents[4]


def _read_package_json(relative_path: str) -> dict[str, Any]:
    package_path = REPO_ROOT / relative_path
    assert package_path.is_file(), f"Expected {package_path.relative_to(REPO_ROOT)} to exist"
    return cast(dict[str, Any], json.loads(package_path.read_text(encoding="utf-8")))


def test_root_test_script_runs_backend_coverage_gate_and_frontend_tests() -> None:
    """Keep repo test command wired to backend line-plus-branch coverage and frontend tests."""
    package_json = _read_package_json("package.json")
    scripts = cast(dict[str, str], package_json["scripts"])

    assert scripts["test:backend:coverage"] == (
        "uv run --project backend pytest --cov=app --cov-branch --cov-report=term-missing "
        "--cov-report=json:/tmp/video-annotator-backend-coverage.json && uv run --project "
        "backend python backend/scripts/check_coverage_gate.py "
        "/tmp/video-annotator-backend-coverage.json 90"
    )
    assert scripts["test"] == ("npm run test:backend:coverage && npm --workspace frontend run test")
    assert importlib.util.find_spec("app.tooling.coverage_gate") is not None


def test_root_gitignore_ignores_generated_coverage_outputs() -> None:
    """Keep generated coverage artifacts out of git status noise."""
    gitignore = (REPO_ROOT / ".gitignore").read_text(encoding="utf-8")

    assert ".coverage" in gitignore
    assert "coverage/" in gitignore


def test_dev_and_e2e_commands_keep_port_and_server_isolation() -> None:
    """Keep host scripts env-driven and route local dev plus E2E through wrappers."""
    package_json = _read_package_json("package.json")
    scripts = cast(dict[str, str], package_json["scripts"])
    vite_config = (REPO_ROOT / "frontend" / "vite.config.ts").read_text(encoding="utf-8")
    playwright_config = (REPO_ROOT / "tests" / "e2e" / "playwright.config.ts").read_text(
        encoding="utf-8"
    )
    dev_script = (REPO_ROOT / "scripts" / "dev.mjs").read_text(encoding="utf-8")

    assert scripts["backend:db:prepare"] == (
        "node scripts/run-with-env.mjs development -- uv --directory backend run python "
        "-m scripts.prepare_db"
    )
    assert scripts["backend:db:reset:e2e"] == "node scripts/backend-reset.mjs e2e"
    assert scripts["backend:dev"] == (
        "npm run backend:db:prepare && node scripts/run-with-env.mjs development -- uv "
        "--directory backend run uvicorn app.main:app --reload --host {BACKEND_HOST} "
        "--port {BACKEND_PORT}"
    )
    assert scripts["backend:dev:e2e"] == (
        "node scripts/run-with-env.mjs e2e -- uv --directory backend run uvicorn "
        "app.main:app --host {BACKEND_HOST} --port {BACKEND_PORT}"
    )
    assert scripts["backend:seed:e2e"] == (
        "node scripts/run-with-env.mjs e2e -- uv --directory backend run python -m scripts.seed_e2e"
    )
    assert scripts["backend:seed:e2e:review-navigation"] == (
        "node scripts/run-with-env.mjs e2e -- uv --directory backend run python "
        "-m scripts.seed_e2e --scenario review-navigation"
    )
    assert scripts["frontend:dev"] == (
        "node scripts/run-with-env.mjs development -- npm --workspace frontend run dev "
        "-- --mode development"
    )
    assert scripts["frontend:dev:e2e"] == (
        "node scripts/run-with-env.mjs e2e -- npm --workspace frontend run dev -- --mode e2e"
    )
    assert scripts["dev"] == "node scripts/dev.mjs"
    assert "envDir: repoRoot" in vite_config
    assert 'loadRepoEnv("e2e")' in playwright_config
    assert "FRONTEND_E2E_PORT" not in playwright_config
    assert "reuseExistingServer: false" in playwright_config
    assert "/api/health" in dev_script


def test_repo_env_contract_files_exist() -> None:
    """Keep repo env files checked in as the shared source of truth."""
    for relative_path in (
        ".env.example",
        ".env.e2e",
        ".env.docker-e2e",
        "backend/scripts/__init__.py",
        "scripts/env.mjs",
        "scripts/run-with-env.mjs",
        "scripts/backend-reset.mjs",
        "scripts/dev.mjs",
    ):
        artifact = REPO_ROOT / relative_path
        assert artifact.is_file(), f"Expected {relative_path} to exist"
