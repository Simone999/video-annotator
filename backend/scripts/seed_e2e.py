"""CLI entrypoint for explicit E2E baseline and scenario seeding."""

import argparse
import json
import sys
from collections.abc import Callable, Sequence
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


type DatabaseUrlLoader = Callable[[], str]
type BaselineSeed = Callable[..., Sequence[object]]
type ScenarioSeed = Callable[..., object]


def load_seed_dependencies() -> tuple[
    DatabaseUrlLoader,
    BaselineSeed,
    ScenarioSeed,
]:
    """Import backend modules only after local script path bootstrap."""
    from app.core.config import get_database_url
    from app.db.seeds import seed_baseline, seed_review_navigation

    return get_database_url, seed_baseline, seed_review_navigation


def build_argument_parser(*, default_database_url: str) -> argparse.ArgumentParser:
    """Return CLI argument parser for E2E seeding."""
    parser = argparse.ArgumentParser(description="Seed explicit E2E data for video-annotator.")
    parser.add_argument(
        "--database-url",
        default=default_database_url,
        help="Database URL for the target backend storage.",
    )
    parser.add_argument(
        "--scenario",
        choices=["review-navigation"],
        help="Optional scenario seed to apply after baseline seeding.",
    )
    return parser


def main() -> int:
    """Run baseline seed plus optional scenario seed and print JSON summary."""
    get_database_url, seed_baseline, seed_review_navigation = load_seed_dependencies()
    parser = build_argument_parser(default_database_url=get_database_url())
    arguments = parser.parse_args()

    videos: Sequence[object] = seed_baseline(database_url=arguments.database_url)
    result: dict[str, object] = {"baseline_video_count": len(videos)}

    if arguments.scenario == "review-navigation":
        result["scenario"] = seed_review_navigation(database_url=arguments.database_url)

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
