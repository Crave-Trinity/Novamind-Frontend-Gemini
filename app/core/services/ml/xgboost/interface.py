"""
Interface definitions for the XGBoost service.

This module defines the abstract interfaces and common types
for the XGBoost machine learning service.
"""

import abc
import logging
from enum import Enum, auto
from typing import Dict, List, Any, Optional, Set, Union


class ModelType(str, Enum):
    """Types of models supported by the XGBoost service."""
    
    RELAPSE_RISK = "relapse-risk"
    SUICIDE_RISK = "suicide-risk"
    HOSPITALIZATION_RISK = "hospitalization-risk"
    MEDICATION_SSRI_RESPONSE = "medication_ssri-response"
    MEDICATION_SNRI_RESPONSE = "medication_snri-response"
    THERAPY_CBT_RESPONSE = "therapy_cbt-response"
    THERAPY_DBT_RESPONSE = "therapy_dbt-response"
    SYMPTOM_OUTCOME = "symptom-outcome"
    FUNCTIONAL_OUTCOME = "functional-outcome"
    QUALITY_OF_LIFE_OUTCOME = "quality_of_life-outcome"


class EventType(str, Enum):
    """Types of events that can be observed in the XGBoost service."""
    
    INITIALIZATION = "initialization"
    PREDICTION = "prediction"
    INTEGRATION = "integration"
    ERROR = "error"
    CONFIG_CHANGE = "config_change"


class PrivacyLevel(Enum):
    """Privacy levels for PHI detection."""
    
    STANDARD = 1
    ENHANCED = 2
    MAXIMUM = 3


class Observer(abc.ABC):
    """
    Observer interface for the Observer pattern.
    
    This interface defines the contract for observers that want to be notified
    of events in the XGBoost service.
    """
    
    @abc.abstractmethod
    def update(self, event_type: EventType, data: Dict[str, Any]) -> None:
        """
        Receive updates from the observed service.
        
        Args:
            event_type: Type of event that occurred
            data: Data associated with the event
        """
        pass


class XGBoostInterface(abc.ABC):
    """
    Abstract interface for the XGBoost service.
    
    This interface defines the contract for all XGBoost service implementations,
    regardless of the underlying infrastructure (AWS, Azure, GCP, local, etc.).
    """
    
    def __init__(self):
        """Initialize a new XGBoost service instance."""
        self._initialized = False
        self._logger = logging.getLogger(__name__)
    
    def is_initialized(self) -> bool:
        """
        Check if the service is initialized.
        
        Returns:
            True if initialized, False otherwise
        """
        return self._initialized
    
    def _ensure_initialized(self) -> None:
        """
        Ensure the service is initialized before use.
        
        Raises:
            RuntimeError: If the service is not initialized
        """
        if not self._initialized:
            raise RuntimeError("XGBoost service is not initialized")
    
    @abc.abstractmethod
    def initialize(self, config: Dict[str, Any]) -> None:
        """
        Initialize the service with configuration.
        
        Args:
            config: Configuration dictionary
            
        Raises:
            ConfigurationError: If configuration is invalid
        """
        pass
    
    @abc.abstractmethod
    def register_observer(self, event_type: Union[EventType, str], observer: Observer) -> None:
        """
        Register an observer for a specific event type.
        
        Args:
            event_type: Type of event to observe, or "*" for all events
            observer: Observer to register
        """
        pass
    
    @abc.abstractmethod
    def unregister_observer(self, event_type: Union[EventType, str], observer: Observer) -> None:
        """
        Unregister an observer for a specific event type.
        
        Args:
            event_type: Type of event to stop observing
            observer: Observer to unregister
        """
        pass
    
    @abc.abstractmethod
    def predict_risk(
        self,
        patient_id: str,
        risk_type: str,
        clinical_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Predict risk level using a risk model.
        
        Args:
            patient_id: Patient identifier
            risk_type: Type of risk to predict
            clinical_data: Clinical data for prediction
            **kwargs: Additional prediction parameters
            
        Returns:
            Risk prediction result
            
        Raises:
            ValidationError: If parameters are invalid
            DataPrivacyError: If PHI is detected in data
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to prediction service fails
        """
        pass
    
    @abc.abstractmethod
    def predict_treatment_response(
        self,
        patient_id: str,
        treatment_type: str,
        treatment_details: Dict[str, Any],
        clinical_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Predict response to a psychiatric treatment.
        
        Args:
            patient_id: Patient identifier
            treatment_type: Type of treatment (e.g., medication_ssri)
            treatment_details: Treatment details
            clinical_data: Clinical data for prediction
            **kwargs: Additional prediction parameters
            
        Returns:
            Treatment response prediction result
            
        Raises:
            ValidationError: If parameters are invalid
            DataPrivacyError: If PHI is detected in data
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to prediction service fails
        """
        pass
    
    @abc.abstractmethod
    def predict_outcome(
        self,
        patient_id: str,
        outcome_timeframe: Dict[str, int],
        clinical_data: Dict[str, Any],
        treatment_plan: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Predict clinical outcomes based on treatment plan.
        
        Args:
            patient_id: Patient identifier
            outcome_timeframe: Timeframe for outcome prediction
            clinical_data: Clinical data for prediction
            treatment_plan: Treatment plan details
            **kwargs: Additional prediction parameters
            
        Returns:
            Outcome prediction result
            
        Raises:
            ValidationError: If parameters are invalid
            DataPrivacyError: If PHI is detected in data
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to prediction service fails
        """
        pass
    
    @abc.abstractmethod
    def get_feature_importance(
        self,
        patient_id: str,
        model_type: str,
        prediction_id: str
    ) -> Dict[str, Any]:
        """
        Get feature importance for a prediction.
        
        Args:
            patient_id: Patient identifier
            model_type: Type of model
            prediction_id: Prediction identifier
            
        Returns:
            Feature importance data
            
        Raises:
            ResourceNotFoundError: If prediction not found
            ValidationError: If parameters are invalid
            ServiceConnectionError: If connection to storage fails
        """
        pass
    
    @abc.abstractmethod
    def integrate_with_digital_twin(
        self,
        patient_id: str,
        profile_id: str,
        prediction_id: str
    ) -> Dict[str, Any]:
        """
        Integrate prediction with digital twin profile.
        
        Args:
            patient_id: Patient identifier
            profile_id: Digital twin profile identifier
            prediction_id: Prediction identifier
            
        Returns:
            Integration result
            
        Raises:
            ResourceNotFoundError: If prediction not found
            ConfigurationError: If digital twin integration not configured
            ValidationError: If parameters are invalid
            ServiceConnectionError: If connection to digital twin service fails
        """
        pass
    
    @abc.abstractmethod
    def get_model_info(self, model_type: str) -> Dict[str, Any]:
        """
        Get information about a model.
        
        Args:
            model_type: Type of model
            
        Returns:
            Model information
            
        Raises:
            ModelNotFoundError: If model not found
        """
        pass