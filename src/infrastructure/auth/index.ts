/* eslint-disable */
/**
 * Authentication services
 */

import { ApiClient } from '../api';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'clinician' | 'researcher';
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth API client
 */
export class AuthApiClient extends ApiClient {
  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    super(baseUrl, headers);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    return this.fetch<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    return this.fetch<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.fetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(): Promise<AuthUser> {
    return this.fetch<AuthUser>('/auth/me');
  }
}

/**
 * Auth service for user authentication
 */
export class AuthService {
  private client: AuthApiClient;
  private tokenStorageKey = 'auth_tokens';

  constructor(baseUrl: string) {
    this.client = new AuthApiClient(baseUrl);
  }

  /**
   * Get stored auth tokens
   */
  private getStoredTokens(): AuthTokens | null {
    const tokensJson = localStorage.getItem(this.tokenStorageKey);
    if (!tokensJson) return null;

    try {
      return JSON.parse(tokensJson) as AuthTokens;
    } catch {
      return null;
    }
  }

  /**
   * Store auth tokens
   */
  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokens));
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  /**
   * Check if the current token is expired
   */
  private isTokenExpired(tokens: AuthTokens): boolean {
    const isExpired = tokens.expiresAt < Date.now();
    console.log(
      `[AuthService isTokenExpired] expiresAt: ${tokens.expiresAt}, now: ${Date.now()}, isExpired: ${isExpired}`
    );
    return isExpired;
  }

  /**
   * Initialize auth state from storage
   */
  async initializeAuth(): Promise<AuthState> {
    const tokens = this.getStoredTokens();

    if (!tokens) {
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }

    if (this.isTokenExpired(tokens)) {
      try {
        const newTokens = await this.client?.refreshToken(tokens.refreshToken);
        this.storeTokens(newTokens);
        const user = await this.client?.getCurrentUser();

        return {
          user,
          tokens: newTokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        this.clearTokens();
        return {
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Session expired',
        };
      }
    }

    try {
      const user = await this.client?.getCurrentUser();
      return {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      this.clearTokens();
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to get user info',
      };
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthState> {
    try {
      const tokens = await this.client?.login(email, password);
      this.storeTokens(tokens);
      const user = await this.client?.getCurrentUser();

      return {
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials',
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<AuthState> {
    try {
      await this.client?.logout();
    } catch (error) {
      // Silently catch the error but proceed with logout
      console.error('Logout API call failed, but proceeding with local logout:', error);
    } finally {
      this.clearTokens();
      // Dispatch event for logout completion
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:logout-complete'));
      }
    }

    return {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }
}
