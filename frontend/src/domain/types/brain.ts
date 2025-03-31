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
  scanType: "fMRI" | "PET" | "MRI" | "DTI";
  notes?: string;
  technician?: string;
}

// Digital Twin visualization modes
export enum RenderMode {
  NORMAL = "normal",
  ACTIVITY = "activity",
  CONNECTIVITY = "connectivity",
  RISK = "risk",
  TREATMENT_RESPONSE = "treatment_response",
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
export interface BrainModelData {
  regions: BrainRegion[];
  scan?: BrainScan;
  settings: VisualizationSettings;
  patientMetadata?: PatientMetadata;
}

// Patient metadata with HIPAA-compliant typing
export interface PatientMetadata {
  id: string;
  age: number;
  biologicalSex: "male" | "female" | "other";
  diagnosis?: string[];
  medications?: Medication[];
  riskLevel?: "low" | "moderate" | "high" | "severe";
}

// Medication with clinical precision typing
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  adherence?: number;
}

// Treatment response prediction typing
export interface TreatmentResponse {
  treatmentId: string;
  treatmentName: string;
  responseProbability: number;
  timeToEffect: number;
  sideEffectRisk: number;
  confidenceInterval: [number, number];
  neuroplasticityImpact?: number;
}

// Neural activity time series with type safety
export interface ActivityTimeSeries {
  regionId: string;
  timestamps: number[];
  values: number[];
}

// Neural-safe error type
export interface NeuralVisualizationErrorInterface {
  code: string;
  message: string;
  severity: "warning" | "error" | "fatal";
  component?: string;
  timestamp: number;
}

// Type guard for brain regions
export function isBrainRegion(obj: unknown): obj is BrainRegion {
  if (!obj || typeof obj !== "object") return false;
  const region = obj as Partial<BrainRegion>;
  return (
    typeof region.id === "string" &&
    typeof region.name === "string" &&
    typeof region.activityLevel === "number"
  );
}

// Type guard for brain model
export function isBrainModel(obj: unknown): obj is BrainModelData {
  if (!obj || typeof obj !== "object") return false;
  const model = obj as Partial<BrainModelData>;
  return Array.isArray(model.regions) && model.regions.every(isBrainRegion);
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
export class NeuralVisualizationError
  extends Error
  implements NeuralVisualizationErrorInterface
{
  code: string;
  severity: "warning" | "error" | "fatal";
  component?: string;
  timestamp: number;

  constructor(
    message: string,
    options: {
      code: string;
      severity?: "warning" | "error" | "fatal";
      component?: string;
    } = { code: "VISUALIZATION_ERROR" },
  ) {
    super(message);
    this.name = "NeuralVisualizationError";
    this.message = message;
    this.code = options.code;
    this.severity = options.severity || "error";
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
      name: data.name || "Unnamed Region",
      position: data.position || { x: 0, y: 0, z: 0 },
      color: data.color || "#CCCCCC",
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

/**
 * Create BrainScan with defaults
 */
export const BrainScan = {
  create(data: Partial<BrainScan> = {}): BrainScan {
    // Neural-safe properties with strict null handling
    const scan: BrainScan = {
      patientId: data.patientId || "unknown",
      scanDate: data.scanDate || new Date().toISOString(),
      scanType: data.scanType || "MRI",
    };

    // Handle optional properties with type safety
    if (data.notes !== undefined) scan.notes = data.notes;
    if (data.technician !== undefined) scan.technician = data.technician;

    return scan;
  },
};

/**
 * Create visualization settings with defaults
 */
export const VisualizationSettings = {
  create(data: Partial<VisualizationSettings> = {}): VisualizationSettings {
    return {
      showLabels: data.showLabels ?? true,
      rotationSpeed: data.rotationSpeed ?? 0.5,
      highlightColor: data.highlightColor || "#FF5733",
      backgroundColor: data.backgroundColor || "#121212",
      connectionOpacity: data.connectionOpacity ?? 0.7,
      nodeSize: data.nodeSize ?? 1,
      renderMode: data.renderMode ?? RenderMode.NORMAL,
      enableBloom: data.enableBloom ?? true,
      synapticPulse: data.synapticPulse ?? true,
    };
  },
};

/**
 * Create patient metadata with defaults
 */
export const PatientMetadata = {
  create(data: Partial<PatientMetadata> = {}): PatientMetadata {
    // Neural-safe properties with strict null handling
    const metadata: PatientMetadata = {
      id: data.id || `patient-${Math.random().toString(36).substring(2, 9)}`,
      age: data.age ?? 35,
      biologicalSex: data.biologicalSex || "other",
    };

    // Handle optional properties with type safety
    if (data.diagnosis !== undefined) metadata.diagnosis = data.diagnosis;
    if (data.medications !== undefined) metadata.medications = data.medications;
    if (data.riskLevel !== undefined) metadata.riskLevel = data.riskLevel;

    return metadata;
  },
};

/**
 * Create medication with defaults
 */
export const Medication = {
  create(data: Partial<Medication> = {}): Medication {
    // Neural-safe properties with strict null handling
    const medication: Medication = {
      name: data.name || "Unknown Medication",
      dosage: data.dosage || "0mg",
      frequency: data.frequency || "daily",
      startDate: data.startDate || new Date().toISOString(),
    };

    // Handle optional properties with type safety
    if (data.endDate !== undefined) medication.endDate = data.endDate;
    if (data.adherence !== undefined) medication.adherence = data.adherence;

    return medication;
  },
};

/**
 * Create treatment response with defaults
 */
export const TreatmentResponse = {
  create(data: Partial<TreatmentResponse> = {}): TreatmentResponse {
    // Neural-safe properties with strict null handling
    const response: TreatmentResponse = {
      treatmentId:
        data.treatmentId ||
        `treatment-${Math.random().toString(36).substring(2, 9)}`,
      treatmentName: data.treatmentName || "Unknown Treatment",
      responseProbability: data.responseProbability ?? 0.75,
      timeToEffect: data.timeToEffect ?? 14,
      sideEffectRisk: data.sideEffectRisk ?? 0.15,
      confidenceInterval: data.confidenceInterval || [0.65, 0.85],
    };

    // Handle optional properties with type safety
    if (data.neuroplasticityImpact !== undefined) {
      response.neuroplasticityImpact = data.neuroplasticityImpact;
    }

    return response;
  },
};

/**
 * Create activity time series with defaults
 */
export const ActivityTimeSeries = {
  create(data: Partial<ActivityTimeSeries> = {}): ActivityTimeSeries {
    return {
      regionId: data.regionId || "unknown",
      timestamps: data.timestamps || [Date.now()],
      values: data.values || [0],
    };
  },
};

/**
 * Brain processor function that converts raw data to a neurologically-valid model
 */
export const BrainModel = (data: any = {}): BrainModelData => {
  // Generate a default processed model with clinical precision
  const defaultModel: BrainModelData = {
    regions: [],
    settings: {
      showLabels: true,
      rotationSpeed: 0.5,
      highlightColor: "#FF5733",
      backgroundColor: "#121212",
      connectionOpacity: 0.7,
      nodeSize: 1,
      renderMode: RenderMode.NORMAL,
      enableBloom: true,
      synapticPulse: true,
    },
  };

  // Process regions if provided
  const processedRegions = Array.isArray(data.regions)
    ? data.regions.map((r: any) => BrainRegion.create(r))
    : [];

  return {
    ...defaultModel,
    ...data,
    regions: processedRegions,
    settings: {
      ...defaultModel.settings,
      ...(data.settings || {}),
    },
  };
};
