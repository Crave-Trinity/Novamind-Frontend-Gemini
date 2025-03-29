"""
FastAPI dependency functions for service injection.

This module provides dependencies for injecting services into API routes,
following the dependency injection pattern for clean, testable code.
"""

import logging
import os
from functools import lru_cache
from typing import Dict, Any

from fastapi import Depends, Request
from app.core.services.ml.xgboost import (
    XGBoostServiceInterface, 
    get_service,
    ConfigurationError
)

# Configure logging
logger = logging.getLogger(__name__)

# Default environment values
DEFAULT_XGBOOST_SERVICE_TYPE = "mock"  # Use mock by default for safety


@lru_cache(maxsize=1)
def get_xgboost_config() -> Dict[str, Any]:
    """
    Get configuration for XGBoost service from environment variables.
    
    Uses LRU cache to avoid reloading config on every request.
    
    Returns:
        Dictionary with service configuration
    """
    # Load configuration from environment
    service_type = os.environ.get("XGBOOST_SERVICE_TYPE", DEFAULT_XGBOOST_SERVICE_TYPE)
    
    # AWS-specific configuration (if needed)
    aws_config = {}
    if service_type == "aws":
        aws_config = {
            "aws_region": os.environ.get("AWS_REGION", "us-east-1"),
            # Credentials should be provided via environment or instance profile
            # for production deployments
            "aws_access_key_id": os.environ.get("AWS_ACCESS_KEY_ID"),
            "aws_secret_access_key": os.environ.get("AWS_SECRET_ACCESS_KEY"),
            
            # SageMaker endpoint configurations
            "sagemaker_endpoints": {
                # These can be customized as needed
                # Format: "model_type": "endpoint_name"
            }
        }
    
    # Combine all config
    config = {
        "service_type": service_type,
        **aws_config
    }
    
    return config


def get_xgboost_service() -> XGBoostServiceInterface:
    """
    FastAPI dependency for XGBoost service.
    
    This dependency will be injected into route functions that need
    access to the XGBoost prediction service.
    
    Returns:
        Initialized XGBoostServiceInterface implementation
        
    Raises:
        ConfigurationError: If service initialization fails
    """
    try:
        # Get configuration
        config = get_xgboost_config()
        service_type = config.pop("service_type")
        
        # Create and initialize service
        service = get_service(service_type, config)
        
        return service
        
    except Exception as e:
        logger.error(f"Failed to initialize XGBoost service: {str(e)}")
        raise ConfigurationError(f"Failed to initialize XGBoost service: {str(e)}")


# Additional service dependencies can be added here