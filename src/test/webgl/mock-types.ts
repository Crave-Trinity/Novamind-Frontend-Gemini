/* eslint-disable */
/**
 * Type definitions for mock functions and objects
 *
 * These types provide consistent interfaces for all mocks in the testing system
 */

/**
 * MockFunction type - provides a consistent interface for all mock functions
 * Compatible with testing frameworks but not dependent on them
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockFunction<T extends (...args: any // eslint-disable-line @typescript-eslint/no-explicit-any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T>;
  mockImplementation: (fn: T) => MockFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockFunction<T>;
  mockReset: () => void;
  mock: {
    calls: Parameters<T>[][];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    results: { type: 'return' | 'throw'; value: any // eslint-disable-line @typescript-eslint/no-explicit-any }[];
  };
};
