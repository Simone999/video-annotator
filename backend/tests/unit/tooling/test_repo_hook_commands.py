"""Contract tests for repo hook stage wiring and setup docs."""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]


def _read_text(relative_path: str) -> str:
    artifact = REPO_ROOT / relative_path
    assert artifact.is_file(), f"Expected {relative_path} to exist"
    return artifact.read_text(encoding="utf-8")


def _hook_block(config_text: str, hook_id: str) -> str:
    marker = f"      - id: {hook_id}"
    start = config_text.index(marker)
    next_start = config_text.find("\n      - id: ", start + len(marker))
    if next_start == -1:
        return config_text[start:]
    return config_text[start:next_start]


def test_pre_commit_config_installs_both_hook_types_and_routes_stage_checks() -> None:
    """Keep repo hook stages split across commit and push boundaries."""
    config_text = _read_text(".pre-commit-config.yaml")

    assert "default_install_hook_types: [pre-commit, pre-push]" in config_text

    hook_order = [
        "repo-format-check",
        "repo-lint-fix",
        "repo-lint",
        "repo-typecheck",
        "repo-unit-tests",
        "repo-integration-tests",
    ]
    positions = [config_text.index(f"- id: {hook_id}") for hook_id in hook_order]
    assert positions == sorted(positions)

    for hook_id in (
        "repo-format-check",
        "repo-lint-fix",
        "repo-lint",
        "repo-typecheck",
        "repo-unit-tests",
    ):
        assert "stages: [pre-commit]" in _hook_block(config_text, hook_id)

    unit_block = _hook_block(config_text, "repo-unit-tests")
    integration_block = _hook_block(config_text, "repo-integration-tests")

    assert "entry: npm run test:unit" in unit_block
    assert "stages: [pre-commit]" in unit_block
    assert "entry: npm run test:integration" in integration_block
    assert "stages: [pre-push]" in integration_block
    assert "test:e2e" not in config_text


def test_precommit_install_installs_pre_commit_and_pre_push_explicitly() -> None:
    """Keep repo hook installation explicit for both managed git hook types."""
    makefile = _read_text("Makefile")

    assert (
        "uv run --group dev pre-commit install --hook-type pre-commit "
        "--hook-type pre-push --config ../.pre-commit-config.yaml"
    ) in makefile
    assert "\tNPM_CONFIG_CACHE=$(NPM_CONFIG_CACHE) npm install" in makefile
    assert "npm --prefix frontend install" not in makefile


def test_dev_setup_runbook_documents_split_test_commands_and_hook_install() -> None:
    """Keep developer setup docs aligned with staged test hooks and manual E2E."""
    runbook = _read_text("docs/runbooks/dev-setup.md")

    for snippet in (
        "npm run test:unit",
        "npm run test:integration",
        "npm run test:e2e",
        "make precommit-install",
        "python -m scripts.prepare_db",
        "pre-commit",
        "pre-push",
    ):
        assert snippet in runbook

    assert "root `package-lock.json` is canonical for npm workspace installs" in runbook
    assert "uv --version\n```" in runbook
    assert "````" not in runbook
    assert (
        "export VIDEO_ID=\"$(curl -s http://127.0.0.1:8000/api/videos | jq -r '.[0].id')\""
        in runbook
    )
    assert re.search(
        r"(?m)^(?P<indent>\s*)with urllib\.request\.urlopen\(url\) as response:\n"
        r"(?P=indent)\s{4}data = response\.read\(\)$",
        runbook,
    )
