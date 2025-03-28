# -*- coding: utf-8 -*-
"""
ML API Dependencies.

This module provides FastAPI dependencies for ML services.
"""

from functools import lru_cache
from typing import Dict, Any

from fastapi import Depends, HTTPException, status

from app.core.exceptions import InvalidConfigurationError, ServiceUnavailableError
from app.core.services.ml import (
    DigitalTwinService,
    MentaLLaMAInterface,
    MLServiceCache,
    PHIDetectionService,
)
from app.core.utils.logging import get_logger


# Create logger (no PHI logging)
logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_mentalllama_service() -> MentaLLaMAInterface:
    """
    Get a MentaLLaMA service instance.
    
    This function is cached to avoid multiple initializations.
    
    Returns:
        MentaLLaMA service instance
        
    Raises:
        HTTPException: If service initialization fails
    """
    try:
        logger.info("Getting MentaLLaMA service instance")
        return MLServiceCache.get_mentalllama_service()
    except InvalidConfigurationError as e:
        logger.error(f"MentaLLaMA service configuration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MentaLLaMA service configuration error: {str(e)}",
        )
    except ServiceUnavailableError as e:
        logger.error(f"MentaLLaMA service unavailable: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"MentaLLaMA service unavailable: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Failed to initialize MentaLLaMA service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize MentaLLaMA service: {str(e)}",
        )


@lru_cache(maxsize=1)
def get_phi_detection_service() -> PHIDetectionService:
    """
    Get a PHI detection service instance.
    
    This function is cached to avoid multiple initializations.
    
    Returns:
        PHI detection service instance
        
    Raises:
        HTTPException: If service initialization fails
    """
    try:
        logger.info("Getting PHI detection service instance")
        return MLServiceCache.get_phi_detection_service()
    except InvalidConfigurationError as e:
        logger.error(f"PHI detection service configuration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PHI detection service configuration error: {str(e)}",
        )
    except ServiceUnavailableError as e:
        logger.error(f"PHI detection service unavailable: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"PHI detection service unavailable: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Failed to initialize PHI detection service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize PHI detection service: {str(e)}",
        )


@lru_cache(maxsize=1)
def get_digital_twin_service() -> DigitalTwinService:
    """
    Get a Digital Twin service instance.
    
    This function is cached to avoid multiple initializations.
    
    Returns:
        Digital Twin service instance
        
    Raises:
        HTTPException: If service initialization fails
    """
    try:
        logger.info("Getting Digital Twin service instance")
        return MLServiceCache.get_digital_twin_service()
    except InvalidConfigurationError as e:
        logger.error(f"Digital Twin service configuration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Digital Twin service configuration error: {str(e)}",
        )
    except ServiceUnavailableError as e:
        logger.error(f"Digital Twin service unavailable: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Digital Twin service unavailable: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Failed to initialize Digital Twin service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Digital Twin service: {str(e)}",
        )


# FastAPI dependency aliases for better readability in routes
MentaLLaMAService = get_mentalllama_service
PHIDetectionServiceDep = get_phi_detection_service
DigitalTwinServiceDep = get_digital_twin_service