import React, { useCallback, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
// @ts-ignore - Types will be handled by overrides in package.json
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { auditLogClient, AuditEventType } from '@infrastructure/clients/auditLogClient'; // Corrected import name
import type { NeuralNode } from '@organisms/BrainModel';

// Lazy-loaded brain model for code splitting
const BrainModel = React.lazy(() => import('@organisms/BrainModel'));

interface BrainModelContainerProps {
  /**
   * Patient identifier
   */
  patientId: string;

  /**
   * Dataset identifier (optional)
   */
  datasetId?: string;

  /**
   * Initially selected brain region (optional)
   */
  initialRegion?: string;

  /**
   * Whether to display controls (default: true)
   */
  showControls?: boolean;

  /**
   * Background color (default: transparent)
   */
  backgroundColor?: string;
}

/**
 * Brain Model Container Component
 *
 * Container component that manages data loading, state, and presentation
 * for the 3D brain visualization. Handles HIPAA-compliant logging,
 * data processing, and clinical annotations.
 */
const BrainModelContainer: React.FC<BrainModelContainerProps> = ({
  patientId,
  datasetId,
  initialRegion,
  showControls = true,
  backgroundColor = 'transparent',
}) => {
  // State for brain data
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [highlightedRegion, setHighlightedRegion] = useState<string | undefined>(initialRegion);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Simulated brain regions (would come from API in real app)
  const brainRegions = useMemo(
    () => [
      {
        id: 'prefrontal',
        name: 'Prefrontal Cortex',
        color: [0.4, 0.6, 1.0] as [number, number, number],
      },
      { id: 'temporal', name: 'Temporal Lobe', color: [0.2, 0.8, 0.4] as [number, number, number] },
      { id: 'parietal', name: 'Parietal Lobe', color: [0.9, 0.3, 0.3] as [number, number, number] },
      {
        id: 'occipital',
        name: 'Occipital Lobe',
        color: [0.8, 0.8, 0.2] as [number, number, number],
      },
      { id: 'limbic', name: 'Limbic System', color: [0.8, 0.4, 0.8] as [number, number, number] },
      { id: 'cerebellum', name: 'Cerebellum', color: [0.4, 0.4, 0.9] as [number, number, number] },
      { id: 'brainstem', name: 'Brainstem', color: [0.6, 0.6, 0.6] as [number, number, number] },
    ],
    []
  );

  // Load brain data
  useEffect(() => {
    const loadBrainData = async () => {
      try {
        setLoading(true);

        // Log data access for HIPAA compliance
        auditLogClient.log(AuditEventType.PATIENT_RECORD_VIEW, { // Corrected usage again
          action: 'load_brain_model',
          resourceId: patientId,
          resourceType: 'brain_visualization',
          details: `Loading brain model for patient ${patientId}${datasetId ? ` dataset ${datasetId}` : ''}`,
          result: 'success',
        });

        // Simulate API call - in a real app, this would be a fetch to the backend
        // with proper authentication and error handling
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Generate demo data (in production this would come from the API)
        const mockNodes: NeuralNode[] = [];
        const regionDensity = {
          prefrontal: 80,
          temporal: 60,
          parietal: 50,
          occipital: 40,
          limbic: 30,
          cerebellum: 50,
          brainstem: 20,
        };

        // Generate simulated neural nodes for each region
        Object.entries(regionDensity).forEach(([region, count]) => {
          const regionInfo = brainRegions.find((r) => r.id === region);
          const color = regionInfo?.color || [0.5, 0.5, 0.5];

          for (let i = 0; i < count; i++) {
            // Create pseudorandom positions based on region
            let x, y, z;

            // Position nodes according to anatomical regions
            switch (region) {
              case 'prefrontal':
                x = Math.random() * 2 - 1 + 2;
                y = Math.random() * 2 - 0.5 + 1;
                z = Math.random() * 2 - 1;
                break;
              case 'temporal':
                x = Math.random() * 2 - 1 + 1;
                y = Math.random() * 1 - 1.5;
                z = Math.random() * 2 - 1 + 1;
                break;
              case 'parietal':
                x = Math.random() * 2 - 1 - 0.5;
                y = Math.random() * 1 + 1;
                z = Math.random() * 2 - 1 + 0.5;
                break;
              case 'occipital':
                x = Math.random() * 2 - 1 - 2;
                y = Math.random() * 1 + 0;
                z = Math.random() * 2 - 1;
                break;
              case 'limbic':
                x = Math.random() * 2 - 1;
                y = Math.random() * 1 - 0.5;
                z = Math.random() * 1;
                break;
              case 'cerebellum':
                x = Math.random() * 2 - 1;
                y = Math.random() * 1 - 2;
                z = Math.random() * 2 - 1 - 1;
                break;
              case 'brainstem':
                x = Math.random() * 1 - 0.5;
                y = Math.random() * 1 - 2.5;
                z = Math.random() * 1 - 0.5;
                break;
              default:
                x = Math.random() * 6 - 3;
                y = Math.random() * 6 - 3;
                z = Math.random() * 6 - 3;
            }

            // Add slight variation to colors for visual diversity
            const colorVariation = 0.1;
            const nodeColor: [number, number, number] = [
              Math.min(
                1,
                Math.max(0, color[0] + (Math.random() * colorVariation * 2 - colorVariation))
              ),
              Math.min(
                1,
                Math.max(0, color[1] + (Math.random() * colorVariation * 2 - colorVariation))
              ),
              Math.min(
                1,
                Math.max(0, color[2] + (Math.random() * colorVariation * 2 - colorVariation))
              ),
            ];

            // Activation level - in a real app this would be from clinical data
            const activation = Math.random();

            // Size variance - smaller nodes for less active regions
            const sizeBase = activation * 0.5 + 0.2;

            mockNodes.push({
              id: `${region}-${i}`,
              position: [x, y, z],
              size: sizeBase,
              color: nodeColor,
              activation,
              region,
              clinicalData: {
                activityDelta: (Math.random() * 2 - 1) * 0.5,
                markers: Math.random() > 0.8 ? ['anomaly'] : [],
              },
            });
          }
        });

        setNodes(mockNodes);
        setIsDataLoaded(true);
        setLoading(false);
      } catch (err) {
        setError('Failed to load brain data.');
        setLoading(false);

        // Log error for HIPAA compliance (without PHI)
        auditLogClient.log(AuditEventType.SYSTEM_ERROR, { // Corrected usage again
          action: 'load_brain_model_error',
          errorCode: 'DATA_LOAD_FAILURE',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          result: 'failure',
        });
      }
    };

    loadBrainData();

    // Cleanup function
    return () => {
      // Log end of visualization session
      auditLogClient.log(AuditEventType.PATIENT_RECORD_VIEW, { // Corrected usage again
        action: 'close_brain_model',
        resourceId: patientId,
        resourceType: 'brain_visualization',
        details: 'Closed brain visualization',
        result: 'success',
      });
    };
  }, [patientId, datasetId, brainRegions]);

  // Handle node selection
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);

      // Find node and region
      const node = nodes.find((n) => n.id === nodeId);

      // Log for HIPAA compliance
      if (node) {
        auditLogClient.log(AuditEventType.PATIENT_RECORD_VIEW, { // Corrected usage again
          action: 'select_neural_node',
          resourceId: patientId,
          resourceType: 'neural_node',
          details: `Selected neural node ${node.id} in region ${node.region}`,
          result: 'success',
        });
      }
    },
    [nodes, patientId]
  );

  // Handle region selection
  const handleRegionSelect = useCallback(
    (regionId: string) => {
      setHighlightedRegion(regionId === highlightedRegion ? undefined : regionId);

      // Log for HIPAA compliance
      auditLogClient.log(AuditEventType.PATIENT_RECORD_VIEW, { // Corrected usage again
        action: 'highlight_brain_region',
        resourceId: patientId,
        resourceType: 'brain_region',
        details: `Highlighted brain region ${regionId}`,
        result: 'success',
      });
    },
    [highlightedRegion, patientId]
  );

  // Render loading state
  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading brain visualization...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Visualization Error
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Main visualization container */}
      <div className="w-full h-[600px] rounded-lg overflow-hidden" style={{ backgroundColor }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          {/* Environment lighting for realistic rendering */}
          <Environment preset="city" />

          {/* Ambient light */}
          <ambientLight intensity={0.5} />

          {/* Directional key light */}
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />

          {/* Fill light */}
          <directionalLight position={[-10, 5, -5]} intensity={0.3} color="#a0a0ff" />

          {/* Camera controls */}
          {showControls && (
            <OrbitControls
              // enableDamping // Prop already removed
              dampingFactor={0.1}
              rotateSpeed={0.5}
              maxDistance={20}
              minDistance={3}
            />
          )}

          {/* Brain model with loading fallback */}
          <Suspense fallback={null}>
            {isDataLoaded && (
              <BrainModel
                nodes={nodes}
                {...(selectedNodeId ? { selectedNodeId } : {})}
                {...(highlightedRegion ? { highlightedRegion } : {})}
                onNodeClick={handleNodeClick}
                autoRotate={!showControls}
              />
            )}
          </Suspense>

          {/* Post-processing effects for visual enhancements */}
          <EffectComposer>
            <Bloom intensity={1.0} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Region selection controls */}
      {showControls && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {brainRegions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionSelect(region.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                highlightedRegion === region.id
                  ? 'bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={{
                backgroundColor:
                  highlightedRegion === region.id
                    ? `rgb(${region.color[0] * 255}, ${region.color[1] * 255}, ${region.color[2] * 255})`
                    : undefined,
                color: highlightedRegion === region.id ? '#fff' : undefined,
              }}
            >
              {region.name}
            </button>
          ))}
        </div>
      )}

      {/* Node details panel (shown when a node is selected) */}
      {selectedNodeId && (
        <div className="absolute top-4 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 text-sm pointer-events-auto z-10">
          <h3 className="font-medium text-gray-900 dark:text-white">Neural Node Detail</h3>

          {(() => {
            const node = nodes.find((n) => n.id === selectedNodeId);
            if (!node) return <p>Node not found</p>;

            // Find region info
            const regionInfo = brainRegions.find((r) => r.id === node.region);

            return (
              <div className="mt-2">
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Region: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {regionInfo?.name || node.region}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Position: </span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      [{node.position.map((p) => p.toFixed(2)).join(', ')}]
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Activation: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.floor(node.activation * 100)}%
                    </span>
                  </div>

                  {node.clinicalData?.activityDelta !== undefined && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Δ from baseline: </span>
                      <span
                        className={`font-medium ${
                          node.clinicalData.activityDelta > 0
                            ? 'text-green-600 dark:text-green-400'
                            : node.clinicalData.activityDelta < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {node.clinicalData.activityDelta > 0
                          ? '+'
                          : node.clinicalData.activityDelta < 0
                            ? ''
                            : '±'}
                        {Math.abs(node.clinicalData.activityDelta * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {node.clinicalData?.markers && node.clinicalData.markers.length > 0 && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Markers: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {node.clinicalData.markers.map((marker) => (
                          <span
                            key={marker}
                            className="px-1.5 py-0.5 rounded-sm text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                          >
                            {marker}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="mt-4 w-full py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  onClick={() => setSelectedNodeId(undefined)}
                >
                  Close
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default BrainModelContainer;
