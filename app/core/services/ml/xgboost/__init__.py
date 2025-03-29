"""
XGBoost service module for the HIPAA-compliant Concierge Psychiatry Platform.

This module provides machine learning capabilities for risk assessment,
treatment response prediction, and outcome forecasting using XGBoost models.
"""

import os
import logging
from typing import Dict, Any, Optional

# Export interface components
from app.core.services.ml.xgboost.interface import (
    XGBoostInterface,
    ModelType,
    EventType,
    Observer,
    PrivacyLevel
)

# Export exceptions
from app.core.services.ml.xgboost.exceptions import (
    XGBoostServiceError,
    ValidationError,
    DataPrivacyError,
    ResourceNotFoundError,
    ModelNotFoundError,
    PredictionError,
    ServiceConnectionError,
    ConfigurationError
)

# Import implementations
from app.core.services.ml.xgboost.factory import create_xgboost_service
from app.core.services.ml.xgboost.aws import AWSXGBoostService
from app.core.services.ml.xgboost.mock import MockXGBoostService

# Configure module logger
logger = logging.getLogger(__name__)


def create_xgboost_service_from_env() -> XGBoostInterface:
    """
    Create an XGBoost service instance from environment variables.
    
    Returns:
        Initialized XGBoost service instance
    
    Raises:
        ConfigurationError: If required environment variables are missing or invalid
    """
    try:
        # Determine which implementation to use
        implementation = os.environ.get("XGBOOST_IMPLEMENTATION", "mock").lower()
        
        # Common configuration from environment variables
        config = {
            "log_level": os.environ.get("XGBOOST_LOG_LEVEL", "INFO"),
            "privacy_level": _parse_privacy_level(
                os.environ.get("XGBOOST_PRIVACY_LEVEL", "STANDARD")
            )
        }
        
        # Add implementation-specific configuration
        if implementation == "aws":
            config.update({
                "region_name": os.environ.get("AWS_REGION", "us-east-1"),
                "predictions_table": os.environ.get("XGBOOST_PREDICTIONS_TABLE"),
                "digital_twin_function": os.environ.get("XGBOOST_DIGITAL_TWIN_FUNCTION"),
                "model_endpoints": _parse_model_endpoints()
            })
        elif implementation == "mock":
            config.update({
                "mock_delay_ms": int(os.environ.get("XGBOOST_MOCK_DELAY_MS", "200")),
                "risk_level_distribution": _parse_risk_distribution(
                    os.environ.get("XGBOOST_MOCK_RISK_DISTRIBUTION", "5,20,50,20,5")
                )
            })
        
        # Create and initialize the service
        service = create_xgboost_service(implementation)
        service.initialize(config)
        
        return service
    except Exception as e:
        # Log error details but don't expose them to the caller
        logger.error(f"Failed to create XGBoost service: {str(e)}")
        if isinstance(e, ConfigurationError):
            raise
        else:
            raise ConfigurationError(
                "Failed to create XGBoost service from environment variables",
                details=str(e)
            )


def _parse_privacy_level(level_str: str) -> PrivacyLevel:
    """
    Parse privacy level from string.
    
    Args:
        level_str: Privacy level string
        
    Returns:
        PrivacyLevel enum value
        
    Raises:
        ConfigurationError: If the privacy level is invalid
    """
    try:
        return PrivacyLevel[level_str.upper()]
    except (KeyError, AttributeError):
        raise ConfigurationError(
            f"Invalid privacy level: {level_str}",
            field="privacy_level",
            value=level_str
        )


def _parse_model_endpoints() -> Dict[str, str]:
    """
    Parse model endpoints from environment variables.
    
    For AWS implementation, model endpoints are specified as 
    XGBOOST_MODEL_ENDPOINT_{model_type}={endpoint_name}
    
    Returns:
        Dictionary mapping model types to endpoint names
        
    Raises:
        ConfigurationError: If no model endpoints are found
    """
    model_endpoints = {}
    
    # Get model endpoints from environment variables
    for key, value in os.environ.items():
        if key.startswith("XGBOOST_MODEL_ENDPOINT_"):
            model_type = key[len("XGBOOST_MODEL_ENDPOINT_"):].lower().replace("_", "-")
            model_endpoints[model_type] = value
    
    # Add default endpoint if present
    if "XGBOOST_DEFAULT_ENDPOINT" in os.environ:
        model_endpoints["default"] = os.environ["XGBOOST_DEFAULT_ENDPOINT"]
    
    # Ensure at least one endpoint is defined for AWS implementation
    if not model_endpoints:
        logger.warning("No model endpoints found in environment variables")
    
    return model_endpoints


def _parse_risk_distribution(distribution_str: str) -> Dict[str, float]:
    """
    Parse risk level distribution for mock implementation.
    
    Args:
        distribution_str: Comma-separated risk distribution (very_low,low,moderate,high,very_high)
        
    Returns:
        Dictionary mapping risk levels to probabilities
        
    Raises:
        ConfigurationError: If the distribution is invalid
    """
    try:
        # Split and convert to float
        parts = [float(x.strip()) for x in distribution_str.split(",")]
        
        # Ensure we have exactly 5 values
        if len(parts) != 5:
            raise ConfigurationError(
                f"Risk distribution must have exactly 5 values, got {len(parts)}",
                field="risk_distribution",
                value=distribution_str
            )
        
        # Normalize to ensure sum is 100
        total = sum(parts)
        if total == 0:
            raise ConfigurationError(
                "Risk distribution values must sum to a non-zero value",
                field="risk_distribution",
                value=distribution_str
            )
        
        normalized = [x / total * 100 for x in parts]
        
        # Create the distribution dictionary
        return {
            "very_low": normalized[0],
            "low": normalized[1],
            "moderate": normalized[2], 
            "high": normalized[3],
            "very_high": normalized[4]
        }
    except ValueError as e:
        raise ConfigurationError(
            f"Invalid risk distribution format: {distribution_str}",
            field="risk_distribution",
            value=distribution_str,
            details=str(e)
        )


# Export public symbols
__all__ = [
    "XGBoostInterface",
    "ModelType",
    "EventType",
    "Observer",
    "PrivacyLevel",
    "XGBoostServiceError",
    "ValidationError",
    "DataPrivacyError",
    "ResourceNotFoundError",
    "ModelNotFoundError",
    "PredictionError",
    "ServiceConnectionError",
    "ConfigurationError",
    "create_xgboost_service",
    "create_xgboost_service_from_env",
    "AWSXGBoostService",
    "MockXGBoostService"
]