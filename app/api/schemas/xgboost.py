"""
Pydantic schemas for the XGBoost ML service API.

This module defines the request and response schemas for the XGBoost ML service API endpoints,
ensuring proper validation and documentation of the API's input and output formats.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union

from pydantic import BaseModel, Field, UUID4, validator


# Enums for API validation
class PredictionTypeEnum(str, Enum):
    """Types of predictions supported by the XGBoost service."""
    RISK_RELAPSE = "risk_relapse"
    RISK_SUICIDE = "risk_suicide"
    RISK_HOSPITALIZATION = "risk_hospitalization"
    TREATMENT_RESPONSE_MEDICATION = "treatment_response_medication"
    TREATMENT_RESPONSE_THERAPY = "treatment_response_therapy"
    TREATMENT_RESPONSE_COMBINED = "treatment_response_combined"
    OUTCOME_CLINICAL = "outcome_clinical"
    OUTCOME_FUNCTIONAL = "outcome_functional"
    OUTCOME_QUALITY_OF_LIFE = "outcome_quality_of_life"


class TreatmentCategoryEnum(str, Enum):
    """Categories of treatments for prediction."""
    MEDICATION_SSRI = "medication_ssri"
    MEDICATION_SNRI = "medication_snri"
    MEDICATION_ATYPICAL = "medication_atypical"
    MEDICATION_MOOD_STABILIZER = "medication_mood_stabilizer"
    MEDICATION_STIMULANT = "medication_stimulant"
    THERAPY_CBT = "therapy_cbt"
    THERAPY_DBT = "therapy_dbt"
    THERAPY_ACT = "therapy_act"
    THERAPY_PSYCHODYNAMIC = "therapy_psychodynamic"
    COMBINED_MEDICATION_THERAPY = "combined_medication_therapy"


class ValidationStatusEnum(str, Enum):
    """Validation statuses for predictions."""
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"
    REQUIRES_REVIEW = "requires_review"


class RiskLevelEnum(str, Enum):
    """Risk level categories."""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    SEVERE = "severe"


class ResponseLevelEnum(str, Enum):
    """Treatment response level categories."""
    NONE = "none"
    MINIMAL = "minimal"
    PARTIAL = "partial"
    MODERATE = "moderate"
    GOOD = "good"
    EXCELLENT = "excellent"


class FeatureCategoryEnum(str, Enum):
    """Categories of predictive features."""
    DEMOGRAPHIC = "demographic"
    CLINICAL = "clinical"
    BEHAVIORAL = "behavioral"
    LIFESTYLE = "lifestyle"
    BIOMETRIC = "biometric"
    GENOMIC = "genomic"
    SOCIAL = "social"
    ENVIRONMENTAL = "environmental"


class ModelSourceEnum(str, Enum):
    """Sources of prediction models."""
    INTERNAL = "internal"
    EXTERNAL = "external"
    FEDERATED = "federated"
    TRANSFER = "transfer"


class ModelStatusEnum(str, Enum):
    """Statuses of prediction models."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    TRAINING = "training"
    VALIDATING = "validating"


# Base Models
class BaseRequest(BaseModel):
    """Base class for all request schemas."""
    class Config:
        """Pydantic config for the base request."""
        extra = "forbid"  # No extra fields allowed


class BaseResponse(BaseModel):
    """Base class for all response schemas."""
    class Config:
        """Pydantic config for the base response."""
        extra = "forbid"  # No extra fields allowed


# Error Schema
class ErrorResponse(BaseResponse):
    """Schema for error responses."""
    detail: str = Field(..., description="Detailed error message")


# Risk Prediction Schemas
class RiskPredictionRequest(BaseRequest):
    """Schema for risk prediction requests."""
    patient_id: str = Field(..., description="ID of the patient")
    risk_type: PredictionTypeEnum = Field(..., 
        description="Type of risk to predict (risk_relapse, risk_suicide, risk_hospitalization)"
    )
    features: Dict[str, Any] = Field(..., 
        description="Feature values for prediction (e.g., age, scores, history)"
    )
    time_frame_days: int = Field(90, 
        description="Time frame in days for the prediction (default: 90)"
    )

    @validator('risk_type')
    def validate_risk_type(cls, v):
        """Validate that the risk type is a risk prediction type."""
        if not v.value.startswith('risk_'):
            raise ValueError(f"Invalid risk type: {v}. Must be one of the risk types.")
        return v


class ContributingFactorSchema(BaseModel):
    """Schema for risk contributing factors."""
    name: str = Field(..., description="Name of the contributing factor")
    impact: float = Field(..., description="Impact value of the factor (0-1)")
    description: Optional[str] = Field(None, description="Description of the factor's impact")


class RiskPredictionResponse(BaseResponse):
    """Schema for risk prediction responses."""
    prediction_id: str = Field(..., description="Unique ID of the prediction")
    patient_id: str = Field(..., description="ID of the patient")
    model_id: str = Field(..., description="ID of the model used for prediction")
    prediction_type: str = Field(..., description="Type of risk predicted")
    timestamp: str = Field(..., description="Timestamp of the prediction")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    risk_level: RiskLevelEnum = Field(..., description="Risk level category")
    risk_score: float = Field(..., description="Numerical risk score (0-1)")
    time_frame_days: int = Field(..., description="Time frame in days for the prediction")
    features_used: List[str] = Field(..., description="Features used in the prediction")
    explanation: str = Field(..., description="Explanation of the prediction")
    validation_status: ValidationStatusEnum = Field(..., description="Validation status")
    contributing_factors: List[ContributingFactorSchema] = Field([], 
        description="Factors contributing to the risk"
    )


# Treatment Prediction Schemas
class TreatmentPredictionRequest(BaseRequest):
    """Schema for treatment response prediction requests."""
    patient_id: str = Field(..., description="ID of the patient")
    treatment_category: TreatmentCategoryEnum = Field(..., 
        description="Category of treatment"
    )
    treatment_details: Dict[str, Any] = Field(..., 
        description="Detailed treatment information (e.g., medication, dosage)"
    )
    features: Dict[str, Any] = Field(..., 
        description="Feature values for prediction (e.g., age, genetics, history)"
    )


class TreatmentAdjustmentSchema(BaseModel):
    """Schema for suggested treatment adjustments."""
    adjustment_type: str = Field(..., 
        description="Type of adjustment (e.g., dosage, frequency, duration)"
    )
    suggestion: str = Field(..., description="Suggested adjustment")
    reasoning: Optional[str] = Field(None, description="Reasoning behind the suggestion")
    confidence: Optional[float] = Field(None, description="Confidence in the suggestion (0-1)")


class TreatmentPredictionResponse(BaseResponse):
    """Schema for treatment response prediction responses."""
    prediction_id: str = Field(..., description="Unique ID of the prediction")
    patient_id: str = Field(..., description="ID of the patient")
    model_id: str = Field(..., description="ID of the model used for prediction")
    prediction_type: str = Field(..., description="Type of treatment prediction")
    timestamp: str = Field(..., description="Timestamp of the prediction")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    treatment_category: str = Field(..., description="Category of treatment")
    treatment_details: Dict[str, Any] = Field(..., description="Detailed treatment information")
    response_level: ResponseLevelEnum = Field(..., description="Response level category")
    response_score: float = Field(..., description="Numerical response score (0-1)")
    time_to_response_days: int = Field(..., description="Estimated time to response in days")
    features_used: List[str] = Field(..., description="Features used in the prediction")
    explanation: str = Field(..., description="Explanation of the prediction")
    validation_status: ValidationStatusEnum = Field(..., description="Validation status")
    suggested_adjustments: List[TreatmentAdjustmentSchema] = Field([], 
        description="Suggested adjustments to the treatment"
    )


# Outcome Prediction Schemas
class OutcomePredictionRequest(BaseRequest):
    """Schema for outcome prediction requests."""
    patient_id: str = Field(..., description="ID of the patient")
    outcome_type: PredictionTypeEnum = Field(..., 
        description="Type of outcome to predict (outcome_clinical, outcome_functional, outcome_quality_of_life)"
    )
    features: Dict[str, Any] = Field(..., 
        description="Feature values for prediction (e.g., age, scores, history, treatments)"
    )
    time_frame_days: int = Field(90, 
        description="Time frame in days for the prediction (default: 90)"
    )

    @validator('outcome_type')
    def validate_outcome_type(cls, v):
        """Validate that the outcome type is an outcome prediction type."""
        if not v.value.startswith('outcome_'):
            raise ValueError(f"Invalid outcome type: {v}. Must be one of the outcome types.")
        return v


class InfluencingFactorSchema(BaseModel):
    """Schema for outcome influencing factors."""
    name: str = Field(..., description="Name of the influencing factor")
    impact: float = Field(..., description="Impact value of the factor (0-1)")
    description: Optional[str] = Field(None, description="Description of the factor's impact")
    category: Optional[str] = Field(None, description="Category of the factor")


class OutcomePredictionResponse(BaseResponse):
    """Schema for outcome prediction responses."""
    prediction_id: str = Field(..., description="Unique ID of the prediction")
    patient_id: str = Field(..., description="ID of the patient")
    model_id: str = Field(..., description="ID of the model used for prediction")
    prediction_type: str = Field(..., description="Type of outcome predicted")
    timestamp: str = Field(..., description="Timestamp of the prediction")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    outcome_metrics: Dict[str, Any] = Field(..., 
        description="Predicted outcome metrics (e.g., PHQ-9 score, GAF score)"
    )
    time_frame_days: int = Field(..., description="Time frame in days for the prediction")
    features_used: List[str] = Field(..., description="Features used in the prediction")
    explanation: str = Field(..., description="Explanation of the prediction")
    validation_status: ValidationStatusEnum = Field(..., description="Validation status")
    influencing_factors: List[InfluencingFactorSchema] = Field([], 
        description="Factors influencing the outcome"
    )


# Validation Schemas
class PredictionValidationRequest(BaseRequest):
    """Schema for prediction validation requests."""
    status: ValidationStatusEnum = Field(..., 
        description="Validation status to set (validated, rejected, requires_review)"
    )
    validator_notes: Optional[str] = Field(None, 
        description="Optional notes from the validator"
    )


class PredictionValidationResponse(BaseResponse):
    """Schema for prediction validation responses."""
    prediction_id: str = Field(..., description="ID of the validated prediction")
    status: ValidationStatusEnum = Field(..., description="New validation status")
    validator: str = Field(..., description="Name of the validator")
    success: bool = Field(..., description="Whether the validation was successful")


# Treatment Comparison Schemas
class TreatmentOptionSchema(BaseModel):
    """Schema for treatment option in comparison requests."""
    category: TreatmentCategoryEnum = Field(..., description="Category of treatment")
    details: Dict[str, Any] = Field(..., 
        description="Detailed treatment information (e.g., medication, dosage)"
    )


class TreatmentComparisonRequest(BaseRequest):
    """Schema for treatment comparison requests."""
    patient_id: str = Field(..., description="ID of the patient")
    treatment_options: List[TreatmentOptionSchema] = Field(..., 
        description="List of treatment options to compare",
        min_items=2
    )
    features: Dict[str, Any] = Field(..., 
        description="Feature values for prediction (e.g., age, genetics, history)"
    )


class TreatmentComparisonResultSchema(BaseModel):
    """Schema for individual treatment comparison results."""
    treatment_category: str = Field(..., description="Category of treatment")
    treatment_details: Dict[str, Any] = Field(..., description="Detailed treatment information")
    response_level: ResponseLevelEnum = Field(..., description="Response level category")
    response_score: float = Field(..., description="Numerical response score (0-1)")
    time_to_response_days: int = Field(..., description="Estimated time to response in days")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    suggested_adjustments: List[TreatmentAdjustmentSchema] = Field([], 
        description="Suggested adjustments to the treatment"
    )
    prediction_id: str = Field(..., description="ID of the underlying prediction")
    relative_efficacy: float = Field(..., 
        description="Relative efficacy compared to the best treatment (percentage)"
    )


class TreatmentRecommendationSchema(BaseModel):
    """Schema for treatment recommendation."""
    recommended_treatment: str = Field(..., description="Recommended treatment category")
    reasoning: str = Field(..., description="Reasoning for the recommendation")
    confidence: float = Field(..., description="Confidence in the recommendation (0-1)")


class TreatmentComparisonResponse(BaseResponse):
    """Schema for treatment comparison responses."""
    patient_id: str = Field(..., description="ID of the patient")
    timestamp: str = Field(..., description="Timestamp of the comparison")
    treatments_compared: int = Field(..., description="Number of treatments compared")
    results: List[TreatmentComparisonResultSchema] = Field(..., 
        description="Comparison results for each treatment"
    )
    recommendation: TreatmentRecommendationSchema = Field(..., 
        description="Treatment recommendation"
    )


# Other Schemas
class PredictionResponse(BaseResponse):
    """Schema for generic prediction responses (any type)."""
    prediction_id: str = Field(..., description="Unique ID of the prediction")
    patient_id: str = Field(..., description="ID of the patient")
    model_id: str = Field(..., description="ID of the model used for prediction")
    prediction_type: str = Field(..., description="Type of prediction")
    timestamp: str = Field(..., description="Timestamp of the prediction")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    features_used: List[str] = Field(..., description="Features used in the prediction")
    features: Dict[str, Any] = Field(..., description="Feature values used in the prediction")
    explanation: str = Field(..., description="Explanation of the prediction")
    validation_status: ValidationStatusEnum = Field(..., description="Validation status")
    
    # Discriminated union fields for different prediction types
    risk_level: Optional[RiskLevelEnum] = Field(None, description="Risk level (for risk predictions)")
    risk_score: Optional[float] = Field(None, description="Risk score (for risk predictions)")
    contributing_factors: Optional[List[ContributingFactorSchema]] = Field(None, 
        description="Contributing factors (for risk predictions)"
    )
    
    treatment_category: Optional[str] = Field(None, 
        description="Treatment category (for treatment predictions)"
    )
    treatment_details: Optional[Dict[str, Any]] = Field(None, 
        description="Treatment details (for treatment predictions)"
    )
    response_level: Optional[ResponseLevelEnum] = Field(None, 
        description="Response level (for treatment predictions)"
    )
    response_score: Optional[float] = Field(None, 
        description="Response score (for treatment predictions)"
    )
    suggested_adjustments: Optional[List[TreatmentAdjustmentSchema]] = Field(None, 
        description="Suggested adjustments (for treatment predictions)"
    )
    
    outcome_metrics: Optional[Dict[str, Any]] = Field(None, 
        description="Outcome metrics (for outcome predictions)"
    )
    influencing_factors: Optional[List[InfluencingFactorSchema]] = Field(None, 
        description="Influencing factors (for outcome predictions)"
    )
    
    time_frame_days: Optional[int] = Field(None, 
        description="Time frame in days (for risk and outcome predictions)"
    )
    time_to_response_days: Optional[int] = Field(None, 
        description="Time to response in days (for treatment predictions)"
    )


class PredictionListResponse(BaseResponse):
    """Schema for listing multiple predictions."""
    patient_id: str = Field(..., description="ID of the patient")
    count: int = Field(..., description="Number of predictions")
    predictions: List[PredictionResponse] = Field(..., description="List of predictions")


class FeatureImportanceSchema(BaseModel):
    """Schema for feature importance."""
    feature_id: str = Field(..., description="ID of the feature")
    feature_name: str = Field(..., description="Name of the feature")
    importance: float = Field(..., description="Importance value (0-1)")
    category: FeatureCategoryEnum = Field(..., description="Category of the feature")


class FeatureImportanceResponse(BaseResponse):
    """Schema for feature importance response."""
    model_id: str = Field(..., description="ID of the model")
    features: List[FeatureImportanceSchema] = Field(..., 
        description="List of features with importance values"
    )


class ModelPerformanceMetricsSchema(BaseModel):
    """Schema for model performance metrics."""
    accuracy: Optional[float] = Field(None, description="Accuracy (0-1)")
    precision: Optional[float] = Field(None, description="Precision (0-1)")
    recall: Optional[float] = Field(None, description="Recall (0-1)")
    f1_score: Optional[float] = Field(None, description="F1 score (0-1)")
    auc_roc: Optional[float] = Field(None, description="Area under ROC curve (0-1)")
    auc_pr: Optional[float] = Field(None, description="Area under precision-recall curve (0-1)")
    mse: Optional[float] = Field(None, description="Mean squared error")
    mae: Optional[float] = Field(None, description="Mean absolute error")
    r2: Optional[float] = Field(None, description="R-squared value")
    custom_metrics: Optional[Dict[str, float]] = Field(None, 
        description="Custom performance metrics"
    )


class FeatureRequirementSchema(BaseModel):
    """Schema for feature requirements."""
    feature_id: str = Field(..., description="ID of the required feature")
    feature_name: str = Field(..., description="Name of the required feature")
    description: Optional[str] = Field(None, description="Description of the feature")
    data_type: str = Field(..., description="Data type of the feature")
    is_required: bool = Field(True, description="Whether the feature is required")
    default_value: Optional[Any] = Field(None, description="Default value if missing")


class ModelInfoResponse(BaseResponse):
    """Schema for model information."""
    model_id: str = Field(..., description="ID of the model")
    model_name: str = Field(..., description="Name of the model")
    prediction_type: str = Field(..., description="Type of prediction the model makes")
    version: str = Field(..., description="Version of the model")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
    source: ModelSourceEnum = Field(..., description="Source of the model")
    status: ModelStatusEnum = Field(..., description="Status of the model")
    performance_metrics: ModelPerformanceMetricsSchema = Field(..., 
        description="Performance metrics of the model"
    )
    feature_requirements: List[FeatureRequirementSchema] = Field([], 
        description="Required features for the model"
    )
    hyperparameters: Dict[str, Any] = Field({}, description="Hyperparameters of the model")
    training_dataset_info: Dict[str, Any] = Field({}, 
        description="Information about the training dataset"
    )


class ModelListResponse(BaseResponse):
    """Schema for listing multiple models."""
    count: int = Field(..., description="Number of models")
    models: List[ModelInfoResponse] = Field(..., description="List of models")


class ImportantFeatureSchema(BaseModel):
    """Schema for important features in explanations."""
    name: str = Field(..., description="Name of the feature")
    importance: float = Field(..., description="Importance value (0-1)")
    category: str = Field(..., description="Category of the feature")
    value: Any = Field(..., description="Value of the feature in the prediction")


class ExplanationResponse(BaseResponse):
    """Schema for prediction explanations."""
    prediction_id: str = Field(..., description="ID of the prediction")
    prediction_type: str = Field(..., description="Type of prediction")
    model_name: str = Field(..., description="Name of the model used")
    model_version: str = Field(..., description="Version of the model used")
    timestamp: str = Field(..., description="Timestamp of the explanation")
    confidence: float = Field(..., description="Confidence level of the prediction (0-1)")
    explanation_text: str = Field(..., description="Textual explanation of the prediction")
    important_features: List[ImportantFeatureSchema] = Field(..., 
        description="Important features contributing to the prediction"
    )


class DigitalTwinUpdateRequest(BaseRequest):
    """Schema for digital twin update requests."""
    patient_id: str = Field(..., description="ID of the patient")
    prediction_ids: List[str] = Field(..., 
        description="IDs of the predictions to incorporate into the digital twin"
    )


class DigitalTwinUpdateResponse(BaseResponse):
    """Schema for digital twin update responses."""
    patient_id: str = Field(..., description="ID of the patient")
    digital_twin_updated: bool = Field(..., 
        description="Whether the digital twin was successfully updated"
    )
    prediction_count: int = Field(..., description="Number of predictions incorporated")
    timestamp: Optional[str] = Field(None, description="Timestamp of the update")


class HealthCheckComponentSchema(BaseModel):
    """Schema for health check component status."""
    status: str = Field(..., description="Status of the component (healthy, unhealthy)")
    error: Optional[str] = Field(None, description="Error message if unhealthy")


class HealthCheckResponse(BaseResponse):
    """Schema for health check responses."""
    status: str = Field(..., 
        description="Overall status of the service (healthy, degraded, unhealthy)"
    )
    timestamp: str = Field(..., description="Timestamp of the health check")
    components: Dict[str, HealthCheckComponentSchema] = Field(..., 
        description="Status of individual components"
    )
    models: Dict[str, str] = Field(..., 
        description="Status of available models (active, inactive, etc.)"
    )
    error: Optional[str] = Field(None, 
        description="Error message if overall status is unhealthy"
    )