/* eslint-disable */
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react'; // Import waitFor
import { AuthService, AuthTokens, AuthUser, AuthApiClient } from './index'; // Import AuthApiClient for mocking

// Define localStorage store structure
let localStorageStore: Record<string, string> = {};

// Define mock functions separately to re-apply them after reset
const mockLocalStorageGetItem = vi.fn((key: string) => localStorageStore[key] || null);
const mockLocalStorageSetItem = vi.fn((key: string, value: string) => { localStorageStore[key] = value; });
const mockLocalStorageRemoveItem = vi.fn((key: string) => { delete localStorageStore[key]; });
const mockLocalStorageClear = vi.fn(() => { localStorageStore = {}; });

// Create the mock object structure
const localStorageMock = {
  getItem: mockLocalStorageGetItem,
  setItem: mockLocalStorageSetItem,
  removeItem: mockLocalStorageRemoveItem,
  clear: mockLocalStorageClear,
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockRefreshToken = vi.fn();
const mockGetCurrentUser = vi.fn();

// Spy on AuthApiClient prototype methods
vi.spyOn(AuthApiClient.prototype, 'login').mockImplementation(mockLogin);
vi.spyOn(AuthApiClient.prototype, 'logout').mockImplementation(mockLogout);
vi.spyOn(AuthApiClient.prototype, 'refreshToken').mockImplementation(mockRefreshToken);
vi.spyOn(AuthApiClient.prototype, 'getCurrentUser').mockImplementation(mockGetCurrentUser);


describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.resetAllMocks(); // Reset all mocks (including spies)

    // Reset localStorage store and re-apply mock implementations
    localStorageStore = {};
    localStorageMock.getItem.mockImplementation((key: string) => localStorageStore[key] || null);
    localStorageMock.setItem.mockImplementation((key: string, value: string) => { localStorageStore[key] = value; });
    localStorageMock.removeItem.mockImplementation((key: string) => { delete localStorageStore[key]; });
    localStorageMock.clear.mockImplementation(() => { localStorageStore = {}; });

    authService = new AuthService('https://api.test.com');
    // No need to replace the client manually, spies handle it
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    authService = new AuthService('https://api.test.com');
    
    // No need to replace the client manually, vi.mock handles it
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restores original prototype methods
  });

  describe('login', () => {
    it('should successfully login and store tokens', async () => {
      // Setup mocks
      mockLogin.mockResolvedValueOnce(mockTokens);
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      // Execute
      const result = await authService.login('test@example.com', 'password123');

      // Verify
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockGetCurrentUser).toHaveBeenCalled();
      // Wait for async operations within login to complete
      const options = { timeout: 2000 }; // Increased timeout
      await waitFor(() => expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(mockTokens)), options);
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
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      // Execute
      const result = await authService.login('invalid@example.com', 'wrongpassword');

      // Verify
      expect(mockLogin).toHaveBeenCalledWith('invalid@example.com', 'wrongpassword');
      expect(mockGetCurrentUser).not.toHaveBeenCalled();
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
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
      mockLogin.mockRejectedValueOnce(new Error('Network error'));

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
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockLogout.mockResolvedValueOnce(undefined);

      // Execute
      const result = await authService.logout();

      // Verify
      expect(mockLogout).toHaveBeenCalled();
      // removeItem is called synchronously within clearTokens after the await
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
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
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockLogout.mockRejectedValueOnce(new Error('API error'));

      // Execute
      const result = await authService.logout();

      // Verify
      expect(mockLogout).toHaveBeenCalled();
      // removeItem is called synchronously within clearTokens after the await
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
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
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

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
      localStorageMock.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockResolvedValueOnce(mockTokens);
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(mockTokens));
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
      localStorageMock.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockRejectedValueOnce(new Error('Token expired'));

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
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
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockGetCurrentUser.mockRejectedValueOnce(new Error('User not found'));

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      // await initializeAuth ensures internal calls complete
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
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
      localStorageMock.setItem('auth_tokens', 'invalid-json');

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