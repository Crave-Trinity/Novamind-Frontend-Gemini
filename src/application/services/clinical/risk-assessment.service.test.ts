/**
 * NOVAMIND Neural Test Suite
 * RiskAssessmentService testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RiskAssessmentService } from '@services/clinical/risk-assessment.service.ts'; // Use @services alias and add .ts
import { RiskLevel } from '@domain/types/clinical/risk'; // Correct path for RiskLevel

describe('RiskAssessmentService', () => {
  let riskAssessmentService: RiskAssessmentService;

  beforeEach(() => {
    riskAssessmentService = new RiskAssessmentService();
  });

  describe('calculateDepressionRiskLevel', () => {
    it('correctly calculates critical risk level', () => {
      const result = riskAssessmentService.calculateDepressionRiskLevel(80);
      expect(result.riskLevel).toBe('critical');
      expect(result.score).toBe(80);
    });

    it('correctly calculates high risk level', () => {
      const result = riskAssessmentService.calculateDepressionRiskLevel(60);
      expect(result.riskLevel).toBe('high');
      expect(result.score).toBe(60);
    });

    it('correctly calculates moderate risk level', () => {
      const result = riskAssessmentService.calculateDepressionRiskLevel(30);
      expect(result.riskLevel).toBe('moderate');
      expect(result.score).toBe(30);
    });

    it('correctly calculates low risk level', () => {
      const result = riskAssessmentService.calculateDepressionRiskLevel(15);
      expect(result.riskLevel).toBe('low');
      expect(result.score).toBe(15);
    });

    it('correctly calculates minimal risk level', () => {
      const result = riskAssessmentService.calculateDepressionRiskLevel(5);
      expect(result.riskLevel).toBe('minimal');
      expect(result.score).toBe(5);
    });
  });

  describe('calculateAnxietyRiskLevel', () => {
    it('correctly calculates critical risk level', () => {
      const result = riskAssessmentService.calculateAnxietyRiskLevel(85);
      expect(result.riskLevel).toBe('critical');
      expect(result.score).toBe(85);
    });

    it('correctly calculates high risk level', () => {
      const result = riskAssessmentService.calculateAnxietyRiskLevel(55);
      expect(result.riskLevel).toBe('high');
      expect(result.score).toBe(55);
    });

    it('correctly calculates moderate risk level', () => {
      const result = riskAssessmentService.calculateAnxietyRiskLevel(35);
      expect(result.riskLevel).toBe('moderate');
      expect(result.score).toBe(35);
    });
  });

  describe('calculateOverallRiskLevel', () => {
    it('correctly calculates critical overall risk', () => {
      const result = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 90,
        anxietyScore: 85,
        substanceUseScore: 70,
        suicidalIdeationScore: 80,
        socialSupportScore: 20,
      });

      expect(result.riskLevel).toBe('critical');
      expect(result.overallScore).toBeGreaterThan(75);
    });

    it('correctly calculates high overall risk', () => {
      const result = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 60,
        anxietyScore: 55,
        substanceUseScore: 50,
        suicidalIdeationScore: 60,
        socialSupportScore: 40,
      });

      expect(result.riskLevel).toBe('high');
      expect(result.overallScore).toBeGreaterThanOrEqual(50);
      expect(result.overallScore).toBeLessThan(75);
    });

    it('correctly calculates moderate overall risk', () => {
      const result = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 30,
        anxietyScore: 35,
        substanceUseScore: 25,
        suicidalIdeationScore: 20,
        socialSupportScore: 70,
      });

      expect(result.riskLevel).toBe('moderate');
      expect(result.overallScore).toBeGreaterThanOrEqual(25);
      expect(result.overallScore).toBeLessThan(50);
    });

    it('correctly weighs risk factors', () => {
      // Test that suicidal ideation has greater impact (0.3 weight)
      const highSuicidalRisk = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 50,
        anxietyScore: 50,
        substanceUseScore: 50,
        suicidalIdeationScore: 90, // High suicidal risk
        socialSupportScore: 50,
      });

      const highDepressionRisk = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 90, // High depression risk
        anxietyScore: 50,
        substanceUseScore: 50,
        suicidalIdeationScore: 50,
        socialSupportScore: 50,
      });

      // Suicidal ideation should have more weight than depression
      expect(highSuicidalRisk.overallScore).toBeGreaterThan(highDepressionRisk.overallScore);
    });

    it('correctly accounts for social support as a protective factor', () => {
      const lowSupportRisk = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 50,
        anxietyScore: 50,
        substanceUseScore: 50,
        suicidalIdeationScore: 50,
        socialSupportScore: 20, // Low support = higher risk
      });

      const highSupportRisk = riskAssessmentService.calculateOverallRiskLevel({
        depressionScore: 50,
        anxietyScore: 50,
        substanceUseScore: 50,
        suicidalIdeationScore: 50,
        socialSupportScore: 80, // High support = lower risk
      });

      // Lower social support should result in higher risk
      expect(lowSupportRisk.overallScore).toBeGreaterThan(highSupportRisk.overallScore);
    });
  });
});
