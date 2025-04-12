/**
 * MLApiClientEnhanced
 * 
 * Enhanced ML API client with production-grade features:
 * - Request validation
 * - Robust error handling
 * - Retry mechanism with exponential backoff
 * - Detailed error classification
 * - PHI protection
 * 
 * This client wraps the base MLApiClient with additional resilience 
 * and monitoring capabilities for production usage.
 */

import { MLApiClient } from './MLApiClient';
import { ApiClient } from './ApiClient';

// Error classification for better handling
export enum MLErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNEXPECTED = 'UNEXPECTED',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  PHI_DETECTION = 'PHI_DETECTION'
}

// Define retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryStatusCodes: number[];
  retryErrorCodes: string[];
}

// Custom API error with additional context
export class MLApiError extends Error {
  type: MLErrorType;
  statusCode?: number;
  endpoint: string;
  requestId?: string;
  retryable: boolean;
  details?: any;
  
  constructor(message: string, type: MLErrorType, endpoint: string, options?: {
    statusCode?: number;
    requestId?: string;
    retryable?: boolean;
    details?: any;
  }) {
    super(message);
    this.name = 'MLApiError';
    this.type = type;
    this.endpoint = endpoint;
    this.statusCode = options?.statusCode;
    this.requestId = options?.requestId;
    this.retryable = options?.retryable ?? false;
    this.details = options?.details;
    
    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MLApiError);
    }
  }
}

/**
 * Enhanced ML API client with production-grade resilience
 */
export class MLApiClientEnhanced {
  private client: MLApiClient;
  private retryConfig: RetryConfig;
  
  constructor(apiClient: ApiClient) {
    this.client = new MLApiClient(apiClient);
    
    // Configure default retry settings
    this.retryConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      retryStatusCodes: [408, 429, 500, 502, 503, 504],
      retryErrorCodes: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED']
    };
  }
  
  /**
   * Execute a function with retry logic
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    endpoint: string,
    options?: {
      maxRetries?: number;
      validateFn?: () => boolean | string;
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries ?? this.retryConfig.maxRetries;
    
    // Perform validation if provided
    if (options?.validateFn) {
      const validationResult = options.validateFn();
      if (validationResult !== true) {
        const message = typeof validationResult === 'string'
          ? validationResult
          : 'Validation failed for request parameters';
        
        throw new MLApiError(message, MLErrorType.VALIDATION, endpoint, {
          retryable: false,
        });
      }
    }
    
    let lastError: any;
    
    // Try with retries
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Process the error to determine if we should retry
        const processedError = this.processError(error, endpoint);
        
        // Don't retry if error is marked as non-retryable
        if (!processedError.retryable) {
          throw processedError;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          throw processedError;
        }
        
        // Calculate backoff delay with jitter
        const delay = Math.min(
          this.retryConfig.baseDelayMs * Math.pow(2, attempt) + Math.random() * 100,
          this.retryConfig.maxDelayMs
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should not be reached due to the throw in the loop,
    // but TypeScript requires a return value
    throw this.processError(lastError, endpoint);
  }
  
  /**
   * Process and normalize errors
   */
  private processError(error: any, endpoint: string): MLApiError {
    // If it's already our error type, return it
    if (error instanceof MLApiError) {
      return error;
    }
    
    let type = MLErrorType.UNEXPECTED;
    let message = 'An unexpected error occurred';
    let statusCode: number | undefined;
    let requestId: string | undefined;
    let retryable = false;
    let details: any;
    
    // Handle Axios errors
    if (error.isAxiosError) {
      // Get status code and request ID if available
      if (error.response) {
        statusCode = error.response.status;
        requestId = error.response.headers?.['x-request-id'];
        
        // Extract message from response if available
        if (error.response.data?.message) {
          message = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else {
          message = `Request failed with status code ${statusCode}`;
        }
        
        // Classify based on status code
        if (statusCode === 401) {
          type = MLErrorType.TOKEN_REVOKED;
          message = 'Authentication failed. Please login again.';
          retryable = false;
        } else if (statusCode === 403) {
          type = MLErrorType.TOKEN_REVOKED;
          message = 'You do not have permission to perform this action.';
          retryable = false;
        } else if (statusCode === 404) {
          type = MLErrorType.NOT_FOUND;
          message = `Resource not found at endpoint: ${endpoint}`;
          retryable = false;
        } else if (statusCode === 429) {
          type = MLErrorType.RATE_LIMIT;
          message = 'Rate limit exceeded. Please try again later.';
          retryable = true;
        } else if (statusCode !== undefined && statusCode >= 500) {
          type = MLErrorType.SERVICE_UNAVAILABLE;
          message = 'The service is currently unavailable. Please try again later.';
          retryable = statusCode !== undefined && this.retryConfig.retryStatusCodes.includes(statusCode);
        } else if (statusCode !== undefined && statusCode >= 400) {
          type = MLErrorType.BAD_REQUEST;
          message = error.response.data?.message || 'The request was invalid.';
          retryable = false;
        }
        
        // Include response data in details
        details = error.response.data;
      } else if (error.request) {
        // Request was made but no response received
        if (error.code === 'ECONNABORTED') {
          type = MLErrorType.TIMEOUT;
          message = 'Request timed out. Please try again.';
          retryable = true;
        } else {
          type = MLErrorType.NETWORK;
          message = 'Network error. Please check your connection.';
          retryable = this.retryConfig.retryErrorCodes.includes(error.code);
        }
      }
    } else if (error instanceof Error) {
      // Other error types
      message = error.message;
    } else if (typeof error === 'string') {
      // String error
      message = error;
    }
    
    return new MLApiError(message, type, endpoint, {
      statusCode,
      requestId,
      retryable,
      details
    });
  }
  
  /**
   * Enhanced API methods with validation and retry
   */
  
  async processText(text: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.processText(text, options),
      'processText',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Text is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async detectDepression(text: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.detectDepression(text, options),
      'detectDepression',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Text is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async assessRisk(text: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.assessRisk(text, options),
      'assessRisk',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Text is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async analyzeSentiment(text: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.analyzeSentiment(text, options),
      'analyzeSentiment',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Text is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async analyzeWellnessDimensions(text: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.analyzeWellnessDimensions(text, options),
      'analyzeWellnessDimensions',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Text is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async generateDigitalTwin(patientData: any, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.generateDigitalTwin(patientData, options),
      'generateDigitalTwin',
      {
        validateFn: () => {
          if (!patientData || typeof patientData !== 'object') {
            return 'Patient data is required and must be an object';
          }
          return true;
        }
      }
    );
  }
  
  async createDigitalTwinSession(therapistId: string, patientId: string, mode?: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.createDigitalTwinSession(therapistId, patientId, mode, options),
      'createDigitalTwinSession',
      {
        validateFn: () => {
          if (!therapistId) {
            return 'Therapist ID is required';
          }
          if (!patientId) {
            return 'Patient ID is required';
          }
          return true;
        }
      }
    );
  }
  
  async getDigitalTwinSession(sessionId: string): Promise<any> {
    return this.withRetry(
      () => this.client.getDigitalTwinSession(sessionId),
      'getDigitalTwinSession',
      {
        validateFn: () => {
          if (!sessionId) {
            return 'Session ID is required';
          }
          return true;
        }
      }
    );
  }
  
  async sendMessageToSession(sessionId: string, message: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.sendMessageToSession(sessionId, message, options),
      'sendMessageToSession',
      {
        validateFn: () => {
          if (!sessionId) {
            return 'Session ID is required';
          }
          if (!message || typeof message !== 'string') {
            return 'Message is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async endDigitalTwinSession(sessionId: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.endDigitalTwinSession(sessionId, options),
      'endDigitalTwinSession',
      {
        validateFn: () => {
          if (!sessionId) {
            return 'Session ID is required';
          }
          return true;
        }
      }
    );
  }
  
  async getSessionInsights(sessionId: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.getSessionInsights(sessionId, options),
      'getSessionInsights',
      {
        validateFn: () => {
          if (!sessionId) {
            return 'Session ID is required';
          }
          return true;
        }
      }
    );
  }
  
  async detectPHI(text: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.detectPHI(text, options),
      'detectPHI',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Validation failed: Text is required for PHI detection';
          }
          return true;
        }
      }
    );
  }
  
  async redactPHI(text: string, replacement?: string, options?: any): Promise<any> {
    return this.withRetry(
      () => this.client.redactPHI(text, replacement, options),
      'redactPHI',
      {
        validateFn: () => {
          if (!text || typeof text !== 'string') {
            return 'Text is required and must be a string';
          }
          return true;
        }
      }
    );
  }
  
  async checkMLHealth(): Promise<any> {
    return this.withRetry(
      () => this.client.checkMLHealth(),
      'checkMLHealth'
    );
  }
  
  async checkPHIHealth(): Promise<any> {
    return this.withRetry(
      () => this.client.checkPHIHealth(),
      'checkPHIHealth'
    );
  }
  
  /**
   * Configure retry settings
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = {
      ...this.retryConfig,
      ...config
    };
  }
}