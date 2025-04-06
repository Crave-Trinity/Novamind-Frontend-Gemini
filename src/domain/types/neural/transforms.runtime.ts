/**
 * NOVAMIND Neural-Safe Neural Transforms Runtime Validators
 *
 * Runtime validators for Neural Transform data types with quantum-level precision.
 * This module provides runtime validation for the Neural Transform interfaces.
 */

import type {
  NeuralTransform,
  NeuralTransformBatch,
  NeuralTransformSequence,
  NeuralTransformResult,
} from '@domain/types/neural/transforms';

/**
 * Runtime validation for NeuralTransform objects
 */
export const NeuralTransformValidator = {
  /**
   * Validates if an object is a valid NeuralTransform
   */
  isValid: (obj: unknown): obj is NeuralTransform => {
    if (!obj || typeof obj !== 'object') return false;

    const transform = obj as Partial<NeuralTransform>;
    const validSourceTriggers = ['symptom', 'medication', 'stimulation', 'baseline', 'manual'];
    const validTransitionTypes = ['excitation', 'inhibition', 'modulation'];

    // Validate required fields
    if (typeof transform.regionId !== 'string') return false;
    if (typeof transform.activationChange !== 'number') return false;
    if (typeof transform.transitionType !== 'string') return false;
    if (!validTransitionTypes.includes(transform.transitionType as any)) return false;
    if (typeof transform.sourceTrigger !== 'string') return false;
    if (!validSourceTriggers.includes(transform.sourceTrigger as any)) return false;

    // Validate optional fields if present
    if (transform.id !== undefined && typeof transform.id !== 'string') return false;
    if (transform.frequencyBand !== undefined && typeof transform.frequencyBand !== 'string')
      return false;
    if (
      transform.clinicalCorrelationId !== undefined &&
      typeof transform.clinicalCorrelationId !== 'string'
    )
      return false;
    if (transform.timestamp !== undefined && !(transform.timestamp instanceof Date)) return false;
    if (transform.duration !== undefined && typeof transform.duration !== 'number') return false;
    if (transform.confidence !== undefined && typeof transform.confidence !== 'number')
      return false;
    if (transform.clinicalNotes !== undefined && typeof transform.clinicalNotes !== 'string')
      return false;

    // Value range validations
    if (transform.activationChange < -1.0 || transform.activationChange > 1.0) return false;
    if (
      transform.confidence !== undefined &&
      (transform.confidence < 0.0 || transform.confidence > 1.0)
    )
      return false;

    return true;
  },
};

/**
 * Runtime validation for NeuralTransformBatch objects
 */
export const NeuralTransformBatchValidator = {
  /**
   * Validates if an object is a valid NeuralTransformBatch
   */
  isValid: (obj: unknown): obj is NeuralTransformBatch => {
    if (!obj || typeof obj !== 'object') return false;

    const batch = obj as Partial<NeuralTransformBatch>;
    const validSources = ['clinical', 'algorithmic', 'manual', 'simulation'];

    // Validate required fields
    if (typeof batch.id !== 'string') return false;
    if (!Array.isArray(batch.transforms)) return false;
    if (typeof batch.atomic !== 'boolean') return false;
    if (typeof batch.source !== 'string') return false;
    if (!validSources.includes(batch.source as any)) return false;
    if (!(batch.timestamp instanceof Date)) return false;

    // Validate each transform in the batch
    if (!batch.transforms.every(NeuralTransformValidator.isValid)) return false;

    // Validate optional fields if present
    if (batch.clinicalContext !== undefined && typeof batch.clinicalContext !== 'string')
      return false;

    return true;
  },
};

/**
 * Runtime validation for NeuralTransformSequence objects
 */
export const NeuralTransformSequenceValidator = {
  /**
   * Validates if an object is a valid NeuralTransformSequence
   */
  isValid: (obj: unknown): obj is NeuralTransformSequence => {
    if (!obj || typeof obj !== 'object') return false;

    const sequence = obj as Partial<NeuralTransformSequence>;

    // Validate required fields
    if (typeof sequence.id !== 'string') return false;
    if (typeof sequence.name !== 'string') return false;
    if (!Array.isArray(sequence.transformBatches)) return false;
    if (typeof sequence.loop !== 'boolean') return false;

    // Validate each transform batch in the sequence
    for (const item of sequence.transformBatches || []) {
      if (typeof item !== 'object' || item === null) return false;
      if (!NeuralTransformBatchValidator.isValid(item.batch)) return false;
      if (typeof item.delayMs !== 'number' || item.delayMs < 0) return false;
    }

    // Validate optional fields if present
    if (
      sequence.repetitions !== undefined &&
      (typeof sequence.repetitions !== 'number' || sequence.repetitions < 0)
    )
      return false;

    if (
      sequence.interRepetitionDelayMs !== undefined &&
      (typeof sequence.interRepetitionDelayMs !== 'number' || sequence.interRepetitionDelayMs < 0)
    )
      return false;

    if (sequence.description !== undefined && typeof sequence.description !== 'string')
      return false;

    if (sequence.tags !== undefined && !Array.isArray(sequence.tags)) return false;
    if (sequence.tags !== undefined && !sequence.tags.every((tag) => typeof tag === 'string'))
      return false;

    return true;
  },
};

/**
 * Runtime validation for NeuralTransformResult objects
 */
export const NeuralTransformResultValidator = {
  /**
   * Validates if an object is a valid NeuralTransformResult
   */
  isValid: (obj: unknown): obj is NeuralTransformResult => {
    if (!obj || typeof obj !== 'object') return false;

    const result = obj as Partial<NeuralTransformResult>;

    // Validate required fields
    if (typeof result.transformId !== 'string') return false;
    if (typeof result.success !== 'boolean') return false;
    if (!Array.isArray(result.affectedRegions)) return false;
    if (!result.affectedRegions.every((region) => typeof region === 'string')) return false;
    if (!(result.timestamp instanceof Date)) return false;

    // Validate optional fields if present
    if (result.error !== undefined && typeof result.error !== 'string') return false;

    // Validate affected metrics if present
    if (result.affectedMetrics !== undefined) {
      if (!Array.isArray(result.affectedMetrics)) return false;

      for (const metric of result.affectedMetrics) {
        if (typeof metric !== 'object' || metric === null) return false;
        if (typeof metric.metricId !== 'string') return false;
        if (typeof metric.previousValue !== 'number') return false;
        if (typeof metric.newValue !== 'number') return false;
        if (typeof metric.percentChange !== 'number') return false;
      }
    }

    // Validate performance metrics if present
    if (result.performanceMetrics !== undefined) {
      if (typeof result.performanceMetrics !== 'object' || result.performanceMetrics === null)
        return false;
      if (typeof result.performanceMetrics.processingTimeMs !== 'number') return false;
      if (typeof result.performanceMetrics.computationalIntensity !== 'string') return false;
      if (!['low', 'medium', 'high'].includes(result.performanceMetrics.computationalIntensity))
        return false;
    }

    return true;
  },
};
