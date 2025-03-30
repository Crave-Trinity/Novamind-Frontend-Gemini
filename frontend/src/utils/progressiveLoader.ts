/**
 * Utilities for progressive loading of large brain data
 * Implements chunked loading to avoid UI freezes with large datasets
 */

import { BrainData, BrainRegion, NeuralConnection } from "../types/brain";

// Type for progress callback
type ProgressCallback = (percent: number) => void;

/**
 * Load brain regions progressively in chunks
 * @param regions Full array of brain regions
 * @param chunkSize Number of regions to process per chunk
 * @param onProgress Callback for loading progress
 * @returns Promise resolving to processed regions
 */
export const loadRegionsProgressively = async (
  regions: BrainRegion[],
  chunkSize = 20,
  onProgress?: ProgressCallback,
): Promise<BrainRegion[]> => {
  // Total regions to process
  const totalRegions = regions.length;
  // Processed regions
  const processedRegions: BrainRegion[] = [];

  // Process in chunks to avoid UI freezes
  for (let i = 0; i < totalRegions; i += chunkSize) {
    // Get current chunk
    const chunk = regions.slice(i, i + chunkSize);

    // Process chunk (in a real implementation, this would involve
    // complex geometry calculations, texture loading, etc.)
    const processedChunk = chunk.map((region) => ({
      ...region,
      // If needed, this is where we would process geometry, textures, etc.
      // processed: true
    }));

    // Add to processed regions
    processedRegions.push(...processedChunk);

    // Report progress
    if (onProgress) {
      const progress = Math.min(
        100,
        Math.round(((i + chunk.length) / totalRegions) * 100),
      );
      onProgress(progress);
    }

    // Yield to main thread to prevent UI freezes
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return processedRegions;
};

/**
 * Load neural connections progressively in chunks
 * @param connections Full array of neural connections
 * @param chunkSize Number of connections to process per chunk
 * @param onProgress Callback for loading progress
 * @returns Promise resolving to processed connections
 */
export const loadConnectionsProgressively = async (
  connections: NeuralConnection[],
  chunkSize = 50,
  onProgress?: ProgressCallback,
): Promise<NeuralConnection[]> => {
  // Total connections to process
  const totalConnections = connections.length;
  // Processed connections
  const processedConnections: NeuralConnection[] = [];

  // Process in chunks to avoid UI freezes
  for (let i = 0; i < totalConnections; i += chunkSize) {
    // Get current chunk
    const chunk = connections.slice(i, i + chunkSize);

    // Process chunk
    const processedChunk = chunk.map((connection) => ({
      ...connection,
      // Add any additional processing needed
    }));

    // Add to processed connections
    processedConnections.push(...processedChunk);

    // Report progress
    if (onProgress) {
      const progress = Math.min(
        100,
        Math.round(((i + chunk.length) / totalConnections) * 100),
      );
      onProgress(progress);
    }

    // Yield to main thread to prevent UI freezes
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return processedConnections;
};

/**
 * Load entire brain data progressively
 * @param brainData Full brain data to process
 * @param onRegionsProgress Callback for regions loading progress
 * @param onConnectionsProgress Callback for connections loading progress
 * @returns Promise resolving to processed brain data
 */
export const loadBrainDataProgressively = async (
  brainData: BrainData,
  onRegionsProgress?: ProgressCallback,
  onConnectionsProgress?: ProgressCallback,
): Promise<BrainData> => {
  // Process regions
  const processedRegions = await loadRegionsProgressively(
    brainData.regions,
    20,
    onRegionsProgress,
  );

  // Process connections
  const processedConnections = await loadConnectionsProgressively(
    brainData.connections,
    50,
    onConnectionsProgress,
  );

  // Return processed brain data
  return {
    ...brainData,
    regions: processedRegions,
    connections: processedConnections,
  };
};

/**
 * Create a priority-based loading queue for brain regions
 * Loads important regions first (e.g., active or highlighted regions)
 * @param regions All brain regions to process
 * @returns Prioritized array of regions
 */
export const createPriorityLoadingQueue = (
  regions: BrainRegion[],
): BrainRegion[] => {
  // Make a copy to avoid mutation
  const queue = [...regions];

  // Sort by priority (active regions first, then by size/importance)
  queue.sort((a, b) => {
    // Active regions first
    if (a.isActive && !b.isActive) {
      return -1;
    }
    if (!a.isActive && b.isActive) {
      return 1;
    }

    // Use scale or metrics.volume if available
    const aVolume = a.metrics?.volume || a.scale || 0;
    const bVolume = b.metrics?.volume || b.scale || 0;

    if (aVolume !== bVolume) {
      return bVolume - aVolume; // Larger volume/scale = higher priority
    }

    // If volumes are the same, prioritize by distance from center
    const aDistance = Math.sqrt(
      a.position[0] ** 2 + a.position[1] ** 2 + a.position[2] ** 2,
    );
    const bDistance = Math.sqrt(
      b.position[0] ** 2 + b.position[1] ** 2 + b.position[2] ** 2,
    );
    return aDistance - bDistance; // Closer to center = higher priority
  });

  return queue;
};
