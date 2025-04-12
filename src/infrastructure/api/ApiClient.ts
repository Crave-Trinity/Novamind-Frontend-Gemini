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
      'Accept': 'application/json',
      ...headers
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
  async get<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.fetch(url, { 
      ...options, 
      method: 'GET' 
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.fetch(url, { 
      ...options, 
      method: 'POST',
      body
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.fetch(url, { 
      ...options, 
      method: 'PUT',
      body
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.fetch(url, { 
      ...options, 
      method: 'DELETE' 
    });
  }

  /**
   * Make a fetch request with the configured baseUrl and headers
   */
  async fetch<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      // Construct full URL
      const fullUrl = this.createUrl(url, options.params);
      
      // Add auth token if available
      const headers: Record<string, string> = {
        ...this.headers,
        ...(options.headers as Record<string, string> || {})
      };
      
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      
      // Create request options
      const requestOptions: RequestInit = {
        ...options,
        headers
      };
      
      // Make the request
      const response = await fetch(fullUrl, requestOptions);
      
      // Process through interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse, options);
      }
      
      // Handle JSON responses
      if (processedResponse.headers.get('Content-Type')?.includes('application/json')) {
        const data = await processedResponse.json();
        
        // Throw error for non-200 responses
        if (!processedResponse.ok) {
          const error: any = new Error(data.message || 'API request failed');
          error.response = processedResponse;
          error.data = data;
          error.status = processedResponse.status;
          throw error;
        }
        
        return data as T;
      }
      
      // Handle text responses
      if (processedResponse.headers.get('Content-Type')?.includes('text/')) {
        const text = await processedResponse.text();
        
        // Throw error for non-200 responses
        if (!processedResponse.ok) {
          const error: any = new Error(text || 'API request failed');
          error.response = processedResponse;
          error.text = text;
          error.status = processedResponse.status;
          throw error;
        }
        
        return text as unknown as T;
      }
      
      // Handle other response types
      if (!processedResponse.ok) {
        const error: any = new Error(`API request failed with status ${processedResponse.status}`);
        error.response = processedResponse;
        error.status = processedResponse.status;
        throw error;
      }
      
      return processedResponse as unknown as T;
    } catch (error: any) {
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
    const normalizedPath = this.baseUrl.endsWith('/') && path.startsWith('/')
      ? path.slice(1)
      : path;
    
    // Combine baseUrl and path
    let url = `${this.baseUrl}${normalizedPath}`;
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          // Handle arrays
          if (Array.isArray(value)) {
            return value
              .map(item => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
              .join('&');
          }
          
          // Handle objects
          if (typeof value === 'object') {
            return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
          }
          
          // Handle primitives
          return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
        })
        .join('&');
      
      // Add '?' if the URL doesn't already have one
      url += url.includes('?') ? '&' : '?';
      url += queryString;
    }
    
    return url;
  }
}

// Create and export a singleton instance of ApiClient
// This is what the tests and services expect to import
export const apiClient = new ApiClient('/api');
