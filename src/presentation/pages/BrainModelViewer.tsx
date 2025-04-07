import React, { useState, useEffect } from 'react'; // Removed unused useCallback

// Removed unused useTheme import
import { useBrainVisualization } from '@hooks/useBrainVisualization';
import type { BrainRegion } from '@domain/types/brain/models'; // Corrected import path
import type { RenderMode } from '@domain/types/brain/visualization'; // Keep this correct import
// Remove potentially conflicting import if it exists elsewhere
import Button from '@presentation/atoms/Button';

interface BrainModelViewerProps {
  patientId?: string;
  height?: string;
  width?: string;
  autoRotate?: boolean;
  showControls?: boolean;
  initialRegionId?: string;
}

/**
 * 3D Brain Model Viewer Component
 * Visualizes brain regions and neural pathways with clinical annotations
 */
const BrainModelViewer: React.FC<BrainModelViewerProps> = ({
  patientId = 'default',
  // height = '600px', // Removed unused prop
  // width = '100%', // Removed unused prop
  autoRotate = false,
  // showControls = true, // Removed unused prop
  // initialRegionId, // Removed unused prop
}) => {
  // const [searchQuery] = useState(''); // Removed unused state variable
  // Removed unused searchResults state

  const {
    brainModel,
    isLoading,
    error,
    highlightRegion,
    focusOnRegion,
    setRenderMode,
    resetVisualization,
  } = useBrainVisualization({
    patientId,
    autoRotate,
    highlightActiveRegions: true,
  });

  const [selectedRegion, setSelectedRegion] = useState<BrainRegion | null>(null); // Use correct BrainRegion type from models.ts
  const [viewMode, setViewMode] = useState<RenderMode>('anatomical' as RenderMode);
  const [highlights, setHighlights] = useState<string[]>([]);

  // Component initialization
  useEffect(() => {
    // Initial mode
    handleViewModeChange('anatomical' as RenderMode);
  }, []);

  // Handle region selection
  const handleRegionSelect = (regionId: string) => {
    const region = brainModel?.regions.find((r) => r.id === regionId);
    if (region) {
      setSelectedRegion(region || null); // Ensure null is passed if region is undefined
      highlightRegion(regionId);
      focusOnRegion(regionId);
    }
  };

  // Reset view and selection
  const handleResetView = () => {
    setSelectedRegion(null);
    resetVisualization();
    setHighlights([]);
  };

  // Toggle view mode
  const handleViewModeChange = (mode: RenderMode) => {
    setViewMode(mode);

    // Reset highlights when changing mode
    setHighlights([]);

    // Apply the render mode to visualization
    setRenderMode(mode);
  };

  // Removed unused filterRegions function

  // Removed unused getConnectionsForRegion function
  // Removed unused getBrainRegions function

  // Removed unused RegionConnections component

  // Removed unused RegionButton component

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm dark:bg-background-card">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Interactive Brain Model
        </h1>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Explore brain regions, neural pathways, and connectivity patterns
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Visualization Container */}
        <div className="relative flex-1 bg-gradient-to-b from-neutral-50 to-neutral-100 p-6 dark:from-background dark:to-background-card">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary-500"></div>
              <span className="ml-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                Loading brain model...
              </span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="max-w-md rounded-lg bg-red-50 p-4 text-center text-red-500 dark:bg-red-900/20 dark:text-red-400">
                <svg
                  className="mx-auto mb-4 h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold">Error Loading Model</h3>
                <p className="text-sm">
                  {error ? String(error) : 'An error occurred while loading the brain model'}
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    useBrainVisualization({
                      patientId,
                      autoRotate,
                      highlightActiveRegions: true,
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full">
              {/* Placeholder for actual Three.js visualization */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/5 to-purple-900/5 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="text-center">
                  <div className="mb-4 text-xl font-medium text-neutral-400 dark:text-neutral-500">
                    {brainModel ? `Brain Model: ${brainModel.id}` : 'Brain Model Visualization'} // Use brainModel.id instead of name
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Three.js component would render here
                  </div>
                </div>
              </div>

              {/* Region Labels */}
              {brainModel && highlights.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center">
                  <div className="rounded-lg bg-black/30 px-4 py-2 text-xs text-white backdrop-blur-sm">
                    {highlights.map((regionId) => {
                      const region = brainModel.regions.find((r) => r.id === regionId); // Removed explicit type
                      return region ? (
                        <span
                          key={region.id}
                          className="m-1 inline-block cursor-pointer rounded bg-white/10 px-2 py-1"
                          onClick={() => handleRegionSelect(region.id)}
                        >
                          {region.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* View Controls */}
              <div className="absolute right-4 top-4 flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant={viewMode === 'anatomical' ? 'primary' : 'ghost'}
                  onClick={() => handleViewModeChange('anatomical' as RenderMode)}
                  className="justify-start"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                  Anatomical
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'functional' ? 'primary' : 'ghost'}
                  onClick={() => handleViewModeChange('functional' as RenderMode)}
                  className="justify-start"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Functional
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'connectivity' ? 'primary' : 'ghost'}
                  onClick={() => handleViewModeChange('connectivity' as RenderMode)}
                  className="justify-start"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Connectivity
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetView}
                  className="justify-start"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset View
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className="w-80 overflow-y-auto border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-background-card">
          {selectedRegion ? (
            <div className="p-6">
              <div className="mb-4">
                <h2 className="mb-2 text-lg font-semibold">Brain Model Visualization</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedRegion
                    ? `Viewing ${selectedRegion.name}`
                    : 'Select a region to view details'}
                </p>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {selectedRegion.name}
              </h2>
              <p className="mb-4 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {selectedRegion.clinicalSignificance || 'No clinical significance noted.'} {/* Use clinicalSignificance */}
              </p>

              {/* Region Metrics */}
              <div className="mt-4 space-y-4">
                {/* Activity Level */}
                <div>
                  <h3 className="mb-1 text-xs font-medium text-neutral-500">Activity Level</h3>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${selectedRegion.activityLevel * 100 || 0}%`, // Use activityLevel (assuming 0-1 range)
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span>0%</span>
                    <span>{Math.round(selectedRegion.activityLevel * 100) || 0}%</span> {/* Use activityLevel */}
                    <span>100%</span>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <h3 className="mb-1 text-xs font-medium text-neutral-500">Volume</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedRegion.volume || selectedRegion.volumeMl || 'N/A'} cm³ {/* Use volume or volumeMl */}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {/* Removed percentile as it's not available */}
                    </span>
                  </div>
                </div>

                {/* Connectivity Strength */}
                <div>
                  <h3 className="mb-1 text-xs font-medium text-neutral-500">Connectivity</h3>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{
                        width: `${((selectedRegion.connections?.length || 0) / 10) * 100}%`, // Add null check
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span>Low</span>
                    <span>{selectedRegion.connections?.length || 0} connections</span>{' '}
                    {/* Add null check */}
                    <span>High</span>
                  </div>
                </div>

                {/* Associated Conditions - Removed as 'anomalies' property doesn't exist */}
              </div>

              <Button variant="outline" size="sm" fullWidth onClick={handleResetView}>
                Clear Selection
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <svg
                className="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-neutral-900 dark:text-white">
                Select a Brain Region
              </h3>
              <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                Click on any region in the brain model to view detailed information
              </p>

              {brainModel && (
                <div className="max-h-64 w-full overflow-auto rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
                  <h4 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Available Regions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {brainModel.regions.map((region) => ( // Removed explicit type
                      <div
                        key={region.id}
                        className="cursor-pointer truncate rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        onClick={() => handleRegionSelect(region.id)}
                      >
                        {region.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainModelViewer;
