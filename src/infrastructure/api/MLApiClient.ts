import { ApiClient } from './apiClient';
import { IMLClient } from './IMLClient';

/**
 * MLApiClient - Implementation of the ML API client interface
 * 
 * This class provides access to the backend ML capabilities by mapping
 * to the appropriate backend endpoints. It builds on the existing ApiClient
 * infrastructure for HTTP requests and authentication.
 */
export class MLApiClient implements IMLClient {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Process text using the MentaLLaMA model
   */
  async processText(
    text: string, 
    modelType?: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/process', {
      text,
      model_type: modelType,
      options: options || {}
    });
  }
  
  /**
   * Detect depression signals in text
   */
  async detectDepression(
    text: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/depression', {
      text,
      options: options || {}
    });
  }
  
  /**
   * Assess risk in text
   */
  async assessRisk(
    text: string, 
    riskType?: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/risk', {
      text,
      risk_type: riskType,
      options: options || {}
    });
  }
  
  /**
   * Analyze sentiment in text
   */
  async analyzeSentiment(
    text: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/sentiment', {
      text,
      options: options || {}
    });
  }
  
  /**
   * Analyze wellness dimensions in text
   */
  async analyzeWellnessDimensions(
    text: string, 
    dimensions?: string[], 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/wellness', {
      text,
      dimensions,
      options: options || {}
    });
  }
  
  /**
   * Generate or update a digital twin for a patient
   */
  async generateDigitalTwin(
    patientId: string, 
    patientData: Record<string, unknown>, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/digital-twin', {
      patient_id: patientId,
      patient_data: patientData,
      options: options || {}
    });
  }
  
  /**
   * Create a new Digital Twin session
   */
  async createDigitalTwinSession(
    therapistId: string, 
    patientId: string, 
    sessionType?: string, 
    sessionParams?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post('/ml/mentalllama/sessions', {
      therapist_id: therapistId,
      patient_id: patientId,
      session_type: sessionType,
      session_params: sessionParams || {}
    });
  }
  
  /**
   * Get a Digital Twin session
   */
  async getDigitalTwinSession(sessionId: string): Promise<any> {
    return this.apiClient.get(`/ml/mentalllama/sessions/${sessionId}`);
  }
  
  /**
   * Send a message to a Digital Twin session
   */
  async sendMessageToSession(
    sessionId: string, 
    message: string, 
    senderId: string, 
    senderType?: string, 
    messageParams?: Record<string, unknown>
  ): Promise<any> {
    return this.apiClient.post(`/ml/mentalllama/sessions/${sessionId}/messages`, {
      session_id: sessionId,
      message,
      sender_id: senderId,
      sender_type: senderType,
      message_params: messageParams || {}
    });
  }
  
  /**
   * End a Digital Twin session
   */
  async endDigitalTwinSession(
    sessionId: string, 
    endReason?: string
  ): Promise<any> {
    return this.apiClient.post(`/ml/mentalllama/sessions/${sessionId}/end`, {
      session_id: sessionId,
      end_reason: endReason
    });
  }
  
  /**
   * Get insights from a Digital Twin session
   */
  async getSessionInsights(
    sessionId: string, 
    insightType?: string
  ): Promise<any> {
    return this.apiClient.post(`/ml/mentalllama/sessions/${sessionId}/insights`, {
      session_id: sessionId,
      insight_type: insightType
    });
  }
  
  /**
   * Detect PHI in text
   */
  async detectPHI(
    text: string, 
    detectionLevel?: string
  ): Promise<any> {
    return this.apiClient.post('/ml/phi/detect', {
      text,
      detection_level: detectionLevel
    });
  }
  
  /**
   * Redact PHI from text
   */
  async redactPHI(
    text: string, 
    replacement?: string, 
    detectionLevel?: string
  ): Promise<any> {
    return this.apiClient.post('/ml/phi/redact', {
      text,
      replacement,
      detection_level: detectionLevel
    });
  }
  
  /**
   * Check ML service health
   */
  async checkMLHealth(): Promise<any> {
    return this.apiClient.get('/ml/mentalllama/health');
  }
  
  /**
   * Check PHI service health
   */
  async checkPHIHealth(): Promise<any> {
    return this.apiClient.get('/ml/phi/health');
  }
}

// Create and export a singleton instance tied to the main ApiClient
import { apiClient } from './apiClient';
export const mlApiClient = new MLApiClient(apiClient as ApiClient);