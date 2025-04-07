import { RiskLevel } from '@domain/types/clinical/risk'; // Import enum itself

// Removed unused asRiskLevel helper function

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

    // Assign RiskLevel enum members directly
    if (score >= 75) riskLevel = RiskLevel.SEVERE; // Assuming 'critical' maps to 'severe'
    else if (score >= 50) riskLevel = RiskLevel.HIGH;
    else if (score >= 25) riskLevel = RiskLevel.MODERATE;
    else if (score >= 10) riskLevel = RiskLevel.LOW;
    else riskLevel = RiskLevel.NONE; // Assuming 'minimal' maps to 'none'

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

    // Assign RiskLevel enum members directly
    if (score >= 75) riskLevel = RiskLevel.SEVERE; // Assuming 'critical' maps to 'severe'
    else if (score >= 50) riskLevel = RiskLevel.HIGH;
    else if (score >= 25) riskLevel = RiskLevel.MODERATE;
    else if (score >= 10) riskLevel = RiskLevel.LOW;
    else riskLevel = RiskLevel.NONE; // Assuming 'minimal' maps to 'none'

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

    // Assign RiskLevel enum members directly
    if (overallScore >= 75) riskLevel = RiskLevel.SEVERE; // Assuming 'critical' maps to 'severe'
    else if (overallScore >= 50) riskLevel = RiskLevel.HIGH;
    else if (overallScore >= 25) riskLevel = RiskLevel.MODERATE;
    else if (overallScore >= 10) riskLevel = RiskLevel.LOW;
    else riskLevel = RiskLevel.NONE; // Assuming 'minimal' maps to 'none'

    return {
      overallScore,
      riskLevel,
    };
  }
}
