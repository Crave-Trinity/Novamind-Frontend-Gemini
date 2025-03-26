"""
NOVAMIND Configuration Module
============================
Centralized configuration management for the NOVAMIND psychiatric platform.
Follows HIPAA compliance standards with secure handling of sensitive settings.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class SecuritySettings:
    """Security configuration for the NOVAMIND platform."""
    
    # JWT Authentication settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Password hashing settings
    PASSWORD_HASH_ALGORITHM: str = os.getenv("PASSWORD_HASH_ALGORITHM", "bcrypt")
    PASSWORD_SALT_ROUNDS: int = int(os.getenv("PASSWORD_SALT_ROUNDS", "12"))
    
    # HIPAA Compliance settings
    ENABLE_PHI_REDACTION: bool = os.getenv("ENABLE_PHI_REDACTION", "True").lower() == "true"
    AUDIT_LOG_RETENTION_DAYS: int = int(os.getenv("AUDIT_LOG_RETENTION_DAYS", "2555"))  # 7 years default
    
    # TLS/SSL Configuration
    SSL_CERT_PATH: Optional[str] = os.getenv("SSL_CERT_PATH")
    SSL_KEY_PATH: Optional[str] = os.getenv("SSL_KEY_PATH")
    ENFORCE_HTTPS: bool = os.getenv("ENFORCE_HTTPS", "True").lower() == "true"


class DatabaseSettings:
    """Database configuration for the NOVAMIND platform."""
    
    DB_ENGINE: str = os.getenv("DB_ENGINE", "postgresql")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "novamind")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "5"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT: int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    
    # Connection string
    @property
    def CONNECTION_STRING(self) -> str:
        """Generate database connection string."""
        return f"{self.DB_ENGINE}://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


class APISettings:
    """API configuration for the NOVAMIND platform."""
    
    API_V1_PREFIX: str = "/api/v1"
    API_TITLE: str = "NOVAMIND API"
    API_DESCRIPTION: str = "HIPAA-compliant API for the NOVAMIND psychiatric platform"
    API_VERSION: str = "1.0.0"
    OPENAPI_URL: str = "/openapi.json"
    DOCS_URL: str = "/docs"
    REDOC_URL: str = "/redoc"
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))
    
    # CORS settings
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    ALLOWED_METHODS: list = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    ALLOWED_HEADERS: list = ["*"]


class LoggingSettings:
    """Logging configuration for the NOVAMIND platform."""
    
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")
    LOG_TO_CONSOLE: bool = os.getenv("LOG_TO_CONSOLE", "True").lower() == "true"
    LOG_TO_FILE: bool = os.getenv("LOG_TO_FILE", "True").lower() == "true"
    
    # HIPAA Audit logging
    AUDIT_LOG_FILE: str = os.getenv("AUDIT_LOG_FILE", "audit.log")
    ENABLE_AUDIT_LOGGING: bool = os.getenv("ENABLE_AUDIT_LOGGING", "True").lower() == "true"


class MLSettings:
    """Machine Learning configuration for the NOVAMIND platform."""
    
    ML_MODEL_PATH: str = os.getenv("ML_MODEL_PATH", "models")
    SYMPTOM_FORECASTING_MODEL: str = os.getenv("SYMPTOM_FORECASTING_MODEL", "symptom_forecasting.pkl")
    BIOMETRIC_CORRELATION_MODEL: str = os.getenv("BIOMETRIC_CORRELATION_MODEL", "biometric_correlation.pkl")
    PHARMACOGENOMICS_MODEL: str = os.getenv("PHARMACOGENOMICS_MODEL", "pharmacogenomics.pkl")
    
    # Digital Twin settings
    DIGITAL_TWIN_UPDATE_INTERVAL_HOURS: int = int(os.getenv("DIGITAL_TWIN_UPDATE_INTERVAL_HOURS", "24"))
    ENABLE_REAL_TIME_PREDICTIONS: bool = os.getenv("ENABLE_REAL_TIME_PREDICTIONS", "False").lower() == "true"


class Settings:
    """Main configuration class that combines all settings."""
    
    # Application settings
    APP_NAME: str = "NOVAMIND"
    APP_DESCRIPTION: str = "Concierge Psychiatric Platform with Digital Twin Technology"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Component settings
    security = SecuritySettings()
    database = DatabaseSettings()
    api = APISettings()
    logging = LoggingSettings()
    ml = MLSettings()
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    TEMPLATES_DIR: Path = BASE_DIR / "app" / "presentation" / "web" / "templates"
    STATIC_DIR: Path = BASE_DIR / "app" / "presentation" / "web" / "static"
    
    def is_production(self) -> bool:
        """Check if the application is running in production mode."""
        return self.ENVIRONMENT.lower() == "production"
    
    def get_all_settings(self) -> Dict[str, Any]:
        """Get all settings as a dictionary (excluding sensitive information)."""
        settings_dict = {
            "APP_NAME": self.APP_NAME,
            "APP_VERSION": self.APP_VERSION,
            "ENVIRONMENT": self.ENVIRONMENT,
            "DEBUG": self.DEBUG,
            "API": {
                "VERSION": self.api.API_VERSION,
                "PREFIX": self.api.API_V1_PREFIX,
            },
            "SECURITY": {
                "JWT_ALGORITHM": self.security.JWT_ALGORITHM,
                "JWT_ACCESS_TOKEN_EXPIRE_MINUTES": self.security.JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
                "ENABLE_PHI_REDACTION": self.security.ENABLE_PHI_REDACTION,
                "ENFORCE_HTTPS": self.security.ENFORCE_HTTPS,
            },
            "DATABASE": {
                "ENGINE": self.database.DB_ENGINE,
                "HOST": self.database.DB_HOST,
                "PORT": self.database.DB_PORT,
                "NAME": self.database.DB_NAME,
            },
            "LOGGING": {
                "LEVEL": self.logging.LOG_LEVEL,
                "ENABLE_AUDIT_LOGGING": self.logging.ENABLE_AUDIT_LOGGING,
            },
            "ML": {
                "DIGITAL_TWIN_UPDATE_INTERVAL_HOURS": self.ml.DIGITAL_TWIN_UPDATE_INTERVAL_HOURS,
                "ENABLE_REAL_TIME_PREDICTIONS": self.ml.ENABLE_REAL_TIME_PREDICTIONS,
            }
        }
        return settings_dict


# Create a global settings instance
settings = Settings()
