# ML_MICROSERVICES_API

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
POST /api/v1/digital-twin/{patient_id}/insights
```

Generates comprehensive insights from all Digital Twin microservices.

**Request:**

```json
{
  "include_symptom_forecast": true,
  "include_biometric_correlations": true,
  "include_medication_predictions": true,
  "forecast_days": 14,
  "biometric_lookback_days": 30
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "generated_at": "2025-03-26T15:30:45Z",
    "symptom_forecast": {
      "reliability": "high",
      "forecast_dates": ["2025-03-27", "2025-03-28", "..."],
      "forecasts": {
        "anxiety": [4.2, 4.0, 3.8, 3.5, "..."],
        "mood": [6.5, 6.7, 6.8, 7.0, "..."],
        "sleep_quality": [5.5, 5.7, 5.8, 6.0, "..."]
      },
      "confidence_intervals": {
        "95%": {
          "anxiety": {
            "lower": [3.8, 3.6, 3.4, 3.1, "..."],
            "upper": [4.6, 4.4, 4.2, 3.9, "..."]
          },
          "mood": {
            "lower": [6.1, 6.3, 6.4, 6.6, "..."],
            "upper": [6.9, 7.1, 7.2, 7.4, "..."]
          },
          "sleep_quality": {
            "lower": [5.1, 5.3, 5.4, 5.6, "..."],
            "upper": [5.9, 6.1, 6.2, 6.4, "..."]
          }
        }
      }
    },
    "biometric_correlations": {
      "reliability": "medium",
      "correlations": [
        {
          "biometric_type": "heart_rate_variability",
          "symptom_type": "anxiety",
          "coefficient": -0.72,
          "lag_hours": 8,
          "confidence": 0.85
        },
        {
          "biometric_type": "sleep_duration",
          "symptom_type": "mood",
          "coefficient": 0.65,
          "lag_hours": 24,
          "confidence": 0.82
        },
        {
          "biometric_type": "physical_activity",
          "symptom_type": "mood",
          "coefficient": 0.58,
          "lag_hours": 4,
          "confidence": 0.79
        }
      ],
      "insights": [
        {
          "type": "physiological_marker",
          "message": "Decreased heart rate variability precedes anxiety symptoms by 8 hours.",
          "action": "Consider HRV biofeedback training to improve regulation."
        },
        {
          "type": "sleep_pattern",
          "message": "Reduced sleep duration is associated with mood deterioration 24 hours later.",
          "action": "Prioritize sleep hygiene interventions."
        }
      ]
    },
    "medication_predictions": {
      "fluoxetine": {
        "efficacy": {
          "score": 0.72,
          "confidence": 0.85,
          "percentile": 75
        },
        "side_effects": [
          {
            "name": "nausea",
            "risk": 0.35,
            "severity": "mild",
            "onset_days": 7
          },
          {
            "name": "insomnia",
            "risk": 0.28,
            "severity": "mild",
            "onset_days": 14
          }
        ],
        "genetic_factors": [
          {
            "gene": "CYP2D6",
            "variant": "*1/*1",
            "impact": "normal_metabolism"
          }
        ],
        "metabolizer_status": "normal",
        "recommendation": {
          "action": "standard_dosing",
          "rationale": "Standard protocol indicated based on available data.",
          "caution_level": "low"
        }
      },
      "sertraline": {
        "efficacy": {
          "score": 0.65,
          "confidence": 0.80,
          "percentile": 65
        },
        "side_effects": [
          {
            "name": "nausea",
            "risk": 0.42,
            "severity": "moderate",
            "onset_days": 5
          },
          {
            "name": "sexual_dysfunction",
            "risk": 0.38,
            "severity": "moderate",
            "onset_days": 21
          }
        ],
        "genetic_factors": [
          {
            "gene": "CYP2C19",
            "variant": "*1/*2",
            "impact": "reduced_metabolism"
          }
        ],
        "metabolizer_status": "intermediate",
        "recommendation": {
          "action": "careful_monitoring",
          "rationale": "Intermediate metabolizer status may affect drug levels.",
          "caution_level": "medium"
        }
      }
    },
    "integrated_recommendations": [
      {
        "type": "medication",
        "recommendation": "Consider fluoxetine as first-line treatment based on predicted efficacy and side effect profile.",
        "confidence": "high",
        "supporting_evidence": ["pharmacogenomic profile", "treatment history", "symptom pattern"]
      },
      {
        "type": "biometric_monitoring",
        "recommendation": "Monitor heart rate variability as an early warning sign for anxiety symptoms.",
        "confidence": "medium",
        "supporting_evidence": ["biometric correlation analysis"]
      },
      {
        "type": "behavioral",
        "recommendation": "Implement sleep hygiene protocol to improve mood stability.",
        "confidence": "high",
        "supporting_evidence": ["biometric correlation analysis", "symptom forecast"]
      }
    ]
  },
  "error": null
}
```

### 2. Symptom Forecasting Service

#### Generate Symptom Forecast

```
POST /api/v1/digital-twin/{patient_id}/symptom-forecast
```

Generates a forecast of psychiatric symptoms over time.

**Request:**

```json
{
  "forecast_days": 14,
  "symptom_types": ["anxiety", "mood", "sleep_quality"],
  "confidence_levels": [0.80, 0.95]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "forecast_type": "ensemble",
    "reliability": "high",
    "forecast_dates": ["2025-03-27", "2025-03-28", "2025-03-29", "..."],
    "forecasts": {
      "anxiety": [4.2, 4.0, 3.8, "..."],
      "mood": [6.5, 6.7, 6.8, "..."],
      "sleep_quality": [5.5, 5.7, 5.8, "..."]
    },
    "confidence_intervals": {
      "80%": {
        "anxiety": {
          "lower": [4.0, 3.8, 3.6, "..."],
          "upper": [4.4, 4.2, 4.0, "..."]
        },
        "mood": {
          "lower": [6.3, 6.5, 6.6, "..."],
          "upper": [6.7, 6.9, 7.0, "..."]
        },
        "sleep_quality": {
          "lower": [5.3, 5.5, 5.6, "..."],
          "upper": [5.7, 5.9, 6.0, "..."]
        }
      },
      "95%": {
        "anxiety": {
          "lower": [3.8, 3.6, 3.4, "..."],
          "upper": [4.6, 4.4, 4.2, "..."]
        },
        "mood": {
          "lower": [6.1, 6.3, 6.4, "..."],
          "upper": [6.9, 7.1, 7.2, "..."]
        },
        "sleep_quality": {
          "lower": [5.1, 5.3, 5.4, "..."],
          "upper": [5.9, 6.1, 6.2, "..."]
        }
      }
    },
    "contributing_models": {
      "transformer": {
        "weight": 0.7,
        "metrics": {
          "mae": 0.42,
          "rmse": 0.68
        }
      },
      "xgboost": {
        "weight": 0.3,
        "metrics": {
          "mae": 0.47,
          "rmse": 0.72
        }
      }
    },
    "early_warnings": [
      {
        "symptom": "anxiety",
        "date": "2025-04-02",
        "severity": "moderate",
        "confidence": 0.82,
        "trigger": "predicted_increase"
      }
    ]
  },
  "error": null
}
```

### 3. Biometric Correlation Service

#### Analyze Biometric Correlations

```
POST /api/v1/digital-twin/{patient_id}/biometric-correlation
```

Analyzes correlations between biometric data and mental health indicators.

**Request:**

```json
{
  "biometric_data": {
    "heart_rate_variability": [
      {
        "timestamp": "2025-03-25T08:30:00Z",
        "value": 45.2
      },
      {
        "timestamp": "2025-03-25T12:30:00Z",
        "value": 42.8
      },
      "..."
    ],
    "sleep_duration": [
      {
        "timestamp": "2025-03-25T08:00:00Z",
        "value": 7.2
      },
      {
        "timestamp": "2025-03-26T08:00:00Z",
        "value": 6.8
      },
      "..."
    ],
    "physical_activity": [
      {
        "timestamp": "2025-03-25T15:00:00Z",
        "value": 45
      },
      {
        "timestamp": "2025-03-25T18:00:00Z",
        "value": 30
      },
      "..."
    ]
  },
  "lookback_days": 30,
  "correlation_threshold": 0.3
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "reliability": "medium",
    "correlations": [
      {
        "biometric_type": "heart_rate_variability",
        "symptom_type": "anxiety",
        "coefficient": -0.72,
        "lag_hours": 8,
        "confidence": 0.85,
        "p_value": 0.002
      },
      {
        "biometric_type": "sleep_duration",
        "symptom_type": "mood",
        "coefficient": 0.65,
        "lag_hours": 24,
        "confidence": 0.82,
        "p_value": 0.005
      },
      {
        "biometric_type": "physical_activity",
        "symptom_type": "mood",
        "coefficient": 0.58,
        "lag_hours": 4,
        "confidence": 0.79,
        "p_value": 0.008
      }
    ],
    "insights": [
      {
        "type": "physiological_marker",
        "message": "Decreased heart rate variability precedes anxiety symptoms by 8 hours.",
        "action": "Consider HRV biofeedback training to improve regulation."
      },
      {
        "type": "sleep_pattern",
        "message": "Reduced sleep duration is associated with mood deterioration 24 hours later.",
        "action": "Prioritize sleep hygiene interventions."
      },
      {
        "type": "behavioral_pattern",
        "message": "Increased physical activity is associated with mood improvement 4 hours later.",
        "action": "Consider scheduled physical activity as mood management strategy."
      }
    ],
    "biometric_coverage": {
      "heart_rate_variability": 0.85,
      "sleep_duration": 0.97,
      "physical_activity": 0.72
    },
    "model_metrics": {
      "accuracy": 0.87,
      "false_positive_rate": 0.08,
      "lag_prediction_mae": 2.3
    }
  },
  "error": null
}
```

### 4. Pharmacogenomics Service

#### Predict Medication Response

```
POST /api/v1/digital-twin/{patient_id}/medication-response
```

Predicts a patient's response to psychiatric medications.

**Request:**

```json
{
  "genetic_data": {
    "CYP2D6": "*1/*1",
    "CYP2C19": "*1/*2",
    "CYP1A2": "*1F/*1F",
    "COMT": "Val/Met",
    "SLC6A4": "L/L"
  },
  "comorbidities": ["anxiety", "insomnia"],
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
        "efficacy": {
          "score": 0.72,
          "confidence": 0.85,
          "percentile": 75
        },
        "side_effects": [
          {
            "name": "nausea",
            "risk": 0.35,
            "severity": "mild",
            "onset_days": 7
          },
          {
            "name": "insomnia",
            "risk": 0.28,
            "severity": "mild",
            "onset_days": 14
          }
        ],
        "genetic_factors": [
          {
            "gene": "CYP2D6",
            "variant": "*1/*1",
            "impact": "normal_metabolism"
          }
        ],
        "metabolizer_status": "normal",
        "recommendation": {
          "action": "standard_dosing",
          "rationale": "Standard protocol indicated based on available data.",
          "caution_level": "low"
        }
      },
      "sertraline": {
        "efficacy": {
          "score": 0.65,
          "confidence": 0.80,
          "percentile": 65
        },
        "side_effects": [
          {
            "name": "nausea",
            "risk": 0.42,
            "severity": "moderate",
            "onset_days": 5
          },
          {
            "name": "sexual_dysfunction",
            "risk": 0.38,
            "severity": "moderate",
            "onset_days": 21
          }
        ],
        "genetic_factors": [
          {
            "gene": "CYP2C19",
            "variant": "*1/*2",
            "impact": "reduced_metabolism"
          }
        ],
        "metabolizer_status": "intermediate",
        "recommendation": {
          "action": "careful_monitoring",
          "rationale": "Intermediate metabolizer status may affect drug levels.",
          "caution_level": "medium"
        }
      }
    },
    "comparative_analysis": {
      "highest_efficacy": {
        "medication": "fluoxetine",
        "score": 0.72,
        "confidence": 0.85
      },
      "lowest_side_effects": {
        "medication": "bupropion",
        "highest_risk": 0.25
      },
      "optimal_balance": {
        "medication": "fluoxetine",
        "efficacy": 0.72,
        "side_effect_risk": 0.35
      }
    },
    "disclaimer": "Pharmacogenomic predictions are one of many factors to consider in medication selection. Clinical judgment remains essential."
  },
  "error": null
}
```

### 5. Treatment Recommendation Service

#### Get Treatment Recommendations

```
GET /api/v1/digital-twin/{patient_id}/treatment-recommendations
```

Gets personalized treatment recommendations for a patient.

**Response:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "medication",
        "recommendation": "Consider fluoxetine as first-line treatment based on predicted efficacy and side effect profile.",
        "confidence": "high",
        "supporting_evidence": ["pharmacogenomic profile", "treatment history", "symptom pattern"],
        "alternatives": ["bupropion", "escitalopram"]
      },
      {
        "type": "psychotherapy",
        "recommendation": "Cognitive Behavioral Therapy (CBT) focused on anxiety management.",
        "confidence": "high",
        "supporting_evidence": ["symptom forecast", "treatment history"],
        "frequency": "weekly",
        "duration_weeks": 12
      },
      {
        "type": "lifestyle",
        "recommendation": "Implement sleep hygiene protocol to improve mood stability.",
        "confidence": "high",
        "supporting_evidence": ["biometric correlation analysis", "symptom forecast"],
        "specific_interventions": [
          "Consistent sleep/wake schedule",
          "Blue light reduction 2 hours before bed",
          "Morning light exposure"
        ]
      },
      {
        "type": "monitoring",
        "recommendation": "Monitor heart rate variability as an early warning sign for anxiety symptoms.",
        "confidence": "medium",
        "supporting_evidence": ["biometric correlation analysis"],
        "frequency": "daily",
        "alert_thresholds": {
          "hrv_below": 40,
          "consecutive_days": 2
        }
      }
    ],
    "integrated_care_plan": {
      "primary_focus": "anxiety_management",
      "secondary_focus": "mood_stabilization",
      "recommended_followup": "2 weeks",
      "expected_outcomes": {
        "short_term": "Reduced anxiety symptoms within 4 weeks",
        "medium_term": "Improved mood stability within 8 weeks",
        "long_term": "Sustained remission within 12 weeks"
      }
    }
  },
  "error": null
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTHENTICATION_ERROR` | Invalid or expired authentication token |
| `AUTHORIZATION_ERROR` | Insufficient permissions to access the resource |
| `RESOURCE_NOT_FOUND` | The requested resource was not found |
| `VALIDATION_ERROR` | Invalid request parameters |
| `SERVICE_UNAVAILABLE` | The requested service is temporarily unavailable |
| `INSUFFICIENT_DATA` | Not enough data to generate meaningful predictions |
| `MODEL_ERROR` | Error in the underlying ML model |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |

## Versioning

The API follows semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR version for incompatible API changes
- MINOR version for backward-compatible functionality additions
- PATCH version for backward-compatible bug fixes

## HIPAA Compliance

All API endpoints adhere to HIPAA compliance requirements:

1. **Authentication**: All requests must be authenticated with valid JWT tokens
2. **Secure Transmission**: All data is transmitted over HTTPS
3. **Data Protection**: No PHI is included in logs or error messages
4. **Encryption**: All patient data is encrypted at rest and in transit
5. **Access Control**: Access is restricted based on user roles and permissions
6. **Audit Logging**: All API access is logged for audit purposes
7. **Minimal Data**: Only necessary data is transmitted in requests and responses
8. **Data Retention**: Data is retained according to HIPAA requirements
9. **Breach Notification**: Systems are in place to detect and report potential breaches
10. **Business Associate Agreements**: All third-party services have BAAs in place

## Rate Limiting

API endpoints are subject to rate limiting to prevent abuse and ensure system stability:

- 100 requests per minute per user
- 1000 requests per day per user

Responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1589547834
```

When rate limits are exceeded, the API returns a `429 Too Many Requests` status code.

## Implementation Guidelines

1. **Error Handling**: Implement proper error handling with appropriate status codes and error messages.
2. **Rate Limiting**: Implement rate limiting to prevent abuse.
3. **Caching**: Cache responses with appropriate TTL to reduce computational load.
4. **Logging**: Log all API access for audit purposes, but ensure no PHI is included in logs.
5. **Monitoring**: Implement comprehensive monitoring for API performance and availability.
6. **Documentation**: Keep API documentation up-to-date with any changes.
7. **Testing**: Implement comprehensive testing with synthetic patient data.
8. **Security**: Ensure all endpoints are properly secured with authentication and authorization.
9. **Performance**: Optimize endpoint performance for low latency responses.
10. **Compliance**: Ensure all endpoints adhere to HIPAA compliance requirements.
