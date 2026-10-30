"""Database engine and session management for DisruptionIQ.

Uses SQLite with WAL mode and foreign key enforcement enabled for consistent transactions
and multi-tenant relational integrity.
"""

from __future__ import annotations

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.models import Base

DB_FILE = os.getenv("DATABASE_URL", "sqlite:///./disruption_iq.db")

engine = create_engine(
    DB_FILE,
    connect_args={"check_same_thread": False} if DB_FILE.startswith("sqlite") else {},
    echo=False,
)

# Enforce foreign key constraints in SQLite
if DB_FILE.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency for obtaining a database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
