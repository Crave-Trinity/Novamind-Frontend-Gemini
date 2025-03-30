/**
 * HIPAA-compliant Session Management Service
 *
 * Handles user session timeout for security compliance:
 * - Tracks user activity across the application
 * - Warns user before session expires
 * - Automatically logs out after inactivity
 * - Provides hooks for React components
 */

import { useState, useEffect, useCallback, useRef } from "react";

import { auditLogService, AuditEventType } from "./AuditLogService";

/**
 * Configuration options for session management
 */
export interface SessionOptions {
  /**
   * Session timeout duration in milliseconds
   * Default: 15 minutes (900000ms)
   */
  timeout?: number;

  /**
   * Warning time before session expires in milliseconds
   * Default: 1 minute (60000ms)
   */
  warningTime?: number;

  /**
   * Callback function when session times out
   */
  onTimeout?: () => void;

  /**
   * Callback function when warning should be shown
   */
  onWarning?: () => void;

  /**
   * Whether session tracking is enabled
   * Default: true
   */
  enabled?: boolean;
}

/**
 * User activity events to track
 */
const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

/**
 * Global state for session management
 * Using a singleton pattern to maintain one instance across the app
 */
let sessionTimerId: ReturnType<typeof setTimeout> | null = null;
let warningTimerId: ReturnType<typeof setTimeout> | null = null;
let lastActivityTime = Date.now();
let sessionTimeout = 15 * 60 * 1000; // 15 minutes default
let warningTime = 60 * 1000; // 1 minute default
let timeoutCallback: (() => void) | null = null;
let warningCallback: (() => void) | null = null;
let isEnabled = true;
let isWarningActive = false;

/**
 * Initialize the session service with options
 */
export function initializeSessionService(options: SessionOptions = {}): void {
  // Set configuration options with defaults
  sessionTimeout = options.timeout || 15 * 60 * 1000; // 15 minutes
  warningTime = options.warningTime || 60 * 1000; // 1 minute
  timeoutCallback = options.onTimeout || null;
  warningCallback = options.onWarning || null;
  isEnabled = options.enabled !== undefined ? options.enabled : true;

  // Clear any existing timers
  if (sessionTimerId) {
    clearTimeout(sessionTimerId);
  }
  if (warningTimerId) {
    clearTimeout(warningTimerId);
  }

  // Reset activity time
  lastActivityTime = Date.now();

  // Only set up event listeners if enabled
  if (isEnabled) {
    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initial timer setup
    startSessionTimer();

    // Log initialization
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      action: "session_service_initialized",
      details: `Session timeout set to ${sessionTimeout}ms, warning at ${warningTime}ms`,
    });
  }
}

/**
 * Clean up session service
 */
export function destroySessionService(): void {
  // Remove event listeners
  ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, handleUserActivity);
  });

  // Clear timers
  if (sessionTimerId) {
    clearTimeout(sessionTimerId);
  }
  if (warningTimerId) {
    clearTimeout(warningTimerId);
  }

  sessionTimerId = null;
  warningTimerId = null;
  isWarningActive = false;
}

/**
 * Handle user activity by resetting the timer
 */
function handleUserActivity(): void {
  if (!isEnabled) {
    return;
  }

  // Update last activity time
  lastActivityTime = Date.now();

  // If warning is active, reset it
  if (isWarningActive) {
    isWarningActive = false;

    // Log session extension
    auditLogService.log(AuditEventType.SESSION_TIMEOUT, {
      action: "session_extended",
      result: "success",
      details: "User activity detected, session extended",
    });
  }

  // Restart the session timer
  startSessionTimer();
}

/**
 * Start or restart the session timer
 */
function startSessionTimer(): void {
  // Clear existing timers
  if (sessionTimerId) {
    clearTimeout(sessionTimerId);
  }
  if (warningTimerId) {
    clearTimeout(warningTimerId);
  }

  // Set warning timer
  warningTimerId = setTimeout(() => {
    isWarningActive = true;

    // Log warning
    auditLogService.log(AuditEventType.SESSION_TIMEOUT, {
      action: "session_warning",
      result: "warning",
      details: "Session about to expire, warning displayed",
    });

    // Trigger warning callback
    if (warningCallback) {
      warningCallback();
    }
  }, sessionTimeout - warningTime);

  // Set session timeout timer
  sessionTimerId = setTimeout(() => {
    // Log timeout
    auditLogService.log(AuditEventType.SESSION_TIMEOUT, {
      action: "session_timeout",
      result: "success",
      details: "Session expired due to inactivity",
    });

    // Trigger timeout callback
    if (timeoutCallback) {
      timeoutCallback();
    }

    // Reset state
    isWarningActive = false;
  }, sessionTimeout);
}

/**
 * Manually reset the session timer
 */
export function resetSession(): void {
  lastActivityTime = Date.now();
  isWarningActive = false;
  startSessionTimer();

  // Log manual reset
  auditLogService.log(AuditEventType.SESSION_TIMEOUT, {
    action: "session_manual_reset",
    result: "success",
    details: "Session manually reset by user action",
  });
}

/**
 * Manually log out the user
 */
export function logoutSession(): void {
  // Log manual logout
  auditLogService.log(AuditEventType.LOGOUT, {
    action: "manual_logout",
    result: "success",
    details: "User manually logged out",
  });

  // Clean up timers
  if (sessionTimerId) {
    clearTimeout(sessionTimerId);
  }
  if (warningTimerId) {
    clearTimeout(warningTimerId);
  }

  // Redirect to login
  window.location.href = "/login?reason=logout";
}

/**
 * React hook for session timeout management
 */
export function useSessionTimeout(options: SessionOptions = {}): {
  timeRemaining: number;
  resetSession: () => void;
  logout: () => void;
  isWarning: boolean;
} {
  // Configure local options or use defaults
  const timeout = options.timeout || sessionTimeout;
  const warning = options.warningTime || warningTime;

  // State for countdown and warning
  const [timeRemaining, setTimeRemaining] = useState(timeout);
  const [isWarning, setIsWarning] = useState(false);

  // Interval ref for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Callbacks
  const resetCallback = useCallback(() => {
    resetSession();
    setIsWarning(false);
    setTimeRemaining(timeout);
  }, [timeout]);

  const logoutCallback = useCallback(() => {
    logoutSession();
  }, []);

  // Effect for activity tracking and warning display
  useEffect(() => {
    if (!options.enabled) {
      return;
    }

    // Custom warning handler
    const handleWarning = () => {
      setIsWarning(true);

      // Call provided warning handler
      if (options.onWarning) {
        options.onWarning();
      }

      // Start countdown
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActivityTime;
        const remaining = Math.max(0, timeout - elapsed);
        setTimeRemaining(remaining);

        // If time is up, clear interval
        if (remaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, 1000);
    };

    // Custom timeout handler
    const handleTimeout = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Call provided timeout handler
      if (options.onTimeout) {
        options.onTimeout();
      }
    };

    // Initialize the session service
    initializeSessionService({
      timeout,
      warningTime: warning,
      onWarning: handleWarning,
      onTimeout: handleTimeout,
      enabled: true,
    });

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [options.enabled, options.onTimeout, options.onWarning, timeout, warning]);

  // Return the hook interface
  return {
    timeRemaining,
    resetSession: resetCallback,
    logout: logoutCallback,
    isWarning,
  };
}
