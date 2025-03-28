# -*- coding: utf-8 -*-
"""
API Dependencies Module.

This module provides FastAPI dependency functions for injecting
services and repositories into API routes.
"""

from typing import AsyncGenerator

from fastapi import Depends

from app.core.config.ml_settings import ml_settings
from app.infrastructure.ml.mentallama import MentaLLaMAService
from app.infrastructure.ml.phi_detection import PhiDetectionService
from app.infrastructure.ml.digital_twin_integration_service import DigitalTwinIntegrationService


# Dependency for PHI Detection Service
async def get_phi_detection_service() -> AsyncGenerator[PhiDetectionService, None]:
    """
    Provide a PHI detection service instance.
    
    This dependency creates and initializes a PHI detection service
    for use in routes that need to detect and anonymize PHI.
    
    Yields:
        PHI detection service instance
    """
    service = PhiDetectionService(
        rules_path=ml_settings.PHI_DETECTION_RULES_PATH
    )
    
    yield service


# Dependency for MentaLLaMA Service
async def get_mentallama_service(
    phi_detection_service: PhiDetectionService = Depends(get_phi_detection_service)
) -> AsyncGenerator[MentaLLaMAService, None]:
    """
    Provide a MentaLLaMA service instance.
    
    This dependency creates and initializes a MentaLLaMA service
    for clinical text analysis, using PHI detection for HIPAA compliance.
    
    Args:
        phi_detection_service: PHI detection service for anonymizing PHI
        
    Yields:
        MentaLLaMA service instance
    """
    service = MentaLLaMAService(
        phi_detection_service=phi_detection_service,
        model_path=ml_settings.MENTALLAMA_MODEL_PATH
    )
    
    # Initialize the service
    await service.initialize()
    
    try:
        yield service
    finally:
        # Clean up resources
        await service.close()


# Dependency for Digital Twin Service
async def get_digital_twin_service(
    mentallama_service: MentaLLaMAService = Depends(get_mentallama_service)
) -> AsyncGenerator[DigitalTwinIntegrationService, None]:
    """
    Provide a Digital Twin service instance.
    
    This dependency creates and initializes a Digital Twin service
    for patient digital twin creation and simulation.
    
    Args:
        mentallama_service: MentaLLaMA service for clinical text analysis
        
    Yields:
        Digital Twin service instance
    """
    service = DigitalTwinIntegrationService(
        mentallama_service=mentallama_service,
        storage_path=ml_settings.DIGITAL_TWIN_STORAGE_PATH
    )
    
    # Initialize the service
    await service.initialize()
    
    try:
        yield service
    finally:
        # Clean up resources
        await service.close()