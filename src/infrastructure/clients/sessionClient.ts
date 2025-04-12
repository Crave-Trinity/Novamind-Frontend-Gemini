/* eslint-disable */
/**
 * Session Management Service for HIPAA Compliance
 *
 * This service handles session timeout management,
 * implementing HIPAA requirements for automatic logouts
 * and warning users prior to session termination.
 */

import { auditLogClient, AuditEventType } from './auditLogClient';

interface SessionConfig {
  /**
   * Total session timeout in milliseconds
   */
  timeout: number;

  /**
   * Time in milliseconds before timeout to display warning
   */
  warningTime: number;

  /**
   * Callback to execute when session times out
   */
  onTimeout: () => void;

  /**
   * Callback to execute when warning threshold is reached
   */
  onWarning: () => void;
}

/**
 * Default session configuration (15 minutes with 1 minute warning)
 */
const DEFAULT_CONFIG: SessionConfig = {
  timeout: 15 * 60 * 1000, // 15 minutes
  warningTime: 60 * 1000, // 1 minute warning
  onTimeout: () => {
    window.location.href = '/login?reason=timeout';
  },
  onWarning: () => {
    console.debug('Session timeout warning triggered');
  },
};

/**
 * Session state
 */
let sessionConfig: SessionConfig = { ...DEFAULT_CONFIG };
let activityTimeout: number | undefined;
let warningTimeout: number | undefined;
let isWarningActive = false;
let lastActivityTime = Date.now();

/**
 * Resets all session timers based on current configuration
 */
const resetTimers = (): void => {
  // Clear existing timers
  if (activityTimeout) {
    window.clearTimeout(activityTimeout);
    activityTimeout = undefined;
  }

  if (warningTimeout) {
    window.clearTimeout(warningTimeout);
    warningTimeout = undefined;
  }

  // Set warning timer
  const warningDelay = sessionConfig.timeout - sessionConfig.warningTime;
  warningTimeout = window.setTimeout(() => {
    isWarningActive = true;
    sessionConfig.onWarning();

    auditLogClient.log(AuditEventType.USER_TIMEOUT, {
      action: 'session_warning',
      details: 'Session warning displayed',
      result: 'success',
    });
  }, warningDelay);

  // Set timeout timer
  activityTimeout = window.setTimeout(() => {
    auditLogClient.log(AuditEventType.USER_TIMEOUT, {
      action: 'session_timeout',
      details: 'Session timed out due to inactivity',
      result: 'success',
    });

    // Execute timeout callback
    sessionConfig.onTimeout();
  }, sessionConfig.timeout);
};

/**
 * Tracks user activity
 */
const trackActivity = (): void => {
  lastActivityTime = Date.now();

  // Only reset timers if the warning is not active
  if (!isWarningActive) {
    resetTimers();
  }
};

/**
 * Initializes the session management service
 */
export const initializeSessionClient = (config: Partial<SessionConfig> = {}): void => {
  // Merge provided config with defaults
  sessionConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Initialize activity tracking
  ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach((eventType) => {
    window.addEventListener(eventType, trackActivity, { passive: true });
  });

  // Set initial timers
  resetTimers();

  auditLogClient.log(AuditEventType.SYSTEM_CONFIG_CHANGE, {
    action: 'session_service_init',
    details: `Session service initialized with timeout ${sessionConfig.timeout}ms`,
    result: 'success',
  });
};

/**
 * Continues the session and resets warning state
 */
export const continueSession = (): void => {
  isWarningActive = false;
  trackActivity();

  auditLogClient.log(AuditEventType.USER_TIMEOUT, {
    action: 'session_continued',
    details: 'User continued session after warning',
    result: 'success',
  });
};

/**
 * Manual logout function
 */
export const logout = (): void => {
  // Clear timers
  if (activityTimeout) {
    window.clearTimeout(activityTimeout);
  }

  if (warningTimeout) {
    window.clearTimeout(warningTimeout);
  }

  auditLogClient.log(AuditEventType.USER_LOGOUT, {
    action: 'user_logout',
    details: 'User manually logged out',
    result: 'success',
  });

  // Redirect to login
  window.location.href = '/login?reason=logout';
};

/**
 * Returns the time remaining in the current session
 */
export const getSessionTimeRemaining = (): number => {
  const elapsedTime = Date.now() - lastActivityTime;
  return Math.max(0, sessionConfig.timeout - elapsedTime);
};

/**
 * Returns whether the warning is currently active
 */
export const isSessionWarningActive = (): boolean => {
  return isWarningActive;
};
