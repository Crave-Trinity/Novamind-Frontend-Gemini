/**
 * @fileoverview Runtime validation functions for AuditLogService data structures.
 */

import { Result, Ok, Err } from "ts-results";
import { AuditEventType, AuditLogEvent } from "./AuditLogService"; // Import from service file

// --- Type Guards ---

// Type guard for AuditEventType enum
export function isAuditEventType(value: unknown): value is AuditEventType {
  return (
    typeof value === "string" &&
    Object.values(AuditEventType).includes(value as AuditEventType)
  );
}

// Type guard for the AuditLogEvent interface (basic structure check)
export function isAuditLogEvent(obj: unknown): obj is AuditLogEvent {
  if (typeof obj !== "object" || obj === null) return false;
  const event = obj as Partial<AuditLogEvent>;

  return (
    typeof event.timestamp === "string" && // Should ideally validate ISO format
    isAuditEventType(event.eventType) &&
    (event.userId === undefined || typeof event.userId === "string") &&
    (event.sessionId === undefined || typeof event.sessionId === "string") &&
    (event.result === "success" ||
      event.result === "failure" ||
      event.result === "warning") &&
    (event.details === undefined || typeof event.details === "string") &&
    (event.resourceType === undefined ||
      typeof event.resourceType === "string") &&
    (event.resourceId === undefined || typeof event.resourceId === "string") &&
    (event.clientInfo === undefined ||
      (typeof event.clientInfo === "object" && event.clientInfo !== null)) // Basic object check for clientInfo
    // Note: Does not validate arbitrary additional properties [key: string]: any;
  );
}

// Type guard for the Partial<AuditLogEvent> data passed to the log method
// This focuses on the *input* data structure, which might be less strict than the final event
export function isPartialAuditLogEventData(
  obj: unknown,
): obj is Partial<AuditLogEvent> {
  if (typeof obj !== "object" || obj === null) return false;
  // Since it's Partial, we mainly check types if properties exist
  const data = obj as Partial<AuditLogEvent>;

  if (data.timestamp !== undefined && typeof data.timestamp !== "string")
    return false;
  if (data.eventType !== undefined && !isAuditEventType(data.eventType))
    return false;
  if (data.userId !== undefined && typeof data.userId !== "string")
    return false;
  if (data.sessionId !== undefined && typeof data.sessionId !== "string")
    return false;
  if (
    data.result !== undefined &&
    !["success", "failure", "warning"].includes(data.result)
  )
    return false;
  if (data.details !== undefined && typeof data.details !== "string")
    return false;
  if (data.resourceType !== undefined && typeof data.resourceType !== "string")
    return false;
  if (data.resourceId !== undefined && typeof data.resourceId !== "string")
    return false;
  if (
    data.clientInfo !== undefined &&
    (typeof data.clientInfo !== "object" || data.clientInfo === null)
  )
    return false;
  // Allow any other properties due to [key: string]: any;

  return true;
}

// --- Validation Functions ---

/**
 * Validates the data object passed to the AuditLogService log method.
 * @param data - The partial event data to validate.
 * @returns Result<Partial<AuditLogEvent>, Error>
 */
export function validateLogEventData(
  data: unknown,
): Result<Partial<AuditLogEvent>, Error> {
  if (isPartialAuditLogEventData(data)) {
    return Ok(data);
  }
  return Err(
    new Error(
      "Invalid data for AuditLogEvent: Structure or types are incorrect.",
    ),
  );
}

/**
 * Validates the full AuditLogEvent structure (e.g., before sending).
 * @param event - The full event object to validate.
 * @returns Result<AuditLogEvent, Error>
 */
export function validateAuditEvent(
  event: unknown,
): Result<AuditLogEvent, Error> {
  if (isAuditLogEvent(event)) {
    return Ok(event);
  }
  // Attempt to stringify for better error reporting
  let eventStr = "[unserializable event]";
  try {
    eventStr = JSON.stringify(event, null, 2);
    if (eventStr.length > 500) {
      eventStr = eventStr.substring(0, 497) + "...";
    }
  } catch (e) {
    /* ignore */
  }
  return Err(
    new Error(`Invalid AuditLogEvent structure. Received: ${eventStr}`),
  );
}

// TODO: Add validation for AuditLogServiceOptions if needed (e.g., positive batchSize)
