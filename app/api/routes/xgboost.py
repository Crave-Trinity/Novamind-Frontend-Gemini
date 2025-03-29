"""
FastAPI endpoints for the XGBoost service.

This module provides API routes for risk prediction, treatment response prediction,
outcome prediction, feature importance, and digital twin integration using the
XGBoost service.
"""

import logging
from typing import Dict, List, Any, Optional, Union, Annotated
from datetime import datetime
from functools import lru_cache

from fastapi import APIRouter, Depends, Path, Query, Body, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.services.ml.xgboost import (
    XGBoostInterface,
    get_xgboost_service,
    ModelType,
    EventType,
    PrivacyLevel,
    XGBoostServiceError,
    ValidationError,
    DataPrivacyError,
    ResourceNotFoundError,
    ModelNotFoundError,
    PredictionError,
    ServiceConnectionError,
    ConfigurationError
)

from app.api.schemas.xgboost import (
    RiskPredictionRequest,
    RiskPredictionResponse,
    TreatmentResponseRequest,
    TreatmentResponseResponse,
    OutcomePredictionRequest,
    OutcomePredictionResponse,
    FeatureImportanceRequest,
    FeatureImportanceResponse,
    DigitalTwinIntegrationRequest,
    DigitalTwinIntegrationResponse,
    ModelInfoResponse,
    ErrorResponse
)

from app.api.dependencies.auth import get_token_user, verify_psychiatrist


# Configure logger
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter(
    prefix="/api/v1/xgboost",
    tags=["xgboost"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Unauthorized access"
        },
        status.HTTP_403_FORBIDDEN: {
            "model": ErrorResponse,
            "description": "Forbidden - insufficient permissions"
        },
        status.HTTP_404_NOT_FOUND: {
            "model": ErrorResponse,
            "description": "Resource not found"
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "model": ErrorResponse,
            "description": "Validation error"
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": ErrorResponse,
            "description": "Internal server error"
        }
    }
)


# ---- Risk Prediction ----

@router.post(
    "/risk/{risk_type}",
    response_model=RiskPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict psychiatric risk",
    description="Predict the risk level for a specific psychiatric risk type. "
                "This endpoint requires psychiatrist authorization.",
    responses={
        status.HTTP_200_OK: {
            "description": "Risk prediction result",
            "model": RiskPredictionResponse
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid request data",
            "model": ErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not authorized as a psychiatrist",
            "model": ErrorResponse
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "Data privacy violation detected",
            "model": ErrorResponse
        }
    }
)
async def predict_risk(
    risk_type: str = Path(..., description="Type of risk to predict"),
    request: RiskPredictionRequest = Body(..., description="Risk prediction request data"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
    is_psychiatrist: bool = Depends(verify_psychiatrist)
) -> RiskPredictionResponse:
    """
    Predict psychiatric risk level for a patient.
    
    Args:
        risk_type: Type of risk to predict (e.g., "relapse", "suicide")
        request: Risk prediction request data
        xgboost_service: XGBoost service instance
        user: Current authenticated user
        is_psychiatrist: Whether the user is a psychiatrist
        
    Returns:
        Risk prediction result
        
    Raises:
        HTTPException: If an error occurs during prediction
    """
    try:
        # Normalize risk type
        normalized_risk_type = risk_type.lower().replace("_", "-")
        
        # Make prediction
        prediction_result = xgboost_service.predict_risk(
            patient_id=request.patient_id,
            risk_type=normalized_risk_type,
            clinical_data=request.clinical_data,
            time_frame_days=request.time_frame_days
        )
        
        # Create response
        response = RiskPredictionResponse(
            patient_id=request.patient_id,
            risk_type=normalized_risk_type,
            prediction_id=prediction_result.get("prediction_id", f"risk-{int(datetime.now().timestamp())}"),
            prediction_score=prediction_result.get("prediction_score", 0.0),
            risk_level=prediction_result.get("risk_level", "unknown"),
            confidence=prediction_result.get("confidence", 0.0),
            factors=prediction_result.get("factors", []),
            timestamp=prediction_result.get("timestamp", datetime.now().isoformat()),
            time_frame_days=request.time_frame_days
        )
        
        # Log prediction (no PHI)
        logger.info(
            f"Risk prediction completed: type={normalized_risk_type}, "
            f"prediction_id={response.prediction_id}"
        )
        
        return response
    
    except (ValidationError, DataPrivacyError, ModelNotFoundError, PredictionError, ServiceConnectionError) as e:
        # Map exception to appropriate HTTP status code and error model
        _handle_xgboost_exception(e)


# ---- Treatment Response Prediction ----

@router.post(
    "/treatment/{treatment_type}",
    response_model=TreatmentResponseResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict treatment response",
    description="Predict how a patient will respond to a specific psychiatric treatment. "
                "This endpoint requires psychiatrist authorization.",
    responses={
        status.HTTP_200_OK: {
            "description": "Treatment response prediction result",
            "model": TreatmentResponseResponse
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid request data",
            "model": ErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not authorized as a psychiatrist",
            "model": ErrorResponse
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "Data privacy violation detected",
            "model": ErrorResponse
        }
    }
)
async def predict_treatment_response(
    treatment_type: str = Path(..., description="Type of treatment"),
    request: TreatmentResponseRequest = Body(..., description="Treatment response prediction request data"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
    is_psychiatrist: bool = Depends(verify_psychiatrist)
) -> TreatmentResponseResponse:
    """
    Predict psychiatric treatment response for a patient.
    
    Args:
        treatment_type: Type of treatment (e.g., "medication_ssri", "therapy_cbt")
        request: Treatment response prediction request data
        xgboost_service: XGBoost service instance
        user: Current authenticated user
        is_psychiatrist: Whether the user is a psychiatrist
        
    Returns:
        Treatment response prediction result
        
    Raises:
        HTTPException: If an error occurs during prediction
    """
    try:
        # Normalize treatment type
        normalized_treatment_type = treatment_type.lower().replace("-", "_")
        
        # Make prediction
        prediction_result = xgboost_service.predict_treatment_response(
            patient_id=request.patient_id,
            treatment_type=normalized_treatment_type,
            treatment_details=request.treatment_details,
            clinical_data=request.clinical_data,
            prediction_horizon=request.prediction_horizon
        )
        
        # Create response
        response = TreatmentResponseResponse(
            patient_id=request.patient_id,
            treatment_type=normalized_treatment_type,
            prediction_id=prediction_result.get("prediction_id", f"treatment-{int(datetime.now().timestamp())}"),
            response_probability=prediction_result.get("response_probability", 0.0),
            response_level=prediction_result.get("response_level", "unknown"),
            confidence=prediction_result.get("confidence", 0.0),
            time_to_response_weeks=prediction_result.get("time_to_response_weeks", 0),
            factors=prediction_result.get("factors", []),
            timestamp=prediction_result.get("timestamp", datetime.now().isoformat()),
            prediction_horizon=request.prediction_horizon
        )
        
        # Log prediction (no PHI)
        logger.info(
            f"Treatment response prediction completed: type={normalized_treatment_type}, "
            f"prediction_id={response.prediction_id}"
        )
        
        return response
    
    except (ValidationError, DataPrivacyError, ModelNotFoundError, PredictionError, ServiceConnectionError) as e:
        # Map exception to appropriate HTTP status code and error model
        _handle_xgboost_exception(e)


# ---- Outcome Prediction ----

@router.post(
    "/outcome/{outcome_type}",
    response_model=OutcomePredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict clinical outcome",
    description="Predict clinical outcomes based on treatment plan. "
                "This endpoint requires psychiatrist authorization.",
    responses={
        status.HTTP_200_OK: {
            "description": "Outcome prediction result",
            "model": OutcomePredictionResponse
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid request data",
            "model": ErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not authorized as a psychiatrist",
            "model": ErrorResponse
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "description": "Data privacy violation detected",
            "model": ErrorResponse
        }
    }
)
async def predict_outcome(
    outcome_type: str = Path(..., description="Type of outcome"),
    request: OutcomePredictionRequest = Body(..., description="Outcome prediction request data"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
    is_psychiatrist: bool = Depends(verify_psychiatrist)
) -> OutcomePredictionResponse:
    """
    Predict clinical outcomes for a patient based on treatment plan.
    
    Args:
        outcome_type: Type of outcome (e.g., "symptom", "functional", "quality_of_life")
        request: Outcome prediction request data
        xgboost_service: XGBoost service instance
        user: Current authenticated user
        is_psychiatrist: Whether the user is a psychiatrist
        
    Returns:
        Outcome prediction result
        
    Raises:
        HTTPException: If an error occurs during prediction
    """
    try:
        # Normalize outcome type
        normalized_outcome_type = outcome_type.lower().replace("-", "_")
        
        # Make prediction
        prediction_result = xgboost_service.predict_outcome(
            patient_id=request.patient_id,
            outcome_timeframe=request.outcome_timeframe,
            clinical_data=request.clinical_data,
            treatment_plan=request.treatment_plan,
            outcome_type=normalized_outcome_type
        )
        
        # Create response
        response = OutcomePredictionResponse(
            patient_id=request.patient_id,
            outcome_type=normalized_outcome_type,
            prediction_id=prediction_result.get("prediction_id", f"outcome-{int(datetime.now().timestamp())}"),
            outcome_score=prediction_result.get("outcome_score", 0.0),
            outcome_category=prediction_result.get("outcome_category", "unknown"),
            confidence=prediction_result.get("confidence", 0.0),
            projected_changes=prediction_result.get("projected_changes", {}),
            factors=prediction_result.get("factors", []),
            timestamp=prediction_result.get("timestamp", datetime.now().isoformat()),
            outcome_timeframe=request.outcome_timeframe
        )
        
        # Log prediction (no PHI)
        logger.info(
            f"Outcome prediction completed: type={normalized_outcome_type}, "
            f"prediction_id={response.prediction_id}"
        )
        
        return response
    
    except (ValidationError, DataPrivacyError, ModelNotFoundError, PredictionError, ServiceConnectionError) as e:
        # Map exception to appropriate HTTP status code and error model
        _handle_xgboost_exception(e)


# ---- Feature Importance ----

@router.post(
    "/feature-importance",
    response_model=FeatureImportanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get feature importance",
    description="Get feature importance for a prediction. "
                "This endpoint requires psychiatrist authorization.",
    responses={
        status.HTTP_200_OK: {
            "description": "Feature importance result",
            "model": FeatureImportanceResponse
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid request data",
            "model": ErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not authorized as a psychiatrist",
            "model": ErrorResponse
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Prediction not found",
            "model": ErrorResponse
        }
    }
)
async def get_feature_importance(
    request: FeatureImportanceRequest = Body(..., description="Feature importance request data"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
    is_psychiatrist: bool = Depends(verify_psychiatrist)
) -> FeatureImportanceResponse:
    """
    Get feature importance for a prediction.
    
    Args:
        request: Feature importance request data
        xgboost_service: XGBoost service instance
        user: Current authenticated user
        is_psychiatrist: Whether the user is a psychiatrist
        
    Returns:
        Feature importance result
        
    Raises:
        HTTPException: If an error occurs during feature importance calculation
    """
    try:
        # Get feature importance
        importance_result = xgboost_service.get_feature_importance(
            patient_id=request.patient_id,
            model_type=request.model_type,
            prediction_id=request.prediction_id
        )
        
        # Create response
        response = FeatureImportanceResponse(
            patient_id=request.patient_id,
            model_type=request.model_type,
            prediction_id=request.prediction_id,
            features=importance_result.get("features", []),
            timestamp=importance_result.get("timestamp", datetime.now().isoformat())
        )
        
        # Log feature importance calculation (no PHI)
        logger.info(
            f"Feature importance calculation completed: model_type={request.model_type}, "
            f"prediction_id={request.prediction_id}"
        )
        
        return response
    
    except (ValidationError, ResourceNotFoundError, ServiceConnectionError) as e:
        # Map exception to appropriate HTTP status code and error model
        _handle_xgboost_exception(e)


# ---- Digital Twin Integration ----

@router.post(
    "/digital-twin/integrate",
    response_model=DigitalTwinIntegrationResponse,
    status_code=status.HTTP_200_OK,
    summary="Integrate with digital twin",
    description="Integrate prediction with digital twin profile. "
                "This endpoint requires psychiatrist authorization.",
    responses={
        status.HTTP_200_OK: {
            "description": "Integration result",
            "model": DigitalTwinIntegrationResponse
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid request data",
            "model": ErrorResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not authorized as a psychiatrist",
            "model": ErrorResponse
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Prediction or profile not found",
            "model": ErrorResponse
        }
    }
)
async def integrate_with_digital_twin(
    request: DigitalTwinIntegrationRequest = Body(..., description="Digital twin integration request data"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
    is_psychiatrist: bool = Depends(verify_psychiatrist)
) -> DigitalTwinIntegrationResponse:
    """
    Integrate prediction with digital twin profile.
    
    Args:
        request: Digital twin integration request data
        xgboost_service: XGBoost service instance
        user: Current authenticated user
        is_psychiatrist: Whether the user is a psychiatrist
        
    Returns:
        Integration result
        
    Raises:
        HTTPException: If an error occurs during integration
    """
    try:
        # Integrate with digital twin
        integration_result = xgboost_service.integrate_with_digital_twin(
            patient_id=request.patient_id,
            profile_id=request.profile_id,
            prediction_id=request.prediction_id
        )
        
        # Create response
        response = DigitalTwinIntegrationResponse(
            patient_id=request.patient_id,
            profile_id=request.profile_id,
            prediction_id=request.prediction_id,
            integration_id=integration_result.get("integration_id", f"integration-{int(datetime.now().timestamp())}"),
            status=integration_result.get("status", "unknown"),
            details=integration_result.get("details", {}),
            timestamp=integration_result.get("timestamp", datetime.now().isoformat())
        )
        
        # Log integration (no PHI)
        logger.info(
            f"Digital twin integration completed: profile_id={request.profile_id}, "
            f"prediction_id={request.prediction_id}, status={response.status}"
        )
        
        return response
    
    except (ValidationError, ResourceNotFoundError, ServiceConnectionError) as e:
        # Map exception to appropriate HTTP status code and error model
        _handle_xgboost_exception(e)


# ---- Model Information ----

@router.get(
    "/models/{model_type}",
    response_model=ModelInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Get model information",
    description="Get information about an XGBoost model. "
                "This endpoint requires psychiatrist authorization.",
    responses={
        status.HTTP_200_OK: {
            "description": "Model information",
            "model": ModelInfoResponse
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not authorized as a psychiatrist",
            "model": ErrorResponse
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Model not found",
            "model": ErrorResponse
        }
    }
)
async def get_model_info(
    model_type: str = Path(..., description="Type of model"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
    is_psychiatrist: bool = Depends(verify_psychiatrist)
) -> ModelInfoResponse:
    """
    Get information about an XGBoost model.
    
    Args:
        model_type: Type of model
        xgboost_service: XGBoost service instance
        user: Current authenticated user
        is_psychiatrist: Whether the user is a psychiatrist
        
    Returns:
        Model information
        
    Raises:
        HTTPException: If an error occurs during model info retrieval
    """
    try:
        # Normalize model type
        normalized_model_type = model_type.lower().replace("-", "_")
        
        # Get model info
        model_info = xgboost_service.get_model_info(normalized_model_type)
        
        # Create response
        response = ModelInfoResponse(
            model_type=model_info.get("model_type", normalized_model_type),
            version=model_info.get("version", "1.0.0"),
            last_updated=model_info.get("last_updated", datetime.now().isoformat()),
            description=model_info.get("description", ""),
            features=model_info.get("features", []),
            performance_metrics=model_info.get("performance_metrics", {}),
            hyperparameters=model_info.get("hyperparameters", {}),
            status=model_info.get("status", "unknown")
        )
        
        # Log model info retrieval (no PHI)
        logger.info(
            f"Model info retrieval completed: model_type={normalized_model_type}, "
            f"version={response.version}"
        )
        
        return response
    
    except (ModelNotFoundError, ServiceConnectionError) as e:
        # Map exception to appropriate HTTP status code and error model
        _handle_xgboost_exception(e)


# ---- Error Handling ----

def _handle_xgboost_exception(exception: XGBoostServiceError) -> None:
    """
    Handle XGBoost service exceptions and convert them to appropriate HTTP exceptions.
    
    Args:
        exception: XGBoost service exception
        
    Raises:
        HTTPException: Converted HTTP exception
    """
    # Get exception details
    detail = str(exception)
    
    # Map exception type to HTTP status code
    if isinstance(exception, ValidationError):
        status_code = status.HTTP_400_BAD_REQUEST
        error_type = "ValidationError"
    elif isinstance(exception, DataPrivacyError):
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        error_type = "DataPrivacyError"
    elif isinstance(exception, ResourceNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
        error_type = "ResourceNotFoundError"
    elif isinstance(exception, ModelNotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
        error_type = "ModelNotFoundError"
    elif isinstance(exception, PredictionError):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_type = "PredictionError"
    elif isinstance(exception, ServiceConnectionError):
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        error_type = "ServiceConnectionError"
    elif isinstance(exception, ConfigurationError):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_type = "ConfigurationError"
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        error_type = "XGBoostServiceError"
    
    # Log error (no PHI)
    logger.error(f"XGBoost service error: {error_type} - {detail}")
    
    # Raise HTTP exception
    error_response = ErrorResponse(
        error_type=error_type,
        error_message=detail,
        timestamp=datetime.now().isoformat()
    )
    
    raise HTTPException(
        status_code=status_code,
        detail=error_response.dict()
    )