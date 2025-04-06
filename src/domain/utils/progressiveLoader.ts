/**
 * Utilities for progressive loading of large brain data
 * Implements chunked loading to avoid UI freezes with large datasets
 */

import {
  BrainModel, // Use BrainModel
  BrainRegion,
  NeuralConnection,
  isBrainRegion, // Import guards
  isNeuralConnection,
  isBrainModel,
} from '@domain/types/brain/models'; // Corrected import path
import {
  validateBrainModelData,
  validateBrainRegionArray,
  validateNeuralConnectionArray,
  validateProgressCallback,
} from '@/utils/progressiveLoader.runtime'; // Import validators
import { Result, Ok, Err } from 'ts-results';

// Use BrainModel directly
type BrainData = BrainModel;

// Type for progress callback
type ProgressCallback = (percent: number) => void;

/**
 * Load brain regions progressively in chunks
 * @param regions Full array of brain regions
 * @param chunkSize Number of regions to process per chunk
 * @param onProgress Callback for loading progress
 * @returns Promise resolving to Result containing processed regions or an Error
 */
export const loadRegionsProgressively = async (
  regions: unknown, // Accept unknown for validation
  chunkSize = 20,
  onProgress?: unknown // Accept unknown for validation
): Promise<Result<BrainRegion[], Error>> => {
  // Return Result
  // Validate inputs
  const regionsValidation = validateBrainRegionArray(regions);
  if (regionsValidation.err) return Err(regionsValidation.val);
  const progressValidation = validateProgressCallback(onProgress);
  if (progressValidation.err) return Err(progressValidation.val);

  const validatedRegions = regionsValidation.val;
  const validatedOnProgress = progressValidation.val; // Can be undefined

  // Use validated inputs
  const totalRegions = validatedRegions.length;
  const processedRegions: BrainRegion[] = [];

  try {
    for (let i = 0; i < totalRegions; i += chunkSize) {
      const chunk = validatedRegions.slice(i, i + chunkSize);

      // No need to re-validate chunk if input array was validated
      const processedChunk = chunk.map((region) => ({
        ...region,
        // Minimal processing here, main validation at entry/exit points
      }));

      processedRegions.push(...processedChunk);

      if (validatedOnProgress) {
        // Use validated callback
        const progress = Math.min(100, Math.round(((i + chunk.length) / totalRegions) * 100)); // Use chunk.length
        validatedOnProgress(progress);
      }

      // Yield to main thread to prevent UI freezes
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return Ok(processedRegions); // Return Ok
  } catch (error) {
    console.error('Error during progressive region loading:', error);
    return Err(
      error instanceof Error ? error : new Error('Unknown error during progressive region loading')
    );
  }
};

/**
 * Load neural connections progressively in chunks
 * @param connections Full array of neural connections
 * @param chunkSize Number of connections to process per chunk
 * @param onProgress Callback for loading progress
 * @returns Promise resolving to Result containing processed connections or an Error
 */
export const loadConnectionsProgressively = async (
  connections: unknown, // Accept unknown
  chunkSize = 50,
  onProgress?: unknown // Accept unknown
): Promise<Result<NeuralConnection[], Error>> => {
  // Return Result
  // Validate inputs
  const connectionsValidation = validateNeuralConnectionArray(connections);
  if (connectionsValidation.err) return Err(connectionsValidation.val);
  const progressValidation = validateProgressCallback(onProgress);
  if (progressValidation.err) return Err(progressValidation.val);

  const validatedConnections = connectionsValidation.val;
  const validatedOnProgress = progressValidation.val; // Can be undefined

  // Use validated inputs
  const totalConnections = validatedConnections.length;
  const processedConnections: NeuralConnection[] = [];

  try {
    for (let i = 0; i < totalConnections; i += chunkSize) {
      const chunk = validatedConnections.slice(i, i + chunkSize);

      // No need to re-validate chunk
      const processedChunk = chunk.map((connection) => ({
        ...connection,
      }));

      processedConnections.push(...processedChunk);

      if (validatedOnProgress) {
        // Use validated callback
        const progress = Math.min(100, Math.round(((i + chunk.length) / totalConnections) * 100)); // Use chunk.length
        validatedOnProgress(progress);
      }

      // Yield to main thread
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return Ok(processedConnections); // Return Ok
  } catch (error) {
    console.error('Error during progressive connection loading:', error);
    return Err(
      error instanceof Error
        ? error
        : new Error('Unknown error during progressive connection loading')
    );
  }
};

/**
 * Load entire brain data progressively
 * @param brainData Full brain data to process
 * @param onRegionsProgress Callback for regions loading progress
 * @param onConnectionsProgress Callback for connections loading progress
 * @returns Promise resolving to Result containing processed brain data or an Error
 */
export const loadBrainDataProgressively = async (
  brainData: unknown, // Accept unknown
  onRegionsProgress?: unknown, // Accept unknown
  onConnectionsProgress?: unknown // Accept unknown
): Promise<Result<BrainData, Error>> => {
  // Return Result
  // Validate inputs
  const dataValidation = validateBrainModelData(brainData);
  if (dataValidation.err) return Err(dataValidation.val);
  const regionsProgressValidation = validateProgressCallback(onRegionsProgress);
  if (regionsProgressValidation.err) return Err(regionsProgressValidation.val);
  const connectionsProgressValidation = validateProgressCallback(onConnectionsProgress);
  if (connectionsProgressValidation.err) return Err(connectionsProgressValidation.val);

  const validatedData = dataValidation.val;
  const validatedRegionsProgress = regionsProgressValidation.val;
  const validatedConnectionsProgress = connectionsProgressValidation.val;

  try {
    // Call loaders with validated data
    const regionsResult = await loadRegionsProgressively(
      validatedData.regions,
      20,
      validatedRegionsProgress
    );
    if (regionsResult.err) return regionsResult; // Propagate error

    const connectionsResult = await loadConnectionsProgressively(
      validatedData.connections,
      50,
      validatedConnectionsProgress
    );
    if (connectionsResult.err) return connectionsResult; // Propagate error

    // Return Ok with processed data
    return Ok({
      ...validatedData,
      regions: regionsResult.val,
      connections: connectionsResult.val,
    }); // Added missing closing parenthesis
  } catch (error) {
    console.error('Error during progressive brain data loading:', error);
    return Err(
      error instanceof Error
        ? error
        : new Error('Unknown error during progressive brain data loading')
    );
  }
};

/**
 * Create a priority-based loading queue for brain regions
 * Loads important regions first (e.g., active or highlighted regions)
 * @param regions All brain regions to process
 * @returns Result containing prioritized array of regions or an Error
 */
export const createPriorityLoadingQueue = (
  regions: unknown // Accept unknown
): Result<BrainRegion[], Error> => {
  // Return Result
  // Validate input
  const regionsValidation = validateBrainRegionArray(regions);
  if (regionsValidation.err) {
    console.error('createPriorityLoadingQueue: Invalid input, regions must be an array.');
    return Err(regionsValidation.val);
  }
  const validatedRegions = regionsValidation.val;

  // This check should be redundant after validation
  if (!Array.isArray(validatedRegions)) {
    return Err(new Error('Validation passed but input is not an array.')); // Should not happen
  }
  const queue = [...validatedRegions]; // Use validated array

  try {
    queue.sort((a, b) => {
      // Active regions first
      const aIsActive = a.isActive ?? false;
      const bIsActive = b.isActive ?? false;
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      // Add other sorting criteria if needed (e.g., activityLevel)
      return 0; // Default case if priorities are equal
    });
    return Ok(queue); // Return the sorted queue on success
  } catch (error) {
    console.error('Error creating priority loading queue:', error);
    return Err(error instanceof Error ? error : new Error('Unknown error creating priority queue'));
  }
}; // Added missing closing brace for the function
