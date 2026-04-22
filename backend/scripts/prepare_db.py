"""Prepare local backend database for current code before starting dev server."""

from app.db.migrations import prepare_database


def main() -> None:
    """Repair known local legacy SQLite state and run Alembic upgrades."""
    prepare_database()


if __name__ == "__main__":
    main()
