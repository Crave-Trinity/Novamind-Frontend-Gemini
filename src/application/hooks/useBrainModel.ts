/**
 * NOVAMIND Neural-Safe Application Hook
 * useBrainModel - Quantum-level hook for brain model interaction
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Domain types
import type { BrainModel } from "@domain/types/brain/models";
import type { RenderMode } from "@domain/types/brain/visualization";
import { type Result, success, failure, SafeArray } from "../../domain/types/shared/common"; // Corrected relative path

// Domain utilities
import { brainTypeVerifier } from "../../domain/utils/brain/type-verification"; // Correct relative path to brain utils

// Application services
import { brainModelService } from "../services/brain/brain-model.service"; // Correct relative path

/**
 * Hook return type with discriminated union for type safety
 */
interface UseBrainModelReturn {
  // Data
  brainModel: BrainModel | null;

  // State
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Methods
  fetchBrainModel: (scanId: string) => Promise<Result<BrainModel>>;
  updateRegionActivity: (regionId: string, activityLevel: number) => void;
  toggleRegionActive: (regionId: string) => void;
  selectRegions: (regionIds: string[]) => void;
  deselectRegions: (regionIds: string[]) => void;
  highlightRegions: (regionIds: string[]) => void;
  clearHighlights: () => void;
  setRenderMode: (mode: RenderMode) => void;
  reset: () => void;
}

/**
 * useBrainModel - Application hook for brain model state management
 * Implements neural-safe patterns for brain model operations
 */
export function useBrainModel(): UseBrainModelReturn {
  // QueryClient for React Query
  const queryClient = useQueryClient();

  // Query key
  const brainModelQueryKey = "brainModel"; // Reinstate base query key

  // Local state for highlights and selections
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [highlightedRegionIds, setHighlightedRegionIds] = useState<string[]>(
    [],
  );

  // Fetch brain model query
  const {
    data: brainModel,
    isLoading,
    isError,
    error: queryError,
    refetch,
    // Use a query key that can include the scanId when the query is enabled
    // The actual scanId will be passed when rendering the hook in the test
  } = useQuery<BrainModel, Error>({ // Use v5 object syntax
    queryKey: [brainModelQueryKey],
    queryFn: async () => {
      // Return cached model if available (this is just a placeholder)
      const cachedModel = queryClient.getQueryData<BrainModel>([
        brainModelQueryKey,
      ]);
      if (cachedModel) {
        return cachedModel;
      }
      // In a real scenario, you might fetch initial data here or rely on fetchBrainModel
      // For now, throwing error if not explicitly fetched is okay for the hook's logic
      throw new Error(
        "No brain model loaded - call fetchBrainModel with a scan ID",
      );
    },
    // Options remain largely the same in v5
    enabled: false,
    // placeholderData: queryClient.getQueryData([brainModelQueryKey]), // Removed placeholderData to simplify type issues
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Keep staleTime for cache behavior
    gcTime: Infinity, // Use gcTime for garbage collection control
  });

  // Fetch brain model - explicitly called with scan ID
  const fetchBrainModel = useCallback(
    async (scanId: string): Promise<Result<BrainModel>> => {
      try {
        const result = await brainModelService.fetchBrainModel(scanId);

        if (result.success) {
          // Verify model integrity with domain utility
          const verificationResult = brainTypeVerifier.verifyBrainModel(result.value); // Correct usage

          if (verificationResult.success) {
            // Update cache
            // Use the base key for setting data after manual fetch
            queryClient.setQueryData([brainModelQueryKey], result.value);
            // Trigger refetch to update state
            refetch();
            return success(result.value); // Correct usage
          } else {
            // Type verification failed
            return failure(
              verificationResult.error || new Error("Type verification failed"),
            );
          }
        } else {
          // Service call failed
          return failure(
            result.error || new Error("Failed to fetch brain model"),
          );
        }
      } catch (err) {
        // Unexpected error
        const error =
          err instanceof Error
            ? err
            : new Error("Unknown error fetching brain model");
        return failure(error);
      }
    },
    [queryClient, refetch],
  );

  // Update region activity mutation
  const updateRegionActivityMutation = useMutation<
    BrainModel,
    Error,
    { regionId: string; activityLevel: number }
  >({ // Use v5 object syntax
    mutationFn: async ({ regionId, activityLevel }) => {
      // Validate inputs
      const currentModel = queryClient.getQueryData<BrainModel>([brainModelQueryKey]);
      if (!currentModel) {
        throw new Error("No brain model loaded");
      }

      if (activityLevel < 0 || activityLevel > 1) {
        throw new Error("Activity level must be between 0 and 1");
      }

      // Create a deep copy of the brain model to avoid mutation
      const updatedModel: BrainModel = JSON.parse(JSON.stringify(currentModel));

      // Find and update the region
      const regionIndex = updatedModel.regions.findIndex(
        (r) => r.id === regionId,
      );
      if (regionIndex === -1) {
        throw new Error(`Region with ID ${regionId} not found`);
      }

      // Update activity level
      updatedModel.regions[regionIndex].activityLevel = activityLevel;

      // Update active state based on threshold
      updatedModel.regions[regionIndex].isActive = activityLevel > 0.3; // Assuming 0.3 is the threshold

      return updatedModel;
    },
    onSuccess: (updatedModel) => {
      // Update cache
      queryClient.setQueryData([brainModelQueryKey], updatedModel); // Update cache using base key
    },
  });

  // Toggle region active mutation
  const toggleRegionActiveMutation = useMutation<
    BrainModel,
    Error,
    string // regionId
  >({ // Use v5 object syntax
    mutationFn: async (regionId) => {
      // Validate inputs
      const currentModel = queryClient.getQueryData<BrainModel>([brainModelQueryKey]);
      if (!currentModel) {
        throw new Error("No brain model loaded");
      }

      // Create a deep copy of the brain model to avoid mutation
      const updatedModel: BrainModel = JSON.parse(JSON.stringify(currentModel));

      // Find and update the region
      const regionIndex = updatedModel.regions.findIndex(
        (r) => r.id === regionId,
      );
      if (regionIndex === -1) {
        throw new Error(`Region with ID ${regionId} not found`);
      }

      // Toggle active state
      const isActive = !updatedModel.regions[regionIndex].isActive;
      updatedModel.regions[regionIndex].isActive = isActive;

      // Update activity level based on active state
      if (isActive && updatedModel.regions[regionIndex].activityLevel < 0.3) { // Assuming 0.3 threshold
        updatedModel.regions[regionIndex].activityLevel = 0.5; // Default active level
      } else if (
        !isActive &&
        updatedModel.regions[regionIndex].activityLevel > 0.3 // Assuming 0.3 threshold
      ) {
        updatedModel.regions[regionIndex].activityLevel = 0.1; // Default inactive level
      }

      return updatedModel;
    },
    onSuccess: (updatedModel) => {
      // Update cache
      queryClient.setQueryData([brainModelQueryKey], updatedModel); // Update cache using base key
    },
  });

  // Update region activity
  const updateRegionActivity = useCallback(
    (regionId: string, activityLevel: number) => {
      updateRegionActivityMutation.mutate({ regionId, activityLevel });
    },
    [updateRegionActivityMutation],
  );

  // Toggle region active
  const toggleRegionActive = useCallback(
    (regionId: string) => {
      toggleRegionActiveMutation.mutate(regionId);
    },
    [toggleRegionActiveMutation],
  );

  // Select regions
  const selectRegions = useCallback((regionIds: string[]) => {
    setSelectedRegionIds((prev) => {
      // Create a safe array to leverage its utilities
      const safeArray = new SafeArray(prev);

      // Add all new IDs (avoiding duplicates)
      regionIds.forEach((id) => {
        if (!safeArray.includes(id)) {
          safeArray.push(id);
        }
      });

      return safeArray.toArray();
    });
  }, []);

  // Deselect regions
  const deselectRegions = useCallback((regionIds: string[]) => {
    setSelectedRegionIds((prev) => {
      return prev.filter((id) => !regionIds.includes(id));
    });
  }, []);

  // Highlight regions
  const highlightRegions = useCallback((regionIds: string[]) => {
    setHighlightedRegionIds(regionIds);
  }, []);

  // Clear highlights
  const clearHighlights = useCallback(() => {
    setHighlightedRegionIds([]);
  }, []);

  // Set render mode
  const setRenderMode = useCallback((mode: RenderMode) => {
    // This would typically update app-wide state managed elsewhere
    // For now, we'll just log it
    console.log(`Render mode set to: ${mode}`);
  }, []);

  // Reset hook state
  const reset = useCallback(() => {
    setSelectedRegionIds([]);
    setHighlightedRegionIds([]);
    queryClient.removeQueries({ queryKey: [brainModelQueryKey] }); // Remove using base key
  }, [queryClient]);

  // Combine errors
  const error =
    queryError ||
    updateRegionActivityMutation.error ||
    toggleRegionActiveMutation.error;

  return {
    // Data
    brainModel: brainModel || null,

    // State
    isLoading: // Use isPending in v5
      isLoading || // from useQuery (keep using isLoading for useQuery result)
      updateRegionActivityMutation.isPending || // Correct v5 property
      toggleRegionActiveMutation.isPending, // Correct v5 property
    isError:
      isError ||
      updateRegionActivityMutation.isError ||
      toggleRegionActiveMutation.isError,
    error: error || null,

    // Methods
    fetchBrainModel,
    updateRegionActivity,
    toggleRegionActive,
    selectRegions,
    deselectRegions,
    highlightRegions,
    clearHighlights,
    setRenderMode,
    reset,
  };
}
