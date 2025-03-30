/**
 * XGBoost Service API
 * Handles all interactions with the XGBoost prediction backend
 */

import { apiClient } from "./ApiClient";

// Types for XGBoost requests and responses
export interface RiskPredictionRequest {
  patient_id: string;
  risk_type: "relapse" | "suicide";
  clinical_data: {
    assessment_scores: Record<string, number>;
    severity: string;
    diagnosis: string;
    [key: string]: any;
  };
  demographic_data?: Record<string, any>;
  temporal_data?: Record<string, any>;
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
  treatment_details: Record<string, any>;
  clinical_data: {
    severity: string;
    diagnosis: string;
    [key: string]: any;
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
  clinical_data: Record<string, any>;
  treatment_plan: Record<string, any>;
  social_determinants?: Record<string, any>;
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
  impact_assessment: Record<string, any>;
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
  training_data_summary: Record<string, any>;
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
  ): Promise<RiskPredictionResponse> {
    return apiClient.post<RiskPredictionResponse>(
      "/xgboost/predict-risk",
      request,
    );
  }

  /**
   * Predict treatment response
   */
  async predictTreatmentResponse(
    request: TreatmentResponseRequest,
  ): Promise<TreatmentResponseResponse> {
    return apiClient.post<TreatmentResponseResponse>(
      "/xgboost/predict-treatment-response",
      request,
    );
  }

  /**
   * Predict psychiatric outcome
   */
  async predictOutcome(
    request: OutcomePredictionRequest,
  ): Promise<OutcomePredictionResponse> {
    return apiClient.post<OutcomePredictionResponse>(
      "/xgboost/predict-outcome",
      request,
    );
  }

  /**
   * Get feature importance for a prediction
   */
  async getFeatureImportance(
    request: FeatureImportanceRequest,
  ): Promise<FeatureImportanceResponse> {
    return apiClient.post<FeatureImportanceResponse>(
      "/xgboost/feature-importance",
      request,
    );
  }

  /**
   * Integrate prediction with digital twin profile
   */
  async integrateWithDigitalTwin(
    request: DigitalTwinIntegrationRequest,
  ): Promise<DigitalTwinIntegrationResponse> {
    return apiClient.post<DigitalTwinIntegrationResponse>(
      "/xgboost/integrate-with-digital-twin",
      request,
    );
  }

  /**
   * Get model information
   */
  async getModelInfo(request: ModelInfoRequest): Promise<ModelInfoResponse> {
    return apiClient.post<ModelInfoResponse>("/xgboost/model-info", request);
  }
}

// Create and export instance
const xgboostService = new XGBoostService();
export { xgboostService };
