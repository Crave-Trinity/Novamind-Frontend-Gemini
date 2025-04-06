/**
 * WebGL Memory Monitor
 *
 * This utility provides advanced memory monitoring capabilities for Three.js/WebGL tests,
 * helping to identify memory leaks and ensure proper resource cleanup.
 *
 * Usage:
 * ```
 * import { startMemoryMonitoring, stopMemoryMonitoring, getMemoryReport } from '@test/webgl/memory-monitor';
 *
 * beforeEach(() => {
 *   startMemoryMonitoring();
 * });
 *
 * afterEach(() => {
 *   const report = stopMemoryMonitoring();
 *   expect(report.leakedObjectCount).toBe(0);
 * });
 * ```
 */

interface MemorySnapshot {
  objects: Map<string, Set<WeakRef<any>>>;
  timestamp: number;
}

export interface MemoryReport {
  createdObjects: number;
  disposedObjects: number;
  leakedObjectCount: number;
  leakedObjectTypes: Record<string, number>;
  duration: number;
  startTime: number;
  endTime: number;
}

// Track object references by type
let currentSnapshot: MemorySnapshot | null = null;
const registry = new FinalizationRegistry<{ type: string }>((details) => {
  if (currentSnapshot && details.type) {
    const typeSet = currentSnapshot.objects.get(details.type);
    if (typeSet) {
      // Object was garbage collected, remove it from our count
      // This is approximate as we can't directly reference the original object
      typeSet.forEach((ref) => {
        const obj = ref.deref();
        if (!obj) {
          typeSet.delete(ref);
        }
      });
    }
  }
});

/**
 * Begin monitoring memory usage for Three.js/WebGL objects
 */
export function startMemoryMonitoring(): void {
  currentSnapshot = {
    objects: new Map<string, Set<WeakRef<any>>>(),
    timestamp: performance.now(),
  };

  // Clear any previous data
  currentSnapshot.objects.clear();
}

/**
 * Stop monitoring and get a report of memory usage
 */
export function stopMemoryMonitoring(): MemoryReport {
  if (!currentSnapshot) {
    throw new Error('Memory monitoring not started');
  }

  const endTime = performance.now();
  const report: MemoryReport = {
    createdObjects: 0,
    disposedObjects: 0,
    leakedObjectCount: 0,
    leakedObjectTypes: {},
    duration: endTime - currentSnapshot.timestamp,
    startTime: currentSnapshot.timestamp,
    endTime,
  };

  // Calculate totals from each object type
  currentSnapshot.objects.forEach((objects, type) => {
    const livingCount = countLivingObjects(objects);
    report.leakedObjectCount += livingCount;

    if (livingCount > 0) {
      report.leakedObjectTypes[type] = livingCount;
    }
  });

  return report;
}

/**
 * Count living (not garbage collected) objects in a set of WeakRefs
 */
function countLivingObjects(refs: Set<WeakRef<any>>): number {
  let count = 0;
  refs.forEach((ref) => {
    if (ref.deref()) {
      count++;
    }
  });
  return count;
}

/**
 * Register a new object for memory tracking
 */
export function trackObject(obj: any, type: string): void {
  if (!currentSnapshot) return;

  if (!currentSnapshot.objects.has(type)) {
    currentSnapshot.objects.set(type, new Set());
  }

  const typeSet = currentSnapshot.objects.get(type)!;
  const ref = new WeakRef(obj);
  typeSet.add(ref);

  // Register for garbage collection notification
  registry.register(obj, { type });
}

/**
 * Mark an object as disposed/cleaned up
 */
export function markDisposed(obj: any, type: string): void {
  if (!currentSnapshot) return;

  const typeSet = currentSnapshot.objects.get(type);
  if (typeSet) {
    // We can't directly remove the specific WeakRef since we don't have the reference
    // Instead, we'll check all refs for this type and remove any that match
    typeSet.forEach((ref) => {
      if (ref.deref() === obj) {
        typeSet.delete(ref);
      }
    });
  }
}

/**
 * Get a snapshot of current memory usage for debugging
 */
export function getMemorySnapshot(): Record<string, number> {
  if (!currentSnapshot) {
    return {};
  }

  const snapshot: Record<string, number> = {};
  currentSnapshot.objects.forEach((objects, type) => {
    snapshot[type] = countLivingObjects(objects);
  });

  return snapshot;
}

/**
 * Manually trigger a garbage collection attempt (for testing only)
 * Note: This is not guaranteed to collect all objects and is implementation-dependent
 */
export function attemptGarbageCollection(): void {
  if (globalThis.gc) {
    console.log('Triggering manual garbage collection');
    globalThis.gc();
  } else {
    console.warn('Manual garbage collection not available. Run with --expose-gc flag');
  }
}

export default {
  startMemoryMonitoring,
  stopMemoryMonitoring,
  trackObject,
  markDisposed,
  getMemorySnapshot,
  attemptGarbageCollection,
};
