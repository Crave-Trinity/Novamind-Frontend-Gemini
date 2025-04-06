/**
 * Application initialization
 *
 * Sets up global services, configurations and event listeners
 * for the Novamind Digital Twin application
 */

import { auditLogService, AuditEventType } from "@services/AuditLogService"; // Revert to specific alias
import { initializeSessionService } from "@services/SessionService"; // Revert to specific alias

/**
 * Initialize application
 */
export function initializeApp(): void {
  // Configure session timeout
  initializeSessionService({
    timeout: 15 * 60 * 1000, // 15 minutes
    warningTime: 60 * 1000, // 1 minute warning
    onTimeout: () => {
      // Redirect to login on timeout
      window.location.href = "/login?reason=timeout";
    },
    onWarning: () => {
      // Show warning modal (would be triggered via a global state mechanism in a real app)
      console.debug("Session timeout warning triggered");
      // This would typically dispatch to a global state manager to show the modal
    },
  });

  // Set up global error handler
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    // Log to audit service
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      action: "global_error",
      errorCode: error?.name || "Error",
      errorMessage: String(message),
      details: `${source}:${lineno}:${colno}`,
      result: "failure",
    });

    // Call original handler if it exists
    if (typeof originalOnError === "function") {
      return originalOnError.call(
        window,
        message,
        source,
        lineno,
        colno,
        error,
      );
    }

    // We don't prevent default handling
    return false;
  };

  // Set up unhandled promise rejection handler
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    // Log to audit service
    auditLogService.log(AuditEventType.SYSTEM_ERROR, {
      action: "unhandled_rejection",
      errorCode: "Promise Rejection",
      errorMessage: String(event.reason),
      details: event.reason?.stack || "No stack trace available",
      result: "failure",
    });

    // Call original handler if it exists
    if (typeof originalUnhandledRejection === "function") {
      return originalUnhandledRejection.call(window, event);
    }

    // We don't prevent default handling
    return false;
  };

  // Configure security headers via CSP
  // In a real app, this would be done server-side, but we set a base policy here
  if (typeof document !== "undefined") {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = [
      // Limit where resources can be loaded from
      "default-src 'self'",
      // Allow styles from same origin and inline styles
      "style-src 'self' 'unsafe-inline'",
      // Allow scripts from same origin, but not inline
      "script-src 'self'",
      // Allow images from same origin and data: URLs
      "img-src 'self' data:",
      // Allow XMLHttpRequest/fetch to backend API
      "connect-src 'self' https://api.novamind.com",
      // No plugins
      "object-src 'none'",
      // No embedding in frames from other origins
      "frame-ancestors 'self'",
      // Force HTTPS
      "upgrade-insecure-requests",
    ].join("; ");
    document.head.appendChild(meta);
  }

  // Configure security headers via Feature-Policy
  if (typeof document !== "undefined") {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Feature-Policy";
    meta.content = [
      "camera 'none'",
      "microphone 'none'",
      "geolocation 'none'",
      "autoplay 'self'",
    ].join("; ");
    document.head.appendChild(meta);
  }

  // Log application initialization
  auditLogService.log(AuditEventType.SYSTEM_ERROR, {
    action: "application_init",
    details: `Novamind Frontend initialized at ${new Date().toISOString()}`,
    result: "success",
  });
}

export default initializeApp;
