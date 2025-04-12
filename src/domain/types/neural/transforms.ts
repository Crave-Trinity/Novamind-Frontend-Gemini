/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Domain Types
 * Neural Transforms - Quantum-level transformation specifications
 * with mathematically precise type definitions
 */

// NeuralFrequencyBand and NeuralTransitionType are not exported from activity.ts
// Defining them locally or using literals directly.

// Define common EEG frequency bands
export type NeuralFrequencyBand =
  | 'delta' // 0.5-4 Hz
  | 'theta' // 4-8 Hz
  | 'alpha' // 8-13 Hz
  | 'beta' // 13-30 Hz
  | 'gamma'; // 30-100+ Hz

/**
 * Neural-safe transform definition with clinical precision
 * Defines mathematically precise changes to neural activity
 */
export interface NeuralTransform {
  /**
   * Unique identifier for the transform
   */
  id?: string;

  /**
   * Target brain region identifier
   */
  regionId: string;

  /**
   * Change in activation level (-1.0 to 1.0)
   * Negative values suppress activity, positive values enhance
   */
  activationChange: number;

  /**
   * Type of transition to apply
   */
  transitionType: 'gradual' | 'abrupt' | 'oscillating'; // Use literal union directly

  /**
   * Optional frequency band to affect
   */
  frequencyBand?: NeuralFrequencyBand;

  /**
   * Source trigger for this neural transform
   */
  sourceTrigger: 'symptom' | 'medication' | 'stimulation' | 'baseline' | 'manual';

  /**
   * Clinical correlation identifier
   * Links this transform to a clinical entity (symptom, medication, etc.)
   */
  clinicalCorrelationId?: string;

  /**
   * Timestamp of transform application
   */
  timestamp?: Date;

  /**
   * Duration of the transform effect in milliseconds
   * If undefined, effect is persistent until reset
   */
  duration?: number;

  /**
   * Confidence level in the transform's accuracy (0.0 to 1.0)
   */
  confidence?: number;

  /**
   * Clinical notes providing context for this transform
   */
  clinicalNotes?: string;
}

/**
 * Neural transform batch for synchronized application
 */
export interface NeuralTransformBatch {
  /**
   * Unique identifier for the batch
   */
  id: string;

  /**
   * Transforms to apply as a synchronized unit
   */
  transforms: NeuralTransform[];

  /**
   * Whether transforms should be applied atomically
   * If true, all transforms succeed or all fail
   */
  atomic: boolean;

  /**
   * Clinical context for this transform batch
   */
  clinicalContext?: string;

  /**
   * Source of the transform batch
   */
  source: 'clinical' | 'algorithmic' | 'manual' | 'simulation';

  /**
   * Application timestamp
   */
  timestamp: Date;
}

/**
 * Neural transformation sequence for temporal progression
 */
export interface NeuralTransformSequence {
  /**
   * Unique identifier for the sequence
   */
  id: string;

  /**
   * Name of the sequence
   */
  name: string;

  /**
   * Ordered transform batches to apply in sequence
   */
  transformBatches: {
    /**
     * Transform batch to apply
     */
    batch: NeuralTransformBatch;

    /**
     * Delay in milliseconds before applying this batch
     * Relative to the previous batch or sequence start
     */
    delayMs: number;
  }[];

  /**
   * Whether the sequence should loop
   */
  loop: boolean;

  /**
   * Number of times to repeat the sequence
   * Undefined means infinite (if loop is true)
   */
  repetitions?: number;

  /**
   * Delay between repetitions in milliseconds
   */
  interRepetitionDelayMs?: number;

  /**
   * Description of the sequence's clinical purpose
   */
  description?: string;

  /**
   * Tags for categorization
   */
  tags?: string[];
}

/**
 * Neural transform result with clinical precision
 */
export interface NeuralTransformResult {
  /**
   * Reference to original transform or batch
   */
  transformId: string;

  /**
   * Success status
   */
  success: boolean;

  /**
   * Error message if unsuccessful
   */
  error?: string;

  /**
   * Affected region IDs
   */
  affectedRegions: string[];

  /**
   * Clinical metrics affected by this transform
   */
  affectedMetrics?: {
    metricId: string;
    previousValue: number;
    newValue: number;
    percentChange: number;
  }[];

  /**
   * Application timestamp
   */
  timestamp: Date;

  /**
   * Performance metrics
   */
  performanceMetrics?: {
    /**
     * Processing time in milliseconds
     */
    processingTimeMs: number;

    /**
     * Computation intensity
     */
    computationalIntensity: 'low' | 'medium' | 'high';
  };
}
