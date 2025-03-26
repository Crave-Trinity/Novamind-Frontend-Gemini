"""
NOVAMIND Database Configuration
==============================
HIPAA-compliant database configuration for the NOVAMIND platform.
Provides secure connection pooling and session management.
"""

import contextlib
from typing import Iterator, Callable, TypeVar, Generic, List, Optional, Type, Any, Dict, Union

from sqlalchemy import create_engine, inspect, MetaData, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, scoped_session
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine

from app.core.config import settings
from app.core.utils.logging import HIPAACompliantLogger

# Initialize logger
logger = HIPAACompliantLogger(__name__)

# Database URL construction with proper security
def get_database_url() -> str:
    """
    Construct database URL with credentials.
    
    Returns:
        Database connection URL string
    """
    db_config = settings.database
    return f"{db_config.DB_ENGINE}://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}:{db_config.DB_PORT}/{db_config.DB_NAME}"

# Create SQLAlchemy engine with proper connection pooling
engine = create_engine(
    get_database_url(),
    pool_size=settings.database.DB_POOL_SIZE,
    max_overflow=settings.database.DB_MAX_OVERFLOW,
    pool_timeout=settings.database.DB_POOL_TIMEOUT,
    pool_recycle=settings.database.DB_POOL_RECYCLE,
    pool_pre_ping=True,
    echo=settings.database.DB_ECHO,
)

# Add event listeners for HIPAA-compliant auditing
@event.listens_for(engine, "connect")
def receive_connect(dbapi_connection, connection_record):
    """Log database connection events for audit purposes."""
    logger.debug("Database connection established")

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_connection, connection_record, connection_proxy):
    """Log connection checkout from pool."""
    logger.debug("Database connection checked out from pool")

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_connection, connection_record):
    """Log connection return to pool."""
    logger.debug("Database connection returned to pool")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Create a metadata object with naming convention
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}
metadata = MetaData(naming_convention=convention)

# Context manager for database sessions
@contextlib.contextmanager
def get_db() -> Iterator[Session]:
    """
    Get a database session with automatic resource management.
    
    Yields:
        SQLAlchemy Session
        
    Raises:
        Exception: Re-raises any exceptions that occur during session use
    """
    db = SessionLocal()
    try:
        logger.debug("Database session started")
        yield db
        db.commit()
        logger.debug("Database session committed")
    except Exception as e:
        db.rollback()
        logger.error(f"Database session rolled back: {str(e)}")
        raise
    finally:
        db.close()
        logger.debug("Database session closed")

# Dependency for FastAPI
def get_db_dependency() -> Callable[[], Iterator[Session]]:
    """
    Create a dependency provider for database sessions.
    
    Returns:
        Function that yields database sessions
    """
    def _get_db() -> Iterator[Session]:
        with get_db() as session:
            yield session
    
    return _get_db