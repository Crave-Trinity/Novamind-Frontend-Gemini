/**
 * Core domain types for the Novamind Digital Twin system
 */

// Base types - these are the foundation of our domain model
export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type Insurance = {
  provider: string;
  policyNumber: string;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string[];
  email: string;
  phone: string;
  address: Address;
  insurance: Insurance;
};

export type ScannerMachine = {
  id: string;
  type: string;
  calibrationDate: string;
};

export type BrainScan = {
  id: string;
  patientId: string;
  scanDate: string;
  scanType: 'fMRI' | 'MRI' | 'CT' | 'PET';
  resolution: Vector3D;
  metadata: Record<string, unknown>;
  dataQualityScore: number;
  artifacts: string[];
  notes: string;
  technician: string;
  machine: ScannerMachine;
};

export type RegionMetrics = {
  density: number;
  thickness: number;
  surfaceArea: number;
};

export type BrainRegion = {
  id: string;
  name: string;
  position: Vector3D;
  volume: number;
  activity: number;
  connections: string[];
  color: string;
  activityLevel: 'low' | 'medium' | 'high';
  type: 'cortical' | 'subcortical';
  hemisphere: 'left' | 'right';
  metrics: RegionMetrics;
};

export type ConnectionMetrics = {
  signalSpeed: number;
  bandwidth: number;
  reliability: number;
};

export type NeuralConnection = {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  type: 'excitatory' | 'inhibitory';
  directionality: 'unidirectional' | 'bidirectional';
  metrics: ConnectionMetrics;
  pathPoints: Vector3D[];
};

export type AnalysisResults = {
  overallHealth: number;
  anomalies: string[];
  recommendations: string[];
};

export type BrainModel = {
  id: string;
  patientId: string;
  scan: BrainScan;
  regions: BrainRegion[];
  connections: NeuralConnection[];
  metadata: {
    version: string;
    generatedAt: string;
    algorithm: string;
  };
  analysisResults: AnalysisResults;
};

// Also export any other existing organized types
// Commented out types will be uncommented as they're created or migrated
// export * from './auth';
// export * from './brain';
// export * from './clinical';
// export * from './neural';
// export * from './shared';
// export * from './patient';
// export * from './common';

// Include environment and third-party type declarations
export * from './react-three-fiber.d';
export * from './vite-env.d';
