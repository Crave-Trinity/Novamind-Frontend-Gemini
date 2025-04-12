/**
 * Enhanced ML API Client with comprehensive error handling
 * and request/response validation for production environments
 */

import { MLApiClient } from './MLApiClient';
import { EnhancedApiProxyService } from './ApiProxyService.enhanced';
import { ApiClient } from './apiClient';

/**
 * Error types specific to ML operations
 */
export enum MLErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  PHI_DETECTION = 'PHI_DETECTION_ERROR',
  MODEL_UNAVAILABLE = 'MODEL_UNAVAILABLE',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  RATE_LIMIT = 'RATE_LIMIT_EXCEEDED',
  UNEXPECTED = 'UNEXPECTED_ERROR'
}

/**
 * Structured ML API error with additional context
 */
export class MLApiError extends Error {
  public readonly type: MLErrorType;
  public readonly endpoint: string;
  public readonly statusCode?: number;
  public readonly requestId?: string;
  public readonly retryable: boolean;
  public readonly details?: Record<string, any>;

  constructor(options: {
    message: string;
    type: MLErrorType;
    endpoint: string;
    statusCode?: number;
    requestId?: string;
    retryable?: boolean;
    details?: Record<string, any>;
    cause?: Error;
  }) {
    super(options.message);
    this.name = 'MLApiError';
    this.type = options.type;
    this.endpoint = options.endpoint;
    this.statusCode = options.statusCode;
    this.requestId = options.requestId;
    this.retryable = options.retryable ?? false;
    this.details = options.details;
    
    // Set the cause if provided (supported in newer JS environments)
    if (options.cause && Error.hasOwnProperty('captureStackTrace')) {
      (this as any).cause = options.cause;
    }
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MLApiError);
    }
  }
}

/**
 * Validation rules for ML API requests
 */
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean;
  message?: string;
}

/**
 * Type guard for axios errors
 */
function isAxiosError(error: any): boolean {
  return error && 
         error.isAxiosError === true && 
         error.response !== undefined;
}

/**
 * Enhanced ML API Client with robust error handling and validation
 */
export class MLApiClientEnhanced {
  private client: MLApiClient;
  private validationRules: Record<string, ValidationRule[]> = {};
  private retryConfig: {
    maxRetries: number;
    retryableErrors: MLErrorType[];
    baseDelayMs: number;
  };

  constructor(apiClient: ApiClient) {
    this.client = new MLApiClient(apiClient);
    
    // Configure which errors should be retried automatically
    this.retryConfig = {
      maxRetries: 3,
      retryableErrors: [
        MLErrorType.NETWORK,
        MLErrorType.TIMEOUT
      ],
      baseDelayMs: 500 // Base delay for exponential backoff
    };
    
    // Set up validation rules for endpoints
    this.setupValidationRules();
  }
  
  /**
   * Set up validation rules for different ML API endpoints
   */
  private setupValidationRules(): void {
    // Risk assessment validation
    this.validationRules['assessRisk'] = [
      { field: 'text', required: true, type: 'string', minLength: 1, message: 'Text content is required' },
      { field: 'riskType', required: false, type: 'string', enum: ['suicide', 'self-harm', 'violence', 'general'] }
    ];
    
    // Digital twin validation
    this.validationRules['generateDigitalTwin'] = [
      { field: 'patientId', required: true, type: 'string', minLength: 1, message: 'Patient ID is required' },
      { field: 'patientData', required: true, type: 'object', message: 'Patient data is required' }
    ];
    
    // Digital twin session validation
    this.validationRules['createDigitalTwinSession'] = [
      { field: 'therapistId', required: true, type: 'string', minLength: 1, message: 'Therapist ID is required' },
      { field: 'patientId', required: true, type: 'string', minLength: 1, message: 'Patient ID is required' },
      { field: 'sessionType', required: false, type: 'string' }
    ];
    
    // Message validation
    this.validationRules['sendMessageToSession'] = [
      { field: 'sessionId', required: true, type: 'string', minLength: 1, message: 'Session ID is required' },
      { field: 'message', required: true, type: 'string', minLength: 1, message: 'Message content is required' },
      { field: 'senderId', required: true, type: 'string', minLength: 1, message: 'Sender ID is required' }
    ];
    
    // PHI detection validation
    this.validationRules['detectPHI'] = [
      { field: 'text', required: true, type: 'string', minLength: 1, message: 'Text content is required' }
    ];
    
    // PHI redaction validation
    this.validationRules['redactPHI'] = [
      { field: 'text', required: true, type: 'string', minLength: 1, message: 'Text content is required' }
    ];
  }
  
  /**
   * Validate request parameters
   */
  private validateRequest(methodName: string, params: any[]): void {
    const rules = this.validationRules[methodName];
    if (!rules || rules.length === 0) return;
    
    const errors: string[] = [];
    
    rules.forEach((rule, index) => {
      const value = params[index];
      
      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} is required`);
        return;
      }
      
      // Skip further validation if value is not provided and not required
      if (value === undefined || value === null) return;
      
      // Type validation
      if (rule.type && typeof value !== rule.type && 
          !(rule.type === 'array' && Array.isArray(value)) &&
          !(rule.type === 'object' && typeof value === 'object' && !Array.isArray(value))) {
        errors.push(`${rule.field} must be a ${rule.type}`);
      }
      
      // String validations
      if (rule.type === 'string' && typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.field} has an invalid format`);
        }
      }
      
      // Number validations
      if (rule.type === 'number' && typeof value === 'number') {
        if (rule.minValue !== undefined && value < rule.minValue) {
          errors.push(`${rule.field} must be at least ${rule.minValue}`);
        }
        if (rule.maxValue !== undefined && value > rule.maxValue) {
          errors.push(`${rule.field} must be at most ${rule.maxValue}`);
        }
      }
      
      // Enum validation
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${rule.field} must be one of: ${rule.enum.join(', ')}`);
      }
      
      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push(rule.message || `${rule.field} is invalid`);
      }
    });
    
    if (errors.length > 0) {
      throw new MLApiError({
        message: `Validation failed: ${errors.join('; ')}`,
        type: MLErrorType.VALIDATION,
        endpoint: methodName,
        details: { errors },
        retryable: false
      });
    }
  }
  
  /**
   * Process errors from API calls
   */
  private processError(error: any, endpoint: string): MLApiError {
    // Handle axios specific errors
    if (isAxiosError(error)) {
      const statusCode = error.response?.status;
      const requestId = error.response?.headers['x-request-id'];
      const responseData = error.response?.data;
      
      // Timeout errors
      if (error.code === 'ECONNABORTED') {
        return new MLApiError({
          message: 'Request timed out',
          type: MLErrorType.TIMEOUT,
          endpoint,
          requestId,
          retryable: true,
          cause: error
        });
      }
      
      // Network errors
      if (!error.response) {
        return new MLApiError({
          message: 'Network error',
          type: MLErrorType.NETWORK,
          endpoint,
          retryable: true,
          cause: error
        });
      }
      
      // Rate limiting
      if (statusCode === 429) {
        return new MLApiError({
          message: 'Rate limit exceeded',
          type: MLErrorType.RATE_LIMIT,
          endpoint,
          statusCode,
          requestId,
          retryable: true,
          details: responseData,
          cause: error
        });
      }
      
      // Authentication errors
      if (statusCode === 401) {
        return new MLApiError({
          message: 'Authentication failed',
          type: MLErrorType.TOKEN_REVOKED,
          endpoint,
          statusCode,
          requestId,
          retryable: false,
          details: responseData,
          cause: error
        });
      }
      
      // General API errors
      return new MLApiError({
        message: responseData?.message || error.message || 'API Error',
        type: MLErrorType.UNEXPECTED,
        endpoint,
        statusCode,
        requestId,
        retryable: false,
        details: responseData,
        cause: error
      });
    }
    
    // Handle validation errors
    if (error instanceof MLApiError) {
      return error;
    }
    
    // Handle general errors
    return new MLApiError({
      message: error.message || 'Unknown error occurred',
      type: MLErrorType.UNEXPECTED,
      endpoint,
      retryable: false,
      cause: error instanceof Error ? error : undefined
    });
  }
  
  /**
   * Wrapper to handle retries and error processing
   */
  private async executeWithRetry<T>(
    endpoint: string,
    method: (...args: any[]) => Promise<T>,
    args: any[]
  ): Promise<T> {
    let lastError: MLApiError | null = null;
    let retryCount = 0;
    
    while (retryCount <= this.retryConfig.maxRetries) {
      try {
        // Validate request parameters before calling API
        this.validateRequest(endpoint, args);
        
        // Call the actual method
        const result = await method.apply(this.client, args);
        return result;
      } catch (error) {
        const mlError = this.processError(error, endpoint);
        lastError = mlError;
        
        // Check if error is retryable
        if (!mlError.retryable || !this.retryConfig.retryableErrors.includes(mlError.type)) {
          throw mlError;
        }
        
        // Maximum retries reached
        if (retryCount >= this.retryConfig.maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = this.retryConfig.baseDelayMs * Math.pow(2, retryCount);
        console.warn(`Retrying ${endpoint} (attempt ${retryCount + 1}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
      }
    }
    
    // All retries failed
    throw lastError || new MLApiError({
      message: `All retries failed for ${endpoint}`,
      type: MLErrorType.UNEXPECTED,
      endpoint,
      retryable: false
    });
  }
  
  /**
   * Process text using the MentaLLaMA model
   */
  async processText(
    text: string, 
    modelType?: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.executeWithRetry('processText', this.client.processText, [text, modelType, options]);
  }
  
  /**
   * Detect depression signals in text
   */
  async detectDepression(
    text: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.executeWithRetry('detectDepression', this.client.detectDepression, [text, options]);
  }
  
  /**
   * Assess risk in text
   */
  async assessRisk(
    text: string, 
    riskType?: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.executeWithRetry('assessRisk', this.client.assessRisk, [text, riskType, options]);
  }
  
  /**
   * Analyze sentiment in text
   */
  async analyzeSentiment(
    text: string, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.executeWithRetry('analyzeSentiment', this.client.analyzeSentiment, [text, options]);
  }
  
  /**
   * Analyze wellness dimensions in text
   */
  async analyzeWellnessDimensions(
    text: string, 
    dimensions?: string[], 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.executeWithRetry('analyzeWellnessDimensions', this.client.analyzeWellnessDimensions, [text, dimensions, options]);
  }
  
  /**
   * Generate or update a digital twin for a patient
   */
  async generateDigitalTwin(
    patientId: string, 
    patientData: Record<string, unknown>, 
    options?: Record<string, unknown>
  ): Promise<any> {
    return this.executeWithRetry('generateDigitalTwin', this.client.generateDigitalTwin, [patientId, patientData, options]);
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
    return this.executeWithRetry('createDigitalTwinSession', this.client.createDigitalTwinSession, [
      therapistId, patientId, sessionType, sessionParams
    ]);
  }
  
  /**
   * Get a Digital Twin session
   */
  async getDigitalTwinSession(sessionId: string): Promise<any> {
    return this.executeWithRetry('getDigitalTwinSession', this.client.getDigitalTwinSession, [sessionId]);
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
    return this.executeWithRetry('sendMessageToSession', this.client.sendMessageToSession, [
      sessionId, message, senderId, senderType, messageParams
    ]);
  }
  
  /**
   * End a Digital Twin session
   */
  async endDigitalTwinSession(
    sessionId: string, 
    endReason?: string
  ): Promise<any> {
    return this.executeWithRetry('endDigitalTwinSession', this.client.endDigitalTwinSession, [sessionId, endReason]);
  }
  
  /**
   * Get insights from a Digital Twin session
   */
  async getSessionInsights(
    sessionId: string, 
    insightType?: string
  ): Promise<any> {
    return this.executeWithRetry('getSessionInsights', this.client.getSessionInsights, [sessionId, insightType]);
  }
  
  /**
   * Detect PHI in text
   */
  async detectPHI(
    text: string, 
    detectionLevel?: string
  ): Promise<any> {
    return this.executeWithRetry('detectPHI', this.client.detectPHI, [text, detectionLevel]);
  }
  
  /**
   * Redact PHI from text
   */
  async redactPHI(
    text: string, 
    replacement?: string, 
    detectionLevel?: string
  ): Promise<any> {
    return this.executeWithRetry('redactPHI', this.client.redactPHI, [text, replacement, detectionLevel]);
  }
  
  /**
   * Check ML service health
   */
  async checkMLHealth(): Promise<any> {
    return this.executeWithRetry('checkMLHealth', this.client.checkMLHealth, []);
  }
  
  /**
   * Check PHI service health
   */
  async checkPHIHealth(): Promise<any> {
    return this.executeWithRetry('checkPHIHealth', this.client.checkPHIHealth, []);
  }
}

// Create and export a singleton instance tied to the main ApiClient
import { apiClient } from './apiClient';
export const mlApiClientEnhanced = new MLApiClientEnhanced(apiClient as ApiClient);