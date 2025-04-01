/**
 * HIPAA-compliant audit logging service
 *
 * Comprehensive audit trail for all PHI access with:
 * - Detailed context capture
 * - Efficient batching
 * - Guaranteed delivery mechanisms
 * - Compliance with audit requirements
 */

import { useEffect } from "react";
import { validateLogEventData } from "./AuditLogService.runtime"; // Import validator
import { Err } from "ts-results"; // Import Err for returning errors

/**
 * Types of audit events for HIPAA compliance
 */
export enum AuditEventType {
  // Authentication events
  LOGIN = "LOGIN",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  MFA_CHALLENGE = "MFA_CHALLENGE",
  SESSION_TIMEOUT = "SESSION_TIMEOUT",

  // PHI access events
  PHI_VIEW = "PHI_VIEW",
  PHI_CREATE = "PHI_CREATE",
  PHI_UPDATE = "PHI_UPDATE",
  PHI_DELETE = "PHI_DELETE",
  PHI_EXPORT = "PHI_EXPORT",

  // System events
  SYSTEM_ERROR = "SYSTEM_ERROR",
  CONFIGURATION_CHANGE = "CONFIGURATION_CHANGE",

  // Application-specific events
  BRAIN_MODEL_VIEW = "BRAIN_MODEL_VIEW",
  PATIENT_SEARCH = "PATIENT_SEARCH",
  REPORT_GENERATED = "REPORT_GENERATED",
}

/**
 * Base interface for audit log events
 */
export interface AuditLogEvent {
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  result: "success" | "failure" | "warning";
  details?: string;
  resourceType?: string;
  resourceId?: string;
  clientInfo?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
  [key: string]: any; // Allow additional properties for specific event types
}

/**
 * Options for the AuditLogService
 */
interface AuditLogServiceOptions {
  /**
   * URL for the audit log API endpoint
   */
  apiEndpoint: string;

  /**
   * Maximum number of logs to batch before sending
   */
  batchSize: number;

  /**
   * Maximum time in milliseconds to hold logs before sending
   */
  batchTimeMs: number;

  /**
   * Whether to console.log events (dev mode only)
   */
  debug?: boolean;
}

/**
 * Implementation of the audit logging service
 */
class AuditLogService {
  private apiEndpoint: string;
  private batchSize: number;
  private batchTimeMs: number;
  private debug: boolean;
  private userId: string | null = null;
  private sessionId: string | null = null;

  private logQueue: AuditLogEvent[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private isSending = false;
  private pendingLogs: AuditLogEvent[] = [];

  constructor(options: AuditLogServiceOptions) {
    this.apiEndpoint = options.apiEndpoint;
    this.batchSize = options.batchSize;
    this.batchTimeMs = options.batchTimeMs;
    this.debug = options.debug || false;

    // Generate a unique session ID
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Set up event listeners for page unload/visibility to flush logs
    this.setupEventListeners();
  }

  /**
   * Set the current user ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Set up event listeners for page lifecycle events
   */
  private setupEventListeners(): void {
    // Send logs when page is about to unload
    window.addEventListener("beforeunload", () => {
      this.flushLogsSync();
    });

    // Send logs when page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushLogs(true);
      }
    });
  }

  /**
   * Log an audit event
   */
  public log(
    eventType: AuditEventType,
    data: Partial<AuditLogEvent> = {},
  ): void { // Keep return type void, handle validation errors internally
    // Validate input data
    const validationResult = validateLogEventData(data);
    if (validationResult.err) {
        // Log an error, but don't necessarily stop the logging process
        // Alternatively, could throw or return a Result if the caller needs to know
        console.error(`[AuditLogService] Invalid data passed to log for event ${eventType}:`, validationResult.val.message, data);
        // Optionally modify data or skip logging based on policy
        // For now, proceed with potentially incomplete data but log the error
    }

    // Use validated data if successful, otherwise use original (potentially flawed) data
    const validatedData = validationResult.ok ? validationResult.val : data;

    // Construct base event, conditionally add optional fields
    const eventBase: Omit<AuditLogEvent, 'userId' | 'sessionId'> & { userId?: string; sessionId?: string } = {
        timestamp: new Date().toISOString(),
        eventType,
        result: validatedData.result || "success",
        ...validatedData, // Spread validated data first
        clientInfo: {
            userAgent: navigator.userAgent,
            ...(validatedData.clientInfo || {}),
        },
    };

    if (this.userId !== null) {
        eventBase.userId = this.userId;
    }
    if (this.sessionId !== null) {
        eventBase.sessionId = this.sessionId;
    }

    const event: AuditLogEvent = eventBase as AuditLogEvent; // Assert type after conditional assignment

    // Debug logging if enabled
    if (this.debug) {
      console.debug(`[AuditLogService] ${eventType}:`, event);
    }

    // Add to queue
    this.logQueue.push(event);

    // Start batch timer if not already running
    if (!this.batchTimer && this.logQueue.length < this.batchSize) {
      this.batchTimer = setTimeout(() => this.flushLogs(), this.batchTimeMs);
    }

    // Send immediately if batch size reached
    if (this.logQueue.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Create a helper hook for logging PHI access
   */
  public logPHIAccess(
    resourceType: string,
    resourceId: string,
    action: string = "view",
  ): void {
    this.log(AuditEventType.PHI_VIEW, {
      resourceType,
      resourceId,
      action,
      result: "success",
    });
  }

  /**
   * Flush logs to server
   */
  private async flushLogs(isUrgent = false): Promise<void> {
    // Clear the batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // If no logs to send, return
    if (this.logQueue.length === 0) {
      return;
    }

    // If already sending, add to pending queue if urgent
    if (this.isSending) {
      if (isUrgent) {
        this.pendingLogs.push(...this.logQueue);
        this.logQueue = [];
      }
      return;
    }

    // Set sending flag
    this.isSending = true;

    // Get logs to send and clear queue
    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      // Send logs to server
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logs }),
        // Use keepalive for visibility change or page unload
        keepalive: isUrgent,
      });

      // Check response
      if (!response.ok) {
        throw new Error(`Failed to send audit logs: ${response.status}`);
      }

      // Handle any pending logs
      if (this.pendingLogs.length > 0) {
        this.logQueue.push(...this.pendingLogs);
        this.pendingLogs = [];
        this.flushLogs();
      }
    } catch (error) {
      // On failure, add logs back to queue for retry
      console.error("Error sending audit logs:", error);
      this.logQueue.unshift(...logs);

      // Retry after a delay
      setTimeout(() => this.flushLogs(), 5000);
    } finally {
      this.isSending = false;
    }
  }

  /**
   * Synchronous log flush for beforeunload event
   */
  private flushLogsSync(): void {
    if (this.logQueue.length === 0) {
      return;
    }

    // Create a synchronous request
    const logs = [...this.logQueue];

    // Use sendBeacon for reliable delivery during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ logs })], {
        type: "application/json",
      });
      navigator.sendBeacon(this.apiEndpoint, blob);
      this.logQueue = [];
    } else {
      // Fallback to synchronous XHR (less reliable)
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.apiEndpoint, false); // false = synchronous
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ logs }));
        this.logQueue = [];
      } catch (e) {
        // Cannot handle errors during unload
        console.error("Failed to send logs during unload");
      }
    }
  }
}

/**
 * Custom hook for logging PHI view in components
 */
export function useAuditLogPHIView(
  resourceType: string,
  resourceId: string,
  dependencies: any[] = [],
): void {
  useEffect(() => {
    auditLogService.log(AuditEventType.PHI_VIEW, {
      resourceType,
      resourceId,
      action: "view",
      result: "success",
    });

    // No cleanup needed for logging
  }, [...dependencies]);
}

// Get environment variables with fallbacks
const AUDIT_LOG_API_URL =
  typeof import.meta.env !== "undefined" &&
  import.meta.env.VITE_AUDIT_LOG_API_URL
    ? import.meta.env.VITE_AUDIT_LOG_API_URL
    : "/api/audit-logs";

const IS_DEVELOPMENT =
  typeof import.meta.env !== "undefined" && import.meta.env.MODE
    ? import.meta.env.MODE === "development"
    : process.env.NODE_ENV === "development";

// Create a singleton instance of the audit log service
export const auditLogService = new AuditLogService({
  apiEndpoint: AUDIT_LOG_API_URL,
  batchSize: 10,
  batchTimeMs: 5000,
  debug: IS_DEVELOPMENT,
});

// Export the service as default
export default auditLogService;
