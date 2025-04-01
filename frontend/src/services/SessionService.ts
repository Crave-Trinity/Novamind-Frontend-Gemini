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
import { validateSessionOptions } from "./SessionService.runtime"; // Import validator
import { auditLogService, AuditEventType } from "./AuditLogService";
import { Result, Ok, Err } from "ts-results"; // Import Result for consistency (though not used in return types here)

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
export function initializeSessionService(
  options: SessionOptions = {},
): boolean {
  // Return boolean for success/failure
  // Validate options
  const validationResult = validateSessionOptions(options);
  if (validationResult.err) {
    console.error(
      "[SessionService] Invalid options provided:",
      validationResult.val.message,
      options,
    );
    // Optionally throw or handle the error based on desired strictness
    return false; // Indicate initialization failure
  }
  const validatedOptions = validationResult.val; // Use validated options

  // Set configuration options with defaults
  sessionTimeout = validatedOptions.timeout ?? 15 * 60 * 1000;
  warningTime = validatedOptions.warningTime ?? 60 * 1000;
  timeoutCallback = validatedOptions.onTimeout ?? null;
  warningCallback = validatedOptions.onWarning ?? null;
  isEnabled = validatedOptions.enabled ?? true;

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
      // Consider a more specific type like SYSTEM_INIT or CONFIGURATION_CHANGE
      action: "session_service_initialized",
      details: `Session timeout set to ${sessionTimeout}ms, warning at ${warningTime}ms`,
      result: "success", // Assuming initialization is always success if validation passes
    });
  }
  return true; // Indicate successful initialization
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
  // Configure local options or use defaults from global state
  const timeout = options.timeout ?? sessionTimeout;
  const warning = options.warningTime ?? warningTime;

  // State for countdown and warning
  const [timeRemaining, setTimeRemaining] = useState(timeout);
  const [isWarning, setIsWarning] = useState(false);

  // Interval ref for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Callbacks
  const resetCallback = useCallback(() => {
    resetSession(); // Use global reset function
    setIsWarning(false);
    setTimeRemaining(timeout);
  }, [timeout]); // Depend on local timeout for resetting display

  const logoutCallback = useCallback(() => {
    logoutSession(); // Use global logout function
  }, []);

  // Effect for activity tracking and warning display
  useEffect(() => {
    // Use the 'enabled' option passed to the hook, defaulting to true if not provided
    const hookEnabled = options.enabled ?? true;
    if (!hookEnabled) {
      // If hook is disabled, ensure global timers are cleared if they were set by this hook instance
      // This logic might need refinement depending on how global vs hook-specific enabling is intended
      // For now, we assume the hook controls its own timers based on its enabled prop.
      if (intervalRef.current) clearInterval(intervalRef.current);
      // We don't destroy the global service here, just the hook's interaction
      return;
    }

    // Custom warning handler specific to this hook instance
    const handleWarning = () => {
      setIsWarning(true);
      if (options.onWarning) {
        options.onWarning();
      }

      // Start countdown interval only when warning triggers
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const elapsedSinceLastActivity = Date.now() - lastActivityTime;
        const remaining = Math.max(0, timeout - elapsedSinceLastActivity);
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 1000);
    };

    // Custom timeout handler specific to this hook instance
    const handleTimeout = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (options.onTimeout) {
        options.onTimeout();
      }
      // Potentially trigger global logout or rely on onTimeout to do it
    };

    // Initialize the global session service with hook-specific callbacks
    // This might re-initialize repeatedly if the hook re-renders often with changing options.
    // Consider moving initialization outside the hook or using a context provider.
    const initOptions: SessionOptions = {
      timeout,
      warningTime: warning,
      onWarning: handleWarning,
      onTimeout: handleTimeout,
      enabled: true, // Hook always enables the global timer if it's used and enabled
    };
    initializeSessionService(initOptions); // Re-initialize global service with potentially new callbacks

    // Cleanup on unmount: Clear interval and potentially global timers/listeners
    // if this is the last active hook instance (more complex state needed for that).
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Simple cleanup: doesn't destroy global listeners if other hooks are active
    };
    // Re-run effect if hook options change
  }, [options.enabled, options.onTimeout, options.onWarning, timeout, warning]);

  // Return the hook interface
  return {
    timeRemaining,
    resetSession: resetCallback,
    logout: logoutCallback,
    isWarning,
  };
}
