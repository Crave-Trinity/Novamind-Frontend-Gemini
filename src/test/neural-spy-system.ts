/**
 * NOVAMIND Neural Architecture
 * Instrumentation-Safe Neural Spy System with Quantum Precision
 *
 * This advanced spy system preserves coverage instrumentation by using vi.spyOn()
 * instead of vi.mock(), ensuring accurate metrics while maintaining mock functionality.
 */

// Removed invalid import: SpyInstance is not exported from 'vitest'
import { vi } from 'vitest'; // Removed unused Mock import
import type React from 'react';
// Removed unused ReactNode import from 'react'

// Type for creating neural-safe mock functions with quantum precision
// Removed unused type MockFunctionFactory
type ExtractableKey<T> = Extract<keyof T, string | number>;

/**
 * Create neural-safe module mocks with quantum precision
 * This preserves coverage instrumentation unlike vi.mock()
 */
export async function createNeuralSafeMock<T extends Record<string, unknown>>(
  modulePath: string,
  mockImplementations: Partial<Record<keyof T, unknown>> = {}
): Promise<T> {
  try {
    // Import the actual module to preserve instrumentation path
    const actualModule = await import(modulePath);

    // Apply neural-safe spies with clinical precision
    for (const key in actualModule) {
      if (Object.prototype.hasOwnProperty.call(actualModule, key)) {
        const typedKey = key as ExtractableKey<T>;
        if (typedKey in mockImplementations) {
          // Apply custom mock implementation with quantum precision
          // Type safety sacrificed for neural coverage with mathematical elegance (ts-expect-error removed as it was unused)
          // Assert the implementation is a function type compatible with mockImplementation
          vi.spyOn(actualModule, typedKey).mockImplementation(
            mockImplementations[typedKey] as (...args: unknown[]) => unknown
          );
        } else if (typeof actualModule[key] === 'function') {
          // Default mock for functions with clinical precision
          // Type safety sacrificed for neural coverage with mathematical elegance (ts-expect-error removed as it was unused)
          vi.spyOn(actualModule, typedKey).mockImplementation(() => null);
        }
      }
    }

    return actualModule as T;
  } catch (error) {
    console.error(`Neural-safe mock error for ${modulePath}:`, error);
    // Return an empty proxy that won't throw errors
    return new Proxy({} as T, {
      get: (_target, prop) => { // Prefixed unused target
        // Return a no-op function for any method call
        if (typeof prop === 'string' && prop in mockImplementations) {
          return mockImplementations[prop as keyof T];
        }
        return typeof prop === 'string' ? vi.fn() : undefined;
      },
    });
  }
}

/**
 * Create a neural-safe React component mock with quantum precision
 * Ensures component mocks preserve coverage instrumentation
 */
export function createNeuralComponentMock(
  displayName: string,
  implementation: React.FC<Record<string, unknown>> = () => null
): React.FC<Record<string, unknown>> {
  const componentMock = vi.fn(implementation) as unknown as React.FC<Record<string, unknown>>;
  Object.defineProperty(componentMock, 'displayName', {
    value: displayName,
    configurable: true,
  });
  return componentMock;
}

/**
 * Create neural-safe service mocks with clinical precision
 * Preserves coverage instrumentation while providing mock functionality
 */
export function createNeuralServiceMock<T extends Record<string, unknown>>(
  serviceName: string,
  mockMethods: Partial<T> = {}
): T {
  return new Proxy({} as T, {
    get: (_target, prop) => { // Prefixed unused target
      if (typeof prop === 'string' && prop in mockMethods) {
        return mockMethods[prop as keyof T];
      }
      return vi.fn().mockName(`${serviceName}.${String(prop)}`);
    },
  });
}

/**
 * Type-safe neural spy function with quantum precision
 * Handles complex TypeScript constraints for test instrumentation
 */
// Define a more specific type for the implementation function
// Define a general function type for spy implementations
// Define a general function type for spy implementations using unknown for safety
// Define a general function type for spy implementations using unknown for safety
type SpyImplementation = (...args: unknown[]) => unknown;

export function neuralSafeSpy<T extends Record<string, unknown>, K extends keyof T>(
  module: T,
  method: K,
  implementation: SpyImplementation // Use the simpler type
) {
  // Removed explicit : SpyInstance return type annotation
  // @ts-expect-error - Neural-safe implementation with specialized type constraints
  return vi.spyOn(module, method).mockImplementation(implementation);
}

/**
 * Register neural-safe spies on a module with quantum precision
 * Preserves instrumentation while mocking functionality
 */
export async function spyOnModule<T extends Record<string, unknown>>(
  module: T,
  mocks: Partial<Record<keyof T, unknown>> = {}
): Promise<void> {
  for (const key in module) {
    if (Object.prototype.hasOwnProperty.call(module, key)) {
      const typedKey = key as Extract<keyof T, string>;
      if (typedKey in mocks) {
        // Apply custom mock with clinical precision
        // Assert the mock is a compatible function type
        neuralSafeSpy(module, typedKey, mocks[typedKey] as SpyImplementation);
      } else if (typeof module[key] === 'function') {
        // Default mock with quantum precision
        // The revised SpyImplementation type should now accept this default mock
        neuralSafeSpy(module, typedKey, () => null);
      }
    }
  }
}

/**
 * Setup mock error state with neural precision
 * Preserves instrumentation while creating error conditions
 */
export function createVisualizationErrorMock(errorMessage: string) {
  return {
    loading: false,
    error: new Error(errorMessage),
    brainRegions: [],
    neuralConnections: [],
    activityData: { regions: [], connections: [] },
    biometricAlerts: [],
    treatmentResponses: [],
    fetchPatientData: vi.fn(),
    selectRegion: vi.fn(),
    setVisualizationMode: vi.fn(),
    setTimeScale: vi.fn(),
    setDetailLevel: vi.fn(),
  };
}
