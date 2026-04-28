"""Contract tests for repo-level test command coverage gates."""

import importlib.util
import json
import tomllib
from pathlib import Path
from typing import Any, cast

REPO_ROOT = Path(__file__).resolve().parents[4]


def _read_package_json(relative_path: str) -> dict[str, Any]:
    package_path = REPO_ROOT / relative_path
    assert package_path.is_file(), f"Expected {package_path.relative_to(REPO_ROOT)} to exist"
    return cast(dict[str, Any], json.loads(package_path.read_text(encoding="utf-8")))


def _read_toml(relative_path: str) -> dict[str, Any]:
    toml_path = REPO_ROOT / relative_path
    assert toml_path.is_file(), f"Expected {toml_path.relative_to(REPO_ROOT)} to exist"
    return cast(dict[str, Any], tomllib.loads(toml_path.read_text(encoding="utf-8")))


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
    assert scripts["test:backend:unit"] == "uv run --project backend pytest backend/tests/unit"
    assert scripts["test:backend:integration"] == (
        "uv run --project backend pytest backend/tests/integration"
    )
    assert scripts["test:frontend:unit"] == "npm --workspace frontend run test:unit"
    assert scripts["test:frontend:integration"] == "npm --workspace frontend run test:integration"
    assert scripts["test:unit"] == ("npm run test:backend:unit && npm run test:frontend:unit")
    assert scripts["test:integration"] == (
        "npm run test:backend:integration && npm run test:frontend:integration"
    )
    assert scripts["test"] == ("npm run test:backend:coverage && npm --workspace frontend run test")
    assert importlib.util.find_spec("app.tooling.coverage_gate") is not None


def test_backend_default_pytest_config_uses_parallel_loadscope_and_locks_xdist() -> None:
    """Keep backend default pytest runs parallel with stable loadscope worker distribution."""
    pyproject = _read_toml("backend/pyproject.toml")
    dev_dependencies = cast(list[str], pyproject["dependency-groups"]["dev"])
    pytest_options = cast(dict[str, Any], pyproject["tool"]["pytest"]["ini_options"])
    lock_text = (REPO_ROOT / "backend" / "uv.lock").read_text(encoding="utf-8")

    assert "pytest-xdist>=3.8.0" in dev_dependencies
    assert pytest_options["addopts"] == "-q -n auto --dist loadscope"
    assert 'name = "pytest-xdist"' in lock_text


def test_frontend_test_script_uses_large_heap_for_coverage_runs() -> None:
    """Keep frontend coverage routed through stable shard-plus-merge runner."""
    package_json = _read_package_json("frontend/package.json")
    scripts = cast(dict[str, str], package_json["scripts"])

    assert scripts["test"] == (
        "node scripts/run-vitest-coverage.mjs && node scripts/check-vitest-coverage-gate.mjs "
        "coverage/coverage-summary.json 90"
    )
    assert (REPO_ROOT / "frontend" / "scripts" / "run-vitest-coverage.mjs").is_file()
    assert (REPO_ROOT / "frontend" / "scripts" / "check-vitest-coverage-gate.mjs").is_file()


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
    playwright_global_setup = (REPO_ROOT / "tests" / "e2e" / "global.setup.ts").read_text(
        encoding="utf-8"
    )
    review_navigation_fixture = (
        REPO_ROOT / "frontend" / "tests" / "e2e" / "fixtures" / "review-navigation.ts"
    ).read_text(encoding="utf-8")
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
    assert scripts["test:e2e:docker:build"] == (
        "docker compose --profile runner -f docker-compose.e2e.yml build "
        "backend-init backend frontend"
    )
    assert scripts["test:e2e:docker:up"] == (
        "docker compose -f docker-compose.e2e.yml up -d backend frontend"
    )
    assert scripts["test:e2e:docker:test"] == "node scripts/docker-e2e.mjs test"
    assert scripts["test:e2e:docker:down"] == (
        "docker compose -f docker-compose.e2e.yml down -v --remove-orphans"
    )
    assert scripts["test:e2e:docker"] == "node scripts/docker-e2e.mjs full"
    assert scripts["test:e2e:strict"] == "playwright test -c tests/e2e/playwright.config.ts"
    assert scripts["dev"] == "node scripts/dev.mjs"
    assert "envDir: repoRoot" in vite_config
    assert 'process.env.PLAYWRIGHT_RUN_MODE === "docker"' in playwright_config
    assert '"docker-e2e"' in playwright_config
    assert '"e2e"' in playwright_config
    assert 'buildHttpUrl("frontend",' in playwright_config
    assert 'buildHttpUrl("backend",' in playwright_config
    assert "FRONTEND_E2E_PORT" not in playwright_config
    assert "webServer: isDockerRunMode" in playwright_config
    assert "? undefined" in playwright_config
    assert "reuseExistingServer: false" in playwright_config
    assert 'process.env.PLAYWRIGHT_RUN_MODE === "docker"' in playwright_global_setup
    assert '"docker-e2e"' in playwright_global_setup
    assert '"e2e"' in playwright_global_setup
    assert 'buildHttpUrl("backend",' in playwright_global_setup
    assert "if (isDockerRunMode === false) {" in playwright_global_setup
    assert 'run("npm", ["run", "backend:db:reset:e2e"])' in playwright_global_setup
    assert 'run("npm", ["run", "backend:db:migrate:e2e"])' in playwright_global_setup
    assert 'run("npm", ["run", "backend:seed:e2e"])' in playwright_global_setup
    assert 'process.env.PLAYWRIGHT_RUN_MODE === "docker"' in review_navigation_fixture
    assert "E2E_REVIEW_NAVIGATION_SCENARIO_JSON" in review_navigation_fixture
    assert '"test:e2e:strict"' in (REPO_ROOT / "scripts" / "docker-e2e.mjs").read_text(
        encoding="utf-8"
    )
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
        "scripts/docker-e2e.mjs",
        "scripts/dev.mjs",
    ):
        artifact = REPO_ROOT / relative_path
        assert artifact.is_file(), f"Expected {relative_path} to exist"
