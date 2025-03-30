# -*- coding: utf-8 -*-
"""
Core Configuration Package.

This package provides configuration loading and management
for application settings across different environments.
"""

import os
from typing import List, Optional, Dict, Any, Union
from functools import lru_cache

from pydantic import BaseModel, field_validator, Field, ConfigDict

from app.core.config.ml_settings import MLSettings, get_ml_settings
from app.core.constants import Environment


class AppSettings(BaseModel):
    """
    Application settings.
    
    This class provides configuration settings for the application,
    with validation and default values.
    """
    
    # Application settings
    APP_NAME: str = "Novamind Digital Twin"
    DEBUG: bool = False
    
    # Security settings
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://app.novamind.ai"]
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    CORS_HEADERS: List[str] = ["*"]
    
    # Database connection settings
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Environment settings
    ENV: str = Environment.DEVELOPMENT
    
    # Paths and directories
    DATA_DIR: str = "./data"
    STATIC_DIR: str = "./static"
    TEMP_DIR: str = "./tmp"
    
    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SSL: bool = False
    
    # Defaults
    model_config = ConfigDict(
        validate_assignment=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    @field_validator("ENV")
    def validate_env(cls, v: str) -> str:
        """Validate environment is valid."""
        try:
            return Environment(v)
        except ValueError:
            valid_envs = [e.value for e in Environment]
            raise ValueError(f"Invalid environment: {v}. Must be one of: {valid_envs}")
    
    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_uri(cls, v: Optional[str], info) -> str:
        """Assemble database URI from individual settings if not provided."""
        if v:
            return v
            
        values = info.data
        
        # Convert port to string
        port = str(values.get("POSTGRES_PORT", 5432))
        
        return (
            f"postgresql+asyncpg://"
            f"{values.get('POSTGRES_USER', '')}:"
            f"{values.get('POSTGRES_PASSWORD', '')}@"
            f"{values.get('POSTGRES_SERVER', '')}:"
            f"{port}/"
            f"{values.get('POSTGRES_DB', '')}"
        )


@lru_cache()
def get_app_settings() -> AppSettings:
    """
    Get application settings.
    
    This function returns the application settings singleton, cached for efficiency.
    It loads settings from environment variables and .env file.
    
    Returns:
        Application settings object
    """
    return AppSettings()


# Export ML settings module components
__all__ = ["AppSettings", "get_app_settings", "MLSettings", "get_ml_settings"]