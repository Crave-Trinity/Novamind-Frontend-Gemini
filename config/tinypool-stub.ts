// A stub implementation of tinypool that preserves basic functionality but no-ops shutdown methods
// to avoid recursive shutdown errors in tests

interface TinypoolOptions {
  // Define only what's needed for our stub
  threadsPerCore?: number;
  maxThreads?: number;
  minThreads?: number;
  idleTimeout?: number;
  [key: string]: unknown;
}

type TaskFunction<T> = () => T | Promise<T>;

/**
 * Stubbed Tinypool class for testing
 */
export class Tinypool {
  // Unused options removed, could be re-added if needed later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options: TinypoolOptions = {}) {
    // No need to store unused options
  }

  // No-op destroy method
  async destroy(): Promise<void> {
    return Promise.resolve();
  }

  // No-op destroyAll method
  async destroyAll(): Promise<void> {
    return Promise.resolve();
  }

  // Basic run implementation
  async run<T>(fn: TaskFunction<T>): Promise<T> {
    if (typeof fn === 'function') {
      return Promise.resolve(fn());
    }
    return Promise.resolve(null as unknown as T);
  }
}

// Mock workerId for compatibility
export const workerId = 1;

// Re-export default
export default Tinypool;
