"""Static configuration values for the backend."""

from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = REPOSITORY_ROOT / "data"
DATABASE_PATH = DATA_DIR / "video_annotator.db"
