# Backend API Structure for Frontend Testing

This document outlines the inferred structure of the Novamind backend API relevant to frontend development and Puppeteer testing, based on available code snippets (schemas, routes, services).

## Base Path

The frontend `apiClient` is configured to use `/api` as the base path, which is proxied by the Vite development server (currently targeting `http://localhost:3000`). Backend routes appear to be versioned under `/v1`. Therefore, frontend requests to `/api/...` should correspond to backend routes like `/api/v1/...`.

## Authentication

-   Uses JWT Bearer tokens passed in the `Authorization` header.
-   Handled by `app.api.auth.jwt` and `app.api.deps.auth_deps`.
-   Puppeteer tests might need to simulate login or provide a mock token if testing authenticated routes.

## Key Endpoints (Inferred from Frontend Usage & Backend Snippets)

Endpoints required by the visualization components and their hooks (`useBrainModel`, `usePatientData`, `useClinicalContext`):

1.  **Get Brain Model:**
    *   **Method:** `GET`
    *   **Frontend Path:** `/api/brain-models/{scanId}`
    *   **Backend Path (Inferred):** `/api/v1/brain-models/{scanId}`
    *   **Service:** `brainModelService.fetchBrainModel`
    *   **Response Schema (Expected):** `BrainModel` (from `@domain/types/brain/models`)
    *   **Mocking Target:** Crucial for `r3f-basic.test.js`, `BrainVisualizationPage.test.js`, `BrainModelContainer.test.js`. Needs to return a valid `BrainModel` structure for IDs like `DEMO_SCAN_001`.

2.  **Get Patient Data:**
    *   **Method:** `GET`
    *   **Frontend Path:** `/api/patients/{patientId}`
    *   **Backend Path (Inferred):** `/api/v1/patients/{patientId}` (Route definition not provided)
    *   **Service:** `apiClient.getPatientById` (used by `usePatientData`)
    *   **Response Schema (Expected):** Structure containing patient details, symptoms, diagnoses (Schema not fully defined in provided snippets).
    *   **Mocking Target:** Needed for `BrainVisualizationContainer` to render clinical overlays. Requires mock data for patient IDs used in tests (e.g., `DEMO_PATIENT`).

3.  **Get Clinical Context (Mappings, Risk, Predictions):**
    *   **Method:** `GET` (Likely multiple endpoints or one complex endpoint)
    *   **Frontend Path(s):** `/api/patients/{patientId}/clinical-context` (or similar - inferred)
    *   **Backend Path(s) (Inferred):** `/api/v1/patients/{patientId}/...?` (Route definitions not provided)
    *   **Service(s):** Likely involves services used by `useClinicalContext` hook (definitions not provided). Could involve ML routes like `/api/v1/ml/risk-assessment`.
    *   **Response Schema(s) (Expected):** Structures matching `SymptomNeuralMapping`, `DiagnosisNeuralMapping`, `TreatmentNeuralMapping`, `RiskAssessment`, `TreatmentResponsePrediction`.
    *   **Mocking Target:** Needed for `BrainVisualizationContainer` to apply clinical data. Requires mock data for relevant patient IDs.

## Other Identified Endpoints (from provided Python files)

These might be relevant for other tests or future features:

*   **ML Processing:** `POST /api/v1/ml/process` (Uses `MentaLLaMA`)
*   **Depression Detection:** `POST /api/v1/ml/depression-detection`
*   **Risk Assessment (ML):** `POST /api/v1/ml/risk-assessment`
*   **Sentiment Analysis:** `POST /api/v1/ml/sentiment-analysis`
*   **Wellness Dimensions:** `POST /api/v1/ml/wellness-dimensions`
*   **Digital Twin Conversation:** `POST /api/v1/ml/digital-twin/conversation`
*   **PHI Detection/Redaction:** `POST /api/v1/ml/phi/detect`, `POST /api/v1/ml/phi/redact`
*   **Digital Twin Sessions:** `POST`, `GET`, `DELETE` on `/api/v1/ml/digital-twin/sessions/...`
*   **Digital Twin Insights:** `POST /api/v1/ml/digital-twin/insights`
*   **Analytics Events:** `POST /api/v1/analytics/events`, `POST /api/v1/analytics/events/batch`
*   **Analytics Aggregates:** `POST /api/v1/analytics/aggregates`
*   **Biometric Alerts:** `POST`, `GET`, `PATCH`, `DELETE` on `/api/v1/biometrics/alerts/...` (Inferred prefix)

## Testing Strategy Implications

-   **Mocking:** Focus on mocking the key endpoints required by the visualization page (`/brain-models/{scanId}`, `/patients/{patientId}`, clinical context endpoints) within Puppeteer tests using request interception.
-   **SSOT:** Use the Pydantic schemas from the backend files (`analytics_schemas.py`, `ml_schemas.py`, `biometric_schemas.py`) as the SSOT for defining mock response structures.
-   **Backend:** The 500 error on the `/brain-models/DEMO_SCAN_001` endpoint needs to be addressed in the backend for true end-to-end tests.