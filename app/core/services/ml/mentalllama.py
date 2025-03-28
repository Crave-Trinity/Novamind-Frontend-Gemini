# -*- coding: utf-8 -*-
"""
MentaLLaMA Service Implementation.

This module provides a real implementation of MentaLLaMA services using AWS Bedrock
for model inference with HIPAA-compliant processing. It integrates with PHI detection
to ensure proper handling of protected health information.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.exceptions import (
    InvalidConfigurationError,
    InvalidRequestError,
    ModelNotFoundError,
    ServiceUnavailableError,
)
from app.core.services.ml.interface import MentaLLaMAInterface, PHIDetectionInterface
from app.core.utils.logging import get_logger


# Create logger (no PHI logging)
logger = get_logger(__name__)


class MentaLLaMA(MentaLLaMAInterface):
    """
    MentaLLaMA implementation using AWS Bedrock.
    
    This class provides a real implementation of MentaLLaMA services using
    AWS Bedrock for model inference. It integrates with PHI detection to
    ensure HIPAA compliance.
    """
    
    def __init__(self, phi_detection_service: Optional[PHIDetectionInterface] = None) -> None:
        """
        Initialize MentaLLaMA instance.
        
        Args:
            phi_detection_service: Optional PHI detection service for HIPAA compliance
        """
        self._initialized = False
        self._config = None
        self._bedrock_client = None
        self._model_ids = {}
        self._phi_detection_service = phi_detection_service
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """
        Initialize the service with configuration.
        
        Args:
            config: Configuration dictionary containing AWS credentials and model IDs
            
        Raises:
            InvalidConfigurationError: If configuration is invalid
        """
        try:
            self._config = config or {}
            
            # Extract configuration values
            aws_region = self._config.get("aws_region", "us-east-1")
            aws_access_key_id = self._config.get("aws_access_key_id")
            aws_secret_access_key = self._config.get("aws_secret_access_key")
            
            # Get model IDs from configuration
            self._model_ids = self._config.get("model_ids", {})
            if not self._model_ids:
                raise InvalidConfigurationError("No model IDs provided in configuration")
                
            # Required model types
            required_models = ["depression_detection"]
            missing_models = [model for model in required_models if model not in self._model_ids]
            if missing_models:
                raise InvalidConfigurationError(f"Missing model IDs for: {', '.join(missing_models)}")
            
            # Initialize AWS Bedrock client
            if aws_access_key_id and aws_secret_access_key:
                self._bedrock_client = boto3.client(
                    "bedrock-runtime",
                    region_name=aws_region,
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key
                )
            else:
                # Use IAM role or credentials from environment
                self._bedrock_client = boto3.client("bedrock-runtime", region_name=aws_region)
            
            # Initialize PHI detection service if provided
            if self._phi_detection_service and not self._phi_detection_service.is_healthy():
                self._phi_detection_service.initialize(self._config.get("phi_detection", {}))
            
            self._initialized = True
            logger.info("MentaLLaMA service initialized successfully")
            
        except (BotoCoreError, ClientError) as e:
            logger.error(f"Failed to initialize AWS Bedrock client: {str(e)}")
            self._initialized = False
            self._config = None
            self._bedrock_client = None
            raise InvalidConfigurationError(f"Failed to initialize AWS Bedrock client: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to initialize MentaLLaMA service: {str(e)}")
            self._initialized = False
            self._config = None
            self._bedrock_client = None
            raise InvalidConfigurationError(f"Failed to initialize MentaLLaMA service: {str(e)}")
    
    def is_healthy(self) -> bool:
        """
        Check if the service is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        return self._initialized and self._bedrock_client is not None
    
    def shutdown(self) -> None:
        """Shutdown the service and release resources."""
        self._initialized = False
        self._config = None
        self._bedrock_client = None
        logger.info("MentaLLaMA service shut down")
    
    def _check_service_initialized(self) -> None:
        """
        Check if the service is initialized.
        
        Raises:
            ServiceUnavailableError: If service is not initialized
        """
        if not self._initialized or not self._bedrock_client:
            raise ServiceUnavailableError("MentaLLaMA service is not initialized")
    
    def _validate_text(self, text: str) -> None:
        """
        Validate text input.
        
        Args:
            text: Text to validate
            
        Raises:
            InvalidRequestError: If text is empty or invalid
        """
        if not text or not isinstance(text, str):
            raise InvalidRequestError("Text must be a non-empty string")
    
    def _check_phi_and_redact(self, text: str) -> str:
        """
        Check for PHI in text and redact if found.
        
        Args:
            text: Text to check for PHI
            
        Returns:
            Redacted text if PHI found, original text otherwise
        """
        if not self._phi_detection_service:
            logger.warning("PHI detection service not available, proceeding without PHI check")
            return text
        
        try:
            detection_result = self._phi_detection_service.detect_phi(text)
            if detection_result.get("has_phi", False):
                logger.info("PHI detected in text, redacting before processing")
                redaction_result = self._phi_detection_service.redact_phi(text)
                return redaction_result.get("redacted_text", text)
            return text
        except Exception as e:
            logger.warning(f"Error during PHI detection: {str(e)}")
            return text
    
    def process(
        self, 
        text: str,
        model_type: Optional[str] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process text using the MentaLLaMA model.
        
        Args:
            text: Text to process
            model_type: Type of model to use
            options: Additional processing options
            
        Returns:
            Processing results
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If text is empty or invalid
            ModelNotFoundError: If model type is not found
        """
        self._check_service_initialized()
        self._validate_text(text)
        
        # Default to general model type if not specified
        model_type = model_type or "depression_detection"
        options = options or {}
        
        # Check if model type is supported
        if model_type not in self._model_ids:
            raise ModelNotFoundError(f"Model type not found: {model_type}")
        
        # Get model ID for the specified model type
        model_id = self._model_ids[model_type]
        
        # Check for PHI and redact if found
        safe_text = self._check_phi_and_redact(text)
        
        # Create prompt for model type
        if model_type == "depression_detection":
            prompt = self._create_depression_detection_prompt(safe_text)
        else:
            prompt = f"Human: {safe_text}\n\nAssistant:"
        
        # Extract options
        temperature = options.get("temperature", 0.5)
        max_tokens = options.get("max_tokens", 1000)
        
        # Invoke model
        return self._invoke_bedrock_model(model_id, prompt, model_type, temperature, max_tokens)
    
    def detect_depression(
        self, 
        text: str,
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Detect depression signals in text.
        
        Args:
            text: Text to analyze
            options: Additional processing options
            
        Returns:
            Depression detection results
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            InvalidRequestError: If text is empty or invalid
        """
        self._check_service_initialized()
        self._validate_text(text)
        
        # Check for PHI and redact if found
        safe_text = self._check_phi_and_redact(text)
        
        options = options or {}
        
        # Process with depression detection model
        return self.process(safe_text, "depression_detection", options)
    
    def _invoke_bedrock_model(
        self, 
        model_id: str, 
        prompt: str,
        model_type: str,
        temperature: float = 0.5,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Invoke AWS Bedrock model.
        
        Args:
            model_id: Bedrock model ID
            prompt: Prompt to send to the model
            model_type: Type of model being invoked
            temperature: Temperature parameter for model generation
            max_tokens: Maximum tokens to generate
            
        Returns:
            Model response
            
        Raises:
            ServiceUnavailableError: If service is not initialized
            ModelNotFoundError: If model cannot be invoked
        """
        self._check_service_initialized()
        
        try:
            # Common request structure for Claude models
            request_body = {
                "prompt": prompt,
                "temperature": temperature,
                "max_tokens_to_sample": max_tokens,
                "top_p": 0.9,
            }
            
            # Send request to Bedrock
            response = self._bedrock_client.invoke_model(
                modelId=model_id,
                body=json.dumps(request_body)
            )
            
            # Parse response
            response_body = json.loads(response["body"].read())
            
            # Format the response based on model type
            formatted_response = self._format_response_by_model_type(response_body, model_type, model_id)
            return formatted_response
            
        except (BotoCoreError, ClientError) as e:
            logger.error(f"Error invoking Bedrock model: {str(e)}")
            raise ServiceUnavailableError(f"Error invoking Bedrock model: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during model invocation: {str(e)}")
            raise ServiceUnavailableError(f"Unexpected error during model invocation: {str(e)}")
    
    def _format_response_by_model_type(
        self, 
        response_body: Dict[str, Any], 
        model_type: str,
        model_id: str
    ) -> Dict[str, Any]:
        """
        Format model response based on model type.
        
        Args:
            response_body: Raw response from Bedrock
            model_type: Type of model
            model_id: ID of the model used
            
        Returns:
            Formatted response
        """
        # Extract the completion/response
        if "completion" in response_body:
            content = response_body["completion"]
        elif "response" in response_body:
            content = response_body["response"]
        else:
            content = str(response_body)  # Fallback
        
        # Basic response structure
        formatted_response = {
            "model": model_id,
            "model_type": model_type,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Model-specific formatting
        if model_type == "depression_detection":
            # Try to parse structured output from the model
            try:
                data = json.loads(content) if isinstance(content, str) and content.strip().startswith("{") else {}
                formatted_response.update({
                    "depression_signals": data.get("depression_signals", {}),
                    "analysis": data.get("analysis", {}),
                    "recommendations": data.get("recommendations", {})
                })
            except json.JSONDecodeError:
                # If not valid JSON, use content as plain text
                formatted_response["content"] = content
                formatted_response["depression_signals"] = {
                    "severity": "unknown",
                    "confidence": 0.0,
                    "key_indicators": []
                }
                formatted_response["analysis"] = {"summary": "Failed to parse structured output"}
                formatted_response["recommendations"] = {"suggested_assessments": [], "discussion_points": []}
        else:
            # Default: just add content
            formatted_response["content"] = content
        
        return formatted_response
    
    def _create_depression_detection_prompt(self, text: str) -> str:
        """
        Create a prompt for depression detection.
        
        Args:
            text: Text to analyze
            
        Returns:
            Prompt for depression detection
        """
        prompt = f"""Human: As a licensed clinical psychologist specializing in depression assessment, analyze the following text for signs of depression. 
Provide analysis in the following JSON structure:

{{
  "depression_signals": {{
    "severity": "[none|mild|moderate|severe]",
    "confidence": [0.0-1.0],
    "key_indicators": [
      {{
        "type": "[linguistic|behavioral|cognitive]",
        "description": "brief description of indicator",
        "evidence": "quoted text supporting this indicator"
      }}
    ]
  }},
  "analysis": {{
    "summary": "brief overall assessment",
    "warning_signs": ["list", "of", "warning signs"],
    "protective_factors": ["list", "of", "protective factors"],
    "limitations": ["list", "of", "analysis limitations"]
  }},
  "recommendations": {{
    "suggested_assessments": ["assessment tools"],
    "discussion_points": ["clinical discussion points"]
  }}
}}

Text to analyze:
{text}

Provide ONLY the JSON response with no additional comments.
"""
        return prompt
