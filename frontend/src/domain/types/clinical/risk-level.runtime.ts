/**
 * NOVAMIND Neural-Safe Clinical Type Runtime Validators
 *
 * Runtime validators for Risk Level data types with clinical precision.
 * This module provides runtime validation for the RiskLevel type.
 */

import type { RiskLevel } from "@domain/types/clinical/risk-level";

/**
 * Runtime validation for RiskLevel
 */
export const RiskLevelValidator = {
  /**
   * Validates if a value is a valid RiskLevel
   */
  isValid: (value: unknown): value is RiskLevel => {
    if (typeof value !== "string") return false;

    // Create a set of valid risk levels for faster lookups
    const validLevels = new Set([
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
    ]);

    return validLevels.has(value);
  },

  /**
   * Normalize a risk level to lowercase for consistent handling
   */
  normalize: (level: RiskLevel): string => {
    return level.toLowerCase();
  },

  /**
   * Get the numerical severity of a risk level (0-4)
   */
  getSeverity: (level: RiskLevel): number => {
    const normalized = level.toLowerCase();

    // Handle special case for 'Medium' which is equivalent to 'moderate'
    if (normalized === "medium") return 2;

    const severityMap: Record<string, number> = {
      minimal: 0,
      low: 1,
      moderate: 2,
      high: 3,
      critical: 4,
    };

    return severityMap[normalized] ?? 0;
  },
};
