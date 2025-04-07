import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios'; // Removed unused AxiosResponse
import type { ApiResponse, ApiError, AuditLog } from '@domain/types/common';

export class ApiClient {
  private client: AxiosInstance;
  private auditLogs: AuditLog[] = [];

  constructor(
    baseURL: string
    // Removed unused apiKey parameter
  ) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        // 'X-API-Key': apiKey, // Removed header using unused apiKey
      },
    });

    // Add request interceptor for HIPAA compliance
    this.client.interceptors.request.use(
      (config) => {
        // Add HIPAA required headers
        config.headers['X-Request-ID'] = crypto.randomUUID();
        config.headers['X-Timestamp'] = new Date().toISOString();

        // Log the request for audit
        this.logAudit({
          action: this.getActionFromMethod(config.method || 'get'),
          resource: config.url || 'unknown',
          resourceId: this.extractResourceId(config.url || ''),
          userId: this.getCurrentUserId(),
          changes: config.data,
          ipAddress: window.location.hostname,
          userAgent: navigator.userAgent,
        });

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const apiError: ApiError = {
            code: error.response.data.code || 'UNKNOWN_ERROR',
            message: error.response.data.message || 'An unknown error occurred',
            details: error.response.data.details,
          };
          return Promise.reject(apiError);
        }
        return Promise.reject({
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        });
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<void> {
    await this.client.delete(url, config);
  }

  // HIPAA Compliance Methods
  private logAudit(audit: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...audit,
    };
    this.auditLogs.push(log);
    // In a real implementation, we would send this to a secure audit log server
    console.log('HIPAA Audit Log:', log);
  }

  private getActionFromMethod(method: string): AuditLog['action'] {
    switch (method.toLowerCase()) {
      case 'post':
        return 'create';
      case 'get':
        return 'read';
      case 'put':
      case 'patch':
        return 'update';
      case 'delete':
        return 'delete';
      default:
        return 'read';
    }
  }

  private extractResourceId(url: string): string {
    const matches = url.match(/\/([a-f0-9-]{36})\/?/i);
    return matches?.[1] || 'unknown';
  }

  private getCurrentUserId(): string {
    // In a real implementation, this would come from an auth service
    return 'current-user-id';
  }

  // Audit Log Access
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  clearAuditLogs(): void {
    this.auditLogs = [];
  }
}
