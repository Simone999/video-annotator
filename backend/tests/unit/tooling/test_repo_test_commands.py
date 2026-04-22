"""Contract tests for repo-level test command coverage gates."""

import json
from pathlib import Path
from typing import Any, cast

REPO_ROOT = Path(__file__).resolve().parents[4]


def _read_package_json(relative_path: str) -> dict[str, Any]:
    package_path = REPO_ROOT / relative_path
    assert package_path.is_file(), f"Expected {package_path.relative_to(REPO_ROOT)} to exist"
    return cast(dict[str, Any], json.loads(package_path.read_text(encoding="utf-8")))


def test_root_test_script_runs_backend_coverage_gate_and_frontend_tests() -> None:
    """Keep repo test command wired to backend coverage gate and frontend workspace tests."""
    package_json = _read_package_json("package.json")
    scripts = cast(dict[str, str], package_json["scripts"])

    assert scripts["test:backend:coverage"] == (
        "uv run --project backend pytest --cov=app --cov-report=term-missing --cov-fail-under=80"
    )
    assert scripts["test"] == ("npm run test:backend:coverage && npm --workspace frontend run test")


def test_root_gitignore_ignores_generated_coverage_outputs() -> None:
    """Keep generated coverage artifacts out of git status noise."""
    gitignore = (REPO_ROOT / ".gitignore").read_text(encoding="utf-8")

    assert ".coverage" in gitignore
    assert "coverage/" in gitignore
