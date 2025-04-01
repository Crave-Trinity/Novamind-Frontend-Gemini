/**
 * NOVAMIND Neural Test Suite
 * Risk Level runtime validators testing with quantum precision
 */

import { describe, it, expect } from "vitest";
import { RiskLevelValidator } from "@types/clinical/risk-level.runtime";

describe("Risk Level runtime validators", () => {
  it("RiskLevelValidator validates correct risk levels", () => {
    // Valid risk levels
    expect(RiskLevelValidator.isValid("minimal")).toBe(true);
    expect(RiskLevelValidator.isValid("low")).toBe(true);
    expect(RiskLevelValidator.isValid("moderate")).toBe(true);
    expect(RiskLevelValidator.isValid("high")).toBe(true);
    expect(RiskLevelValidator.isValid("critical")).toBe(true);

    // Capitalized versions
    expect(RiskLevelValidator.isValid("Minimal")).toBe(true);
    expect(RiskLevelValidator.isValid("Low")).toBe(true);
    expect(RiskLevelValidator.isValid("Moderate")).toBe(true);
    expect(RiskLevelValidator.isValid("High")).toBe(true);
    expect(RiskLevelValidator.isValid("Critical")).toBe(true);

    // Legacy value
    expect(RiskLevelValidator.isValid("Medium")).toBe(true);

    // Invalid values
    expect(RiskLevelValidator.isValid("unknown")).toBe(false);
    expect(RiskLevelValidator.isValid("severe")).toBe(false); // Not in this enum
    expect(RiskLevelValidator.isValid(123)).toBe(false);
    expect(RiskLevelValidator.isValid(null)).toBe(false);
    expect(RiskLevelValidator.isValid(undefined)).toBe(false);
  });

  it("RiskLevelValidator normalizes risk levels correctly", () => {
    expect(RiskLevelValidator.normalize("Minimal")).toBe("minimal");
    expect(RiskLevelValidator.normalize("LOW")).toBe("low");
    expect(RiskLevelValidator.normalize("Moderate")).toBe("moderate");
    expect(RiskLevelValidator.normalize("HIGH")).toBe("high");
    expect(RiskLevelValidator.normalize("Critical")).toBe("critical");
    expect(RiskLevelValidator.normalize("Medium")).toBe("medium");
  });

  it("RiskLevelValidator returns correct severity levels", () => {
    expect(RiskLevelValidator.getSeverity("minimal")).toBe(0);
    expect(RiskLevelValidator.getSeverity("low")).toBe(1);
    expect(RiskLevelValidator.getSeverity("moderate")).toBe(2);
    expect(RiskLevelValidator.getSeverity("high")).toBe(3);
    expect(RiskLevelValidator.getSeverity("critical")).toBe(4);

    // Legacy value with equivalent mapping
    expect(RiskLevelValidator.getSeverity("Medium")).toBe(2);

    // Capitalized versions should return the same severity
    expect(RiskLevelValidator.getSeverity("Minimal")).toBe(0);
    expect(RiskLevelValidator.getSeverity("Critical")).toBe(4);
  });
});
