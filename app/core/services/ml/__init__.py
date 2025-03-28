# -*- coding: utf-8 -*-
"""
ML Services Package.

This package provides mental health machine learning services including:
- MentaLLaMA: Mental health language model analysis service
- PHI Detection: Protected Health Information detection service
- Digital Twin: Patient digital twin simulation service
"""

from app.core.services.ml.factory import MLServiceFactory, MLServiceCache
from app.core.services.ml.interface import (
    DigitalTwinService,
    MentaLLaMAInterface,
    MLService,
    PHIDetectionService,
)
from app.core.services.ml.mentalllama import BaseMentaLLaMA
from app.core.services.ml.mock import MockMentaLLaMA


__all__ = [
    # Interfaces
    "MLService",
    "MentaLLaMAInterface",
    "PHIDetectionService",
    "DigitalTwinService",
    
    # Base implementations
    "BaseMentaLLaMA",
    
    # Mock implementations
    "MockMentaLLaMA",
    
    # Factory and cache
    "MLServiceFactory",
    "MLServiceCache",
]