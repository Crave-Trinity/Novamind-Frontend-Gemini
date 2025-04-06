/**
 * Authentication Utilities
 */

// Simple auth check utility (can be mocked in tests)
// In a real app, this would involve token validation, context, or a dedicated hook
export const checkAuthStatus = (): boolean => {
  // Basic check for demo token
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return !!localStorage.getItem('auth_token');
  }
  // Default to false in non-browser environments (like SSR or some test setups)
  return false;
};
