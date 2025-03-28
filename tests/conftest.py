# -*- coding: utf-8 -*-
"""
Test configuration and fixtures for the Novamind Backend.

This module provides common test fixtures and configuration for all test types:
- Unit tests
- Integration tests
- Security tests
- HIPAA compliance tests
"""

import os
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import MagicMock

from fastapi import FastAPI
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import Settings
from app.infrastructure.persistence.sqlalchemy.config.database import Base
from app.infrastructure.security.encryption import EncryptionService
from app.infrastructure.security.jwt_service import JWTService

# Test database URL for SQLite with async support
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """Create test settings."""
    return Settings(
        APP_NAME="Novamind Test",
        DEBUG=True,
        database={"URL": TEST_DATABASE_URL},
        JWT_SECRET_KEY="test_secret_key",
        JWT_ALGORITHM="HS256",
        ACCESS_TOKEN_EXPIRE_MINUTES=30,
        ENCRYPTION_KEY="test_encryption_key"
    )

@pytest.fixture(scope="session")
async def test_db_engine(test_settings):
    """Create a test database engine."""
    engine = create_async_engine(
        test_settings.database.URL,
        poolclass=NullPool,
        echo=False
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest.fixture
async def test_db_session(test_db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()
        await session.close()

@pytest.fixture
async def test_app(test_settings, test_db_session) -> FastAPI:
    """Create a test instance of the FastAPI application."""
    from app.main import create_app
    
    app = create_app()
    app.state.settings = test_settings
    
    # Override database dependency
    async def override_get_db():
        yield test_db_session
    
    from app.infrastructure.persistence.sqlalchemy.config.database import get_db_dependency
    app.dependency_overrides[get_db_dependency] = override_get_db
    
    return app

@pytest.fixture
async def test_client(test_app) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client for making HTTP requests."""
    async with AsyncClient(app=test_app, base_url="http://test") as client:
        yield client

@pytest.fixture
def mock_encryption_service() -> MagicMock:
    """Create a mock encryption service."""
    service = MagicMock(spec=EncryptionService)
    service.encrypt.side_effect = lambda x: f"encrypted_{x}"
    service.decrypt.side_effect = lambda x: x.replace("encrypted_", "")
    return service

@pytest.fixture
def mock_jwt_service() -> MagicMock:
    """Create a mock JWT service."""
    service = MagicMock(spec=JWTService)
    service.create_access_token.return_value = "test_access_token"
    service.verify_token.return_value = True
    return service
