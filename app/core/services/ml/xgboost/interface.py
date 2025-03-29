"""
Abstract interface and type definitions for the XGBoost ML service.

This module defines the abstract interface that all XGBoost service implementations
must adhere to, as well as the domain models and types used throughout the service.
The interface is designed to be technology-agnostic, allowing for different 
implementations (AWS, local, etc.)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Dict, List, Optional, Any, Union


# Type aliases for better semantics
PatientId = str
ModelId = str
PredictionId = str
FeatureId = str


# Enums
class PredictionType(Enum):
    """Types of predictions the service can perform."""
    
    # Risk prediction types
    RISK_RELAPSE = "risk_relapse"
    RISK_SUICIDE = "risk_suicide"
    RISK_HOSPITALIZATION = "risk_hospitalization"
    RISK_SELF_HARM = "risk_self_harm"
    RISK_MEDICATION_DISCONTINUATION = "risk_medication_discontinuation"
    
    # Treatment response prediction types
    TREATMENT_RESPONSE_MEDICATION = "treatment_response_medication"
    TREATMENT_RESPONSE_THERAPY = "treatment_response_therapy"
    TREATMENT_RESPONSE_COMBINED = "treatment_response_combined"
    
    # Outcome prediction types
    OUTCOME_CLINICAL = "outcome_clinical"
    OUTCOME_FUNCTIONAL = "outcome_functional"
    OUTCOME_QUALITY_OF_LIFE = "outcome_quality_of_life"


class RiskLevel(Enum):
    """Risk level categorizations."""
    
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    SEVERE = "severe"


class ResponseLevel(Enum):
    """Treatment response level categorizations."""
    
    NONE = "none"
    MINIMAL = "minimal"
    PARTIAL = "partial"
    MODERATE = "moderate"
    GOOD = "good"
    EXCELLENT = "excellent"


class FeatureCategory(Enum):
    """Categories of features used in predictions."""
    
    DEMOGRAPHIC = "demographic"
    CLINICAL = "clinical"
    BEHAVIORAL = "behavioral"
    PHYSIOLOGICAL = "physiological"
    ENVIRONMENTAL = "environmental"
    SOCIAL = "social"
    GENETIC = "genetic"
    MEDICATION = "medication"
    THERAPY = "therapy"
    LIFESTYLE = "lifestyle"
    SURVEY = "survey"
    TREATMENT_HISTORY = "treatment_history"
    DIGITAL_PHENOTYPE = "digital_phenotype"
    BIOMETRIC = "biometric"


class ModelSource(Enum):
    """Sources of prediction models."""
    
    CUSTOM = "custom"
    PRETRAINED = "pretrained"
    TRANSFER_LEARNING = "transfer_learning"
    ENSEMBLE = "ensemble"
    FEDERATED = "federated"
    RESEARCH = "research"
    CLINICAL_TRIAL = "clinical_trial"


class ModelStatus(Enum):
    """Status of prediction models."""
    
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    TRAINING = "training"
    VALIDATING = "validating"
    ERROR = "error"
    ARCHIVED = "archived"


class ValidationStatus(Enum):
    """Validation status of predictions."""
    
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"
    FLAGGED = "flagged"
    REQUIRES_REVIEW = "requires_review"


class TreatmentCategory(Enum):
    """Categories of treatments."""
    
    # Medication categories
    MEDICATION_SSRI = "medication_ssri"
    MEDICATION_SNRI = "medication_snri"
    MEDICATION_TCA = "medication_tca"
    MEDICATION_MAOI = "medication_maoi"
    MEDICATION_ATYPICAL = "medication_atypical"
    MEDICATION_ANTIPSYCHOTIC = "medication_antipsychotic"
    MEDICATION_MOOD_STABILIZER = "medication_mood_stabilizer"
    MEDICATION_STIMULANT = "medication_stimulant"
    MEDICATION_ANXIOLYTIC = "medication_anxiolytic"
    MEDICATION_HYPNOTIC = "medication_hypnotic"
    
    # Therapy categories
    THERAPY_CBT = "therapy_cbt"
    THERAPY_DBT = "therapy_dbt"
    THERAPY_PSYCHODYNAMIC = "therapy_psychodynamic"
    THERAPY_INTERPERSONAL = "therapy_interpersonal"
    THERAPY_ACT = "therapy_act"
    THERAPY_MBCT = "therapy_mbct"
    THERAPY_EMDR = "therapy_emdr"
    THERAPY_GROUP = "therapy_group"
    THERAPY_FAMILY = "therapy_family"
    THERAPY_SUPPORTIVE = "therapy_supportive"
    
    # Other categories
    ELECTROCONVULSIVE = "electroconvulsive"
    TRANSCRANIAL_MAGNETIC = "transcranial_magnetic"
    LIGHT_THERAPY = "light_therapy"
    NEUROFEEDBACK = "neurofeedback"
    LIFESTYLE_MODIFICATION = "lifestyle_modification"
    COMPLEMENTARY_ALTERNATIVE = "complementary_alternative"


# Domain models
@dataclass
class BasePrediction:
    """
    Base class for all prediction types.
    
    This class contains common attributes shared by all prediction types.
    """
    
    prediction_id: PredictionId
    patient_id: PatientId
    model_id: ModelId
    prediction_type: PredictionType
    timestamp: str
    confidence: float
    features_used: List[str]
    features: Dict[str, Any]
    explanation: str
    validation_status: ValidationStatus
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert prediction to dictionary.
        
        Returns:
            Dict: Dictionary representation of prediction
        """
        return {
            "prediction_id": self.prediction_id,
            "patient_id": self.patient_id,
            "model_id": self.model_id,
            "prediction_type": self.prediction_type.value,
            "timestamp": self.timestamp,
            "confidence": self.confidence,
            "features_used": self.features_used,
            "explanation": self.explanation,
            "validation_status": self.validation_status.value
        }


@dataclass
class RiskPrediction(BasePrediction):
    """
    Risk prediction for a patient.
    
    This class represents a risk prediction, such as relapse or hospitalization risk.
    """
    
    risk_level: RiskLevel
    risk_score: float
    time_frame_days: int
    contributing_factors: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert risk prediction to dictionary.
        
        Returns:
            Dict: Dictionary representation of risk prediction
        """
        result = super().to_dict()
        result.update({
            "risk_level": self.risk_level.value,
            "risk_score": self.risk_score,
            "time_frame_days": self.time_frame_days,
            "contributing_factors": self.contributing_factors
        })
        return result


@dataclass
class TreatmentPrediction(BasePrediction):
    """
    Treatment response prediction for a patient.
    
    This class represents a prediction of response to a specific treatment.
    """
    
    treatment_category: TreatmentCategory
    treatment_details: Dict[str, Any]
    response_level: ResponseLevel
    response_score: float
    time_to_response_days: int
    suggested_adjustments: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert treatment prediction to dictionary.
        
        Returns:
            Dict: Dictionary representation of treatment prediction
        """
        result = super().to_dict()
        result.update({
            "treatment_category": self.treatment_category.value,
            "treatment_details": self.treatment_details,
            "response_level": self.response_level.value,
            "response_score": self.response_score,
            "time_to_response_days": self.time_to_response_days,
            "suggested_adjustments": self.suggested_adjustments
        })
        return result


@dataclass
class OutcomePrediction(BasePrediction):
    """
    Outcome prediction for a patient.
    
    This class represents a prediction of clinical or functional outcomes.
    """
    
    outcome_metrics: Dict[str, Any]
    time_frame_days: int
    influencing_factors: List[Dict[str, Any]]
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert outcome prediction to dictionary.
        
        Returns:
            Dict: Dictionary representation of outcome prediction
        """
        result = super().to_dict()
        result.update({
            "outcome_metrics": self.outcome_metrics,
            "time_frame_days": self.time_frame_days,
            "influencing_factors": self.influencing_factors
        })
        return result


@dataclass
class PredictionModel:
    """
    Information about a prediction model.
    
    This class represents metadata about a model used for predictions.
    """
    
    model_id: ModelId
    model_name: str
    prediction_type: PredictionType
    version: str
    created_at: str
    updated_at: str
    source: ModelSource
    status: ModelStatus
    performance_metrics: Dict[str, float]
    feature_requirements: List[str] = field(default_factory=list)
    hyperparameters: Dict[str, Any] = field(default_factory=dict)
    training_dataset_info: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model information to dictionary.
        
        Returns:
            Dict: Dictionary representation of model information
        """
        return {
            "model_id": self.model_id,
            "model_name": self.model_name,
            "prediction_type": self.prediction_type.value,
            "version": self.version,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "source": self.source.value,
            "status": self.status.value,
            "performance_metrics": self.performance_metrics,
            "feature_requirements": self.feature_requirements,
            "hyperparameters": self.hyperparameters,
            "training_dataset_info": self.training_dataset_info
        }


@dataclass
class FeatureImportance:
    """
    Feature importance information.
    
    This class represents importance scores for features in a model.
    """
    
    feature_id: FeatureId
    feature_name: str
    importance: float
    category: FeatureCategory
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert feature importance to dictionary.
        
        Returns:
            Dict: Dictionary representation of feature importance
        """
        return {
            "feature_id": self.feature_id,
            "feature_name": self.feature_name,
            "importance": self.importance,
            "category": self.category.value
        }


class XGBoostServiceInterface(ABC):
    """
    Interface for XGBoost machine learning service.
    
    This abstract base class defines the contract that all XGBoost service
    implementations must adhere to, regardless of the underlying technology.
    """
    
    @abstractmethod
    def predict_risk(
        self,
        patient_id: PatientId,
        risk_type: PredictionType,
        features: Dict[str, Any],
        time_frame_days: int = 90
    ) -> RiskPrediction:
        """
        Generate a risk prediction for a patient.
        
        Args:
            patient_id: ID of the patient
            risk_type: Type of risk to predict
            features: Feature values for prediction
            time_frame_days: Time frame in days for the prediction (default: 90)
            
        Returns:
            RiskPrediction: The risk prediction result
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        pass
    
    @abstractmethod
    def predict_treatment_response(
        self,
        patient_id: PatientId,
        treatment_category: TreatmentCategory,
        treatment_details: Dict[str, Any],
        features: Dict[str, Any]
    ) -> TreatmentPrediction:
        """
        Generate a treatment response prediction for a patient.
        
        Args:
            patient_id: ID of the patient
            treatment_category: Category of treatment
            treatment_details: Detailed treatment information
            features: Feature values for prediction
            
        Returns:
            TreatmentPrediction: The treatment prediction result
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        pass
    
    @abstractmethod
    def predict_outcome(
        self,
        patient_id: PatientId,
        outcome_type: PredictionType,
        features: Dict[str, Any],
        time_frame_days: int = 90
    ) -> OutcomePrediction:
        """
        Generate an outcome prediction for a patient.
        
        Args:
            patient_id: ID of the patient
            outcome_type: Type of outcome to predict
            features: Feature values for prediction
            time_frame_days: Time frame in days for the prediction (default: 90)
            
        Returns:
            OutcomePrediction: The outcome prediction result
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        pass
    
    @abstractmethod
    def compare_treatments(
        self,
        patient_id: PatientId,
        treatment_options: List[Dict[str, Any]],
        features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compare multiple treatment options for a patient.
        
        Args:
            patient_id: ID of the patient
            treatment_options: List of treatment options to compare
            features: Feature values for prediction
            
        Returns:
            Dict: Comparison results with treatment predictions and recommendations
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        pass
    
    @abstractmethod
    def get_prediction(
        self,
        prediction_id: PredictionId
    ) -> Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]:
        """
        Get a prediction by ID.
        
        Args:
            prediction_id: ID of the prediction
            
        Returns:
            BasePrediction: The prediction (risk, treatment, or outcome)
            
        Raises:
            PredictionNotFoundError: If prediction not found
        """
        pass
    
    @abstractmethod
    def get_predictions_for_patient(
        self,
        patient_id: PatientId,
        prediction_type: Optional[PredictionType] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]]:
        """
        Get predictions for a patient.
        
        Args:
            patient_id: ID of the patient
            prediction_type: Optional filter by prediction type
            limit: Maximum number of predictions to return
            offset: Number of predictions to skip
            
        Returns:
            List[BasePrediction]: List of predictions
            
        Raises:
            PatientNotFoundError: If patient not found
        """
        pass
    
    @abstractmethod
    def validate_prediction(
        self,
        prediction_id: PredictionId,
        status: ValidationStatus,
        validator_notes: Optional[str] = None
    ) -> bool:
        """
        Update the validation status of a prediction.
        
        Args:
            prediction_id: ID of the prediction
            status: New validation status
            validator_notes: Optional notes from the validator
            
        Returns:
            bool: True if validation was successful
            
        Raises:
            PredictionNotFoundError: If prediction not found
        """
        pass
    
    @abstractmethod
    def get_model_info(
        self,
        model_id: Optional[ModelId] = None,
        prediction_type: Optional[PredictionType] = None
    ) -> Union[PredictionModel, List[PredictionModel]]:
        """
        Get information about prediction models.
        
        Args:
            model_id: Optional specific model ID
            prediction_type: Optional filter by prediction type
            
        Returns:
            PredictionModel or List[PredictionModel]: Model information
            
        Raises:
            ModelNotFoundError: If model not found
        """
        pass
    
    @abstractmethod
    def get_feature_importance(
        self,
        model_id: ModelId
    ) -> List[FeatureImportance]:
        """
        Get feature importance for a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            List[FeatureImportance]: Feature importance information
            
        Raises:
            ModelNotFoundError: If model not found
        """
        pass
    
    @abstractmethod
    def generate_explanation(
        self,
        prediction_id: PredictionId,
        detail_level: str = "standard"
    ) -> Dict[str, Any]:
        """
        Generate explanation for a prediction.
        
        Args:
            prediction_id: ID of the prediction
            detail_level: Level of detail for the explanation
            
        Returns:
            Dict: Explanation data
            
        Raises:
            PredictionNotFoundError: If prediction not found
        """
        pass
    
    @abstractmethod
    def update_digital_twin(
        self,
        patient_id: PatientId,
        prediction_results: List[Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]]
    ) -> bool:
        """
        Update a patient's digital twin with prediction results.
        
        Args:
            patient_id: ID of the patient
            prediction_results: List of prediction results to incorporate
            
        Returns:
            bool: True if update was successful
            
        Raises:
            DigitalTwinUpdateError: If update fails
            PatientNotFoundError: If patient not found
        """
        pass
    
    @abstractmethod
    def healthcheck(self) -> Dict[str, Any]:
        """
        Check the health of the service and its components.
        
        Returns:
            Dict: Health status information
        """
        pass