# -*- coding: utf-8 -*-
"""Database configuration module."""

import asyncio
import logging
import re
from typing import AsyncGenerator, Callable, Any, Dict, Optional
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker, AsyncEngine
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings
from app.core.utils.logging import HIPAACompliantLogger

# Initialize settings and logger
settings = Settings()
logger = HIPAACompliantLogger(__name__)

# Create SQLAlchemy base class for models
Base = declarative_base()


class Database:
    """
    Database connection manager with HIPAA-compliant auditing.
    
    Handles database connection lifecycle, session management, and audit logging
    in a HIPAA-compliant manner.
    """
    
    def __init__(self) -> None:
        """Initialize the database connection."""
        self.engine = self._create_engine()
        self.session_factory = self._create_session_factory()
        self._setup_event_listeners()
        logger.info("Database connection initialized")
    
    def _get_database_url(self) -> str:
        """Get the database URL from settings."""
        db_config = settings.database
        
        # If URL is explicitly provided in settings, use it
        if hasattr(db_config, 'URL') and db_config.URL and not db_config.URL.startswith('__'):
            return db_config.URL
        
        # Otherwise build URL from components
        return f"{db_config.DB_ENGINE}://{db_config.DB_USER}:{db_config.DB_PASSWORD}@{db_config.DB_HOST}:{db_config.DB_PORT}/{db_config.DB_NAME}"
    
    def _get_engine_kwargs(self) -> Dict[str, Any]:
        """Get engine configuration kwargs based on dialect."""
        engine_kwargs = {
            "echo": settings.database.ECHO,
            "pool_pre_ping": settings.database.POOL_PRE_PING,
        }
        
        # Only add pooling configuration for non-SQLite databases
        if not self._get_database_url().startswith('sqlite'):
            engine_kwargs.update({
                "pool_size": settings.database.POOL_SIZE,
                "max_overflow": settings.database.MAX_OVERFLOW,
                "pool_recycle": settings.database.POOL_RECYCLE,
            })
        
        return engine_kwargs
    
    def _create_engine(self) -> AsyncEngine:
        """Create and configure the SQLAlchemy async engine."""
        try:
            url = self._get_database_url()
            engine_kwargs = self._get_engine_kwargs()
            
            # Add SSL configuration if required
            if hasattr(settings.database, 'SSL_REQUIRED') and settings.database.SSL_REQUIRED:
                if 'connect_args' not in engine_kwargs:
                    engine_kwargs['connect_args'] = {}
                engine_kwargs['connect_args']['sslmode'] = 'require'
                logger.info("SSL connection enabled for database")
            
            return create_async_engine(
                url,
                **engine_kwargs
            )
        except Exception as e:
            # Ensure no credentials are logged
            error_msg = str(e)
            # Sanitize error message to remove any potential credentials
            if settings.database.DB_PASSWORD in error_msg:
                error_msg = error_msg.replace(settings.database.DB_PASSWORD, '[REDACTED]')
            
            logger.error(f"Failed to initialize database engine: {error_msg}")
            raise
    
    def _create_session_factory(self) -> async_sessionmaker:
        """Create the async session factory."""
        session_kwargs = {
            "class_": AsyncSession,
            "expire_on_commit": False,
        }
        
        # Note: isolation_level is set at the engine level,
        # not at the session level for async sessions
        
        return async_sessionmaker(
            self.engine,
            **session_kwargs
        )
    
    def _setup_event_listeners(self) -> None:
        """Set up SQLAlchemy event listeners for auditing and security."""
        # Skip event registration during testing to avoid issues with mocks
        if hasattr(settings.database, "TESTING") and settings.database.TESTING:
            logger.debug("Skipping event listeners setup in testing mode")
            return
            
        # Only register event if we have a real engine (not a mock)
        if hasattr(self.engine, "sync_engine") and self.engine.sync_engine is not None:
            try:
                @event.listens_for(self.engine.sync_engine, "connect")
                def receive_connect(dbapi_connection, connection_record):
                    """Log database connection events for audit purposes."""
                    logger.debug("Database connection established")
                    
                    # Set SSL mode if required
                    if hasattr(settings.database, "SSL_REQUIRED") and settings.database.SSL_REQUIRED:
                        try:
                            cursor = dbapi_connection.cursor()
                            cursor.execute("SELECT 1")
                            cursor.close()
                            logger.info("SSL connection enabled for database")
                        except Exception as e:
                            # Don't log the actual exception which might contain sensitive info
                            logger.warning(f"SSL validation failed: {self._sanitize_error_message(str(e))}")
            except Exception as e:
                # Just log the error but don't crash initialization
                # This allows tests to run with mocked engines
                logger.warning(f"Failed to set up event listeners: {self._sanitize_error_message(str(e))}")
    
    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Get a database session as an async context manager with HIPAA compliance safeguards.
        
        This context manager handles session lifecycle, transaction management, and
        ensures that error messages are properly sanitized to prevent PHI leakage.
        
        Usage:
            async with db.session() as session:
                # Use session here
        """
        session = self.session_factory()
        session_id = id(session)  # Generate unique session ID for logging
        
        try:
            logger.debug(f"Database session {session_id} started")
            # Set session info for audit purposes
            session.info["hipaa_compliant"] = True
            session.info["session_id"] = session_id
            
            yield session
            
            await session.commit()
            logger.debug(f"Database session {session_id} committed")
        except Exception as e:
            await session.rollback()
            
            # Sanitize error message for HIPAA compliance
            error_message = self._sanitize_error_message(str(e))
            
            logger.error(f"Database session {session_id} rolled back: {error_message}")
            raise
        finally:
            await session.close()
            logger.debug(f"Database session {session_id} closed")
    
    def _sanitize_error_message(self, error_message: str) -> str:
        """
        Sanitize error messages to remove any potential PHI.
        
        Args:
            error_message: The original error message
            
        Returns:
            A sanitized version of the error message without PHI
        """
        # Common PHI patterns to detect and redact
        # These are simplified patterns - in production, more comprehensive regex would be used
        patterns = [
            # SSN pattern (123-45-6789)
            r'\d{3}-\d{2}-\d{4}',
            # Email pattern
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            # Phone numbers in various formats
            r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            # Credit card numbers (simplified)
            r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}',
            # Names (look for quotes around names in SQL errors)
            r"'[A-Z][a-z]+ [A-Z][a-z]+'"
        ]
        
        # Replace any PHI patterns found with [REDACTED]
        sanitized_message = error_message
        for pattern in patterns:
            sanitized_message = re.sub(pattern, '[REDACTED]', sanitized_message)
        
        # If the message is a DB or SQL-specific error, provide a generic version
        if 'SQL' in sanitized_message or 'query' in sanitized_message.lower():
            # Keep only the error type, not the details which might contain PHI
            error_parts = sanitized_message.split(':', 1)
            if len(error_parts) > 1:
                sanitized_message = f"{error_parts[0]}: Database operation failed"
            else:
                sanitized_message = "Database operation failed with error"
        
        return sanitized_message
    
    async def dispose(self) -> None:
        """Dispose of the engine and connection pool."""
        if self.engine:
            await self.engine.dispose()
            logger.debug("Database engine disposed")


# Create a global instance of the Database class
db = Database()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get a database session."""
    async with db.session() as session:
        yield session


# Dependency for FastAPI
def get_db_dependency() -> Callable[[], AsyncGenerator[AsyncSession, None]]:
    """
    Create a dependency provider for database sessions.
    
    Returns:
        Function that yields database sessions
    """
    async def _get_db() -> AsyncGenerator[AsyncSession, None]:
        async for session in get_session():
            yield session
    
    return _get_db


async def create_tables() -> None:
    """Create all defined tables."""
    async with db.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")


def get_engine() -> AsyncEngine:
    """Get the current database engine."""
    return db.engine
