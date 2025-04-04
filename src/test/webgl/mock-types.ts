/**
 * Type definitions for mock functions and objects
 * 
 * These types provide consistent interfaces for all mocks in the testing system
 */

/**
 * MockFunction type - provides a consistent interface for all mock functions
 * Compatible with testing frameworks but not dependent on them
 */
export type MockFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReset: () => void;
  mock: {
    calls: Parameters<T>[][];
    results: { type: 'return' | 'throw'; value: any }[];
  };
};
