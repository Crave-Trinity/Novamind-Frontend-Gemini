/**
 * Neural Visualization Context Provider
 * 
 * Provides quantum-level control and state management for neural visualizations
 * with mathematically precise rendering control and adaptive clinical visualization
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Neural visualization modes for clinical precision
export type RenderMode = 'standard' | 'wireframe' | 'xray' | 'heatmap' | 'clinical';

// Regional activation intensity mapping
export type ActivationLevel = 0 | 1 | 2 | 3 | 4 | 5; // 0=inactive, 5=maximum activation

// Neural visualization settings with clinical parameters
export interface VisualizationSettings {
  renderMode: RenderMode;
  detailLevel: 'low' | 'medium' | 'high' | 'ultra';
  showConnections: boolean;
  connectionThreshold: number; // 0.0 - 1.0
  activationThreshold: number; // 0.0 - 1.0
  sliceView: boolean;
  slicePosition?: number;
  highlightRegions: string[];
  timeScale: number; // Animation speed multiplier
  colorMapping: 'standard' | 'clinical' | 'diagnostic' | 'custom';
  transparencyLevel: number; // 0.0 - 1.0
  annotationsVisible: boolean;
  showClinicalMarkers: boolean;
}

// Default settings for neural visualization with clinical precision
const defaultSettings: VisualizationSettings = {
  renderMode: 'standard',
  detailLevel: 'medium',
  showConnections: true,
  connectionThreshold: 0.3,
  activationThreshold: 0.2,
  sliceView: false,
  highlightRegions: [],
  timeScale: 1.0,
  colorMapping: 'clinical',
  transparencyLevel: 0.1,
  annotationsVisible: true,
  showClinicalMarkers: true,
};

// Visualization context with quantum-level precision types
interface VisualizationContextType {
  settings: VisualizationSettings;
  updateSettings: (settings: Partial<VisualizationSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeRegions: Map<string, ActivationLevel>;
  setActiveRegion: (regionId: string, level: ActivationLevel) => void;
  clearActiveRegions: () => void;
  captureSnapshot: () => Promise<string>; // Returns data URL
}

// Create the context with undefined initial value
const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

// Provider component props
interface VisualizationProviderProps {
  children: ReactNode;
  initialSettings?: Partial<VisualizationSettings>;
}

// Provider component for neural visualization context
export const VisualizationProvider: React.FC<VisualizationProviderProps> = ({
  children,
  initialSettings = {},
}) => {
  // State for visualization settings
  const [settings, setSettings] = useState<VisualizationSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  // Loading state for asynchronous operations
  const [isLoading, setIsLoading] = useState(false);
  
  // Active regions with activation levels
  const [activeRegions, setActiveRegions] = useState<Map<string, ActivationLevel>>(
    new Map()
  );

  // Update visualization settings
  const updateSettings = (newSettings: Partial<VisualizationSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Reset to default visualization settings
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Set activation level for a specific brain region
  const setActiveRegion = (regionId: string, level: ActivationLevel) => {
    setActiveRegions((prev) => {
      const newMap = new Map(prev);
      newMap.set(regionId, level);
      return newMap;
    });
  };

  // Clear all active regions
  const clearActiveRegions = () => {
    setActiveRegions(new Map());
  };

  // Capture a snapshot of the current visualization as data URL
  const captureSnapshot = async (): Promise<string> => {
    // This is a mock implementation for testing
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  };

  // Context value
  const value: VisualizationContextType = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    setIsLoading,
    activeRegions,
    setActiveRegion,
    clearActiveRegions,
    captureSnapshot,
  };

  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
};

// Custom hook for using the visualization context
export const useVisualization = (): VisualizationContextType => {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
};

export default VisualizationContext;