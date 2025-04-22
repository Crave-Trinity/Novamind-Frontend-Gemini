/* eslint-disable */
/**
 * ApiClient
 *
 * Base API client for handling HTTP requests.
 * This is a lightweight wrapper around fetch with some additional features:
 * - Automatic JSON parsing
 * - Base URL configuration
 * - Default headers
 * - Request/response interceptors
 * - HTTP verb convenience methods (get, post, put, delete)
 */

import { ApiResponse } from './types';
import { ApiProxyService } from './ApiProxyService';

// Request options type
export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

// Response interceptor type
export type ResponseInterceptor = (
  response: Response,
  requestOptions: RequestOptions
) => Promise<any>;

/**
 * ApiClient class for making HTTP requests
 */
export class ApiClient {
  public baseUrl: string;
  public headers: Record<string, string>;
  private responseInterceptors: ResponseInterceptor[];
  private authToken: string | null = null;

  /**
   * Create a new ApiClient
   */
  constructor(
    baseUrl: string,
    headers: Record<string, string> = {},
    responseInterceptors: ResponseInterceptor[] = []
  ) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };
    this.responseInterceptors = responseInterceptors;
  }

  /**
   * Set the authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Clear all response interceptors
   */
  clearResponseInterceptors(): void {
    this.responseInterceptors = [];
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    // Map frontend path to backend path
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    return this.fetch(mappedPath, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any /* eslint-disable-next-line @typescript-eslint/no-explicit-any */,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    // Map and transform request data
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    const mappedData = ApiProxyService.mapRequestData(rawPath, data);
    const body = mappedData ? JSON.stringify(mappedData) : undefined;
    return this.fetch(mappedPath, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any /* eslint-disable-next-line @typescript-eslint/no-explicit-any */,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    const mappedData = ApiProxyService.mapRequestData(rawPath, data);
    const body = mappedData ? JSON.stringify(mappedData) : undefined;
    return this.fetch(mappedPath, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    url: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    const rawPath = url.startsWith('/') ? url.slice(1) : url;
    const mappedPath = ApiProxyService.mapPath(rawPath);
    return this.fetch(mappedPath, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Make a fetch request with the configured baseUrl and headers
   */
  async fetch<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    try {
      // Construct full URL
      const fullUrl = this.createUrl(url, options.params);

      // Add auth token if available
      const headers: Record<string, string> = {
        ...this.headers,
        ...((options.headers as Record<string, string>) || {}),
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Create request options
      const requestOptions: RequestInit = {
        ...options,
        headers,
      };

      // Always use the globally available fetch (provided by jsdom/node/undici)
      // MSW will intercept this call in the test environment.
      const response = await fetch(fullUrl, requestOptions);

      // Process through interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse, options);
      }

      // Handle JSON responses
      if (processedResponse.headers.get('Content-Type')?.includes('application/json')) {
        const rawData = await processedResponse.json();

        // Map and standardize response
        const mapped = ApiProxyService.mapResponseData(url, rawData);
        const standardized = ApiProxyService.standardizeResponse(mapped);
        return standardized.data as T;
      }

      // Handle text responses
      if (processedResponse.headers.get('Content-Type')?.includes('text/')) {
        const rawText = await processedResponse.text();

        // Standardize text response
        const mappedText = ApiProxyService.mapResponseData(url, rawText);
        const standardizedText = ApiProxyService.standardizeResponse(mappedText);
        return standardizedText.data as unknown as T;
      }

      // Return other response types as is
      const standardized = ApiProxyService.standardizeResponse(processedResponse as any);
      return standardized.data as unknown as T;
    } catch (error: any /* eslint-disable-next-line @typescript-eslint/no-explicit-any */) {
      // Add isAxiosError property for compatibility with axios error handling
      if (error.response) {
        error.isAxiosError = true;
      }
      throw error;
    }
  }

  /**
   * Create a URL with query parameters
   */
  private createUrl(path: string, params?: Record<string, any>): string {
    // Ensure path doesn't start with a slash if baseUrl ends with one
    const normalizedPath =
      this.baseUrl.endsWith('/') && path.startsWith('/') ? path.slice(1) : path;

    // For testing environments, we need a valid URL format
    // In the browser, this would be the actual window.location.origin
    const mockOrigin = 'http://localhost';

    // Create a URL object for the base path
    let baseUrl = this.baseUrl;

    // If the baseUrl is not a full URL, prefix it with the mock origin
    if (!baseUrl.match(/^https?:\/\//)) {
      baseUrl = baseUrl.startsWith('/') ? `${mockOrigin}${baseUrl}` : `${mockOrigin}/${baseUrl}`;
    }

    // Combine baseUrl and path
    // Combine baseUrl and path correctly, ensuring no double slashes
    const combinedPath = `${baseUrl.replace(/\/$/, '')}/${normalizedPath.replace(/^\//, '')}`;
    const url = new URL(combinedPath, baseUrl.match(/^https?:\/\//) ? undefined : mockOrigin); // Use origin only if baseUrl is relative

    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .forEach(([key, value]) => {
          // Handle arrays
          if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, String(item)));
            return;
          }

          // Handle objects
          if (typeof value === 'object') {
            url.searchParams.append(key, JSON.stringify(value));
            return;
          }

          // Handle primitives
          url.searchParams.append(key, String(value));
        });
    }

    return url.toString();
  }
}

// Create and export a singleton instance of ApiClient
// This is what the tests and services expect to import
export const apiClient = new ApiClient('/api');
