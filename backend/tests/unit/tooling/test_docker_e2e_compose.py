"""Contract tests for Docker Compose E2E stack artifacts."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
COMPOSE_FILE = REPO_ROOT / "docker-compose.e2e.yml"


def _read_compose_file() -> str:
    assert COMPOSE_FILE.is_file(), f"Expected {COMPOSE_FILE.relative_to(REPO_ROOT)} to exist"
    return COMPOSE_FILE.read_text(encoding="utf-8")


def test_docker_compose_e2e_keeps_base_stack_contract() -> None:
    """Keep shared-volume compose services and dependency handoffs explicit."""
    compose = _read_compose_file()

    assert compose.startswith("# Shared SQLite volume only.")
    assert "\n  db:\n" not in compose
    assert compose.count("video-annotator-e2e-state:/var/lib/video-annotator-e2e") == 2
    assert compose.count("condition: service_completed_successfully") == 1
    assert compose.count("condition: service_healthy") == 3
    assert 'echo "Playwright Docker mode wiring lands in US-013"' in compose
    assert ".env.docker-e2e" in compose
    assert "BACKEND_PORT" in compose
    assert "FRONTEND_PORT" in compose

    backend_init_contract = """services:
  backend-init:
    build:
      context: .
      dockerfile: backend/Dockerfile.e2e
    command: ["./scripts/docker_e2e_init.sh"]
    restart: "no"
    env_file:
      - ./.env.docker-e2e
    volumes:
      - video-annotator-e2e-state:/var/lib/video-annotator-e2e
"""
    backend_contract = """  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile.e2e
    env_file:
      - ./.env.docker-e2e
    depends_on:
      backend-init:
        condition: service_completed_successfully
"""
    frontend_contract = """  frontend:
    build:
      context: frontend
      dockerfile: Dockerfile.e2e
    env_file:
      - ./.env.docker-e2e
    depends_on:
      backend:
        condition: service_healthy
"""
    playwright_contract = """  playwright:
    image: mcr.microsoft.com/playwright:v1.59.1-noble
    profiles:
      - runner
    working_dir: /workdir
    environment:
      PLAYWRIGHT_RUN_MODE: docker
    depends_on:
      backend:
        condition: service_healthy
      frontend:
        condition: service_healthy
    command:
      - bash
      - -lc
      - echo "Playwright Docker mode wiring lands in US-013"
    volumes:
      - .:/workdir
"""

    assert backend_init_contract in compose
    assert backend_contract in compose
    assert frontend_contract in compose
    assert playwright_contract in compose
    assert compose.rstrip().endswith("volumes:\n  video-annotator-e2e-state:")
