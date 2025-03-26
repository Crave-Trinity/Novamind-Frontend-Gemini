# ML Microservices Implementation Guide

## Overview

The NOVAMIND ML Microservices architecture implements a sophisticated Digital Twin functionality for psychiatric care, following Clean Architecture principles and ensuring HIPAA compliance. This guide provides detailed implementation information for developers working on the system.

## Architecture Principles

### Clean Architecture

The ML Microservices architecture strictly adheres to Clean Architecture principles:

1. **Domain Layer Independence**: The domain layer contains business rules and entities, with no dependencies on external frameworks or infrastructure.

2. **Dependency Rule**: Dependencies always point inward, with infrastructure depending on the domain, never the reverse.

3. **Interface Segregation**: Domain interfaces define contracts that infrastructure implementations must fulfill.

4. **Separation of Concerns**: Each microservice has a clear, single responsibility.

### HIPAA Compliance

All implementations must adhere to HIPAA compliance requirements:

1. **Data Sanitization**: All PHI must be sanitized before processing.
2. **Secure Logging**: No PHI in logs or external calls.
3. **Data Encryption**: All data must be encrypted at rest and in transit.
4. **Access Control**: Strict access controls for all patient data.
5. **Audit Trails**: All data access must be logged for audit purposes.

## Implementation Details

### 1. Symptom Forecasting Microservice

#### Core Components

- **Transformer Model**: Implements a Multi-Horizon Transformer with attention mechanisms for time series forecasting.
- **XGBoost Model**: Implements gradient boosting with Bayesian hyperparameter optimization.
- **Ensemble Model**: Combines predictions from both models for improved accuracy.

#### Implementation Guidelines

```python
# Example implementation of the ensemble approach
async def forecast_with_ensemble(self, input_data, horizon):
    # Run both models in parallel
    transformer_future = self.transformer_model.predict(input_data, horizon)
    xgboost_future = self.xgboost_model.predict(input_data, horizon)
    
    # Await results
    transformer_results, xgboost_results = await asyncio.gather(
        transformer_future, xgboost_future
    )
    
    # Combine results using weighted average
    ensemble_values = (
        self.model_weights["transformer"] * transformer_results["values"] +
        self.model_weights["xgboost"] * xgboost_results["values"]
    )
    
    # Use uncertainty intervals from transformer model
    lower_bound = transformer_results["intervals"]["lower"]
    upper_bound = transformer_results["intervals"]["upper"]
    
    # Use feature importance from XGBoost model
    feature_importance = xgboost_results["feature_importance"]
    
    return {
        "values": ensemble_values,
        "intervals": {"lower": lower_bound, "upper": upper_bound},
        "feature_importance": feature_importance,
        "model_type": "ensemble"
    }
```

#### Key Algorithms

1. **Transformer Architecture**:
   - Multi-head attention for capturing temporal dependencies
   - Positional encoding for sequence order
   - Quantile regression for uncertainty estimation

2. **XGBoost Configuration**:
   - Objective: 'reg:squarederror'
   - Learning rate: 0.05
   - Max depth: Optimized via Bayesian optimization
   - Subsample: 0.8
   - Colsample_bytree: 0.8

3. **Ensemble Weighting**:
   - Default weights: 70% Transformer, 30% XGBoost
   - Adaptive weighting based on recent performance

### 2. Biometric Correlation Microservice

#### Core Components

- **LSTM Model**: Implements a bidirectional LSTM with attention for time series correlation.
- **Correlation Analysis**: Implements lag correlation and Granger causality tests.
- **Anomaly Detection**: Implements isolation forest and autoencoder-based anomaly detection.

#### Implementation Guidelines

```python
# Example implementation of lag correlation analysis
async def analyze_lag_correlations(self, biometric_data, mental_health_data, max_lag=7):
    lag_correlations = []
    
    for biometric in self.biometric_features:
        for indicator in self.mental_health_indicators:
            best_lag = 0
            best_correlation = 0
            
            # Test different lag values
            for lag in range(1, max_lag + 1):
                # Shift biometric data by lag
                biometric_shifted = biometric_data[biometric][:-lag]
                indicator_values = mental_health_data[indicator][lag:]
                
                # Calculate correlation
                correlation = np.corrcoef(biometric_shifted, indicator_values)[0, 1]
                
                if abs(correlation) > abs(best_correlation):
                    best_correlation = correlation
                    best_lag = lag
            
            if abs(best_correlation) > 0.3:  # Minimum correlation threshold
                lag_correlations.append({
                    "biometric": biometric,
                    "mental_health_indicator": indicator,
                    "lag_days": best_lag,
                    "correlation": best_correlation
                })
    
    return lag_correlations
```

#### Key Algorithms

1. **LSTM Architecture**:
   - Bidirectional LSTM layers for capturing temporal dependencies
   - Attention mechanism for focusing on relevant time steps
   - Dropout for regularization (rate: 0.2)

2. **Anomaly Detection**:
   - Isolation Forest parameters:
     - Contamination: 0.05
     - n_estimators: 100
   - Autoencoder parameters:
     - Hidden layers: [64, 32, 16, 32, 64]
     - Activation: ReLU
     - Loss: MSE

3. **Correlation Analysis**:
   - Pearson correlation for linear relationships
   - Spearman correlation for non-linear relationships
   - Granger causality test for causal relationships

### 3. Pharmacogenomics Microservice

#### Core Components

- **Gene-Medication Model**: Implements a neural network for predicting medication responses.
- **Side Effect Prediction**: Implements a random forest for side effect risk stratification.
- **Treatment Recommendation**: Implements a rule-based system for personalized treatment recommendations.

#### Implementation Guidelines

```python
# Example implementation of medication response prediction
async def predict_medication_response(self, patient_id, patient_data, medications=None):
    # Extract genetic markers
    genetic_markers = self._extract_genetic_markers(patient_data)
    
    # Normalize genetic data
    normalized_markers = self._normalize_genetic_data(genetic_markers)
    
    # Determine which medications to predict
    meds_to_predict = medications or self.supported_medications
    
    # Generate predictions for each medication
    medication_predictions = {}
    
    for medication in meds_to_predict:
        # Get medication index
        if medication not in self.medication_indices:
            continue
            
        med_idx = self.medication_indices[medication]
        
        # Create input vector
        input_vector = np.concatenate([
            normalized_markers,
            np.array([med_idx])
        ]).reshape(1, -1)
        
        # Generate prediction
        response_probs = self.model.predict_proba(input_vector)[0]
        side_effect_probs = self.side_effect_model.predict_proba(input_vector)[0]
        
        # Store prediction
        medication_predictions[medication] = {
            "response_probability": {
                "good": float(response_probs[2]),
                "moderate": float(response_probs[1]),
                "poor": float(response_probs[0])
            },
            "side_effect_risk": {
                "low": float(side_effect_probs[0]),
                "moderate": float(side_effect_probs[1]),
                "high": float(side_effect_probs[2])
            },
            "effectiveness_score": float(response_probs[2] - 0.5 * side_effect_probs[2])
        }
    
    return {
        "medication_predictions": medication_predictions
    }
```

#### Key Algorithms

1. **Neural Network Architecture**:
   - Input layer: Genetic markers + medication encoding
   - Hidden layers: [128, 64, 32]
   - Output layer: Response probability (3 classes)
   - Activation: ReLU for hidden layers, Softmax for output

2. **Random Forest Configuration**:
   - n_estimators: 100
   - max_depth: 10
   - min_samples_split: 10
   - min_samples_leaf: 5

3. **Treatment Recommendation Rules**:
   - Primary recommendation: Highest effectiveness score
   - Alternative recommendations: Next 2 highest scores
   - Contraindications: Medications with high side effect risk

### 4. Digital Twin Integration Service

#### Core Components

- **Service Orchestration**: Coordinates parallel execution of microservices.
- **Insight Integration**: Combines insights from all microservices.
- **Recommendation Generation**: Generates integrated clinical recommendations.

#### Implementation Guidelines

```python
# Example implementation of comprehensive insight generation
async def generate_comprehensive_patient_insights(self, patient_id, patient_data):
    # Sanitize patient data
    sanitized_data = self._sanitize_patient_data(patient_data)
    
    # Validate data
    if not self._validate_patient_data(sanitized_data):
        raise ValidationError("Invalid patient data")
    
    # Run all microservices in parallel
    tasks = [
        self._run_symptom_forecasting(patient_id, sanitized_data),
        self._run_biometric_correlation(patient_id, sanitized_data),
        self._run_pharmacogenomics(patient_id, sanitized_data)
    ]
    
    # Gather results
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Process results
    processed_results = []
    for result in results:
        if isinstance(result, Exception):
            logging.error(f"Microservice error: {str(result)}")
        else:
            processed_results.append(result)
    
    # Generate integrated insights
    insights = {
        "patient_id": str(patient_id),
        "generated_at": datetime.utcnow().isoformat()
    }
    
    # Add microservice results to insights
    for result in processed_results:
        insights.update({k: v for k, v in result.items() if not k.endswith("_insights")})
    
    # Generate integrated recommendations
    if processed_results:
        insights["integrated_recommendations"] = await self._generate_integrated_recommendations(processed_results)
    
    return insights
```

#### Key Algorithms

1. **Insight Integration**:
   - Weighted combination of insights based on importance scores
   - Removal of redundant insights
   - Prioritization based on clinical relevance

2. **Recommendation Generation**:
   - Rule-based system for combining recommendations
   - Conflict resolution for contradictory recommendations
   - Personalization based on patient history and preferences

## Data Flow

### Input Data

1. **Symptom History**:
   ```json
   {
     "symptom_history": [
       {
         "date": "2023-01-01",
         "anxiety": 5,
         "depression": 3,
         "sleep_quality": 0.7
       },
       ...
     ]
   }
   ```

2. **Biometric Data**:
   ```json
   {
     "biometric_data": [
       {
         "date": "2023-01-01",
         "heart_rate": 75,
         "sleep_quality": 0.7,
         "activity_level": 0.6
       },
       ...
     ]
   }
   ```

3. **Genetic Markers**:
   ```json
   {
     "genetic_markers": {
       "CYP2D6": 0,
       "CYP2C19": 0,
       "CYP2C9": 0,
       "SLC6A4": 1,
       "HTR2A": 0
     }
   }
   ```

### Output Data

```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "generated_at": "2023-01-15T12:34:56.789Z",
  "symptom_forecasting": {
    "forecasts": {
      "anxiety": [5, 4, 3, 4, 5],
      "depression": [3, 3, 2, 2, 3]
    },
    "risk_levels": {
      "anxiety": ["medium", "medium", "low", "medium", "medium"],
      "depression": ["low", "low", "low", "low", "low"]
    }
  },
  "biometric_correlation": {
    "key_indicators": [
      {"biometric": "heart_rate", "correlation": 0.75, "mental_health_indicator": "anxiety"}
    ],
    "monitoring_plan": {
      "primary_metrics": ["heart_rate", "sleep_quality"],
      "monitoring_frequency": "daily"
    }
  },
  "pharmacogenomics": {
    "medication_predictions": {
      "fluoxetine": {
        "response_probability": {"good": 0.7, "moderate": 0.2, "poor": 0.1},
        "side_effect_risk": {"low": 0.6, "moderate": 0.3, "high": 0.1}
      }
    },
    "recommendations": {
      "primary_recommendations": [
        {"medication": "fluoxetine", "rationale": "High probability of good response with low side effect risk"}
      ]
    }
  },
  "integrated_recommendations": {
    "clinical_recommendations": [
      {"recommendation": "Monitor anxiety levels closely", "importance": 0.8},
      {"recommendation": "Track heart rate daily", "importance": 0.7}
    ],
    "treatment_recommendations": [
      {"recommendation": "Consider fluoxetine as first-line treatment", "importance": 0.9}
    ]
  }
}
```

## Error Handling

### Error Types

1. **ValidationError**: Raised when input data fails validation.
2. **ModelInferenceError**: Raised when a model fails to generate predictions.
3. **ServiceUnavailableError**: Raised when a microservice is unavailable.
4. **DataProcessingError**: Raised when data processing fails.

### Error Handling Strategy

1. **Graceful Degradation**: If one microservice fails, continue with others.
2. **Comprehensive Logging**: Log all errors with context but no PHI.
3. **Informative Error Messages**: Provide clear error messages to the caller.
4. **Retry Mechanism**: Implement exponential backoff for transient errors.

### Example Implementation

```python
async def _run_symptom_forecasting(self, patient_id, patient_data):
    try:
        # Extract relevant data
        symptom_data = self._extract_symptom_data(patient_data)
        
        # Call forecasting service
        forecast = await self.symptom_forecasting_service.forecast_symptoms(
            patient_id=patient_id,
            data=symptom_data,
            horizon=30
        )
        
        # Extract insights
        insights = await self.symptom_forecasting_service.extract_insights(forecast)
        
        return {
            "symptom_forecasting": forecast,
            "symptom_forecasting_insights": insights
        }
    except Exception as e:
        logging.error(f"Symptom forecasting error: {str(e)}")
        # Return empty result but don't fail the entire process
        return {}
```

## Testing Strategy

### Unit Tests

1. **Model Tests**: Test each model component in isolation.
2. **Service Tests**: Test each service with mocked models.
3. **Integration Tests**: Test the Digital Twin Integration Service with mocked microservices.

### Test Data

1. **Synthetic Patient Data**: Generate realistic but non-PHI test data.
2. **Edge Cases**: Test with missing data, extreme values, and invalid inputs.
3. **Performance Tests**: Test with large datasets to ensure scalability.

### Example Test Case

```python
@pytest.mark.asyncio
async def test_forecast_symptoms_with_ensemble(forecasting_service, patient_data):
    """Test symptom forecasting with ensemble approach."""
    patient_id = uuid4()
    
    # Generate forecast
    forecast = await forecasting_service.forecast_symptoms(
        patient_id=patient_id,
        data=patient_data,
        horizon=5,
        use_ensemble=True
    )
    
    # Verify forecast structure
    assert "values" in forecast
    assert "intervals" in forecast
    assert "feature_importance" in forecast
    assert forecast["model_type"] == "ensemble"
```

## Deployment Considerations

### Model Storage

1. **Directory Structure**:
   ```
   /models
   ├── symptom_forecasting
   │   ├── transformer_model.pt
   │   └── xgboost_model.pkl
   ├── biometric_correlation
   │   └── lstm_model.pt
   └── pharmacogenomics
       └── gene_medication_model.pkl
   ```

2. **Model Versioning**:
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - Store version in model metadata
   - Implement backward compatibility for model loading

### Environment Variables

1. **Model Paths**:
   - `NOVAMIND_MODEL_BASE_DIR`: Base directory for all models
   - `NOVAMIND_SYMPTOM_MODEL_PATH`: Path to symptom forecasting model
   - `NOVAMIND_BIOMETRIC_MODEL_PATH`: Path to biometric correlation model
   - `NOVAMIND_PHARMACOGENOMICS_MODEL_PATH`: Path to pharmacogenomics model

2. **Service Configuration**:
   - `NOVAMIND_LOG_LEVEL`: Logging level (INFO, DEBUG, etc.)
   - `NOVAMIND_USE_ENSEMBLE`: Whether to use ensemble models (TRUE/FALSE)
   - `NOVAMIND_MAX_FORECAST_HORIZON`: Maximum forecast horizon in days

### Performance Optimization

1. **Caching Strategy**:
   - Cache model predictions for frequent queries
   - Use LRU cache with appropriate TTL
   - Invalidate cache on model updates

2. **Batch Processing**:
   - Implement batch prediction for multiple patients
   - Use vectorized operations for improved performance
   - Parallelize independent computations

## Monitoring and Logging

### Metrics to Monitor

1. **Model Performance**:
   - Prediction accuracy
   - Inference time
   - Model drift

2. **Service Health**:
   - Error rates
   - Response times
   - Resource utilization

### Logging Guidelines

1. **Log Levels**:
   - ERROR: For exceptions and errors
   - INFO: For service operations
   - DEBUG: For detailed debugging

2. **Log Format**:
   ```
   {
     "timestamp": "2023-01-15T12:34:56.789Z",
     "level": "INFO",
     "service": "symptom_forecasting",
     "message": "Forecast generated",
     "patient_id_hash": "a1b2c3d4",  // Hashed for HIPAA compliance
     "duration_ms": 123
   }
   ```

## Conclusion

This implementation guide provides a comprehensive overview of the NOVAMIND ML Microservices architecture. By following these guidelines, developers can ensure that their implementations adhere to Clean Architecture principles, maintain HIPAA compliance, and deliver high-quality, maintainable code.

Remember that the primary goal of this architecture is to provide accurate, personalized insights for psychiatric care while maintaining the highest standards of data privacy and security.
