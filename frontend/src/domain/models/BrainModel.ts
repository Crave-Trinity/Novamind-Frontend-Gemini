/**
 * Core domain models for brain visualization and digital twin functionality.
 * These models align with the HIPAA-compliant Digital Twin architecture.
 */

/**
 * Vector3D represents a position in 3D space
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Connection represents a neural connection between brain regions
 */
export interface Connection {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  strength: number; // 0.0 to 1.0
  type: ConnectionType;
  isActive?: boolean;
}

/**
 * Brain region model representing different areas of the brain
 * for visualization and interaction in the Digital Twin.
 */
export interface BrainRegion {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number, number]; // [x, y, z]
  size: number;
  color: string;
  volume?: number; // Volume of the region for scaling visualization
  significance: number; // Clinical significance (0-1)
  connections: string[]; // Array of region IDs this region connects to
  functions: string[];
  data?: {
    activity?: number;
    anomalies?: string[];
    volumes?: {
      current: number;
      expected: number;
      percentile: number;
    };
  };
  position?: [number, number, number]; // Alternative position format
  scale?: number;  // Added for visualization scaling
}

/**
 * Render properties for visualization
 */
export interface RenderProperties {
  color: string;
  opacity: number;
  visible: boolean;
  highlightColor: string;
}

/**
 * Complete brain model for visualization
 */
export interface BrainModel {
  id: string;
  patientId: string;
  regions: BrainRegion[];
  pathways: NeuralPathway[];
  timestamp: string;
  metadata: {
    modelVersion: string;
    confidenceScore: number;
    dataQuality: number;
    source?: ModelSource;
  };
}

/**
 * Neural pathway representing connections between brain regions
 */
export interface NeuralPathway {
  id: string;
  sourceId: string; // Source brain region
  targetId: string; // Target brain region
  strength: number; // Connection strength (0-1)
  type: 'excitatory' | 'inhibitory';
  significance: number; // Clinical significance level
  isActive: boolean;
}

/**
 * Brain activity data for temporal visualization
 */
export interface BrainActivity {
  regionId: string;
  timestamps: string[];
  values: number[]; // Activity levels
  baseline: number;
  anomalyThreshold: number;
  clinicalSignificance: number;
}

/**
 * View state for brain visualization component
 */
export interface BrainViewState {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  zoom: number;
  highlightedRegions: string[];
  visiblePathways: boolean;
  renderMode: RenderMode;
  transparencyLevel: number;
  focusPoint: [number, number, number] | null;
}

/**
 * Rendering modes for brain visualization
 */
export enum RenderMode {
  NORMAL = 'normal',
  ANATOMICAL = 'anatomical',
  FUNCTIONAL = 'functional',
  CONNECTIVITY = 'connectivity',
  ACTIVITY = 'activity',
  ANOMALY = 'anomaly',
  TREATMENT_RESPONSE = 'treatment_response'
}

/**
 * Connection types between brain regions
 */
export enum ConnectionType {
  STRUCTURAL = 'structural',
  FUNCTIONAL = 'functional',
  EFFECTIVE = 'effective'
}

/**
 * Brain function types
 */
export enum BrainFunction {
  EMOTION_REGULATION = 'emotion_regulation',
  EXECUTIVE_FUNCTION = 'executive_function',
  MEMORY = 'memory',
  ATTENTION = 'attention',
  REWARD_PROCESSING = 'reward_processing',
  LANGUAGE = 'language',
  MOTOR = 'motor',
  SENSORY = 'sensory'
}

/**
 * Sources of brain model data
 */
export enum ModelSource {
  NEUROIMAGING = 'neuroimaging',
  SIMULATION = 'simulation',
  POPULATION_AVERAGE = 'population_average',
  MACHINE_LEARNING = 'machine_learning'
}
