# Backend API Comprehensive Analysis

## Overview

This document provides a detailed analysis of the backend API requirements for the Novamind Digital Twin platform. It analyzes the current frontend codebase to identify API requirements, outlines the backend structure needed, and provides implementation guidelines.

## Backend Structure Analysis

Based on our exploration of the backend repository, we can see it's a Python-based API likely using FastAPI (given the directory structure, alembic for migrations, and the main.py entry point). The backend is structured as follows:

- **FastAPI Application**: Main entry point in `main.py`
- **Database Migrations**: Using Alembic
- **Modular Organization**: App directory likely contains domains and routes
- **Testing**: Comprehensive pytest setup with coverage reports
- **Docker Support**: For containerized deployment
- **CI/CD**: GitHub Actions integration

## Required API Endpoints

### 1. Authentication & Authorization

Based on the frontend implementation in `ApiClient.ts` and `authClient.ts`, we need:

```
POST /api/v1/auth/login
- Request: { email: string, password: string }
- Response: { token: string, user: User }

GET /api/v1/auth/me
- Response: User

POST /api/v1/auth/logout
- Response: { success: boolean }

POST /api/v1/auth/refresh
- Request: { refresh_token: string }
- Response: { token: string }
```

### 2. Brain Model API

Based on `brainApiClient.ts` and `brain-model.service.ts`, we need:

```
GET /api/v1/brain-models/{modelId}
- Response: BrainModel

GET /api/v1/brain-models
- Query Params: patientId, pagination params
- Response: PaginatedResponse<BrainModel>

POST /api/v1/brain-models
- Request: Omit<BrainModel, 'id'> & { patientId: string }
- Response: BrainModel

PATCH /api/v1/brain-models/{modelId}
- Request: Partial<BrainModel>
- Response: BrainModel

DELETE /api/v1/brain-models/{modelId}
- Response: void

// Brain Region Operations
GET /api/v1/brain-models/{modelId}/regions/{regionId}
POST /api/v1/brain-models/{modelId}/regions
PATCH /api/v1/brain-models/{modelId}/regions/{regionId}
DELETE /api/v1/brain-models/{modelId}/regions/{regionId}

// Neural Connection Operations
GET /api/v1/brain-models/{modelId}/connections/{connectionId}
POST /api/v1/brain-models/{modelId}/connections
PATCH /api/v1/brain-models/{modelId}/connections/{connectionId}
DELETE /api/v1/brain-models/{modelId}/connections/{connectionId}

// Analysis Operations
POST /api/v1/brain-models/{modelId}/analyze/connectivity
POST /api/v1/brain-models/{modelId}/analyze/activity

// Simulation Operations
POST /api/v1/brain-models/{modelId}/simulate/activity
```

### 3. Patient API

Based on the frontend's `ApiClient.ts` and clinical service implementations:

```
GET /api/v1/patients
- Response: Patient[]

GET /api/v1/patients/{patientId}
- Response: Patient

POST /api/v1/patients
- Request: NewPatient
- Response: Patient

PATCH /api/v1/patients/{patientId}
- Request: Partial<Patient>
- Response: Patient

DELETE /api/v1/patients/{patientId}
- Response: void

// Risk Assessment
GET /api/v1/patients/{patientId}/risk-assessment
- Response: RiskAssessment

// Treatment Response Prediction
POST /api/v1/patients/{patientId}/predict-treatment
- Request: TreatmentData
- Response: TreatmentResponsePrediction

// Clinical Context
GET /api/v1/patients/{patientId}/clinical-context
- Response: ClinicalContext
```

### 4. Machine Learning API

Based on ML endpoints mentioned in mockApi.ts and backend structure:

```
POST /api/v1/ml/process
- Request: ProcessingParameters
- Response: ProcessingResults

POST /api/v1/ml/depression-detection
- Request: PatientData
- Response: DepressionDetectionResults

POST /api/v1/ml/risk-assessment
- Request: PatientData
- Response: RiskAssessmentResults

POST /api/v1/ml/sentiment-analysis
- Request: TextData
- Response: SentimentAnalysisResults

POST /api/v1/ml/wellness-dimensions
- Request: PatientData
- Response: WellnessDimensionResults

// Digital Twin
POST /api/v1/ml/digital-twin/conversation
- Request: ConversationData
- Response: ConversationResponse

GET /api/v1/ml/digital-twin/sessions
- Response: DigitalTwinSession[]

GET /api/v1/ml/digital-twin/sessions/{sessionId}
- Response: DigitalTwinSession

DELETE /api/v1/ml/digital-twin/sessions/{sessionId}
- Response: void

POST /api/v1/ml/digital-twin/insights
- Request: PatientData
- Response: DigitalTwinInsights

// PHI Detection/Redaction
POST /api/v1/ml/phi/detect
- Request: { text: string }
- Response: { detected: PHIDetection[] }

POST /api/v1/ml/phi/redact
- Request: { text: string }
- Response: { redacted: string }
```

### 5. Analytics API

Based on frontend requirements for analytics:

```
POST /api/v1/analytics/events
- Request: EventData
- Response: Event

POST /api/v1/analytics/events/batch
- Request: EventData[]
- Response: Event[]

POST /api/v1/analytics/aggregates
- Request: AggregationParameters
- Response: AggregatedData
```

### 6. Biometrics API

Based on frontend's biometric monitoring:

```
GET /api/v1/biometrics/alerts
- Response: BiometricAlert[]

POST /api/v1/biometrics/alerts
- Request: NewBiometricAlert
- Response: BiometricAlert

PATCH /api/v1/biometrics/alerts/{alertId}
- Request: Partial<BiometricAlert>
- Response: BiometricAlert

DELETE /api/v1/biometrics/alerts/{alertId}
- Response: void
```

## Core Data Models

### Brain Models

```typescript
interface BrainModel {
  id: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
  modelType: 'structural' | 'functional' | 'integrated';
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  processingLevel: 'raw' | 'processed' | 'analyzed';
  version: string;
  metadata: Record<string, unknown>;
  scan: ScanData;
  regions: BrainRegion[];
  diagnosticMarkers?: DiagnosticMarker[];
}

interface BrainRegion {
  id: string;
  name: string;
  volume: number;
  coordinates: [number, number, number];
  connections: {
    targetId: string;
    strength: number;
  }[];
  clinicalSignificance?: string[];
}

interface NeuralConnection {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  strength: number;
  type: 'structural' | 'functional';
  properties?: Record<string, unknown>;
}
```

### Patient Data

```typescript
interface Patient {
  id: string;
  demographicId: string;
  clinicalHistory: {
    conditionId: string;
    diagnosisDate: string;
    severity: number;
    status: 'active' | 'remission' | 'resolved';
    treatments: Treatment[];
  }[];
  assessmentScores: Record<string, AssessmentScore[]>;
  metadata: {
    lastUpdated: string;
  };
}

interface Treatment {
  id: string;
  type: 'medication' | 'therapy' | 'lifestyle' | 'other';
  startDate: string;
  endDate?: string;
  dosage?: string;
  frequency?: string;
  notes?: string;
}

interface AssessmentScore {
  date: string;
  score: number;
  clinicianId: string;
  notes?: string;
}
```

## Implementation Requirements

### 1. Authentication

The backend must implement JWT token-based authentication with:
- Token generation on login
- Token validation middleware
- Role-based access control
- Secure password handling (bcrypt)
- Token refresh mechanism

### 2. Database Schema

Based on the models above, we need:
- Patient table
- BrainModel table
- BrainRegion table
- NeuralConnection table
- Treatment table
- Assessment table
- User table (for authentication)
- Proper relationships and constraints

### 3. Performance Considerations

- Brain models can be large - implement pagination and efficient querying
- Consider caching for frequently accessed data
- Use async processing for long-running operations (ML predictions)
- Implement proper indexing on all tables

### 4. Security Requirements

- Implement HIPAA-compliant data storage and transmission
- Proper audit logging for all operations
- Input validation and sanitization
- Rate limiting and protection against common attacks
- Encryption of sensitive data at rest and in transit

## Next Steps for Implementation

1. Create the database schema with Alembic migrations
2. Implement core models (Pydantic models for FastAPI)
3. Implement authentication system
4. Implement the API routes according to the specifications above
5. Add validation and error handling
6. Add comprehensive tests for all endpoints
7. Implement caching and performance optimizations
8. Add comprehensive API documentation with Swagger/OpenAPI

## Integration with Frontend

The frontend currently uses the API client in `src/infrastructure/api/ApiClient.ts` to communicate with the backend. Key integration points:

1. Base URL configuration (currently `/api`, proxied to `/api/v1`)
2. Authentication token handling and refreshing
3. Error handling and response validation
4. Type definitions matching between frontend and backend

The frontend expects backend endpoints to conform to the REST patterns established in the client code, with consistent response formats and proper error codes.