/**
 * NOVAMIND Neural-Safe Type Definitions
 * Brain Model Domain Types with quantum-level type safety
 */

// Brain region in a fully-typed neural model
export interface BrainRegion {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: string;
  isActive: boolean;
  activityLevel: number;
  volumeMl?: number;
  riskFactor?: number;
}

// Neural connection with typed endpoints
export interface NeuralConnection {
  id: string;
  sourceRegionId: string;
  targetRegionId: string;
  connectionType?: string;
  strength: number;
  isActive: boolean;
  color?: string;
}

// Complete brain model with type-safe regions and connections
export interface BrainModel {
  id: string;
  name: string;
  regions: BrainRegion[];
  connections: NeuralConnection[];
  version: number;
  patientId?: string;
  scanDate?: Date;
  modelType?: string;
  isTemplate?: boolean;
  metadata?: Record<string, unknown>;
}

// Type guard for brain regions
export function isBrainRegion(value: unknown): value is BrainRegion {
  if (!value || typeof value !== "object") return false;

  const region = value as Partial<BrainRegion>;

  return (
    typeof region.id === "string" &&
    typeof region.name === "string" &&
    region.position &&
    typeof region.position.x === "number" &&
    typeof region.position.y === "number" &&
    typeof region.position.z === "number" &&
    typeof region.isActive === "boolean" &&
    typeof region.activityLevel === "number"
  );
}

// Type guard for neural connections
export function isNeuralConnection(value: unknown): value is NeuralConnection {
  if (!value || typeof value !== "object") return false;

  const connection = value as Partial<NeuralConnection>;

  return (
    typeof connection.id === "string" &&
    typeof connection.sourceRegionId === "string" &&
    typeof connection.targetRegionId === "string" &&
    typeof connection.strength === "number" &&
    typeof connection.isActive === "boolean"
  );
}

// Type guard for brain models
export function isBrainModel(value: unknown): value is BrainModel {
  if (!value || typeof value !== "object") return false;

  const model = value as Partial<BrainModel>;

  return (
    typeof model.id === "string" &&
    typeof model.name === "string" &&
    Array.isArray(model.regions) &&
    model.regions.every(isBrainRegion) &&
    Array.isArray(model.connections) &&
    model.connections.every(isNeuralConnection) &&
    typeof model.version === "number"
  );
}

// Factory function to create brain models with safe defaults
export function createBrainModel(
  partial: Partial<BrainModel> = {},
): BrainModel {
  return {
    id: partial.id || crypto.randomUUID(),
    name: partial.name || "New Brain Model",
    regions: partial.regions || [],
    connections: partial.connections || [],
    version: partial.version || 1,
    patientId: partial.patientId,
    scanDate: partial.scanDate,
    modelType: partial.modelType,
    isTemplate: partial.isTemplate || false,
    metadata: partial.metadata || {},
  };
}

// Factory function to create brain regions with safe defaults
export function createBrainRegion(
  partial: Partial<BrainRegion> = {},
): BrainRegion {
  return {
    id: partial.id || crypto.randomUUID(),
    name: partial.name || "New Region",
    position: partial.position || { x: 0, y: 0, z: 0 },
    color: partial.color || "#cccccc",
    isActive: partial.isActive ?? false,
    activityLevel: partial.activityLevel ?? 0,
    volumeMl: partial.volumeMl,
    riskFactor: partial.riskFactor,
  };
}

// Factory function to create neural connections with safe defaults
export function createNeuralConnection(
  partial: Partial<NeuralConnection> = {},
): NeuralConnection {
  return {
    id: partial.id || crypto.randomUUID(),
    sourceRegionId: partial.sourceRegionId || "",
    targetRegionId: partial.targetRegionId || "",
    connectionType: partial.connectionType,
    strength: partial.strength ?? 1.0,
    isActive: partial.isActive ?? true,
    color: partial.color || "#888888",
  };
}
