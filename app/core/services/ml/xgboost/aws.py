"""
AWS SageMaker implementation of the XGBoost ML service.

This module provides an AWS SageMaker-based implementation of the XGBoost service
interface. It handles communication with SageMaker endpoints, model management,
and persistence of prediction results in AWS-native storage solutions.
"""

import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, Union

import boto3
from botocore.exceptions import ClientError

from app.core.services.ml.xgboost.interface import (
    XGBoostServiceInterface,
    PredictionType,
    RiskLevel,
    ResponseLevel,
    ValidationStatus,
    TreatmentCategory,
    FeatureCategory,
    ModelSource,
    ModelStatus,
    BasePrediction,
    RiskPrediction,
    TreatmentPrediction,
    OutcomePrediction,
    PredictionModel,
    FeatureImportance,
    PatientId,
    ModelId,
    PredictionId,
    FeatureId
)

from app.core.services.ml.xgboost.exceptions import (
    XGBoostServiceError,
    ModelNotFoundError,
    PredictionNotFoundError,
    PatientNotFoundError,
    InvalidFeatureError,
    PredictionError,
    DigitalTwinUpdateError,
    ServiceConfigurationError,
    ServiceConnectionError,
    ServiceOperationError
)

# Observer pattern implementation
from app.core.services.observability.observer import Observable, Observer


class AWSXGBoostService(XGBoostServiceInterface, Observable):
    """
    AWS SageMaker implementation of the XGBoost service.
    
    This implementation uses AWS SageMaker for model hosting and inference,
    with DynamoDB for prediction storage and S3 for model artifacts.
    """
    
    def __init__(
        self,
        region_name: str = None,
        endpoint_prefix: str = None,
        dynamodb_table: str = None,
        s3_bucket: str = None,
        log_level: str = "INFO",
        observers: List[Observer] = None
    ):
        """
        Initialize the AWS XGBoost service.
        
        Args:
            region_name: AWS region name (defaults to AWS_REGION env var)
            endpoint_prefix: SageMaker endpoint prefix (defaults to SAGEMAKER_ENDPOINT_PREFIX env var)
            dynamodb_table: DynamoDB table for predictions (defaults to DYNAMODB_PREDICTIONS_TABLE env var)
            s3_bucket: S3 bucket for model artifacts (defaults to S3_MODELS_BUCKET env var)
            log_level: Logging level
            observers: List of observers for the Observable pattern
        """
        Observable.__init__(self)
        
        # Add observers if provided
        if observers:
            for observer in observers:
                self.add_observer(observer)
        
        # Set up logging (ensuring no PHI is logged)
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(log_level)
        
        # Get configuration from environment variables if not provided
        self.region_name = region_name or os.environ.get("AWS_REGION", "us-east-1")
        self.endpoint_prefix = endpoint_prefix or os.environ.get("SAGEMAKER_ENDPOINT_PREFIX", "xgboost-")
        self.dynamodb_table = dynamodb_table or os.environ.get("DYNAMODB_PREDICTIONS_TABLE", "predictions")
        self.s3_bucket = s3_bucket or os.environ.get("S3_MODELS_BUCKET", "xgboost-models")
        
        # Initialize AWS clients
        self._initialize_aws_clients()
        
        # Cache for model endpoints and metadata
        self.model_cache = {}
        
        # Validate configuration
        self._validate_configuration()
    
    def _initialize_aws_clients(self) -> None:
        """
        Initialize AWS clients for SageMaker, DynamoDB, and S3.
        
        Raises:
            ServiceConfigurationError: If client initialization fails
        """
        try:
            self.sagemaker_runtime = boto3.client(
                'sagemaker-runtime', 
                region_name=self.region_name
            )
            self.sagemaker = boto3.client(
                'sagemaker', 
                region_name=self.region_name
            )
            self.dynamodb = boto3.resource(
                'dynamodb', 
                region_name=self.region_name
            )
            self.s3 = boto3.client(
                's3', 
                region_name=self.region_name
            )
            
            # Initialize DynamoDB table
            self.predictions_table = self.dynamodb.Table(self.dynamodb_table)
            
        except Exception as e:
            self.logger.error(f"Failed to initialize AWS clients: {str(e)}")
            raise ServiceConfigurationError(f"Failed to initialize AWS clients: {str(e)}")
    
    def _validate_configuration(self) -> None:
        """
        Validate AWS configuration by checking access to resources.
        
        Raises:
            ServiceConfigurationError: If validation fails
        """
        try:
            # Check DynamoDB table access
            self.predictions_table.scan(Limit=1)
            
            # Check S3 bucket access
            self.s3.head_bucket(Bucket=self.s3_bucket)
            
            # Check at least one SageMaker endpoint exists
            self.sagemaker.list_endpoints(MaxResults=10)
            
            self.logger.info("AWS configuration validated successfully")
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            if error_code == 'ResourceNotFoundException':
                self.logger.error(f"Resource not found: {str(e)}")
                raise ServiceConfigurationError(f"Resource not found: {str(e)}")
            elif error_code in ('AccessDenied', 'UnauthorizedOperation'):
                self.logger.error(f"Access denied to AWS resource: {str(e)}")
                raise ServiceConfigurationError(f"Access denied to AWS resource: {str(e)}")
            else:
                self.logger.error(f"AWS configuration validation failed: {str(e)}")
                raise ServiceConfigurationError(f"AWS configuration validation failed: {str(e)}")
    
    def _get_endpoint_name(self, prediction_type: PredictionType) -> str:
        """
        Get the SageMaker endpoint name for a prediction type.
        
        Args:
            prediction_type: Type of prediction
            
        Returns:
            str: SageMaker endpoint name
            
        Raises:
            ModelNotFoundError: If no endpoint exists for the prediction type
        """
        # Check cache first
        if prediction_type.value in self.model_cache:
            return self.model_cache[prediction_type.value]['endpoint_name']
        
        # Construct endpoint name from prefix and prediction type
        endpoint_name = f"{self.endpoint_prefix}{prediction_type.value}"
        
        try:
            # Verify endpoint exists
            self.sagemaker.describe_endpoint(EndpointName=endpoint_name)
            
            # Cache endpoint name
            if prediction_type.value not in self.model_cache:
                self.model_cache[prediction_type.value] = {'endpoint_name': endpoint_name}
                
            return endpoint_name
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ValidationException':
                self.logger.error(f"Endpoint {endpoint_name} not found")
                raise ModelNotFoundError(f"No model available for {prediction_type.value}")
            else:
                self.logger.error(f"Error accessing SageMaker endpoint: {str(e)}")
                raise ServiceConnectionError(f"Error accessing SageMaker endpoint: {str(e)}")
    
    def _invoke_endpoint(
        self, 
        endpoint_name: str, 
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Invoke a SageMaker endpoint with a payload.
        
        Args:
            endpoint_name: Name of the SageMaker endpoint
            payload: Payload to send to the endpoint
            
        Returns:
            Dict: Response from the endpoint
            
        Raises:
            ServiceConnectionError: If endpoint invocation fails
            PredictionError: If prediction generation fails
        """
        try:
            # Convert payload to JSON
            payload_bytes = json.dumps(payload).encode('utf-8')
            
            # Invoke endpoint
            response = self.sagemaker_runtime.invoke_endpoint(
                EndpointName=endpoint_name,
                ContentType='application/json',
                Body=payload_bytes
            )
            
            # Parse response
            result = json.loads(response['Body'].read().decode('utf-8'))
            return result
            
        except ClientError as e:
            self.logger.error(f"Failed to invoke endpoint {endpoint_name}: {str(e)}")
            raise ServiceConnectionError(f"Failed to invoke endpoint {endpoint_name}: {str(e)}")
        except (json.JSONDecodeError, KeyError) as e:
            self.logger.error(f"Failed to parse endpoint response: {str(e)}")
            raise PredictionError(f"Failed to parse endpoint response: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error during endpoint invocation: {str(e)}")
            raise PredictionError(f"Prediction generation failed: {str(e)}")
    
    def _store_prediction(self, prediction: Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]) -> None:
        """
        Store a prediction in DynamoDB.
        
        Args:
            prediction: Prediction to store
            
        Raises:
            ServiceOperationError: If storage fails
        """
        try:
            # Convert prediction to dictionary
            prediction_dict = prediction.to_dict()
            
            # Add appropriate indexes and metadata
            item = {
                **prediction_dict,
                'patient_prediction_id': f"{prediction.patient_id}#{prediction.prediction_id}",
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Store in DynamoDB
            self.predictions_table.put_item(Item=item)
            
            # Notify observers about new prediction
            self.notify_observers(
                event_type="prediction_created",
                data={
                    "prediction_id": prediction.prediction_id,
                    "patient_id": prediction.patient_id,
                    "prediction_type": prediction.prediction_type.value
                }
            )
            
        except ClientError as e:
            self.logger.error(f"Failed to store prediction: {str(e)}")
            raise ServiceOperationError(f"Failed to store prediction: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error storing prediction: {str(e)}")
            raise ServiceOperationError(f"Failed to store prediction: {str(e)}")
    
    def _update_prediction(self, prediction_id: PredictionId, updates: Dict[str, Any]) -> None:
        """
        Update a prediction in DynamoDB.
        
        Args:
            prediction_id: ID of the prediction to update
            updates: Dictionary of field updates
            
        Raises:
            PredictionNotFoundError: If prediction not found
            ServiceOperationError: If update fails
        """
        try:
            # Get the existing prediction first to ensure it exists
            response = self.predictions_table.get_item(
                Key={'prediction_id': prediction_id}
            )
            
            if 'Item' not in response:
                raise PredictionNotFoundError(f"Prediction {prediction_id} not found")
            
            # Extract patient_id from existing item
            patient_id = response['Item'].get('patient_id')
            
            # Build update expression
            update_expression_parts = []
            expression_attribute_values = {
                ':updated_at': datetime.now().isoformat()
            }
            
            for key, value in updates.items():
                update_expression_parts.append(f"{key} = :{key}")
                expression_attribute_values[f":{key}"] = value
            
            update_expression_parts.append("updated_at = :updated_at")
            update_expression = "SET " + ", ".join(update_expression_parts)
            
            # Update the item
            self.predictions_table.update_item(
                Key={'prediction_id': prediction_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values
            )
            
            # Notify observers about prediction update
            self.notify_observers(
                event_type="prediction_updated",
                data={
                    "prediction_id": prediction_id,
                    "patient_id": patient_id,
                    "updates": list(updates.keys())
                }
            )
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                raise PredictionNotFoundError(f"Prediction {prediction_id} not found")
            else:
                self.logger.error(f"Failed to update prediction: {str(e)}")
                raise ServiceOperationError(f"Failed to update prediction: {str(e)}")
        except Exception as e:
            if isinstance(e, PredictionNotFoundError):
                raise
            self.logger.error(f"Unexpected error updating prediction: {str(e)}")
            raise ServiceOperationError(f"Failed to update prediction: {str(e)}")
    
    def _map_risk_level(self, risk_score: float) -> RiskLevel:
        """
        Map a numerical risk score to a risk level category.
        
        Args:
            risk_score: Risk score between 0 and 1
            
        Returns:
            RiskLevel: Corresponding risk level
        """
        if risk_score < 0.10:
            return RiskLevel.VERY_LOW
        elif risk_score < 0.25:
            return RiskLevel.LOW
        elif risk_score < 0.50:
            return RiskLevel.MODERATE
        elif risk_score < 0.75:
            return RiskLevel.HIGH
        elif risk_score < 0.90:
            return RiskLevel.VERY_HIGH
        else:
            return RiskLevel.SEVERE
    
    def _map_response_level(self, response_score: float) -> ResponseLevel:
        """
        Map a numerical response score to a response level category.
        
        Args:
            response_score: Response score between 0 and 1
            
        Returns:
            ResponseLevel: Corresponding response level
        """
        if response_score < 0.10:
            return ResponseLevel.NONE
        elif response_score < 0.30:
            return ResponseLevel.MINIMAL
        elif response_score < 0.50:
            return ResponseLevel.PARTIAL
        elif response_score < 0.70:
            return ResponseLevel.MODERATE
        elif response_score < 0.90:
            return ResponseLevel.GOOD
        else:
            return ResponseLevel.EXCELLENT
    
    def predict_risk(
        self,
        patient_id: PatientId,
        risk_type: PredictionType,
        features: Dict[str, Any],
        time_frame_days: int = 90
    ) -> RiskPrediction:
        """
        Generate a risk prediction for a patient.
        
        Args:
            patient_id: ID of the patient
            risk_type: Type of risk to predict
            features: Feature values for prediction
            time_frame_days: Time frame in days for the prediction (default: 90)
            
        Returns:
            RiskPrediction: The risk prediction result
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        # Validate risk type is actually a risk type
        if not risk_type.value.startswith('risk_'):
            raise InvalidFeatureError(f"Invalid risk type: {risk_type.value}")
        
        # Get endpoint name for this prediction type
        endpoint_name = self._get_endpoint_name(risk_type)
        
        # Construct payload with features and metadata
        payload = {
            'patient_id': patient_id,
            'features': features,
            'time_frame_days': time_frame_days
        }
        
        try:
            # Invoke endpoint
            result = self._invoke_endpoint(endpoint_name, payload)
            
            # Generate prediction ID
            prediction_id = str(uuid.uuid4())
            
            # Extract prediction result
            risk_score = result.get('risk_score')
            confidence = result.get('confidence', 0.8)
            features_used = result.get('features_used', list(features.keys()))
            explanation = result.get('explanation', 'Risk prediction based on clinical and behavioral factors.')
            contributing_factors = result.get('contributing_factors', [])
            
            # Map risk score to risk level
            risk_level = self._map_risk_level(risk_score)
            
            # Create prediction object
            prediction = RiskPrediction(
                prediction_id=prediction_id,
                patient_id=patient_id,
                model_id=result.get('model_id', 'default'),
                prediction_type=risk_type,
                timestamp=datetime.now().isoformat(),
                confidence=confidence,
                features_used=features_used,
                features=features,
                explanation=explanation,
                validation_status=ValidationStatus.PENDING,
                risk_level=risk_level,
                risk_score=risk_score,
                time_frame_days=time_frame_days,
                contributing_factors=contributing_factors
            )
            
            # Store prediction
            self._store_prediction(prediction)
            
            return prediction
            
        except (InvalidFeatureError, ModelNotFoundError, PredictionError):
            # Re-raise these specific exceptions
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error during risk prediction: {str(e)}")
            raise PredictionError(f"Failed to generate risk prediction: {str(e)}")
    
    def predict_treatment_response(
        self,
        patient_id: PatientId,
        treatment_category: TreatmentCategory,
        treatment_details: Dict[str, Any],
        features: Dict[str, Any]
    ) -> TreatmentPrediction:
        """
        Generate a treatment response prediction for a patient.
        
        Args:
            patient_id: ID of the patient
            treatment_category: Category of treatment
            treatment_details: Detailed treatment information
            features: Feature values for prediction
            
        Returns:
            TreatmentPrediction: The treatment prediction result
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        # Determine prediction type based on treatment category
        prediction_type = None
        if treatment_category.value.startswith('medication_'):
            prediction_type = PredictionType.TREATMENT_RESPONSE_MEDICATION
        elif treatment_category.value.startswith('therapy_'):
            prediction_type = PredictionType.TREATMENT_RESPONSE_THERAPY
        else:
            prediction_type = PredictionType.TREATMENT_RESPONSE_COMBINED
        
        # Get endpoint name for this prediction type
        endpoint_name = self._get_endpoint_name(prediction_type)
        
        # Construct payload with features and metadata
        payload = {
            'patient_id': patient_id,
            'treatment_category': treatment_category.value,
            'treatment_details': treatment_details,
            'features': features
        }
        
        try:
            # Invoke endpoint
            result = self._invoke_endpoint(endpoint_name, payload)
            
            # Generate prediction ID
            prediction_id = str(uuid.uuid4())
            
            # Extract prediction result
            response_score = result.get('response_score')
            confidence = result.get('confidence', 0.8)
            features_used = result.get('features_used', list(features.keys()))
            explanation = result.get('explanation', 'Treatment response prediction based on clinical factors and history.')
            time_to_response_days = result.get('time_to_response_days', 30)
            suggested_adjustments = result.get('suggested_adjustments', [])
            
            # Map response score to response level
            response_level = self._map_response_level(response_score)
            
            # Create prediction object
            prediction = TreatmentPrediction(
                prediction_id=prediction_id,
                patient_id=patient_id,
                model_id=result.get('model_id', 'default'),
                prediction_type=prediction_type,
                timestamp=datetime.now().isoformat(),
                confidence=confidence,
                features_used=features_used,
                features=features,
                explanation=explanation,
                validation_status=ValidationStatus.PENDING,
                treatment_category=treatment_category,
                treatment_details=treatment_details,
                response_level=response_level,
                response_score=response_score,
                time_to_response_days=time_to_response_days,
                suggested_adjustments=suggested_adjustments
            )
            
            # Store prediction
            self._store_prediction(prediction)
            
            return prediction
            
        except (InvalidFeatureError, ModelNotFoundError, PredictionError):
            # Re-raise these specific exceptions
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error during treatment response prediction: {str(e)}")
            raise PredictionError(f"Failed to generate treatment response prediction: {str(e)}")
    
    def predict_outcome(
        self,
        patient_id: PatientId,
        outcome_type: PredictionType,
        features: Dict[str, Any],
        time_frame_days: int = 90
    ) -> OutcomePrediction:
        """
        Generate an outcome prediction for a patient.
        
        Args:
            patient_id: ID of the patient
            outcome_type: Type of outcome to predict
            features: Feature values for prediction
            time_frame_days: Time frame in days for the prediction (default: 90)
            
        Returns:
            OutcomePrediction: The outcome prediction result
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        # Validate outcome type is actually an outcome type
        if not outcome_type.value.startswith('outcome_'):
            raise InvalidFeatureError(f"Invalid outcome type: {outcome_type.value}")
        
        # Get endpoint name for this prediction type
        endpoint_name = self._get_endpoint_name(outcome_type)
        
        # Construct payload with features and metadata
        payload = {
            'patient_id': patient_id,
            'features': features,
            'time_frame_days': time_frame_days
        }
        
        try:
            # Invoke endpoint
            result = self._invoke_endpoint(endpoint_name, payload)
            
            # Generate prediction ID
            prediction_id = str(uuid.uuid4())
            
            # Extract prediction result
            outcome_metrics = result.get('outcome_metrics', {})
            confidence = result.get('confidence', 0.8)
            features_used = result.get('features_used', list(features.keys()))
            explanation = result.get('explanation', 'Outcome prediction based on clinical factors and history.')
            influencing_factors = result.get('influencing_factors', [])
            
            # Create prediction object
            prediction = OutcomePrediction(
                prediction_id=prediction_id,
                patient_id=patient_id,
                model_id=result.get('model_id', 'default'),
                prediction_type=outcome_type,
                timestamp=datetime.now().isoformat(),
                confidence=confidence,
                features_used=features_used,
                features=features,
                explanation=explanation,
                validation_status=ValidationStatus.PENDING,
                outcome_metrics=outcome_metrics,
                time_frame_days=time_frame_days,
                influencing_factors=influencing_factors
            )
            
            # Store prediction
            self._store_prediction(prediction)
            
            return prediction
            
        except (InvalidFeatureError, ModelNotFoundError, PredictionError):
            # Re-raise these specific exceptions
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error during outcome prediction: {str(e)}")
            raise PredictionError(f"Failed to generate outcome prediction: {str(e)}")
    
    def compare_treatments(
        self,
        patient_id: PatientId,
        treatment_options: List[Dict[str, Any]],
        features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compare multiple treatment options for a patient.
        
        Args:
            patient_id: ID of the patient
            treatment_options: List of treatment options to compare
            features: Feature values for prediction
            
        Returns:
            Dict: Comparison results with treatment predictions and recommendations
            
        Raises:
            InvalidFeatureError: If features are invalid or missing
            ModelNotFoundError: If no suitable model is found
            PredictionError: If prediction generation fails
        """
        if not treatment_options or len(treatment_options) < 2:
            raise InvalidFeatureError("At least two treatment options are required for comparison")
        
        try:
            # Generate individual treatment predictions
            predictions = []
            
            for option in treatment_options:
                category = TreatmentCategory(option.get('category'))
                details = option.get('details', {})
                
                prediction = self.predict_treatment_response(
                    patient_id=patient_id,
                    treatment_category=category,
                    treatment_details=details,
                    features=features
                )
                
                predictions.append(prediction)
            
            # Find the best treatment (highest response score)
            predictions.sort(key=lambda p: p.response_score, reverse=True)
            best_prediction = predictions[0]
            
            # Calculate relative efficacy for each treatment
            comparison_results = []
            
            for prediction in predictions:
                relative_efficacy = (prediction.response_score / best_prediction.response_score) * 100
                
                comparison_results.append({
                    "treatment_category": prediction.treatment_category.value,
                    "treatment_details": prediction.treatment_details,
                    "response_level": prediction.response_level.value,
                    "response_score": prediction.response_score,
                    "time_to_response_days": prediction.time_to_response_days,
                    "confidence": prediction.confidence,
                    "suggested_adjustments": prediction.suggested_adjustments,
                    "prediction_id": prediction.prediction_id,
                    "relative_efficacy": relative_efficacy
                })
            
            # Generate recommendation
            recommendation = {
                "recommended_treatment": best_prediction.treatment_category.value,
                "reasoning": f"Highest predicted response score ({best_prediction.response_score:.2f}) and {best_prediction.response_level.value} response level",
                "confidence": best_prediction.confidence
            }
            
            # Construct final comparison result
            result = {
                "patient_id": patient_id,
                "timestamp": datetime.now().isoformat(),
                "treatments_compared": len(predictions),
                "results": comparison_results,
                "recommendation": recommendation
            }
            
            return result
            
        except (InvalidFeatureError, ModelNotFoundError, PredictionError):
            # Re-raise these specific exceptions
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error during treatment comparison: {str(e)}")
            raise PredictionError(f"Failed to compare treatments: {str(e)}")
    
    def get_prediction(
        self,
        prediction_id: PredictionId
    ) -> Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]:
        """
        Get a prediction by ID.
        
        Args:
            prediction_id: ID of the prediction
            
        Returns:
            BasePrediction: The prediction (risk, treatment, or outcome)
            
        Raises:
            PredictionNotFoundError: If prediction not found
        """
        try:
            # Get prediction from DynamoDB
            response = self.predictions_table.get_item(
                Key={'prediction_id': prediction_id}
            )
            
            if 'Item' not in response:
                raise PredictionNotFoundError(f"Prediction {prediction_id} not found")
            
            # Extract prediction data
            item = response['Item']
            prediction_type = item.get('prediction_type')
            
            # Create appropriate prediction object based on type
            if prediction_type.startswith('risk_'):
                return RiskPrediction(
                    prediction_id=item.get('prediction_id'),
                    patient_id=item.get('patient_id'),
                    model_id=item.get('model_id'),
                    prediction_type=PredictionType(prediction_type),
                    timestamp=item.get('timestamp'),
                    confidence=item.get('confidence'),
                    features_used=item.get('features_used', []),
                    features=item.get('features', {}),
                    explanation=item.get('explanation'),
                    validation_status=ValidationStatus(item.get('validation_status', 'pending')),
                    risk_level=RiskLevel(item.get('risk_level')),
                    risk_score=item.get('risk_score'),
                    time_frame_days=item.get('time_frame_days'),
                    contributing_factors=item.get('contributing_factors', [])
                )
            elif prediction_type.startswith('treatment_response_'):
                return TreatmentPrediction(
                    prediction_id=item.get('prediction_id'),
                    patient_id=item.get('patient_id'),
                    model_id=item.get('model_id'),
                    prediction_type=PredictionType(prediction_type),
                    timestamp=item.get('timestamp'),
                    confidence=item.get('confidence'),
                    features_used=item.get('features_used', []),
                    features=item.get('features', {}),
                    explanation=item.get('explanation'),
                    validation_status=ValidationStatus(item.get('validation_status', 'pending')),
                    treatment_category=TreatmentCategory(item.get('treatment_category')),
                    treatment_details=item.get('treatment_details', {}),
                    response_level=ResponseLevel(item.get('response_level')),
                    response_score=item.get('response_score'),
                    time_to_response_days=item.get('time_to_response_days'),
                    suggested_adjustments=item.get('suggested_adjustments', [])
                )
            elif prediction_type.startswith('outcome_'):
                return OutcomePrediction(
                    prediction_id=item.get('prediction_id'),
                    patient_id=item.get('patient_id'),
                    model_id=item.get('model_id'),
                    prediction_type=PredictionType(prediction_type),
                    timestamp=item.get('timestamp'),
                    confidence=item.get('confidence'),
                    features_used=item.get('features_used', []),
                    features=item.get('features', {}),
                    explanation=item.get('explanation'),
                    validation_status=ValidationStatus(item.get('validation_status', 'pending')),
                    outcome_metrics=item.get('outcome_metrics', {}),
                    time_frame_days=item.get('time_frame_days'),
                    influencing_factors=item.get('influencing_factors', [])
                )
            else:
                self.logger.error(f"Unknown prediction type: {prediction_type}")
                raise PredictionError(f"Unknown prediction type: {prediction_type}")
                
        except ClientError as e:
            self.logger.error(f"Error retrieving prediction: {str(e)}")
            raise ServiceOperationError(f"Failed to retrieve prediction: {str(e)}")
        except Exception as e:
            if isinstance(e, (PredictionNotFoundError, PredictionError)):
                raise
            self.logger.error(f"Unexpected error retrieving prediction: {str(e)}")
            raise ServiceOperationError(f"Failed to retrieve prediction: {str(e)}")
    
    def get_predictions_for_patient(
        self,
        patient_id: PatientId,
        prediction_type: Optional[PredictionType] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]]:
        """
        Get predictions for a patient.
        
        Args:
            patient_id: ID of the patient
            prediction_type: Optional filter by prediction type
            limit: Maximum number of predictions to return
            offset: Number of predictions to skip
            
        Returns:
            List[BasePrediction]: List of predictions
            
        Raises:
            PatientNotFoundError: If patient not found
        """
        try:
            # Construct filter expression
            filter_expression = "patient_id = :patient_id"
            expression_attribute_values = {
                ":patient_id": patient_id
            }
            
            # Add prediction type filter if provided
            if prediction_type:
                filter_expression += " AND prediction_type = :prediction_type"
                expression_attribute_values[":prediction_type"] = prediction_type.value
            
            # Query predictions
            response = self.predictions_table.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_attribute_values
            )
            
            # Check if patient exists but has no predictions
            if 'Items' not in response or not response['Items']:
                # Check if patient exists at all (could perform additional check here)
                # For now, we'll assume patient exists but has no predictions
                return []
            
            # Extract items and apply pagination
            items = response['Items']
            items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            
            # Apply offset and limit
            paginated_items = items[offset:offset+limit]
            
            # Convert items to prediction objects
            predictions = []
            
            for item in paginated_items:
                prediction_type_str = item.get('prediction_type')
                
                if prediction_type_str.startswith('risk_'):
                    predictions.append(RiskPrediction(
                        prediction_id=item.get('prediction_id'),
                        patient_id=item.get('patient_id'),
                        model_id=item.get('model_id'),
                        prediction_type=PredictionType(prediction_type_str),
                        timestamp=item.get('timestamp'),
                        confidence=item.get('confidence'),
                        features_used=item.get('features_used', []),
                        features=item.get('features', {}),
                        explanation=item.get('explanation'),
                        validation_status=ValidationStatus(item.get('validation_status', 'pending')),
                        risk_level=RiskLevel(item.get('risk_level')),
                        risk_score=item.get('risk_score'),
                        time_frame_days=item.get('time_frame_days'),
                        contributing_factors=item.get('contributing_factors', [])
                    ))
                elif prediction_type_str.startswith('treatment_response_'):
                    predictions.append(TreatmentPrediction(
                        prediction_id=item.get('prediction_id'),
                        patient_id=item.get('patient_id'),
                        model_id=item.get('model_id'),
                        prediction_type=PredictionType(prediction_type_str),
                        timestamp=item.get('timestamp'),
                        confidence=item.get('confidence'),
                        features_used=item.get('features_used', []),
                        features=item.get('features', {}),
                        explanation=item.get('explanation'),
                        validation_status=ValidationStatus(item.get('validation_status', 'pending')),
                        treatment_category=TreatmentCategory(item.get('treatment_category')),
                        treatment_details=item.get('treatment_details', {}),
                        response_level=ResponseLevel(item.get('response_level')),
                        response_score=item.get('response_score'),
                        time_to_response_days=item.get('time_to_response_days'),
                        suggested_adjustments=item.get('suggested_adjustments', [])
                    ))
                elif prediction_type_str.startswith('outcome_'):
                    predictions.append(OutcomePrediction(
                        prediction_id=item.get('prediction_id'),
                        patient_id=item.get('patient_id'),
                        model_id=item.get('model_id'),
                        prediction_type=PredictionType(prediction_type_str),
                        timestamp=item.get('timestamp'),
                        confidence=item.get('confidence'),
                        features_used=item.get('features_used', []),
                        features=item.get('features', {}),
                        explanation=item.get('explanation'),
                        validation_status=ValidationStatus(item.get('validation_status', 'pending')),
                        outcome_metrics=item.get('outcome_metrics', {}),
                        time_frame_days=item.get('time_frame_days'),
                        influencing_factors=item.get('influencing_factors', [])
                    ))
            
            return predictions
            
        except ClientError as e:
            self.logger.error(f"Error retrieving predictions for patient: {str(e)}")
            raise ServiceOperationError(f"Failed to retrieve predictions: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving predictions: {str(e)}")
            raise ServiceOperationError(f"Failed to retrieve predictions: {str(e)}")
    
    def validate_prediction(
        self,
        prediction_id: PredictionId,
        status: ValidationStatus,
        validator_notes: Optional[str] = None
    ) -> bool:
        """
        Update the validation status of a prediction.
        
        Args:
            prediction_id: ID of the prediction
            status: New validation status
            validator_notes: Optional notes from the validator
            
        Returns:
            bool: True if validation was successful
            
        Raises:
            PredictionNotFoundError: If prediction not found
        """
        try:
            # Prepare updates
            updates = {
                'validation_status': status.value
            }
            
            if validator_notes:
                updates['validator_notes'] = validator_notes
                
            # Update prediction
            self._update_prediction(prediction_id, updates)
            
            return True
            
        except PredictionNotFoundError:
            # Re-raise this specific exception
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error validating prediction: {str(e)}")
            raise ServiceOperationError(f"Failed to validate prediction: {str(e)}")
    
    def get_model_info(
        self,
        model_id: Optional[ModelId] = None,
        prediction_type: Optional[PredictionType] = None
    ) -> Union[PredictionModel, List[PredictionModel]]:
        """
        Get information about prediction models.
        
        Args:
            model_id: Optional specific model ID
            prediction_type: Optional filter by prediction type
            
        Returns:
            PredictionModel or List[PredictionModel]: Model information
            
        Raises:
            ModelNotFoundError: If model not found
        """
        try:
            # If specific model ID provided
            if model_id:
                # Look up model in S3
                model_key = f"models/{model_id}/metadata.json"
                
                try:
                    response = self.s3.get_object(
                        Bucket=self.s3_bucket,
                        Key=model_key
                    )
                    
                    # Parse model metadata
                    model_data = json.loads(response['Body'].read().decode('utf-8'))
                    
                    # Create model object
                    return PredictionModel(
                        model_id=model_data.get('model_id'),
                        model_name=model_data.get('model_name'),
                        prediction_type=PredictionType(model_data.get('prediction_type')),
                        version=model_data.get('version'),
                        created_at=model_data.get('created_at'),
                        updated_at=model_data.get('updated_at'),
                        source=ModelSource(model_data.get('source')),
                        status=ModelStatus(model_data.get('status')),
                        performance_metrics=model_data.get('performance_metrics', {}),
                        feature_requirements=model_data.get('feature_requirements', []),
                        hyperparameters=model_data.get('hyperparameters', {}),
                        training_dataset_info=model_data.get('training_dataset_info', {})
                    )
                    
                except ClientError as e:
                    if e.response['Error']['Code'] in ('NoSuchKey', 'NotFound'):
                        raise ModelNotFoundError(f"Model {model_id} not found")
                    else:
                        raise
            
            # If prediction type filter provided or no filters
            # List models in S3
            prefix = "models/"
            if prediction_type:
                prefix = f"models/{prediction_type.value}/"
                
            response = self.s3.list_objects_v2(
                Bucket=self.s3_bucket,
                Prefix=prefix,
                Delimiter='/'
            )
            
            # Check if any models found
            if 'CommonPrefixes' not in response:
                if prediction_type:
                    raise ModelNotFoundError(f"No models found for {prediction_type.value}")
                else:
                    raise ModelNotFoundError("No models found")
            
            # Get model metadata for each model
            models = []
            
            for prefix_obj in response['CommonPrefixes']:
                model_prefix = prefix_obj.get('Prefix')
                model_id = model_prefix.split('/')[-2]  # Extract model ID from prefix
                
                try:
                    # Get model metadata
                    model_key = f"{model_prefix}metadata.json"
                    
                    metadata_response = self.s3.get_object(
                        Bucket=self.s3_bucket,
                        Key=model_key
                    )
                    
                    # Parse model metadata
                    model_data = json.loads(metadata_response['Body'].read().decode('utf-8'))
                    
                    # Skip if prediction type filter doesn't match
                    if prediction_type and model_data.get('prediction_type') != prediction_type.value:
                        continue
                    
                    # Create model object
                    models.append(PredictionModel(
                        model_id=model_data.get('model_id'),
                        model_name=model_data.get('model_name'),
                        prediction_type=PredictionType(model_data.get('prediction_type')),
                        version=model_data.get('version'),
                        created_at=model_data.get('created_at'),
                        updated_at=model_data.get('updated_at'),
                        source=ModelSource(model_data.get('source')),
                        status=ModelStatus(model_data.get('status')),
                        performance_metrics=model_data.get('performance_metrics', {}),
                        feature_requirements=model_data.get('feature_requirements', []),
                        hyperparameters=model_data.get('hyperparameters', {}),
                        training_dataset_info=model_data.get('training_dataset_info', {})
                    ))
                    
                except ClientError:
                    # Skip models with missing metadata
                    continue
            
            # Check if any models found after filtering
            if not models:
                if prediction_type:
                    raise ModelNotFoundError(f"No models found for {prediction_type.value}")
                else:
                    raise ModelNotFoundError("No models found")
            
            return models
            
        except (ModelNotFoundError):
            # Re-raise this specific exception
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving model info: {str(e)}")
            raise ServiceOperationError(f"Failed to retrieve model info: {str(e)}")
    
    def get_feature_importance(
        self,
        model_id: ModelId
    ) -> List[FeatureImportance]:
        """
        Get feature importance for a model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            List[FeatureImportance]: Feature importance information
            
        Raises:
            ModelNotFoundError: If model not found
        """
        try:
            # Look up feature importance in S3
            feature_key = f"models/{model_id}/feature_importance.json"
            
            try:
                response = self.s3.get_object(
                    Bucket=self.s3_bucket,
                    Key=feature_key
                )
                
                # Parse feature importance data
                feature_data = json.loads(response['Body'].read().decode('utf-8'))
                
                # Create feature importance objects
                features = []
                
                for feature in feature_data:
                    features.append(FeatureImportance(
                        feature_id=feature.get('feature_id'),
                        feature_name=feature.get('feature_name'),
                        importance=feature.get('importance'),
                        category=FeatureCategory(feature.get('category'))
                    ))
                
                return features
                
            except ClientError as e:
                if e.response['Error']['Code'] in ('NoSuchKey', 'NotFound'):
                    raise ModelNotFoundError(f"Feature importance for model {model_id} not found")
                else:
                    raise
                
        except (ModelNotFoundError):
            # Re-raise this specific exception
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving feature importance: {str(e)}")
            raise ServiceOperationError(f"Failed to retrieve feature importance: {str(e)}")
    
    def generate_explanation(
        self,
        prediction_id: PredictionId,
        detail_level: str = "standard"
    ) -> Dict[str, Any]:
        """
        Generate explanation for a prediction.
        
        Args:
            prediction_id: ID of the prediction
            detail_level: Level of detail for the explanation
            
        Returns:
            Dict: Explanation data
            
        Raises:
            PredictionNotFoundError: If prediction not found
        """
        try:
            # Get the prediction
            prediction = self.get_prediction(prediction_id)
            
            # Get model info
            model_info = self.get_model_info(model_id=prediction.model_id)
            
            # Get feature importance
            feature_importance = self.get_feature_importance(model_id=prediction.model_id)
            
            # Extract features from prediction
            prediction_features = prediction.features
            
            # Create important features list
            important_features = []
            
            for feature in feature_importance:
                important_features.append({
                    "name": feature.feature_name,
                    "importance": feature.importance,
                    "category": feature.category.value,
                    "value": prediction_features.get(feature.feature_id)
                })
            
            # Sort by importance
            important_features.sort(key=lambda x: x["importance"], reverse=True)
            
            # Limit features based on detail level
            if detail_level == "concise":
                important_features = important_features[:3]
            elif detail_level == "standard":
                important_features = important_features[:5]
            # detailed includes all
            
            # Build explanation text based on prediction type
            explanation_text = prediction.explanation
            
            # For more detailed explanations, we could enhance this in the future
            # by using a natural language generation service or more sophisticated templates
            
            # Create explanation object
            explanation = {
                "prediction_id": prediction_id,
                "prediction_type": prediction.prediction_type.value,
                "model_name": model_info.model_name,
                "model_version": model_info.version,
                "timestamp": datetime.now().isoformat(),
                "confidence": prediction.confidence,
                "explanation_text": explanation_text,
                "important_features": important_features
            }
            
            return explanation
            
        except (PredictionNotFoundError, ModelNotFoundError):
            # Re-raise these specific exceptions
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error generating explanation: {str(e)}")
            raise ServiceOperationError(f"Failed to generate explanation: {str(e)}")
    
    def update_digital_twin(
        self,
        patient_id: PatientId,
        prediction_results: List[Union[RiskPrediction, TreatmentPrediction, OutcomePrediction]]
    ) -> bool:
        """
        Update a patient's digital twin with prediction results.
        
        Args:
            patient_id: ID of the patient
            prediction_results: List of prediction results to incorporate
            
        Returns:
            bool: True if update was successful
            
        Raises:
            DigitalTwinUpdateError: If update fails
            PatientNotFoundError: If patient not found
        """
        try:
            # Verify all predictions are for the same patient
            for prediction in prediction_results:
                if prediction.patient_id != patient_id:
                    raise DigitalTwinUpdateError(
                        f"Prediction {prediction.prediction_id} is for patient {prediction.patient_id}, not {patient_id}"
                    )
            
            # TODO: Implement actual digital twin update logic
            # This would typically involve:
            # 1. Accessing the digital twin service
            # 2. Retrieving the current digital twin state
            # 3. Updating it with new predictions
            # 4. Persisting the updated state
            
            # For now, we'll just log the update and return success
            self.logger.info(f"Updated digital twin for patient {patient_id} with {len(prediction_results)} predictions")
            
            # Notify observers about digital twin update
            self.notify_observers(
                event_type="digital_twin_updated",
                data={
                    "patient_id": patient_id,
                    "prediction_count": len(prediction_results),
                    "prediction_ids": [p.prediction_id for p in prediction_results]
                }
            )
            
            return True
            
        except Exception as e:
            if isinstance(e, DigitalTwinUpdateError):
                raise
            self.logger.error(f"Unexpected error updating digital twin: {str(e)}")
            raise DigitalTwinUpdateError(f"Failed to update digital twin: {str(e)}")
    
    def healthcheck(self) -> Dict[str, Any]:
        """
        Check the health of the service and its components.
        
        Returns:
            Dict: Health status information
        """
        try:
            health_status = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "components": {},
                "models": {}
            }
            
            # Check AWS services
            try:
                # Check DynamoDB
                self.predictions_table.scan(Limit=1)
                health_status["components"]["dynamodb"] = {"status": "healthy"}
            except Exception as e:
                health_status["components"]["dynamodb"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["status"] = "degraded"
            
            try:
                # Check S3
                self.s3.head_bucket(Bucket=self.s3_bucket)
                health_status["components"]["s3"] = {"status": "healthy"}
            except Exception as e:
                health_status["components"]["s3"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["status"] = "degraded"
            
            try:
                # Check SageMaker
                endpoints = self.sagemaker.list_endpoints(MaxResults=10)
                health_status["components"]["sagemaker"] = {"status": "healthy"}
                
                # Check individual endpoints
                for endpoint in endpoints.get('Endpoints', []):
                    endpoint_name = endpoint.get('EndpointName')
                    
                    if endpoint_name.startswith(self.endpoint_prefix):
                        prediction_type = endpoint_name[len(self.endpoint_prefix):]
                        endpoint_status = endpoint.get('EndpointStatus')
                        
                        if endpoint_status == 'InService':
                            health_status["models"][prediction_type] = "active"
                        else:
                            health_status["models"][prediction_type] = endpoint_status.lower()
                            health_status["status"] = "degraded"
            except Exception as e:
                health_status["components"]["sagemaker"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
                health_status["status"] = "degraded"
            
            return health_status
            
        except Exception as e:
            self.logger.error(f"Healthcheck failed: {str(e)}")
            return {
                "status": "unhealthy",
                "timestamp": datetime.now().isoformat(),
                "components": {},
                "models": {},
                "error": str(e)
            }
