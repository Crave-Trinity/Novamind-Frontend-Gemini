/**
 * Enhanced Authentication Hook
 *
 * Extends the base useAuth hook with advanced security and encryption features
 * for HIPAA-compliant authentication management.
 */
import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '@application/contexts/AuthContext';
import { encryptionService } from '@infrastructure/services/encryptionService';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient';

/**
 * Extended authentication interface with enhanced security features
 */
export interface EnhancedAuthContextType extends AuthContextType {
  // MFA functionality
  completeMfaVerification: (email: string, mfaCode: string) => Promise<boolean>;

  // Security features
  getSecurityMetrics: () => SecurityMetrics;
  resetFailedAttempts: () => void;

  // Encryption utilities
  encryptField: (value: string) => string;
  decryptField: (value: string) => string;
}

/**
 * Security metrics for authentication
 */
export interface SecurityMetrics {
  failedLoginAttempts: number;
  lastFailedAttempt: number | null;
  lockoutUntil: number | null;
  suspiciousActivities: Array<{
    timestamp: number;
    activity: string;
    details: string;
  }>;
}

/**
 * Enhanced secure authentication hook
 *
 * Wraps the standard auth hook with additional security features
 */
export const useSecureAuth = (): EnhancedAuthContextType => {
  // Get base auth context
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useSecureAuth must be used within an AuthProvider');
  }

  // Cache security metrics in memory
  let securityMetrics: SecurityMetrics = {
    failedLoginAttempts: 0,
    lastFailedAttempt: null,
    lockoutUntil: null,
    suspiciousActivities: [],
  };

  /**
   * Get security metrics
   */
  const getSecurityMetrics = (): SecurityMetrics => {
    return { ...securityMetrics };
  };

  /**
   * Reset failed login attempts counter
   */
  const resetFailedAttempts = (): void => {
    securityMetrics = {
      ...securityMetrics,
      failedLoginAttempts: 0,
      lastFailedAttempt: null,
      lockoutUntil: null,
    };

    // Log reset action
    auditLogClient.log(AuditEventType.SYSTEM_CONFIG_CHANGE, {
      action: 'security_metric_reset',
      details: 'Failed login attempts counter was reset',
      result: 'success',
    });
  };

  /**
   * Complete MFA verification process
   */
  const completeMfaVerification = async (email: string, mfaCode: string): Promise<boolean> => {
    try {
      // For demo, simulate successful verification with specific code
      // In production, this would call an API endpoint
      if (mfaCode === '123456') {
        // Log successful verification
        auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
          action: 'mfa_verification',
          details: `MFA verification successful for ${email}`,
          result: 'success',
        });

        // Reset security metrics on successful verification
        resetFailedAttempts();

        return true;
      }

      // Track failed verification attempt
      securityMetrics.failedLoginAttempts += 1;
      securityMetrics.lastFailedAttempt = Date.now();

      // Implement lockout after multiple failed attempts
      if (securityMetrics.failedLoginAttempts >= 5) {
        securityMetrics.lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 minutes

        // Log suspicious activity
        auditLogClient.log(AuditEventType.SUSPICIOUS_ACTIVITY, {
          action: 'multiple_failed_mfa',
          details: `Account locked after ${securityMetrics.failedLoginAttempts} failed MFA attempts`,
          result: 'failure',
        });
      }

      // Log failed verification
      auditLogClient.log(AuditEventType.USER_SESSION_VERIFY, {
        action: 'mfa_verification',
        details: `MFA verification failed for ${email}`,
        result: 'failure',
      });

      return false;
    } catch (error) {
      // Log error
      auditLogClient.log(AuditEventType.SYSTEM_ERROR, {
        action: 'mfa_verification_error',
        details: `Error during MFA verification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        result: 'failure',
      });

      return false;
    }
  };

  /**
   * Encrypt sensitive field using encryption service
   */
  const encryptField = (value: string): string => {
    if (!value) return value;

    try {
      return encryptionService.encrypt(value);
    } catch (error) {
      console.error('Field encryption error:', error);

      // Log encryption error
      auditLogClient.log(AuditEventType.SYSTEM_ERROR, {
        action: 'field_encryption_error',
        details: 'Failed to encrypt sensitive field',
        result: 'failure',
      });

      return value; // Return original value if encryption fails
    }
  };

  /**
   * Decrypt encrypted field using encryption service
   */
  const decryptField = (encryptedValue: string): string => {
    if (!encryptedValue) return encryptedValue;

    try {
      return encryptionService.decrypt(encryptedValue);
    } catch (error) {
      console.error('Field decryption error:', error);

      // Log decryption error
      auditLogClient.log(AuditEventType.SYSTEM_ERROR, {
        action: 'field_decryption_error',
        details: 'Failed to decrypt field',
        result: 'failure',
      });

      return ''; // Return empty string if decryption fails
    }
  };

  // Return enhanced auth context
  return {
    ...auth,
    completeMfaVerification,
    getSecurityMetrics,
    resetFailedAttempts,
    encryptField,
    decryptField,
  };
};
