# -*- coding: utf-8 -*-
"""
FastAPI endpoints for biometric data integration.

This module defines the API endpoints for managing biometric data,
including adding data points, retrieving data, and analyzing trends.
"""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from fastapi.security import OAuth2PasswordBearer

from app.domain.exceptions import BiometricIntegrationError, EntityNotFoundError
from app.domain.services.biometric_integration_service import BiometricIntegrationService
from app.infrastructure.security.jwt_service import JWTService
from app.presentation.api.v1.schemas.biometric_schemas import (
    BiometricDataPointCreate,
    BiometricDataPointBatchCreate,
    BiometricDataPointResponse,
    BiometricDataPointListResponse,
    BiometricTwinResponse,
    DeviceConnectionRequest,
    DeviceDisconnectionRequest,
    TrendAnalysisResponse,
    CorrelationAnalysisRequest,
    CorrelationAnalysisResponse
)

# Create router
router = APIRouter(
    prefix="/biometrics",
    tags=["biometrics"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"description": "Unauthorized"},
        status.HTTP_403_FORBIDDEN: {"description": "Forbidden"},
        status.HTTP_404_NOT_FOUND: {"description": "Not found"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Internal server error"}
    }
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Dependency to get the current user ID from the JWT token
def get_current_user_id(
    token: str = Depends(oauth2_scheme),
    jwt_service: JWTService = Depends()
) -> UUID:
    """
    Get the current user ID from the JWT token.
    
    Args:
        token: JWT token
        jwt_service: JWT service for token validation
        
    Returns:
        UUID of the current user
        
    Raises:
        HTTPException: If the token is invalid or expired
    """
    try:
        payload = jwt_service.decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return UUID(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )


# Dependency to get the patient ID from the path parameter
def get_patient_id(
    patient_id: UUID = Path(..., description="The ID of the patient")
) -> UUID:
    """
    Get the patient ID from the path parameter.
    
    Args:
        patient_id: UUID of the patient
        
    Returns:
        UUID of the patient
    """
    return patient_id


# Dependency to get the BiometricIntegrationService
def get_biometric_service(
    # Repository would be injected here in a real implementation
) -> BiometricIntegrationService:
    """
    Get the BiometricIntegrationService instance.
    
    Returns:
        BiometricIntegrationService instance
    """
    # In a real implementation, this would use proper dependency injection
    # to get the repository and create the service
    from app.infrastructure.persistence.sqlalchemy.repositories.biometric_twin_repository import (
        SQLAlchemyBiometricTwinRepository
    )
    from sqlalchemy.orm import Session
    
    # Get database session
    from app.infrastructure.persistence.sqlalchemy.config.database import get_db
    session = next(get_db())
    
    # Create repository
    repository = SQLAlchemyBiometricTwinRepository(session=session)
    
    # Create service
    return BiometricIntegrationService(biometric_twin_repository=repository)


@router.post(
    "/patients/{patient_id}/data",
    response_model=BiometricDataPointResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a biometric data point",
    description="Add a new biometric data point to a patient's digital twin."
)
async def add_biometric_data(
    data: BiometricDataPointCreate,
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service)
):
    """
    Add a new biometric data point to a patient's digital twin.
    
    Args:
        data: Biometric data point to add
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        
    Returns:
        The created biometric data point
        
    Raises:
        HTTPException: If there's an error adding the data
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to add data for this patient
        
        # Add the data point
        data_point = biometric_service.add_biometric_data(
            patient_id=patient_id,
            data_type=data.data_type,
            value=data.value,
            source=data.source,
            timestamp=data.timestamp,
            metadata=data.metadata,
            confidence=data.confidence
        )
        
        # Convert to response model
        return BiometricDataPointResponse(
            data_id=data_point.data_id,
            data_type=data_point.data_type,
            value=data_point.value,
            timestamp=data_point.timestamp,
            source=data_point.source,
            metadata=data_point.metadata or {},
            confidence=data_point.confidence
        )
    except BiometricIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post(
    "/patients/{patient_id}/data/batch",
    response_model=BiometricDataPointListResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add multiple biometric data points",
    description="Add multiple biometric data points to a patient's digital twin in a single batch operation."
)
async def batch_add_biometric_data(
    data: BiometricDataPointBatchCreate,
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service)
):
    """
    Add multiple biometric data points to a patient's digital twin in a single batch operation.
    
    Args:
        data: Batch of biometric data points to add
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        
    Returns:
        List of created biometric data points
        
    Raises:
        HTTPException: If there's an error adding the data
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to add data for this patient
        
        # Convert to format expected by service
        batch_data = [
            {
                "data_type": point.data_type,
                "value": point.value,
                "source": point.source,
                "timestamp": point.timestamp,
                "metadata": point.metadata,
                "confidence": point.confidence
            }
            for point in data.data_points
        ]
        
        # Add the data points
        data_points = biometric_service.batch_add_biometric_data(
            patient_id=patient_id,
            data_points=batch_data
        )
        
        # Convert to response models
        response_data_points = [
            BiometricDataPointResponse(
                data_id=dp.data_id,
                data_type=dp.data_type,
                value=dp.value,
                timestamp=dp.timestamp,
                source=dp.source,
                metadata=dp.metadata or {},
                confidence=dp.confidence
            )
            for dp in data_points
        ]
        
        return BiometricDataPointListResponse(
            data_points=response_data_points,
            count=len(response_data_points)
        )
    except BiometricIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/patients/{patient_id}/data",
    response_model=BiometricDataPointListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get biometric data",
    description="Retrieve biometric data for a patient with optional filtering."
)
async def get_biometric_data(
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service),
    data_type: Optional[str] = Query(None, description="Type of data to filter by"),
    source: Optional[str] = Query(None, description="Source device to filter by"),
    start_time: Optional[datetime] = Query(None, description="Start of time range"),
    end_time: Optional[datetime] = Query(None, description="End of time range")
):
    """
    Retrieve biometric data for a patient with optional filtering.
    
    Args:
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        data_type: Optional type of data to filter by
        source: Optional source device to filter by
        start_time: Optional start of time range
        end_time: Optional end of time range
        
    Returns:
        List of matching biometric data points
        
    Raises:
        HTTPException: If there's an error retrieving the data
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to view data for this patient
        
        # Get the data points
        data_points = biometric_service.get_biometric_data(
            patient_id=patient_id,
            data_type=data_type,
            start_time=start_time,
            end_time=end_time,
            source=source
        )
        
        # Convert to response models
        response_data_points = [
            BiometricDataPointResponse(
                data_id=dp.data_id,
                data_type=dp.data_type,
                value=dp.value,
                timestamp=dp.timestamp,
                source=dp.source,
                metadata=dp.metadata or {},
                confidence=dp.confidence
            )
            for dp in data_points
        ]
        
        return BiometricDataPointListResponse(
            data_points=response_data_points,
            count=len(response_data_points)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/patients/{patient_id}/twin",
    response_model=BiometricTwinResponse,
    status_code=status.HTTP_200_OK,
    summary="Get biometric twin",
    description="Retrieve a patient's biometric twin."
)
async def get_biometric_twin(
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service)
):
    """
    Retrieve a patient's biometric twin.
    
    Args:
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        
    Returns:
        The patient's biometric twin
        
    Raises:
        HTTPException: If there's an error retrieving the twin
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to view data for this patient
        
        # Get the twin
        twin = biometric_service.get_or_create_biometric_twin(patient_id=patient_id)
        
        # Convert to response model
        return BiometricTwinResponse(
            twin_id=twin.twin_id,
            patient_id=twin.patient_id,
            created_at=twin.created_at,
            updated_at=twin.updated_at,
            baseline_established=twin.baseline_established,
            connected_devices=list(twin.connected_devices),
            data_points_count=len(twin.data_points)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post(
    "/patients/{patient_id}/devices/connect",
    response_model=BiometricTwinResponse,
    status_code=status.HTTP_200_OK,
    summary="Connect a device",
    description="Connect a biometric monitoring device to a patient's digital twin."
)
async def connect_device(
    request: DeviceConnectionRequest,
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service)
):
    """
    Connect a biometric monitoring device to a patient's digital twin.
    
    Args:
        request: Device connection request
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        
    Returns:
        The updated biometric twin
        
    Raises:
        HTTPException: If there's an error connecting the device
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to connect devices for this patient
        
        # Connect the device
        success = biometric_service.connect_device(
            patient_id=patient_id,
            device_id=request.device_id,
            device_type=request.device_type,
            connection_metadata=request.connection_metadata
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to connect device"
            )
        
        # Get the updated twin
        twin = biometric_service.get_or_create_biometric_twin(patient_id=patient_id)
        
        # Convert to response model
        return BiometricTwinResponse(
            twin_id=twin.twin_id,
            patient_id=twin.patient_id,
            created_at=twin.created_at,
            updated_at=twin.updated_at,
            baseline_established=twin.baseline_established,
            connected_devices=list(twin.connected_devices),
            data_points_count=len(twin.data_points)
        )
    except BiometricIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post(
    "/patients/{patient_id}/devices/disconnect",
    response_model=BiometricTwinResponse,
    status_code=status.HTTP_200_OK,
    summary="Disconnect a device",
    description="Disconnect a biometric monitoring device from a patient's digital twin."
)
async def disconnect_device(
    request: DeviceDisconnectionRequest,
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service)
):
    """
    Disconnect a biometric monitoring device from a patient's digital twin.
    
    Args:
        request: Device disconnection request
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        
    Returns:
        The updated biometric twin
        
    Raises:
        HTTPException: If there's an error disconnecting the device
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to disconnect devices for this patient
        
        # Disconnect the device
        success = biometric_service.disconnect_device(
            patient_id=patient_id,
            device_id=request.device_id,
            reason=request.reason
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Device not found or already disconnected"
            )
        
        # Get the updated twin
        twin = biometric_service.get_or_create_biometric_twin(patient_id=patient_id)
        
        # Convert to response model
        return BiometricTwinResponse(
            twin_id=twin.twin_id,
            patient_id=twin.patient_id,
            created_at=twin.created_at,
            updated_at=twin.updated_at,
            baseline_established=twin.baseline_established,
            connected_devices=list(twin.connected_devices),
            data_points_count=len(twin.data_points)
        )
    except EntityNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except BiometricIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/patients/{patient_id}/trends/{data_type}",
    response_model=TrendAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze trends",
    description="Analyze trends in a specific type of biometric data over time."
)
async def analyze_trends(
    data_type: str = Path(..., description="Type of biometric data to analyze"),
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service),
    window_days: int = Query(30, ge=1, le=365, description="Number of days to include in the analysis"),
    interval: str = Query("day", description="Aggregation interval ('hour', 'day', 'week')")
):
    """
    Analyze trends in a specific type of biometric data over time.
    
    Args:
        data_type: Type of biometric data to analyze
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        window_days: Number of days to include in the analysis
        interval: Aggregation interval ('hour', 'day', 'week')
        
    Returns:
        Trend analysis results
        
    Raises:
        HTTPException: If there's an error analyzing the data
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to analyze data for this patient
        
        # Analyze trends
        result = biometric_service.analyze_trends(
            patient_id=patient_id,
            data_type=data_type,
            window_days=window_days,
            interval=interval
        )
        
        # Convert to response model
        return TrendAnalysisResponse(**result)
    except BiometricIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post(
    "/patients/{patient_id}/correlations",
    response_model=CorrelationAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Detect correlations",
    description="Detect correlations between different types of biometric data."
)
async def detect_correlations(
    request: CorrelationAnalysisRequest,
    patient_id: UUID = Depends(get_patient_id),
    current_user_id: UUID = Depends(get_current_user_id),
    biometric_service: BiometricIntegrationService = Depends(get_biometric_service)
):
    """
    Detect correlations between different types of biometric data.
    
    Args:
        request: Correlation analysis request
        patient_id: ID of the patient
        current_user_id: ID of the current user
        biometric_service: BiometricIntegrationService instance
        
    Returns:
        Correlation analysis results
        
    Raises:
        HTTPException: If there's an error analyzing correlations
    """
    try:
        # In a real implementation, we would check if the current user
        # has permission to analyze data for this patient
        
        # Detect correlations
        correlations = biometric_service.detect_correlations(
            patient_id=patient_id,
            primary_data_type=request.primary_data_type,
            secondary_data_types=request.secondary_data_types,
            window_days=request.window_days
        )
        
        # Get data point counts for each type
        data_points_count = {}
        for data_type in [request.primary_data_type] + request.secondary_data_types:
            data = biometric_service.get_biometric_data(
                patient_id=patient_id,
                data_type=data_type
            )
            data_points_count[data_type] = len(data)
        
        # Create response
        return CorrelationAnalysisResponse(
            correlations=correlations,
            primary_data_type=request.primary_data_type,
            window_days=request.window_days,
            data_points_count=data_points_count
        )
    except BiometricIntegrationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )