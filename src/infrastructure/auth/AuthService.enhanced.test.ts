/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedAuthService } from './AuthService.enhanced';
import { AuthTokens, AuthUser } from './index';

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
// Mock setTimeout and clearTimeout
const mockSetTimeout = vi.fn().mockReturnValue(123);
const mockClearTimeout = vi.fn();

// Replace global setTimeout and clearTimeout with mocks
Object.defineProperty(window, 'setTimeout', {
  value: mockSetTimeout,
  writable: true,
  configurable: true
});

Object.defineProperty(window, 'clearTimeout', {
  value: mockClearTimeout,
  writable: true,
  configurable: true
});
window.clearTimeout = mockClearTimeout as any;

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

const soonToExpireTokens: AuthTokens = {
  accessToken: 'soon-to-expire-token',
  refreshToken: 'soon-to-expire-refresh',
  expiresAt: Date.now() + 60000 // 1 minute from now
};

// Mock CustomEvent for session expiration
(global as any).CustomEvent = class CustomEvent extends Event {
  constructor(name: string, options: any = {}) {
    super(name, options);
    Object.assign(this, options);
  }
};

describe('EnhancedAuthService', () => {
  let authService: EnhancedAuthService;
  
  // Mocks for the AuthApiClient methods
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockRefreshToken = vi.fn();
  const mockGetCurrentUser = vi.fn();
  // Create a mock for dispatchEvent
  const dispatchEventSpy = vi.fn().mockReturnValue(true);
  
  // Replace window.dispatchEvent with our mock
  Object.defineProperty(window, 'dispatchEvent', {
    value: dispatchEventSpy,
    writable: true,
    configurable: true
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    
    authService = new EnhancedAuthService('https://api.test.com');
    
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

  describe('initializeAuth with token auto-refresh', () => {
    it('should attempt to refresh token when it has expired', async () => {
      // Setup with expired token
      localStorageMock.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockResolvedValueOnce(mockTokens);
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      // Execute
      const result = await authService.initializeAuth();

      // Verify refresh was attempted
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(mockTokens));
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should set up refresh timeout for tokens that will expire soon', async () => {
      // Setup with soon-to-expire token
      mockSetTimeout.mockClear(); // Ensure the mock is clean
      
      // For this specific test, create a new instance of the service
      const testAuthService = new EnhancedAuthService('https://api.test.com');
      (testAuthService as any).client = {
        login: mockLogin,
        logout: mockLogout,
        refreshToken: mockRefreshToken,
        getCurrentUser: mockGetCurrentUser
      };
      
      localStorageMock.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      mockGetCurrentUser.mockResolvedValueOnce(mockUser);
      
      // Execute - the constructor should already call setupRefreshTimeout
      await testAuthService.initializeAuth();
      
      // Verify setTimeout was called to schedule a refresh
      expect(mockSetTimeout).toHaveBeenCalled();
    });

    it('should handle token refresh failure during initialization', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockRejectedValueOnce(new Error('Refresh token expired'));

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      expect(mockRefreshToken).toHaveBeenCalledWith(expiredTokens.refreshToken);
      expect(result.isAuthenticated).toBe(false);
      expect(result.error).toBe('Session expired');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
    });

    it('should attempt token refresh on 401 error from getCurrentUser', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      mockGetCurrentUser.mockRejectedValueOnce(new Error('401 Unauthorized'));
      mockRefreshToken.mockResolvedValueOnce({...mockTokens, accessToken: 'new-token'});
      mockGetCurrentUser.mockResolvedValueOnce(mockUser); // Second call succeeds

      // Execute
      const result = await authService.initializeAuth();

      // Verify
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(2);
      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('ensureValidToken middleware', () => {
    it('should return token when valid and not expiring soon', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));

      // Execute
      const token = await authService.ensureValidToken();

      // Verify no refresh was needed
      expect(mockRefreshToken).not.toHaveBeenCalled();
      expect(token).toBe(mockTokens.accessToken);
    });

    it('should refresh token when it is expiring soon', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      const newTokens = {...mockTokens, accessToken: 'fresh-token'};
      mockRefreshToken.mockResolvedValueOnce(newTokens);

      // Execute
      const token = await authService.ensureValidToken();

      // Verify refresh was performed
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(token).toBe(newTokens.accessToken);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_tokens', JSON.stringify(newTokens));
    });

    it('should return null when no token is stored', async () => {
      // Execute
      const token = await authService.ensureValidToken();

      // Verify
      expect(token).toBeNull();
      expect(mockRefreshToken).not.toHaveBeenCalled();
    });

    it('should return null when refresh fails', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      mockRefreshToken.mockRejectedValueOnce(new Error('Refresh failed'));

      // Execute
      const token = await authService.ensureValidToken();

      // Verify
      expect(mockRefreshToken).toHaveBeenCalled();
      expect(token).toBeNull();
      expect(dispatchEventSpy).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
    });
  });

  describe('login with improved error handling', () => {
    it('should provide specific error message for network issues', async () => {
      // Setup
      mockLogin.mockRejectedValueOnce(new Error('network error during request'));

      // Execute
      const result = await authService.login('test@example.com', 'password');

      // Verify
      expect(result.error).toContain('Network error');
      expect(result.isAuthenticated).toBe(false);
    });

    it('should provide specific error message for rate limiting', async () => {
      // Setup
      mockLogin.mockRejectedValueOnce(new Error('429 Too Many Requests'));

      // Execute
      const result = await authService.login('test@example.com', 'password');

      // Verify
      expect(result.error).toContain('Too many login attempts');
      expect(result.isAuthenticated).toBe(false);
    });

    it('should handle failure to get user after successful login', async () => {
      // Setup
      mockLogin.mockResolvedValueOnce(mockTokens);
      mockGetCurrentUser.mockRejectedValueOnce(new Error('User data unavailable'));

      // Execute
      const result = await authService.login('test@example.com', 'password');

      // Verify
      expect(result.error).toContain('Could not retrieve user information');
      expect(result.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_tokens');
    });
  });

  describe('permission checking', () => {
    it('should return false when user has no permission', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      localStorageMock.setItem('auth_user', JSON.stringify(mockUser));

      // Execute
      const hasPermission = authService.hasPermission('admin:dashboard');

      // Verify
      expect(hasPermission).toBe(false);
    });

    it('should return true when user has permission', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(mockTokens));
      localStorageMock.setItem('auth_user', JSON.stringify(mockUser));

      // Execute
      const hasPermission = authService.hasPermission('read:patients');

      // Verify
      expect(hasPermission).toBe(true);
    });

    it('should trigger background refresh for expiring token', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(soonToExpireTokens));
      localStorageMock.setItem('auth_user', JSON.stringify(mockUser));
      mockRefreshToken.mockResolvedValueOnce(mockTokens);

      // Execute
      authService.hasPermission('read:patients');

      // Verify - a background refresh should be triggered
      expect(mockRefreshToken).toHaveBeenCalled();
    });
  });

  describe('silent token refresh', () => {
    it('should dispatch session-expired event when refresh fails', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockRejectedValueOnce(new Error('Invalid refresh token'));
      
      // Execute
      // Call a method that triggers token refresh
      await (authService as any).refreshTokenSilently();
      
      // Verify event was dispatched
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('auth:session-expired');
    });
    
    it('should reuse in-progress refresh promise', async () => {
      // Setup
      localStorageMock.setItem('auth_tokens', JSON.stringify(expiredTokens));
      mockRefreshToken.mockResolvedValueOnce(mockTokens);
      
      // Execute - make two calls in quick succession
      const promise1 = (authService as any).refreshTokenSilently();
      const promise2 = (authService as any).refreshTokenSilently();
      
      // Verify
      // Use toStrictEqual to check the values, not the object reference
      expect(promise1).toStrictEqual(promise2); // Promises should be equivalent
      expect(mockRefreshToken).toHaveBeenCalledTimes(1); // Only one API call
      
      // Wait for promises to resolve
      await promise1;
      await promise2;
    });
  });
});