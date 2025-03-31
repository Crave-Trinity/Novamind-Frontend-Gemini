/**
 * NOVAMIND Neural Brain Model Types
 * Core domain entities for brain visualization with quantum-level type safety
 */

import { Vector3, SafeArray } from "../common";

// Brain region with clinical-precision typing
export interface BrainRegion {
  id: string;
  name: string;
  position: Vector3;
  color: string;
  connections: string[];
  activityLevel: number;
  volumeMl?: number;
  isActive: boolean;
  riskFactor?: number;
  clinicalSignificance?: string;
  hemisphereLocation: "left" | "right" | "central";
  tissueType?: "gray" | "white";
  dataConfidence: number; // 0-1 representing confidence level of data
}

// Neural connection with mathematical precision
export interface NeuralConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 0-1 connection strength
  type: "structural" | "functional" | "effective";
  directionality: "unidirectional" | "bidirectional";
  activityLevel: number;
  pathwayLength?: number; // mm
  dataConfidence: number; // 0-1 representing confidence level of data
}

// Brain scan metadata with clinical precision
export interface BrainScan {
  id: string;
  patientId: string;
  scanDate: string;
  scanType: "fMRI" | "PET" | "MRI" | "DTI" | "EEG" | "MEG";
  resolution?: string;
  scannerModel?: string;
  contrastAgent?: boolean;
  notes?: string;
  technician?: string;
  processingMethod?: string;
  dataQualityScore: number; // 0-1 quality score
}

// Comprehensive brain model with neural-safe typing
export interface BrainModel {
  id: string;
  patientId: string;
  regions: BrainRegion[];
  connections: NeuralConnection[];
  scan: BrainScan;
  timestamp: string;
  version: string;
  algorithmVersion?: string;
  processingLevel: "raw" | "filtered" | "normalized" | "analyzed";
  lastUpdated: string;
}

// Neural activity measurement with mathematical precision
export interface NeuralActivity {
  regionId: string;
  timestamp: string;
  value: number;
  relativeChange?: number; // percent change from baseline
  dataSource: "measured" | "interpolated" | "predicted";
  confidence: number; // 0-1 confidence score
}

// Neural activity time series with type safety
export interface ActivityTimeSeries {
  regionId: string;
  timeUnit: "ms" | "s" | "min" | "hour" | "day";
  startTime: string;
  endTime: string;
  timestamps: number[];
  values: number[];
  sampling: {
    rate: number;
    unit: string;
  };
}

// Region-specific clinical data
export interface RegionClinicalData {
  regionId: string;
  associatedSymptoms: string[];
  associatedConditions: string[];
  treatmentTargetScore: number; // 0-1 representing treatment targeting priority
  abnormalityScore?: number; // 0-1 representing degree of abnormality
  notes?: string;
}

// Type guard for brain regions
export function isBrainRegion(obj: unknown): obj is BrainRegion {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "name" in obj &&
    "position" in obj &&
    "activityLevel" in obj
  );
}

// Type guard for neural connections
export function isNeuralConnection(obj: unknown): obj is NeuralConnection {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "sourceId" in obj &&
    "targetId" in obj &&
    "strength" in obj
  );
}

// Type guard for brain model
export function isBrainModel(obj: unknown): obj is BrainModel {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "regions" in obj &&
    "connections" in obj &&
    "patientId" in obj &&
    Array.isArray((obj as BrainModel).regions) &&
    Array.isArray((obj as BrainModel).connections)
  );
}

// Safe brain model operations
export const BrainModelOps = {
  // Get region by ID with null safety
  getRegion: (model: BrainModel, regionId: string): BrainRegion | undefined => {
    return new SafeArray(model.regions).find(
      (region) => region.id === regionId,
    );
  },

  // Get connection by source and target with null safety
  getConnection: (
    model: BrainModel,
    sourceId: string,
    targetId: string,
  ): NeuralConnection | undefined => {
    return new SafeArray(model.connections).find(
      (conn) => conn.sourceId === sourceId && conn.targetId === targetId,
    );
  },

  // Get connected regions for a specific region with null safety
  getConnectedRegions: (model: BrainModel, regionId: string): BrainRegion[] => {
    const connectedIds = new SafeArray(model.connections)
      .filter(
        (conn) => conn.sourceId === regionId || conn.targetId === regionId,
      )
      .map((conn) =>
        conn.sourceId === regionId ? conn.targetId : conn.sourceId,
      );

    return new SafeArray(model.regions)
      .filter((region) => connectedIds.get().includes(region.id))
      .get();
  },

  // Calculate average activity level with mathematical precision
  calculateAverageActivity: (model: BrainModel): number => {
    const regions = new SafeArray(model.regions);
    if (regions.isEmpty()) return 0;

    const sum = regions.map((r) => r.activityLevel).reduce((a, b) => a + b, 0);
    return sum / regions.size();
  },

  // Get regions by activity threshold with type safety
  getActiveRegions: (model: BrainModel, threshold: number): BrainRegion[] => {
    return new SafeArray(model.regions)
      .filter((region) => region.activityLevel >= threshold)
      .get();
  },
};
