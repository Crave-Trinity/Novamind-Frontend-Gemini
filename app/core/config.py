"""
Application configuration settings.

This module provides configuration settings for the application, loaded from
environment variables and/or a .env file.
"""

import logging
import os
from typing import Any, Dict, List, Optional

from pydantic import AnyHttpUrl, BaseModel, Field, PostgresDsn, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Set up logging with no PHI
logger = logging.getLogger(__name__)


class MLConfig(BaseModel):
    """Machine learning service configuration settings."""
    
    # MentaLLaMA configuration
    mentalllama: Dict[str, Any] = Field(
        default_factory=lambda: {
            "service_type": os.getenv("ML_MENTALLLAMA_SERVICE_TYPE", "mock"),
            "api_key": os.getenv("ML_MENTALLLAMA_API_KEY", ""),
            "endpoint": os.getenv("ML_MENTALLLAMA_ENDPOINT", ""),
            "model_id": os.getenv("ML_MENTALLLAMA_MODEL_ID", ""),
            "mock_delay_ms": int(os.getenv("ML_MENTALLLAMA_MOCK_DELAY_MS", "200")),
        },
        description="MentaLLaMA service configuration"
    )
    
    # PHI detection configuration
    phi_detection: Dict[str, Any] = Field(
        default_factory=lambda: {
            "service_type": os.getenv("ML_PHI_DETECTION_SERVICE_TYPE", "mock"),
            "aws_region": os.getenv("ML_PHI_DETECTION_AWS_REGION", "us-east-1"),
            "aws_access_key_id": os.getenv("ML_PHI_DETECTION_AWS_ACCESS_KEY_ID", ""),
            "aws_secret_access_key": os.getenv("ML_PHI_DETECTION_AWS_SECRET_ACCESS_KEY", ""),
            "mock_delay_ms": int(os.getenv("ML_PHI_DETECTION_MOCK_DELAY_MS", "100")),
        },
        description="PHI detection service configuration"
    )
    
    # Digital twin configuration
    digital_twin: Dict[str, Any] = Field(
        default_factory=lambda: {
            "service_type": os.getenv("ML_DIGITAL_TWIN_SERVICE_TYPE", "mock"),
            "api_key": os.getenv("ML_DIGITAL_TWIN_API_KEY", ""),
            "endpoint": os.getenv("ML_DIGITAL_TWIN_ENDPOINT", ""),
            "model_id": os.getenv("ML_DIGITAL_TWIN_MODEL_ID", ""),
            "mock_delay_ms": int(os.getenv("ML_DIGITAL_TWIN_MOCK_DELAY_MS", "300")),
        },
        description="Digital twin service configuration"
    )


class PATConfig(BaseModel):
    """Physical Activity Tracker (PAT) service configuration settings."""
    
    # Service type (mock or bedrock)
    service_type: str = Field(
        default=os.getenv("PAT_SERVICE_TYPE", "mock"),
        description="PAT service type (mock or bedrock)"
    )
    
    # AWS configuration for Bedrock
    aws_region: str = Field(
        default=os.getenv("PAT_AWS_REGION", "us-east-1"),
        description="AWS region for PAT service"
    )
    
    aws_access_key_id: Optional[str] = Field(
        default=os.getenv("PAT_AWS_ACCESS_KEY_ID", ""),
        description="AWS access key ID for PAT service"
    )
    
    aws_secret_access_key: Optional[str] = Field(
        default=os.getenv("PAT_AWS_SECRET_ACCESS_KEY", ""),
        description="AWS secret access key for PAT service"
    )
    
    # S3 configuration
    pat_s3_bucket: str = Field(
        default=os.getenv("PAT_S3_BUCKET", "novamind-pat-data"),
        description="S3 bucket for PAT data storage"
    )
    
    # DynamoDB configuration
    pat_dynamodb_table: str = Field(
        default=os.getenv("PAT_DYNAMODB_TABLE", "novamind-pat-analyses"),
        description="DynamoDB table for PAT analyses"
    )
    
    # Bedrock model configuration
    pat_bedrock_model_id: str = Field(
        default=os.getenv("PAT_BEDROCK_MODEL_ID", "amazon.titan-embed-text-v1"),
        description="Bedrock model ID for PAT service"
    )
    
    # KMS key ID for encryption
    pat_kms_key_id: Optional[str] = Field(
        default=os.getenv("PAT_KMS_KEY_ID", ""),
        description="KMS key ID for PAT data encryption"
    )
    
    # Mock service configuration
    mock_delay_ms: int = Field(
        default=int(os.getenv("PAT_MOCK_DELAY_MS", "200")),
        description="Mock delay in milliseconds"
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary.
        
        Returns:
            Dictionary of configuration values
        """
        return {
            "service_type": self.service_type,
            "aws_region": self.aws_region,
            "aws_access_key_id": self.aws_access_key_id,
            "aws_secret_access_key": self.aws_secret_access_key,
            "pat_s3_bucket": self.pat_s3_bucket,
            "pat_dynamodb_table": self.pat_dynamodb_table,
            "pat_bedrock_model_id": self.pat_bedrock_model_id,
            "pat_kms_key_id": self.pat_kms_key_id,
            "mock_delay_ms": self.mock_delay_ms,
        }


class SecurityConfig(BaseModel):
    """Security-related configuration settings."""
    
    # JWT settings
    secret_key: str = Field(
        default=os.getenv("SECURITY_SECRET_KEY", "secret-key"),
        description="Secret key for JWT token signing"
    )
    
    algorithm: str = Field(
        default=os.getenv("SECURITY_ALGORITHM", "HS256"),
        description="Algorithm for JWT token signing"
    )
    
    access_token_expire_minutes: int = Field(
        default=int(os.getenv("SECURITY_ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
        description="Access token expiration time in minutes"
    )
    
    # CORS settings
    cors_origins: List[str] = Field(
        default_factory=lambda: os.getenv("SECURITY_CORS_ORIGINS", "*").split(","),
        description="CORS allowed origins (comma-separated)"
    )
    
    # AWS Cognito settings
    use_cognito: bool = Field(
        default=os.getenv("SECURITY_USE_COGNITO", "False").lower() == "true",
        description="Whether to use AWS Cognito for authentication"
    )
    
    cognito_region: Optional[str] = Field(
        default=os.getenv("SECURITY_COGNITO_REGION", ""),
        description="AWS Cognito region"
    )
    
    cognito_user_pool_id: Optional[str] = Field(
        default=os.getenv("SECURITY_COGNITO_USER_POOL_ID", ""),
        description="AWS Cognito user pool ID"
    )
    
    cognito_client_id: Optional[str] = Field(
        default=os.getenv("SECURITY_COGNITO_CLIENT_ID", ""),
        description="AWS Cognito client ID"
    )


class DatabaseConfig(BaseModel):
    """Database configuration settings."""
    
    # PostgreSQL settings
    url: PostgresDsn = Field(
        default=PostgresDsn.build(
            scheme="postgresql",
            username=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "postgres"),
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "5432")),
            path=f"/{os.getenv('DB_NAME', 'novamind')}"
        ),
        description="PostgreSQL connection URL"
    )
    
    pool_size: int = Field(
        default=int(os.getenv("DB_POOL_SIZE", "5")),
        description="Database connection pool size"
    )
    
    max_overflow: int = Field(
        default=int(os.getenv("DB_MAX_OVERFLOW", "10")),
        description="Maximum number of connections beyond pool size"
    )
    
    pool_timeout: int = Field(
        default=int(os.getenv("DB_POOL_TIMEOUT", "30")),
        description="Timeout for acquiring connection from pool"
    )
    
    pool_recycle: int = Field(
        default=int(os.getenv("DB_POOL_RECYCLE", "3600")),
        description="Connection recycling time in seconds"
    )


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )
    
    # Basic application settings
    app_name: str = "NOVAMIND"
    api_v1_prefix: str = "/api/v1"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Service configurations
    ml_config: MLConfig = Field(default_factory=MLConfig)
    pat_config: PATConfig = Field(default_factory=PATConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    
    # Backend settings
    backend_cors_origins: List[AnyHttpUrl] = []
    
    @validator("backend_cors_origins", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        """Process and validate CORS origins from settings.
        
        Args:
            v: CORS origins as string or list
            
        Returns:
            Processed CORS origins
            
        Raises:
            ValueError: If invalid CORS origin values provided
        """
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        if isinstance(v, list):
            return v
        raise ValueError("CORS origins must be a list or a comma-separated string")


# Create global settings instance
settings = Settings()
