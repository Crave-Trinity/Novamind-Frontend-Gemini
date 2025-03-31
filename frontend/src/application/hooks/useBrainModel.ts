/**
 * NOVAMIND Neural-Safe Application Hook
 * useBrainModel - Quantum-level hook for brain model interaction
 */

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Domain types
import { BrainModel } from "@domain/types/brain/models";
import { RenderMode } from "@domain/types/brain/visualization";
import { Result, success, failure, SafeArray } from "@domain/types/common";

// Domain utilities
import { verifyBrainModel } from "@domain/utils/typeVerification";

// Application services
import { brainModelService } from "@application/services/brainModelService";

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
  const brainModelQueryKey = "brainModel";

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
  } = useQuery<BrainModel, Error>(
    [brainModelQueryKey],
    async () => {
      // Return cached model if available (this is just a placeholder)
      const cachedModel = queryClient.getQueryData<BrainModel>([
        brainModelQueryKey,
      ]);
      if (cachedModel) {
        return cachedModel;
      }

      throw new Error(
        "No brain model loaded - call fetchBrainModel with a scan ID",
      );
    },
    {
      // Don't fetch on mount, wait for explicit fetch
      enabled: false,
      // Keep previous data on error
      keepPreviousData: true,
      // Retry configuration
      retry: 1,
      // Don't refetch automatically
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

  // Fetch brain model - explicitly called with scan ID
  const fetchBrainModel = useCallback(
    async (scanId: string): Promise<Result<BrainModel>> => {
      try {
        const result = await brainModelService.fetchBrainModel(scanId);

        if (result.success) {
          // Verify model integrity with domain utility
          const verificationResult = verifyBrainModel(result.data);

          if (verificationResult.success) {
            // Update cache
            queryClient.setQueryData([brainModelQueryKey], result.data);
            // Trigger refetch to update state
            refetch();
            return success(result.data);
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
  >(
    async ({ regionId, activityLevel }) => {
      // Validate inputs
      if (!brainModel) {
        throw new Error("No brain model loaded");
      }

      if (activityLevel < 0 || activityLevel > 1) {
        throw new Error("Activity level must be between 0 and 1");
      }

      // Create a deep copy of the brain model to avoid mutation
      const updatedModel: BrainModel = JSON.parse(JSON.stringify(brainModel));

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
      updatedModel.regions[regionIndex].isActive = activityLevel > 0.3;

      return updatedModel;
    },
    {
      onSuccess: (updatedModel) => {
        // Update cache
        queryClient.setQueryData([brainModelQueryKey], updatedModel);
      },
    },
  );

  // Toggle region active mutation
  const toggleRegionActiveMutation = useMutation<
    BrainModel,
    Error,
    string // regionId
  >(
    async (regionId) => {
      // Validate inputs
      if (!brainModel) {
        throw new Error("No brain model loaded");
      }

      // Create a deep copy of the brain model to avoid mutation
      const updatedModel: BrainModel = JSON.parse(JSON.stringify(brainModel));

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
      if (isActive && updatedModel.regions[regionIndex].activityLevel < 0.3) {
        updatedModel.regions[regionIndex].activityLevel = 0.5; // Default active level
      } else if (
        !isActive &&
        updatedModel.regions[regionIndex].activityLevel > 0.3
      ) {
        updatedModel.regions[regionIndex].activityLevel = 0.1; // Default inactive level
      }

      return updatedModel;
    },
    {
      onSuccess: (updatedModel) => {
        // Update cache
        queryClient.setQueryData([brainModelQueryKey], updatedModel);
      },
    },
  );

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
    queryClient.removeQueries([brainModelQueryKey]);
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
    isLoading:
      isLoading ||
      updateRegionActivityMutation.isLoading ||
      toggleRegionActiveMutation.isLoading,
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
