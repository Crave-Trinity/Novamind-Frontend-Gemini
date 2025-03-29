"""
API routes for the XGBoost ML service.

This module provides FastAPI endpoints for accessing the XGBoost ML service functionality,
including risk prediction, treatment response prediction, and outcome prediction.
"""

import logging
from typing import Dict, List, Optional, Any, Union

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import UUID4

from app.api.dependencies.auth import get_current_clinician, verify_patient_access
from app.api.schemas.xgboost import (
    RiskPredictionRequest,
    RiskPredictionResponse,
    TreatmentPredictionRequest,
    TreatmentPredictionResponse,
    OutcomePredictionRequest,
    OutcomePredictionResponse,
    PredictionValidationRequest,
    PredictionValidationResponse,
    TreatmentComparisonRequest,
    TreatmentComparisonResponse,
    ExplanationResponse,
    PredictionResponse,
    PredictionListResponse,
    ModelInfoResponse,
    ModelListResponse,
    FeatureImportanceResponse,
    DigitalTwinUpdateRequest,
    DigitalTwinUpdateResponse,
    HealthCheckResponse,
    ErrorResponse
)
from app.core.services.ml.xgboost import (
    get_xgboost_service,
    XGBoostServiceInterface,
    PredictionType,
    ValidationStatus,
    ModelNotFoundError,
    PredictionNotFoundError,
    PatientNotFoundError,
    InvalidFeatureError,
    PredictionError,
    DigitalTwinUpdateError,
    ServiceOperationError
)

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/v1/xgboost",
    tags=["xgboost"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse}
    }
)


def get_xgboost_service_from_settings() -> XGBoostServiceInterface:
    """
    Get the XGBoost service from application settings.
    
    Uses the factory pattern to create the appropriate service implementation.
    """
    return get_xgboost_service()


@router.get(
    "/healthcheck",
    response_model=HealthCheckResponse,
    summary="Check XGBoost service health",
    description="Checks the health of the XGBoost service and its components."
)
async def healthcheck(
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Check the health of the XGBoost service."""
    try:
        health_status = service.healthcheck()
        return health_status
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Service health check failed: {str(e)}"
        )


@router.post(
    "/predict/risk",
    response_model=RiskPredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate risk prediction",
    description="Generate a risk prediction (relapse, suicide, hospitalization) for a patient."
)
async def predict_risk(
    request: RiskPredictionRequest,
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Generate a risk prediction for a patient."""
    # Verify patient access
    await verify_patient_access(clinician, request.patient_id)
    
    try:
        # Generate prediction
        prediction = service.predict_risk(
            patient_id=request.patient_id,
            risk_type=PredictionType(request.risk_type),
            features=request.features,
            time_frame_days=request.time_frame_days
        )
        
        # Return response
        return prediction.to_dict()
        
    except InvalidFeatureError as e:
        logger.warning(f"Invalid features for risk prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid features: {str(e)}"
        )
    except ModelNotFoundError as e:
        logger.warning(f"Model not found for risk prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model not found: {str(e)}"
        )
    except PredictionError as e:
        logger.error(f"Error generating risk prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in risk prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post(
    "/predict/treatment",
    response_model=TreatmentPredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate treatment response prediction",
    description="Generate a treatment response prediction for a specified treatment."
)
async def predict_treatment_response(
    request: TreatmentPredictionRequest,
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Generate a treatment response prediction for a patient."""
    # Verify patient access
    await verify_patient_access(clinician, request.patient_id)
    
    try:
        # Generate prediction
        prediction = service.predict_treatment_response(
            patient_id=request.patient_id,
            treatment_category=request.treatment_category,
            treatment_details=request.treatment_details,
            features=request.features
        )
        
        # Return response
        return prediction.to_dict()
        
    except InvalidFeatureError as e:
        logger.warning(f"Invalid features for treatment prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid features: {str(e)}"
        )
    except ModelNotFoundError as e:
        logger.warning(f"Model not found for treatment prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model not found: {str(e)}"
        )
    except PredictionError as e:
        logger.error(f"Error generating treatment prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in treatment prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post(
    "/predict/outcome",
    response_model=OutcomePredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate outcome prediction",
    description="Generate an outcome prediction for a patient (clinical, functional, quality of life)."
)
async def predict_outcome(
    request: OutcomePredictionRequest,
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Generate an outcome prediction for a patient."""
    # Verify patient access
    await verify_patient_access(clinician, request.patient_id)
    
    try:
        # Generate prediction
        prediction = service.predict_outcome(
            patient_id=request.patient_id,
            outcome_type=PredictionType(request.outcome_type),
            features=request.features,
            time_frame_days=request.time_frame_days
        )
        
        # Return response
        return prediction.to_dict()
        
    except InvalidFeatureError as e:
        logger.warning(f"Invalid features for outcome prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid features: {str(e)}"
        )
    except ModelNotFoundError as e:
        logger.warning(f"Model not found for outcome prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model not found: {str(e)}"
        )
    except PredictionError as e:
        logger.error(f"Error generating outcome prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in outcome prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get(
    "/predictions/{prediction_id}",
    response_model=PredictionResponse,
    summary="Get prediction by ID",
    description="Retrieve a previously generated prediction by its ID."
)
async def get_prediction(
    prediction_id: str = Path(..., description="The ID of the prediction to retrieve"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Get a prediction by ID."""
    try:
        # Get prediction
        prediction = service.get_prediction(prediction_id=prediction_id)
        
        # Verify patient access (prediction contains patient_id)
        await verify_patient_access(clinician, prediction.patient_id)
        
        # Return response
        return prediction.to_dict()
        
    except PredictionNotFoundError as e:
        logger.warning(f"Prediction not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get(
    "/patients/{patient_id}/predictions",
    response_model=PredictionListResponse,
    summary="Get predictions for patient",
    description="Retrieve all predictions for a specific patient."
)
async def get_predictions_for_patient(
    patient_id: str = Path(..., description="The ID of the patient"),
    prediction_type: Optional[str] = Query(None, description="Filter by prediction type"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of predictions to return"),
    offset: int = Query(0, ge=0, description="Number of predictions to skip"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Get predictions for a patient."""
    # Verify patient access
    await verify_patient_access(clinician, patient_id)
    
    try:
        # Convert prediction type if provided
        prediction_type_enum = None
        if prediction_type:
            prediction_type_enum = PredictionType(prediction_type)
        
        # Get predictions
        predictions = service.get_predictions_for_patient(
            patient_id=patient_id,
            prediction_type=prediction_type_enum,
            limit=limit,
            offset=offset
        )
        
        # Convert predictions to dictionaries
        prediction_dicts = [p.to_dict() for p in predictions]
        
        # Return response
        return {
            "patient_id": patient_id,
            "count": len(prediction_dicts),
            "predictions": prediction_dicts
        }
        
    except PatientNotFoundError as e:
        logger.warning(f"Patient not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving patient predictions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post(
    "/predictions/{prediction_id}/validate",
    response_model=PredictionValidationResponse,
    summary="Validate prediction",
    description="Update the validation status of a prediction (validated or rejected)."
)
async def validate_prediction(
    request: PredictionValidationRequest,
    prediction_id: str = Path(..., description="The ID of the prediction to validate"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Validate a prediction."""
    try:
        # Get prediction first to verify patient access
        prediction = service.get_prediction(prediction_id=prediction_id)
        
        # Verify patient access
        await verify_patient_access(clinician, prediction.patient_id)
        
        # Validate prediction
        success = service.validate_prediction(
            prediction_id=prediction_id,
            status=ValidationStatus(request.status),
            validator_notes=request.validator_notes
        )
        
        # Return response
        return {
            "prediction_id": prediction_id,
            "status": request.status,
            "validator": clinician.get("name", "Unknown"),
            "success": success
        }
        
    except PredictionNotFoundError as e:
        logger.warning(f"Prediction not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error validating prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post(
    "/compare/treatments",
    response_model=TreatmentComparisonResponse,
    summary="Compare treatments",
    description="Compare multiple treatment options for a patient and get recommendations."
)
async def compare_treatments(
    request: TreatmentComparisonRequest,
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Compare treatment options for a patient."""
    # Verify patient access
    await verify_patient_access(clinician, request.patient_id)
    
    try:
        # Compare treatments
        comparison_result = service.compare_treatments(
            patient_id=request.patient_id,
            treatment_options=request.treatment_options,
            features=request.features
        )
        
        # Return response
        return comparison_result
        
    except InvalidFeatureError as e:
        logger.warning(f"Invalid features for treatment comparison: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid features: {str(e)}"
        )
    except PatientNotFoundError as e:
        logger.warning(f"Patient not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient not found: {str(e)}"
        )
    except PredictionError as e:
        logger.error(f"Error comparing treatments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Treatment comparison failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error comparing treatments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get(
    "/models",
    response_model=ModelListResponse,
    summary="Get available models",
    description="Get information about available prediction models."
)
async def get_models(
    prediction_type: Optional[str] = Query(None, description="Filter by prediction type"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Get information about available models."""
    try:
        # Convert prediction type if provided
        prediction_type_enum = None
        if prediction_type:
            prediction_type_enum = PredictionType(prediction_type)
        
        # Get models
        models = service.get_model_info(prediction_type=prediction_type_enum)
        
        # Handle both single model and list
        if not isinstance(models, list):
            models = [models]
        
        # Convert models to dictionaries
        model_dicts = [model.to_dict() for model in models]
        
        # Return response
        return {
            "count": len(model_dicts),
            "models": model_dicts
        }
        
    except ModelNotFoundError as e:
        logger.warning(f"Models not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Models not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving models: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get(
    "/models/{model_id}",
    response_model=ModelInfoResponse,
    summary="Get model info",
    description="Get detailed information about a specific model."
)
async def get_model_info(
    model_id: str = Path(..., description="The ID of the model"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Get information about a specific model."""
    try:
        # Get model info
        model = service.get_model_info(model_id=model_id)
        
        # Return response
        return model.to_dict()
        
    except ModelNotFoundError as e:
        logger.warning(f"Model not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving model info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get(
    "/models/{model_id}/features",
    response_model=FeatureImportanceResponse,
    summary="Get feature importance",
    description="Get feature importance information for a specific model."
)
async def get_feature_importance(
    model_id: str = Path(..., description="The ID of the model"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Get feature importance information for a model."""
    try:
        # Get feature importance
        features = service.get_feature_importance(model_id=model_id)
        
        # Convert to dictionaries
        feature_dicts = [feature.to_dict() for feature in features]
        
        # Return response
        return {
            "model_id": model_id,
            "features": feature_dicts
        }
        
    except ModelNotFoundError as e:
        logger.warning(f"Model not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error retrieving feature importance: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.get(
    "/predictions/{prediction_id}/explanation",
    response_model=ExplanationResponse,
    summary="Get prediction explanation",
    description="Get detailed explanation for a prediction."
)
async def get_explanation(
    prediction_id: str = Path(..., description="The ID of the prediction"),
    detail_level: str = Query("standard", description="Level of detail for the explanation (concise, standard, detailed)"),
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Get explanation for a prediction."""
    try:
        # Get prediction first to verify patient access
        prediction = service.get_prediction(prediction_id=prediction_id)
        
        # Verify patient access
        await verify_patient_access(clinician, prediction.patient_id)
        
        # Generate explanation
        explanation = service.generate_explanation(
            prediction_id=prediction_id,
            detail_level=detail_level
        )
        
        # Return response
        return explanation
        
    except PredictionNotFoundError as e:
        logger.warning(f"Prediction not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction not found: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error generating explanation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@router.post(
    "/digital-twin/update",
    response_model=DigitalTwinUpdateResponse,
    summary="Update digital twin",
    description="Update a patient's digital twin with prediction results."
)
async def update_digital_twin(
    request: DigitalTwinUpdateRequest,
    clinician: Dict = Depends(get_current_clinician),
    service: XGBoostServiceInterface = Depends(get_xgboost_service_from_settings)
):
    """Update a patient's digital twin with prediction results."""
    # Verify patient access
    await verify_patient_access(clinician, request.patient_id)
    
    try:
        # Get all predictions to verify they exist and belong to the patient
        predictions = []
        for prediction_id in request.prediction_ids:
            prediction = service.get_prediction(prediction_id=prediction_id)
            if prediction.patient_id != request.patient_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prediction {prediction_id} belongs to a different patient"
                )
            predictions.append(prediction)
        
        # Update digital twin
        success = service.update_digital_twin(
            patient_id=request.patient_id,
            prediction_results=predictions
        )
        
        # Return response
        return {
            "patient_id": request.patient_id,
            "digital_twin_updated": success,
            "prediction_count": len(predictions),
            "timestamp": predictions[0].timestamp if predictions else None
        }
        
    except PredictionNotFoundError as e:
        logger.warning(f"Prediction not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction not found: {str(e)}"
        )
    except PatientNotFoundError as e:
        logger.warning(f"Patient not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient not found: {str(e)}"
        )
    except DigitalTwinUpdateError as e:
        logger.error(f"Error updating digital twin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Digital twin update failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error updating digital twin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )