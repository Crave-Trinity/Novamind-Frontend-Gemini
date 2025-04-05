/**
 * Brain Visualization Hook
 * Provides state management and data fetching for 3D brain visualization
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vector3 } from "@domain/types/shared/common";
import { BrainRegion, BrainModel, NeuralConnection } from "@domain/types/brain/models";
import { RenderMode } from "@domain/types/brain/visualization";
import { apiClient } from "@infrastructure/api/ApiClient";

interface BrainViewState {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  zoom: number;
  highlightedRegions: string[];
  visiblePathways: boolean;
  renderMode: RenderMode;
  transparencyLevel: number;
  focusPoint: Vector3 | null;
}

interface UseBrainVisualizationOptions {
  patientId?: string;
  initialViewState?: Partial<BrainViewState>;
  autoRotate?: boolean;
  highlightActiveRegions?: boolean;
  disabled?: boolean;
}

export function useBrainVisualization(options?: UseBrainVisualizationOptions) {
  console.log('[DEBUG] useBrainVisualization hook starting with options:', options);
  
  const defaultOptions: UseBrainVisualizationOptions = {
    patientId: "default",
    autoRotate: false,
    highlightActiveRegions: true,
    disabled: false,
  };

  // Merge provided options with defaults
  const mergedOptions = { ...defaultOptions, ...options };

  // Fetch brain model data
  const {
    data: brainModel,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["brainModel", mergedOptions.patientId],
    queryFn: async () => {
      console.log('[DEBUG] Fetching brain model for:', mergedOptions.patientId);
      const data = await apiClient.getBrainModel(mergedOptions.patientId);
      console.log('[DEBUG] Received brain model:', data);
      return data;
    },
    enabled: !mergedOptions.disabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // View state for 3D visualization
  const [viewState, setViewState] = useState<BrainViewState>({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    zoom: 1,
    highlightedRegions: [],
    visiblePathways: true,
    renderMode: "anatomical" as RenderMode,
    transparencyLevel: 0.8,
    focusPoint: null,
    ...mergedOptions.initialViewState,
  });

  // Active regions based on clinical significance
  const [activeRegions, setActiveRegions] = useState<string[]>([]);

  // Update active regions when model changes
  useEffect(() => {
    if (brainModel && mergedOptions.highlightActiveRegions) {
      console.log('[DEBUG] Updating active regions');
      const significantRegions = brainModel.regions
        .filter((region: BrainRegion) => region.dataConfidence > 0.6)
        .map((region: BrainRegion) => region.id);

      setActiveRegions(significantRegions);
    }
  }, [brainModel, mergedOptions.highlightActiveRegions]);

  // Auto-rotation effect
  useEffect(() => {
    if (!mergedOptions.autoRotate) {
      return;
    }

    console.log('[DEBUG] Starting auto-rotation');
    const rotationInterval = setInterval(() => {
      setViewState((prev) => ({
        ...prev,
        rotationY: prev.rotationY + 0.01,
      }));
    }, 50);

    return () => {
      console.log('[DEBUG] Stopping auto-rotation');
      clearInterval(rotationInterval);
    };
  }, [mergedOptions.autoRotate]);

  // Callback to highlight a specific region
  const highlightRegion = useCallback((regionId: string) => {
    setViewState((prev) => ({
      ...prev,
      highlightedRegions: [...prev.highlightedRegions, regionId],
    }));
  }, []);

  // Callback to clear highlighted regions
  const clearHighlights = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      highlightedRegions: [],
    }));
  }, []);

  // Callback to focus on a specific region
  const focusOnRegion = useCallback(
    (regionId: string) => {
      if (!brainModel) {
        return;
      }

      const region = brainModel.regions.find(
        (r: BrainRegion) => r.id === regionId,
      );
      if (!region) {
        return;
      }

      setViewState((prev) => ({
        ...prev,
        focusPoint: region.position,
        zoom: 2,
        highlightedRegions: [regionId],
      }));
    },
    [brainModel],
  );

  // Callback to reset view to default
  const resetView = useCallback(() => {
    setViewState({
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      zoom: 1,
      highlightedRegions: [],
      visiblePathways: true,
      renderMode: "anatomical" as RenderMode,
      transparencyLevel: 0.8,
      focusPoint: null,
    });
  }, []);

  // Callback to change render mode
  const setRenderMode = useCallback((mode: RenderMode) => {
    setViewState((prev) => ({
      ...prev,
      renderMode: mode,
    }));
  }, []);

  // Find a region by ID
  const findRegionById = useCallback(
    (regionId: string) => {
      if (!brainModel) {
        return null;
      }
      return (
        brainModel.regions.find((r: BrainRegion) => r.id === regionId) || null
      );
    },
    [brainModel],
  );

  // Filter regions based on view state
  const visibleRegions =
    brainModel?.regions.filter((region: BrainRegion) => {
      if (viewState.highlightedRegions.length > 0) {
        return viewState.highlightedRegions.includes(region.id);
      }
      return true;
    }) || [];

  // Filter connections based on view state
  const visibleConnections =
    brainModel?.connections.filter((connection: NeuralConnection) => {
      if (!viewState.visiblePathways) {
        return false;
      }

      if (viewState.highlightedRegions.length > 0) {
        return (
          viewState.highlightedRegions.includes(connection.sourceId) ||
          viewState.highlightedRegions.includes(connection.targetId)
        );
      }

      return true;
    }) || [];

  // Load specific brain model
  const loadBrainModel = useCallback(
    (_modelId: string) => {
      // In a real app, this would update the query parameters
      refetch();
    },
    [refetch],
  );

  // Reset entire visualization
  const resetVisualization = useCallback(() => {
    clearHighlights();
    resetView();
    setActiveRegions([]);
    setViewState((prev) => ({
      ...prev,
      visiblePathways: true,
    }));
  }, [clearHighlights, resetView]);

  return {
    brainModel,
    isLoading,
    error,
    refetch,
    viewState,
    setViewState,
    activeRegions,
    setActiveRegions,
    visibleRegions,
    visibleConnections,
    highlightRegion,
    clearHighlights,
    focusOnRegion,
    resetView,
    resetVisualization,
    loadBrainModel,
    findRegionById,
    setRenderMode,
  };
}
