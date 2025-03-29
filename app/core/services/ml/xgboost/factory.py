"""
Factory for creating XGBoost service instances.

This module implements the Factory Method pattern for creating instances of
the XGBoost service. It decouples service instantiation from service implementation
and provides configurability through either explicit parameters or environment variables.
"""

import os
import logging
from typing import Dict, Any, Optional, Set, List

from app.core.services.ml.xgboost.interface import (
    XGBoostInterface,
    Observer,
    EventType,
    PrivacyLevel,
    ModelType
)
from app.core.services.ml.xgboost.exceptions import ConfigurationError


# Service type constants
SERVICE_TYPE_MOCK = "mock"
SERVICE_TYPE_AWS = "aws"

# Default configuration values
DEFAULT_LOG_LEVEL = "INFO"
DEFAULT_PRIVACY_LEVEL = PrivacyLevel.ENHANCED
DEFAULT_SERVICE_TYPE = SERVICE_TYPE_MOCK


def get_available_service_types() -> List[str]:
    """
    Get the list of available service types.
    
    Returns:
        List of available service type strings
    """
    return [SERVICE_TYPE_MOCK, SERVICE_TYPE_AWS]


def create_xgboost_service(
    service_type: str,
    config: Optional[Dict[str, Any]] = None
) -> XGBoostInterface:
    """
    Create an XGBoost service of the specified type with configuration.
    
    This factory function creates an instance of the XGBoost service
    based on the provided service type and configuration.
    
    Args:
        service_type: Type of service to create (mock, aws)
        config: Configuration dictionary (optional)
        
    Returns:
        Initialized XGBoost service instance
        
    Raises:
        ConfigurationError: If the service type is invalid or configuration is invalid
    """
    if config is None:
        config = {}
    
    # Set default log level if not provided
    if "log_level" not in config:
        config["log_level"] = DEFAULT_LOG_LEVEL
        
    # Set default privacy level if not provided
    if "privacy_level" not in config:
        config["privacy_level"] = DEFAULT_PRIVACY_LEVEL
    
    # Create the service based on type
    if service_type.lower() == SERVICE_TYPE_MOCK:
        # Import Mock implementation here to avoid circular imports
        from app.core.services.ml.xgboost.mock import MockXGBoostService
        service = MockXGBoostService()
    elif service_type.lower() == SERVICE_TYPE_AWS:
        # Import AWS implementation here to avoid circular imports
        from app.core.services.ml.xgboost.aws import AWSXGBoostService
        service = AWSXGBoostService()
    else:
        valid_types = get_available_service_types()
        raise ConfigurationError(
            f"Invalid service type: {service_type}",
            invalid_params={"service_type": f"Must be one of: {', '.join(valid_types)}"}
        )
    
    # Initialize the service with configuration
    service.initialize(config)
    
    # Set up default observers if not disabled
    if not config.get("disable_default_observers", False):
        register_default_observers(service)
    
    return service


def create_xgboost_service_from_env() -> XGBoostInterface:
    """
    Create an XGBoost service using environment variables for configuration.
    
    This factory function reads configuration from environment variables
    and creates an appropriate XGBoost service instance.
    
    Environment Variables:
        XGBOOST_SERVICE_TYPE: Service type (mock, aws)
        XGBOOST_LOG_LEVEL: Logging level (DEBUG, INFO, WARNING, ERROR)
        XGBOOST_PRIVACY_LEVEL: PHI privacy level (1-3)
        AWS_REGION: AWS region for AWS service
        XGBOOST_MODEL_ENDPOINT_*: Model endpoints for specific model types
        XGBOOST_DISABLE_DEFAULT_LOGGING: Whether to disable default logging
        XGBOOST_PREDICTIONS_TABLE: DynamoDB table for predictions
        XGBOOST_DIGITAL_TWIN_FUNCTION: Lambda function for digital twin integration
    
    Returns:
        Initialized XGBoost service instance
        
    Raises:
        ConfigurationError: If environment variables are invalid
    """
    # Determine service type
    service_type = os.environ.get("XGBOOST_SERVICE_TYPE", DEFAULT_SERVICE_TYPE)
    
    # Build configuration from environment variables
    config = {}
    
    # Basic configuration
    if "XGBOOST_LOG_LEVEL" in os.environ:
        config["log_level"] = os.environ["XGBOOST_LOG_LEVEL"]
        
    if "XGBOOST_PRIVACY_LEVEL" in os.environ:
        try:
            config["privacy_level"] = int(os.environ["XGBOOST_PRIVACY_LEVEL"])
        except ValueError:
            raise ConfigurationError(
                "Invalid privacy level",
                invalid_params={"XGBOOST_PRIVACY_LEVEL": "Must be an integer (1-3)"}
            )
    
    # AWS-specific configuration
    if service_type.lower() == SERVICE_TYPE_AWS:
        if "AWS_REGION" in os.environ:
            config["region_name"] = os.environ["AWS_REGION"]
            
        # Model endpoints
        model_endpoints = {}
        for env_var, value in os.environ.items():
            if env_var.startswith("XGBOOST_MODEL_ENDPOINT_"):
                model_type = env_var[len("XGBOOST_MODEL_ENDPOINT_"):].lower().replace("_", "-")
                model_endpoints[model_type] = value
                
        if model_endpoints:
            config["model_endpoints"] = model_endpoints
            
        # DynamoDB table for predictions
        if "XGBOOST_PREDICTIONS_TABLE" in os.environ:
            config["predictions_table"] = os.environ["XGBOOST_PREDICTIONS_TABLE"]
            
        # Lambda function for digital twin integration
        if "XGBOOST_DIGITAL_TWIN_FUNCTION" in os.environ:
            config["digital_twin_function"] = os.environ["XGBOOST_DIGITAL_TWIN_FUNCTION"]
    
    # Default observer configuration
    if "XGBOOST_DISABLE_DEFAULT_LOGGING" in os.environ:
        value = os.environ["XGBOOST_DISABLE_DEFAULT_LOGGING"].lower()
        config["disable_default_observers"] = value in ["true", "1", "yes"]
    
    # Create the service
    return create_xgboost_service(service_type, config)


def register_default_observers(service: XGBoostInterface) -> None:
    """
    Register default observers to the XGBoost service.
    
    This function sets up standard observers for the XGBoost service,
    such as logging and monitoring.
    
    Args:
        service: XGBoost service instance to attach observers to
    """
    # Create a logging observer for non-sensitive events
    logger = logging.getLogger("xgboost.events")
    
    # Define the LoggingObserver as a local class
    class LoggingObserver:
        """Observer that logs service events."""
        
        def update(self, event_type: str, data: Dict[str, Any]) -> None:
            """Handle service events by logging them."""
            # Get PHI-safe data to log
            safe_data = self._get_safe_data(event_type, data)
            
            # Log the event
            if event_type == EventType.SERVICE_ERROR:
                logger.error(f"XGBoost service error: {safe_data}")
            else:
                logger.info(f"XGBoost event {event_type}: {safe_data}")
        
        def _get_safe_data(self, event_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
            """
            Get a PHI-safe copy of event data for logging.
            
            Args:
                event_type: Type of event
                data: Event data
                
            Returns:
                PHI-safe data dictionary
            """
            # Create a copy to avoid modifying the original
            safe_data = {}
            
            # Include safe fields based on event type
            if event_type == EventType.SERVICE_INITIALIZED:
                # Service initialization is safe to log in full
                safe_data = data.copy()
            elif event_type == EventType.SERVICE_ERROR:
                # Include error information but exclude PHI
                safe_data["error_type"] = data.get("error_type", "unknown")
                # Redact PHI from error message
                if "message" in data:
                    safe_data["message"] = data["message"]
            elif event_type in [
                EventType.RISK_PREDICTION,
                EventType.TREATMENT_RESPONSE,
                EventType.OUTCOME_PREDICTION,
                EventType.FEATURE_IMPORTANCE,
                EventType.DIGITAL_TWIN_INTEGRATION
            ]:
                # Include only identifiers and metadata, no PHI
                if "prediction_id" in data:
                    safe_data["prediction_id"] = data["prediction_id"]
                if "model_type" in data:
                    safe_data["model_type"] = data["model_type"]
                if "timestamp" in data:
                    safe_data["timestamp"] = data["timestamp"]
            elif event_type == EventType.MODEL_PERFORMANCE:
                # Model performance data is safe to log in full
                safe_data = data.copy()
            
            return safe_data
    
    # Register the logging observer for all events
    service.register_observer("*", LoggingObserver())


# Optional: Performance monitoring observer
class PerformanceMonitoringObserver:
    """
    Observer that tracks performance metrics for the XGBoost service.
    
    This observer collects and reports performance metrics for model
    predictions and other service operations.
    """
    
    def __init__(self) -> None:
        """Initialize the performance monitoring observer."""
        self._logger = logging.getLogger("xgboost.performance")
        self._metrics: Dict[str, Dict[str, Any]] = {}
    
    def update(self, event_type: str, data: Dict[str, Any]) -> None:
        """
        Handle service events by collecting performance metrics.
        
        Args:
            event_type: Type of event
            data: Event data
        """
        if event_type == EventType.MODEL_PERFORMANCE:
            model_type = data.get("model_type", "unknown")
            performance = data.get("performance", {})
            
            self._logger.info(f"Model performance for {model_type}: {performance}")
            
            # Store the metrics
            if model_type not in self._metrics:
                self._metrics[model_type] = {}
                
            self._metrics[model_type].update(performance)
    
    def get_metrics(self, model_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Get collected performance metrics.
        
        Args:
            model_type: Optional model type to filter metrics
            
        Returns:
            Dictionary of performance metrics
        """
        if model_type is not None:
            return self._metrics.get(model_type, {}).copy()
        else:
            return self._metrics.copy()