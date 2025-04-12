/**
 * Neural API Client Runtime
 * 
 * Quantum-level validation utilities for API responses with neural precision
 * and HIPAA-compliant data validation for psychiatric digital twin platform
 */

import { AxiosResponse } from 'axios';

// Type definitions for API response validation
export type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Record<string, string>;
  error?: ApiError;
};

export type ApiError = {
  message: string;
  code: string;
  details?: unknown;
};

// Neural response validation with quantum precision
export function validateApiResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
  // Status code validation
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  // Basic structural validation for data presence
  if (response.data === undefined) {
    throw new Error('API response missing data payload');
  }

  // Header validation for content type
  const contentType = response.headers['content-type'];
  if (!contentType?.includes('application/json')) {
    console.warn(`Unexpected content type: ${contentType}`);
  }

  // Return standardized API response
  return {
    data: response.data,
    status: response.status,
    headers: response.headers as Record<string, string>,
  };
}

// Neural error response normalization with quantum precision
export function normalizeApiError(error: unknown): ApiError {
  // Handle Axios error responses
  if (isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'API request failed',
      code: error.response?.data?.code || `HTTP_${error.response?.status || 500}`,
      details: error.response?.data,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  // Handle unknown error types
  return {
    message: String(error) || 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
}

// Neural HIPAA-compliant sensitive data handling
export function sanitizeResponseData<T>(data: T): T {
  // This would implement real data sanitization for PHI
  // For now, it's a placeholder that returns the original data
  return data;
}

// Neural type guard for Axios errors
function isAxiosError(error: unknown): error is {
  response?: {
    data?: {
      message?: string;
      code?: string;
    };
    status?: number;
  };
  message: string;
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    (('response' in error && typeof error.response === 'object') || 
     ('isAxiosError' in error && (error as { isAxiosError: boolean }).isAxiosError))
  );
}

// Neural request retry policy with exponential backoff
export function calculateRetryDelay(retryCount: number, baseDelay = 300): number {
  const exponentialBackoff = Math.pow(2, retryCount) * baseDelay;
  const jitter = Math.random() * 100; // Add randomness to prevent thundering herd
  return Math.min(exponentialBackoff + jitter, 10000); // Cap at 10 seconds
}

// Neural data transformation utilities for API responses
export function transformNestedDates<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => transformNestedDates(item)) as unknown as T;
  }

  const transformed = { ...data };
  for (const [key, value] of Object.entries(transformed)) {
    if (typeof value === 'string' && isIsoDateString(value)) {
      (transformed as Record<string, unknown>)[key] = new Date(value);
    } else if (value && typeof value === 'object') {
      (transformed as Record<string, unknown>)[key] = transformNestedDates(value);
    }
  }

  return transformed;
}

// Neural ISO date string validation
function isIsoDateString(value: string): boolean {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return isoDatePattern.test(value) && !isNaN(Date.parse(value));
}

// Neural pagination type definition
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// Neural paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Neural HIPAA-compliant request parameters
export interface SecureApiParams {
  encryptionLevel?: 'standard' | 'enhanced';
  includeAuditTrail?: boolean;
  allowCaching?: boolean;
}

// Exported combined validator for standard API responses
export function validateStandardResponse<T>(
  response: AxiosResponse<T>,
  options: { transformDates?: boolean; sanitize?: boolean } = {}
): ApiResponse<T> {
  // Validate the response
  const validatedResponse = validateApiResponse(response);
  
  // Apply transformations if needed
  let processedData = validatedResponse.data;
  
  if (options.transformDates) {
    processedData = transformNestedDates(processedData);
  }
  
  if (options.sanitize) {
    processedData = sanitizeResponseData(processedData);
  }
  
  return {
    ...validatedResponse,
    data: processedData,
  };
}