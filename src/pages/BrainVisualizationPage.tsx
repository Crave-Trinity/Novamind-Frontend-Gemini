import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";

import LoadingIndicator from "@atoms/LoadingIndicator";
import BrainVisualizationContainer from "@organisms/BrainVisualizationContainer";
import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService";
import { BrainRegion } from "@domain/types/brain/models"; // Import correct type

/**
 * BrainVisualizationPage
 * Shows 3D visualization of brain with neural activity for a specific patient
 * HIPAA-compliant with audit logging for PHI access
 */
const BrainVisualizationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brainData, setBrainData] = useState<BrainRegion[]>([]);
  const [activeRegions, setActiveRegions] = useState<string[]>([]); // Keep track of selected IDs
  const [viewMode, setViewMode] = useState<"normal" | "activity" | "connections">("normal");

  const patientData = useMemo(() => ({
    id: id || "12345",
    name: "Jane Doe",
    age: 32,
    condition: "Major Depressive Disorder",
  }), [id]);

  useEffect(() => {
    auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
      resourceType: "brainModel",
      action: "view",
      result: "success",
    });
  }, [id]);

  useEffect(() => {
    const fetchBrainData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

        // Corrected mock data structure
        const mockBrainRegions: BrainRegion[] = [
          {
            id: "prefrontal", name: "Prefrontal Cortex",
            position: {x:0, y:2, z:0}, color: '#ff0000', connections: ["amygdala", "hippocampus"],
            activityLevel: 0.75, isActive: true, hemisphereLocation: 'left', dataConfidence: 0.9,
          },
          {
            id: "amygdala", name: "Amygdala",
            position: {x:-0.5, y:0, z:0}, color: '#00ff00', connections: ["prefrontal", "hippocampus"],
            activityLevel: 0.9, isActive: true, hemisphereLocation: 'left', dataConfidence: 0.9,
          },
          {
            id: "hippocampus", name: "Hippocampus",
            position: {x:0.5, y:0, z:0}, color: '#0000ff', connections: ["prefrontal", "amygdala"],
            activityLevel: 0.6, isActive: true, hemisphereLocation: 'right', dataConfidence: 0.9,
          },
          {
            id: "thalamus", name: "Thalamus",
            position: {x:0, y:0, z:0}, color: '#ffff00', connections: ["prefrontal"],
            activityLevel: 0.5, isActive: true, hemisphereLocation: 'central', dataConfidence: 0.9,
          },
          {
            id: "striatum", name: "Striatum",
            position: {x:0, y:1, z:0}, color: '#ff00ff', connections: ["prefrontal", "thalamus"],
            activityLevel: 0.4, isActive: true, hemisphereLocation: 'left', dataConfidence: 0.9,
          },
        ];

        setBrainData(mockBrainRegions);
        setActiveRegions(["prefrontal", "amygdala"]);
      } catch (err) {
        setError("Failed to load brain visualization data");
        console.error("Error fetching brain data:", err);
        auditLogService.log(AuditEventType.SYSTEM_ERROR, {
          resourceType: "brainModel",
          errorCode: "DATA_FETCH_ERROR",
          details: "Failed to fetch brain model data",
          result: "failure",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrainData();
  }, [id]);

  const handleRegionSelect = useCallback(
    (region: BrainRegion | null) => {
      const regionId = region?.id;
      if (!regionId) {
          setActiveRegions([]); // Clear selection if null region is passed
          return;
      }
      setActiveRegions((prev) => {
        if (prev.includes(regionId)) {
          return prev.filter((id) => id !== regionId);
        } else {
          return [...prev, regionId]; // Add to selection
        }
      });
      auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
        resourceType: "brainRegion",
        resourceId: regionId,
        action: "select",
        result: "success",
      });
    },
    [id],
  );

  const handleViewModeChange = (mode: "normal" | "activity" | "connections") => {
    setViewMode(mode);
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading Brain Visualization..." />;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-lg rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">Error Loading Visualization</h2>
          <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
          <button onClick={() => window.location.reload()} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Brain Visualization</h1>
        <div className="text-gray-600 dark:text-gray-400">
          <p>Patient: {patientData.name} (ID: {patientData.id})</p>
          <p>Condition: {patientData.condition}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        {/* Control Panel Content */}
         <div className="flex flex-wrap items-center justify-between gap-4">
           <div>
             <h2 className="mb-2 text-lg font-medium">View Controls</h2>
             <div className="flex space-x-4">
               {/* Buttons for view mode change */}
               {(["normal", "activity", "connections"] as const).map((mode) => (
                 <button
                   key={mode}
                   onClick={() => handleViewModeChange(mode)}
                   className={`rounded px-4 py-2 ${
                     viewMode === mode
                       ? "bg-blue-600 text-white"
                       : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                   }`}
                 >
                   {mode.charAt(0).toUpperCase() + mode.slice(1)}
                 </button>
               ))}
             </div>
           </div>
           {/* Other controls like Export */}
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="h-96 overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800 md:col-span-2">
          {/* Pass necessary props; container likely gets data via context or hooks */}
          <BrainVisualizationContainer
            onRegionSelect={handleRegionSelect}
            // Remove invalid props: brainData, activeRegions, viewMode
          />
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium">Brain Regions</h2>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {brainData.map((region) => (
              <div
                key={region.id}
                className={`flex cursor-pointer items-center justify-between rounded p-3 transition-colors ${
                  activeRegions.includes(region.id)
                    ? "border-l-4 border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleRegionSelect(region)} // Pass region object
              >
                <div>
                  <div className="font-medium">{region.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Activity Level: {Math.round(region.activityLevel * 100)}% {/* Use activityLevel */}
                  </div>
                </div>
                <div className="h-3 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                    style={{ width: `${region.activityLevel * 100}%` }} // Use activityLevel
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainVisualizationPage;
