"""
XGBoost ML service for clinical predictions.

This module provides a production-grade ML service for making clinical predictions using XGBoost models.
It supports risk assessment, treatment response prediction, and outcome forecasting.

The module follows a layered architecture:
- Interface layer: Abstract interfaces and domain models
- Implementation layer: Concrete implementations (AWS, Mock)
- Factory layer: Creation of appropriate implementations

All implementations adhere to HIPAA-compliant data handling practices.
"""

# Re-export domain types and enums from interface
from app.core.services.ml.xgboost.interface import (
    # Core interfaces
    XGBoostServiceInterface,
    BasePrediction,
    
    # Domain models
    RiskPrediction,
    TreatmentPrediction,
    OutcomePrediction,
    PredictionModel,
    FeatureImportance,
    
    # Domain types (type aliases)
    PatientId,
    ModelId,
    PredictionId,
    FeatureId,
    
    # Enums
    PredictionType,
    RiskLevel,
    ResponseLevel,
    ValidationStatus,
    TreatmentCategory,
    FeatureCategory,
    ModelSource,
    ModelStatus
)

# Re-export exceptions
from app.core.services.ml.xgboost.exceptions import (
    XGBoostServiceError,
    ModelNotFoundError,
    PredictionNotFoundError,
    PatientNotFoundError,
    InvalidFeatureError,
    PredictionError,
    DigitalTwinUpdateError,
    ServiceConfigurationError,
    ServiceConnectionError,
    ServiceOperationError
)

# Re-export implementations
from app.core.services.ml.xgboost.aws import AWSXGBoostService
from app.core.services.ml.xgboost.mock import MockXGBoostService

# Re-export factory
from app.core.services.ml.xgboost.factory import (
    XGBoostServiceFactory,
    get_xgboost_service
)

__all__ = [
    # Core interfaces
    'XGBoostServiceInterface',
    'BasePrediction',
    
    # Domain models
    'RiskPrediction',
    'TreatmentPrediction',
    'OutcomePrediction',
    'PredictionModel',
    'FeatureImportance',
    
    # Domain types
    'PatientId',
    'ModelId',
    'PredictionId',
    'FeatureId',
    
    # Enums
    'PredictionType',
    'RiskLevel',
    'ResponseLevel',
    'ValidationStatus',
    'TreatmentCategory',
    'FeatureCategory',
    'ModelSource',
    'ModelStatus',
    
    # Exceptions
    'XGBoostServiceError',
    'ModelNotFoundError',
    'PredictionNotFoundError',
    'PatientNotFoundError',
    'InvalidFeatureError',
    'PredictionError',
    'DigitalTwinUpdateError',
    'ServiceConfigurationError',
    'ServiceConnectionError',
    'ServiceOperationError',
    
    # Implementations
    'AWSXGBoostService',
    'MockXGBoostService',
    
    # Factory
    'XGBoostServiceFactory',
    'get_xgboost_service'
]