"""SQLAlchemy engine and session helpers for the backend."""

from collections.abc import Generator
from functools import cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_database_url


@cache
def get_engine(*, database_url: str | None = None) -> Engine:
    """Build or reuse a SQLAlchemy engine for the configured database URL."""
    resolved_database_url = database_url or get_database_url()
    return create_engine(resolved_database_url)


@cache
def get_session_factory(*, database_url: str | None = None) -> sessionmaker[Session]:
    """Build or reuse a SQLAlchemy session factory."""
    return sessionmaker(bind=get_engine(database_url=database_url))


def get_db_session() -> Generator[Session, None, None]:
    """Yield one backend database session for a request lifecycle."""
    with get_session_factory()() as session:
        yield session
