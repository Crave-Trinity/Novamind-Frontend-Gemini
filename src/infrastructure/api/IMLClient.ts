/* eslint-disable */
/**
 * IMLClient - Interface for ML API capabilities
 *
 * This extends our API client architecture to include ML capabilities from the backend.
 * It will be used by ML-specific components to interact with ML services.
 */
export interface IMLClient {
  // ML Text Processing
  processText(text: string, modelType?: string, options?: Record<string, unknown>): Promise<any>;

  // MentaLLaMA Capabilities
  detectDepression(text: string, options?: Record<string, unknown>): Promise<any>;
  assessRisk(text: string, riskType?: string, options?: Record<string, unknown>): Promise<any>;
  analyzeSentiment(text: string, options?: Record<string, unknown>): Promise<any>;
  analyzeWellnessDimensions(
    text: string,
    dimensions?: string[],
    options?: Record<string, unknown>
  ): Promise<any>;

  // Digital Twin Management
  generateDigitalTwin(
    patientId: string,
    patientData: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<any>;
  createDigitalTwinSession(
    therapistId: string,
    patientId: string,
    sessionType?: string,
    sessionParams?: Record<string, unknown>
  ): Promise<any>;
  getDigitalTwinSession(sessionId: string): Promise<any>;
  sendMessageToSession(
    sessionId: string,
    message: string,
    senderId: string,
    senderType?: string,
    messageParams?: Record<string, unknown>
  ): Promise<any>;
  endDigitalTwinSession(sessionId: string, endReason?: string): Promise<any>;
  getSessionInsights(sessionId: string, insightType?: string): Promise<any>;

  // PHI Protection
  detectPHI(text: string, detectionLevel?: string): Promise<any>;
  redactPHI(text: string, replacement?: string, detectionLevel?: string): Promise<any>;

  // Health Checks
  checkMLHealth(): Promise<any>;
  checkPHIHealth(): Promise<any>;
}

/**
 * Interface combining the base API client with ML capabilities
 */
export interface IEnhancedApiClient extends IMLClient {
  // We'll be extending this with the base IApiClient
}
