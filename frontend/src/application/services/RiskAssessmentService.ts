import { RiskLevel } from "../../domain/types/RiskLevel";

/**
 * Type guard to ensure a string is a valid RiskLevel
 * @param value - String to check
 * @returns The value as a RiskLevel if valid
 */
function asRiskLevel(value: string): RiskLevel {
  // All possible risk level values
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
    "Medium",
  ];

  if (validRiskLevels.includes(value as RiskLevel)) {
    return value as RiskLevel;
  }

  // Default to 'minimal' if somehow an invalid value is provided
  console.warn(`Invalid risk level: ${value}, defaulting to 'minimal'`);
  return "minimal";
}

/**
 * RiskAssessmentService provides methods for calculating and evaluating
 * patient risk levels based on various clinical factors.
 */
export class RiskAssessmentService {
  /**
   * Calculates risk level based on depression severity score
   * @param score - Depression severity score (0-100)
   * @returns Risk level assessment
   */
  public calculateDepressionRiskLevel(score: number): {
    score: number;
    riskLevel: RiskLevel;
  } {
    let riskLevel: RiskLevel;

    if (score >= 75) riskLevel = asRiskLevel("critical");
    else if (score >= 50) riskLevel = asRiskLevel("high");
    else if (score >= 25) riskLevel = asRiskLevel("moderate");
    else if (score >= 10) riskLevel = asRiskLevel("low");
    else riskLevel = asRiskLevel("minimal");

    return {
      score,
      riskLevel,
    };
  }

  /**
   * Calculates risk level based on anxiety severity score
   * @param score - Anxiety severity score (0-100)
   * @returns Risk level assessment
   */
  public calculateAnxietyRiskLevel(score: number): {
    score: number;
    riskLevel: RiskLevel;
  } {
    let riskLevel: RiskLevel;

    if (score >= 75) riskLevel = asRiskLevel("critical");
    else if (score >= 50) riskLevel = asRiskLevel("high");
    else if (score >= 25) riskLevel = asRiskLevel("moderate");
    else if (score >= 10) riskLevel = asRiskLevel("low");
    else riskLevel = asRiskLevel("minimal");

    return {
      score,
      riskLevel,
    };
  }

  /**
   * Calculates overall risk level based on multiple factors
   * @param factors - Object containing various risk factors
   * @returns Overall risk assessment
   */
  public calculateOverallRiskLevel(factors: {
    depressionScore: number;
    anxietyScore: number;
    substanceUseScore: number;
    suicidalIdeationScore: number;
    socialSupportScore: number;
  }): { overallScore: number; riskLevel: RiskLevel } {
    // Calculate weighted overall score
    const overallScore =
      factors.depressionScore * 0.25 +
      factors.anxietyScore * 0.2 +
      factors.substanceUseScore * 0.15 +
      factors.suicidalIdeationScore * 0.3 +
      (100 - factors.socialSupportScore) * 0.1; // Invert social support (higher is better)

    let riskLevel: RiskLevel;

    if (overallScore >= 75) riskLevel = asRiskLevel("critical");
    else if (overallScore >= 50) riskLevel = asRiskLevel("high");
    else if (overallScore >= 25) riskLevel = asRiskLevel("moderate");
    else if (overallScore >= 10) riskLevel = asRiskLevel("low");
    else riskLevel = asRiskLevel("minimal");

    return {
      overallScore,
      riskLevel,
    };
  }
}
