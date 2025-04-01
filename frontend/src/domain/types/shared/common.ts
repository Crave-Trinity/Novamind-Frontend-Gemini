/**
 * NOVAMIND Neural-Safe Common Type Definitions
 * Core utility types with quantum-level type safety
 */

// Basic identifier type
export type ID = string;

// Base entity types with timestamps
export interface TimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}

// User tracking for audit purposes
export interface UserGeneratedContent {
  createdBy: string;
  lastModifiedBy: string | null;
}

// Combined auditable entity type
export interface Auditable extends TimestampedEntity, UserGeneratedContent {}

// Version tracking for entities
export interface VersionedEntity {
  version: number;
}

// Sort direction type
export type SortOrder = 'asc' | 'desc';

// Numeric range type
export interface Range {
  min: number;
  max: number;
}

// 2D coordinate type
export interface Point2D {
  x: number;
  y: number;
}

// RGB color type
export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

// RGBA color type with alpha
export interface ColorRGBA extends ColorRGB {
  a: number;
}

// Dimensions type for width/height
export interface Dimensions {
  width: number;
  height: number;
}

// Result pattern for neural-safe error handling
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Helper functions for Result pattern
export const success = <T>(value: T): Result<T> => ({
  success: true,
  value,
});

export const failure = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Neural-safe array wrapper to prevent null reference errors
export class SafeArray<T> {
  private items: T[];

  constructor(items?: T[] | null) {
    this.items = items || [];
  }

  // Get raw array
  get(): T[] {
    return [...this.items];
  }

  // Get with default value if null/empty
  getOrDefault(defaultValue: T[]): T[] {
    return this.isEmpty() ? defaultValue : [...this.items];
  }

  // Check if empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Neural-safe map operation
  map<U>(callback: (item: T, index: number) => U): U[] {
    return this.items.map(callback);
  }

  // Neural-safe filter operation
  filter(predicate: (item: T) => boolean): SafeArray<T> {
    return new SafeArray(this.items.filter(predicate));
  }

  // Neural-safe find operation
  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  // Neural-safe forEach operation
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  // Neural-safe add operation
  add(item: T): void {
    this.items.push(item);
  }

  // Neural-safe size operation
  size(): number {
    return this.items.length;
  }
}

// Type guard utilities
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

// Neural-safe error type with severity levels
export class NeuralError extends Error {
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
    } = { code: "UNKNOWN_ERROR" },
  ) {
    super(message);
    this.name = "NeuralError";
    this.code = options.code;
    this.severity = options.severity || "error";
    this.component = options.component;
    this.timestamp = Date.now();
  }
}

// Vector3 type for 3D coordinates with mathematical precision
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Neural-safe Vector3 operations
export const Vector3 = {
  zero(): Vector3 {
    return { x: 0, y: 0, z: 0 };
  },

  add(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  },

  subtract(a: Vector3, b: Vector3): Vector3 {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
    };
  },

  multiply(v: Vector3, scalar: number): Vector3 {
    return {
      x: v.x * scalar,
      y: v.y * scalar,
      z: v.z * scalar,
    };
  },

  distance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  normalize(v: Vector3): Vector3 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (length === 0) {
      return { x: 0, y: 0, z: 0 };
    }
    return {
      x: v.x / length,
      y: v.y / length,
      z: v.z / length,
    };
  },
};

// Data visualization state with discriminated union for type safety
export type VisualizationState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: NeuralError };

// Neural-safe visualization state factory functions
export const VisualizationState = {
  idle<T>(): VisualizationState<T> {
    return { status: "idle" };
  },

  loading<T>(): VisualizationState<T> {
    return { status: "loading" };
  },

  success<T>(data: T): VisualizationState<T> {
    return {
      status: "success",
      data,
    };
  },

  error<T>(error: NeuralError): VisualizationState<T> {
    return {
      status: "error",
      error,
    };
  },

  isIdle<T>(state: VisualizationState<T>): state is { status: "idle" } {
    return state.status === "idle";
  },

  isLoading<T>(
    state: VisualizationState<T>,
  ): state is { status: "loading" } {
    return state.status === "loading";
  },

  isSuccess<T>(
    state: VisualizationState<T>,
  ): state is { status: "success"; data: T } {
    return state.status === "success";
  },

  isError<T>(
    state: VisualizationState<T>,
  ): state is { status: "error"; error: NeuralError } {
    return state.status === "error";
  },
};

// Result value implementation to complement the type
export const Result = {
  success,
  failure,

  isSuccess<T, E>(
    result: Result<T, E>,
  ): result is { success: true; value: T } {
    return result.success === true;
  },

  isFailure<T, E>(
    result: Result<T, E>,
  ): result is { success: false; error: E } {
    return result.success === false;
  },

  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return result.success
      ? success(fn(result.value))
      : (result as unknown as Result<U, E>);
  },

  flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> {
    return result.success ? fn(result.value) : (result as unknown as Result<U, E>);
  },

  getOrElse<T, E>(result: Result<T, E>, defaultValue: T): T {
    return result.success ? result.value : defaultValue;
  },

  getOrThrow<T, E>(result: Result<T, E>): T {
    if (result.success) {
      return result.value;
    }
    throw result.error;
  },
};
