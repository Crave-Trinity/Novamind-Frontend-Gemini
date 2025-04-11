/**
 * NOVAMIND Neural-Safe Type Definitions
 * Brain Model Visualization Types with quantum-level type safety
 */

// Removed conflicting/incorrect external type imports.
// Import ONLY RenderMode as it might be needed by remaining code (though its factory is removed).
// import { RenderMode } from '@domain/types/brain/visualization'; // Commented out as factories using it are removed

// Neural-safe vector type
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Brain region with clinical-precision typing
export interface BrainRegion {
  id: string;
  name: string;
  position: Vector3;
  color: string;
  connections: string[]; // IDs of connected regions
  activityLevel: number; // Normalized activity level
  volumeMl?: number; // Optional volume
  isActive: boolean; // Is the region currently active/relevant
  riskFactor?: number; // Optional associated risk factor
  // Added missing properties based on usage in factories/validators if needed
  hemisphereLocation?: 'left' | 'right' | 'central' | 'other';
  dataConfidence?: number;
  volume?: number; // Potentially redundant with volumeMl, clarify usage
  activity?: number; // Potentially redundant with activityLevel, clarify usage
  description?: string;
  functions?: string[];
  size?: number;
  scale?: number;
  data?: {
    // Nested data structure seen in BrainModel factory usage
    activity: number;
    anomalies: string[];
    volumes: {
      current: number;
      expected: number;
      percentile: number;
    };
  };
}

// Comprehensive brain model with neural-safe typing
export interface BrainModel {
  id: string;
  name: string;
  regions: BrainRegion[];
  connections: Connection[];
  patients?: string[];
  modelType?: string;
  anatomicalCoordinates?: Coordinate[];
  // Removed settings property from interface
  // Added missing properties based on factory/validator usage if needed
  version?: number | string; // Allow string or number based on different usages seen
  patientId?: string;
  scanDate?: Date | string; // Allow Date or string
  isTemplate?: boolean;
  metadata?: any; // Use 'any' for now, refine if specific structure is known
  lastUpdated?: Date | string;
  createdBy?: string;
  updatedBy?: string;
  scan?: any; // Use 'any' for now as BrainScan interface is removed
}

// Neural connection between regions
export interface Connection {
  id: string;
  sourceId: string; // Reverted back from sourceRegionId
  targetId: string; // Reverted back from targetRegionId
  strength: number; // Connection strength/weight
  type: 'excitatory' | 'inhibitory' | string; // Allow specific types or general string
  isActive: boolean; // Is the connection currently active
  color?: string; // Optional color
  connectionType?: string; // Optional specific type (e.g., 'structural', 'functional')
  // Added missing properties based on factory/validator usage if needed
  directionality?: 'unidirectional' | 'bidirectional';
  activityLevel?: number;
  pathwayLength?: number;
  dataConfidence?: number;
}

export interface Coordinate {
  x: number;
  y: number;
  z: number;
  label: string;
}

// Type guard for brain regions
export function isBrainRegion(obj: unknown): obj is BrainRegion {
  if (!obj || typeof obj !== 'object') return false;

  const region = obj as Partial<BrainRegion>;

  return (
    typeof region.id === 'string' &&
    typeof region.name === 'string' &&
    typeof region.activityLevel === 'number' &&
    typeof region.isActive === 'boolean' &&
    Array.isArray(region.connections)
  );
}

// Type guard for brain model
export function isBrainModel(obj: unknown): obj is BrainModel {
  if (!obj || typeof obj !== 'object') return false;

  const model = obj as Partial<BrainModel>;

  return (
    typeof model.id === 'string' &&
    typeof model.name === 'string' &&
    Array.isArray(model.regions) &&
    Array.isArray(model.connections)
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
    return this.isEmpty() ? defaultValue : this.get();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  map<U>(callback: (item: T, index: number) => U): U[] {
    const result: U[] = [];
    for (let i = 0; i < this.items.length; i++) {
      result.push(callback(this.items[i], i));
    }
    return result;
  }

  filter(predicate: (item: T) => boolean): SafeArray<T> {
    const filtered: T[] = [];
    for (const item of this.items) {
      if (predicate(item)) {
        filtered.push(item);
      }
    }
    return new SafeArray(filtered);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    for (const item of this.items) {
      if (predicate(item)) {
        return item;
      }
    }
    return undefined;
  }

  forEach(callback: (item: T, index: number) => void): void {
    for (let i = 0; i < this.items.length; i++) {
      callback(this.items[i], i);
    }
  }

  add(item: T): void {
    this.items.push(item);
  }

  size(): number {
    return this.items.length;
  }
}

// Custom implementation of NeuralVisualizationError class
export class NeuralVisualizationError extends Error {
  // Confirmed unimplemented interface is removed
  code: string;
  severity: 'warning' | 'error' | 'fatal';
  component?: string;
  timestamp: number;

  constructor(
    message: string,
    options: {
      code: string;
      severity?: 'warning' | 'error' | 'fatal';
      component?: string;
    } = { code: 'VISUALIZATION_ERROR' }
  ) {
    super(message);
    this.name = 'NeuralVisualizationError';
    this.message = message;
    this.code = options.code;
    this.severity = options.severity || 'error';
    this.component = options.component;
    this.timestamp = Date.now();
  }
}

// Neural-safe factory functions to provide value implementations for interfaces

/**
 * Create a brain region with clinical defaults
 */
export const BrainRegion = {
  create(data: Partial<BrainRegion> = {}): BrainRegion {
    // Neural-safe properties with strict null handling
    const region: BrainRegion = {
      id: data.id || `region-${Math.random().toString(36).substring(2, 9)}`,
      name: data.name || 'Unnamed Region',
      position: data.position || { x: 0, y: 0, z: 0 },
      color: data.color || '#CCCCCC',
      connections: data.connections || [],
      activityLevel: data.activityLevel ?? 0,
      isActive: data.isActive ?? false,
    };

    // Handle optional properties with type safety
    if (data.volumeMl !== undefined) region.volumeMl = data.volumeMl;
    if (data.riskFactor !== undefined) region.riskFactor = data.riskFactor;

    return region;
  },
};

/**
 * Create a Vector3 with defaults
 */
export const Vector3Factory = {
  create(x = 0, y = 0, z = 0): Vector3 {
    return { x, y, z };
  },
  zero(): Vector3 {
    return { x: 0, y: 0, z: 0 };
  },
};

// Removed external factory functions (BrainScanFactory, VisualizationSettingsFactory, etc.)

/**
 * Brain processor function that converts raw data to a neurologically-valid model
 */
export const BrainModelFactory = (data: any = {}): BrainModel => {
  // Generate a default processed model with clinical precision
  const defaultModel: BrainModel = {
    id: data.id || `model-${Date.now()}`,
    name: data.name || 'Default Brain Model',
    regions: [], // Initialize regions
    connections: [], // Initialize connections
  };

  // Process regions if provided
  const processedRegions = Array.isArray(data.regions)
    ? data.regions.map((r: any) => BrainRegion.create(r)) // Use the local BrainRegion factory
    : [];

  return {
    ...defaultModel,
    ...data,
    regions: processedRegions,
    // Removed settings property assignment
  };
};
