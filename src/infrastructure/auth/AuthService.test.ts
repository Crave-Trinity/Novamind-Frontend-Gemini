/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService, AuthTokens, AuthUser } from './index';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

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

describe('AuthService', () => {
  let authService: AuthService;
  
  // Mocks for the AuthApiClient methods
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockRefreshToken = vi.fn();
  const mockGetCurrentUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    authService = new AuthService('https://api.test.com');
    
    // Mock the AuthApiClient methods
    (authService as any).client = {
      login: mockLogin,
      logout: mockLogout,
      refreshToken: mockRefreshToken,
      getCurrentUser: mockGetCurrentUser
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(mockTokens));
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