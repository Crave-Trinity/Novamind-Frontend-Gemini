/**
 * @fileoverview Runtime validation functions for data related to the TemporalDynamicsController.
 * Ensures that temporal configuration and parameters conform to expected types.
 * NOTE: Domain types for temporal dynamics are missing; validation is based on controller usage.
 */

import { Result, Ok, Err } from 'ts-results';
// import { ValidationError } from '@domain/errors/validation'; // If specific error types are defined

// --- Inferred & Local Types (Based on TemporalDynamicsController.ts usage) ---

// Inferred from controller usage
type TimeScale = "momentary" | "hourly" | "daily" | "weekly" | "monthly";
const validTimeScales: TimeScale[] = ["momentary", "hourly", "daily", "weekly", "monthly"];

// Local type definition matching the controller
interface TemporalConfig {
  timeScales: TimeScale[];
  patternRecognitionThreshold: number; // 0.0 to 1.0
  criticalTransitionSensitivity: number; // 0.0 to 1.0
  historyLength: Record<TimeScale, number>; // Number of time units to retain
  samplingRate: Record<TimeScale, number>; // Samples per time unit
  periodicity: boolean; // Whether to detect periodic patterns
  anomalyDetection: boolean; // Whether to detect anomalies
  filterNoise: boolean; // Whether to filter noise
  smoothingFactor: number; // 0.0 to 1.0
}
type PartialTemporalConfig = Partial<TemporalConfig>;

// --- Type Guards ---

function isTimeScale(value: unknown): value is TimeScale {
    return typeof value === 'string' && validTimeScales.includes(value as TimeScale);
}

function isRecordOfPositiveNumbers(record: unknown): record is Record<TimeScale, number> {
    if (typeof record !== 'object' || record === null) return false;
    for (const key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) {
            if (!isTimeScale(key) || typeof (record as any)[key] !== 'number' || (record as any)[key] <= 0) {
                return false;
            }
        }
    }
    // Check if all required TimeScales are present (optional, depending on strictness)
    // return validTimeScales.every(ts => Object.prototype.hasOwnProperty.call(record, ts));
    return true; // Allow partial records for Partial<TemporalConfig>
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}


// --- Validation Functions ---

/**
 * Validates the structure and types of Partial<TemporalConfig>.
 * @param config - The partial configuration object to validate.
 * @returns Result<PartialTemporalConfig, Error>
 */
export function validatePartialTemporalConfig(config: unknown): Result<PartialTemporalConfig, Error> {
  if (typeof config !== 'object' || config === null) {
    return Err(new Error('Invalid Partial<TemporalConfig>: Input must be an object.'));
  }
  const cfg = config as PartialTemporalConfig;

  // Validate individual fields if they exist
  if (cfg.timeScales !== undefined && (!Array.isArray(cfg.timeScales) || !cfg.timeScales.every(isTimeScale))) {
     return Err(new Error('Invalid Partial<TemporalConfig>: timeScales must be an array of valid TimeScale values.'));
  }
  if (cfg.patternRecognitionThreshold !== undefined && (typeof cfg.patternRecognitionThreshold !== 'number' || cfg.patternRecognitionThreshold < 0 || cfg.patternRecognitionThreshold > 1)) {
     return Err(new Error('Invalid Partial<TemporalConfig>: patternRecognitionThreshold must be a number between 0.0 and 1.0.'));
  }
  if (cfg.criticalTransitionSensitivity !== undefined && (typeof cfg.criticalTransitionSensitivity !== 'number' || cfg.criticalTransitionSensitivity < 0 || cfg.criticalTransitionSensitivity > 1)) {
     return Err(new Error('Invalid Partial<TemporalConfig>: criticalTransitionSensitivity must be a number between 0.0 and 1.0.'));
  }
   if (cfg.historyLength !== undefined && !isRecordOfPositiveNumbers(cfg.historyLength)) {
     return Err(new Error('Invalid Partial<TemporalConfig>: historyLength must be a Record mapping TimeScale to positive numbers.'));
  }
   if (cfg.samplingRate !== undefined && !isRecordOfPositiveNumbers(cfg.samplingRate)) {
     return Err(new Error('Invalid Partial<TemporalConfig>: samplingRate must be a Record mapping TimeScale to positive numbers.'));
  }
  if (cfg.periodicity !== undefined && typeof cfg.periodicity !== 'boolean') {
     return Err(new Error('Invalid Partial<TemporalConfig>: periodicity must be a boolean.'));
  }
  if (cfg.anomalyDetection !== undefined && typeof cfg.anomalyDetection !== 'boolean') {
     return Err(new Error('Invalid Partial<TemporalConfig>: anomalyDetection must be a boolean.'));
  }
  if (cfg.filterNoise !== undefined && typeof cfg.filterNoise !== 'boolean') {
     return Err(new Error('Invalid Partial<TemporalConfig>: filterNoise must be a boolean.'));
  }
  if (cfg.smoothingFactor !== undefined && (typeof cfg.smoothingFactor !== 'number' || cfg.smoothingFactor < 0 || cfg.smoothingFactor > 1)) {
     return Err(new Error('Invalid Partial<TemporalConfig>: smoothingFactor must be a number between 0.0 and 1.0.'));
  }

  return Ok(cfg);
}

/**
 * Validates if the input is a valid TimeScale.
 * @param timeScale - The value to validate.
 * @returns Result<TimeScale, Error>
 */
export function validateTimeScale(timeScale: unknown): Result<TimeScale, Error> {
    if (isTimeScale(timeScale)) {
        return Ok(timeScale);
    }
    return Err(new Error(`Invalid TimeScale: Must be one of ${validTimeScales.join(', ')}.`));
}

/**
 * Validates if the input is an array of strings (for metricIds).
 * @param metricIds - The value to validate.
 * @returns Result<string[], Error>
 */
export function validateMetricIds(metricIds: unknown): Result<string[], Error> {
    if (isStringArray(metricIds)) {
        return Ok(metricIds);
    }
    return Err(new Error('Invalid metricIds: Input must be an array of strings.'));
}


// --- Placeholder Validation Functions (From Skeleton) ---
// These might not be needed if validation happens elsewhere or types are simple

// Placeholder types
type TimeSeries = any; // Replace with actual type if needed
type AnalysisParameters = any; // Replace with actual type if needed

/**
 * Validates the structure and types of TimeSeries data (Placeholder).
 * @param data - The time series data to validate.
 * @returns Result<TimeSeries, Error>
 */
export function validateTimeSeriesData(data: unknown): Result<TimeSeries, Error> {
  // TODO: Implement detailed validation logic when TimeSeries type is defined
  if (typeof data !== 'object' || data === null) {
    return Err(new Error('Invalid TimeSeries data: Input must be an object.'));
  }
  // Add checks based on TimeSeriesData structure (e.g., timestamps array, values array)
  return Ok(data as TimeSeries);
}

/**
 * Validates the structure and types of AnalysisParameters (Placeholder).
 * @param params - The analysis parameters object to validate.
 * @returns Result<AnalysisParameters, Error>
 */
export function validateAnalysisParameters(params: unknown): Result<AnalysisParameters, Error> {
  // TODO: Implement detailed validation logic when AnalysisParameters type is defined
  if (typeof params !== 'object' || params === null) {
    return Err(new Error('Invalid AnalysisParameters: Input must be an object.'));
  }
   // Add checks based on TemporalAnalysisParams structure (e.g., windowSize, analysisType)
  return Ok(params as AnalysisParameters);
}
