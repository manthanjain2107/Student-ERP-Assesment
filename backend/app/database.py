"""SQLAlchemy database engine, session management, and initialization helpers."""

from collections.abc import Generator
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""


def _build_engine():
    """Create SQLAlchemy engine from the configured DATABASE_URL."""
    if not settings.DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set DATABASE_URL in backend/.env."
        )

    url = make_url(settings.DATABASE_URL)
    engine_kwargs: dict = {
        "echo": settings.DB_ECHO,
        "pool_pre_ping": True,
    }

    if url.get_backend_name() == "sqlite":
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs["pool_recycle"] = 3600

    return create_engine(settings.DATABASE_URL, **engine_kwargs)


engine = _build_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy database session per request and ensure cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_database_exists() -> None:
    """Create the target MySQL database if it does not already exist."""
    url = make_url(settings.DATABASE_URL)
    if url.get_backend_name() != "mysql" or not url.database:
        return

    database_name = url.database
    server_url = url.set(database="")
    temp_engine = create_engine(server_url, pool_pre_ping=True)
    try:
        with temp_engine.connect() as conn:
            safe_db_name = database_name.replace("`", "``")
            conn.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{safe_db_name}` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
                )
            )
            conn.commit()
    finally:
        temp_engine.dispose()


def init_db() -> None:
    """Initialize database tables safely without dropping existing data."""
    # Import models so metadata registers all ORM tables before create_all
    from app.models import student  # noqa: F401

    ensure_database_exists()
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
