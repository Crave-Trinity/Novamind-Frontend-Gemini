/**
 * NOVAMIND Neural-Safe Domain Types
 * Brain Activity Models - Quantum-level types for neural activation
 * with clinical precision and mathematical integrity
 */

import { Vector3 } from 'three';
import { Result } from '../common';

/**
 * Neural activation level classifications
 * Provides precise categorization of neural activity
 */
export enum ActivationLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme'
}

/**
 * Neural activity state
 * Represents the current state of a neural region or connection
 */
export interface NeuralActivityState {
  // Core properties
  entityId: string;
  entityType: 'region' | 'connection';
  timestamp: number;
  
  // Activity metrics
  rawActivity: number; // Normalized 0.0-1.0
  activationLevel: ActivationLevel;
  activationDuration: number; // Duration in milliseconds
  
  // Clinical metadata
  relatedSymptoms?: string[]; // IDs of related symptoms
  relatedDiagnoses?: string[]; // IDs of related diagnoses
  clinicalSignificance?: number; // 0.0-1.0 clinical relevance
  confidenceInterval?: [number, number]; // 95% confidence interval
}

/**
 * Neural activation pattern
 * Defines pattern of activation across multiple regions/connections
 */
export interface NeuralActivationPattern {
  id: string;
  name: string;
  description?: string;
  regionActivations: Array<{
    regionId: string;
    activityLevel: number; // 0.0-1.0
    primaryEffect: boolean; // Is this a primary effect region?
  }>;
  connectionActivations?: Array<{
    connectionId: string;
    activityLevel: number; // 0.0-1.0
    primaryEffect: boolean; // Is this a primary effect connection?
  }>;
  // Clinical context
  clinicalSignificance: number; // 0.0-1.0
  evidenceLevel: 'established' | 'emerging' | 'theoretical';
  references?: string[]; // Scientific references
}

/**
 * Neural state transition
 * Represents a change in neural activity state over time
 */
export interface NeuralStateTransition {
  id: string;
  entityId: string;
  entityType: 'region' | 'connection';
  startState: NeuralActivityState;
  endState: NeuralActivityState;
  transitionDuration: number; // Duration in milliseconds
  transitionType: 'gradual' | 'abrupt' | 'oscillating';
  // Clinical significance
  clinicallySignificant: boolean;
  associatedEvent?: string; // e.g., "medication administration", "stress trigger"
}

/**
 * Temporal neural activation sequence
 * Represents a sequence of neural activations over time
 */
export interface TemporalActivationSequence {
  id: string;
  name: string;
  description?: string;
  // Sequence of activation states
  timeSteps: Array<{
    timeOffset: number; // Time offset in milliseconds from sequence start
    activationStates: NeuralActivityState[];
  }>;
  // Clinical metadata
  associatedCondition?: string;
  clinicalSignificance: number; // 0.0-1.0
  evidenceLevel: 'established' | 'emerging' | 'theoretical';
}

/**
 * Neural activity heatmap
 * Spatial representation of activity levels across the brain
 */
export interface NeuralActivityHeatmap {
  id: string;
  timestamp: number;
  // Spatial data
  resolution: Vector3; // Resolution of the heatmap (x, y, z)
  dimensions: Vector3; // Dimensions of the heatmap volume
  intensityValues: Float32Array; // 3D array flattened to 1D for efficiency
  // Clinical metadata
  associatedCondition?: string;
  clinicalSignificance: number; // 0.0-1.0
}

/**
 * Neural activity visualization settings
 * Controls for neural activity visualization
 */
export interface ActivityVisualizationSettings {
  // Display thresholds
  minDisplayThreshold: number; // Minimum activity level to display (0.0-1.0)
  highActivityThreshold: number; // Threshold for high activity (0.0-1.0)
  
  // Color mapping
  colorMapName: 'clinical' | 'heatmap' | 'spectral' | 'custom';
  customColorMap?: Record<number, string>; // Custom color mapping
  
  // Visual effects
  usePulsation: boolean; // Pulsate regions based on activity
  pulsationSpeed: number; // Speed of pulsation
  useGlow: boolean; // Add glow effect to active regions
  glowIntensity: number; // Intensity of glow effect (0.0-1.0)
  
  // Temporal settings
  temporalSmoothingFactor: number; // Smoothing factor for temporal changes (0.0-1.0)
  temporalScale: number; // Scale factor for temporal visualization
  
  // Clinical settings
  showConfidenceIntervals: boolean; // Show confidence intervals for activity
  highlightClinicallySignificant: boolean; // Highlight clinically significant activity
}

/**
 * Functions for neural activity calculations
 */

/**
 * Calculate activation level from raw activity value
 */
export function calculateActivationLevel(rawActivity: number): ActivationLevel {
  if (rawActivity < 0.1) return ActivationLevel.NONE;
  if (rawActivity < 0.3) return ActivationLevel.LOW;
  if (rawActivity < 0.6) return ActivationLevel.MEDIUM;
  if (rawActivity < 0.9) return ActivationLevel.HIGH;
  return ActivationLevel.EXTREME;
}

/**
 * Generate clinical significance score based on activity pattern
 */
export function calculateClinicalSignificance(
  activationPattern: NeuralActivationPattern,
  patientRiskFactors: string[] = []
): Result<number> {
  // This would be a complex algorithm in practice
  // Simplified implementation for demonstration
  
  let baseSignificance = 0;
  
  // Calculate base significance from primary effect regions
  const primaryRegions = activationPattern.regionActivations.filter(r => r.primaryEffect);
  if (primaryRegions.length > 0) {
    const avgPrimaryActivity = primaryRegions.reduce((sum, r) => sum + r.activityLevel, 0) / primaryRegions.length;
    baseSignificance = avgPrimaryActivity * 0.7; // Primary regions contribute 70% of base score
  }
  
  // Add contribution from secondary regions
  const secondaryRegions = activationPattern.regionActivations.filter(r => !r.primaryEffect);
  if (secondaryRegions.length > 0) {
    const avgSecondaryActivity = secondaryRegions.reduce((sum, r) => sum + r.activityLevel, 0) / secondaryRegions.length;
    baseSignificance += avgSecondaryActivity * 0.3; // Secondary regions contribute 30%
  }
  
  // Apply evidence level modifier
  const evidenceModifier = 
    activationPattern.evidenceLevel === 'established' ? 1.0 :
    activationPattern.evidenceLevel === 'emerging' ? 0.8 : 0.5;
  
  // Apply risk factor modifier
  const riskFactorCount = patientRiskFactors.length;
  const riskModifier = Math.min(1.0 + (riskFactorCount * 0.05), 1.5); // Max 50% increase
  
  // Calculate final significance score
  const clinicalSignificance = Math.min(baseSignificance * evidenceModifier * riskModifier, 1.0);
  
  return {
    success: true,
    data: clinicalSignificance
  };
}
