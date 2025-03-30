# -*- coding: utf-8 -*-
"""
Application Configuration.

This module provides application configuration settings, loaded from environment
variables or .env files, with validation and type conversion.
"""

import os
from typing import Any, Dict, List, Optional, Union
from pathlib import Path

from pydantic_settings import BaseSettings
from pydantic import validator, Field

from app.core.constants import Environment


class AppSettings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    This class defines the configuration settings for the application,
    with validation and default values.
    """
    
    # Application basics
    APP_NAME: str = "Novamind Digital Twin API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: Environment = Environment.DEVELOPMENT
    API_PREFIX: str = "/api/v1"
    
    # Security settings
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["*"]
    CORS_METHODS: List[str] = ["*"]
    CORS_HEADERS: List[str] = ["*"]
    SECURITY_BCRYPT_ROUNDS: int = 12
    
    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "novamind"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    
    # Rate limiting
    RATE_LIMIT_DEFAULT_REQUESTS: int = 100
    RATE_LIMIT_DEFAULT_WINDOW: int = 60  # seconds
    RATE_LIMIT_ANALYTICS_REQUESTS: int = 1000
    RATE_LIMIT_ANALYTICS_WINDOW: int = 300  # seconds
    RATE_LIMIT_HIGH_PRIORITY_REQUESTS: int = 500
    RATE_LIMIT_HIGH_PRIORITY_WINDOW: int = 60  # seconds
    
    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    LOG_FILE_PATH: Optional[str] = None
    
    # Analytics settings
    ANALYTICS_ENABLED: bool = True
    ANALYTICS_BATCH_SIZE: int = 100
    ANALYTICS_RETENTION_DAYS: int = 90
    
    # File storage
    STORAGE_BACKEND: str = "local"  # "local", "s3", "azure"
    STORAGE_LOCAL_PATH: str = "./storage"
    STORAGE_S3_BUCKET: Optional[str] = None
    STORAGE_S3_REGION: Optional[str] = None
    
    # AWS settings
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = None
    
    @validator("ENV")
    def validate_env(cls, v):
        """
        Validate the environment value.
        
        Args:
            v: Environment value
            
        Returns:
            Validated environment
        """
        if isinstance(v, str):
            return Environment(v)
        return v
        
    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        """
        Assemble database connection URI if not provided directly.
        
        Args:
            v: SQLALCHEMY_DATABASE_URI value
            values: Dict with all values
            
        Returns:
            Database connection URI
        """
        if v:
            return v
            
        return (
            f"postgresql+asyncpg://{values.get('POSTGRES_USER')}:"
            f"{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:"
            f"{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"
        )
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


def get_app_settings() -> AppSettings:
    """
    Get application settings.
    
    This function returns the application settings, loading from
    environment variables or .env file.
    
    Returns:
        Application settings
    """
    return AppSettings()
