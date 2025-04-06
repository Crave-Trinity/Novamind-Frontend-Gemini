/**
 * @fileoverview Tests for runtime validation functions in BiometricStreamController.runtime.ts.
 */

import { describe, it, expect } from "vitest";
import {
  validateBiometricData,
  validatePartialStreamConfig, // Updated function name
  // Import locally defined types/enums if needed for mock data clarity
  // BiometricType, AlertPriority, BiometricThreshold, BiometricDataPoint, BiometricSource, PartialStreamConfig
} from "@application/controllers/BiometricStreamController.runtime";
import type { StreamConfig } from "@application/controllers/BiometricStreamController"; // Import from the correct controller file

// --- Mock Data (Based on inferred types) ---

const mockValidBiometricDataPoint = {
  id: "dp-hr-123",
  streamId: "stream-hr",
  timestamp: Date.now(),
  value: 72,
  type: "heartRate", // Must be a valid BiometricType
  source: "wearable", // Must be a valid BiometricSource
  quality: "high", // Must be 'high', 'medium', or 'low'
};

const mockInvalidBiometricDataPoint_MissingField = {
  id: "dp-hr-456",
  streamId: "stream-hr",
  timestamp: Date.now(),
  type: "heartRate",
  source: "wearable",
  quality: "high",
  // Missing 'value'
};

const mockInvalidBiometricDataPoint_WrongType = {
  id: "dp-hr-789",
  streamId: "stream-hr",
  timestamp: "not a date or number", // Invalid timestamp type
  value: 75,
  type: "heartRate",
  source: "wearable",
  quality: "high",
};

const mockValidPartialStreamConfig: Partial<StreamConfig> = {
  // Use Partial<StreamConfig> for type-safe partial mock
  sampleRate: 120,
  filterOutliers: false,
  alertThresholds: new Map([
    ["heartRate", [{ min: 50, max: 110, label: "Warn", priority: "warning" }]],
  ]),
};

const mockInvalidPartialStreamConfig_WrongType = {
  sampleRate: "fast", // Should be number
  bufferSize: 1000,
};

const mockInvalidPartialStreamConfig_InvalidThreshold = {
  alertThresholds: new Map([
    [
      "heartRate",
      [{ min: "low", max: 100, label: "Warn", priority: "warning" }],
    ], // min is not number
  ]),
};

const mockInvalidPartialStreamConfig_InvalidThresholdKey = {
  alertThresholds: new Map([
    [
      "heart_rate_bpm",
      [{ min: 50, max: 100, label: "Warn", priority: "warning" }],
    ], // Invalid BiometricType key
  ]),
};

const mockInvalidPartialStreamConfig_InvalidSource = {
  sources: ["wearable", "implant"], // 'implant' is not a valid BiometricSource
};

describe("BiometricStreamController Runtime Validation", () => {
  // Tests for validateBiometricData
  describe("validateBiometricData", () => {
    it("should return Ok for valid BiometricDataPoint", () => {
      const result = validateBiometricData(mockValidBiometricDataPoint);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidBiometricDataPoint);
    });

    it("should return Err for non-object input", () => {
      const result = validateBiometricData(12345);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid BiometricDataPoint structure.",
      );
    });

    it("should return Err for data missing required fields", () => {
      const result = validateBiometricData(
        mockInvalidBiometricDataPoint_MissingField,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid BiometricDataPoint structure.",
      );
    });

    it("should return Err for data with incorrect field types", () => {
      const result = validateBiometricData(
        mockInvalidBiometricDataPoint_WrongType,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Invalid BiometricDataPoint structure.",
      );
    });
  });

  // Tests for validatePartialStreamConfig
  describe("validatePartialStreamConfig", () => {
    it("should return Ok for valid Partial<StreamConfig>", () => {
      const result = validatePartialStreamConfig(mockValidPartialStreamConfig);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidPartialStreamConfig);
    });

    it("should return Ok for an empty object config", () => {
      const result = validatePartialStreamConfig({});
      expect(result.ok).toBe(true);
      expect(result.val).toEqual({});
    });

    it("should return Err for non-object input", () => {
      const result = validatePartialStreamConfig("config_string");
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "Input must be an object.",
      );
    });

    it("should return Err for config with incorrect field types", () => {
      const result = validatePartialStreamConfig(
        mockInvalidPartialStreamConfig_WrongType,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "sampleRate must be a positive number.",
      );
    });

    it("should return Err for config with invalid alertThresholds structure (invalid threshold)", () => {
      const result = validatePartialStreamConfig(
        mockInvalidPartialStreamConfig_InvalidThreshold,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Invalid threshold array for key "heartRate"',
      );
    });

    it("should return Err for config with invalid alertThresholds structure (invalid key)", () => {
      const result = validatePartialStreamConfig(
        mockInvalidPartialStreamConfig_InvalidThresholdKey,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        'Invalid key "heart_rate_bpm"',
      );
    });

    it("should return Err for config with invalid sources array", () => {
      const result = validatePartialStreamConfig(
        mockInvalidPartialStreamConfig_InvalidSource,
      );
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain(
        "sources must be an array of valid BiometricSource values.",
      );
    });
  });
});
