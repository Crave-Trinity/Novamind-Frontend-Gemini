# XGBoost Service Module

A HIPAA-compliant machine learning service for psychiatric predictions built for the Novamind Digital Twin platform.

## Overview

The XGBoost service provides psychiatric risk assessment, treatment outcome prediction, and digital twin integration using AWS SageMaker-hosted XGBoost models. This service is designed with an emphasis on both clinical excellence and robust security to meet the high standards of concierge psychiatry and HIPAA compliance.

## Architecture

This module is built following **Clean Architecture** principles with strict HIPAA compliance guardrails:

- **Domain Layer**: The core interface (`XGBoostInterface`) defines the contract without implementation details
- **Implementation Layer**: Concrete implementations (`AWSXGBoostService`, `MockXGBoostService`) provide specific functionality
- **Factory Pattern**: Service creation is handled through factory functions for easy dependency injection

### Design Patterns

- **Strategy Pattern**: Different service implementations can be swapped out without changing client code
- **Observer Pattern**: Events from the service can be observed by other components for notifications and logging
- **Factory Pattern**: Creation logic encapsulated in factory functions

## Features

- **Risk Prediction**: Predict psychiatric risk for relapse, suicide, hospitalization
- **Treatment Response**: Predict response to different treatment options (medication, therapy)
- **Outcome Prediction**: Project clinical outcomes based on treatment plans and patient factors
- **Feature Importance**: Analyze what factors contribute most to predictions
- **Digital Twin Integration**: Connect predictions with digital twin profiles
- **Model Information**: Access metadata about available models

## HIPAA Compliance

This service includes robust HIPAA compliance features:

- **PHI Detection**: Automatic scanning of input data to prevent PHI transmission
- **Data Minimization**: Only essential data is processed and stored
- **Audit Logging**: Observer pattern enables compliant audit logging
- **Error Sanitization**: Errors are sanitized to prevent PHI leakage
- **Secure AWS Integration**: Uses HIPAA-eligible AWS services

## Usage

### Basic Usage

```python
from app.core.services.ml.xgboost import create_xgboost_service_from_env

# Create service from environment variables
service = create_xgboost_service_from_env()

# Predict risk
risk_prediction = service.predict_risk(
    patient_id="patient-123",
    risk_type="relapse",
    clinical_data={
        "symptom_severity": "moderate",
        "treatment_adherence": "good",
        "previous_episodes": 2
    }
)

# Predict treatment response
treatment_prediction = service.predict_treatment_response(
    patient_id="patient-123",
    treatment_type="ssri",
    treatment_details={
        "medication": "fluoxetine",
        "dosage": "20mg"
    },
    clinical_data={
        "depression_severity": "moderate",
        "previous_ssri_response": "good"
    }
)
```

### Using the Observer Pattern

```python
from app.core.services.ml.xgboost import (
    create_xgboost_service,
    EventType
)

# Create an observer
class PredictionLogger:
    def update(self, event_type, data):
        print(f"Event: {event_type}, Data: {data}")

# Create service
service = create_xgboost_service("aws", {
    "region_name": "us-east-1"
})

# Register observer
logger = PredictionLogger()
service.register_observer(EventType.RISK_PREDICTION, logger)
service.register_observer(EventType.SERVICE_ERROR, logger)

# Use service as normal
prediction = service.predict_risk(...)
# Observer will be notified automatically
```

## Configuration

The service can be configured with the following options:

### Environment Variables

Set these environment variables to configure the service when using `create_xgboost_service_from_env()`:

- `XGBOOST_SERVICE_TYPE`: Service implementation (`aws` or `mock`)
- `XGBOOST_AWS_REGION`: AWS region for services
- `XGBOOST_PRIVACY_LEVEL`: Privacy level (1=Standard, 2=Enhanced, 3=Maximum)
- `XGBOOST_LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)
- `XGBOOST_DYNAMODB_TABLE`: DynamoDB table for prediction storage
- `XGBOOST_DIGITAL_TWIN_FUNCTION`: Lambda function for digital twin integration
- `XGBOOST_MODEL_ENDPOINTS_*`: SageMaker endpoint mappings for models

### Direct Configuration

You can also configure the service directly:

```python
from app.core.services.ml.xgboost import (
    create_xgboost_service,
    PrivacyLevel
)

service = create_xgboost_service("aws", {
    "region_name": "us-east-1",
    "privacy_level": PrivacyLevel.ENHANCED,
    "log_level": "INFO",
    "model_endpoints": {
        "relapse-risk": "xgboost-relapse-endpoint",
        "suicide-risk": "xgboost-suicide-endpoint"
    },
    "predictions_table": "xgboost-predictions",
    "digital_twin_function": "xgboost-digital-twin-lambda"
})
```

## Module Structure

```
app/core/services/ml/xgboost/
├── __init__.py           # Public exports and module initialization
├── interface.py          # Abstract interface and constants
├── exceptions.py         # Domain-specific exceptions
├── factory.py            # Factory pattern implementation
├── aws.py                # AWS SageMaker implementation
├── mock.py               # Mock implementation for testing
└── README.md             # This documentation
```

## Error Handling

The service uses domain-specific exceptions that should be handled by clients:

```python
from app.core.services.ml.xgboost import (
    XGBoostServiceError,
    ValidationError,
    DataPrivacyError
)

try:
    prediction = service.predict_risk(...)
except ValidationError as e:
    # Handle validation errors (e.g., missing required fields)
    print(f"Validation error: {e}")
except DataPrivacyError as e:
    # Handle PHI detection
    print(f"Privacy error: {e}")
except XGBoostServiceError as e:
    # Base class for all service errors
    print(f"Service error: {e}")
```

## Testing

The service includes comprehensive unit tests. To run the tests:

```bash
# Unit tests for the service implementation
pytest tests/unit/app/core/services/ml/xgboost/test_aws.py

# Unit tests for API endpoints
pytest tests/unit/app/api/routes/test_xgboost_routes.py
```

When writing tests that use the XGBoost service, you should:

1. Use the mock implementation for unit tests
2. Mock AWS dependencies when testing the AWS implementation
3. Test error conditions and edge cases
4. Ensure no PHI is used in test data

Example test setup:

```python
import pytest
from app.core.services.ml.xgboost import create_xgboost_service

@pytest.fixture
def xgboost_service():
    """Test fixture providing a mock XGBoost service."""
    return create_xgboost_service("mock", {})

def test_predict_risk(xgboost_service):
    """Test risk prediction."""
    result = xgboost_service.predict_risk(
        patient_id="test-123",
        risk_type="relapse",
        clinical_data={
            "symptom_severity": "moderate", 
            "treatment_adherence": "good"
        }
    )
    
    assert "prediction_id" in result
    assert "risk_level" in result
    assert "risk_score" in result
```

## API Integration

The service is exposed through FastAPI endpoints in `app/api/routes/xgboost.py`, with Pydantic schemas in `app/api/schemas/xgboost.py`. These endpoints provide a RESTful interface for the service functionality.

## HIPAA Security Features

The service implements several security features to ensure HIPAA compliance:

1. **PHI Detection**: Automatic scanning of input data for PHI patterns
2. **Privacy Levels**: Configurable privacy levels for different environments
3. **Secure AWS Integration**: Uses HIPAA-eligible AWS services
4. **Data Minimization**: Only necessary data is collected and processed
5. **Audit Logging**: Observer pattern enables comprehensive audit logging

## Contributing

When contributing to this module:

1. Follow the existing architecture and design patterns
2. Ensure HIPAA compliance in all changes
3. Write comprehensive unit tests
4. Document all public APIs
5. Keep methods under 15 lines
6. Use domain-specific exceptions