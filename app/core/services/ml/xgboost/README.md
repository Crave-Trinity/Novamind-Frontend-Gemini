# XGBoost ML Service Module

## Overview

The XGBoost ML Service provides advanced machine learning capabilities for the HIPAA-compliant Concierge Psychiatry Platform. This module enables precise risk predictions, treatment response predictions, and clinical outcome forecasting for patients, enhancing the platform's clinical decision support capabilities.

Designed with clean architecture principles, this service module offers:

- **Risk predictions** (relapse, suicide, hospitalization)
- **Treatment response predictions** (medications, therapy, combined approaches)
- **Outcome predictions** (clinical, functional, quality of life)
- **Treatment comparisons** for personalized medicine
- **Feature importance analysis** for explainable AI
- **Digital twin integration** for comprehensive patient modeling

## Architecture

The module follows Clean Architecture with strict layering:

```
┌─────────────────────┐
│   API Endpoints     │   Presentation Layer (FastAPI routes & Pydantic schemas)
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  Service Interface  │   Domain Layer (Pure business logic and interfaces)
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│  Implementations    │   Data Layer (AWS implementation, Mock implementation)
└─────────────────────┘
```

### Design Patterns

The module implements several key design patterns:

1. **Strategy Pattern**: Different service implementations (AWS, Mock) can be interchanged
2. **Factory Pattern**: Service creation is handled by a factory that selects the appropriate implementation
3. **Observer Pattern**: Key events (predictions, validations) can trigger notifications
4. **Repository Pattern**: Data access is abstracted through clean interfaces

## Components

### 1. Interface (`interface.py`)

Defines the abstract service interface and domain models that all implementations must adhere to. This layer is technology-agnostic, allowing for different implementations.

Key elements:
- `XGBoostServiceInterface`: Abstract base class defining all service methods
- Domain models: `RiskPrediction`, `TreatmentPrediction`, `OutcomePrediction`
- Enums: `PredictionType`, `RiskLevel`, `ResponseLevel`, etc.

### 2. Exceptions (`exceptions.py`)

Domain-specific exceptions that provide clear error messaging and handling.

Key exceptions:
- `ModelNotFoundError`: When a required ML model is unavailable
- `PredictionError`: When prediction generation fails
- `InvalidFeatureError`: When required features are missing or invalid
- `DigitalTwinUpdateError`: When digital twin updates fail

### 3. Implementations

#### AWS Implementation (`aws.py`)

Production implementation using AWS services:
- **SageMaker**: For model hosting and inference
- **DynamoDB**: For prediction storage and retrieval
- **S3**: For model artifacts and metadata

This implementation follows HIPAA guidelines with:
- No PHI in logs
- Secure data storage and transmission
- Access controls and authentication

#### Mock Implementation (`mock.py`) 

Testing implementation that generates realistic predictions without external dependencies.

### 4. Factory (`factory.py`)

Factory pattern implementation for service creation:
- `XGBoostServiceFactory`: Creates the appropriate implementation
- `get_xgboost_service()`: Simple factory function

### 5. API Schemas (`api/schemas/xgboost.py`)

Pydantic schemas for the FastAPI endpoints, providing validation and documentation.

### 6. API Routes (`api/routes/xgboost.py`)

FastAPI endpoints exposing the service functionality with proper authentication and error handling.

## Usage Examples

### Risk Prediction

```python
from app.core.services.ml.xgboost import get_xgboost_service, PredictionType

# Get service instance
xgboost_service = get_xgboost_service()

# Predict relapse risk
risk_prediction = xgboost_service.predict_risk(
    patient_id="patient-123",
    risk_type=PredictionType.RISK_RELAPSE,
    features={
        "age": 45,
        "phq9_score": 15,
        "previous_hospitalizations": 1
    },
    time_frame_days=90
)

# Access results
print(f"Risk level: {risk_prediction.risk_level.value}")
print(f"Risk score: {risk_prediction.risk_score}")
print(f"Confidence: {risk_prediction.confidence}")
```

### Treatment Comparison

```python
# Compare treatment options
comparison = xgboost_service.compare_treatments(
    patient_id="patient-123",
    treatment_options=[
        {
            "category": "medication_ssri",
            "details": {"medication": "escitalopram", "dosage": 10}
        },
        {
            "category": "therapy_cbt",
            "details": {"frequency": "weekly", "duration_weeks": 12}
        }
    ],
    features={
        "age": 45,
        "phq9_score": 15,
        "previous_treatments": ["fluoxetine"]
    }
)

# Get recommended treatment
recommended = comparison["recommendation"]["recommended_treatment"]
```

## Security & HIPAA Compliance

The module implements several security features:

1. **Input Validation**: All inputs are validated through Pydantic schemas
2. **Authentication**: All API endpoints require proper authentication
3. **Authorization**: Patient access is verified before providing predictions
4. **Audit Trail**: Prediction validation tracks approvals and reviews
5. **Secure Storage**: AWS implementation uses HIPAA-eligible services
6. **PHI Protection**: No PHI is included in logs or diagnostic outputs

## Testing

Comprehensive tests are provided:

- **Unit Tests**: For service interfaces and implementations
- **Integration Tests**: For API endpoints
- **Mock Implementation**: For testing without external dependencies

## Configuration

Configuration is managed through environment variables or explicit parameters:

```python
# Example configuration
service = AWSXGBoostService(
    region_name="us-east-1",
    endpoint_prefix="xgboost-",
    dynamodb_table="predictions",
    s3_bucket="models"
)
```

## Future Enhancements

Potential future enhancements include:

1. **Explainable AI**: Enhanced model explanations with SHAP values
2. **Federated Learning**: Support for privacy-preserving distributed model training
3. **Continuous Learning**: Model retraining with feedback from clinical validation
4. **Multi-modal Data**: Integration with imaging and other data types
5. **Patient-specific Models**: Personalized models calibrated to individual patients