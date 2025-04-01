/**
 * API Client for Novamind Digital Twin
 *
 * Provides a secure, HIPAA-compliant interface for all backend communication.
 */

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { auditLogService, AuditEventType } from "@/services/AuditLogService";

/**
 * API error with enhanced information
 */
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(error: AxiosError) {
    const status = error.response?.status || 0;
    const message = error.message || "Unknown error";

    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = error.response?.data;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Helper function to get auth token
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Helper to log errors
 */
function logApiError(error: AxiosError): void {
  const status = error.response?.status;
  const url = error.config?.url;
  const method = error.config?.method?.toUpperCase();

  console.error(`API Error [${method} ${url}]: ${error.message}`, error);

  // Only log server errors as system errors
  if (!status || status >= 500) {
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      errorCode: "API_ERROR",
      errorMessage: error.message,
      details: `${method} ${url} failed with ${status || "network error"}`,
      result: "failure",
    });
  }
}

/**
 * Helper to handle session expiration
 */
function handleSessionExpiration(): void {
  // Clear auth data
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");

  // Log the event
  auditLogService.log(AuditEventType.SESSION_TIMEOUT, {
    result: "failure",
    details: "Authentication expired, redirecting to login",
  });

  // Redirect to login
  window.location.href = "/login?reason=expired";
}

/**
 * Wrapper for Axios with PHI tracking and error handling
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(
    url: string,
    options?: {
      config?: AxiosRequestConfig;
      phiAccess?: boolean;
      resourceType?: string;
      resourceId?: string;
    },
  ): Promise<T> {
    try {
      // Log PHI access if indicated
      if (options?.phiAccess) {
        auditLogService.log(AuditEventType.PHI_VIEW, {
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          action: "view",
          result: "success",
        });
      }

      const response = await axios.get<T>(`${this.baseURL}${url}`, {
        ...options?.config,
        headers: {
          ...options?.config?.headers,
          ...getAuthHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      // Handle authentication errors
      if ((error as AxiosError).response?.status === 401) {
        handleSessionExpiration();
      }

      // Log error
      logApiError(error as AxiosError);

      // Rethrow as ApiError
      throw new ApiError(error as AxiosError);
    }
  }

  /**
   * Make a POST request
   */
  public async post<T = any, D = any>(
    url: string,
    data?: D,
    options?: {
      config?: AxiosRequestConfig;
      phiAccess?: boolean;
      resourceType?: string;
      resourceId?: string;
    },
  ): Promise<T> {
    try {
      // Log PHI access if indicated
      if (options?.phiAccess) {
        auditLogService.log(AuditEventType.PHI_CREATE, {
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          action: "create",
          result: "success",
        });
      }

      const response = await axios.post<T>(`${this.baseURL}${url}`, data, {
        ...options?.config,
        headers: {
          ...options?.config?.headers,
          ...getAuthHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      // Handle authentication errors
      if ((error as AxiosError).response?.status === 401) {
        handleSessionExpiration();
      }

      // Log error
      logApiError(error as AxiosError);

      // Rethrow as ApiError
      throw new ApiError(error as AxiosError);
    }
  }

  /**
   * Make a PUT request
   */
  public async put<T = any, D = any>(
    url: string,
    data?: D,
    options?: {
      config?: AxiosRequestConfig;
      phiAccess?: boolean;
      resourceType?: string;
      resourceId?: string;
    },
  ): Promise<T> {
    try {
      // Log PHI access if indicated
      if (options?.phiAccess) {
        auditLogService.log(AuditEventType.PHI_UPDATE, {
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          action: "update",
          result: "success",
        });
      }

      const response = await axios.put<T>(`${this.baseURL}${url}`, data, {
        ...options?.config,
        headers: {
          ...options?.config?.headers,
          ...getAuthHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      // Handle authentication errors
      if ((error as AxiosError).response?.status === 401) {
        handleSessionExpiration();
      }

      // Log error
      logApiError(error as AxiosError);

      // Rethrow as ApiError
      throw new ApiError(error as AxiosError);
    }
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(
    url: string,
    options?: {
      config?: AxiosRequestConfig;
      phiAccess?: boolean;
      resourceType?: string;
      resourceId?: string;
    },
  ): Promise<T> {
    try {
      // Log PHI access if indicated
      if (options?.phiAccess) {
        auditLogService.log(AuditEventType.PHI_DELETE, {
          resourceType: options.resourceType,
          resourceId: options.resourceId,
          action: "delete",
          result: "success",
        });
      }

      const response = await axios.delete<T>(`${this.baseURL}${url}`, {
        ...options?.config,
        headers: {
          ...options?.config?.headers,
          ...getAuthHeaders(),
        },
      });

      return response.data;
    } catch (error) {
      // Handle authentication errors
      if ((error as AxiosError).response?.status === 401) {
        handleSessionExpiration();
      }

      // Log error
      logApiError(error as AxiosError);

      // Rethrow as ApiError
      throw new ApiError(error as AxiosError);
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient("/api");
