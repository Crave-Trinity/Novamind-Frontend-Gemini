import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";

import LoadingIndicator from "../components/atoms/LoadingIndicator";
import BrainVisualizationContainer from "../components/organisms/BrainVisualizationContainer";
import { auditLogService, AuditEventType } from "../services/AuditLogService";

/**
 * Props for region data
 */
interface BrainRegion {
  id: string;
  name: string;
  activity: number; // 0-1 scale of neural activity
  coordinates: [number, number, number]; // [x, y, z] in 3D space
  connections: string[]; // IDs of connected regions
  size: number; // Size modifier for visualization
  color?: string; // Optional override for default color scheme
}

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
  const [activeRegions, setActiveRegions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<
    "normal" | "activity" | "connections"
  >("normal");

  // Define patient data (in a real app, this would come from an API)
  const patientData = useMemo(
    () => ({
      id: id || "12345",
      name: "Jane Doe",
      age: 32,
      condition: "Major Depressive Disorder",
    }),
    [id],
  );

  // Log brain visualization access for HIPAA compliance
  useEffect(() => {
    auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
      resourceType: "brainModel",
      patientId: id,
      action: "view",
      result: "success",
    });
  }, [id]);

  // Fetch brain data (simulated)
  useEffect(() => {
    const fetchBrainData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Mock data - in a real app this would come from the backend
        const mockBrainRegions: BrainRegion[] = [
          {
            id: "prefrontal",
            name: "Prefrontal Cortex",
            activity: 0.75,
            coordinates: [0, 2, 0],
            connections: ["amygdala", "hippocampus"],
            size: 1.2,
          },
          {
            id: "amygdala",
            name: "Amygdala",
            activity: 0.9,
            coordinates: [-0.5, 0, 0],
            connections: ["prefrontal", "hippocampus"],
            size: 0.8,
          },
          {
            id: "hippocampus",
            name: "Hippocampus",
            activity: 0.6,
            coordinates: [0.5, 0, 0],
            connections: ["prefrontal", "amygdala"],
            size: 0.9,
          },
          {
            id: "thalamus",
            name: "Thalamus",
            activity: 0.5,
            coordinates: [0, 0, 0],
            connections: ["prefrontal"],
            size: 1.0,
          },
          {
            id: "striatum",
            name: "Striatum",
            activity: 0.4,
            coordinates: [0, 1, 0],
            connections: ["prefrontal", "thalamus"],
            size: 0.9,
          },
        ];

        setBrainData(mockBrainRegions);
        setActiveRegions(["prefrontal", "amygdala"]); // Initially active regions
      } catch (err) {
        setError("Failed to load brain visualization data");
        console.error("Error fetching brain data:", err);

        // Log error for HIPAA compliance
        auditLogService.log(AuditEventType.SYSTEM_ERROR, {
          resourceType: "brainModel",
          patientId: id,
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

  // Handle region selection
  const handleRegionSelect = useCallback(
    (regionId: string) => {
      setActiveRegions((prev) => {
        if (prev.includes(regionId)) {
          return prev.filter((id) => id !== regionId);
        } else {
          return [...prev, regionId];
        }
      });

      // Log region selection for HIPAA compliance
      auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
        resourceType: "brainRegion",
        patientId: id,
        resourceId: regionId,
        action: "select",
        result: "success",
      });
    },
    [id],
  );

  // Toggle view mode
  const handleViewModeChange = (
    mode: "normal" | "activity" | "connections",
  ) => {
    setViewMode(mode);
  };

  if (isLoading) {
    return (
      <LoadingIndicator fullScreen text="Loading Brain Visualization..." />
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-lg rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
            Error Loading Visualization
          </h2>
          <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Brain Visualization</h1>
        <div className="text-gray-600 dark:text-gray-400">
          <p>
            Patient: {patientData.name} (ID: {patientData.id})
          </p>
          <p>Condition: {patientData.condition}</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="mb-2 text-lg font-medium">View Controls</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleViewModeChange("normal")}
                className={`rounded px-4 py-2 ${
                  viewMode === "normal"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => handleViewModeChange("activity")}
                className={`rounded px-4 py-2 ${
                  viewMode === "activity"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => handleViewModeChange("connections")}
                className={`rounded px-4 py-2 ${
                  viewMode === "connections"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                Connections
              </button>
            </div>
          </div>

          <div>
            <button className="flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 3D Brain Visualization */}
        <div className="h-96 overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800 md:col-span-2">
          <BrainVisualizationContainer
            brainData={brainData}
            activeRegions={activeRegions}
            viewMode={viewMode}
            onRegionSelect={handleRegionSelect}
          />
        </div>

        {/* Region Selection Panel */}
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
                onClick={() => handleRegionSelect(region.id)}
              >
                <div>
                  <div className="font-medium">{region.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Activity: {Math.round(region.activity * 100)}%
                  </div>
                </div>
                <div className="h-3 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                    style={{ width: `${region.activity * 100}%` }}
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
