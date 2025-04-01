/**
 * @fileoverview Runtime validation functions for data related to the BiometricStreamController.
 * Ensures that biometric data points and stream configurations conform to expected types.
 * NOTE: Domain types for biometrics were not found; using inferred structures based on controller usage.
 */

import { Result, Ok, Err } from "ts-results";
// import { ValidationError } from '@domain/errors/validation';

// --- Inferred Types & Enums (Based on BiometricStreamController.ts usage) ---

// Assuming BiometricType is a string literal union based on defaultThresholds keys
type BiometricType =
  | "heartRate"
  | "bloodPressureSystolic"
  | "bloodPressureDiastolic"
  | "respiratoryRate"
  | "bodyTemperature"
  | "oxygenSaturation"
  | "bloodGlucose"
  | "cortisol"
  | "sleepQuality"
  | "eegThetaPower"
  | "motionActivity";

// Assuming AlertPriority is a string literal union based on defaultThresholds values
type AlertPriority = "informational" | "warning" | "urgent";

// Assuming BiometricSource is a string literal union based on config.sources
type BiometricSource = "wearable" | "mobile" | "clinical"; // Add others if needed

// Inferred structure for BiometricThreshold based on defaultThresholds values
interface BiometricThreshold {
  min: number;
  max: number;
  label: string;
  priority: AlertPriority;
}

// Inferred structure for BiometricDataPoint based on generateSimulatedDataPoint
interface BiometricDataPoint {
  id: string;
  streamId: string;
  timestamp: Date | number | string; // Allow multiple types initially, refine if possible
  value: number;
  type: BiometricType;
  source: BiometricSource;
  quality: "high" | "medium" | "low"; // Assuming based on simulation
}

// Local StreamConfig interface from the controller
interface StreamConfig {
  sampleRate: number;
  bufferSize: number;
  alertThresholds: Map<BiometricType, BiometricThreshold[]>;
  correlationWindow: number;
  sources: BiometricSource[];
  streamIds: string[];
  normalizeData: boolean;
  filterOutliers: boolean;
}
type PartialStreamConfig = Partial<StreamConfig>;

// --- Type Guards ---

function isBiometricType(value: unknown): value is BiometricType {
  const validTypes: BiometricType[] = [
    "heartRate",
    "bloodPressureSystolic",
    "bloodPressureDiastolic",
    "respiratoryRate",
    "bodyTemperature",
    "oxygenSaturation",
    "bloodGlucose",
    "cortisol",
    "sleepQuality",
    "eegThetaPower",
    "motionActivity",
  ];
  return (
    typeof value === "string" && validTypes.includes(value as BiometricType)
  );
}

function isAlertPriority(value: unknown): value is AlertPriority {
  const validPriorities: AlertPriority[] = [
    "informational",
    "warning",
    "urgent",
  ];
  return (
    typeof value === "string" &&
    validPriorities.includes(value as AlertPriority)
  );
}

function isBiometricThreshold(obj: unknown): obj is BiometricThreshold {
  if (typeof obj !== "object" || obj === null) return false;
  const threshold = obj as Partial<BiometricThreshold>;
  return (
    typeof threshold.min === "number" &&
    typeof threshold.max === "number" &&
    typeof threshold.label === "string" &&
    isAlertPriority(threshold.priority)
  );
}

function isBiometricDataPoint(obj: unknown): obj is BiometricDataPoint {
  if (typeof obj !== "object" || obj === null) return false;
  const dp = obj as Partial<BiometricDataPoint>;
  // Check if timestamp is a valid Date object or a valid number (timestamp)
  const isTimestampNumber =
    typeof dp.timestamp === "number" && !isNaN(dp.timestamp);
  const isTimestampDateObject =
    dp.timestamp instanceof Date && !isNaN(dp.timestamp.getTime());
  const timestampValid = isTimestampNumber || isTimestampDateObject; // Removed broad string check
  const qualityValid =
    typeof dp.quality === "string" &&
    ["high", "medium", "low"].includes(dp.quality);

  return (
    typeof dp.id === "string" &&
    typeof dp.streamId === "string" &&
    timestampValid &&
    typeof dp.value === "number" &&
    isBiometricType(dp.type) &&
    typeof dp.source === "string" && // Assuming BiometricSource is string for now
    qualityValid
  );
}

function isBiometricSource(value: unknown): value is BiometricSource {
  const validSources: BiometricSource[] = ["wearable", "mobile", "clinical"];
  return (
    typeof value === "string" && validSources.includes(value as BiometricSource)
  );
}

// --- Validation Functions ---

/**
 * Validates the structure and types of incoming BiometricDataPoint.
 * @param data - The data point to validate.
 * @returns Result<BiometricDataPoint, Error>
 */
export function validateBiometricData(
  data: unknown,
): Result<BiometricDataPoint, Error> {
  if (isBiometricDataPoint(data)) {
    return Ok(data);
  }
  return Err(new Error("Invalid BiometricDataPoint structure."));
}

/**
 * Validates the structure and types of Partial<StreamConfig>.
 * @param config - The partial configuration object to validate.
 * @returns Result<PartialStreamConfig, Error>
 */
export function validatePartialStreamConfig(
  config: unknown,
): Result<PartialStreamConfig, Error> {
  if (typeof config !== "object" || config === null) {
    return Err(
      new Error("Invalid Partial<StreamConfig>: Input must be an object."),
    );
  }
  const cfg = config as PartialStreamConfig;

  // Validate individual fields if they exist
  if (
    cfg.sampleRate !== undefined &&
    (typeof cfg.sampleRate !== "number" || cfg.sampleRate <= 0)
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: sampleRate must be a positive number.",
      ),
    );
  }
  if (
    cfg.bufferSize !== undefined &&
    (typeof cfg.bufferSize !== "number" || cfg.bufferSize <= 0)
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: bufferSize must be a positive number.",
      ),
    );
  }
  if (
    cfg.correlationWindow !== undefined &&
    (typeof cfg.correlationWindow !== "number" || cfg.correlationWindow <= 0)
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: correlationWindow must be a positive number.",
      ),
    );
  }
  if (
    cfg.normalizeData !== undefined &&
    typeof cfg.normalizeData !== "boolean"
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: normalizeData must be a boolean.",
      ),
    );
  }
  if (
    cfg.filterOutliers !== undefined &&
    typeof cfg.filterOutliers !== "boolean"
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: filterOutliers must be a boolean.",
      ),
    );
  }
  if (
    cfg.streamIds !== undefined &&
    (!Array.isArray(cfg.streamIds) ||
      !cfg.streamIds.every((id) => typeof id === "string"))
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: streamIds must be an array of strings.",
      ),
    );
  }
  if (
    cfg.sources !== undefined &&
    (!Array.isArray(cfg.sources) || !cfg.sources.every(isBiometricSource))
  ) {
    return Err(
      new Error(
        "Invalid Partial<StreamConfig>: sources must be an array of valid BiometricSource values.",
      ),
    );
  }
  if (cfg.alertThresholds !== undefined) {
    if (!(cfg.alertThresholds instanceof Map)) {
      return Err(
        new Error(
          "Invalid Partial<StreamConfig>: alertThresholds must be a Map.",
        ),
      );
    }
    for (const [key, value] of cfg.alertThresholds.entries()) {
      if (!isBiometricType(key)) {
        return Err(
          new Error(
            `Invalid Partial<StreamConfig>: Invalid key "${key}" in alertThresholds Map.`,
          ),
        );
      }
      if (!Array.isArray(value) || !value.every(isBiometricThreshold)) {
        return Err(
          new Error(
            `Invalid Partial<StreamConfig>: Invalid threshold array for key "${key}" in alertThresholds Map.`,
          ),
        );
      }
    }
  }

  return Ok(cfg);
}

// Removed original validateStreamConfiguration as it's replaced by validatePartialStreamConfig
