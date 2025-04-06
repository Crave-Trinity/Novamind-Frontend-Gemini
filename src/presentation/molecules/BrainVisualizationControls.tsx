import React, { useCallback } from 'react';

export interface BrainVisualizationControlsProps {
  viewMode: 'normal' | 'activity' | 'connections';
  rotationSpeed: number;
  rotationEnabled: boolean;
  onViewModeChange: (mode: 'normal' | 'activity' | 'connections') => void;
  onRotationSpeedChange: (speed: number) => void;
  onRotationToggle: () => void;
}

/**
 * Brain Visualization Controls
 *
 * Control panel for the 3D brain visualization with various
 * visualization modes and rotation controls.
 */
const BrainVisualizationControls: React.FC<BrainVisualizationControlsProps> = ({
  viewMode,
  rotationSpeed,
  rotationEnabled,
  onViewModeChange,
  onRotationSpeedChange,
  onRotationToggle,
}) => {
  // Handle view mode button click
  const handleViewModeClick = useCallback(
    (mode: 'normal' | 'activity' | 'connections') => {
      onViewModeChange(mode);
    },
    [onViewModeChange]
  );

  // Handle rotation speed change
  const handleRotationSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      onRotationSpeedChange(value);
    },
    [onRotationSpeedChange]
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* View mode controls */}
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-600 dark:text-gray-300">View:</span>
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-l-md border ${
              viewMode === 'normal'
                ? 'bg-primary-500 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => handleViewModeClick('normal')}
          >
            Normal
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium border-t border-b ${
              viewMode === 'activity'
                ? 'bg-primary-500 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => handleViewModeClick('activity')}
          >
            Activity
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-medium rounded-r-md border ${
              viewMode === 'connections'
                ? 'bg-primary-500 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
            onClick={() => handleViewModeClick('connections')}
          >
            Connections
          </button>
        </div>
      </div>

      {/* Rotation controls */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className={`px-3 py-1 text-xs font-medium rounded-md ${
            rotationEnabled
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
          }`}
          onClick={onRotationToggle}
        >
          {rotationEnabled ? 'Rotation: On' : 'Rotation: Off'}
        </button>

        {rotationEnabled && (
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-600 dark:text-gray-300">Speed:</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={rotationSpeed}
              onChange={handleRotationSpeedChange}
              className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(BrainVisualizationControls);
