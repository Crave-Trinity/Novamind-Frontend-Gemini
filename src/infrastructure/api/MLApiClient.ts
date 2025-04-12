/**
 * MLApiClient
 * 
 * Base client for interacting with the ML API.
 * This client provides direct methods to call API endpoints without 
 * the additional production features like retries and validation.
 * 
 * For production use, prefer MLApiClientEnhanced.
 */

import { ApiClient } from './ApiClient';

export class MLApiClient {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Process text through the ML model
   */
  async processText(text: string, modelType?: string, options?: any): Promise<any> {
    const url = '/ml/mentalllama/process';
    const params = {
      text,
      model_type: modelType,
      options
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Detect depression indicators in text
   */
  async detectDepression(text: string, options?: any): Promise<any> {
    const url = '/ml/mentalllama/depression';
    const params = {
      text,
      options
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Assess risk based on text input
   */
  async assessRisk(text: string, riskType?: string, options?: any): Promise<any> {
    const url = '/ml/mentalllama/risk';
    const params = {
      text,
      risk_type: riskType,
      options
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Analyze sentiment in text
   */
  async analyzeSentiment(text: string, options?: any): Promise<any> {
    const url = '/ml/mentalllama/sentiment';
    const params = {
      text,
      options
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Analyze wellness dimensions from text
   */
  async analyzeWellnessDimensions(text: string, dimensions?: string[], options?: any): Promise<any> {
    const url = '/ml/mentalllama/wellness-dimensions';
    const params = {
      text,
      dimensions,
      options
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Generate a digital twin model based on patient data
   */
  async generateDigitalTwin(patientData: any, options?: any): Promise<any> {
    const url = '/ml/mentalllama/generate-twin';
    const params = {
      patient_data: patientData,
      options
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Create a new digital twin session
   */
  async createDigitalTwinSession(
    therapistId: string,
    patientId: string,
    sessionType?: string,
    sessionParams?: any
  ): Promise<any> {
    const url = '/ml/mentalllama/sessions';
    const params = {
      therapist_id: therapistId,
      patient_id: patientId,
      session_type: sessionType,
      session_params: sessionParams
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
   * Get session details by ID
   */
  async getDigitalTwinSession(sessionId: string): Promise<any> {
    const url = `/ml/mentalllama/sessions/${sessionId}`;
    
    return this.apiClient.get(url);
  }
  
  /**
   * Send a message to a digital twin session
   */
  async sendMessageToSession(
    sessionId: string,
    message: string,
    senderId?: string,
    senderType?: string,
    messageParams?: any
  ): Promise<any> {
    const url = `/ml/mentalllama/sessions/${sessionId}/messages`;
    const params = {
      session_id: sessionId,
      message,
      sender_id: senderId,
      sender_type: senderType,
      message_params: messageParams
    };
    
    return this.apiClient.post(url, params);
  }
  
  /**
