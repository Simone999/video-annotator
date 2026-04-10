"""SQLite schema definitions for indexed videos."""

CREATE_VIDEOS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS videos (
  video_id TEXT PRIMARY KEY,
  filepath TEXT NOT NULL UNIQUE,
  fps REAL NOT NULL CHECK (fps > 0),
  frame_count INTEGER NOT NULL CHECK (frame_count > 0),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  duration_seconds REAL NOT NULL CHECK (duration_seconds >= 0)
);
"""
