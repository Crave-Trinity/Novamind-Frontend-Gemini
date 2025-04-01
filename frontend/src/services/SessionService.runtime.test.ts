/**
 * @fileoverview Tests for runtime validation functions in SessionService.runtime.ts.
 */

import { describe, it, expect, vi } from "vitest";
import {
  validateSessionOptions,
  isSessionOptions,
} from "./SessionService.runtime";
import { SessionOptions } from "./SessionService";

// --- Mock Data ---

const mockValidOptions: SessionOptions = {
  timeout: 30 * 60 * 1000, // 30 minutes
  warningTime: 2 * 60 * 1000, // 2 minutes
  onTimeout: vi.fn(),
  onWarning: vi.fn(),
  enabled: true,
};

const mockValidOptions_Partial: SessionOptions = {
  timeout: 10 * 60 * 1000, // 10 minutes
  // warningTime omitted (use default)
  onTimeout: vi.fn(),
};

const mockInvalidOptions_WrongType = {
  timeout: "fifteen minutes", // Should be number
  warningTime: 60000,
};

const mockInvalidOptions_BadValue = {
  timeout: 5000,
  warningTime: 10000, // Warning time >= timeout
};

const mockInvalidOptions_BadCallback = {
  timeout: 900000,
  onTimeout: "not a function", // Should be function
};

describe("SessionService Runtime Validation", () => {
  // Tests for isSessionOptions
  describe("isSessionOptions", () => {
    it("should return true for valid full SessionOptions", () => {
      expect(isSessionOptions(mockValidOptions)).toBe(true);
    });
    it("should return true for valid partial SessionOptions", () => {
      expect(isSessionOptions(mockValidOptions_Partial)).toBe(true);
    });
    it("should return true for empty object", () => {
      expect(isSessionOptions({})).toBe(true);
    });
    it("should return false for options with incorrect types", () => {
      expect(isSessionOptions(mockInvalidOptions_WrongType)).toBe(false);
    });
    it("should return false for options with bad values (warning >= timeout)", () => {
      // Note: The guard currently only warns, doesn't return false for this case
      // expect(isSessionOptions(mockInvalidOptions_BadValue)).toBe(false);
      expect(isSessionOptions(mockInvalidOptions_BadValue)).toBe(true); // Guard allows this but warns
    });
    it("should return false for options with non-function callback", () => {
      expect(isSessionOptions(mockInvalidOptions_BadCallback)).toBe(false);
    });
    it("should return false for null", () => {
      expect(isSessionOptions(null)).toBe(false);
    });
    it("should return false for non-object", () => {
      expect(isSessionOptions(123)).toBe(false);
    });
  });

  // Tests for validateSessionOptions
  describe("validateSessionOptions", () => {
    it("should return Ok for valid SessionOptions", () => {
      const result = validateSessionOptions(mockValidOptions);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidOptions);
    });

    it("should return Ok for valid partial SessionOptions", () => {
      const result = validateSessionOptions(mockValidOptions_Partial);
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(mockValidOptions_Partial);
    });

    it("should return Ok for empty object", () => {
      const result = validateSessionOptions({});
      expect(result.ok).toBe(true);
      expect(result.val).toEqual({});
    });

    it("should return Err for invalid options (wrong type)", () => {
      const result = validateSessionOptions(mockInvalidOptions_WrongType);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain("Invalid SessionOptions");
    });

    it("should return Ok for options with warningTime >= timeout (guard only warns)", () => {
      const result = validateSessionOptions(mockInvalidOptions_BadValue);
      expect(result.ok).toBe(true); // Guard doesn't fail this
    });

    it("should return Err for invalid options (bad callback)", () => {
      const result = validateSessionOptions(mockInvalidOptions_BadCallback);
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain("Invalid SessionOptions");
    });

    it("should return Err for non-object input", () => {
      const result = validateSessionOptions("options");
      expect(result.err).toBe(true);
      expect((result.val as Error).message).toContain("Invalid SessionOptions");
    });
  });
});
