import React, { useCallback, useState, Suspense } from 'react';

import { useBrainVisualization } from '@hooks/useBrainVisualization';
import { RenderMode } from '@domain/types/brain/visualization';
import Card from '@presentation/atoms/Card';
import BrainVisualizationControls from '@presentation/molecules/BrainVisualizationControls';
import BrainVisualization from '@presentation/organisms/BrainVisualization';

/**
 * DigitalTwin Demo Page
 * Demonstrates the brain visualization component with controls
 */
const DigitalTwinDemo: React.FC = () => {
  const [currentPatientId, setCurrentPatientId] = useState<string>('demo-patient');
  const [renderMode, setRenderMode] = useState<RenderMode>(RenderMode.ANATOMICAL);

  const {
    brainModel,
    activeRegions,
    setActiveRegions,
    isLoading,
    error,
    resetView,
    setRenderMode: setVisualizationRenderMode,
  } = useBrainVisualization({
    patientId: currentPatientId,
    highlightActiveRegions: true,
    autoRotate: false,
  });

  // Handler for toggling a brain region
  const handleRegionToggle = useCallback(
    (regionId: string) => {
      setActiveRegions((prevRegions) => {
        if (prevRegions.includes(regionId)) {
          return prevRegions.filter((id) => id !== regionId);
        } else {
          return [...prevRegions, regionId];
        }
      });
    },
    [setActiveRegions]
  );

  // Handler for changing render mode
  const handleRenderModeChange = useCallback(
    (mode: RenderMode) => {
      setRenderMode(mode);
      setVisualizationRenderMode(mode);
    },
    [setVisualizationRenderMode]
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Digital Twin Visualization
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Brain visualization container - larger portion */}
        <div className="lg:col-span-9">
          <Card className="h-[calc(100vh-200px)] min-h-[500px]">
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  Loading visualization...
                </div>
              }
            >
              <BrainVisualization
                patientId={currentPatientId}
                initialActiveRegions={activeRegions}
                renderMode={renderMode}
                onRegionClick={handleRegionToggle}
                height="100%"
              />
            </Suspense>
          </Card>
        </div>

        {/* Controls - sidebar */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <h2 className="mb-4 text-xl font-semibold">Digital Twin Details</h2>
            {isLoading ? (
              <p>Loading patient data...</p>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-3 text-red-700">
                <h3 className="font-medium">Error Loading Data</h3>
                <p className="text-sm">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Patient ID</h3>
                  <p className="font-mono">{currentPatientId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Model Version</h3>
                  <p>{brainModel?.metadata?.modelVersion || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Regions</h3>
                  <p>{brainModel?.regions?.length || 0} regions available</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Neural Pathways</h3>
                  <p>{brainModel?.pathways?.length || 0} pathways mapped</p>
                </div>
              </div>
            )}
          </Card>

          <BrainVisualizationControls
            activeRegions={activeRegions}
            onRegionToggle={handleRegionToggle}
            onRenderModeChange={handleRenderModeChange}
            onResetView={resetView}
            currentRenderMode={renderMode}
            disabled={isLoading || !!error}
          />

          <Card>
            <h2 className="mb-4 text-xl font-semibold">Visualization Legend</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-red-500"></div>
                <span>Active Region</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded-full bg-gray-500"></div>
                <span>Inactive Region</span>
              </div>
              {renderMode === RenderMode.FUNCTIONAL && ( // Corrected enum member
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-blue-500"></div>
                  <span>Activity Level</span>
                </div>
              )}
              {renderMode === RenderMode.FUNCTIONAL && (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-green-500"></div>
                  <span>Functional Area</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinDemo;
