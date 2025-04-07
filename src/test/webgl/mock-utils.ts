/**
 * Utilities for creating and managing mock functions and objects
 *
 * These utilities provide a consistent approach to mocking across the testing system
 */
import type { MockFunction } from './mock-types';

/**
 * Create a mock function with a consistent interface
 *
 * @param implementation Optional initial implementation of the mock function
 * @returns A mock function with tracking capabilities
 */
export function createMockFunction<T extends (...args: any[]) => any>(
  implementation?: T
): MockFunction<T> {
  const calls: Parameters<T>[][] = [];
  const results: { type: 'return' | 'throw'; value: any }[] = [];

  const mockFn = ((...args: Parameters<T>): ReturnType<T> => {
    calls.push([...args]);
    try {
      const result = implementation
        ? implementation(...args)
        : (undefined as unknown as ReturnType<T>);
      results.push({ type: 'return', value: result });
      return result;
    } catch (error) {
      results.push({ type: 'throw', value: error });
      throw error;
    }
  }) as MockFunction<T>;

  mockFn.mock = { calls, results };

  mockFn.mockImplementation = (newImplementation: T) => {
    implementation = newImplementation;
    return mockFn;
  };

  mockFn.mockReturnValue = (value: ReturnType<T>) => {
    implementation = (() => value) as unknown as T;
    return mockFn;
  };

  mockFn.mockReset = () => {
    calls.length = 0;
    results.length = 0;
  };

  return mockFn;
}

/**
 * Create a simple mock function for tests that don't need tracking
 */
export const fn = <T extends (...args: any[]) => any>(impl?: T) => createMockFunction<T>(impl);

/**
 * Simple deep clone utility for mock objects
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    result[key as keyof T] = deepClone(obj[key as keyof T]);
    return result;
  }, {} as T);
}
