"""
FastAPI routes for the XGBoost service.

This module provides API endpoints for the XGBoost machine learning service,
including risk prediction, treatment response prediction, outcome prediction,
and digital twin integration.
"""

import logging
from typing import Annotated, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, Security, status, Query, Path
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.services.ml.xgboost import (
    XGBoostInterface,
    EventType,
    Observer,
    XGBoostServiceError,
    ValidationError,
    DataPrivacyError,
    ResourceNotFoundError,
    ModelNotFoundError,
    PredictionError,
    ServiceConnectionError,
    ConfigurationError,
    create_xgboost_service_from_env,
)
from app.api.schemas.xgboost import (
    # Base models
    ErrorResponse,
    # Risk prediction
    RiskPredictionRequest,
    RiskPredictionResponse,
    # Treatment response
    TreatmentResponseRequest,
    TreatmentResponseResponse,
    # Outcome prediction
    OutcomePredictionRequest,
    OutcomePredictionResponse,
    # Feature importance
    FeatureImportanceRequest,
    FeatureImportanceResponse,
    # Digital twin
    DigitalTwinIntegrationRequest,
    DigitalTwinIntegrationResponse,
    # Model info
    ModelInfoRequest,
    ModelInfoResponse,
)

# Configure logging
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

# Create router
router = APIRouter(
    prefix="/api/xgboost",
    tags=["XGBoost ML Service"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
)


# -------------------- Dependencies --------------------

def get_xgboost_service() -> XGBoostInterface:
    """
    Get an initialized XGBoost service instance.
    
    This dependency creates and initializes an XGBoost service
    based on environment variables.
    
    Returns:
        Initialized XGBoost service instance
    """
    try:
        service = create_xgboost_service_from_env()
        return service
    except ConfigurationError as e:
        logger.error(f"Failed to create XGBoost service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"XGBoost service configuration error: {str(e)}",
        )


def get_token_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(security)]
) -> Dict[str, Any]:
    """
    Extract and validate user from token.
    
    This dependency extracts user information from the JWT token
    and performs validation.
    
    Args:
        credentials: HTTP Authorization credentials
        
    Returns:
        Dictionary containing user information
        
    Raises:
        HTTPException: If token is invalid or user is not authorized
    """
    # In a real implementation, this would validate the token with AWS Cognito 
    # or another HIPAA-compliant auth provider
    # For now, we'll just return a mock user
    
    # Extract token
    token = credentials.credentials
    
    # Simple mock validation (replace with real token validation)
    if not token or token == "invalid":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Mock user information (replace with real user extraction)
    return {
        "user_id": "user-123",
        "roles": ["clinician"],
        "permissions": ["xgboost:read", "xgboost:predict"]
    }


def verify_permission(
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
    required_permission: str,
) -> None:
    """
    Verify that the user has the required permission.
    
    Args:
        user: User information
        required_permission: Permission to check
        
    Raises:
        HTTPException: If user doesn't have the required permission
    """
    if required_permission not in user.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User does not have permission: {required_permission}",
        )


# -------------------- Helper Functions --------------------

def handle_xgboost_error(e: XGBoostServiceError) -> HTTPException:
    """
    Handle XGBoost service errors and convert to HTTP exceptions.
    
    Args:
        e: XGBoost service error
        
    Returns:
        HTTPException with appropriate status code and details
    """
    # Map domain exceptions to HTTP status codes
    if isinstance(e, ValidationError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=str(e),
                error_type="ValidationError",
                field=getattr(e, "field", None),
                value=getattr(e, "value", None),
            ).model_dump(),
        )
    elif isinstance(e, DataPrivacyError):
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error=str(e),
                error_type="DataPrivacyError",
                details={"pattern_types": getattr(e, "pattern_types", [])},
            ).model_dump(),
        )
    elif isinstance(e, ResourceNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=str(e),
                error_type="ResourceNotFoundError",
                details={
                    "resource_type": getattr(e, "resource_type", None),
                    "resource_id": getattr(e, "resource_id", None),
                },
            ).model_dump(),
        )
    elif isinstance(e, ModelNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorResponse(
                error=str(e),
                error_type="ModelNotFoundError",
                details={"model_type": getattr(e, "model_type", None)},
            ).model_dump(),
        )
    elif isinstance(e, PredictionError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=str(e),
                error_type="PredictionError",
                details={"model_type": getattr(e, "model_type", None)},
            ).model_dump(),
        )
    elif isinstance(e, ServiceConnectionError):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ErrorResponse(
                error=str(e),
                error_type="ServiceConnectionError",
                details={
                    "service": getattr(e, "service", None),
                    "error_type": getattr(e, "error_type", None),
                },
            ).model_dump(),
        )
    elif isinstance(e, ConfigurationError):
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=str(e),
                error_type="ConfigurationError",
                field=getattr(e, "field", None),
                value=getattr(e, "value", None),
                details=getattr(e, "details", None),
            ).model_dump(),
        )
    else:
        # Generic error handling
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error=str(e),
                error_type="XGBoostServiceError",
            ).model_dump(),
        )


# -------------------- Risk Prediction Routes --------------------

@router.post(
    "/predict/risk",
    response_model=RiskPredictionResponse,
    summary="Predict risk level",
    description="Predict risk level for a patient using clinical data.",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    },
)
async def predict_risk(
    request: RiskPredictionRequest,
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)],
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
) -> RiskPredictionResponse:
    """
    Predict risk level for a patient using clinical data.
    
    Args:
        request: Risk prediction request
        xgboost_service: XGBoost service instance
        user: Authenticated user information
        
    Returns:
        Risk prediction response
        
    Raises:
        HTTPException: If the request is invalid or prediction fails
    """
    # Verify permission
    verify_permission(user, "xgboost:predict")
    
    try:
        # Make prediction
        result = xgboost_service.predict_risk(
            patient_id=request.patient_id,
            risk_type=request.risk_type,
            clinical_data=request.clinical_data,
            time_frame_days=request.time_frame_days,
        )
        
        # Convert to response model
        return RiskPredictionResponse(**result)
    
    except XGBoostServiceError as e:
        # Log error (without PHI)
        logger.error(
            f"Risk prediction failed: {e.__class__.__name__}: {str(e)}"
        )
        
        # Convert to HTTP exception
        raise handle_xgboost_error(e)


# -------------------- Treatment Response Routes --------------------

@router.post(
    "/predict/treatment-response",
    response_model=TreatmentResponseResponse,
    summary="Predict treatment response",
    description="Predict response to a psychiatric treatment.",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    },
)
async def predict_treatment_response(
    request: TreatmentResponseRequest,
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)],
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
) -> TreatmentResponseResponse:
    """
    Predict response to a psychiatric treatment.
    
    Args:
        request: Treatment response prediction request
        xgboost_service: XGBoost service instance
        user: Authenticated user information
        
    Returns:
        Treatment response prediction response
        
    Raises:
        HTTPException: If the request is invalid or prediction fails
    """
    # Verify permission
    verify_permission(user, "xgboost:predict")
    
    try:
        # Make prediction
        result = xgboost_service.predict_treatment_response(
            patient_id=request.patient_id,
            treatment_type=request.treatment_type,
            treatment_details=request.treatment_details.model_dump(),
            clinical_data=request.clinical_data,
            prediction_horizon=request.prediction_horizon,
        )
        
        # Convert to response model
        return TreatmentResponseResponse(**result)
    
    except XGBoostServiceError as e:
        # Log error (without PHI)
        logger.error(
            f"Treatment response prediction failed: {e.__class__.__name__}: {str(e)}"
        )
        
        # Convert to HTTP exception
        raise handle_xgboost_error(e)


# -------------------- Outcome Prediction Routes --------------------

@router.post(
    "/predict/outcome",
    response_model=OutcomePredictionResponse,
    summary="Predict clinical outcomes",
    description="Predict clinical outcomes based on treatment plan.",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    },
)
async def predict_outcome(
    request: OutcomePredictionRequest,
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)],
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
) -> OutcomePredictionResponse:
    """
    Predict clinical outcomes based on treatment plan.
    
    Args:
        request: Outcome prediction request
        xgboost_service: XGBoost service instance
        user: Authenticated user information
        
    Returns:
        Outcome prediction response
        
    Raises:
        HTTPException: If the request is invalid or prediction fails
    """
    # Verify permission
    verify_permission(user, "xgboost:predict")
    
    try:
        # Make prediction
        result = xgboost_service.predict_outcome(
            patient_id=request.patient_id,
            outcome_timeframe=request.outcome_timeframe.model_dump(),
            clinical_data=request.clinical_data,
            treatment_plan=request.treatment_plan,
            outcome_type=request.outcome_type,
        )
        
        # Convert to response model
        return OutcomePredictionResponse(**result)
    
    except XGBoostServiceError as e:
        # Log error (without PHI)
        logger.error(
            f"Outcome prediction failed: {e.__class__.__name__}: {str(e)}"
        )
        
        # Convert to HTTP exception
        raise handle_xgboost_error(e)


# -------------------- Feature Importance Routes --------------------

@router.post(
    "/feature-importance",
    response_model=FeatureImportanceResponse,
    summary="Get feature importance",
    description="Get feature importance for a prediction.",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
)
async def get_feature_importance(
    request: FeatureImportanceRequest,
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)],
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
) -> FeatureImportanceResponse:
    """
    Get feature importance for a prediction.
    
    Args:
        request: Feature importance request
        xgboost_service: XGBoost service instance
        user: Authenticated user information
        
    Returns:
        Feature importance response
        
    Raises:
        HTTPException: If the request is invalid or feature importance fails
    """
    # Verify permission
    verify_permission(user, "xgboost:read")
    
    try:
        # Get feature importance
        result = xgboost_service.get_feature_importance(
            patient_id=request.patient_id,
            model_type=request.model_type,
            prediction_id=request.prediction_id,
        )
        
        # Convert to response model
        return FeatureImportanceResponse(**result)
    
    except XGBoostServiceError as e:
        # Log error (without PHI)
        logger.error(
            f"Feature importance failed: {e.__class__.__name__}: {str(e)}"
        )
        
        # Convert to HTTP exception
        raise handle_xgboost_error(e)


# -------------------- Digital Twin Integration Routes --------------------

@router.post(
    "/integrate/digital-twin",
    response_model=DigitalTwinIntegrationResponse,
    summary="Integrate with digital twin",
    description="Integrate prediction with digital twin profile.",
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    },
)
async def integrate_with_digital_twin(
    request: DigitalTwinIntegrationRequest,
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)],
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
) -> DigitalTwinIntegrationResponse:
    """
    Integrate prediction with digital twin profile.
    
    Args:
        request: Digital twin integration request
        xgboost_service: XGBoost service instance
        user: Authenticated user information
        
    Returns:
        Digital twin integration response
        
    Raises:
        HTTPException: If the request is invalid or integration fails
    """
    # Verify permission
    verify_permission(user, "xgboost:predict")
    
    try:
        # Integrate with digital twin
        result = xgboost_service.integrate_with_digital_twin(
            patient_id=request.patient_id,
            profile_id=request.profile_id,
            prediction_id=request.prediction_id,
        )
        
        # Convert to response model
        return DigitalTwinIntegrationResponse(**result)
    
    except XGBoostServiceError as e:
        # Log error (without PHI)
        logger.error(
            f"Digital twin integration failed: {e.__class__.__name__}: {str(e)}"
        )
        
        # Convert to HTTP exception
        raise handle_xgboost_error(e)


# -------------------- Model Info Routes --------------------

@router.get(
    "/models/{model_type}",
    response_model=ModelInfoResponse,
    summary="Get model information",
    description="Get information about a model.",
    responses={
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
)
async def get_model_info(
    model_type: str = Path(..., description="Type of model"),
    xgboost_service: Annotated[XGBoostInterface, Depends(get_xgboost_service)] = Depends(get_xgboost_service),
    user: Annotated[Dict[str, Any], Depends(get_token_user)] = Depends(get_token_user),
) -> ModelInfoResponse:
    """
    Get information about a model.
    
    Args:
        model_type: Type of model
        xgboost_service: XGBoost service instance
        user: Authenticated user information
        
    Returns:
        Model information response
        
    Raises:
        HTTPException: If the model type is invalid or model information fails
    """
    # Verify permission
    verify_permission(user, "xgboost:read")
    
    try:
        # Get model information
        result = xgboost_service.get_model_info(
            model_type=model_type,
        )
        
        # Convert to response model
        return ModelInfoResponse(**result)
    
    except XGBoostServiceError as e:
        # Log error (without PHI)
        logger.error(
            f"Model information failed: {e.__class__.__name__}: {str(e)}"
        )
        
        # Convert to HTTP exception
        raise handle_xgboost_error(e)


@router.get(
    "/models",
    response_model=List[str],
    summary="List available models",
    description="List all available model types.",
)
async def list_models(
    user: Annotated[Dict[str, Any], Depends(get_token_user)],
) -> List[str]:
    """
    List all available model types.
    
    Args:
        user: Authenticated user information
        
    Returns:
        List of available model types
    """
    # Verify permission
    verify_permission(user, "xgboost:read")
    
    # In a real implementation, this would retrieve model types from a registry
    # For now, we'll return a static list
    return [
        "relapse-risk",
        "suicide-risk",
        "hospitalization-risk",
        "medication_ssri-response",
        "medication_snri-response",
        "therapy_cbt-response",
        "therapy_dbt-response",
        "symptom-outcome",
        "functional-outcome",
        "quality_of_life-outcome",
    ]


# -------------------- Notifications Observer --------------------

class LoggingObserver(Observer):
    """Observer that logs events to the application logger."""
    
    def update(self, event_type: EventType, data: Dict[str, Any]) -> None:
        """
        Log an event from the XGBoost service.
        
        Args:
            event_type: Type of event
            data: Event data
        """
        # Sanitize data to remove PHI
        sanitized_data = {}
        if "patient_id" in data:
            sanitized_data["patient_id"] = "[REDACTED]"
        if "prediction_id" in data:
            sanitized_data["prediction_id"] = data["prediction_id"]
        if "model_type" in data:
            sanitized_data["model_type"] = data["model_type"]
        if "prediction_type" in data:
            sanitized_data["prediction_type"] = data["prediction_type"]
        if "status" in data:
            sanitized_data["status"] = data["status"]
        if "timestamp" in data:
            sanitized_data["timestamp"] = data["timestamp"]
        
        # Log the event
        logger.info(
            f"XGBoost service event: {event_type} - {sanitized_data}"
        )


# Register observer with the XGBoost service
def register_observers() -> None:
    """Register observers with the XGBoost service."""
    try:
        # Create an observer
        observer = LoggingObserver()
        
        # Get service instance
        service = create_xgboost_service_from_env()
        
        # Register observer for all events
        service.register_observer("*", observer)
        
        logger.info("Registered observers with XGBoost service")
    
    except Exception as e:
        logger.error(f"Failed to register observers: {e}")