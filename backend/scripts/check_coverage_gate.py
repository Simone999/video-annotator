"""CLI wrapper for backend coverage threshold enforcement."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.tooling.coverage_gate import main

if __name__ == "__main__":
    raise SystemExit(main())
