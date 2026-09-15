import os
from collections.abc import Generator
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """Accept Render/Railway postgres:// URLs and use the psycopg2 SQLAlchemy driver."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://") and "+psycopg2" not in url.split("://", 1)[0]:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


def _build_database_url() -> str:
    """Build a PostgreSQL URL from DATABASE_URL or individual env vars."""
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return _normalize_database_url(explicit)

    user = os.getenv("POSTGRES_USER", os.getenv("DB_USER", "hub"))
    password = os.getenv("POSTGRES_PASSWORD", os.getenv("DB_PASSWORD", "hub"))
    host = os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "localhost"))
    port = os.getenv("POSTGRES_PORT", os.getenv("DB_PORT", "5432"))
    name = os.getenv("POSTGRES_DB", os.getenv("DB_NAME", "personal_ai"))

    return (
        f"postgresql+psycopg2://{quote_plus(user)}:{quote_plus(password)}"
        f"@{host}:{port}/{name}"
    )


DATABASE_URL = _build_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"connect_timeout": 5},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Register models and create tables if they do not already exist."""
    import models  # noqa: F401 — attach Task and AgentLog to Base.metadata

    Base.metadata.create_all(bind=engine)


def check_connection() -> dict[str, str | bool]:
    """Open a real PostgreSQL connection and run a probe query."""
    with engine.connect() as connection:
        version = connection.execute(text("SELECT version()")).scalar_one()
        connection.execute(text("SELECT 1"))

    return {
        "success": True,
        "database": "connected",
        "server_version": version,
    }
