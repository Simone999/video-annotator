"""Unit tests for backend configuration helpers."""

from pathlib import Path

import pytest

import app.core.config as config_module


def test_get_database_url_prefers_environment_override(monkeypatch: pytest.MonkeyPatch) -> None:
    """Return explicit database URL when env override is present."""
    monkeypatch.setenv("APP_DB_URL", "sqlite:////tmp/override.sqlite3")

    assert config_module.get_database_url() == "sqlite:////tmp/override.sqlite3"


def test_get_masks_dir_prefers_environment_override(monkeypatch: pytest.MonkeyPatch) -> None:
    """Resolve explicit masks directory when env override is present."""
    monkeypatch.setenv("APP_MASKS_DIR", "/tmp/test-masks")

    assert config_module.get_masks_dir() == Path("/tmp/test-masks").resolve()
