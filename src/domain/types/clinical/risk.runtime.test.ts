/**
 * NOVAMIND Neural Test Suite
 * Risk runtime validators testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { RiskLevel } from '@domain/types/clinical/risk.ts'; // Add .ts extension
import {
  RiskLevelValidator,
  RiskAssessmentValidator,
  DomainRiskValidator,
  ContributingFactorValidator,
  ProtectiveFactorValidator,
} from '@domain/types/clinical/risk.runtime.ts'; // Add .ts extension

describe('Risk runtime validators', () => {
  it('RiskLevelValidator validates correct RiskLevel values', () => {
    // Valid risk levels
    expect(RiskLevelValidator.isValid(RiskLevel.NONE)).toBe(true);
    expect(RiskLevelValidator.isValid(RiskLevel.LOW)).toBe(true);
    expect(RiskLevelValidator.isValid(RiskLevel.MODERATE)).toBe(true);
    expect(RiskLevelValidator.isValid(RiskLevel.HIGH)).toBe(true);
    expect(RiskLevelValidator.isValid(RiskLevel.SEVERE)).toBe(true);
    expect(RiskLevelValidator.isValid(RiskLevel.UNKNOWN)).toBe(true);

    // Invalid risk levels
    expect(RiskLevelValidator.isValid('invalid_level')).toBe(false);
    expect(RiskLevelValidator.isValid(123)).toBe(false);
    expect(RiskLevelValidator.isValid(null)).toBe(false);
    expect(RiskLevelValidator.isValid(undefined)).toBe(false);
  });

  it('RiskAssessmentValidator validates correct RiskAssessment objects', () => {
    const validRiskAssessment = {
      id: 'risk-123',
      patientId: 'patient-456',
      timestamp: '2025-03-31T14:00:00Z',
      assessmentType: 'hybrid',
      overallRisk: RiskLevel.MODERATE,
      confidenceScore: 0.85,
      domainRisks: [
        {
          domain: 'suicide',
          riskLevel: RiskLevel.LOW,
          confidenceScore: 0.9,
          evidence: ['No current suicidal ideation'],
          urgency: 'routine',
        },
      ],
      temporalTrend: 'stable',
      contributingFactors: [
        {
          id: 'factor-1',
          name: 'Recent job loss',
          category: 'social',
          impactWeight: 0.7,
          modifiability: 'partially-modifiable',
          temporalRelevance: 'short-term',
        },
      ],
      protectiveFactors: [
        {
          id: 'protective-1',
          name: 'Strong social support',
          category: 'social',
          strengthLevel: 'strong',
          temporalStability: 'stable',
        },
      ],
      neuralCorrelates: [],
    };

    const invalidRiskAssessment = {
      id: 'risk-123',
      patientId: 'patient-456',
      // Missing required fields
    };

    expect(RiskAssessmentValidator.isValid(validRiskAssessment)).toBe(true);
    expect(RiskAssessmentValidator.isValid(invalidRiskAssessment)).toBe(false);
    expect(RiskAssessmentValidator.isValid(null)).toBe(false);
    expect(RiskAssessmentValidator.isValid({})).toBe(false);
  });

  it('DomainRiskValidator validates correct DomainRisk objects', () => {
    const validDomainRisk = {
      domain: 'suicide',
      riskLevel: RiskLevel.LOW,
      confidenceScore: 0.9,
      evidence: ['No current suicidal ideation'],
      urgency: 'routine',
      temporalDynamics: {
        shortTermRisk: RiskLevel.LOW,
        mediumTermRisk: RiskLevel.LOW,
        longTermRisk: RiskLevel.LOW,
      },
    };

    const invalidDomainRisk = {
      domain: 'invalid_domain', // Invalid domain
      riskLevel: RiskLevel.LOW,
      confidenceScore: 0.9,
      evidence: ['Some evidence'],
      urgency: 'routine',
    };

    expect(DomainRiskValidator.isValid(validDomainRisk)).toBe(true);
    expect(DomainRiskValidator.isValid(invalidDomainRisk)).toBe(false);
    expect(DomainRiskValidator.isValid(null)).toBe(false);
    expect(DomainRiskValidator.isValid({})).toBe(false);
  });

  it('ContributingFactorValidator validates correct ContributingFactor objects', () => {
    const validContributingFactor = {
      id: 'factor-1',
      name: 'Recent job loss',
      category: 'social',
      impactWeight: 0.7,
      modifiability: 'partially-modifiable',
      temporalRelevance: 'short-term',
      description: 'Patient lost job 2 weeks ago',
    };

    const invalidContributingFactor = {
      id: 'factor-1',
      name: 'Recent job loss',
      category: 'invalid_category', // Invalid category
      impactWeight: 0.7,
      modifiability: 'partially-modifiable',
      temporalRelevance: 'short-term',
    };

    expect(ContributingFactorValidator.isValid(validContributingFactor)).toBe(true);
    expect(ContributingFactorValidator.isValid(invalidContributingFactor)).toBe(false);
    expect(ContributingFactorValidator.isValid(null)).toBe(false);
    expect(ContributingFactorValidator.isValid({})).toBe(false);
  });

  it('ProtectiveFactorValidator validates correct ProtectiveFactor objects', () => {
    const validProtectiveFactor = {
      id: 'protective-1',
      name: 'Strong social support',
      category: 'social',
      strengthLevel: 'strong',
      temporalStability: 'stable',
      enhancementStrategies: ['Weekly group therapy'],
    };

    const invalidProtectiveFactor = {
      id: 'protective-1',
      name: 'Strong social support',
      category: 'social',
      strengthLevel: 'invalid_level', // Invalid strength level
      temporalStability: 'stable',
    };

    expect(ProtectiveFactorValidator.isValid(validProtectiveFactor)).toBe(true);
    expect(ProtectiveFactorValidator.isValid(invalidProtectiveFactor)).toBe(false);
    expect(ProtectiveFactorValidator.isValid(null)).toBe(false);
    expect(ProtectiveFactorValidator.isValid({})).toBe(false);
  });
});
