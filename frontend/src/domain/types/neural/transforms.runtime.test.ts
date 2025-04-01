/**
 * NOVAMIND Neural Test Suite
 * Neural Transforms runtime validators testing with quantum precision
 */

import { describe, it, expect } from 'vitest';
import { 
  NeuralTransformValidator,
  NeuralTransformBatchValidator,
  NeuralTransformSequenceValidator,
  NeuralTransformResultValidator
} from './transforms.runtime';

describe('Neural Transforms runtime validators', () => {
  it('NeuralTransformValidator validates correct NeuralTransform objects', () => {
    const validTransform = {
      id: 'transform-123',
      regionId: 'dlPFC-right',
      activationChange: 0.5,
      transitionType: 'excitation',
      frequencyBand: 'alpha',
      sourceTrigger: 'medication',
      clinicalCorrelationId: 'med-123',
      timestamp: new Date(),
      duration: 30000,
      confidence: 0.85,
      clinicalNotes: 'SSRI expected to increase activation'
    };

    const invalidTransformMissingRequired = {
      id: 'transform-123',
      // Missing required fields
    };
    
    const invalidTransformWrongRange = {
      regionId: 'dlPFC-right',
      activationChange: 1.5, // Should be in range -1.0 to 1.0
      transitionType: 'excitation',
      sourceTrigger: 'medication'
    };

    expect(NeuralTransformValidator.isValid(validTransform)).toBe(true);
    expect(NeuralTransformValidator.isValid(invalidTransformMissingRequired)).toBe(false);
    expect(NeuralTransformValidator.isValid(invalidTransformWrongRange)).toBe(false);
    expect(NeuralTransformValidator.isValid(null)).toBe(false);
    expect(NeuralTransformValidator.isValid(123)).toBe(false);
  });

  it('NeuralTransformBatchValidator validates correct NeuralTransformBatch objects', () => {
    const validTransform = {
      regionId: 'dlPFC-right',
      activationChange: 0.5,
      transitionType: 'excitation',
      sourceTrigger: 'medication'
    };
    
    const validBatch = {
      id: 'batch-123',
      transforms: [validTransform],
      atomic: true,
      clinicalContext: 'Initial medication response',
      source: 'clinical',
      timestamp: new Date()
    };

    const invalidBatchMissingRequired = {
      id: 'batch-123',
      // Missing required fields
    };
    
    const invalidBatchInvalidTransforms = {
      id: 'batch-123',
      transforms: [{ invalid: 'transform' }],
      atomic: true,
      source: 'clinical',
      timestamp: new Date()
    };

    expect(NeuralTransformBatchValidator.isValid(validBatch)).toBe(true);
    expect(NeuralTransformBatchValidator.isValid(invalidBatchMissingRequired)).toBe(false);
    expect(NeuralTransformBatchValidator.isValid(invalidBatchInvalidTransforms)).toBe(false);
    expect(NeuralTransformBatchValidator.isValid(null)).toBe(false);
    expect(NeuralTransformBatchValidator.isValid(123)).toBe(false);
  });

  it('NeuralTransformSequenceValidator validates correct NeuralTransformSequence objects', () => {
    const validTransform = {
      regionId: 'dlPFC-right',
      activationChange: 0.5,
      transitionType: 'excitation',
      sourceTrigger: 'medication'
    };
    
    const validBatch = {
      id: 'batch-123',
      transforms: [validTransform],
      atomic: true,
      source: 'clinical',
      timestamp: new Date()
    };
    
    const validSequence = {
      id: 'sequence-123',
      name: 'SSRI Response Model',
      transformBatches: [
        { batch: validBatch, delayMs: 0 },
        { batch: validBatch, delayMs: 5000 }
      ],
      loop: false,
      repetitions: 1,
      description: 'Modeled neural response to SSRI administration',
      tags: ['medication', 'SSRI', 'predictive']
    };

    const invalidSequenceMissingRequired = {
      id: 'sequence-123',
      // Missing required fields
    };
    
    const invalidSequenceInvalidBatch = {
      id: 'sequence-123',
      name: 'SSRI Response Model',
      transformBatches: [
        { batch: { invalid: 'batch' }, delayMs: 0 }
      ],
      loop: false
    };
    
    const invalidSequenceNegativeDelay = {
      id: 'sequence-123',
      name: 'SSRI Response Model',
      transformBatches: [
        { batch: validBatch, delayMs: -1000 } // Negative delay
      ],
      loop: false
    };

    expect(NeuralTransformSequenceValidator.isValid(validSequence)).toBe(true);
    expect(NeuralTransformSequenceValidator.isValid(invalidSequenceMissingRequired)).toBe(false);
    expect(NeuralTransformSequenceValidator.isValid(invalidSequenceInvalidBatch)).toBe(false);
    expect(NeuralTransformSequenceValidator.isValid(invalidSequenceNegativeDelay)).toBe(false);
    expect(NeuralTransformSequenceValidator.isValid(null)).toBe(false);
    expect(NeuralTransformSequenceValidator.isValid(123)).toBe(false);
  });

  it('NeuralTransformResultValidator validates correct NeuralTransformResult objects', () => {
    const validResult = {
      transformId: 'transform-123',
      success: true,
      affectedRegions: ['dlPFC-right', 'ACC'],
      affectedMetrics: [
        {
          metricId: 'anxiety',
          previousValue: 7.2,
          newValue: 6.5,
          percentChange: -9.72
        }
      ],
      timestamp: new Date(),
      performanceMetrics: {
        processingTimeMs: 125,
        computationalIntensity: 'medium'
      }
    };

    const invalidResultMissingRequired = {
      transformId: 'transform-123',
      // Missing required fields
    };
    
    const invalidResultInvalidMetrics = {
      transformId: 'transform-123',
      success: true,
      affectedRegions: ['dlPFC-right'],
      affectedMetrics: [
        {
          // Missing required fields
          newValue: 6.5
        }
      ],
      timestamp: new Date()
    };
    
    const invalidResultInvalidPerformanceMetrics = {
      transformId: 'transform-123',
      success: true,
      affectedRegions: ['dlPFC-right'],
      timestamp: new Date(),
      performanceMetrics: {
        processingTimeMs: 125,
        computationalIntensity: 'ultra-high' // Invalid intensity level
      }
    };

    expect(NeuralTransformResultValidator.isValid(validResult)).toBe(true);
    expect(NeuralTransformResultValidator.isValid(invalidResultMissingRequired)).toBe(false);
    expect(NeuralTransformResultValidator.isValid(invalidResultInvalidMetrics)).toBe(false);
    expect(NeuralTransformResultValidator.isValid(invalidResultInvalidPerformanceMetrics)).toBe(false);
    expect(NeuralTransformResultValidator.isValid(null)).toBe(false);
    expect(NeuralTransformResultValidator.isValid(123)).toBe(false);
  });
});
