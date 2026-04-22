"""Contract tests for backend Docker E2E bootstrap artifacts."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
BACKEND_ROOT = REPO_ROOT / "backend"


def _read_backend_artifact(relative_path: str) -> str:
    artifact_path = BACKEND_ROOT / relative_path
    assert artifact_path.is_file(), f"Expected {artifact_path.relative_to(REPO_ROOT)} to exist"
    return artifact_path.read_text(encoding="utf-8")


def test_backend_dockerfile_e2e_sets_shared_storage_and_runtime_contract() -> None:
    """Keep Docker runtime env, codecs, fixtures, and default command explicit."""
    dockerfile = _read_backend_artifact("Dockerfile.e2e")
    expected_database_url = (
        "ENV APP_DB_URL=sqlite:////var/lib/video-annotator-e2e/video-annotator-playwright.sqlite3"
    )

    assert expected_database_url in dockerfile
    assert "ENV APP_MASKS_DIR=/var/lib/video-annotator-e2e/masks" in dockerfile
    assert "ENV BACKEND_HOST=0.0.0.0" in dockerfile
    assert "ENV BACKEND_PORT=8000" in dockerfile
    assert "EXPOSE ${BACKEND_PORT}" in dockerfile
    assert (
        'CMD ["sh", "-lc", "uv run --no-sync --no-dev uvicorn app.main:app '
        '--host ${BACKEND_HOST} --port ${BACKEND_PORT}"]'
    ) in dockerfile
    assert "ffmpeg" in dockerfile
    assert "COPY data ./data" in dockerfile


def test_backend_docker_e2e_init_script_runs_migrations_before_seed() -> None:
    """Keep one-shot Docker init flow as migrate first, then baseline seed."""
    init_script = _read_backend_artifact("scripts/docker_e2e_init.sh")

    assert init_script.startswith("#!/usr/bin/env sh\n")
    migration_command = "alembic upgrade head"
    seed_command = "python scripts/seed_e2e.py"

    assert "uv run --no-sync --no-dev" in init_script
    assert migration_command in init_script
    assert seed_command in init_script
    assert init_script.index(migration_command) < init_script.index(seed_command)
