// A thin stub of tinypool that preserves transform and worker functionality,
// but no-ops out shutdown methods to avoid recursive shutdown errors.
import * as original from 'tinypool/dist/index.js';

// Extend the original Tinypool class to override shutdown behavior
export class Tinypool extends original.default {
  // Override destroy to immediately resolve
  async destroy(): Promise<void> {}
  // Override destroyAll to immediately resolve
  async destroyAll(): Promise<void> {}
}

// Preserve workerId export for Vitest worker integration
export const workerId = original.workerId;

// Re-export default
export default Tinypool;