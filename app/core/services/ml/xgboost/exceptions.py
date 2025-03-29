"""
Custom exceptions for the XGBoost service.

This module defines a hierarchy of domain-specific exceptions for the XGBoost
service, providing clear error semantics for different failure modes.
"""

from typing import Optional, Dict, List, Any


class XGBoostBaseError(Exception):
    """
    Base exception for XGBoost service errors.
    
    All XGBoost service exceptions inherit from this class to provide
    consistent error handling and serialization.
    """
    
    def __init__(
        self,
        message: str,
        **kwargs: Any
    ) -> None:
        """
        Initialize the base exception.
        
        Args:
            message: Human-readable error message
            **kwargs: Additional context for the error
        """
        self.message = message
        self.context = kwargs
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the exception to a dictionary for serialization.
        
        Returns:
            Dictionary representation of the exception
        """
        result = {
            "error_type": self.__class__.__name__,
            "message": self.message
        }
        
        # Add context if available
        if self.context:
            result["context"] = self.context
            
        return result


class ConfigurationError(XGBoostBaseError):
    """
    Raised when service configuration is invalid or incomplete.
    
    This error occurs during service initialization when required configuration
    parameters are missing or have invalid values.
    """
    
    def __init__(
        self,
        message: str,
        missing_params: Optional[List[str]] = None,
        invalid_params: Optional[Dict[str, str]] = None
    ) -> None:
        """
        Initialize a configuration error.
        
        Args:
            message: Human-readable error message
            missing_params: List of missing configuration parameters
            invalid_params: Dict of parameter names to error descriptions
        """
        context = {}
        if missing_params:
            context["missing_params"] = missing_params
        if invalid_params:
            context["invalid_params"] = invalid_params
            
        super().__init__(message, **context)


class ValidationError(XGBoostBaseError):
    """
    Raised when input data fails validation.
    
    This error occurs when the service is called with invalid input data,
    such as missing required fields or values that don't meet constraints.
    """
    
    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        value: Optional[Any] = None,
        reason: Optional[str] = None
    ) -> None:
        """
        Initialize a validation error.
        
        Args:
            message: Human-readable error message
            field: Name of the field that failed validation
            value: Invalid value that was provided
            reason: Detailed reason for validation failure
        """
        context = {}
        if field:
            context["field"] = field
        if value is not None:
            # Convert value to string to avoid serialization issues
            context["value"] = str(value)
        if reason:
            context["reason"] = reason
            
        super().__init__(message, **context)


class DataPrivacyError(XGBoostBaseError):
    """
    Raised when potential PHI is detected in input data.
    
    This error occurs when the service detects patterns that might indicate
    Personal Health Information (PHI) in the input data, protecting against
    accidental PHI processing.
    """
    
    def __init__(
        self,
        message: str,
        field: Optional[str] = None,
        pattern_type: Optional[str] = None
    ) -> None:
        """
        Initialize a data privacy error.
        
        Args:
            message: Human-readable error message
            field: Name of the field where PHI was detected
            pattern_type: Type of PHI pattern that was detected
        """
        context = {}
        if field:
            context["field"] = field
        if pattern_type:
            context["pattern_type"] = pattern_type
            
        super().__init__(message, **context)


class ResourceNotFoundError(XGBoostBaseError):
    """
    Raised when a requested resource is not found.
    
    This error occurs when the service cannot find a requested resource,
    such as a prediction record or digital twin profile.
    """
    
    def __init__(
        self,
        message: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None
    ) -> None:
        """
        Initialize a resource not found error.
        
        Args:
            message: Human-readable error message
            resource_type: Type of resource that was not found
            resource_id: Identifier of the resource that was not found
        """
        context = {}
        if resource_type:
            context["resource_type"] = resource_type
        if resource_id:
            context["resource_id"] = resource_id
            
        super().__init__(message, **context)


class ModelNotFoundError(XGBoostBaseError):
    """
    Raised when a requested model is not found.
    
    This error occurs when the service cannot find a requested model,
    either because it doesn't exist or because it's not configured.
    """
    
    def __init__(
        self,
        message: str,
        model_type: Optional[str] = None
    ) -> None:
        """
        Initialize a model not found error.
        
        Args:
            message: Human-readable error message
            model_type: Type of model that was not found
        """
        context = {}
        if model_type:
            context["model_type"] = model_type
            
        super().__init__(message, **context)


class PredictionError(XGBoostBaseError):
    """
    Raised when a prediction fails to process.
    
    This error occurs when the model fails to generate a prediction,
    either due to internal errors or issues with the input data.
    """
    
    def __init__(
        self,
        message: str,
        model_type: Optional[str] = None,
        cause: Optional[str] = None
    ) -> None:
        """
        Initialize a prediction error.
        
        Args:
            message: Human-readable error message
            model_type: Type of model that failed
            cause: Underlying cause of the failure
        """
        context = {}
        if model_type:
            context["model_type"] = model_type
        if cause:
            context["cause"] = cause
            
        super().__init__(message, **context)


class FeatureImportanceError(XGBoostBaseError):
    """
    Raised when feature importance calculation fails.
    
    This error occurs when the service fails to calculate feature
    importance for a prediction, usually due to missing data.
    """
    
    def __init__(
        self,
        message: str,
        prediction_id: Optional[str] = None,
        model_type: Optional[str] = None,
        cause: Optional[str] = None
    ) -> None:
        """
        Initialize a feature importance error.
        
        Args:
            message: Human-readable error message
            prediction_id: ID of the prediction
            model_type: Type of model
            cause: Underlying cause of the failure
        """
        context = {}
        if prediction_id:
            context["prediction_id"] = prediction_id
        if model_type:
            context["model_type"] = model_type
        if cause:
            context["cause"] = cause
            
        super().__init__(message, **context)


class DigitalTwinIntegrationError(XGBoostBaseError):
    """
    Raised when digital twin integration fails.
    
    This error occurs when the service fails to integrate a prediction
    with a digital twin profile.
    """
    
    def __init__(
        self,
        message: str,
        patient_id: Optional[str] = None,
        profile_id: Optional[str] = None,
        prediction_id: Optional[str] = None,
        cause: Optional[str] = None
    ) -> None:
        """
        Initialize a digital twin integration error.
        
        Args:
            message: Human-readable error message
            patient_id: ID of the patient
            profile_id: ID of the digital twin profile
            prediction_id: ID of the prediction
            cause: Underlying cause of the failure
        """
        context = {}
        if patient_id:
            context["patient_id"] = patient_id
        if profile_id:
            context["profile_id"] = profile_id
        if prediction_id:
            context["prediction_id"] = prediction_id
        if cause:
            context["cause"] = cause
            
        super().__init__(message, **context)


class ServiceConnectionError(XGBoostBaseError):
    """
    Raised when an external service connection fails.
    
    This error occurs when the service fails to connect to an external
    service, such as AWS SageMaker or DynamoDB.
    """
    
    def __init__(
        self,
        message: str,
        service_name: Optional[str] = None,
        cause: Optional[str] = None
    ) -> None:
        """
        Initialize a service connection error.
        
        Args:
            message: Human-readable error message
            service_name: Name of the service that failed
            cause: Underlying cause of the failure
        """
        context = {}
        if service_name:
            context["service_name"] = service_name
        if cause:
            context["cause"] = cause
            
        super().__init__(message, **context)


class PermissionError(XGBoostBaseError):
    """
    Raised when a permission check fails.
    
    This error occurs when the service doesn't have permission to
    access a requested resource.
    """
    
    def __init__(
        self,
        message: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None
    ) -> None:
        """
        Initialize a permission error.
        
        Args:
            message: Human-readable error message
            resource_type: Type of resource
            resource_id: ID of the resource
        """
        context = {}
        if resource_type:
            context["resource_type"] = resource_type
        if resource_id:
            context["resource_id"] = resource_id
            
        super().__init__(message, **context)


class AuthenticationError(XGBoostBaseError):
    """
    Raised when authentication fails.
    
    This error occurs when the service fails to authenticate with
    an external service.
    """
    
    def __init__(
        self,
        message: str,
        service_name: Optional[str] = None,
        cause: Optional[str] = None
    ) -> None:
        """
        Initialize an authentication error.
        
        Args:
            message: Human-readable error message
            service_name: Name of the service that failed authentication
            cause: Underlying cause of the failure
        """
        context = {}
        if service_name:
            context["service_name"] = service_name
        if cause:
            context["cause"] = cause
            
        super().__init__(message, **context)


class RateLimitError(XGBoostBaseError):
    """
    Raised when a rate limit is exceeded.
    
    This error occurs when the service exceeds a rate limit for an
    external service, such as AWS SageMaker or AWS Lambda.
    """
    
    def __init__(
        self,
        message: str,
        service_name: Optional[str] = None,
        retry_after: Optional[int] = None
    ) -> None:
        """
        Initialize a rate limit error.
        
        Args:
            message: Human-readable error message
            service_name: Name of the service that imposed the rate limit
            retry_after: Seconds to wait before retrying
        """
        context = {}
        if service_name:
            context["service_name"] = service_name
        if retry_after is not None:
            context["retry_after"] = retry_after
            
        super().__init__(message, **context)