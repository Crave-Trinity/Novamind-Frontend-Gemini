/**
 * @fileoverview Tests for runtime validation functions in AuditLogService.runtime.ts.
 */

import { describe, it, expect } from "vitest";
import {
  validateLogEventData,
  validateAuditEvent,
  isAuditEventType,
  isAuditLogEvent,
  isPartialAuditLogEventData,
} from "./AuditLogService.runtime";
import { AuditEventType, AuditLogEvent } from "./AuditLogService"; // Import from service file

// --- Mock Data ---

const mockValidPartialData: Partial<AuditLogEvent> = {
  result: "success",
  details: "User logged in successfully.",
  resourceType: "UserSession",
  resourceId: "user123",
  clientInfo: { ipAddress: "192.168.1.1" },
};

const mockInvalidPartialData_WrongType = {
  result: "ok", // Invalid result value
  details: 123, // Should be string
};

const mockValidAuditEvent: AuditLogEvent = {
  timestamp: new Date().toISOString(),
  eventType: AuditEventType.LOGIN,
  userId: "user123",
  sessionId: "sessionABC",
  result: "success",
  details: "Login successful via password.",
  clientInfo: { userAgent: "Test Browser" },
};

const mockInvalidAuditEvent_MissingType = {
  timestamp: new Date().toISOString(),
  // eventType: AuditEventType.LOGIN, // Missing
  userId: "user123",
  result: "success",
};

const mockInvalidAuditEvent_WrongType = {
  timestamp: new Date().toISOString(),
  eventType: AuditEventType.PHI_VIEW,
  userId: "user456",
  result: "success",
  resourceId: 987, // Should be string
};

describe("AuditLogService Runtime Validation", () => {
  // Tests for isAuditEventType
  describe("isAuditEventType", () => {
    it("should return true for valid AuditEventType values", () => {
      expect(isAuditEventType(AuditEventType.LOGIN)).toBe(true);
      expect(isAuditEventType("PHI_VIEW")).toBe(true);
    });
    it("should return false for invalid string values", () => {
      expect(isAuditEventType("USER_LOGIN")).toBe(false);
    });
    it("should return false for non-string values", () => {
      expect(isAuditEventType(123)).toBe(false);
    });
  });

  // Tests for isPartialAuditLogEventData
  describe("isPartialAuditLogEventData", () => {
    it("should return true for valid partial data", () => {
      expect(isPartialAuditLogEventData(mockValidPartialData)).toBe(true);
    });
    it("should return true for empty object", () => {
      expect(isPartialAuditLogEventData({})).toBe(true);
    });
    it("should return false for data with incorrect types", () => {
      expect(isPartialAuditLogEventData(mockInvalidPartialData_WrongType)).toBe(
        false,
      );
    });
    it("should return false for non-object", () => {
      expect(isPartialAuditLogEventData(null)).toBe(false);
      expect(isPartialAuditLogEventData("data")).toBe(false);
    });
  });

  // Tests for isAuditLogEvent
  describe("isAuditLogEvent", () => {
    it("should return true for valid AuditLogEvent", () => {
      expect(isAuditLogEvent(mockValidAuditEvent)).toBe(true);
    });
    it("should return false for event missing required fields", () => {
      expect(isAuditLogEvent(mockInvalidAuditEvent_MissingType)).toBe(false);
    });
    it("should return false for event with incorrect types", () => {
      expect(isAuditLogEvent(mockInvalidAuditEvent_WrongType)).toBe(false);
    });
    it("should return false for null", () => {
      expect(isAuditLogEvent(null)).toBe(false);
    });
  });

  // Tests for validateLogEventData
  describe("validateLogEventData", () => {
    it("should return Ok for valid partial data", () => {
      const result = validateLogEventData(mockValidPartialData);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidPartialData);
    });

    it("should return Err for invalid partial data", () => {
      const result = validateLogEventData(mockInvalidPartialData_WrongType);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid data for AuditLogEvent",
      );
    });
  });

  // Tests for validateAuditEvent
  describe("validateAuditEvent", () => {
    it("should return Ok for valid full event", () => {
      const result = validateAuditEvent(mockValidAuditEvent);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidAuditEvent);
    });

    it("should return Err for invalid event (missing field)", () => {
      const result = validateAuditEvent(mockInvalidAuditEvent_MissingType);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid AuditLogEvent structure",
      );
    });

    it("should return Err for invalid event (wrong type)", () => {
      const result = validateAuditEvent(mockInvalidAuditEvent_WrongType);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid AuditLogEvent structure",
      );
    });
  });
});
