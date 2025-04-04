/**
 * NOVAMIND Neural-Safe Temporal Dynamics Types
 * Placeholder for temporal dynamics data structures.
 */

// Placeholder interface - structure needs to be defined based on actual data/usage
export interface TemporalDynamics {
  id: string;
  timestamps: number[];
  values: Record<string, number[]>; // Example: { regionId: [activityLevels] }
  metadata?: Record<string, any>;
}

// Add other related temporal types here if needed
