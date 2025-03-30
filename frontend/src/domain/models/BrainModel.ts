/**
 * Brain Model Domain Types
 * Defines data structures for brain visualization
 */

/**
 * Render modes for the brain visualization
 */
export enum RenderMode {
  ANATOMICAL = "anatomical",
  FUNCTIONAL = "functional",
  ACTIVITY = "activity",
  SIGNIFICANCE = "significance",
  CONNECTIVITY = "connectivity",
  ANOMALY = "anomaly",
  TREATMENT_RESPONSE = "treatment_response",
}

/**
 * Source of model data
 */
export enum ModelSource {
  MRI = "mri",
  FMRI = "fmri",
  DTI = "dti",
  EEG = "eeg",
  SIMULATION = "simulation",
  AGGREGATE = "aggregate",
}

/**
 * Brain region representing a distinct anatomical area
 */
export interface BrainRegion {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number, number]; // 3D position
  position: [number, number, number]; // Might be redundant with coordinates
  size: number;
  scale: number;
  color: string;
  volume: number;
  significance: number; // Clinical significance score
  connections: string[]; // IDs of connected regions
  functions: string[]; // Primary functions (e.g., "memory", "emotion")
  data: {
    activity: number;
    anomalies: string[];
    volumes: {
      current: number;
      expected: number;
      percentile: number;
    };
  };
}

/**
 * Neural pathway connecting regions
 */
export interface NeuralPathway {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  type: "excitatory" | "inhibitory";
  significance: number;
  isActive: boolean;
}

/**
 * Brain model metadata
 */
export interface BrainModelMetadata {
  modelVersion: string;
  confidenceScore: number;
  dataQuality: number;
  source: ModelSource;
}

/**
 * Complete brain model
 */
export interface BrainModel {
  id: string;
  patientId: string;
  regions: BrainRegion[];
  pathways: NeuralPathway[];
  timestamp: string; // ISO date
  metadata: BrainModelMetadata;
}

/**
 * View state for 3D visualization
 */
export interface BrainViewState {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  zoom: number;
  highlightedRegions: string[]; // IDs of highlighted regions
  visiblePathways: boolean;
  renderMode: RenderMode;
  transparencyLevel: number;
  focusPoint: [number, number, number] | null;
}
