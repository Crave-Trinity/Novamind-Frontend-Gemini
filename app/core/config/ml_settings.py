# -*- coding: utf-8 -*-
"""
ML Services Configuration.

This module provides configuration settings for ML services.
"""

import os
from typing import Any, Dict, List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class MentaLLaMASettings(BaseSettings):
    """Configuration settings for MentaLLaMA service."""
    
    model_config = SettingsConfigDict(
        env_prefix="MENTALLLAMA_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        validate_default=True,
    )
    
    # Provider settings
    PROVIDER: str = Field(
        "bedrock",
        description="ML provider (bedrock, openai, vertex, huggingface, mock)"
    )
    DEFAULT_MODEL: str = Field(
        "mentallama-33b-lora",
        description="Default model to use"
    )
    
    # Cache settings
    CACHE_RESULTS: bool = Field(
        True,
        description="Cache results to improve performance and reduce costs"
    )
    CACHE_TTL_SECONDS: int = Field(
        3600,
        description="Time-to-live for cached results in seconds (1 hour default)"
    )
    
    # Bedrock provider settings
    AWS_REGION: str = Field(
        "us-east-1",
        description="AWS region for Bedrock"
    )
    AWS_PROFILE: Optional[str] = Field(
        None,
        description="AWS profile to use (optional)"
    )
    AWS_ENDPOINT_URL: Optional[str] = Field(
        None,
        description="Custom endpoint URL for Bedrock (optional)"
    )
    MAX_RETRIES: int = Field(
        3,
        description="Maximum number of retries for AWS API calls"
    )
    TIMEOUT_SECONDS: int = Field(
        60,
        description="Timeout in seconds for AWS API calls"
    )
    
    # Model settings
    MAX_TOKENS: int = Field(
        2048,
        description="Default maximum tokens to generate"
    )
    TEMPERATURE: float = Field(
        0.7,
        description="Default sampling temperature"
    )
    
    # HIPAA compliance settings
    PHI_SAFETY_FILTER: bool = Field(
        True,
        description="Enable automated PHI detection and filtering"
    )
    PHI_SAFETY_LEVEL: str = Field(
        "high",
        description="PHI safety level (low, medium, high)"
    )
    LOG_REQUEST_RESPONSE: bool = Field(
        False,
        description="Log request/response content (DISABLE IN PRODUCTION)"
    )
    
    # Specialized models for different tasks
    DEPRESSION_DETECTION_MODEL: str = Field(
        "mentallama-33b-lora",
        description="Model for depression detection"
    )
    RISK_ASSESSMENT_MODEL: str = Field(
        "mentallama-33b-lora",
        description="Model for risk assessment"
    )
    SENTIMENT_ANALYSIS_MODEL: str = Field(
        "mentallama-13b-lora",
        description="Model for sentiment analysis"
    )
    WELLNESS_DIMENSIONS_MODEL: str = Field(
        "mentallama-33b-lora",
        description="Model for wellness dimensions analysis"
    )
    
    def get_provider_config(self) -> Dict[str, Any]:
        """
        Get provider-specific configuration.
        
        Returns:
            Dict containing provider configuration
        """
        config = {
            "provider": self.PROVIDER,
            "default_model": self.DEFAULT_MODEL,
            "cache_results": self.CACHE_RESULTS,
            "cache_ttl_seconds": self.CACHE_TTL_SECONDS,
            "max_tokens": self.MAX_TOKENS,
            "temperature": self.TEMPERATURE,
            "phi_safety_filter": self.PHI_SAFETY_FILTER,
            "phi_safety_level": self.PHI_SAFETY_LEVEL,
            "log_request_response": self.LOG_REQUEST_RESPONSE,
            
            # Task-specific models
            "models": {
                "depression_detection": self.DEPRESSION_DETECTION_MODEL,
                "risk_assessment": self.RISK_ASSESSMENT_MODEL,
                "sentiment_analysis": self.SENTIMENT_ANALYSIS_MODEL,
                "wellness_dimensions": self.WELLNESS_DIMENSIONS_MODEL,
            },
        }
        
        # Add provider-specific settings
        if self.PROVIDER == "bedrock":
            config.update({
                "aws_region": self.AWS_REGION,
                "aws_profile": self.AWS_PROFILE,
                "aws_endpoint_url": self.AWS_ENDPOINT_URL,
                "max_retries": self.MAX_RETRIES,
                "timeout_seconds": self.TIMEOUT_SECONDS,
            })
        
        return config


class PHIDetectionSettings(BaseSettings):
    """Configuration settings for PHI detection service."""
    
    model_config = SettingsConfigDict(
        env_prefix="PHI_DETECTION_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        validate_default=True,
    )
    
    # Provider settings
    PROVIDER: str = Field(
        "bedrock",
        description="PHI detection provider (bedrock, openai, vertex, huggingface, mock)"
    )
    DEFAULT_MODEL: str = Field(
        "phi-detection-large",
        description="Default model to use for PHI detection"
    )
    
    # Cache settings
    CACHE_RESULTS: bool = Field(
        True,
        description="Cache results to improve performance and reduce costs"
    )
    CACHE_TTL_SECONDS: int = Field(
        3600,
        description="Time-to-live for cached results in seconds (1 hour default)"
    )
    
    # Bedrock provider settings
    AWS_REGION: str = Field(
        "us-east-1",
        description="AWS region for Bedrock"
    )
    AWS_PROFILE: Optional[str] = Field(
        None,
        description="AWS profile to use (optional)"
    )
    AWS_ENDPOINT_URL: Optional[str] = Field(
        None,
        description="Custom endpoint URL for Bedrock (optional)"
    )
    MAX_RETRIES: int = Field(
        3,
        description="Maximum number of retries for AWS API calls"
    )
    TIMEOUT_SECONDS: int = Field(
        30,
        description="Timeout in seconds for AWS API calls"
    )
    
    # PHI detection settings
    DEFAULT_SENSITIVITY: float = Field(
        0.8,
        description="Default detection sensitivity (0.0-1.0)"
    )
    DEFAULT_CATEGORIES: List[str] = Field(
        [
            "NAME", "DATE", "PHONE", "ADDRESS", "EMAIL", "ID", "URL", "AGE", 
            "SSN", "MRN", "HEALTH_PLAN", "ACCOUNT", "LICENSE", "VEHICLE", 
            "DEVICE", "IP", "BIOMETRIC", "PHOTO", "PROFESSION", "LOCATION", 
            "FAX", "ZIP"
        ],
        description="Default PHI categories to detect"
    )
    
    def get_provider_config(self) -> Dict[str, Any]:
        """
        Get provider-specific configuration.
        
        Returns:
            Dict containing provider configuration
        """
        config = {
            "provider": self.PROVIDER,
            "default_model": self.DEFAULT_MODEL,
            "cache_results": self.CACHE_RESULTS,
            "cache_ttl_seconds": self.CACHE_TTL_SECONDS,
            "default_sensitivity": self.DEFAULT_SENSITIVITY,
            "categories": self.DEFAULT_CATEGORIES,
        }
        
        # Add provider-specific settings
        if self.PROVIDER == "bedrock":
            config.update({
                "aws_region": self.AWS_REGION,
                "aws_profile": self.AWS_PROFILE,
                "aws_endpoint_url": self.AWS_ENDPOINT_URL,
                "max_retries": self.MAX_RETRIES,
                "timeout_seconds": self.TIMEOUT_SECONDS,
            })
        
        return config


class DigitalTwinSettings(BaseSettings):
    """Configuration settings for Digital Twin service."""
    
    model_config = SettingsConfigDict(
        env_prefix="DIGITAL_TWIN_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        validate_default=True,
    )
    
    # Provider settings
    PROVIDER: str = Field(
        "bedrock",
        description="Digital Twin provider (bedrock, openai, vertex, huggingface, mock)"
    )
    DEFAULT_MODEL: str = Field(
        "digitaltwin-standard",
        description="Default model to use for Digital Twin"
    )
    
    # Cache settings
    CACHE_RESULTS: bool = Field(
        True,
        description="Cache results to improve performance and reduce costs"
    )
    CACHE_TTL_SECONDS: int = Field(
        3600,
        description="Time-to-live for cached results in seconds (1 hour default)"
    )
    
    # Bedrock provider settings
    AWS_REGION: str = Field(
        "us-east-1",
        description="AWS region for Bedrock"
    )
    AWS_PROFILE: Optional[str] = Field(
        None,
        description="AWS profile to use (optional)"
    )
    AWS_ENDPOINT_URL: Optional[str] = Field(
        None,
        description="Custom endpoint URL for Bedrock (optional)"
    )
    MAX_RETRIES: int = Field(
        3,
        description="Maximum number of retries for AWS API calls"
    )
    TIMEOUT_SECONDS: int = Field(
        60,
        description="Timeout in seconds for AWS API calls"
    )
    
    # Digital Twin settings
    DEFAULT_TEMPERATURE: float = Field(
        0.7,
        description="Default simulation temperature"
    )
    DEFAULT_MAX_TOKENS: int = Field(
        2000,
        description="Default maximum tokens for simulation"
    )
    
    # HIPAA compliance settings
    PHI_SAFETY_FILTER: bool = Field(
        True,
        description="Enable automated PHI detection and filtering"
    )
    LOG_REQUEST_RESPONSE: bool = Field(
        False,
        description="Log request/response content (DISABLE IN PRODUCTION)"
    )
    
    def get_provider_config(self) -> Dict[str, Any]:
        """
        Get provider-specific configuration.
        
        Returns:
            Dict containing provider configuration
        """
        config = {
            "provider": self.PROVIDER,
            "default_model": self.DEFAULT_MODEL,
            "cache_results": self.CACHE_RESULTS,
            "cache_ttl_seconds": self.CACHE_TTL_SECONDS,
            "default_temperature": self.DEFAULT_TEMPERATURE,
            "default_max_tokens": self.DEFAULT_MAX_TOKENS,
            "phi_safety_filter": self.PHI_SAFETY_FILTER,
            "log_request_response": self.LOG_REQUEST_RESPONSE,
        }
        
        # Add provider-specific settings
        if self.PROVIDER == "bedrock":
            config.update({
                "aws_region": self.AWS_REGION,
                "aws_profile": self.AWS_PROFILE,
                "aws_endpoint_url": self.AWS_ENDPOINT_URL,
                "max_retries": self.MAX_RETRIES,
                "timeout_seconds": self.TIMEOUT_SECONDS,
            })
        
        return config


# Create singleton instances
mentalllama_settings = MentaLLaMASettings()
phi_detection_settings = PHIDetectionSettings()
digital_twin_settings = DigitalTwinSettings()