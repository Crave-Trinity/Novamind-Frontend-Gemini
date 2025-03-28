# -*- coding: utf-8 -*-
"""
ML Exceptions Module.

This module defines custom exceptions for machine learning services,
including MentaLLaMA, PHI detection, and Digital Twin.
"""

from typing import Dict, Any, Optional


class MLException(Exception):
    """Base exception for all ML-related exceptions."""
    
    def __init__(
        self, 
        message: str, 
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize ML exception.
        
        Args:
            message: Error message
            details: Additional error details
        """
        self.message = message
        self.details = details or {}
        super().__init__(message)


# ============================================================================
# MentaLLaMA Exceptions
# ============================================================================

class MentaLLaMAException(MLException):
    """Base exception for MentaLLaMA-related errors."""
    pass


class MentaLLaMAConnectionError(MentaLLaMAException):
    """Exception raised when connection to MentaLLaMA API fails."""
    pass


class MentaLLaMATimeoutError(MentaLLaMAException):
    """Exception raised when MentaLLaMA request times out."""
    pass


class MentaLLaMAInvalidInputError(MentaLLaMAException):
    """Exception raised when input to MentaLLaMA is invalid."""
    pass


class MentaLLaMAAuthenticationError(MentaLLaMAException):
    """Exception raised when authentication to MentaLLaMA API fails."""
    pass


class MentaLLaMAQuotaExceededError(MentaLLaMAException):
    """Exception raised when MentaLLaMA API quota is exceeded."""
    pass


# ============================================================================
# PHI Detection Exceptions
# ============================================================================

class PHIDetectionException(MLException):
    """Base exception for PHI detection-related errors."""
    pass


class PHIConfigurationError(PHIDetectionException):
    """Exception raised when PHI detection configuration is invalid."""
    pass


class PHIPatternError(PHIDetectionException):
    """Exception raised when a PHI pattern is invalid."""
    pass


# ============================================================================
# Digital Twin Exceptions
# ============================================================================

class DigitalTwinException(MLException):
    """Base exception for Digital Twin-related errors."""
    pass


class DigitalTwinStorageError(DigitalTwinException):
    """Exception raised when Digital Twin storage fails."""
    pass


class DigitalTwinQueryError(DigitalTwinException):
    """Exception raised when Digital Twin query fails."""
    pass


class DigitalTwinInsightError(DigitalTwinException):
    """Exception raised when Digital Twin insight generation fails."""
    pass


class DigitalTwinConfigurationError(DigitalTwinException):
    """Exception raised when Digital Twin configuration is invalid."""
    pass