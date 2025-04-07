/**
 * NOVAMIND Neural-Safe Risk Assessment Runtime Validators
 *
 * Runtime validators for risk assessment data types with mathematical precision.
 * This module provides runtime validation for the Risk interfaces.
 */

import type {
  RiskAssessment,
  DomainRisk,
  ContributingFactor,
  ProtectiveFactor,
} from '@domain/types/clinical/risk';
import {
  RiskLevel,
  // Removed unused: NeuralRiskCorrelate,
  // Removed unused: RiskTimelineEvent,
  // Removed unused: BiometricRiskAlert,
} from '@domain/types/clinical/risk';

/**
 * Runtime validation for RiskLevel enum values
 */
export const RiskLevelValidator = {
  /**
   * Validates if a value is a valid RiskLevel
   */
  isValid: (value: unknown): value is RiskLevel => {
    if (typeof value !== 'string') return false;

    return Object.values(RiskLevel).includes(value as RiskLevel);
  },
};

/**
 * Runtime validation for RiskAssessment objects
 */
export const RiskAssessmentValidator = {
  /**
   * Validates if an object is a valid RiskAssessment
   */
  isValid: (obj: unknown): obj is RiskAssessment => {
    if (!obj || typeof obj !== 'object') return false;

    const assessment = obj as Partial<RiskAssessment>;
    return (
      typeof assessment.id === 'string' &&
      typeof assessment.patientId === 'string' &&
      typeof assessment.timestamp === 'string' &&
      (assessment.assessmentType === 'automated' ||
        assessment.assessmentType === 'clinician' ||
        assessment.assessmentType === 'hybrid') &&
      RiskLevelValidator.isValid(assessment.overallRisk) &&
      typeof assessment.confidenceScore === 'number' &&
      Array.isArray(assessment.domainRisks) &&
      (assessment.temporalTrend === 'increasing' ||
        assessment.temporalTrend === 'decreasing' ||
        assessment.temporalTrend === 'stable' ||
        assessment.temporalTrend === 'fluctuating') &&
      Array.isArray(assessment.contributingFactors) &&
      Array.isArray(assessment.protectiveFactors) &&
      Array.isArray(assessment.neuralCorrelates)
    );
  },
};

/**
 * Runtime validation for DomainRisk objects
 */
export const DomainRiskValidator = {
  /**
   * Validates if an object is a valid DomainRisk
   */
  isValid: (obj: unknown): obj is DomainRisk => {
    if (!obj || typeof obj !== 'object') return false;

    const domainRisk = obj as Partial<DomainRisk>;

    // Validate domain field
    const validDomains = [
      'suicide',
      'self_harm',
      'harm_to_others',
      'psychosis',
      'substance_use',
      'functional_decline',
      'treatment_resistance',
      'medical_complication',
    ];
    const hasValidDomain =
      typeof domainRisk.domain === 'string' && validDomains.includes(domainRisk.domain);

    // Validate urgency field
    const validUrgencies = ['immediate', 'urgent', 'monitor', 'routine'];
    const hasValidUrgency =
      typeof domainRisk.urgency === 'string' && validUrgencies.includes(domainRisk.urgency);

    return (
      hasValidDomain &&
      RiskLevelValidator.isValid(domainRisk.riskLevel) &&
      typeof domainRisk.confidenceScore === 'number' &&
      Array.isArray(domainRisk.evidence) &&
      hasValidUrgency
    );
  },
};

/**
 * Runtime validation for ContributingFactor objects
 */
export const ContributingFactorValidator = {
  /**
   * Validates if an object is a valid ContributingFactor
   */
  isValid: (obj: unknown): obj is ContributingFactor => {
    if (!obj || typeof obj !== 'object') return false;

    const factor = obj as Partial<ContributingFactor>;

    // Validate category field
    const validCategories = [
      'demographic',
      'clinical',
      'psychological',
      'social',
      'environmental',
      'neurobiological',
    ];
    const hasValidCategory =
      typeof factor.category === 'string' && validCategories.includes(factor.category);

    // Validate modifiability field
    const validModifiabilities = ['non-modifiable', 'partially-modifiable', 'modifiable'];
    const hasValidModifiability =
      typeof factor.modifiability === 'string' &&
      validModifiabilities.includes(factor.modifiability);

    // Validate temporalRelevance field
    const validTemporalRelevances = ['immediate', 'short-term', 'long-term'];
    const hasValidTemporalRelevance =
      typeof factor.temporalRelevance === 'string' &&
      validTemporalRelevances.includes(factor.temporalRelevance);

    return (
      typeof factor.id === 'string' &&
      typeof factor.name === 'string' &&
      hasValidCategory &&
      typeof factor.impactWeight === 'number' &&
      hasValidModifiability &&
      hasValidTemporalRelevance
    );
  },
};

/**
 * Runtime validation for ProtectiveFactor objects
 */
export const ProtectiveFactorValidator = {
  /**
   * Validates if an object is a valid ProtectiveFactor
   */
  isValid: (obj: unknown): obj is ProtectiveFactor => {
    if (!obj || typeof obj !== 'object') return false;

    const factor = obj as Partial<ProtectiveFactor>;

    // Validate category field
    const validCategories = [
      'clinical',
      'psychological',
      'social',
      'environmental',
      'neurobiological',
    ];
    const hasValidCategory =
      typeof factor.category === 'string' && validCategories.includes(factor.category);

    // Validate strengthLevel field
    const validStrengthLevels = ['minimal', 'moderate', 'strong'];
    const hasValidStrengthLevel =
      typeof factor.strengthLevel === 'string' &&
      validStrengthLevels.includes(factor.strengthLevel);

    // Validate temporalStability field
    const validTemporalStabilities = ['transient', 'episodic', 'stable'];
    const hasValidTemporalStability =
      typeof factor.temporalStability === 'string' &&
      validTemporalStabilities.includes(factor.temporalStability);

    return (
      typeof factor.id === 'string' &&
      typeof factor.name === 'string' &&
      hasValidCategory &&
      hasValidStrengthLevel &&
      hasValidTemporalStability
    );
  },
};
