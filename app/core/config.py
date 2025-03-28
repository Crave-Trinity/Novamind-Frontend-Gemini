# -*- coding: utf-8 -*-
"""
HIPAA-Compliant Configuration Module

This module provides centralized configuration for the NOVAMIND platform,
including security, encryption, and compliance settings.
"""

import os
from functools import lru_cache
from typing import Dict, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class LoggingSettings(BaseModel):
    """Logging configuration settings."""
    
    LOG_TO_CONSOLE: bool = Field(True, description="Enable console logging")
    LOG_TO_FILE: bool = Field(False, description="Enable file logging")
    LOG_FILE_PATH: str = Field("logs/app.log", description="Path to log file")
    ENABLE_AUDIT_LOGGING: bool = Field(True, description="Enable audit logging")
    AUDIT_LOG_FILE: str = Field("logs/audit.log", description="Path to audit log file")
    LOG_LEVEL: str = Field("INFO", description="Default logging level")
    LOG_FORMAT: str = Field(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log message format"
    )


class DatabaseSettings(BaseModel):
    """Database configuration settings."""
    
    URL: str = Field("sqlite+aiosqlite:///./novamind.db", description="Database connection URL")
    
    # Individual database components
    DB_ENGINE: str = Field("postgresql+asyncpg", description="Database engine")
    DB_HOST: str = Field("localhost", description="Database host")
    DB_PORT: str = Field("5432", description="Database port")
    DB_USER: str = Field("postgres", description="Database user")
    DB_PASSWORD: str = Field("postgres", description="Database password")
    DB_NAME: str = Field("novamind", description="Database name")
    
    # Connection pool settings
    ECHO: bool = Field(False, description="Enable SQL query logging")
    POOL_SIZE: int = Field(5, description="Connection pool size")
    MAX_OVERFLOW: int = Field(10, description="Maximum pool overflow")
    POOL_PRE_PING: bool = Field(True, description="Enable connection health checks")
    POOL_RECYCLE: int = Field(3600, description="Connection recycle time in seconds")


class SecuritySettings(BaseModel):
    """Security configuration settings."""
    
    JWT_SECRET_KEY: str = Field("test_secret_key_do_not_use_in_production", description="Secret key for JWT tokens")
    JWT_ALGORITHM: str = Field("HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        30, description="Access token expiration time in minutes"
    )
    ENCRYPTION_KEY: str = Field("test_encryption_key_do_not_use_in_production", description="Key for encrypting sensitive data")
    ENABLE_PHI_REDACTION: bool = Field(True, description="Enable PHI redaction in logs")
    CORS_ORIGINS: list[str] = Field(
        ["*"], description="Allowed CORS origins"
    )
    CORS_METHODS: list[str] = Field(
        ["*"], description="Allowed CORS methods"
    )
    CORS_HEADERS: list[str] = Field(
        ["*"], description="Allowed CORS headers"
    )


class Settings(BaseSettings):
    """Application settings."""
    
    # Basic settings
    APP_NAME: str = Field("Novamind", description="Application name")
    DEBUG: bool = Field(False, description="Debug mode")
    API_VERSION: str = Field("v1", description="API version")
    HOST: str = Field("0.0.0.0", description="Host to bind to")
    PORT: int = Field(8000, description="Port to bind to")
    
    # Component settings
    database: DatabaseSettings = Field(default_factory=DatabaseSettings)
    logging: LoggingSettings = Field(default_factory=LoggingSettings)
    security: SecuritySettings = Field(default_factory=SecuritySettings)
    
    class Config:
        """Pydantic model configuration."""
        
        env_file = ".env"
        env_file_encoding = "utf-8"
        env_nested_delimiter = "__"
        use_enum_values = True
        case_sensitive = True
        
        # Allow environment variables to override config
        env_prefix = "NOVAMIND_"
        
        # Custom config section
        arbitrary_types_allowed = True
        json_encoders = {
            # Add custom JSON encoders here if needed
        }


@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings, cached for efficiency.

    Returns:
        Settings: Application settings object
    """
    return Settings()


# Export settings singleton for direct import
settings = get_settings()
