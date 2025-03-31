/**
 * NOVAMIND Neural-Safe Type Definitions
 * Brain Model Visualization Types with quantum-level type safety
 */

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
}

// Neural-safe vector type
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Brain scan metadata with clinical precision
export interface BrainScan {
  patientId: string;
  scanDate: string;
  scanType: 'fMRI' | 'PET' | 'MRI' | 'DTI';
  notes?: string;
  technician?: string;
}

// Digital Twin visualization modes
export enum RenderMode {
  NORMAL = 'normal',
  ACTIVITY = 'activity',
  CONNECTIVITY = 'connectivity',
  RISK = 'risk',
  TREATMENT_RESPONSE = 'treatment_response'
}

// Neural-safe visualization settings
export interface VisualizationSettings {
  showLabels: boolean;
  rotationSpeed: number;
  highlightColor: string;
  backgroundColor: string;
  connectionOpacity: number;
  nodeSize: number;
  renderMode: RenderMode;
  enableBloom: boolean;
  synapticPulse: boolean;
}

// Comprehensive brain model with neural-safe typing
export interface BrainModel {
  regions: BrainRegion[];
  scan?: BrainScan;
  settings: VisualizationSettings;
  patientMetadata?: PatientMetadata;
}

// Patient metadata with HIPAA-compliant typing
export interface PatientMetadata {
  id: string;
  age: number;
  biologicalSex: 'male' | 'female' | 'other';
  diagnosis?: string[];
  medications?: Medication[];
  riskLevel?: 'low' | 'moderate' | 'high' | 'severe';
}

// Medication with clinical precision typing
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  adherence?: number; // 0-100%
}

// Treatment response prediction typing
export interface TreatmentResponse {
  treatmentId: string;
  treatmentName: string;
  responseProbability: number;
  timeToEffect: number; // days
  sideEffectRisk: number; // 0-100%
  confidenceInterval: [number, number]; // [lower, upper]
  neuroplasticityImpact?: number;
}

// Neural activity time series with type safety
export interface ActivityTimeSeries {
  regionId: string;
  timestamps: number[];
  values: number[];
}

// Neural-safe error type
export type NeuralVisualizationError = {
  code: string;
  message: string;
  severity: 'warning' | 'error' | 'fatal';
  component?: string;
  timestamp: number;
};

// Type guard for brain regions
export function isBrainRegion(obj: unknown): obj is BrainRegion {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'position' in obj &&
    'isActive' in obj
  );
}

// Type guard for brain model
export function isBrainModel(obj: unknown): obj is BrainModel {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'regions' in obj &&
    'settings' in obj &&
    Array.isArray((obj as BrainModel).regions)
  );
}

// Neural-safe array wrapper to prevent null reference errors
export class SafeArray<T> {
  private items: T[];

  constructor(items?: T[] | null) {
    this.items = items || [];
  }

  get(): T[] {
    return [...this.items];
  }

  getOrDefault(defaultValue: T[]): T[] {
    return this.items.length > 0 ? [...this.items] : defaultValue;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  map<U>(callback: (item: T, index: number) => U): U[] {
    return this.items.map(callback);
  }

  filter(predicate: (item: T) => boolean): SafeArray<T> {
    return new SafeArray(this.items.filter(predicate));
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  add(item: T): void {
    this.items.push(item);
  }

  size(): number {
    return this.items.length;
  }
}
