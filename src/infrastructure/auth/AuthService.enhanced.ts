/* eslint-disable */
/**
 * Enhanced AuthService with robust token refresh handling and improved error management
 * for production-ready deployment
 */

import { AuthApiClient, AuthTokens, AuthUser, AuthState } from './index';

export class EnhancedAuthService {
  private client: AuthApiClient;
  private tokenStorageKey = 'auth_tokens';
  private refreshPromise: Promise<AuthTokens | null> | null = null;
  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(baseUrl: string) {
    this.client = new AuthApiClient(baseUrl);
    // Initialize refresh timeout on instantiation
    this.setupRefreshTimeout();
  }

  /**
   * Get stored auth tokens
   */
  private getStoredTokens(): AuthTokens | null {
    try {
      const tokensJson = localStorage.getItem(this.tokenStorageKey);
      if (!tokensJson) return null;
      return JSON.parse(tokensJson) as AuthTokens;
    } catch (error) {
      // Handle parse errors by clearing invalid token data
      console.error('Invalid token format in storage:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Store auth tokens and schedule refresh
   */
  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokens));
    // Set up refresh timeout
    this.setupRefreshTimeout();
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenStorageKey);
    // Clear any pending refresh operations
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    this.refreshPromise = null;
  }

  /**
   * Check if the current token is expired or will expire soon
   */
  private isTokenExpiredOrExpiring(tokens: AuthTokens, expiryBuffer = 300000): boolean {
    // Token is considered expired if it will expire within expiryBuffer ms (default 5 minutes)
    return tokens.expiresAt < (Date.now() + expiryBuffer);
  }

  /**
   * Schedule token refresh before expiration
   */
  protected setupRefreshTimeout(): void {
    // Clear any existing timeout
    if (this.refreshTimeoutId !== null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    const tokens = this.getStoredTokens();
    if (!tokens) return;

    // Calculate time until refresh (5 minutes before expiration)
    const refreshBuffer = 300000; // 5 minutes in ms
    const timeUntilRefresh = Math.max(0, tokens.expiresAt - Date.now() - refreshBuffer);

    // Schedule refresh
    if (timeUntilRefresh > 0) {
      // Ensure the setTimeout call is properly caught by the test
      console.log(`Token refresh scheduled in ${timeUntilRefresh / 1000} seconds`);
      // Use direct setTimeout call to ensure it's properly mocked in tests
      this.refreshTimeoutId = setTimeout(() => {
        this.refreshTokenSilently();
      }, timeUntilRefresh);
    } else {
      // Token is already expired or expiring, refresh immediately
      this.refreshTokenSilently();
    }
  }

  /**
   * Silently refresh token in the background
   */
  protected async refreshTokenSilently(): Promise<AuthTokens | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    // If a refresh is already in progress, return that promise
    if (this.refreshPromise) {
      console.log('[refreshTokenSilently] Refresh already in progress, returning existing promise.');
      return this.refreshPromise;
    }

    console.log('[refreshTokenSilently] Starting new token refresh...');
    // Create and store the promise reference first before execution
    this.refreshPromise = this.client?.refreshToken(tokens.refreshToken)
      .then(newTokens => {
        this.storeTokens(newTokens);
        console.log('[refreshTokenSilently] Token refreshed successfully.');
        this.refreshPromise = null; // Clear promise on success
        return newTokens;
      })
      .catch(error => {
        console.error('[refreshTokenSilently] Failed to refresh token:', error);
        this.clearTokens();
        try {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
          console.log('[refreshTokenSilently] Dispatched session-expired event on failure.');
        } catch (dispatchError) {
          console.error('[refreshTokenSilently] Error dispatching session-expired event:', dispatchError);
        }
        this.refreshPromise = null; // Clear promise on failure
        return null;
      });
      // Removed finally block as promise state is cleared in then/catch

    return this.refreshPromise;
  }

  /**
   * Ensure the token is valid before making API calls
   * This can be used as middleware for API requests
   */
  async ensureValidToken(): Promise<string | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    // If token is expiring soon, refresh it
    if (this.isTokenExpiredOrExpiring(tokens)) {
      try {
        const newTokens = await this.refreshTokenSilently();
        return newTokens?.accessToken || null;
      } catch (error) {
        console.error('Token refresh failed in ensureValidToken:', error);
        this.clearTokens();
        // Explicitly dispatch event here to ensure it happens
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return null;
      }
    }

    return tokens.accessToken;
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

    if (this.isTokenExpiredOrExpiring(tokens, 0)) { // Strict expiry check for initialization
      try {
        const newTokens = await this.refreshTokenSilently();
        if (!newTokens) {
          return {
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired',
          };
        }

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
      // Check if error is due to token issues
      if (error instanceof Error && 
          (error.message.includes('401') || 
           error.message.includes('unauthorized') || 
           error.message.includes('Unauthorized'))) {
        // Try token refresh once
        try {
          const newTokens = await this.refreshTokenSilently();
          if (newTokens) {
            const user = await this.client?.getCurrentUser();
            return {
              user,
              tokens: newTokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };
          }
        } catch (refreshError) {
          console.error('Refresh attempt failed:', refreshError);
        }
      }
      
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
      
      try {
        const user = await this.client?.getCurrentUser();
        return {
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      } catch (userError) {
        // If we can't get the user after login, still clear tokens
        this.clearTokens();
        return {
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Could not retrieve user information',
        };
      }
    } catch (error) {
      // Provide more specific error messages based on error type
      let errorMessage = 'Invalid credentials';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('rate') || error.message.includes('429')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        }
      }
      
      return {
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<AuthState> {
    const tokens = this.getStoredTokens();
    let error = null;
    
    try {
      if (tokens) {
        await this.client?.logout();
      }
    } catch (logoutError) {
      console.error('Logout API call failed, but proceeding with local logout:', logoutError);
      // Set error message to be returned in the state
      error = 'Logout API call failed, but session was ended locally';
    }
    
    // Clear tokens must happen outside the try-catch block
    this.clearTokens();
    
    // Dispatch event in a separate try block to ensure it always attempts to execute
    try {
      // Use a more reliable event dispatch approach
      const logoutEvent = new CustomEvent('auth:logout-complete');
      window.dispatchEvent(logoutEvent);
    } catch (dispatchError) {
      console.error('Error dispatching logout event:', dispatchError);
    }

    return {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error,
    };
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const tokens = this.getStoredTokens();
    if (!tokens) return false;
    
    // First check if token is expired
    if (this.isTokenExpiredOrExpiring(tokens, 0)) {
      return false;
    }
    
    // Then trigger background refresh if needed
    if (this.isTokenExpiredOrExpiring(tokens)) {
      this.refreshTokenSilently().catch(err => console.error('Background token refresh failed:', err));
    }
    
    try {
      // Get user from storage or state management
      const userJson = localStorage.getItem('auth_user');
      if (!userJson) {
          return false;
      }
      
      const user = JSON.parse(userJson) as AuthUser;
      // Check if user object and permissions array exist before accessing includes
      return user && Array.isArray(user.permissions) && user.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
}