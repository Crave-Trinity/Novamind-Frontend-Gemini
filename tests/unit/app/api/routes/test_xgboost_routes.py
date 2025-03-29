
"""
Unit tests for the XGBoost API routes.

These tests verify that the FastAPI endpoints for the XGBoost service
work correctly, with proper authentication, validation, and error handling.
"""

import pytest
import json
from unittest.mock import Mock, MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from datetime import datetime

from app.api.routes.xgboost import router, get_xgboost_service, get_current_user
from app.api.schemas.xgboost import (
    RiskType, TreatmentCategory, OutcomeType, ValidationStatus,
    RiskPredictionRequest, TreatmentPredictionRequest, OutcomePredictionRequest,
    DigitalTwinUpdateRequest, PredictionValidationRequest, TreatmentOption,
    TreatmentComparisonRequest
)
from app.core.services.ml.xgboost import (
    XGBoostInterface,
    ValidationError,
    DataPrivacyError,
    ResourceNotFoundError,
    ModelNotFoundError,
    PredictionError,
    ServiceConnectionError
)


# Mock service class for testing
class MockXGBoostService(XGBoostInterface):
    """Mock implementation of XGBoostInterface for testing."""
    
    def __init__(self):
        """Initialize the mock service."""
        super().__init__()
        self._initialized = True
        self.calls = []
    
    def initialize(self, config):
        """Mock initialization."""
        self.calls.append(("initialize", config))
        self._initialized = True
    
    def predict_risk(self, patient_id, risk_type, clinical_data, **kwargs):
        """Mock risk prediction."""
        self.calls.append(("predict_risk", patient_id, risk_type, clinical_data, kwargs))
        
        # Return a mock result
        return {
            "prediction_id": "test-prediction-id",
            "patient_id": patient_id,
            "risk_type": risk_type,
            "risk_level": "moderate",
            "risk_score": 0.5,
            "confidence": 0.8,
            "time_frame_days": kwargs.get("time_frame_days", 30),
            "features_used": list(clinical_data.keys()),
            "contributing_factors": [
                {
                    "name": "symptom_severity",
                    "impact": 0.7,
                    "description": "Symptom Severity is significantly increasing the risk."
                }
            ],
            "model_id": "test-model-id"
        }
    
    def predict_treatment_response(self, patient_id, treatment_type, treatment_details, clinical_data, **kwargs):
        """Mock treatment response prediction."""
        self.calls.append(("predict_treatment_response", patient_id, treatment_type, treatment_details, clinical_data, kwargs))
        
        # Return a mock result
        return {
            "prediction_id": "test-prediction-id",
            "patient_id": patient_id,
            "treatment_type": treatment_type,
            "treatment_details": treatment_details,
            "response_level": "good",
            "response_score": 0.75,
            "confidence": 0.85,
            "time_to_response_days": 28,
            "features_used": list(clinical_data.keys()),
            "suggested_adjustments": [
                {
                    "adjustment_type": "dosage",
                    "suggestion": "Consider increasing dosage to 20mg",
                    "reasoning": "Current dosage may be subtherapeutic"
                }
            ],
            "model_id": "test-model-id"
        }
    
    def predict_outcome(self, patient_id, outcome_timeframe, clinical_data, treatment_plan, **kwargs):
        """Mock outcome prediction."""
        self.calls.append(("predict_outcome", patient_id, outcome_timeframe, clinical_data, treatment_plan, kwargs))
        
        # Return a mock result
        return {
            "prediction_id": "test-prediction-id",
            "patient_id": patient_id,
            "outcome_metrics": {
                "symptom_improvement": 0.65,
                "functional_improvement": 0.58,
                "quality_of_life_improvement": 0.47
            },
            "confidence": 0.85,
            "time_frame_days": outcome_timeframe.get("weeks", 12) * 7,
            "features_used": list(clinical_data.keys()),
            "influencing_factors": [
                {
                    "name": "treatment_adherence",
                    "impact": 0.75,
                    "description": "Treatment Adherence is significantly improving the outcome.",
                    "category": "treatment"
                }
            ],
            "model_id": "test-model-id"
        }
    
    def get_feature_importance(self, patient_id, model_type, prediction_id):
        """Mock feature importance retrieval."""
        self.calls.append(("get_feature_importance", patient_id, model_type, prediction_id))
        
        # Return a mock result
        return {
            "prediction_id": prediction_id,
            "patient_id": patient_id,
            "model_type": model_type,
            "feature_importance": {
                "symptom_severity": 0.7,
                "medication_adherence": 0.4,
                "previous_episodes": 0.3,
                "social_support": -0.2,
                "stress_level": 0.5
            },
            "visualization": {
                "type": "bar_chart",
                "data": {
                    "labels": ["symptom_severity", "medication_adherence", "previous_episodes", "social_support", "stress_level"],
                    "values": [0.7, 0.4, 0.3, -0.2, 0.5]
                }
            }
        }
    
    def integrate_with_digital_twin(self, patient_id, profile_id, prediction_id):
        """Mock digital twin integration."""
        self.calls.append(("integrate_with_digital_twin", patient_id, profile_id, prediction_id))
        
        # Return a mock result
        return {
            "integration_id": "test-integration-id",
            "patient_id": patient_id,
            "profile_id": profile_id,
            "prediction_id": prediction_id,
            "status": "success",
            "details": {
                "digital_twin_updated": True
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def get_model_info(self, model_type):
        """Mock model info retrieval."""
        self.calls.append(("get_model_info", model_type))
        
        if model_type == "invalid-model-type":
            raise ModelNotFoundError(f"Model not found: {model_type}", model_type=model_type)
        
        # Return a mock result
        return {
            "model_type": model_type,
            "version": "1.0.0",
            "last_updated": "2025-03-01T00:00:00Z",
            "description": "Mock model for testing",
            "features": ["symptom_severity", "medication_adherence", "previous_episodes"],
            "performance_metrics": {
                "accuracy": 0.85,
                "precision": 0.83,
                "recall": 0.87,
                "f1_score": 0.85,
                "auc_roc": 0.92
            },
            "status": "active",
            "endpoint": f"{model_type}-endpoint"
        }


# Create a test app with the router
@pytest.fixture
def app():
    """Create a test FastAPI app with the XGBoost router."""
    app = FastAPI()
    app.include_router(router)
    return app


@pytest.fixture
def mock_service():
    """Create a mock XGBoost service."""
    return MockXGBoostService()


@pytest.fixture
def client(app, mock_service):
    """Create a test client with the mock service."""
    # Override the dependency injection
    app.dependency_overrides[get_xgboost_service] = lambda: mock_service
    
    # Override the authentication dependency
    app.dependency_overrides[get_current_user] = lambda credentials=None: {
        "user_id": "test-user",
        "role": "psychiatrist",
        "permissions": ["ml:read", "ml:write"]
    }
    
    return TestClient(app)


class TestXGBoostRoutes:
    """Tests for the XGBoost API routes."""
    
    def test_health_check(self, client, mock_service):
        """Test the health check endpoint."""
        response = client.get("/api/v1/xgboost/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert "components" in response.json()
        assert "models" in response.json()
    
    def test_predict_risk(self, client, mock_service):
        """Test the risk prediction endpoint."""
        # Define the request
        request_data = {
            "patient_id": "test-patient-id",
            "risk_type": RiskType.RELAPSE,
            "features": {
                "symptom_severity": 5,
                "medication_adherence": 3,
                "previous_episodes": 2,
                "social_support": 4,
                "stress_level": 6
            },
            "time_frame_days": 30
        }
        
        # Make the request
        response = client.post(
            "/api/v1/xgboost/risk",
            json=request_data
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["prediction_id"] == "test-prediction-id"
        assert response.json()["patient_id"] == "test-patient-id"
        assert response.json()["risk_level"] == "moderate"
        assert response.json()["risk_score"] == 0.5
        assert response.json()["contributing_factors"][0]["name"] == "symptom_severity"
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 1
        assert mock_service.calls[0][0] == "predict_risk"
        assert mock_service.calls[0][1] == "test-patient-id"
        assert mock_service.calls[0][2] == "relapse"
    
    def test_predict_treatment_response(self, client, mock_service):
        """Test the treatment response prediction endpoint."""
        # Define the request
        request_data = {
            "patient_id": "test-patient-id",
            "treatment_category": TreatmentCategory.MEDICATION_SSRI,
            "treatment_details": {
                "medication": "fluoxetine",
                "dosage": "10mg",
                "frequency": "daily"
            },
            "features": {
                "symptom_severity": 5,
                "previous_medication_response": True,
                "age": 42,
                "weight_kg": 70,
                "comorbidities": ["anxiety", "insomnia"]
            }
        }
        
        # Make the request
        response = client.post(
            "/api/v1/xgboost/treatment",
            json=request_data
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["prediction_id"] == "test-prediction-id"
        assert response.json()["patient_id"] == "test-patient-id"
        assert response.json()["treatment_category"] == TreatmentCategory.MEDICATION_SSRI
        assert response.json()["response_level"] == "good"
        assert response.json()["response_score"] == 0.75
        assert response.json()["suggested_adjustments"][0]["adjustment_type"] == "dosage"
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 1
        assert mock_service.calls[0][0] == "predict_treatment_response"
        assert mock_service.calls[0][1] == "test-patient-id"
        assert mock_service.calls[0][2] == "medication_ssri"
    
    def test_predict_outcome(self, client, mock_service):
        """Test the outcome prediction endpoint."""
        # Define the request
        request_data = {
            "patient_id": "test-patient-id",
            "outcome_type": OutcomeType.SYMPTOM,
            "features": {
                "symptom_severity": 5,
                "functional_status": 7,
                "interventions": ["medication", "psychotherapy"],
                "intensity": "weekly",
                "treatment_history": "partial_response"
            },
            "time_frame_days": 90
        }
        
        # Make the request
        response = client.post(
            "/api/v1/xgboost/outcome",
            json=request_data
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["prediction_id"] == "test-prediction-id"
        assert response.json()["patient_id"] == "test-patient-id"
        assert "outcome_metrics" in response.json()
        assert response.json()["outcome_metrics"]["symptom_improvement"] == 0.65
        assert response.json()["confidence"] == 0.85
        assert response.json()["time_frame_days"] == 90
        assert response.json()["influencing_factors"][0]["name"] == "treatment_adherence"
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 1
        assert mock_service.calls[0][0] == "predict_outcome"
        assert mock_service.calls[0][1] == "test-patient-id"
    
    def test_get_feature_importance(self, client, mock_service):
        """Test the feature importance endpoint."""
        # Make the request
        response = client.get(
            "/api/v1/xgboost/feature-importance/test-prediction-id"
            "?patient_id=test-patient-id&model_type=relapse-risk"
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["model_id"] == "relapse-risk"
        assert "features" in response.json()
        assert len(response.json()["features"]) == 5
        assert response.json()["features"][0]["feature_id"] == "symptom_severity"
        assert response.json()["features"][0]["importance"] == 0.7
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 1
        assert mock_service.calls[0][0] == "get_feature_importance"
        assert mock_service.calls[0][1] == "test-patient-id"
        assert mock_service.calls[0][2] == "relapse-risk"
        assert mock_service.calls[0][3] == "test-prediction-id"
    
    def test_integrate_with_digital_twin(self, client, mock_service):
        """Test the digital twin integration endpoint."""
        # Define the request
        request_data = {
            "patient_id": "test-patient-id",
            "prediction_ids": ["test-prediction-id-1", "test-prediction-id-2"]
        }
        
        # Make the request
        response = client.post(
            "/api/v1/xgboost/digital-twin/integrate",
            json=request_data
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["patient_id"] == "test-patient-id"
        assert response.json()["digital_twin_updated"] is True
        assert response.json()["prediction_count"] == 2
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 2
        assert mock_service.calls[0][0] == "integrate_with_digital_twin"
        assert mock_service.calls[0][1] == "test-patient-id"
        assert "profile-" in mock_service.calls[0][2]
        assert mock_service.calls[0][3] == "test-prediction-id-1"
    
    def test_get_model_info(self, client, mock_service):
        """Test the model info endpoint."""
        # Make the request
        response = client.get("/api/v1/xgboost/models/relapse-risk")
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["model_id"] == "relapse-risk"
        assert response.json()["model_name"] == "Relapse Risk"
        assert response.json()["version"] == "1.0.0"
        assert response.json()["status"] == "active"
        assert "performance_metrics" in response.json()
        assert "feature_requirements" in response.json()
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 1
        assert mock_service.calls[0][0] == "get_model_info"
        assert mock_service.calls[0][1] == "relapse-risk"
    
    def test_list_models(self, client, mock_service):
        """Test the list models endpoint."""
        # Make the request
        response = client.get("/api/v1/xgboost/models")
        
        # Check the response
        assert response.status_code == 200
        assert "count" in response.json()
        assert "models" in response.json()
        
        # Check that the service was called multiple times to get model info
        assert len(mock_service.calls) >= 1
        assert mock_service.calls[0][0] == "get_model_info"
    
    def test_validate_prediction(self, client, mock_service):
        """Test the prediction validation endpoint."""
        # Define the request
        request_data = {
            "status": ValidationStatus.CONFIRMED,
            "clinical_notes": "Patient confirms significant improvement with current treatment regimen.",
            "suggested_adjustments": {
                "risk_level": "moderate",
                "notes": "Patient's recent medication adherence suggests lower risk than predicted."
            }
        }
        
        # Make the request
        response = client.post(
            "/api/v1/xgboost/validate/test-prediction-id",
            json=request_data
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["prediction_id"] == "test-prediction-id"
        assert response.json()["status"] == ValidationStatus.CONFIRMED
        assert response.json()["validator"] == "test-user"
        assert response.json()["success"] is True
    
    def test_compare_treatments(self, client, mock_service):
        """Test the treatment comparison endpoint."""
        # Define the request
        request_data = {
            "patient_id": "test-patient-id",
            "treatment_options": [
                {
                    "category": TreatmentCategory.MEDICATION_SSRI,
                    "details": {
                        "medication": "fluoxetine",
                        "dosage": "10mg",
                        "frequency": "daily"
                    }
                },
                {
                    "category": TreatmentCategory.MEDICATION_SNRI,
                    "details": {
                        "medication": "venlafaxine",
                        "dosage": "75mg",
                        "frequency": "daily"
                    }
                }
            ],
            "features": {
                "symptom_severity": 5,
                "previous_medication_response": True,
                "age": 42,
                "weight_kg": 70,
                "comorbidities": ["anxiety", "insomnia"]
            }
        }
        
        # Make the request
        response = client.post(
            "/api/v1/xgboost/treatment/compare",
            json=request_data
        )
        
        # Check the response
        assert response.status_code == 200
        assert response.json()["patient_id"] == "test-patient-id"
        assert response.json()["treatments_compared"] == 2
        assert "results" in response.json()
        assert len(response.json()["results"]) == 2
        assert "recommendation" in response.json()
        
        # Check that the service was called with the correct parameters
        assert len(mock_service.calls) == 2
        assert mock_service.calls[0][0] == "predict_treatment_response"
        assert mock_service.calls[0][1] == "test-patient-id"
        assert mock_service.calls[0][2] == "medication_ssri"
    
    def test_error_handling(self, client, mock_service):
        """Test error handling in the API routes."""
        # Test ModelNotFoundError
        response = client.get("/api/v1/xgboost/models/invalid-model-type")
        assert response.status_code == 404
        assert "error_type" in response.json()
        assert response.json()["error_type"] == "ModelNotFoundError"
        
        # Test ValidationError
        # Patch the mock service to raise a ValidationError
        with patch.object(mock_service, "predict_risk", side_effect=ValidationError(
            "Invalid risk type", field="risk_type", value="invalid"
        )):
            response = client.post(
                "/api/v1/xgboost/risk",
                json={
                    "patient_id": "test-patient-id",
                    "risk_type": "invalid",
                    "features": {}
                }
            )
            assert response.status_code == 400
            assert "error_type" in response.json()
            assert response.json()["error_type"] == "ValidationError"
        
        # Test DataPrivacyError
        # Patch the mock service to raise a DataPrivacyError
        with patch.object(mock_service, "predict_risk", side_effect=DataPrivacyError(
            "PHI detected in input data", pattern_types=["SSN"]
        )):
            response = client.post(
                "/api/v1/xgboost/risk",
                json={
                    "patient_id": "test-patient-id",
                    "risk_type": RiskType.RELAPSE,
                    "features": {
                        "ssn": "123-45-6789"
                    }
                }
            )
            assert response.status_code == 400
            assert "error_type" in response.json()
            assert response.json()["error_type"] == "DataPrivacyError"
        
        # Test ResourceNotFoundError
        # Patch the mock service to raise a ResourceNotFoundError
        with patch.object(mock_service, "get_feature_importance", side_effect=ResourceNotFoundError(
            "Prediction not found", resource_type="prediction", resource_id="not-found"
        )):
            response = client.get(
                "/api/v1/xgboost/feature-importance/not-found"
                "?patient_id=test-patient-id&model_type=relapse-risk"
            )
            assert response.status_code == 404
            assert "error_type" in response.json()
            assert response.json()["error_type"] == "ResourceNotFoundError"
        
        # Test PredictionError
        # Patch the mock service to raise a PredictionError
        with patch.object(mock_service, "predict_risk", side_effect=PredictionError(
            "Model prediction failed", model_type="relapse-risk"
        )):
            response = client.post(
                "/api/v1/xgboost/risk",
                json={
                    "patient_id": "test-patient-id",
                    "risk_type": RiskType.RELAPSE,
                    "features": {}
                }
            )
            assert response.status_code == 500
            assert "error_type" in response.json()
            assert response.json()["error_type"] == "PredictionError"
        
        # Test ServiceConnectionError
        # Patch the mock service to raise a ServiceConnectionError
        with patch.object(mock_service, "predict_risk", side_effect=ServiceConnectionError(
            "Failed to connect to service", service="SageMaker", error_type="ConnectionError"
        )):
            response = client.post(
                "/api/v1/xgboost/risk",
                json={
                    "patient_id": "test-patient-id",
                    "risk_type": RiskType.RELAPSE,
                    "features": {}
                }
            )
            assert response.status_code == 500
            assert "error_type" in response.json()
            assert response.json()["error_type"] == "ServiceConnectionError"
    
    def test_authentication(self, app, mock_service):
        """Test authentication requirements."""
        # Override the authentication dependency to simulate unauthenticated request
        app.dependency_overrides[get_current_user] = lambda credentials=None: None
        
        # Create a client with the modified app
        unauthenticated_client = TestClient(app)
        
        # Try to access a protected endpoint
        response = unauthenticated_client.get("/api/v1/xgboost/models")
        
        # Check that authentication is required
        assert response.status_code == 401
    
    def test_permission_check(self, app, mock_service):
        """Test permission requirements."""
        # Override the authentication dependency to simulate a user without required permissions
        app.dependency_overrides[get_current_user] = lambda credentials=None: {
            "user_id": "test-user",
            "role": "patient",
            "permissions": []
        }
        
        # Create a client with the modified app
        unauthorized_client = TestClient(app)
        
        # Try to access an endpoint requiring ml:write permission
        response = unauthorized_client.post(
            "/api/v1/xgboost/risk",
            json={
                "patient_id": "test-patient-id",
                "risk_type": RiskType.RELAPSE,
                "features": {}
            }
        )
        
        # Check that permission is required
        assert response.status_code == 403