/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react'; // Import waitFor
import { AuthService, AuthTokens, AuthUser, AuthApiClient } from './index'; // Import AuthApiClient for mocking

// Rely on the global mockLocalStorage defined in src/test/setup.ts
// No need for local definition or Object.defineProperty here.

// Sample data
const mockUser: AuthUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'clinician',
  permissions: ['read:patients', 'write:notes']
};

const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 3600000 // 1 hour from now
};

const expiredTokens: AuthTokens = {
  accessToken: 'expired-access-token',
  refreshToken: 'expired-refresh-token',
  expiresAt: Date.now() - 3600000 // 1 hour ago
};

// Mocks for the AuthApiClient methods
// Default implementations return rejected promises to prevent '.then of undefined' errors
const mockLogin = vi.fn().mockImplementation(async (...args) => { console.log('[MOCK login] Called with:', args); return Promise.reject(new Error('Mock not configured for this call')); });
const mockLogout = vi.fn().mockImplementation(async (...args) => { console.log('[MOCK logout] Called with:', args); return Promise.reject(new Error('Mock not configured for this call')); });
const mockRefreshToken = vi.fn().mockImplementation(async (...args) => { console.log('[MOCK refreshToken] Called with:', args); return Promise.reject(new Error('Mock not configured for this call')); });
const mockGetCurrentUser = vi.fn().mockImplementation(async (...args) => { console.log('[MOCK getCurrentUser] Called with:', args); return Promise.reject(new Error('Mock not configured for this call')); });

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // The global setup's afterEach handles vi.clearAllMocks().
    vi.useFakeTimers(); // Use fake timers for consistent Date.now()

    // Spy on AuthApiClient prototype methods *inside* beforeEach
    vi.spyOn(AuthApiClient.prototype, 'login').mockImplementation(mockLogin);
    vi.spyOn(AuthApiClient.prototype, 'logout').mockImplementation(mockLogout);
    vi.spyOn(AuthApiClient.prototype, 'refreshToken').mockImplementation(mockRefreshToken);
    vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockImplementation(mockGetCurrentUser);

    // The global setup handles resetting the mockLocalStorage state
    authService = new AuthService('https://api.test.com');
    // No need to replace the client manually, spies handle it
  });


  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
    vi.restoreAllMocks(); // Restores original prototype methods
  });

  describe('login', () => {
    it('should successfully login and store tokens', async () => {
      // Setup mocks
      mockLogin.mockResolvedValueOnce(mockTokens); // Configure specific mock response
      mockGetCurrentUser.mockResolvedValueOnce(mockUser); // Configure specific mock response

      // Execute
      const result = await authService.login('test@example.com', 'password123');

      // Verify
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockGetCurrentUser).toHaveBeenCalled();
      // Wait for async operations within login to complete
      const options = { timeout: 2000 }; // Increased timeout
      await waitFor(() => expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(mockTokens)), options); // Use global mock
      expect(result).toEqual({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    });

    it('should handle login failure', async () => {
      // Setup mock to simulate API error
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials')); // Configure specific mock response

      // Execute
      const result = await authService.login('invalid@example.com', 'wrongpassword');

      // Verify
      expect(mockLogin).toHaveBeenCalledWith('invalid@example.com', 'wrongpassword');
      expect(mockGetCurrentUser).not.toHaveBeenCalled();
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled(); // Use global mock
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials'
      });
    });

    it('should handle API timeouts and network errors', async () => {
      // Setup mock to simulate network error
      mockLogin.mockRejectedValueOnce(new Error('Network error')); // Configure specific mock response

      // Execute
      const result = await authService.login('test@example.com', 'password123');

      // Verify
      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toBe('Invalid credentials'); // Simplified error message for users
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      // Setup
      mockLocalStorage.setItem('auth_tokens', JSON.stringify(mockTokens)); // Use global mock
      mockLogout.mockResolvedValueOnce(undefined); // Configure specific mock response

      // Execute
      const result = await authService.logout();

      // Verify
      expect(mockLogout).toHaveBeenCalled();
      // removeItem is called synchronously within clearTokens after the await
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens'); // Use global mock
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    });

    it('should clear tokens even if API call fails', async () => {
      // Setup
      mockLocalStorage.setItem('auth_tokens', JSON.stringify(mockTokens)); // Use global mock
      mockLogout.mockRejectedValueOnce(new Error('API error')); // Configure specific mock response

      // Execute
      const result = await authService.logout();

      // Verify
      expect(mockLogout).toHaveBeenCalled();
      // removeItem is called synchronously within clearTokens after the await
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens'); // Use global mock
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    });
  });

  describe('initializeAuth', () => {
    it('should return unauthenticated state if no tokens are stored', async () => {
      vi.setSystemTime(new Date()); // Set time for consistency
      // Execute
      const result = await authService.initializeAuth();

      // Verify
      expect(mockGetCurrentUser).not.toHaveBeenCalled();
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    });

    it('should initialize auth with valid tokens', async () => {
      // Setup
      vi.setSystemTime(new Date(mockTokens.expiresAt - 10000)); // Set time well before expiry
      mockLocalStorage.setItem('auth_tokens', JSON.stringify(mockTokens)); // Use global mock
      mockGetCurrentUser.mockResolvedValueOnce(mockUser); // Configure specific mock response

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    });

    it('should refresh expired tokens and fetch user', async () => {
      // Setup
      vi.setSystemTime(new Date(expiredTokens.expiresAt + 10000)); // Set time well AFTER expiry
      mockLocalStorage.setItem('auth_tokens', JSON.stringify(expiredTokens)); // Use global mock
      mockRefreshToken.mockResolvedValueOnce(mockTokens); // Configure specific mock response
      mockGetCurrentUser.mockResolvedValueOnce(mockUser); // Configure specific mock response

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(mockTokens)); // Use global mock
      expect(result).toEqual({
        user: mockUser,
        tokens: mockTokens,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    });

    it('should clear tokens and return unauthenticated state if refresh fails', async () => {
      // Setup
      vi.setSystemTime(new Date(expiredTokens.expiresAt + 10000)); // Set time well AFTER expiry
      mockLocalStorage.setItem('auth_tokens', JSON.stringify(expiredTokens)); // Use global mock
      mockRefreshToken.mockRejectedValueOnce(new Error('Token expired')); // Configure specific mock response

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens'); // Use global mock
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired'
      });
    });

    it('should handle getCurrentUser failure and clear tokens', async () => {
      // Setup
      vi.setSystemTime(new Date(mockTokens.expiresAt - 10000)); // Set time well before expiry
      mockLocalStorage.setItem('auth_tokens', JSON.stringify(mockTokens)); // Use global mock
      mockGetCurrentUser.mockRejectedValueOnce(new Error('User not found')); // Configure specific mock response

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_tokens'); // Use global mock
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to get user info'
      });
    });

    it('should handle malformed token JSON in localStorage', async () => {
      // Setup with invalid JSON
      vi.setSystemTime(new Date()); // Set time for consistency
      mockLocalStorage.setItem('auth_tokens', 'invalid-json'); // Use global mock

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      expect(result).toEqual({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    });
  });
});