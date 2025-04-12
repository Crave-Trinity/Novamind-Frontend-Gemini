/* eslint-disable */
/**
 * NOVAMIND Neural Visualization
 * VisualizationControls Molecular Component - clinical interface for visualization parameters
 * with quantum-level precision and neuropsychiatric awareness
 */

import React, { useState, useCallback } from 'react';
import type { VisualizationSettings } from '@domain/types/brain/visualization';
import { RenderMode } from '@domain/types/brain/visualization';

// Neural-safe prop definition with explicit typing
interface VisualizationControlsProps {
  renderMode: RenderMode;
  onRenderModeChange: (mode: RenderMode) => void;
  visualizationSettings?: VisualizationSettings;
  onSettingsChange?: (settings: Partial<VisualizationSettings>) => void;
  showAdvancedControls?: boolean;
  compact?: boolean;
  showResetButton?: boolean;
  className?: string;
}

/**
 * VisualizationControls - Molecular component for neural visualization control interface
 * Implements clinical-grade controls with neural-safe patterns
 */
const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  renderMode,
  onRenderModeChange,
  visualizationSettings,
  onSettingsChange,
  showAdvancedControls = false,
  compact = false,
  showResetButton = true,
  className = '',
}) => {
  // Local state for advanced controls panel
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Handle render mode change with type safety
  const handleRenderModeChange = (mode: RenderMode) => {
    onRenderModeChange(mode);
  };

  // Handle setting changes with type safety
  const handleSettingChange = useCallback(
    <T extends VisualizationSettings[keyof VisualizationSettings]>(
      key: keyof VisualizationSettings,
      value: T
    ) => {
      if (onSettingsChange) {
        onSettingsChange({ [key]: value });
      }
    },
    [onSettingsChange]
  );

  // Reset to default settings
  const handleResetSettings = useCallback(() => {
    if (onSettingsChange) {
      // Default settings based on clinical standards
      onSettingsChange({
        activityThreshold: 0.2,
        showInactiveRegions: true,
        enableDepthOfField: false,
        showRegionCount: true,
        showLegend: true,
        enableBloom: true, // Valid property
        showLabels: true, // Valid property
        backgroundColor: '#000000', // Valid property
      });
    }
  }, [onSettingsChange]);

  // Toggle advanced settings panel
  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  // Get class name based on render mode for styling
  const getModeClassName = (mode: RenderMode) => {
    return renderMode === mode
      ? 'bg-blue-600 text-white font-medium'
      : 'bg-black/50 text-white/80 hover:bg-black/60';
  };

  // Get human-readable name for render mode
  const getRenderModeName = (mode: RenderMode): string => {
    switch (mode) {
      case RenderMode.ANATOMICAL:
        return 'Anatomical';
      case RenderMode.FUNCTIONAL:
        return 'Functional';
      case RenderMode.CONNECTIVITY:
        return 'Connectivity';
      default:
        return mode;
    }
  };

  // Get description for render mode
  const getRenderModeDescription = (mode: RenderMode): string => {
    switch (mode) {
      case RenderMode.ANATOMICAL:
        return 'View anatomical structure';
      case RenderMode.FUNCTIONAL:
        return 'View neural activity';
      case RenderMode.CONNECTIVITY:
        return 'View neural pathways';
      default:
        return '';
    }
  };

  // Get icon for render mode
  const getRenderModeIcon = (mode: RenderMode): string => {
    switch (mode) {
      case RenderMode.ANATOMICAL:
        return '🧠';
      case RenderMode.FUNCTIONAL:
        return '⚡';
      case RenderMode.CONNECTIVITY:
        return '🔄';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Primary controls */}
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-white text-sm font-medium mb-2">Visualization Mode</h3>

        <div className="flex flex-wrap gap-2">
          {/* Render mode buttons */}
          {[RenderMode.ANATOMICAL, RenderMode.FUNCTIONAL, RenderMode.CONNECTIVITY].map((mode) => (
            <button
              key={mode}
              onClick={() => handleRenderModeChange(mode)}
              className={`
                ${getModeClassName(mode)}
                rounded px-3 py-1.5 text-xs flex items-center
                transition-colors duration-200
              `}
              title={getRenderModeDescription(mode)}
            >
              <span className="mr-1.5">{getRenderModeIcon(mode)}</span>
              {!compact && getRenderModeName(mode)}
            </button>
          ))}

          {/* Settings toggle */}
          <button
            onClick={toggleSettings}
            className={`
              ${showSettings ? 'bg-gray-700 text-white' : 'bg-black/50 text-white/80 hover:bg-black/60'}
              rounded px-3 py-1.5 text-xs
              transition-colors duration-200 ml-auto
            `}
            title="Visualization Settings"
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {!compact && 'Settings'}
            </span>
          </button>
        </div>

        {/* Mode description for current mode */}
        {!compact && (
          <div className="mt-2 text-gray-300 text-xs">{getRenderModeDescription(renderMode)}</div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mt-2 bg-black/40 backdrop-blur-sm rounded-lg p-3 w-64 max-w-full">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white text-sm font-medium">Visualization Settings</h3>
            {showResetButton && (
              <button
                onClick={handleResetSettings}
                className="text-xs text-blue-400 hover:text-blue-300"
                title="Reset to default settings"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Activity threshold */}
            <div>
              <label className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Activity Threshold</span>
                <span>{visualizationSettings?.activityThreshold || 0.2}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={visualizationSettings?.activityThreshold || 0.2}
                onChange={(e) =>
                  handleSettingChange('activityThreshold', parseFloat(e.target.value))
                }
                className="w-full h-1.5 rounded-full appearance-none bg-gray-700 outline-none cursor-pointer"
              />
              <div className="flex justify-between text-2xs text-gray-500 mt-0.5">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Toggle switches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300">Show Inactive Regions</label>
                <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={visualizationSettings?.showInactiveRegions !== false}
                    onChange={(e) => handleSettingChange('showInactiveRegions', e.target.checked)}
                  />
                  <div
                    className={`w-8 h-4 rounded-full ${
                      visualizationSettings?.showInactiveRegions !== false
                        ? 'bg-blue-600'
                        : 'bg-gray-700'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transform transition-transform ${
                      visualizationSettings?.showInactiveRegions !== false
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300">Enable Bloom Effect</label>
                <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={visualizationSettings?.enableBloom !== false}
                    onChange={(e) => handleSettingChange('enableBloom', e.target.checked)}
                  />
                  <div
                    className={`w-8 h-4 rounded-full ${
                      visualizationSettings?.enableBloom !== false ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transform transition-transform ${
                      visualizationSettings?.enableBloom !== false
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300">Show Labels</label>
                <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={visualizationSettings?.showLabels !== false}
                    onChange={(e) => handleSettingChange('showLabels', e.target.checked)}
                  />
                  <div
                    className={`w-8 h-4 rounded-full ${
                      visualizationSettings?.showLabels !== false ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transform transition-transform ${
                      visualizationSettings?.showLabels !== false
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-300">Show Legend</label>
                <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={visualizationSettings?.showLegend !== false}
                    onChange={(e) => handleSettingChange('showLegend', e.target.checked)}
                  />
                  <div
                    className={`w-8 h-4 rounded-full ${
                      visualizationSettings?.showLegend !== false ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transform transition-transform ${
                      visualizationSettings?.showLegend !== false
                        ? 'translate-x-4'
                        : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Advanced controls */}
            {showAdvancedControls && (
              <>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <h4 className="text-xs font-medium text-gray-300 mb-2">Advanced Settings</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Depth of Field</label>
                      <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={visualizationSettings?.enableDepthOfField === true}
                          onChange={(e) =>
                            handleSettingChange('enableDepthOfField', e.target.checked)
                          }
                        />
                        <div
                          className={`w-8 h-4 rounded-full ${
                            visualizationSettings?.enableDepthOfField === true
                              ? 'bg-blue-600'
                              : 'bg-gray-700'
                          }`}
                        />
                        <div
                          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transform transition-transform ${
                            visualizationSettings?.enableDepthOfField === true
                              ? 'translate-x-4'
                              : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Background color picker */}
                    <div>
                      <label className="text-xs text-gray-300 block mb-1">Background Color</label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={visualizationSettings?.backgroundColor || '#000000'}
                          onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                          className="w-6 h-6 rounded overflow-hidden cursor-pointer mr-2"
                        />
                        <input
                          type="text"
                          value={visualizationSettings?.backgroundColor || '#000000'}
                          onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                          className="bg-black/60 text-white text-xs rounded px-2 py-1 w-20"
                        />
                      </div>
                    </div>

                    {/* Performance mode */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Performance Mode</label>
                      <select
                        value={visualizationSettings?.performanceMode || 'balanced'}
                        onChange={(e) => handleSettingChange('performanceMode', e.target.value)}
                        className="bg-black/60 text-white text-xs rounded px-2 py-1"
                      >
                        <option value="quality">Quality</option>
                        <option value="balanced">Balanced</option>
                        <option value="performance">Performance</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(VisualizationControls);
