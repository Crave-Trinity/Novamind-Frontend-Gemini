# Frontend - Backend Integration Guide

## Overview

This document provides a comprehensive guide to integrating the React frontend with the FastAPI backend, specifically focusing on XGBoost ML service interactions, digital twin visualization, and HIPAA compliance.

## Integration Architecture

### Full-Stack Data Flow

┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│  React         │◄────►│  REST/GraphQL  │◄────►│  FastAPI       │
│  Frontend      │      │  API Layer     │      │  Backend       │
│                │      │                │      │                │
└────────────────┘      └────────────────┘      └────────────────┘
        ▲                       │                       ▲
        │                       ▼                       │
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│  UI Components │      │  State Mgmt    │      │  XGBoost       │
│  (Tailwind)    │      │  (React Query) │      │  ML Service    │
│                │      │                │      │                │
└────────────────┘      └────────────────┘      └────────────────┘
        ▲                       │                       ▲
        │                       ▼                       │
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│  3D Brain      │      │  API Client    │      │  DigitalTwin   │
│  Visualization │      │  (Typed)       │      │  Integration    │
│  (Three.js)    │      │                │      │                 │
└────────────────┘      └────────────────┘      └─────────────────┘

## XGBoost Service Integration

### Core API Client

The `XGBoostService` class in `infrastructure/api/XGBoostService.ts` provides a strongly-typed interface to the backend ML services:

```typescript
// infrastructure/api/XGBoostService.ts
import { apiClient } from './apiClient';
import { RiskPredictionRequest, RiskPredictionResponse } from '@/domain/types';

export class XGBoostService {
  async predictRisk(request: RiskPredictionRequest): Promise<RiskPredictionResponse> {
    return apiClient.post('/predict/risk', request);
  }

  // Other XGBoost related methods...
}
```

### Data Flow Process

1. User triggers prediction from UI (e.g., risk assessment, treatment planning)
2. Frontend sends typed request to backend via API client
3. Backend XGBoost service processes prediction
4. Response returned to frontend
5. UI updates with prediction results (e.g., visualizations, risk scores)

## Digital Twin Visualization Integration

### Brain Region Highlighting

The Three.js brain visualization receives feature importance data from XGBoost predictions:

```typescript
// presentation/organisms/BrainVisualization.tsx
import { useXGBoostPrediction } from '@/application/hooks';

const BrainVisualization = ({ patientId }) => {
  const { data: prediction } = useXGBoostPrediction(patientId);

  const highlightedRegions = useMemo(() => {
    // Map prediction.featureImportance to brain region IDs and intensity
    return mapImportanceToRegions(prediction?.featureImportance);
  }, [prediction]);

  return (
    <Canvas>
      <BrainModel highlightedRegions={highlightedRegions} />
      {/* ... other scene elements */}
    </Canvas>
  );
};
```

### Temporal Data Integration

The digital twin model supports temporal visualization of treatment effects:

1. Baseline scan visualization
2. Predicted outcome visualization based on selected treatment
3. Side-by-side comparison of different treatment simulations
4. Timeline slider demonstrates expected response trajectory

## Risk Assessment Integration

### Risk Prediction Workflow

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Clinical     │     │ XGBoost      │     │ Risk         │
│ Assessment   │────►│ Prediction   │────►│ Visualization│
│ (Form)       │     │ Service      │     │ (Dashboard)  │
└──────────────┘     └──────────────┘     └──────────────┘

### Implementation Details

1. Clinical data collected via assessment forms
2. Data formatted as `RiskPredictionRequest`
3. Request sent to XGBoost service via API client
4. `RiskPredictionResponse` received
5. Risk scores and contributing factors displayed on Patient Dashboard

## Treatment Response Simulation

### Response Prediction Workflow

1. Treatment options presented based on diagnosis and patient profile
2. Clinician selects potential treatment options for comparison
3. Each option sent to XGBoost via `predictTreatmentResponse`
4. Backend simulates response based on the model
5. Predicted trajectories returned to frontend
6. Timeline slider demonstrates expected response trajectory

### Code Integration Example

```typescript
// In TreatmentResponsePredictor.tsx
const { isLoading, data: predictions } = useTreatmentPrediction({
  patientId,
  selectedTreatments,
});

return (
  <ComparisonChart predictions={predictions} />
);
```

## MentalLLaMA Integration

### Natural Language Processing Flow

1. Clinical notes and assessments processed by MentalLLaMA
2. Structured data extracted for XGBoost models
3. Semantic search across patient history
4. Context-aware insights provided to clinicians

## HIPAA Compliance Considerations

### Secure Data Flow

- All patient data transmitted via HTTPS
- Authentication tokens included in all API requests
- No PHI stored in browser storage or state
- Role-based access control enforced on backend
- Timeouts for inactive sessions

### PHI Protection in Visualization

- Patient identifiers removed from visualizations
- De-identified aggregate data used for comparisons
- Secure rendering pipeline with memory management
- Audit logs track access to sensitive visualizations

## Error Handling

### Graceful Degradation

```typescript
try {
  const response = await xgboostService.predictRisk(riskRequest);
  // Update UI with successful prediction
} catch (error) {
  // Log error to monitoring service (Sentry, etc.)
  showErrorMessage('Failed to retrieve risk prediction. Please try again.');
  // Optionally display cached data or a fallback state
}
```

## Real-time Updates

### WebSocket Integration

- Real-time biometric data streamed via secure WebSockets
- XGBoost predictions updated as new data arrives
- Brain visualization reflects real-time changes
- Alerts triggered based on prediction thresholds

## Performance Considerations

### Optimization Strategies

1. Precomputation of visualization data on server when possible
2. Progressive loading for large datasets
3. Caching of prediction results using React Query
4. Code splitting for visualization components (React.lazy)
5. Web Workers for intensive client-side calculations

## Deployment Integration

### CI/CD Pipeline

- Frontend and backend deployed as separate services
- API contract tests ensure compatibility
- Performance tests validate visualization rendering
- Security scans integrated into the pipeline

and potential security vulnerabilities.

 