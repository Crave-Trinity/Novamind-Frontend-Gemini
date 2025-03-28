# Pretrained Actigraphy Transformer (PAT) Implementation Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Environment Setup](#environment-setup)
3. [Dependencies](#dependencies)
4. [Implementation Structure](#implementation-structure)
5. [Integration with Digital Twin](#integration-with-digital-twin)
6. [HIPAA Compliance](#hipaa-compliance)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [References](#references)

## Introduction

This implementation guide provides detailed instructions for integrating the Pretrained Actigraphy Transformer (PAT) into the Novamind digital twin psychiatry platform. PAT is a specialized transformer model designed to analyze actigraphy data for psychiatric assessment and monitoring.

The integration follows clean architecture principles, ensuring separation of concerns between domain logic, data handling, and infrastructure. This document complements the architecture overview (01_PAT_ARCHITECTURE_AND_INTEGRATION.md), AWS deployment guide (02_PAT_AWS_DEPLOYMENT_HIPAA.md), and API specifications (04_PAT_MICROSERVICE_API.md).

## Environment Setup

### Prerequisites

- Python 3.9+ with virtual environment
- TensorFlow 2.18.0 with GPU support (recommended for production)
- AWS CLI configured with appropriate IAM permissions
- Docker and Docker Compose for containerized deployment
- Access to AWS Bedrock service for model hosting

### Local Development Environment

1. **WSL2 Configuration**
   - Ensure proper symbolic links between WSL2 and Windows paths
   - Set appropriate file permissions (chmod -R 755) for cross-platform development
   - Configure VSCode to recognize both Windows and WSL2 paths

2. **Virtual Environment**
   - Create a dedicated virtual environment for PAT development
   - Install dependencies from requirements.txt with specific version pinning

3. **Environment Variables**
   - Configure the following in your .env file:
     - `PAT_MODEL_PROVIDER`: AWS service provider (default: 'bedrock')
     - `PAT_MODEL_ID`: Model identifier in AWS Bedrock
     - `PAT_AWS_REGION`: AWS region for Bedrock service
     - `PAT_BATCH_SIZE`: Processing batch size (default: 32)
     - `PAT_MAX_SEQUENCE_LENGTH`: Maximum sequence length for transformer input
     - `PAT_PHI_DETECTION_LEVEL`: PHI detection sensitivity (strict/moderate/relaxed)

4. **AWS Configuration**
   - Configure AWS credentials with permissions for Bedrock API access
   - Ensure IAM roles have appropriate permissions for model invocation
   - Set up AWS SDK with proper retry and timeout configurations

## Dependencies

### Core Dependencies

- **TensorFlow (2.18.0)**: Required for model inference and preprocessing
- **AWS SDK for Python (Boto3)**: For AWS Bedrock integration
- **FastAPI**: For RESTful API endpoints
- **Pydantic**: For data validation and settings management
- **SQLAlchemy**: For database interactions
- **PyArrow**: For efficient data transformation and serialization
- **Pandas**: For data manipulation and analysis

### HIPAA Compliance Dependencies

- **cryptography**: For encryption of PHI data
- **python-jose**: For JWT token handling
- **passlib**: For password hashing
- **PHI Detection Utilities**: Custom utilities for PHI detection and sanitization

### Development Dependencies

- **pytest**: For unit and integration testing
- **pytest-cov**: For test coverage reporting
- **black**: For code formatting
- **isort**: For import sorting
- **mypy**: For static type checking
- **flake8**: For linting

### Version Compatibility

Ensure all dependencies are compatible with the specified versions to avoid conflicts. The following combinations have been tested and verified:

- TensorFlow 2.18.0 with CUDA 12.2 and cuDNN 8.9
- Boto3 1.34.0+ for AWS Bedrock support
- FastAPI 0.109.0+ with Pydantic v2 compatibility
- SQLAlchemy 2.0.25+ for async support

## Implementation Structure

### Clean Architecture Overview

The PAT integration follows clean architecture principles with distinct layers:

1. **Domain Layer**: Core business logic and entities
2. **Data Layer**: Repositories and data access
3. **Application Layer**: Use cases and services
4. **Presentation Layer**: API endpoints and controllers

### Key Components

#### 1. Interface Definition

The `PATInterface` protocol defines the contract that all PAT implementations must follow:

- Located in `app/core/services/ml/pat_interface.py`
- Defines methods for analyzing actigraphy data
- Ensures type safety and clear API boundaries
- Follows the Protocol pattern from Python's typing module

#### 2. Implementation Providers

Multiple implementations of the PAT interface are available:

- **BedrockPAT**: AWS Bedrock implementation for production
  - Located in `app/core/services/ml/providers/bedrock_pat.py`
  - Handles AWS-specific configuration and API calls
  - Implements error handling and retries for AWS service

- **MockPAT**: Mock implementation for testing
  - Located in `app/core/services/ml/providers/mock_pat.py`
  - Simulates PAT behavior without external dependencies
  - Useful for unit testing and development

#### 3. Factory Pattern

The `MLServiceFactory` creates instances of ML services:

- Located in `app/core/services/ml/factory.py`
- Provides a method for creating PAT service instances
- Handles configuration and dependency injection
- Follows the Factory pattern for object creation

#### 4. Data Models

Pydantic models for data validation:

- Input models for actigraphy data
- Output models for analysis results
- Configuration models for service settings

## HIPAA Compliance

### PHI Handling

The PAT implementation adheres to strict HIPAA compliance requirements for handling Protected Health Information (PHI):

1. **Data Minimization**: Only essential PHI is collected and processed, following the principle of minimum necessary use.

2. **Data Encryption**: All PHI is encrypted both at rest and in transit using industry-standard encryption algorithms.

3. **Access Controls**: Role-based access controls restrict PHI access to authorized personnel only.

4. **Audit Trails**: Comprehensive audit logging tracks all PHI access, modifications, and transmissions.

### PHI Detection and Sanitization

The PAT service includes robust PHI detection and sanitization capabilities:

1. **Automated Detection**: The system automatically detects potential PHI in unstructured data using pattern matching and machine learning techniques.

2. **Configurable Sensitivity**: PHI detection sensitivity can be configured (strict/moderate/relaxed) based on clinical requirements.

3. **Sanitization**: Detected PHI can be automatically redacted, tokenized, or encrypted based on policy settings.

4. **Logging Protection**: All system logs are automatically sanitized to prevent accidental PHI exposure.

### AWS HIPAA Compliance

When deploying to AWS, the following HIPAA-compliant configurations are implemented:

1. **BAA Agreement**: Ensure a Business Associate Agreement (BAA) is in place with AWS.

2. **Approved Services**: Only use AWS services covered under the BAA, including:
   - Amazon Bedrock
   - Amazon S3 (with encryption)
   - Amazon RDS (with encryption)
   - AWS Lambda
   - Amazon ECS/EKS

3. **Network Security**:
   - VPC configuration with private subnets
   - Security groups with least privilege access
   - VPC endpoints for AWS services
   - Network ACLs for additional security

4. **Encryption Requirements**:
   - Server-side encryption for S3 buckets (AES-256)
   - TLS 1.2+ for all data in transit
   - KMS for key management
   - Database encryption for all RDS instances

### Compliance Monitoring

Continuous monitoring ensures ongoing HIPAA compliance:

1. **Automated Scanning**: Regular automated scans detect potential PHI leaks or compliance issues.

2. **Compliance Dashboards**: Real-time dashboards track compliance metrics and potential issues.

3. **Remediation Workflows**: Predefined workflows address compliance violations when detected.

4. **Regular Audits**: Scheduled compliance audits verify adherence to HIPAA requirements.

### Documentation and Training

Comprehensive documentation and training support HIPAA compliance:

1. **Compliance Documentation**: Detailed documentation of all HIPAA compliance measures.

2. **Developer Training**: Required training for all developers on HIPAA requirements.

3. **Incident Response**: Clear procedures for handling potential PHI breaches.

4. **Regular Updates**: Documentation is regularly updated to reflect current best practices and regulations.

## Integration with Digital Twin

### Architecture Integration

The PAT service integrates with the Novamind digital twin platform through a well-defined API layer, following these principles:

1. **Loose Coupling**: The PAT service is loosely coupled with the digital twin platform, communicating through clearly defined interfaces.

2. **Dependency Injection**: Services are injected through the dependency injection system to maintain clean architecture.

3. **Event-Driven Communication**: An event-driven approach enables asynchronous processing of actigraphy data.

### Data Flow

The integration follows this data flow pattern:

1. **Data Collection**: Actigraphy data is collected from wearable devices through the digital twin platform.

2. **Data Preprocessing**: Raw data is preprocessed to normalize formats and remove artifacts.

3. **PAT Analysis**: The PAT service analyzes the preprocessed data to extract behavioral patterns.

4. **Results Integration**: Analysis results are integrated into the patient's digital twin profile.

5. **Clinical Insights**: The digital twin platform generates clinical insights based on the PAT analysis.

### API Integration

The PAT service exposes RESTful endpoints that the digital twin platform can consume:

- **Upload Endpoint**: For submitting actigraphy data
- **Analysis Endpoint**: For requesting analysis of previously uploaded data
- **Status Endpoint**: For checking the status of ongoing analyses
- **Results Endpoint**: For retrieving completed analysis results

### Security Integration

The integration maintains HIPAA compliance through:

1. **Authentication**: JWT-based authentication for all API calls

2. **Authorization**: Role-based access control for different API endpoints

3. **Encryption**: End-to-end encryption of all patient data

4. **Audit Logging**: Comprehensive logging of all data access and modifications

### Configuration Integration

The PAT service is configured through environment variables that can be adjusted based on deployment environment:

```env
# PAT Configuration
PAT_MODEL_PROVIDER=bedrock
PAT_MODEL_ID=actigraphy-transformer-v1
PAT_AWS_REGION=us-west-2
PAT_BATCH_SIZE=32
PAT_MAX_SEQUENCE_LENGTH=1024
PAT_PHI_DETECTION_LEVEL=strict

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2

# HIPAA Compliance
HIPAA_LOG_SANITIZATION_ENABLED=true
HIPAA_PHI_DETECTION_LEVEL=strict
```

### Dependency Injection Setup

The PAT service is registered in the dependency injection container:

1. Register the PAT interface in the DI container

2. Configure the appropriate implementation (Bedrock or Mock)

3. Inject the PAT service into controllers and services that need it

## Testing Strategy

### Unit Testing

Unit tests ensure that individual components function correctly in isolation:

1. **Interface Testing**: Test the PAT interface implementation
2. **Mock Testing**: Use the MockPAT implementation for testing without external dependencies
3. **Factory Testing**: Test the MLServiceFactory for correct service creation

Example unit test:

```python
def test_pat_analysis():
    # Arrange
    mock_pat = MockPAT()
    mock_pat.initialize({
        "phi_detection_level": "strict"
    })
    
    # Act
    result = mock_pat.analyze_actigraphy(
        patient_id="test-patient",
        readings=[
            {"timestamp": "2023-01-01T00:00:00Z", "x": 0.1, "y": 0.2, "z": 0.3}
        ]
    )
    
    # Assert
    assert "activity_score" in result
    assert "sleep_quality" in result
    assert "behavioral_patterns" in result
```

### Integration Testing

Integration tests verify that components work together correctly:

1. **API Testing**: Test the PAT API endpoints
2. **Service Integration**: Test the integration between PAT and other services
3. **Data Flow Testing**: Test the complete data flow from input to output

Example integration test:

```python
async def test_pat_api_integration():
    # Arrange
    client = TestClient(app)
    test_data = {
        "patient_id": "test-patient",
        "readings": [
            {"timestamp": "2023-01-01T00:00:00Z", "x": 0.1, "y": 0.2, "z": 0.3}
        ]
    }
    
    # Act
    response = client.post("/api/v1/pat/analyze", json=test_data)
    
    # Assert
    assert response.status_code == 200
    result = response.json()
    assert "activity_score" in result
    assert "sleep_quality" in result
```

### HIPAA Compliance Testing

Specialized tests ensure HIPAA compliance:

1. **PHI Detection Testing**: Test the PHI detection and sanitization capabilities
2. **Access Control Testing**: Test role-based access controls
3. **Encryption Testing**: Test data encryption at rest and in transit
4. **Audit Logging Testing**: Test comprehensive audit logging

Example HIPAA compliance test:

```python
def test_phi_detection_and_sanitization():
    # Arrange
    phi_detector = PHIDetector(level="strict")
    text_with_phi = "Patient John Doe (DOB: 01/01/1980) reports sleep disturbances."
    
    # Act
    detected_phi = phi_detector.detect(text_with_phi)
    sanitized_text = phi_detector.sanitize(text_with_phi)
    
    # Assert
    assert len(detected_phi) == 2  # Name and DOB
    assert "John Doe" not in sanitized_text
    assert "01/01/1980" not in sanitized_text
```

## Deployment

### Containerization

The PAT service is containerized using Docker:

1. **Base Image**: Use the TensorFlow GPU image as the base
2. **Dependencies**: Install all required dependencies
3. **Configuration**: Configure environment variables
4. **Entrypoint**: Set the entrypoint to the FastAPI application

Example Dockerfile:

```dockerfile
FROM tensorflow/tensorflow:2.18.0-gpu

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PAT_MODEL_PROVIDER=bedrock
ENV PAT_MODEL_ID=actigraphy-transformer-v1
ENV PAT_AWS_REGION=us-west-2
ENV PAT_BATCH_SIZE=32
ENV PAT_MAX_SEQUENCE_LENGTH=1024
ENV PAT_PHI_DETECTION_LEVEL=strict

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### AWS Deployment

Deploy the PAT service to AWS using ECS or EKS:

1. **ECR Repository**: Create an ECR repository for the PAT service
2. **ECS Cluster**: Create an ECS cluster for running the service
3. **Task Definition**: Define the ECS task with appropriate resources
4. **Service Definition**: Define the ECS service with desired count and scaling policies

Example AWS CLI commands:

```bash
# Create ECR repository
aws ecr create-repository --repository-name pat-service

# Build and push Docker image
docker build -t pat-service .
docker tag pat-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/pat-service:latest
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/pat-service:latest

# Create ECS cluster
aws ecs create-cluster --cluster-name pat-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service --cli-input-json file://service-definition.json
```

### Monitoring and Logging

Configure monitoring and logging for the PAT service:

1. **CloudWatch Logs**: Configure CloudWatch Logs for centralized logging
2. **CloudWatch Metrics**: Configure CloudWatch Metrics for performance monitoring
3. **X-Ray Tracing**: Enable X-Ray tracing for request tracking
4. **Alarms**: Set up CloudWatch Alarms for alerting on issues

Example monitoring configuration:

```python
# Configure AWS X-Ray
app.add_middleware(XRayMiddleware)

# Configure CloudWatch Logs
logger = logging.getLogger("pat_service")
handler = watchtower.CloudWatchLogHandler(log_group="pat-service-logs")
logger.addHandler(handler)

# Configure CloudWatch Metrics
metrics = cloudwatch.MetricsLogger(namespace="PAT/Service")
```

## Troubleshooting

### Common Issues

#### 1. AWS Bedrock Access Issues

**Symptoms**: 
- Error messages about AWS Bedrock access denied
- Unable to invoke the model

**Solutions**:
- Verify IAM permissions for the AWS Bedrock service
- Check AWS credentials configuration
- Ensure the model ID is correct and available in your region
- Verify that the AWS Bedrock service is available in your region

#### 2. Performance Issues

**Symptoms**:
- Slow response times for actigraphy analysis
- High memory usage

**Solutions**:
- Adjust batch size for optimal performance
- Optimize preprocessing pipeline
- Consider GPU acceleration for inference
- Scale the service horizontally for higher throughput

#### 3. HIPAA Compliance Issues

**Symptoms**:
- PHI detected in logs
- Failed compliance audits

**Solutions**:
- Verify PHI detection and sanitization configuration
- Ensure all logs are properly sanitized
- Check encryption configuration for data at rest and in transit
- Review access controls and permissions

### Debugging Strategies

1. **Logging**: Enable detailed logging for troubleshooting
2. **Tracing**: Use AWS X-Ray for request tracing
3. **Metrics**: Monitor performance metrics in CloudWatch
4. **Testing**: Use the MockPAT implementation for isolated testing

## References

- [01_PAT_ARCHITECTURE_AND_INTEGRATION.md](01_PAT_ARCHITECTURE_AND_INTEGRATION.md)
- [02_PAT_AWS_DEPLOYMENT_HIPAA.md](02_PAT_AWS_DEPLOYMENT_HIPAA.md)
- [04_PAT_MICROSERVICE_API.md](04_PAT_MICROSERVICE_API.md)

## Appendix A: Code Examples

### Installation

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Configuration

Create a `.env` file with the following configuration:

```env
# PAT Configuration
PAT_MODEL_PROVIDER=bedrock
PAT_MODEL_ID=actigraphy-transformer-v1
PAT_AWS_REGION=us-west-2
PAT_BATCH_SIZE=32
PAT_MAX_SEQUENCE_LENGTH=1024
PAT_PHI_DETECTION_LEVEL=strict

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2

# HIPAA Compliance
HIPAA_LOG_SANITIZATION_ENABLED=true
HIPAA_PHI_DETECTION_LEVEL=strict
```

### Example Implementation

```python
from typing import Dict, List, Any, Optional
from app.core.services.ml.pat_interface import PATInterface
from app.core.services.ml.factory import MLServiceFactory
from app.core.config import settings

# Create PAT service instance
pat_service: PATInterface = MLServiceFactory.create_pat_service(
    config={
        "provider": settings.PAT_MODEL_PROVIDER,
        "model_id": settings.PAT_MODEL_ID,
        "region": settings.PAT_AWS_REGION,
        "batch_size": settings.PAT_BATCH_SIZE,
        "max_sequence_length": settings.PAT_MAX_SEQUENCE_LENGTH,
        "phi_detection_level": settings.PAT_PHI_DETECTION_LEVEL
    }
)

# Analyze actigraphy data
results = pat_service.analyze_actigraphy(
    patient_id="patient-123",
    readings=[
        {"timestamp": "2023-01-01T00:00:00Z", "x": 0.1, "y": 0.2, "z": 0.3},
        {"timestamp": "2023-01-01T00:00:01Z", "x": 0.2, "y": 0.3, "z": 0.4},
        # More readings...
    ],
    options={
        "include_raw_metrics": True,
        "generate_visualizations": True
    }
)
```