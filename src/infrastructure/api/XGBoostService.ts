/**
 * XGBoost Service API
 * Handles all interactions with the XGBoost prediction backend
 */

import { apiClient } from "@api/ApiClient"; // Match filename casing
import {
  validateData,
  isRiskPredictionRequest,
  isRiskPredictionResponse,
  isTreatmentResponseRequest,
  isTreatmentResponseResponse /* import other guards */,
} from "@api/XGBoostService.runtime";
import { Result, Ok, Err } from "ts-results"; // Import Result for error handling
// Types for XGBoost requests and responses
export interface RiskPredictionRequest {
  patient_id: string;
  risk_type: "relapse" | "suicide";
  clinical_data: {
    assessment_scores: Record<string, number>;
    severity: string;
    diagnosis: string;
    [key: string]: unknown;
  };
  demographic_data?: Record<string, unknown>;
  temporal_data?: Record<string, unknown>;
  confidence_threshold?: number;
}

export interface RiskPredictionResponse {
  prediction_id: string;
  patient_id: string;
  risk_type: string;
  risk_level: "low" | "moderate" | "high" | "severe";
  risk_score: number;
  confidence: number;
  meets_threshold: boolean;
  factors: Array<{
    name: string;
    contribution: number;
    direction: "positive" | "negative";
  }>;
  timestamp: string;
  recommendations: string[];
}

export interface TreatmentResponseRequest {
  patient_id: string;
  treatment_type: string;
  treatment_details: Record<string, unknown>;
  clinical_data: {
    severity: string;
    diagnosis: string;
    [key: string]: unknown;
  };
  genetic_data?: string[];
}

export interface TreatmentResponseResponse {
  prediction_id: string;
  patient_id: string;
  treatment_type: string;
  response_probability: number;
  response_level: "poor" | "partial" | "good" | "excellent";
  confidence: number;
  time_to_response: {
    weeks: number;
    confidence: number;
  };
  factors: Array<{
    name: string;
    contribution: number;
  }>;
  alternative_treatments: Array<{
    type: string;
    estimated_response: number;
  }>;
  timestamp: string;
}

export interface OutcomePredictionRequest {
  patient_id: string;
  outcome_timeframe: {
    weeks: number;
  };
  clinical_data: Record<string, unknown>;
  treatment_plan: Record<string, unknown>;
  social_determinants?: Record<string, unknown>;
  comorbidities?: string[];
}

export interface OutcomePredictionResponse {
  prediction_id: string;
  patient_id: string;
  outcome_metrics: Record<string, number>;
  confidence_intervals: Record<string, [number, number]>;
  trajectory: {
    timepoints: string[];
    metrics: Record<string, number[]>;
  };
  key_factors: Array<{
    name: string;
    impact: number;
  }>;
  timestamp: string;
}

export interface FeatureImportanceRequest {
  patient_id: string;
  model_type: string;
  prediction_id: string;
}

export interface FeatureImportanceResponse {
  prediction_id: string;
  model_type: string;
  features: Array<{
    name: string;
    importance: number;
    direction: "positive" | "negative";
    category: string;
  }>;
  interaction_effects: Array<{
    feature_pair: [string, string];
    importance: number;
  }>;
  methodology: string;
  interpretation: string[];
}

export interface DigitalTwinIntegrationRequest {
  patient_id: string;
  profile_id: string;
  prediction_id: string;
}

export interface DigitalTwinIntegrationResponse {
  integration_id: string;
  profile_id: string;
  prediction_id: string;
  updated_metrics: string[];
  impact_assessment: Record<string, unknown>;
  timestamp: string;
}

export interface ModelInfoRequest {
  model_type: string;
}

export interface ModelInfoResponse {
  model_type: string;
  description: string;
  version: string;
  features: string[];
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    auc: number;
  };
  last_updated: string;
  training_data_summary: Record<string, unknown>;
}

/**
 * XGBoost API Service
 */
class XGBoostService {
  /**
   * Predict psychiatric risk
   */
  async predictRisk(
    request: RiskPredictionRequest,
  ): Promise<Result<RiskPredictionResponse, Error>> {
    // Return Result
    // Validate request before sending
    const requestValidation = validateData(
      request,
      isRiskPredictionRequest,
      "RiskPredictionRequest",
    );
    if (requestValidation.err) {
      console.error(
        "Invalid RiskPredictionRequest:",
        requestValidation.val.message,
      );
      return Err(requestValidation.val);
    }

    try {
      const responseData = await apiClient.post<RiskPredictionResponse>(
        "/xgboost/predict-risk",
        requestValidation.val, // Send validated data
      );
      // Validate response
      const responseValidation = validateData(
        responseData,
        isRiskPredictionResponse,
        "RiskPredictionResponse",
      );
      if (responseValidation.err) {
        console.error(
          "Invalid RiskPredictionResponse:",
          responseValidation.val.message,
        );
        return Err(responseValidation.val);
      }
      return Ok(responseValidation.val);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("API call failed in predictRisk"),
      );
    }
  }

  /**
   * Predict treatment response
   */
  async predictTreatmentResponse(
    request: TreatmentResponseRequest,
  ): Promise<Result<TreatmentResponseResponse, Error>> {
    // Return Result
    // Validate request before sending
    const requestValidation = validateData(
      request,
      isTreatmentResponseRequest,
      "TreatmentResponseRequest",
    );
    if (requestValidation.err) {
      console.error(
        "Invalid TreatmentResponseRequest:",
        requestValidation.val.message,
      );
      return Err(requestValidation.val);
    }

    try {
      const responseData = await apiClient.post<TreatmentResponseResponse>(
        "/xgboost/predict-treatment-response",
        requestValidation.val, // Send validated data
      );
      // Validate response
      const responseValidation = validateData(
        responseData,
        isTreatmentResponseResponse,
        "TreatmentResponseResponse",
      );
      if (responseValidation.err) {
        console.error(
          "Invalid TreatmentResponseResponse:",
          responseValidation.val.message,
        );
        return Err(responseValidation.val);
      }
      return Ok(responseValidation.val);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("API call failed in predictTreatmentResponse"),
      );
    }
  }

  /**
   * Predict psychiatric outcome
   */
  async predictOutcome(
    request: OutcomePredictionRequest,
  ): Promise<Result<OutcomePredictionResponse, Error>> {
    // Return Result
    // TODO: Add request validation (isOutcomePredictionRequest)
    try {
      const responseData = await apiClient.post<OutcomePredictionResponse>(
        "/xgboost/predict-outcome",
        request,
      );
      // TODO: Add response validation (isOutcomePredictionResponse)
      // const responseValidation = validateData(responseData, isOutcomePredictionResponse, 'OutcomePredictionResponse');
      // if (responseValidation.err) return Err(responseValidation.val);
      // return Ok(responseValidation.val);
      return Ok(responseData); // Placeholder return
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("API call failed in predictOutcome"),
      );
    }
  }

  /**
   * Get feature importance for a prediction
   */
  async getFeatureImportance(
    request: FeatureImportanceRequest,
  ): Promise<Result<FeatureImportanceResponse, Error>> {
    // Return Result
    // TODO: Add request validation (isFeatureImportanceRequest)
    try {
      const responseData = await apiClient.post<FeatureImportanceResponse>(
        "/xgboost/feature-importance",
        request,
      );
      // TODO: Add response validation (isFeatureImportanceResponse)
      // const responseValidation = validateData(responseData, isFeatureImportanceResponse, 'FeatureImportanceResponse');
      // if (responseValidation.err) return Err(responseValidation.val);
      // return Ok(responseValidation.val);
      return Ok(responseData); // Placeholder return
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("API call failed in getFeatureImportance"),
      );
    }
  }

  /**
   * Integrate prediction with digital twin profile
   */
  async integrateWithDigitalTwin(
    request: DigitalTwinIntegrationRequest,
  ): Promise<Result<DigitalTwinIntegrationResponse, Error>> {
    // Return Result
    // TODO: Add request validation (isDigitalTwinIntegrationRequest)
    try {
      const responseData = await apiClient.post<DigitalTwinIntegrationResponse>(
        "/xgboost/integrate-with-digital-twin",
        request,
      );
      // TODO: Add response validation (isDigitalTwinIntegrationResponse)
      // const responseValidation = validateData(responseData, isDigitalTwinIntegrationResponse, 'DigitalTwinIntegrationResponse');
      // if (responseValidation.err) return Err(responseValidation.val);
      // return Ok(responseValidation.val);
      return Ok(responseData); // Placeholder return
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("API call failed in integrateWithDigitalTwin"),
      );
    }
  }

  /**
   * Get model information
   */
  async getModelInfo(
    request: ModelInfoRequest,
  ): Promise<Result<ModelInfoResponse, Error>> {
    // Return Result
    // TODO: Add request validation (isModelInfoRequest)
    try {
      const responseData = await apiClient.post<ModelInfoResponse>(
        "/xgboost/model-info",
        request,
      );
      // TODO: Add response validation (isModelInfoResponse)
      // const responseValidation = validateData(responseData, isModelInfoResponse, 'ModelInfoResponse');
      // if (responseValidation.err) return Err(responseValidation.val);
      // return Ok(responseValidation.val);
      return Ok(responseData); // Placeholder return
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("API call failed in getModelInfo"),
      );
    }
  }
}

// Create and export instance
const xgboostService = new XGBoostService();
export { xgboostService };
