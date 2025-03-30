/**
 * Brain Visualization Hook
 * Provides state management and data fetching for 3D brain visualization
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "react-query";

import {
  BrainModel,
  BrainRegion,
  BrainViewState,
  NeuralPathway,
  RenderMode,
} from "../../domain/models/BrainModel";
import { apiClient } from "../../infrastructure/api/ApiClient";

interface UseBrainVisualizationOptions {
  patientId?: string;
  initialViewState?: Partial<BrainViewState>;
  autoRotate?: boolean;
  highlightActiveRegions?: boolean;
  disabled?: boolean;
}

export function useBrainVisualization(options?: UseBrainVisualizationOptions) {
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
  } = useQuery(
    ["brainModel", mergedOptions.patientId],
    async () => {
      return apiClient.getBrainModel(mergedOptions.patientId);
    },
    {
      enabled: !mergedOptions.disabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

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
      const significantRegions = brainModel.regions
        .filter((region: BrainRegion) => region.significance > 0.6)
        .map((region: BrainRegion) => region.id);

      setActiveRegions(significantRegions);
    }
  }, [brainModel, mergedOptions.highlightActiveRegions]);

  // Auto-rotation effect
  useEffect(() => {
    if (!mergedOptions.autoRotate) {
      return;
    }

    const rotationInterval = setInterval(() => {
      setViewState((prev) => ({
        ...prev,
        rotationY: prev.rotationY + 0.01,
      }));
    }, 50);

    return () => clearInterval(rotationInterval);
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
        focusPoint: [
          region.coordinates.x,
          region.coordinates.y,
          region.coordinates.z,
        ],
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

  // Filter pathways based on view state
  const visiblePathways =
    brainModel?.pathways.filter((pathway: NeuralPathway) => {
      if (!viewState.visiblePathways) {
        return false;
      }

      if (viewState.highlightedRegions.length > 0) {
        return (
          viewState.highlightedRegions.includes(pathway.sourceId) ||
          viewState.highlightedRegions.includes(pathway.targetId)
        );
      }

      return true;
    }) || [];

  // Load specific brain model
  const loadBrainModel = useCallback(
    (modelId: string) => {
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
    visiblePathways,
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
