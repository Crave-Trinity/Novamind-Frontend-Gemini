# -*- coding: utf-8 -*-
"""
Application Configuration.

This module provides configuration settings for the application.
All environment variables are loaded here and accessed through this module.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class MentalLLaMASettings(BaseSettings):
    """MentaLLaMA service settings."""
    
    provider: str = Field(
        "mock", 
        description="Provider for MentaLLaMA service (aws_bedrock, mock)"
    )
    aws_region: Optional[str] = Field(
        None, 
        description="AWS region for Bedrock service"
    )
    aws_access_key_id: Optional[str] = Field(
        None, 
        description="AWS access key ID (if not using instance role)"
    )
    aws_secret_access_key: Optional[str] = Field(
        None, 
        description="AWS secret access key (if not using instance role)"
    )
    default_model: str = Field(
        "claude-v2", 
        description="Default model to use for MentaLLaMA service"
    )
    depression_detection_model: Optional[str] = Field(
        None, 
        description="Model to use for depression detection"
    )
    risk_assessment_model: Optional[str] = Field(
        None, 
        description="Model to use for risk assessment"
    )
    sentiment_analysis_model: Optional[str] = Field(
        None, 
        description="Model to use for sentiment analysis"
    )
    wellness_dimensions_model: Optional[str] = Field(
        None, 
        description="Model to use for wellness dimensions analysis"
    )
    max_tokens: int = Field(
        1024, 
        description="Maximum tokens to generate"
    )
    temperature: float = Field(
        0.7, 
        description="Sampling temperature (0.0-1.0)"
    )
    timeout_seconds: int = Field(
        30, 
        description="Timeout in seconds for API calls"
    )
    request_retries: int = Field(
        3, 
        description="Number of retries for failed API calls"
    )
    encryption_key_id: Optional[str] = Field(
        None, 
        description="AWS KMS key ID for encryption (HIPAA)"
    )
    log_phi: bool = Field(
        False, 
        description="Whether to log PHI (should be False in production)"
    )
    cache_results: bool = Field(
        True, 
        description="Whether to cache results (improves performance)"
    )
    cache_ttl_seconds: int = Field(
        3600, 
        description="Time-to-live for cached results in seconds"
    )
    
    model_config = SettingsConfigDict(
        env_prefix="MENTALLLAMA_",
        extra="ignore"
    )
    
    @field_validator("provider")
    def validate_provider(cls, v: str) -> str:
        """Validate provider."""
        allowed_providers = ["aws_bedrock", "mock"]
        if v not in allowed_providers:
            raise ValueError(f"Provider must be one of {allowed_providers}")
        return v


class PHIDetectionSettings(BaseSettings):
    """PHI detection service settings."""
    
    enabled: bool = Field(
        True, 
        description="Whether PHI detection is enabled"
    )
    provider: str = Field(
        "internal", 
        description="Provider for PHI detection service (internal, aws)"
    )
    detection_level: str = Field(
        "strict", 
        description="Detection level (strict, moderate, relaxed)"
    )
    aws_region: Optional[str] = Field(
        None, 
        description="AWS region for Comprehend Medical"
    )
    aws_access_key_id: Optional[str] = Field(
        None, 
        description="AWS access key ID (if not using instance role)"
    )
    aws_secret_access_key: Optional[str] = Field(
        None, 
        description="AWS secret access key (if not using instance role)"
    )
    
    model_config = SettingsConfigDict(
        env_prefix="PHI_DETECTION_",
        extra="ignore"
    )


class DigitalTwinSettings(BaseSettings):
    """Digital Twin service settings."""
    
    enabled: bool = Field(
        False, 
        description="Whether Digital Twin service is enabled"
    )
    provider: str = Field(
        "internal", 
        description="Provider for Digital Twin service (internal, external)"
    )
    model_path: Optional[str] = Field(
        None, 
        description="Path to Digital Twin model"
    )
    
    model_config = SettingsConfigDict(
        env_prefix="DIGITAL_TWIN_",
        extra="ignore"
    )


class MLServiceSettings(BaseSettings):
    """ML service settings."""
    
    mentalllama: MentalLLaMASettings = Field(
        default_factory=MentalLLaMASettings,
        description="MentaLLaMA service settings"
    )
    phi_detection: PHIDetectionSettings = Field(
        default_factory=PHIDetectionSettings,
        description="PHI detection service settings"
    )
    digital_twin: DigitalTwinSettings = Field(
        default_factory=DigitalTwinSettings,
        description="Digital Twin service settings"
    )
    
    model_config = SettingsConfigDict(
        env_prefix="ML_",
        extra="ignore"
    )


class Settings(BaseSettings):
    """Application settings."""
    
    # Application settings
    ENV: str = Field(
        "development", 
        description="Environment (development, staging, production)"
    )
    APP_NAME: str = Field(
        "Concierge Psychiatry Platform", 
        description="Application name"
    )
    APP_VERSION: str = Field(
        "1.0.0", 
        description="Application version"
    )
    DEBUG: bool = Field(
        False, 
        description="Debug mode"
    )
    API_PREFIX: str = Field(
        "/api/v1", 
        description="API prefix"
    )
    BACKEND_CORS_ORIGINS: List[str] = Field(
        ["http://localhost:8000", "http://localhost:3000"], 
        description="CORS origins"
    )
    
    # Security settings
    SECRET_KEY: str = Field(
        "development_secret_key_change_in_production",
        description="Secret key for JWT encoding"
    )
    JWT_ALGORITHM: str = Field(
        "HS256", 
        description="JWT algorithm"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        30, 
        description="Access token expiration in minutes"
    )
    
    # Database settings
    DATABASE_URL: str = Field(
        "sqlite:///./app.db", 
        description="Database URL"
    )
    
    # HIPAA Compliance settings
    HIPAA_ENABLED: bool = Field(
        True, 
        description="Whether HIPAA compliance is enabled"
    )
    PHI_LOG_SANITIZER_ENABLED: bool = Field(
        True, 
        description="Whether PHI log sanitization is enabled"
    )
    PHI_LOG_SANITIZER_PATTERNS_FILE: str = Field(
        "phi_patterns.yaml", 
        description="Path to PHI patterns file"
    )
    
    # ML services settings
    ML_SERVICES: MLServiceSettings = Field(
        default_factory=MLServiceSettings,
        description="ML services settings"
    )
    
    # Path settings
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
    
    @field_validator("BACKEND_CORS_ORIGINS")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("ENV")
    def validate_env(cls, v: str) -> str:
        """Validate environment."""
        allowed_envs = ["development", "staging", "production"]
        if v not in allowed_envs:
            raise ValueError(f"Environment must be one of {allowed_envs}")
        return v


# Create settings instance
settings = Settings()
