"""
Physical Activity Tracking (PAT) service package.

This package provides interfaces and implementations for analyzing
actigraphy data, generating embeddings, and integrating with
digital twin profiles.
"""

from app.core.services.ml.pat.exceptions import (
    AnalysisError,
    AuthorizationError,
    EmbeddingError,
    InitializationError,
    IntegrationError,
    PATServiceError,
    ResourceNotFoundError,
    ValidationError,
)
from app.core.services.ml.pat.factory import PATServiceFactory
from app.core.services.ml.pat.interface import PATInterface
from app.core.services.ml.pat.mock import MockPATService

# Conditionally import AWS implementation if available
try:
    from app.core.services.ml.pat.aws import AWSPATService
    __all__ = [
        "AnalysisError",
        "AuthorizationError",
        "AWSPATService",
        "EmbeddingError",
        "InitializationError",
        "IntegrationError",
        "MockPATService",
        "PATInterface",
        "PATServiceError",
        "PATServiceFactory",
        "ResourceNotFoundError",
        "ValidationError",
    ]
except ImportError:
    __all__ = [
        "AnalysisError",
        "AuthorizationError",
        "EmbeddingError",
        "InitializationError",
        "IntegrationError",
        "MockPATService",
        "PATInterface",
        "PATServiceError",
        "PATServiceFactory",
        "ResourceNotFoundError",
        "ValidationError",
    ]