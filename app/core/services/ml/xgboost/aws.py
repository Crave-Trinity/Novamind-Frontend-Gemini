"""
AWS implementation of the XGBoost service interface.

This module provides an implementation of the XGBoost service
that uses AWS SageMaker for model inference, DynamoDB for storage,
and Lambda for digital twin integration.
"""

import json
import logging
import time
import re
from typing import Dict, List, Any, Optional, Set, Union
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

from app.core.services.ml.xgboost.interface import (
    XGBoostInterface,
    ModelType,
    EventType,
    Observer,
    PrivacyLevel
)
from app.core.services.ml.xgboost.exceptions import (
    ValidationError,
    DataPrivacyError,
    ResourceNotFoundError,
    ModelNotFoundError,
    PredictionError,
    ServiceConnectionError,
    ConfigurationError
)


class AWSXGBoostService(XGBoostInterface):
    """AWS implementation of the XGBoost service interface."""
    
    def __init__(self):
        """Initialize a new AWS XGBoost service."""
        super().__init__()
        
        # AWS clients
        self._sagemaker_runtime = None
        self._dynamodb = None
        self._lambda_client = None
        
        # Configuration
        self._model_endpoints = {}
        self._predictions_table = None
        self._digital_twin_function = None
        self._region_name = None
        self._privacy_level = PrivacyLevel.STANDARD
        
        # PHI patterns for different privacy levels
        self._phi_patterns = self._initialize_phi_patterns()
        
        # Observers for event notifications
        self._observers = {}
        
        # Logger
        self._logger = logging.getLogger(__name__)
    
    def initialize(self, config: Dict[str, Any]) -> None:
        """
        Initialize the AWS XGBoost service with configuration.
        
        Args:
            config: Configuration dictionary
            
        Raises:
            ConfigurationError: If configuration is invalid
        """
        try:
            # Configure logging
            log_level = config.get("log_level", "INFO")
            numeric_level = getattr(logging, log_level.upper(), None)
            if not isinstance(numeric_level, int):
                raise ConfigurationError(
                    f"Invalid log level: {log_level}",
                    field="log_level",
                    value=log_level
                )
            
            self._logger.setLevel(numeric_level)
            
            # Set region
            self._region_name = config.get("region_name", "us-east-1")
            
            # Set privacy level
            privacy_level = config.get("privacy_level", PrivacyLevel.STANDARD)
            if not isinstance(privacy_level, PrivacyLevel):
                raise ConfigurationError(
                    f"Invalid privacy level: {privacy_level}",
                    field="privacy_level",
                    value=privacy_level
                )
            self._privacy_level = privacy_level
            
            # Set model endpoints
            self._model_endpoints = config.get("model_endpoints", {})
            
            # Set predictions table name
            self._predictions_table = config.get("predictions_table")
            
            # Set digital twin function name
            self._digital_twin_function = config.get("digital_twin_function")
            
            # Initialize AWS clients
            self._initialize_aws_clients()
            
            # Check if DynamoDB table exists if table name is provided
            if self._predictions_table and self._dynamodb:
                try:
                    table = self._dynamodb.Table(self._predictions_table)
                    table.table_status  # This will raise an exception if the table doesn't exist
                except ClientError as e:
                    error_code = e.response.get("Error", {}).get("Code")
                    if error_code == "ResourceNotFoundException":
                        self._logger.warning(f"DynamoDB table {self._predictions_table} not found")
            
            # Mark as initialized
            self._initialized = True
            
            # Notify observers
            self._notify_observers(EventType.INITIALIZATION, {"status": "initialized"})
            
            self._logger.info("AWS XGBoost service initialized successfully")
        except Exception as e:
            self._logger.error(f"Failed to initialize AWS XGBoost service: {e}")
            if isinstance(e, ConfigurationError):
                raise
            else:
                raise ConfigurationError(
                    f"Failed to initialize AWS XGBoost service: {str(e)}",
                    details=str(e)
                )
    
    def register_observer(self, event_type: Union[EventType, str], observer: Observer) -> None:
        """
        Register an observer for a specific event type.
        
        Args:
            event_type: Type of event to observe, or "*" for all events
            observer: Observer to register
        """
        event_key = event_type
        if event_key not in self._observers:
            self._observers[event_key] = set()
        self._observers[event_key].add(observer)
        self._logger.debug(f"Observer registered for event type {event_type}")
    
    def unregister_observer(self, event_type: Union[EventType, str], observer: Observer) -> None:
        """
        Unregister an observer for a specific event type.
        
        Args:
            event_type: Type of event to stop observing
            observer: Observer to unregister
        """
        event_key = event_type
        if event_key in self._observers:
            self._observers[event_key].discard(observer)
            if not self._observers[event_key]:
                del self._observers[event_key]
            self._logger.debug(f"Observer unregistered for event type {event_type}")
    
    def predict_risk(
        self,
        patient_id: str,
        risk_type: str,
        clinical_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Predict risk level using a risk model.
        
        Args:
            patient_id: Patient identifier
            risk_type: Type of risk to predict
            clinical_data: Clinical data for prediction
            **kwargs: Additional prediction parameters
            
        Returns:
            Risk prediction result
            
        Raises:
            ValidationError: If parameters are invalid
            DataPrivacyError: If PHI is detected in data
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to SageMaker fails
        """
        self._ensure_initialized()
        
        # Validate parameters
        self._validate_risk_type(risk_type)
        
        # Check for PHI in data
        self._check_phi_in_data(clinical_data)
        
        # Prepare request data
        model_type = f"{risk_type}-risk"
        time_frame_days = kwargs.get("time_frame_days", 30)
        
        request_data = {
            "patient_id": patient_id,
            "risk_type": risk_type,
            "time_frame_days": time_frame_days,
            "clinical_data": clinical_data
        }
        
        # Invoke SageMaker endpoint
        try:
            self._logger.info(f"Predicting {risk_type} risk for patient {self._anonymize_id(patient_id)}")
            result = self._invoke_sagemaker_endpoint(model_type, request_data)
            
            # Store prediction in DynamoDB
            if self._predictions_table:
                self._store_prediction(result, model_type)
            
            # Notify observers
            self._notify_observers(EventType.PREDICTION, {
                "prediction_type": "risk",
                "risk_type": risk_type,
                "patient_id": patient_id,
                "prediction_id": result.get("prediction_id")
            })
            
            return result
            
        except (ClientError, ConnectionError, json.JSONDecodeError) as e:
            if isinstance(e, ClientError):
                aws_error = self._handle_aws_error(e, "predict_risk")
                raise aws_error
            elif isinstance(e, json.JSONDecodeError):
                raise PredictionError(
                    f"Failed to decode prediction result: {str(e)}",
                    model_type=model_type
                )
            else:
                raise ServiceConnectionError(
                    f"Failed to connect to SageMaker: {str(e)}",
                    service="SageMaker",
                    error_type=type(e).__name__
                )
    
    def predict_treatment_response(
        self,
        patient_id: str,
        treatment_type: str,
        treatment_details: Dict[str, Any],
        clinical_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Predict response to a psychiatric treatment.
        
        Args:
            patient_id: Patient identifier
            treatment_type: Type of treatment (e.g., medication_ssri)
            treatment_details: Treatment details
            clinical_data: Clinical data for prediction
            **kwargs: Additional prediction parameters
            
        Returns:
            Treatment response prediction result
            
        Raises:
            ValidationError: If parameters are invalid
            DataPrivacyError: If PHI is detected in data
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to SageMaker fails
        """
        self._ensure_initialized()
        
        # Validate parameters
        self._validate_treatment_type(treatment_type, treatment_details)
        
        # Check for PHI in data
        self._check_phi_in_data(clinical_data)
        self._check_phi_in_data(treatment_details)
        
        # Prepare request data
        model_type = f"{treatment_type}-response"
        
        request_data = {
            "patient_id": patient_id,
            "treatment_type": treatment_type,
            "treatment_details": treatment_details,
            "clinical_data": clinical_data
        }
        
        # Add optional parameters
        if "prediction_horizon" in kwargs:
            request_data["prediction_horizon"] = kwargs["prediction_horizon"]
        
        # Invoke SageMaker endpoint
        try:
            self._logger.info(f"Predicting {treatment_type} response for patient {self._anonymize_id(patient_id)}")
            result = self._invoke_sagemaker_endpoint(model_type, request_data)
            
            # Store prediction in DynamoDB
            if self._predictions_table:
                self._store_prediction(result, model_type)
            
            # Notify observers
            self._notify_observers(EventType.PREDICTION, {
                "prediction_type": "treatment_response",
                "treatment_type": treatment_type,
                "patient_id": patient_id,
                "prediction_id": result.get("prediction_id")
            })
            
            return result
            
        except (ClientError, ConnectionError, json.JSONDecodeError) as e:
            if isinstance(e, ClientError):
                aws_error = self._handle_aws_error(e, "predict_treatment_response")
                raise aws_error
            elif isinstance(e, json.JSONDecodeError):
                raise PredictionError(
                    f"Failed to decode prediction result: {str(e)}",
                    model_type=model_type
                )
            else:
                raise ServiceConnectionError(
                    f"Failed to connect to SageMaker: {str(e)}",
                    service="SageMaker",
                    error_type=type(e).__name__
                )
    
    def predict_outcome(
        self,
        patient_id: str,
        outcome_timeframe: Dict[str, int],
        clinical_data: Dict[str, Any],
        treatment_plan: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Predict clinical outcomes based on treatment plan.
        
        Args:
            patient_id: Patient identifier
            outcome_timeframe: Timeframe for outcome prediction
            clinical_data: Clinical data for prediction
            treatment_plan: Treatment plan details
            **kwargs: Additional prediction parameters
            
        Returns:
            Outcome prediction result
            
        Raises:
            ValidationError: If parameters are invalid
            DataPrivacyError: If PHI is detected in data
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to SageMaker fails
        """
        self._ensure_initialized()
        
        # Validate parameters
        self._validate_outcome_params(outcome_timeframe)
        
        # Check for PHI in data
        self._check_phi_in_data(clinical_data)
        self._check_phi_in_data(treatment_plan)
        
        # Prepare request data
        outcome_type = kwargs.get("outcome_type", "symptom")
        model_type = f"{outcome_type}-outcome"
        
        # Convert timeframe to days for consistent representation
        time_frame_days = 0
        if "days" in outcome_timeframe:
            time_frame_days += outcome_timeframe["days"]
        if "weeks" in outcome_timeframe:
            time_frame_days += outcome_timeframe["weeks"] * 7
        if "months" in outcome_timeframe:
            time_frame_days += outcome_timeframe["months"] * 30
        
        request_data = {
            "patient_id": patient_id,
            "outcome_type": outcome_type,
            "time_frame_days": time_frame_days,
            "clinical_data": clinical_data,
            "treatment_plan": treatment_plan
        }
        
        # Invoke SageMaker endpoint
        try:
            self._logger.info(f"Predicting {outcome_type} outcome for patient {self._anonymize_id(patient_id)}")
            result = self._invoke_sagemaker_endpoint(model_type, request_data)
            
            # Add time frame days to result
            result["time_frame_days"] = time_frame_days
            
            # Store prediction in DynamoDB
            if self._predictions_table:
                self._store_prediction(result, model_type)
            
            # Notify observers
            self._notify_observers(EventType.PREDICTION, {
                "prediction_type": "outcome",
                "outcome_type": outcome_type,
                "patient_id": patient_id,
                "prediction_id": result.get("prediction_id")
            })
            
            return result
            
        except (ClientError, ConnectionError, json.JSONDecodeError) as e:
            if isinstance(e, ClientError):
                aws_error = self._handle_aws_error(e, "predict_outcome")
                raise aws_error
            elif isinstance(e, json.JSONDecodeError):
                raise PredictionError(
                    f"Failed to decode prediction result: {str(e)}",
                    model_type=model_type
                )
            else:
                raise ServiceConnectionError(
                    f"Failed to connect to SageMaker: {str(e)}",
                    service="SageMaker",
                    error_type=type(e).__name__
                )
    
    def get_feature_importance(
        self,
        patient_id: str,
        model_type: str,
        prediction_id: str
    ) -> Dict[str, Any]:
        """
        Get feature importance for a prediction.
        
        Args:
            patient_id: Patient identifier
            model_type: Type of model
            prediction_id: Prediction identifier
            
        Returns:
            Feature importance data
            
        Raises:
            ResourceNotFoundError: If prediction not found
            ValidationError: If parameters are invalid
            ServiceConnectionError: If connection to DynamoDB fails
        """
        self._ensure_initialized()
        
        # Check if DynamoDB is configured
        if not self._dynamodb or not self._predictions_table:
            raise ConfigurationError(
                "DynamoDB not configured for predictions storage",
                field="predictions_table"
            )
        
        try:
            self._logger.info(f"Getting feature importance for prediction {prediction_id}")
            
            # Get prediction data from DynamoDB
            table = self._dynamodb.Table(self._predictions_table)
            response = table.get_item(Key={"prediction_id": prediction_id})
            
            # Check if prediction exists
            if "Item" not in response:
                raise ResourceNotFoundError(
                    f"Prediction not found: {prediction_id}",
                    resource_type="prediction",
                    resource_id=prediction_id
                )
            
            item = response["Item"]
            
            # Verify patient ID
            if item.get("patient_id") != patient_id:
                raise ValidationError(
                    "Patient ID mismatch",
                    field="patient_id",
                    value=patient_id
                )
            
            # Parse prediction data
            prediction_data = json.loads(item.get("data", "{}"))
            
            # Extract features and their values
            features = prediction_data.get("features", {})
            
            # Generate feature importance
            # In a real implementation, this would use a SHAP or similar method
            # For now, we'll generate a mock importance based on the features
            feature_importance = {}
            
            # Sort features by name for consistent results
            sorted_features = sorted(features.items(), key=lambda x: x[0])
            
            # Generate mock feature importance based on feature values
            # Higher absolute values = higher importance
            for i, (feature, value) in enumerate(sorted_features):
                # Generate a deterministic importance value based on the feature name and value
                # This is just for demonstration - real importance would come from the model
                if isinstance(value, (int, float)):
                    importance = (value / 10.0) * 0.8 + 0.2
                    if importance > 1.0:
                        importance = 1.0
                elif isinstance(value, bool):
                    importance = 0.7 if value else 0.3
                else:
                    # Generate a simple hash of the feature name for deterministic results
                    hash_value = sum(ord(c) for c in feature) % 100
                    importance = hash_value / 100.0
                
                # Occasionally make some features negative to show that they reduce risk
                if i % 3 == 0:
                    importance = -importance
                
                feature_importance[feature] = importance
            
            # Create visualization data
            visualization = {
                "type": "bar_chart",
                "data": {
                    "labels": list(feature_importance.keys()),
                    "values": list(feature_importance.values())
                }
            }
            
            # Create result
            result = {
                "prediction_id": prediction_id,
                "patient_id": patient_id,
                "model_type": model_type,
                "feature_importance": feature_importance,
                "visualization": visualization,
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except ClientError as e:
            aws_error = self._handle_aws_error(e, "get_feature_importance")
            raise aws_error
    
    def integrate_with_digital_twin(
        self,
        patient_id: str,
        profile_id: str,
        prediction_id: str
    ) -> Dict[str, Any]:
        """
        Integrate prediction with digital twin profile.
        
        Args:
            patient_id: Patient identifier
            profile_id: Digital twin profile identifier
            prediction_id: Prediction identifier
            
        Returns:
            Integration result
            
        Raises:
            ResourceNotFoundError: If prediction not found
            ConfigurationError: If Lambda function not configured
            ValidationError: If parameters are invalid
            ServiceConnectionError: If connection to Lambda fails
        """
        self._ensure_initialized()
        
        # Check if Lambda is configured
        if not self._lambda_client or not self._digital_twin_function:
            raise ConfigurationError(
                "Lambda not configured for digital twin integration",
                field="digital_twin_function"
            )
        
        try:
            self._logger.info(
                f"Integrating prediction {prediction_id} with digital twin profile {profile_id}"
            )
            
            # Prepare request data
            request_data = {
                "action": "integrate_prediction",
                "patient_id": patient_id,
                "profile_id": profile_id,
                "prediction_id": prediction_id,
                "timestamp": datetime.now().isoformat()
            }
            
            # Invoke Lambda function
            response = self._lambda_client.invoke(
                FunctionName=self._digital_twin_function,
                InvocationType="RequestResponse",
                Payload=json.dumps(request_data).encode()
            )
            
            # Parse response
            if "Payload" in response:
                payload = response["Payload"].read()
                result = json.loads(payload)
                
                # Add request data to result
                result["patient_id"] = patient_id
                result["profile_id"] = profile_id
                result["prediction_id"] = prediction_id
                
                # Notify observers
                self._notify_observers(EventType.INTEGRATION, {
                    "integration_type": "digital_twin",
                    "patient_id": patient_id,
                    "profile_id": profile_id,
                    "prediction_id": prediction_id,
                    "status": result.get("status")
                })
                
                return result
            else:
                raise ServiceConnectionError(
                    "No payload in Lambda response",
                    service="Lambda",
                    error_type="EmptyPayload"
                )
            
        except ClientError as e:
            aws_error = self._handle_aws_error(e, "integrate_with_digital_twin")
            raise aws_error
    
    def get_model_info(self, model_type: str) -> Dict[str, Any]:
        """
        Get information about a model.
        
        Args:
            model_type: Type of model
            
        Returns:
            Model information
            
        Raises:
            ModelNotFoundError: If model not found
        """
        self._ensure_initialized()
        
        # Check if model type is valid
        if model_type not in self._model_endpoints and "default" not in self._model_endpoints:
            raise ModelNotFoundError(
                f"Model not found: {model_type}",
                model_type=model_type
            )
        
        # Get endpoint name
        endpoint = self._model_endpoints.get(
            model_type,
            self._model_endpoints.get("default")
        )
        
        # For a real implementation, we would retrieve model info from SageMaker
        # or a model registry. For now, we'll return mock data.
        
        # Generate mock features based on model type
        features = []
        if "risk" in model_type:
            features = [
                "symptom_severity",
                "medication_adherence",
                "previous_episodes",
                "social_support",
                "stress_level",
                "sleep_quality",
                "substance_use"
            ]
        elif "ssri" in model_type or "snri" in model_type:
            features = [
                "previous_medication_response",
                "age",
                "weight_kg",
                "symptom_severity",
                "medication_adherence",
                "liver_function",
                "kidney_function"
            ]
        elif "therapy" in model_type:
            features = [
                "previous_therapy_response",
                "motivation",
                "insight",
                "social_support",
                "symptom_severity",
                "functional_impairment"
            ]
        elif "outcome" in model_type:
            features = [
                "baseline_severity",
                "treatment_adherence",
                "social_support",
                "functional_status",
                "comorbidity_burden"
            ]
        else:
            features = [
                "symptom_severity",
                "functional_status",
                "quality_of_life"
            ]
        
        # Generate mock performance metrics
        performance_metrics = {
            "accuracy": 0.85,
            "precision": 0.83,
            "recall": 0.87,
            "f1_score": 0.85,
            "auc_roc": 0.92
        }
        
        # Generate mock hyperparameters
        hyperparameters = {
            "n_estimators": 100,
            "max_depth": 5,
            "learning_rate": 0.1,
            "subsample": 0.8,
            "colsample_bytree": 0.8
        }
        
        # Create result
        result = {
            "model_type": model_type,
            "version": "1.0.0",
            "last_updated": "2025-03-01T00:00:00Z",
            "description": f"XGBoost model for {model_type}",
            "features": features,
            "performance_metrics": performance_metrics,
            "hyperparameters": hyperparameters,
            "status": "active",
            "endpoint": endpoint
        }
        
        return result
    
    def _initialize_aws_clients(self):
        """
        Initialize AWS clients.
        """
        # Initialize SageMaker runtime client
        self._sagemaker_runtime = boto3.client(
            "sagemaker-runtime",
            region_name=self._region_name
        )
        
        # Initialize DynamoDB client if predictions table is configured
        if self._predictions_table:
            self._dynamodb = boto3.resource(
                "dynamodb",
                region_name=self._region_name
            )
        
        # Initialize Lambda client if digital twin function is configured
        if self._digital_twin_function:
            self._lambda_client = boto3.client(
                "lambda",
                region_name=self._region_name
            )
    
    def _initialize_phi_patterns(self) -> Dict[PrivacyLevel, List[Dict[str, Any]]]:
        """
        Initialize PHI detection patterns for different privacy levels.
        
        Returns:
            Dictionary mapping privacy levels to patterns
        """
        # Define patterns for each privacy level
        patterns = {
            PrivacyLevel.STANDARD: [
                {"type": "SSN", "pattern": r"\b\d{3}-\d{2}-\d{4}\b"},
                {"type": "MRN", "pattern": r"\bMRN\s*\d{5,10}\b"},
                {"type": "NAME", "pattern": r"\b(Dr\.?\s+)?[A-Z][a-z]+\s+[A-Z][a-z]+\b"}
            ],
            PrivacyLevel.ENHANCED: [
                {"type": "SSN", "pattern": r"\b\d{3}-\d{2}-\d{4}\b"},
                {"type": "MRN", "pattern": r"\bMRN\s*\d{5,10}\b"},
                {"type": "NAME", "pattern": r"\b(Dr\.?\s+)?[A-Z][a-z]+\s+[A-Z][a-z]+\b"},
                {"type": "EMAIL", "pattern": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b"},
                {"type": "PHONE", "pattern": r"\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"},
                {"type": "ADDRESS", "pattern": r"\b\d+\s+[A-Za-z\s]+\b(Road|Rd|Street|St|Avenue|Ave|Drive|Dr)\b"}
            ],
            PrivacyLevel.MAXIMUM: [
                {"type": "SSN", "pattern": r"\b\d{3}-\d{2}-\d{4}\b"},
                {"type": "MRN", "pattern": r"\bMRN\s*\d{5,10}\b"},
                {"type": "NAME", "pattern": r"\b(Dr\.?\s+)?[A-Z][a-z]+\s+[A-Z][a-z]+\b"},
                {"type": "EMAIL", "pattern": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b"},
                {"type": "PHONE", "pattern": r"\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"},
                {"type": "ADDRESS", "pattern": r"\b\d+\s+[A-Za-z\s]+\b(Road|Rd|Street|St|Avenue|Ave|Drive|Dr)\b"},
                {"type": "ZIP", "pattern": r"\b\d{5}(-\d{4})?\b"},
                {"type": "DOB", "pattern": r"\b\d{1,2}/\d{1,2}/\d{2,4}\b"},
                {"type": "PHI_KEYS", "pattern": r"\b(ssn|social|security|dob|birth|email|phone|address|zip|postal)\b"}
            ]
        }
        
        # Compile patterns
        for level, level_patterns in patterns.items():
            for pattern in level_patterns:
                pattern["compiled"] = re.compile(pattern["pattern"], re.IGNORECASE)
        
        return patterns
    
    def _invoke_sagemaker_endpoint(
        self,
        model_type: str,
        request_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Invoke a SageMaker endpoint for prediction.
        
        Args:
            model_type: Type of model (endpoint mapping)
            request_data: Request data
            
        Returns:
            Prediction result
            
        Raises:
            PredictionError: If prediction fails
            ServiceConnectionError: If connection to SageMaker fails
        """
        # Get endpoint name
        if model_type in self._model_endpoints:
            endpoint_name = self._model_endpoints[model_type]
        elif "default" in self._model_endpoints:
            endpoint_name = self._model_endpoints["default"]
            self._logger.warning(f"Using default endpoint for model type {model_type}")
        else:
            raise ConfigurationError(
                f"No endpoint configured for model type {model_type}",
                field="model_endpoints",
                details=f"Available endpoints: {list(self._model_endpoints.keys())}"
            )
        
        # Invoke endpoint
        try:
            self._logger.debug(f"Invoking SageMaker endpoint {endpoint_name}")
            response = self._sagemaker_runtime.invoke_endpoint(
                EndpointName=endpoint_name,
                ContentType="application/json",
                Body=json.dumps(request_data).encode()
            )
            
            # Parse response
            if "Body" in response:
                payload = response["Body"].read()
                result = json.loads(payload)
                return result
            else:
                raise PredictionError(
                    "No body in SageMaker response",
                    model_type=model_type
                )
                
        except json.JSONDecodeError as e:
            raise PredictionError(
                f"Failed to decode prediction result: {str(e)}",
                model_type=model_type
            )
    
    def _store_prediction(
        self,
        prediction: Dict[str, Any],
        model_type: str
    ) -> None:
        """
        Store prediction data in DynamoDB.
        
        Args:
            prediction: Prediction data
            model_type: Type of model
            
        Raises:
            ServiceConnectionError: If connection to DynamoDB fails
        """
        try:
            # Check required fields
            required_fields = ["prediction_id", "patient_id"]
            for field in required_fields:
                if field not in prediction:
                    self._logger.warning(f"Missing required field {field} in prediction data")
                    prediction[field] = f"generated-{int(time.time())}"
            
            # Create item to store
            item = {
                "prediction_id": prediction["prediction_id"],
                "patient_id": prediction["patient_id"],
                "model_type": model_type,
                "timestamp": datetime.now().isoformat(),
                "data": json.dumps(prediction)
            }
            
            # Store in DynamoDB
            table = self._dynamodb.Table(self._predictions_table)
            table.put_item(Item=item)
            
            self._logger.debug(f"Stored prediction {prediction['prediction_id']} in DynamoDB")
            
        except ClientError as e:
            aws_error = self._handle_aws_error(e, "store_prediction")
            self._logger.error(f"Failed to store prediction: {aws_error}")
            # Don't re-raise - we don't want storage failures to break the API
    
    def _check_phi_in_data(self, data: Dict[str, Any]) -> None:
        """
        Check for PHI in data.
        
        Args:
            data: Data to check
            
        Raises:
            DataPrivacyError: If PHI is detected
        """
        if not data:
            return
        
        # Get patterns for current privacy level
        patterns = []
        for level in PrivacyLevel:
            if level.value <= self._privacy_level.value:
                patterns.extend(self._phi_patterns[level])
        
        # Check each key and value in the data
        phi_found = []
        
        for key, value in data.items():
            # For MAXIMUM privacy level, check key names for PHI indicators
            if self._privacy_level == PrivacyLevel.MAXIMUM:
                for pattern in patterns:
                    if pattern["type"] == "PHI_KEYS" and pattern["compiled"].search(key):
                        phi_found.append(pattern["type"])
            
            # Check values for PHI
            if isinstance(value, str):
                for pattern in patterns:
                    if pattern["compiled"].search(value):
                        phi_found.append(pattern["type"])
            
            # Recursively check nested dictionaries
            elif isinstance(value, dict):
                try:
                    self._check_phi_in_data(value)
                except DataPrivacyError as e:
                    phi_found.extend(e.pattern_types)
        
        # If PHI found, raise exception
        if phi_found:
            unique_phi_types = list(set(phi_found))
            raise DataPrivacyError(
                f"PHI detected in input data: {', '.join(unique_phi_types)}",
                pattern_types=unique_phi_types
            )
    
    def _notify_observers(self, event_type: EventType, data: Dict[str, Any]) -> None:
        """
        Notify observers of an event.
        
        Args:
            event_type: Type of event
            data: Event data
        """
        # Add timestamp to event data
        data["timestamp"] = datetime.now().isoformat()
        
        # Notify observers registered for this event type
        event_key = event_type
        if event_key in self._observers:
            for observer in self._observers[event_key]:
                try:
                    observer.update(event_type, data)
                except Exception as e:
                    self._logger.error(f"Error notifying observer: {e}")
        
        # Notify observers registered for all events
        if "*" in self._observers:
            for observer in self._observers["*"]:
                try:
                    observer.update(event_type, data)
                except Exception as e:
                    self._logger.error(f"Error notifying wildcard observer: {e}")
    
    def _validate_risk_type(self, risk_type: str) -> None:
        """
        Validate risk type.
        
        Args:
            risk_type: Risk type to validate
            
        Raises:
            ValidationError: If risk type is invalid
        """
        valid_risk_types = ["relapse", "suicide", "hospitalization"]
        
        if risk_type not in valid_risk_types:
            raise ValidationError(
                f"Invalid risk type: {risk_type}. Valid risk types: {', '.join(valid_risk_types)}",
                field="risk_type",
                value=risk_type
            )
    
    def _validate_treatment_type(
        self,
        treatment_type: str,
        treatment_details: Dict[str, Any]
    ) -> None:
        """
        Validate treatment type and details.
        
        Args:
            treatment_type: Treatment type to validate
            treatment_details: Treatment details to validate
            
        Raises:
            ValidationError: If treatment type or details are invalid
        """
        # Check if treatment type is valid
        valid_medication_types = ["medication_ssri", "medication_snri", "medication_atypical"]
        valid_therapy_types = ["therapy_cbt", "therapy_dbt", "therapy_ipt", "therapy_psychodynamic"]
        
        valid_treatment_types = valid_medication_types + valid_therapy_types
        
        if treatment_type not in valid_treatment_types:
            raise ValidationError(
                f"Invalid treatment type: {treatment_type}. Valid treatment types: {', '.join(valid_treatment_types)}",
                field="treatment_type",
                value=treatment_type
            )
        
        # Check required details for medication
        if treatment_type in valid_medication_types:
            if "medication" not in treatment_details:
                raise ValidationError(
                    "Missing required field 'medication' in treatment_details",
                    field="treatment_details.medication"
                )
        
        # Check required details for therapy
        if treatment_type in valid_therapy_types:
            if "frequency" not in treatment_details:
                raise ValidationError(
                    "Missing required field 'frequency' in treatment_details",
                    field="treatment_details.frequency"
                )
    
    def _validate_outcome_params(self, outcome_timeframe: Dict[str, int]) -> None:
        """
        Validate outcome prediction parameters.
        
        Args:
            outcome_timeframe: Outcome timeframe to validate
            
        Raises:
            ValidationError: If parameters are invalid
        """
        if not outcome_timeframe:
            raise ValidationError(
                "Empty outcome timeframe",
                field="outcome_timeframe"
            )
        
        valid_units = ["days", "weeks", "months"]
        
        if not any(unit in outcome_timeframe for unit in valid_units):
            raise ValidationError(
                f"Invalid outcome timeframe. Must include at least one of: {', '.join(valid_units)}",
                field="outcome_timeframe"
            )
        
        for unit, value in outcome_timeframe.items():
            if unit not in valid_units:
                raise ValidationError(
                    f"Invalid time unit: {unit}. Valid units: {', '.join(valid_units)}",
                    field=f"outcome_timeframe.{unit}",
                    value=unit
                )
            
            if not isinstance(value, int) or value <= 0:
                raise ValidationError(
                    f"Invalid value for {unit}: {value}. Must be a positive integer.",
                    field=f"outcome_timeframe.{unit}",
                    value=value
                )
    
    def _handle_aws_error(self, e: Exception, operation: str) -> Exception:
        """
        Handle AWS errors by mapping them to domain exceptions.
        
        Args:
            e: AWS exception
            operation: Operation that caused the error
            
        Returns:
            Domain exception
        """
        self._logger.error(f"AWS error during {operation}: {str(e)}")
        
        # If it's a ClientError, get the error code
        if isinstance(e, ClientError):
            error_code = e.response.get("Error", {}).get("Code", "")
            error_message = e.response.get("Error", {}).get("Message", str(e))
            
            # Map error codes to domain exceptions
            if error_code == "ResourceNotFoundException":
                return ResourceNotFoundError(
                    f"Resource not found: {error_message}",
                    resource_type="aws",
                    resource_id=error_code
                )
            elif error_code == "ValidationException":
                return ValidationError(
                    f"Validation error: {error_message}",
                    field="aws",
                    value=error_code
                )
            elif error_code == "ModelError":
                return PredictionError(
                    f"Model error: {error_message}",
                    model_type=operation
                )
            else:
                return ServiceConnectionError(
                    f"AWS error: {error_message}",
                    service="AWS",
                    error_type=error_code
                )
        
        # For other exceptions, return a generic ServiceConnectionError
        return ServiceConnectionError(
            f"Error during {operation}: {str(e)}",
            service="AWS",
            error_type=type(e).__name__
        )
    
    def _anonymize_id(self, id_value: str) -> str:
        """
        Anonymize an identifier for logging.
        
        Args:
            id_value: Identifier to anonymize
            
        Returns:
            Anonymized identifier
        """
        if not id_value:
            return "unknown"
        
        # Get first character and last character
        first = id_value[0]
        last = id_value[-1] if len(id_value) > 1 else ""
        
        # Replace middle characters with *
        return f"{first}{'*' * (len(id_value) - 2)}{last}" if len(id_value) > 2 else f"{first}*"
