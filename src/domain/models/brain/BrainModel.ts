/**
 * Brain Model Domain Types
 * Defines data structures for brain visualization
 */
import type { RenderMode as VisualizationRenderMode } from '@domain/types/brain/visualization'; // Import the correct enum
// Removed unused import: Result
// Removed unused import: Vector3

/*
 * Redundant RenderMode enum removed - using VisualizationRenderMode from types
 */

/**
 * Source of model data
 */
export enum ModelSource {
  MRI = 'mri',
  FMRI = 'fmri',
  DTI = 'dti',
  EEG = 'eeg',
  SIMULATION = 'simulation',
  AGGREGATE = 'aggregate',
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
  color: string; // Consider using a more specific color type if available
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
  type: 'excitatory' | 'inhibitory';
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
export interface BrainModelData {
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
  renderMode: VisualizationRenderMode; // Use the imported enum
  transparencyLevel: number;
  focusPoint: [number, number, number] | null;
}

/**
 * Neural processor for brain model data
 * Takes raw input and processes it into a standardized BrainModelData structure
 */
export const BrainModel = (data: any // eslint-disable-line @typescript-eslint/no-explicit-any = {}): BrainModelData => {
  // Generate a default processed model with clinical precision
  const defaultModel: BrainModelData = {
    id: data.id || `model-${Date.now()}`,
    patientId: data.patientId || 'unknown',
    regions: data.regions || [],
    pathways: data.pathways || [],
    timestamp: data.timestamp || new Date().toISOString(),
    metadata: {
      modelVersion: data.metadata?.modelVersion || '1.0.0',
      confidenceScore: data.metadata?.confidenceScore || 0.95,
      dataQuality: data.metadata?.dataQuality || 0.9,
      source: data.metadata?.source || ModelSource.AGGREGATE,
    },
  };

  // Deep merge input data with default model
  const model = {
    ...defaultModel,
    ...data,
    metadata: {
      ...defaultModel.metadata,
      ...(data.metadata || {}),
    },
  };

  // Process any available data with neural-safe verification
  if (Array.isArray(model.regions)) {
    // Ensure all regions have required fields
    model.regions = model.regions.map((region: BrainRegion) => ({
      // Added type annotation
      id: region.id || `region-${Math.random().toString(36).substr(2, 9)}`,
      name: region.name || 'Unnamed Region',
      description: region.description || '',
      coordinates: region.coordinates || [0, 0, 0],
      position: region.position || region.coordinates || [0, 0, 0],
      size: region.size || 1,
      scale: region.scale || 1,
      color: region.color || '#CCCCCC',
      volume: region.volume || 0,
      significance: region.significance || 0,
      connections: Array.isArray(region.connections) ? region.connections : [],
      functions: Array.isArray(region.functions) ? region.functions : [],
      data: {
        activity: region.data?.activity || 0,
        anomalies: Array.isArray(region.data?.anomalies) ? region.data.anomalies : [],
        volumes: {
          current: region.data?.volumes?.current || 0,
          expected: region.data?.volumes?.expected || 0,
          percentile: region.data?.volumes?.percentile || 50,
        },
      },
    }));
  }

  return model;
};
