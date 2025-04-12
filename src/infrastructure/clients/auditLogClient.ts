/* eslint-disable */
/**
 * Audit Log Event Types for HIPAA compliance and system monitoring
 */
export enum AuditEventType {
  // User activity events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_TIMEOUT = 'USER_TIMEOUT',
  USER_PASSWORD_CHANGE = 'USER_PASSWORD_CHANGE',
  USER_MFA_CHANGE = 'USER_MFA_CHANGE',
  USER_SESSION_VERIFY = 'USER_SESSION_VERIFY',
  USER_SESSION_RENEWED = 'USER_SESSION_RENEWED',

  // Data access events
  PHI_ACCESS = 'PHI_ACCESS',
  PATIENT_RECORD_VIEW = 'PATIENT_RECORD_VIEW',
  PATIENT_RECORD_MODIFY = 'PATIENT_RECORD_MODIFY',
  REPORT_GENERATION = 'REPORT_GENERATION',
  EXPORT_DATA = 'EXPORT_DATA',

  // System events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',

  // Digital Twin specific events
  BRAIN_MODEL_VIEW = 'BRAIN_MODEL_VIEW',
  PREDICTION_GENERATED = 'PREDICTION_GENERATED',
  TREATMENT_SIMULATION = 'TREATMENT_SIMULATION',

  // Security events
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  timestamp?: Date;
  eventType: AuditEventType;
  userId?: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  result: 'success' | 'failure';
  errorCode?: string;
  errorMessage?: string;
  details?: string;
  sessionId?: string;
}

/**
 * Audit Log Service for HIPAA Compliance
 *
 * This service logs all significant events in the application,
 * including user access to PHI, system events, and security events.
 * In a production environment, this would send logs to a secure server.
 */
class AuditLogClient {
  private enabled: boolean = true;
  private endpoint: string = '/api/audit-logs';

  /**
   * Log an event to the audit log system
   */
  public log(eventType: AuditEventType, data: Partial<AuditLogEntry>): void {
    if (!this.enabled) return;

    try {
      const logEntry: AuditLogEntry = {
        timestamp: new Date(),
        eventType,
        action: data.action || 'unknown',
        result: data.result || 'success',
        ...data,
      };

      // Log to console in development
      console.debug(`[AuditLogClient] ${eventType}:`, logEntry);

      // In production, send to backend
      if (process.env.NODE_ENV === 'production') {
        this.sendToServer(logEntry);
      }
    } catch (error) {
      console.error('Error sending audit logs:', error);
    }
  }

  /**
   * Send log entry to server
   */
  private async sendToServer(logEntry: AuditLogEntry): Promise<void> {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error sending audit logs:', error);
    }
  }

  /**
   * Enable or disable audit logging
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const auditLogClient = new AuditLogClient();
