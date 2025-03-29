"""
Unit tests for the AWS XGBoost service implementation.

These tests verify that the AWS implementation of the XGBoost service
works correctly, with all AWS services properly mocked.
"""

import json
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from typing import Dict, List, Any, Optional, Union

import boto3
from botocore.exceptions import ClientError

from app.core.services.ml.xgboost.aws import AWSXGBoostService
from app.core.services.ml.xgboost.interface import ModelType, EventType, Observer, PrivacyLevel
from app.core.services.ml.xgboost.exceptions import (
    ValidationError, DataPrivacyError, ResourceNotFoundError,
    ModelNotFoundError, PredictionError, ServiceConnectionError, ConfigurationError
)


class TestObserver(Observer):
    """Test observer implementation for testing the Observer pattern."""
    
    def __init__(self):
        """Initialize the observer with an empty events list."""
        self.events = []
    
    def update(self, event_type: EventType, data: Dict[str, Any]) -> None:
        """
        Receive updates from the observed service.
        
        Args:
            event_type: Type of event that occurred
            data: Data associated with the event
        """
        self.events.append((event_type, data))
    
    def clear(self) -> None:
        """Clear the events list."""
        self.events = []


@pytest.fixture
def mock_sagemaker_client():
    """Fixture for mocking the SageMaker runtime client."""
    with patch("boto3.client") as mock_client:
        # Setup the mock client
        sagemaker_runtime = MagicMock()
        
        # Mock successful response from SageMaker
        mock_response = {
            "Body": MagicMock()
        }
        mock_response["Body"].read.return_value = json.dumps({
            "prediction_id": "test-prediction-id",
            "risk_level": "moderate",
            "risk_score": 0.5,
            "confidence": 0.8,
            "features": {
                "symptom_severity": 0.7,
                "medication_adherence": 0.4
            },
            "contributing_factors": [
                {
                    "name": "symptom_severity",
                    "impact": 0.7,
                    "description": "Symptom Severity is significantly increasing the risk."
                }
            ]
        }).encode()
        
        sagemaker_runtime.invoke_endpoint.return_value = mock_response
        mock_client.return_value = sagemaker_runtime
        
        yield mock_client


@pytest.fixture
def mock_dynamodb_resource():
    """Fixture for mocking the DynamoDB resource."""
    with patch("boto3.resource") as mock_resource:
        # Setup the mock resource
        dynamodb = MagicMock()
        table = MagicMock()
        
        # Mock successful response from DynamoDB
        table.get_item.return_value = {
            "Item": {
                "prediction_id": "test-prediction-id",
                "patient_id": "test-patient-id",
                "model_type": "relapse-risk",
                "timestamp": "2025-03-01T00:00:00Z",
                "data": json.dumps({
                    "prediction_id": "test-prediction-id",
                    "patient_id": "test-patient-id",
                    "risk_level": "moderate",
                    "risk_score": 0.5,
                    "confidence": 0.8,
                    "features": {
                        "symptom_severity": 0.7,
                        "medication_adherence": 0.4
                    }
                })
            }
        }
        
        table.put_item.return_value = {}
        dynamodb.Table.return_value = table
        mock_resource.return_value = dynamodb
        
        yield mock_resource


@pytest.fixture
def mock_lambda_client():
    """Fixture for mocking the Lambda client."""
    with patch("boto3.client") as mock_client:
        # Setup the mock client
        lambda_client = MagicMock()
        
        # Mock successful response from Lambda
        mock_response = {
            "Payload": MagicMock()
        }
        mock_response["Payload"].read.return_value = json.dumps({
            "integration_id": "test-integration-id",
            "status": "success",
            "details": {
                "digital_twin_updated": True
            }
        }).encode()
        
        lambda_client.invoke.return_value = mock_response
        mock_client.return_value = lambda_client
        
        yield mock_client


@pytest.fixture
def aws_service(mock_sagemaker_client, mock_dynamodb_resource, mock_lambda_client):
    """Fixture for creating an AWS XGBoost service with mocked dependencies."""
    # Initialize the service
    service = AWSXGBoostService()
    
    # Initialize with basic config
    service.initialize({
        "region_name": "us-east-1",
        "predictions_table": "test-predictions-table",
        "digital_twin_function": "test-digital-twin-function",
        "log_level": "INFO",
        "privacy_level": PrivacyLevel.STANDARD,
        "model_endpoints": {
            "relapse-risk": "relapse-risk-endpoint",
            "suicide-risk": "suicide-risk-endpoint",
            "hospitalization-risk": "hospitalization-risk-endpoint",
            "ssri-response": "ssri-response-endpoint",
            "default": "default-endpoint"
        }
    })
    
    yield service


@pytest.fixture
def observer():
    """Fixture for creating a test observer."""
    return TestObserver()


class TestAWSXGBoostService:
    """Tests for the AWS XGBoost service implementation."""
    
    def test_initialization(self, aws_service):
        """Test that the service initializes correctly."""
        assert aws_service.is_initialized() is True
    
    def test_initialization_with_invalid_config(self):
        """Test initialization with invalid configuration."""
        service = AWSXGBoostService()
        
        # Missing required field
        with pytest.raises(ConfigurationError):
            service.initialize({})
        
        # Invalid log level
        with pytest.raises(ConfigurationError):
            service.initialize({
                "region_name": "us-east-1",
                "log_level": "INVALID"
            })
        
        # Invalid privacy level
        with pytest.raises(ConfigurationError):
            service.initialize({
                "region_name": "us-east-1",
                "privacy_level": 10
            })
    
    def test_observer_pattern(self, aws_service, observer):
        """Test the Observer pattern implementation."""
        # Register the observer
        aws_service.register_observer(EventType.INITIALIZATION, observer)
        
        # Re-initialize to trigger the event
        aws_service.initialize({
            "region_name": "us-east-1"
        })
        
        # Check that the observer was notified
        assert len(observer.events) == 1
        assert observer.events[0][0] == EventType.INITIALIZATION
        
        # Unregister the observer
        aws_service.unregister_observer(EventType.INITIALIZATION, observer)
        
        # Re-initialize to check that the observer is not notified
        observer.clear()
        aws_service.initialize({
            "region_name": "us-east-1"
        })
        
        # Check that the observer was not notified
        assert len(observer.events) == 0
        
        # Test wildcard observer
        aws_service.register_observer("*", observer)
        
        # Re-initialize to trigger the event
        aws_service.initialize({
            "region_name": "us-east-1"
        })
        
        # Check that the observer was notified
        assert len(observer.events) == 1
    
    def test_predict_risk(self, aws_service, mock_sagemaker_client):
        """Test the predict_risk method."""
        # Test successful prediction
        result = aws_service.predict_risk(
            patient_id="test-patient-id",
            risk_type="relapse",
            clinical_data={
                "symptom_severity": 5,
                "medication_adherence": 3
            }
        )
        
        # Check that SageMaker was called with the correct parameters
        sagemaker_client = mock_sagemaker_client.return_value
        sagemaker_client.invoke_endpoint.assert_called_once()
        
        # Verify the result
        assert result["prediction_id"] == "test-prediction-id"
        assert result["risk_level"] == "moderate"
        assert result["risk_score"] == 0.5
        assert result["confidence"] == 0.8
        assert "contributing_factors" in result
    
    def test_predict_risk_validation_error(self, aws_service):
        """Test that predict_risk handles validation errors correctly."""
        # Invalid risk type
        with pytest.raises(ValidationError):
            aws_service.predict_risk(
                patient_id="test-patient-id",
                risk_type="invalid-risk-type",
                clinical_data={}
            )
    
    def test_predict_risk_phi_detection(self, aws_service):
        """Test that predict_risk detects PHI in the data."""
        # Data with PHI
        with pytest.raises(DataPrivacyError):
            aws_service.predict_risk(
                patient_id="test-patient-id",
                risk_type="relapse",
                clinical_data={
                    "ssn": "123-45-6789",
                    "symptom_severity": 5
                }
            )
    
    def test_predict_treatment_response(self, aws_service, mock_sagemaker_client):
        """Test the predict_treatment_response method."""
        # Mock different response for treatment prediction
        sagemaker_client = mock_sagemaker_client.return_value
        mock_response = {
            "Body": MagicMock()
        }
        mock_response["Body"].read.return_value = json.dumps({
            "prediction_id": "test-treatment-prediction-id",
            "response_level": "good",
            "response_score": 0.75,
            "confidence": 0.85,
            "time_to_response_days": 28,
            "features": {
                "symptom_severity": 0.7,
                "previous_medication_response": 0.6
            },
            "suggested_adjustments": [
                {
                    "adjustment_type": "dosage",
                    "suggestion": "Consider increasing dosage to 20mg",
                    "reasoning": "Current dosage may be subtherapeutic"
                }
            ]
        }).encode()
        
        sagemaker_client.invoke_endpoint.return_value = mock_response
        
        # Test successful prediction
        result = aws_service.predict_treatment_response(
            patient_id="test-patient-id",
            treatment_type="medication_ssri",
            treatment_details={
                "medication": "fluoxetine",
                "dosage": "10mg",
                "frequency": "daily"
            },
            clinical_data={
                "symptom_severity": 5,
                "previous_medication_response": True
            }
        )
        
        # Check that SageMaker was called with the correct parameters
        sagemaker_client.invoke_endpoint.assert_called()
        
        # Verify the result
        assert result["prediction_id"] == "test-treatment-prediction-id"
        assert result["response_level"] == "good"
        assert result["response_score"] == 0.75
        assert result["confidence"] == 0.85
        assert result["time_to_response_days"] == 28
        assert "suggested_adjustments" in result
    
    def test_predict_treatment_response_validation_error(self, aws_service):
        """Test that predict_treatment_response handles validation errors correctly."""
        # Invalid treatment type
        with pytest.raises(ValidationError):
            aws_service.predict_treatment_response(
                patient_id="test-patient-id",
                treatment_type="invalid-treatment-type",
                treatment_details={},
                clinical_data={}
            )
        
        # Missing medication for medication treatment
        with pytest.raises(ValidationError):
            aws_service.predict_treatment_response(
                patient_id="test-patient-id",
                treatment_type="medication_ssri",
                treatment_details={},
                clinical_data={}
            )
        
        # Missing frequency for therapy treatment
        with pytest.raises(ValidationError):
            aws_service.predict_treatment_response(
                patient_id="test-patient-id",
                treatment_type="therapy_cbt",
                treatment_details={},
                clinical_data={}
            )
    
    def test_predict_outcome(self, aws_service, mock_sagemaker_client):
        """Test the predict_outcome method."""
        # Mock response for outcome prediction
        sagemaker_client = mock_sagemaker_client.return_value
        mock_response = {
            "Body": MagicMock()
        }
        mock_response["Body"].read.return_value = json.dumps({
            "prediction_id": "test-outcome-prediction-id",
            "domains": [
                {"name": "symptom_improvement", "score": 0.65},
                {"name": "functional_improvement", "score": 0.58},
                {"name": "quality_of_life_improvement", "score": 0.47}
            ],
            "confidence": 0.85,
            "features": {
                "baseline_severity": 0.7,
                "treatment_intensity": 0.6
            },
            "influencing_factors": [
                {
                    "name": "treatment_adherence",
                    "impact": 0.75,
                    "description": "Treatment Adherence is significantly improving the outcome.",
                    "category": "treatment"
                }
            ]
        }).encode()
        
        sagemaker_client.invoke_endpoint.return_value = mock_response
        
        # Test successful prediction
        result = aws_service.predict_outcome(
            patient_id="test-patient-id",
            outcome_timeframe={"weeks": 12},
            clinical_data={
                "baseline_severity": 5,
                "functional_status": 7
            },
            treatment_plan={
                "interventions": ["medication", "psychotherapy"],
                "intensity": "weekly"
            },
            outcome_type="symptom"
        )
        
        # Check that SageMaker was called with the correct parameters
        sagemaker_client.invoke_endpoint.assert_called()
        
        # Verify the result
        assert result["prediction_id"] == "test-outcome-prediction-id"
        assert "outcome_metrics" in result
        assert result["outcome_metrics"]["symptom_improvement"] == 0.65
        assert result["confidence"] == 0.85
        assert "influencing_factors" in result
    
    def test_predict_outcome_validation_error(self, aws_service):
        """Test that predict_outcome handles validation errors correctly."""
        # Invalid outcome timeframe
        with pytest.raises(ValidationError):
            aws_service.predict_outcome(
                patient_id="test-patient-id",
                outcome_timeframe={},
                clinical_data={},
                treatment_plan={}
            )
    
    def test_get_feature_importance(self, aws_service, mock_dynamodb_resource):
        """Test the get_feature_importance method."""
        # Test successful feature importance retrieval
        result = aws_service.get_feature_importance(
            patient_id="test-patient-id",
            model_type="relapse-risk",
            prediction_id="test-prediction-id"
        )
        
        # Check that DynamoDB was queried with the correct parameters
        dynamodb_resource = mock_dynamodb_resource.return_value
        table = dynamodb_resource.Table.return_value
        table.get_item.assert_called_with(
            Key={"prediction_id": "test-prediction-id"}
        )
        
        # Verify the result
        assert "feature_importance" in result
        assert "visualization" in result
    
    def test_get_feature_importance_not_found(self, aws_service, mock_dynamodb_resource):
        """Test that get_feature_importance handles not found errors correctly."""
        # Mock empty response from DynamoDB
        dynamodb_resource = mock_dynamodb_resource.return_value
        table = dynamodb_resource.Table.return_value
        table.get_item.return_value = {}
        
        # Resource not found
        with pytest.raises(ResourceNotFoundError):
            aws_service.get_feature_importance(
                patient_id="test-patient-id",
                model_type="relapse-risk",
                prediction_id="test-prediction-id"
            )
    
    def test_get_feature_importance_patient_mismatch(self, aws_service, mock_dynamodb_resource):
        """Test that get_feature_importance validates patient ID."""
        # Mock response with different patient ID
        dynamodb_resource = mock_dynamodb_resource.return_value
        table = dynamodb_resource.Table.return_value
        table.get_item.return_value = {
            "Item": {
                "prediction_id": "test-prediction-id",
                "patient_id": "different-patient-id",
                "model_type": "relapse-risk",
                "timestamp": "2025-03-01T00:00:00Z",
                "data": json.dumps({
                    "prediction_id": "test-prediction-id",
                    "patient_id": "different-patient-id",
                    "risk_level": "moderate",
                    "risk_score": 0.5
                })
            }
        }
        
        # Patient ID mismatch
        with pytest.raises(ValidationError):
            aws_service.get_feature_importance(
                patient_id="test-patient-id",
                model_type="relapse-risk",
                prediction_id="test-prediction-id"
            )
    
    def test_integrate_with_digital_twin(self, aws_service, mock_lambda_client):
        """Test the integrate_with_digital_twin method."""
        # Test successful integration
        result = aws_service.integrate_with_digital_twin(
            patient_id="test-patient-id",
            profile_id="test-profile-id",
            prediction_id="test-prediction-id"
        )
        
        # Check that Lambda was called with the correct parameters
        lambda_client = mock_lambda_client.return_value
        lambda_client.invoke.assert_called_once()
        
        # Verify the result
        assert result["integration_id"] == "test-integration-id"
        assert result["status"] == "success"
        assert result["patient_id"] == "test-patient-id"
        assert result["profile_id"] == "test-profile-id"
        assert result["prediction_id"] == "test-prediction-id"
    
    def test_integrate_with_digital_twin_no_lambda(self):
        """Test that integrate_with_digital_twin handles missing Lambda config."""
        # Initialize the service without Lambda config
        service = AWSXGBoostService()
        service.initialize({
            "region_name": "us-east-1"
        })
        
        # No Lambda client configured
        with pytest.raises(ConfigurationError):
            service.integrate_with_digital_twin(
                patient_id="test-patient-id",
                profile_id="test-profile-id",
                prediction_id="test-prediction-id"
            )
    
    def test_get_model_info(self, aws_service):
        """Test the get_model_info method."""
        # Test successful model info retrieval
        result = aws_service.get_model_info("relapse-risk")
        
        # Verify the result
        assert result["model_type"] == "relapse-risk"
        assert "description" in result
        assert "features" in result
        assert "performance_metrics" in result
        assert "status" in result
        assert result["status"] == "active"
        assert result["endpoint"] == "relapse-risk-endpoint"
    
    def test_get_model_info_not_found(self, aws_service):
        """Test that get_model_info handles not found errors correctly."""
        # Invalid model type
        with pytest.raises(ModelNotFoundError):
            aws_service.get_model_info("invalid-model-type")
    
    def test_handle_aws_error(self):
        """Test the _handle_aws_error method."""
        service = AWSXGBoostService()
        
        # ResourceNotFoundException
        error_response = {
            "Error": {
                "Code": "ResourceNotFoundException",
                "Message": "Resource not found"
            }
        }
        exception = ClientError(error_response, "test-operation")
        result = service._handle_aws_error(exception, "test-operation")
        assert isinstance(result, ResourceNotFoundError)
        
        # ValidationException
        error_response = {
            "Error": {
                "Code": "ValidationException",
                "Message": "Validation error"
            }
        }
        exception = ClientError(error_response, "test-operation")
        result = service._handle_aws_error(exception, "test-operation")
        assert isinstance(result, ValidationError)
        
        # ModelError
        error_response = {
            "Error": {
                "Code": "ModelError",
                "Message": "Model error"
            }
        }
        exception = ClientError(error_response, "test-operation")
        result = service._handle_aws_error(exception, "test-operation")
        assert isinstance(result, PredictionError)
        
        # Other AWS error
        error_response = {
            "Error": {
                "Code": "InternalServerError",
                "Message": "Internal server error"
            }
        }
        exception = ClientError(error_response, "test-operation")
        result = service._handle_aws_error(exception, "test-operation")
        assert isinstance(result, ServiceConnectionError)
        
        # Non-AWS error
        exception = ConnectionError("Connection error")
        result = service._handle_aws_error(exception, "test-operation")
        assert isinstance(result, ServiceConnectionError)
    
    def test_phi_detection(self, aws_service):
        """Test the PHI detection functionality."""
        # Test with privacy level STANDARD
        service = AWSXGBoostService()
        service.initialize({
            "region_name": "us-east-1",
            "privacy_level": PrivacyLevel.STANDARD
        })
        
        # Test with PHI in data - SSN should be detected with STANDARD level
        with pytest.raises(DataPrivacyError):
            service._check_phi_in_data({
                "ssn": "123-45-6789",
                "symptom_severity": 5
            })
        
        # Test with ENHANCED privacy level
        service = AWSXGBoostService()
        service.initialize({
            "region_name": "us-east-1",
            "privacy_level": PrivacyLevel.ENHANCED
        })
        
        # Test with PHI in data - Email should be detected with ENHANCED level
        with pytest.raises(DataPrivacyError):
            service._check_phi_in_data({
                "email": "patient@example.com",
                "symptom_severity": 5
            })
        
        # Test with MAXIMUM privacy level
        service = AWSXGBoostService()
        service.initialize({
            "region_name": "us-east-1",
            "privacy_level": PrivacyLevel.MAXIMUM
        })
        
        # Test with PHI in key names - should be detected with MAXIMUM level
        with pytest.raises(DataPrivacyError):
            service._check_phi_in_data({
                "patient_email": "patient@example.com",
                "symptom_severity": 5
            })
    
    def test_invoke_sagemaker_endpoint(self, aws_service, mock_sagemaker_client):
        """Test the _invoke_sagemaker_endpoint method."""
        # Test successful invocation
        result = aws_service._invoke_sagemaker_endpoint(
            model_type="relapse-risk",
            request_data={"patient_id": "test-patient-id"}
        )
        
        # Check that SageMaker was called with the correct parameters
        sagemaker_client = mock_sagemaker_client.return_value
        sagemaker_client.invoke_endpoint.assert_called_with(
            EndpointName="relapse-risk-endpoint",
            ContentType="application/json",
            Body=json.dumps({"patient_id": "test-patient-id"}).encode()
        )
        
        # Verify the result
        assert result["prediction_id"] == "test-prediction-id"
        
        # Test with default endpoint
        aws_service._invoke_sagemaker_endpoint(
            model_type="unknown-model-type",
            request_data={"patient_id": "test-patient-id"}
        )
        
        # Check that SageMaker was called with the default endpoint
        sagemaker_client.invoke_endpoint.assert_called_with(
            EndpointName="default-endpoint",
            ContentType="application/json",
            Body=json.dumps({"patient_id": "test-patient-id"}).encode()
        )
    
    def test_invoke_sagemaker_endpoint_errors(self, aws_service, mock_sagemaker_client):
        """Test error handling in _invoke_sagemaker_endpoint method."""
        sagemaker_client = mock_sagemaker_client.return_value
        
        # Test JSON decode error
        mock_response = {
            "Body": MagicMock()
        }
        mock_response["Body"].read.return_value = "invalid-json".encode()
        sagemaker_client.invoke_endpoint.return_value = mock_response
        
        with pytest.raises(PredictionError):
            aws_service._invoke_sagemaker_endpoint(
                model_type="relapse-risk",
                request_data={"patient_id": "test-patient-id"}
            )
        
        # Test model error
        error_response = {
            "Error": {
                "Code": "ModelError",
                "Message": "Model error"
            }
        }
        sagemaker_client.invoke_endpoint.side_effect = ClientError(
            error_response, "invoke_endpoint"
        )
        
        with pytest.raises(PredictionError):
            aws_service._invoke_sagemaker_endpoint(
                model_type="relapse-risk",
                request_data={"patient_id": "test-patient-id"}
            )
        
        # Test other AWS error
        error_response = {
            "Error": {
                "Code": "InternalServerError",
                "Message": "Internal server error"
            }
        }
        sagemaker_client.invoke_endpoint.side_effect = ClientError(
            error_response, "invoke_endpoint"
        )
        
        with pytest.raises(ServiceConnectionError):
            aws_service._invoke_sagemaker_endpoint(
                model_type="relapse-risk",
                request_data={"patient_id": "test-patient-id"}
            )
        
        # Test connection error
        sagemaker_client.invoke_endpoint.side_effect = ConnectionError("Connection error")
        
        with pytest.raises(ServiceConnectionError):
            aws_service._invoke_sagemaker_endpoint(
                model_type="relapse-risk",
                request_data={"patient_id": "test-patient-id"}
            )