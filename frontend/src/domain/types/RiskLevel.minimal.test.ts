/**
 * NOVAMIND Testing Framework
 * RiskLevel Types Tests
 *
 * Tests for the RiskLevel type definitions with TypeScript type safety
 */

import { describe, it, expect } from "vitest";
import { RiskLevel, getRiskLevelColor } from "./RiskLevel";

describe("RiskLevel", () => {
  it("exports RiskLevel with correct structure", () => {
    // Test valid risk levels
    const validRiskLevels: RiskLevel[] = [
      "minimal",
      "low",
      "moderate",
      "high",
      "critical",
      "Minimal",
      "Low",
      "Moderate",
      "High",
      "Critical",
      "Medium", // Legacy value
    ];

    // Verify each risk level is valid according to the type
    validRiskLevels.forEach((level) => {
      // This is a type check - if it compiles, the test passes
      const riskLevel: RiskLevel = level;
      expect(riskLevel).toBeDefined();
    });
  });

  it("exports getRiskLevelColor with correct functionality", () => {
    // Test color mapping for each risk level
    expect(getRiskLevelColor("minimal")).toContain("bg-green");
    expect(getRiskLevelColor("low")).toContain("bg-blue");
    expect(getRiskLevelColor("moderate")).toContain("bg-yellow");
    expect(getRiskLevelColor("high")).toContain("bg-orange");
    expect(getRiskLevelColor("critical")).toContain("bg-red");

    // Test case insensitivity
    expect(getRiskLevelColor("Minimal")).toContain("bg-green");
    expect(getRiskLevelColor("Low")).toContain("bg-blue");
    expect(getRiskLevelColor("Moderate")).toContain("bg-yellow");
    expect(getRiskLevelColor("High")).toContain("bg-orange");
    expect(getRiskLevelColor("Critical")).toContain("bg-red");

    // Test legacy value
    expect(getRiskLevelColor("Medium")).toContain("bg-yellow");

    // Test default case
    expect(getRiskLevelColor("unknown" as RiskLevel)).toContain("bg-gray");
  });

  it("provides dark mode variants for all risk levels", () => {
    // Test dark mode variants
    expect(getRiskLevelColor("minimal")).toContain("dark:bg-green");
    expect(getRiskLevelColor("low")).toContain("dark:bg-blue");
    expect(getRiskLevelColor("moderate")).toContain("dark:bg-yellow");
    expect(getRiskLevelColor("high")).toContain("dark:bg-orange");
    expect(getRiskLevelColor("critical")).toContain("dark:bg-red");
    expect(getRiskLevelColor("unknown" as RiskLevel)).toContain("dark:bg-gray");
  });

  it("provides text color classes for all risk levels", () => {
    // Test text color classes
    expect(getRiskLevelColor("minimal")).toContain("text-green");
    expect(getRiskLevelColor("low")).toContain("text-blue");
    expect(getRiskLevelColor("moderate")).toContain("text-yellow");
    expect(getRiskLevelColor("high")).toContain("text-orange");
    expect(getRiskLevelColor("critical")).toContain("text-red");
    expect(getRiskLevelColor("unknown" as RiskLevel)).toContain("text-gray");
  });
});
