import React, { useState, useCallback } from "react";

import { RenderMode } from "../../domain/models/BrainModel";
import Button from "../atoms/Button";

interface BrainVisualizationControlsProps {
  activeRegions: string[];
  onRegionToggle?: (regionId: string) => void;
  onRenderModeChange?: (mode: RenderMode) => void;
  onResetView?: () => void;
  currentRenderMode?: RenderMode;
  disabled?: boolean;
  className?: string;
}

/**
 * Controls for Brain Visualization
 * Provides UI for adjusting visualization parameters
 */
const BrainVisualizationControls: React.FC<BrainVisualizationControlsProps> = ({
  activeRegions,
  onRegionToggle,
  onRenderModeChange,
  onResetView,
  currentRenderMode = RenderMode.ANATOMICAL,
  disabled = false,
  className = "",
}) => {
  const [expanded, setExpanded] = useState(false);

  // Handle render mode change
  const handleRenderModeChange = useCallback(
    (mode: RenderMode) => {
      if (onRenderModeChange) {
        onRenderModeChange(mode);
      }
    },
    [onRenderModeChange],
  );

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Reset view callback
  const handleResetView = useCallback(() => {
    if (onResetView && !disabled) {
      onResetView();
    }
  }, [onResetView, disabled]);

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Visualization Controls
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          aria-label={expanded ? "Collapse controls" : "Expand controls"}
        >
          {expanded ? "Hide" : "Show"}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Render mode selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Render Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(RenderMode).map((mode) => (
                <Button
                  key={mode}
                  variant={currentRenderMode === mode ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => handleRenderModeChange(mode)}
                  disabled={disabled}
                  className="justify-start"
                >
                  {mode.charAt(0).toUpperCase() +
                    mode.slice(1).toLowerCase().replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          {/* Active regions */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Regions ({activeRegions.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {activeRegions.length === 0 ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No active regions
                </span>
              ) : (
                activeRegions.map((regionId) => (
                  <Button
                    key={regionId}
                    variant="outline"
                    size="xs"
                    onClick={() => onRegionToggle && onRegionToggle(regionId)}
                    disabled={disabled}
                  >
                    {regionId}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Reset view */}
          <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetView}
              disabled={disabled}
              fullWidth
            >
              Reset View
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainVisualizationControls;
