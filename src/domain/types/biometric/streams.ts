/**
 * NOVAMIND Neural-Safe Biometric Stream Type Definitions
 * Defines types related to biometric data streams with clinical precision.
 */

// Basic identifier type (assuming it might be used, import if needed from shared/common)
export type ID = string;

// Define possible biometric sources
export type BiometricSource =
  | "wearable"
  | "mobile"
  | "clinical"
  | "manual_entry"
  | "simulation";

// Define possible biometric types
export type BiometricType =
  | "heartRate"
  | "bloodPressureSystolic"
  | "bloodPressureDiastolic"
  | "respiratoryRate"
  | "bodyTemperature"
  | "oxygenSaturation"
  | "bloodGlucose"
  | "cortisol"
  | "sleepQuality"
  | "eegThetaPower" // Example EEG metric
  | "motionActivity"; // Example motion metric

// Define alert priorities
export type AlertPriority = "informational" | "warning" | "urgent";

// Define alert sources (if different from BiometricSource)
export type AlertSource = "system" | "clinician" | "patient" | "algorithm"; // Added "algorithm"

// Define structure for alert thresholds
export interface BiometricThreshold {
  min: number;
  max: number;
  label: string;
  priority: AlertPriority;
  durationThreshold?: number; // Optional: minimum duration in seconds to trigger alert
}

// Define structure for a single biometric data point
export interface BiometricDataPoint {
  id: ID;
  streamId: ID;
  timestamp: Date | number; // Allow Date object or timestamp number
  value: number;
  type: BiometricType;
  source: BiometricSource;
  quality: "high" | "medium" | "low";
  metadata?: Record<string, unknown>; // Replaced 'any' with 'unknown'
  flags?: string[]; // Added optional flags property based on TS error
}

// Define structure for a biometric stream's metadata
export interface BiometricStream {
  id: ID;
  patientId: ID;
  type: BiometricType;
  source: BiometricSource;
  name: string;
  description?: string;
  unit: string; // e.g., 'bpm', 'mmHg', 'breaths/min', '°C', '%', 'mg/dL'
  sampleRate?: number; // Samples per minute (if applicable)
  isActive: boolean;
  lastDataPointTimestamp?: Date | null;
}

// Define structure for biometric alerts
export interface BiometricAlert {
  id: ID;
  patientId: ID;
  streamId: ID;
  type: BiometricType; // Keep 'type' for consistency if used elsewhere
  biometricType: BiometricType; // Added based on TS error
  timestamp: Date;
  priority: AlertPriority;
  message: string;
  triggeringValue: number;
  threshold: BiometricThreshold;
  dataPointId?: ID; // Added based on TS error
  source?: AlertSource; // Added based on TS error
  acknowledged: boolean;
  acknowledgedAt?: Date | null;
  acknowledgedBy?: ID | null; // User ID
  notes?: string;
}

// Type guards (optional but recommended for type safety)
export function isBiometricDataPoint(obj: unknown): obj is BiometricDataPoint {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "streamId" in obj &&
    "timestamp" in obj &&
    "value" in obj &&
    "type" in obj &&
    "source" in obj &&
    "quality" in obj
  );
}

export function isBiometricStream(obj: unknown): obj is BiometricStream {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "patientId" in obj &&
    "type" in obj &&
    "source" in obj &&
    "name" in obj &&
    "unit" in obj &&
    "isActive" in obj
  );
}
