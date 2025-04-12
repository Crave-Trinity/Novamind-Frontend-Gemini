/**
 * ApiProxyService
 * 
 * Maps frontend API paths to the actual backend paths.
 * This proxy handles the conversion between:
 * - Frontend expected paths: `/api/v1/...`
 * - Backend actual paths: `/api/ml/...`, `/api/xgboost/...`, etc.
 */

import { ApiResponse } from './types';

export class ApiProxyService {
  /**
   * Maps a frontend API path to the corresponding backend path
   */
  static mapPath(path: string): string {
    // Strip leading slash if present for consistent handling
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Handle version prefix - strip 'v1/' prefix if present
    const pathWithoutVersion = normalizedPath.startsWith('v1/') 
      ? normalizedPath.substring(3) 
      : normalizedPath;
    
    // Map Digital Twin endpoints first (more specific)
    if (pathWithoutVersion.startsWith('ml/digital-twin/')) {
      // Extract the path after 'digital-twin/'
      const parts = pathWithoutVersion.split('digital-twin/');
      return `ml/mentalllama/${parts[1]}`;
    }
    
    // Map PHI endpoints (more specific)
    if (pathWithoutVersion.startsWith('ml/phi/')) {
      return `ml/phi/${pathWithoutVersion.substring(7)}`;
    }
    
    // Map other ML endpoints (more general)
    if (pathWithoutVersion.startsWith('ml/')) {
      return `ml/${pathWithoutVersion.substring(3)}`;
    }
    
    // Map Brain Model endpoints
    if (pathWithoutVersion.startsWith('brain-models')) {
      return `ml/brain/${pathWithoutVersion}`;
    }
    
    // Map Patient endpoints
    if (pathWithoutVersion.startsWith('patients')) {
      // Special case for risk assessment and treatment prediction
      if (pathWithoutVersion.includes('/risk-assessment')) {
        return `xgboost/predict-risk/${pathWithoutVersion.split('/')[1]}`;
      }
      
      if (pathWithoutVersion.includes('/predict-treatment')) {
        return `xgboost/predict-treatment-response`;
      }
      
      // Regular patient endpoints
      return `ml/patients/${pathWithoutVersion.substring(9)}`;
    }
    
    // Map auth endpoints 
    if (pathWithoutVersion.startsWith('auth/')) {
      // Authentication endpoints are kept similar
      return pathWithoutVersion;
    }
    
    // Default - return the original path without version prefix
    return pathWithoutVersion;
  }
  
  /**
   * Maps request data to the format expected by the backend
   */
  static mapRequestData(path: string, data: any): any {
    // Don't attempt to transform null/undefined data
    if (!data) return data;
    
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Handle specific endpoint transformations
    if (normalizedPath.includes('predict-treatment')) {
      // Transform treatment prediction data
      return {
        patient_id: data.patientId,
        treatment_type: data.treatmentType,
        treatment_details: data.details || {},
        contextual_factors: data.factors || {}
      };
    }
    
    if (normalizedPath.includes('digital-twin/conversation')) {
      // Transform digital twin conversation data
      return {
        session_id: data.sessionId,
        message: data.message,
        sender_id: data.senderId,
        sender_type: data.senderType || 'user'
      };
    }
    
    // Default - return the original data
    return data;
  }
  
  /**
   * Maps response data from the backend to the format expected by the frontend
   */
  static mapResponseData(path: string, data: any): any {
    // Don't attempt to transform null/undefined data
    if (!data) return data;
    
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Handle specific endpoint transformations
    if (normalizedPath.includes('predict-risk')) {
      // Transform risk assessment response
      return {
        riskLevel: data.risk_level,
        riskFactors: data.risk_factors,
        recommendations: data.recommendations,
        confidenceScore: data.confidence_score
      };
    }
    
    if (normalizedPath.includes('ml/mentalllama/sessions')) {
      // Transform session data
      return {
        id: data.session_id,
        messages: data.messages?.map((m: any) => ({
          id: m.message_id,
          content: m.content,
          sender: m.sender_type,
          timestamp: m.timestamp
        })) || [],
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        insights: data.insights
      };
    }
    
    // Default - return the original data
    return data;
  }
  
  /**
   * Wraps response data in the standard ApiResponse format if it's not already
   */
  static standardizeResponse<T>(data: any): ApiResponse<T> {
    if (data && typeof data === 'object' && 
        ('data' in data || 'error' in data || 'meta' in data)) {
      // Already in ApiResponse format
      return data as ApiResponse<T>;
    }
    
    // Wrap in standard format
    return {
      data: data as T
    };
  }
}