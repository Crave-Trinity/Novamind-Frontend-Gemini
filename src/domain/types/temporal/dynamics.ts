/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Temporal Dynamics Types
 * Defines structures for analyzing time-based patterns in neural and clinical data.
 */

// Represents the scale for temporal analysis - Unified Definition
export type TimeScale = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'realtime'; // Changed 'yearly' to 'realtime'

// Placeholder interface for detected temporal patterns - structure needs refinement
export interface TemporalPattern {
  id: string;
  type: string; // e.g., 'oscillation', 'trend', 'spike', 'correlation_shift'
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  involvedStreams: string[]; // e.g., biometric stream IDs, region IDs
  significance: number; // Statistical significance or confidence
  description: string; // Human-readable description
  metadata?: Record<string, any>;
}

// Placeholder interface for raw temporal dynamics data - structure needs refinement
export interface TemporalDynamics {
  id: string;
  timestamps: number[];
  values: Record<string, number[]>; // Example: { regionId: [activityLevels] }
  metadata?: Record<string, any>;
}

// Add other related temporal types here if needed
