# ML Microservices API Documentation

## Overview

This document outlines the API endpoints for the NOVAMIND ML Microservices architecture, which powers the Digital Twin functionality. All endpoints follow RESTful principles and adhere to HIPAA compliance requirements.

## Base URL

```
/api/v1/digital-twin
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Common Response Format

All endpoints return responses in the following format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Or in case of error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Endpoints

### 1. Digital Twin Integration Service

#### Generate Comprehensive Patient Insights

```
POST /insights
```

Generates comprehensive insights by coordinating all microservices.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "include_services": ["symptom_forecasting", "biometric_correlation", "pharmacogenomics"],
  "forecast_horizon": 30
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "generated_at": "2023-01-15T12:34:56.789Z",
    "symptom_forecasting": { ... },
    "biometric_correlation": { ... },
    "pharmacogenomics": { ... },
    "integrated_recommendations": { ... }
  },
  "error": null
}
```

#### Get Digital Twin Status

```
GET /status/{patient_id}
```

Returns the status of the Digital Twin for a specific patient.

**Response:**

```json
{
  "success": true,
  "data": {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "last_updated": "2023-01-15T12:34:56.789Z",
    "available_services": ["symptom_forecasting", "biometric_correlation", "pharmacogenomics"],
    "model_versions": {
      "symptom_forecasting": "1.2.0",
      "biometric_correlation": "1.1.0",
      "pharmacogenomics": "1.0.1"
    }
  },
  "error": null
}
```

### 2. Symptom Forecasting Service

#### Generate Symptom Forecast

```
POST /symptom-forecasting/forecast
```

Generates a forecast of psychiatric symptoms.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "symptom_history": [
      {
        "date": "2023-01-01",
        "anxiety": 5,
        "depression": 3,
        "sleep_quality": 0.7
      },
      ...
    ]
  },
  "horizon": 30,
  "use_ensemble": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "forecasts": {
      "anxiety": [5, 4, 3, 4, 5, ...],
      "depression": [3, 3, 2, 2, 3, ...]
    },
    "confidence_intervals": {
      "anxiety": {
        "lower": [4, 3, 2, 3, 4, ...],
        "upper": [6, 5, 4, 5, 6, ...]
      },
      "depression": {
        "lower": [2, 2, 1, 1, 2, ...],
        "upper": [4, 4, 3, 3, 4, ...]
      }
    },
    "risk_levels": {
      "anxiety": ["medium", "medium", "low", "medium", "medium", ...],
      "depression": ["low", "low", "low", "low", "low", ...]
    },
    "forecast_dates": ["2023-01-16", "2023-01-17", ...],
    "model_type": "ensemble"
  },
  "error": null
}
```

#### Analyze Symptom Patterns

```
POST /symptom-forecasting/patterns
```

Analyzes patterns in symptom history.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "symptom_history": [
      {
        "date": "2023-01-01",
        "anxiety": 5,
        "depression": 3
      },
      ...
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "symptom_patterns": {
      "anxiety": {
        "trend": "stable",
        "seasonality": "weekly",
        "peak_days": ["Monday", "Thursday"]
      },
      "depression": {
        "trend": "improving",
        "seasonality": "none",
        "peak_days": []
      }
    },
    "correlation_analysis": {
      "anxiety_depression": 0.65
    },
    "insights": [
      {
        "insight_text": "Anxiety levels show a weekly pattern with peaks on Mondays and Thursdays",
        "importance": 0.8
      },
      {
        "insight_text": "Depression levels show a gradual improvement over time",
        "importance": 0.7
      }
    ]
  },
  "error": null
}
```

### 3. Biometric Correlation Service

#### Analyze Biometric Correlations

```
POST /biometric-correlation/analyze
```

Analyzes correlations between biometric data and mental health indicators.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "biometric_data": [
    {
      "date": "2023-01-01",
      "heart_rate": 75,
      "sleep_quality": 0.7,
      "activity_level": 0.6
    },
    ...
  ],
  "mental_health_indicators": [
    {
      "date": "2023-01-01",
      "anxiety_level": 5,
      "depression_level": 3
    },
    ...
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "key_indicators": [
      {
        "biometric": "heart_rate",
        "correlation": 0.75,
        "mental_health_indicator": "anxiety"
      },
      {
        "biometric": "sleep_quality",
        "correlation": -0.65,
        "mental_health_indicator": "depression"
      }
    ],
    "lag_correlations": [
      {
        "biometric": "sleep_quality",
        "lag_days": 2,
        "mental_health_indicator": "depression",
        "correlation": 0.65
      }
    ],
    "anomalies": [
      {
        "date": "2023-01-05",
        "biometric": "heart_rate",
        "value": 95,
        "z_score": 2.8
      }
    ],
    "monitoring_plan": {
      "primary_metrics": ["heart_rate", "sleep_quality"],
      "monitoring_frequency": "daily",
      "alert_thresholds": {
        "heart_rate": {"min": 60, "max": 90},
        "sleep_quality": {"min": 0.5}
      }
    }
  },
  "error": null
}
```

#### Detect Biometric Anomalies

```
POST /biometric-correlation/anomalies
```

Detects anomalies in biometric data.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "biometric_data": [
    {
      "date": "2023-01-01",
      "heart_rate": 75,
      "sleep_quality": 0.7,
      "activity_level": 0.6
    },
    ...
  ],
  "detection_sensitivity": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "date": "2023-01-05",
        "biometric": "heart_rate",
        "value": 95,
        "z_score": 2.8,
        "is_anomaly": true,
        "severity": "medium"
      },
      {
        "date": "2023-01-08",
        "biometric": "sleep_quality",
        "value": 0.2,
        "z_score": -3.1,
        "is_anomaly": true,
        "severity": "high"
      }
    ],
    "summary": {
      "total_anomalies": 2,
      "high_severity": 1,
      "medium_severity": 1,
      "low_severity": 0
    }
  },
  "error": null
}
```

### 4. Pharmacogenomics Service

#### Predict Medication Responses

```
POST /pharmacogenomics/medication-responses
```

Predicts patient responses to psychiatric medications based on genetic markers.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "patient_data": {
    "genetic_markers": {
      "CYP2D6": 0,
      "CYP2C19": 0,
      "CYP2C9": 0,
      "SLC6A4": 1,
      "HTR2A": 0
    },
    "demographics": {
      "age": 35,
      "sex": "female"
    },
    "medical_history": {
      "previous_medications": ["sertraline", "bupropion"],
      "comorbidities": ["hypothyroidism"]
    }
  },
  "medications": ["fluoxetine", "sertraline", "escitalopram", "venlafaxine", "bupropion"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "medication_predictions": {
      "fluoxetine": {
        "response_probability": {"good": 0.7, "moderate": 0.2, "poor": 0.1},
        "side_effect_risk": {"low": 0.6, "moderate": 0.3, "high": 0.1},
        "effectiveness_score": 0.65
      },
      "sertraline": {
        "response_probability": {"good": 0.5, "moderate": 0.3, "poor": 0.2},
        "side_effect_risk": {"low": 0.4, "moderate": 0.4, "high": 0.2},
        "effectiveness_score": 0.45
      },
      "escitalopram": {
        "response_probability": {"good": 0.6, "moderate": 0.3, "poor": 0.1},
        "side_effect_risk": {"low": 0.5, "moderate": 0.4, "high": 0.1},
        "effectiveness_score": 0.55
      },
      "venlafaxine": {
        "response_probability": {"good": 0.4, "moderate": 0.4, "poor": 0.2},
        "side_effect_risk": {"low": 0.3, "moderate": 0.5, "high": 0.2},
        "effectiveness_score": 0.35
      },
      "bupropion": {
        "response_probability": {"good": 0.6, "moderate": 0.3, "poor": 0.1},
        "side_effect_risk": {"low": 0.7, "moderate": 0.2, "high": 0.1},
        "effectiveness_score": 0.6
      }
    },
    "categorized_predictions": {
      "ssri": {
        "fluoxetine": { ... },
        "sertraline": { ... },
        "escitalopram": { ... }
      },
      "snri": {
        "venlafaxine": { ... }
      },
      "ndri": {
        "bupropion": { ... }
      }
    },
    "recommendations": {
      "primary_recommendations": [
        {
          "medication": "fluoxetine",
          "rationale": "High probability of good response with low side effect risk"
        }
      ],
      "alternative_recommendations": [
        {
          "medication": "bupropion",
          "rationale": "Good predicted response with very low side effect risk"
        },
        {
          "medication": "escitalopram",
          "rationale": "Good predicted response with moderate side effect risk"
        }
      ]
    },
    "genetic_insights": [
      {
        "gene": "CYP2D6",
        "variant": "Normal metabolizer",
        "insight": "Standard dosing appropriate for most medications"
      },
      {
        "gene": "SLC6A4",
        "variant": "S allele carrier",
        "insight": "May have reduced response to SSRIs but better response to bupropion"
      }
    ]
  },
  "error": null
}
```

#### Analyze Gene-Medication Interactions

```
POST /pharmacogenomics/gene-interactions
```

Analyzes interactions between genetic markers and medications.

**Request Body:**

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "patient_data": {
    "genetic_markers": {
      "CYP2D6": 0,
      "CYP2C19": 0,
      "CYP2C9": 0,
      "SLC6A4": 1,
      "HTR2A": 0
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "gene_medication_interactions": [
      {
        "gene": "CYP2D6",
        "variant": "Normal metabolizer",
        "affected_medications": [
          {
            "medication": "fluoxetine",
            "effect": "normal",
            "recommendation": "Standard dosing"
          },
          {
            "medication": "paroxetine",
            "effect": "normal",
            "recommendation": "Standard dosing"
          }
        ]
      },
      {
        "gene": "SLC6A4",
        "variant": "S allele carrier",
        "affected_medications": [
          {
            "medication": "sertraline",
            "effect": "reduced_efficacy",
            "recommendation": "Consider alternative"
          },
          {
            "medication": "escitalopram",
            "effect": "reduced_efficacy",
            "recommendation": "Consider alternative"
          }
        ]
      }
    ],
    "metabolism_profile": {
      "poor_metabolizers": [],
      "intermediate_metabolizers": [],
      "normal_metabolizers": ["CYP2D6", "CYP2C19", "CYP2C9"],
      "rapid_metabolizers": []
    }
  },
  "error": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters |
| `NOT_FOUND` | Requested resource not found |
| `MODEL_INFERENCE_ERROR` | Error during model inference |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| `INSUFFICIENT_DATA` | Insufficient data for analysis |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Access denied |

## HIPAA Compliance

All API endpoints adhere to HIPAA compliance requirements:

1. All requests must be authenticated
2. All data is transmitted over HTTPS
3. No PHI is included in logs or error messages
4. All patient data is encrypted at rest and in transit
5. Access is restricted and audited

## Rate Limiting

API endpoints are subject to rate limiting:

- 100 requests per minute per user
- 1000 requests per day per user

Responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1589547834
```

## Versioning

The API follows semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR version for incompatible API changes
- MINOR version for backward-compatible functionality additions
- PATCH version for backward-compatible bug fixes

The current version is v1.0.0.
