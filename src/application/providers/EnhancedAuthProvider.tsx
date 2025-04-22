/**
 * Enhanced Authentication Provider
 *
 * Provides robust authentication state and methods to the application with
 * enhanced HIPAA compliance, 2FA, and client-side encryption.
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '@application/contexts/AuthContext';
import { authClient } from '@infrastructure/clients/authClient';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient';
import { encryptionService } from '@infrastructure/services/encryptionService';
import { SessionTimeoutModal } from './SessionTimeoutModal';
import type { User, Permission } from '@domain/types/auth/auth';

// Constants for session management
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before expiration
const SESSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds
const ENCRYPTION_ENABLED = true; // Toggle for client-side encryption

// Security tracking for suspicious activities
interface SecurityMetrics {
  failedLoginAttempts: number;
  lastFailedAttempt: number | null;
  lockoutUntil: number | null;
  suspiciousActivities: Array<{
    timestamp: number;
    activity: string;
    details: string;
  }>;
}

interface EnhancedAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Enhanced Authentication Provider
 */
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  // Authentication state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [requiresMFA, setRequiresMFA] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Session management
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number>(0);
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);

  // Security metrics
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    lastFailedAttempt: null,
    lockoutUntil: null,
    suspiciousActivities: [],
  });

  /**
   * Track suspicious activity
   */
  const trackSuspiciousActivity = useCallback((activity: string, details: string) => {
    setSecurityMetrics((prev) => ({
      ...prev,
      suspiciousActivities: [
        ...prev.suspiciousActivities,
        { timestamp: Date.now(), activity, details },
      ],
    }));

    // Log to audit system
    auditLogClient.log(AuditEventType.SUSPICIOUS_ACTIVITY, {
      action: 'suspicious_activity_detected',
      details: `${activity}: ${details}`,
      result: 'warning',
    });
  }, []);

  /**
   * Initialize authentication state from storage with encryption
   */
  const initializeAuth = useCallback(async () => {
    try {
      if (authClient.isAuthenticated()) {
        let currentUser = authClient.getCurrentUser();

        // Decrypt sensitive user data if encryption is enabled
        if (ENCRYPTION_ENABLED && currentUser) {
          currentUser = {
            ...currentUser,
            // Decrypt any encrypted fields
            profile: currentUser.profile
              ? encryptionService.decryptObject(currentUser.profile)
              : currentUser.profile,
          };
        }

        const sessionVerification = authClient.verifySession();

        if (currentUser && sessionVerification.valid && sessionVerification.remainingTime) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setSessionExpiresAt(Date.now() + sessionVerification.remainingTime);

          // Log session restoration
          auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
            action: 'session_restore',
            details: 'User session restored with enhanced security',
            result: 'success',
          });
        }
      }
    } catch (err) {
      console.error('Failed to initialize auth state:', err);
      setError('Authentication session could not be restored.');

      // Track as suspicious if error is unexpected
      if (err instanceof Error && !err.message.includes('expired')) {
        trackSuspiciousActivity(
          'session_restore_failed',
          `Unexpected error during session restoration: ${err.message}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [trackSuspiciousActivity]);

  /**
   * Login handler with enhanced security
   */
  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      // Check for account lockout
      if (securityMetrics.lockoutUntil && securityMetrics.lockoutUntil > Date.now()) {
        const remainingLockoutTime = Math.ceil(
          (securityMetrics.lockoutUntil - Date.now()) / 1000 / 60
        );
        setError(
          `Account temporarily locked. Please try again in ${remainingLockoutTime} minutes.`
        );
        setIsLoading(false);
        return false;
      }

      try {
        // Attempt login through auth client
        const result = await authClient.login({
          email,
          password,
          rememberMe,
        });

        // Handle successful initial authentication
        if (result.success && result.user && result.token) {
          // Check if 2FA is required
          if (result.requiresMFA) {
            setRequiresMFA(true);
            setIsLoading(false);

            // Navigate to MFA verification page
            navigate('/mfa-verify', { state: { email } });
            return false;
          }

          // Encrypt sensitive data if enabled
          let processedUser = result.user;
          if (ENCRYPTION_ENABLED && processedUser.profile) {
            processedUser = {
              ...processedUser,
              profile: encryptionService.encryptObject(processedUser.profile),
            };
          }

          setUser(processedUser);
          setIsAuthenticated(true);
          setSessionExpiresAt(result.token.expiresAt);

          // Reset security metrics on successful login
          setSecurityMetrics({
            failedLoginAttempts: 0,
            lastFailedAttempt: null,
            lockoutUntil: null,
            suspiciousActivities: securityMetrics.suspiciousActivities,
          });

          setIsLoading(false);
          return true;
        } else {
          // Handle failed login
          setError(result.error || 'Authentication failed.');

          // Track failed login attempts
          const now = Date.now();
          const newAttempts = securityMetrics.failedLoginAttempts + 1;

          // Implement progressive lockout after multiple failed attempts
          let lockoutUntil = null;
          if (newAttempts >= 5) {
            // Lock for 15 minutes after 5 failed attempts
            lockoutUntil = now + 15 * 60 * 1000;

            // Log suspicious activity
            trackSuspiciousActivity(
              'multiple_failed_logins',
              `Account locked after ${newAttempts} failed login attempts`
            );
          }

          setSecurityMetrics({
            ...securityMetrics,
            failedLoginAttempts: newAttempts,
            lastFailedAttempt: now,
            lockoutUntil,
          });

          setIsLoading(false);
          return false;
        }
      } catch (err) {
        // Log unexpected errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Authentication error: ${errorMessage}`);
        trackSuspiciousActivity('login_error', errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [navigate, securityMetrics, trackSuspiciousActivity]
  );

  /**
   * Complete MFA verification
   */
  const completeMfaVerification = useCallback(
    async (email: string, mfaCode: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Verify MFA code with auth client
        const result = await authClient.verifyMFA(email, mfaCode);

        if (result.success && result.user && result.token) {
          // Apply encryption if enabled
          let processedUser = result.user;
          if (ENCRYPTION_ENABLED && processedUser.profile) {
            processedUser = {
              ...processedUser,
              profile: encryptionService.encryptObject(processedUser.profile),
            };
          }

          setUser(processedUser);
          setIsAuthenticated(true);
          setRequiresMFA(false);
          setSessionExpiresAt(result.token.expiresAt);

          // Log successful MFA verification
          auditLogClient.log(AuditEventType.USER_MFA_VERIFY, {
            action: 'mfa_verification',
            details: 'Two-factor authentication completed successfully',
            result: 'success',
          });

          setIsLoading(false);
          return true;
        } else {
          setError(result.error || 'MFA verification failed.');

          // Track failed MFA attempt
          trackSuspiciousActivity(
            'mfa_verification_failed',
            `Failed MFA verification attempt for ${email}`
          );

          setIsLoading(false);
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`MFA verification error: ${errorMessage}`);
        trackSuspiciousActivity('mfa_error', errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [trackSuspiciousActivity]
  );

  /**
   * Logout handler with enhanced auditing
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Use auth client to logout
      await authClient.logout();

      // Reset auth state
      setUser(null);
      setIsAuthenticated(false);
      setRequiresMFA(false);
      setSessionExpiresAt(0);
      setError(null);

      // Log the logout event
      auditLogClient.log(AuditEventType.USER_LOGOUT, {
        action: 'user_logout',
        details: 'User logged out successfully',
        result: 'success',
      });

      // Navigate to login page
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      trackSuspiciousActivity(
        'logout_error',
        `Error during logout: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate, trackSuspiciousActivity]);

  /**
   * Check session expiration time
   */
  const checkSessionExpiration = useCallback((): number => {
    if (!isAuthenticated || sessionExpiresAt === 0) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, sessionExpiresAt - now);
  }, [isAuthenticated, sessionExpiresAt]);

  /**
   * Renew current session
   */
  const renewSession = useCallback((): void => {
    if (!isAuthenticated) return;

    try {
      // Use auth client to renew session
      const verification = authClient.renewSession();

      if (verification.valid && verification.remainingTime) {
        setSessionExpiresAt(Date.now() + verification.remainingTime);
        setShowSessionWarning(false);

        // Log session renewal
        auditLogClient.log(AuditEventType.USER_SESSION_RENEWED, {
          action: 'session_renewed',
          details: 'User session renewed',
          result: 'success',
        });
      }
    } catch (err) {
      console.error('Session renewal error:', err);
      trackSuspiciousActivity(
        'session_renewal_error',
        `Error renewing session: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }, [isAuthenticated, trackSuspiciousActivity]);

  /**
   * Check permission with enhanced role-based access
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;

      // Check if user has the specific permission
      if (user.permissions.includes(permission)) {
        // Log access attempt for sensitive operations
        if (
          permission.includes('MODIFY') ||
          permission.includes('DELETE') ||
          permission.includes('PHI')
        ) {
          auditLogClient.log(AuditEventType.PERMISSION_CHECK, {
            action: 'permission_check',
            details: `Permission check for ${permission}`,
            result: 'granted',
          });
        }
        return true;
      }

      // Log denied permissions for audit
      auditLogClient.log(AuditEventType.PERMISSION_CHECK, {
        action: 'permission_check',
        details: `Permission check for ${permission}`,
        result: 'denied',
      });

      return false;
    },
    [user]
  );

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Session monitoring
   * Checks session status periodically and sets warning when close to expiration
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const remainingTime = checkSessionExpiration();

      if (remainingTime <= 0) {
        // Session expired, log out
        auditLogClient.log(AuditEventType.USER_TIMEOUT, {
          action: 'session_expired',
          details: 'User session expired',
          result: 'session_terminated',
        });
        logout();
      } else if (remainingTime <= SESSION_WARNING_TIME) {
        // Show warning when less than warning threshold remaining
        setShowSessionWarning(true);
      }
    };

    // Initial check
    checkSession();

    // Set up periodic checks
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, checkSessionExpiration, logout]);

  /**
   * Context value
   */
  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      isLoading,
      error,
      user,
      login,
      logout,
      checkSessionExpiration,
      renewSession,
      hasPermission,
    }),
    [
      isAuthenticated,
      isLoading,
      error,
      user,
      login,
      logout,
      checkSessionExpiration,
      renewSession,
      hasPermission,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showSessionWarning && (
        <SessionTimeoutModal warningThreshold={SESSION_WARNING_TIME} onLogout={logout} />
      )}
    </AuthContext.Provider>
  );
};
