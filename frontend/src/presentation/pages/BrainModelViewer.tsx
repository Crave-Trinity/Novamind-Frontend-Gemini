import React, { useState, useEffect, useCallback } from 'react';
import { useBrainVisualization } from '../../application/hooks/useBrainVisualization';
import { BrainRegion, RenderMode } from '../../domain/models/BrainModel';
import { useTheme } from '../../application/contexts/ThemeContext';
import Button from '../atoms/Button';

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
  height = '600px',
  width = '100%',
  autoRotate = false,
  showControls = true,
  initialRegionId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BrainRegion[]>([]);
  const { theme } = useTheme();
  
  const {
    brainModel,
    isLoading,
    error,
    activeRegions,
    viewState,
    highlightRegion,
    focusOnRegion,
    setRenderMode,
    visibleRegions,
    visiblePathways,
    resetVisualization
  } = useBrainVisualization({ 
    patientId, 
    autoRotate,
    highlightActiveRegions: true 
  });
  
  const [selectedRegion, setSelectedRegion] = useState<BrainRegion | null>(null);
  const [viewMode, setViewMode] = useState<RenderMode>('anatomical' as RenderMode);
  const [highlights, setHighlights] = useState<string[]>([]);
  
  // Component initialization
  useEffect(() => {
    // Initial mode
    handleViewModeChange('anatomical' as RenderMode);
  }, []);

  // Handle region selection
  const handleRegionSelect = (regionId: string) => {
    const region = brainModel?.regions.find((r: BrainRegion) => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
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
  
  // Filter function to find regions by criteria
  const filterRegions = (criteria: string) => {
    return brainModel?.regions.filter((r: BrainRegion) => {
      const searchLower = criteria.toLowerCase();
      return (
        r.name.toLowerCase().includes(searchLower) ||
        (r.description && r.description.toLowerCase().includes(searchLower))
      );
    });
  };

  // Get connections for a region
  const getConnectionsForRegion = (regionId: string) => {
    const region = brainModel?.regions.find((r: BrainRegion) => r.id === regionId);
    return region?.connections || [];
  };
  
  // Get brain regions
  const getBrainRegions = () => {
    if (!brainModel || !brainModel.regions) return [];
    
    const filteredRegions = brainModel.regions.filter((r: BrainRegion) => {
      if (!searchQuery) return true;
      return r.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    return filteredRegions;
  };
  
  // Selected region's connections
  const RegionConnections = () => {
    if (!selectedRegion || !selectedRegion.connections) return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Connected Regions</h4>
        <div className="flex flex-wrap gap-2">
          {selectedRegion.connections.map((connectionId: string, index: number) => {
            const targetRegion = brainModel?.regions.find((r: BrainRegion) => r.id === connectionId);
            return targetRegion ? (
              <button
                key={index}
                onClick={() => handleRegionSelect(targetRegion.id)}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {targetRegion.name}
              </button>
            ) : null;
          })}
        </div>
      </div>
    );
  };

  // Region button component
  const RegionButton = ({ region, isActive, onClick }: { region: BrainRegion, isActive: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center mb-2 px-3 py-2 w-full text-left rounded-md transition-colors ${
        isActive
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }`}
    >
      <div
        className="w-3 h-3 rounded-full mr-3"
        style={{ backgroundColor: region.color }}
      ></div>
      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
        {region.name}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-background-card shadow-sm p-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Interactive Brain Model
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Explore brain regions, neural pathways, and connectivity patterns
        </p>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Visualization Container */}
        <div className="flex-1 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-background dark:to-background-card p-6 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
              <span className="ml-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
                Loading brain model...
              </span>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-lg max-w-md text-center">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Error Loading Model</h3>
                <p className="text-sm">{error ? String(error) : "An error occurred while loading the brain model"}</p>
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => useBrainVisualization({ 
                    patientId, 
                    autoRotate,
                    highlightActiveRegions: true 
                  })}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full w-full relative">
              {/* Placeholder for actual Three.js visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-medium text-neutral-400 dark:text-neutral-500 mb-4">
                    {brainModel ? brainModel.name : 'Brain Model Visualization'}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Three.js component would render here
                  </div>
                </div>
              </div>
              
              {/* Region Labels */}
              {brainModel && highlights.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-xs">
                    {highlights.map(regionId => {
                      const region = brainModel.regions.find((r: BrainRegion) => r.id === regionId);
                      return region ? (
                        <span 
                          key={region.id} 
                          className="inline-block px-2 py-1 m-1 rounded bg-white/10 cursor-pointer"
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
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button 
                  size="sm" 
                  variant={viewMode === 'anatomical' ? 'primary' : 'ghost'}
                  onClick={() => handleViewModeChange('anatomical' as RenderMode)}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Anatomical
                </Button>
                <Button 
                  size="sm" 
                  variant={viewMode === 'functional' ? 'primary' : 'ghost'}
                  onClick={() => handleViewModeChange('functional' as RenderMode)}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Functional
                </Button>
                <Button 
                  size="sm" 
                  variant={viewMode === 'connectivity' ? 'primary' : 'ghost'}
                  onClick={() => handleViewModeChange('connectivity' as RenderMode)}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connectivity
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleResetView}
                  className="justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset View
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Details Panel */}
        <div className="w-80 bg-white dark:bg-background-card border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          {selectedRegion ? (
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Brain Model Visualization</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {selectedRegion ? `Viewing ${selectedRegion.name}` : 'Select a region to view details'}
                </p>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {selectedRegion.name}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                {selectedRegion.description || 'No description available.'}
              </p>
              
              {/* Region Metrics */}
              <div className="mt-4 space-y-4">
                {/* Activity Level */}
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">Activity Level</h3>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${selectedRegion.data?.activity || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>0%</span>
                    <span>{selectedRegion.data?.activity || 0}%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                {/* Volume */}
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">Volume</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {selectedRegion.data?.volumes?.current || selectedRegion.size} cm³
                    </span>
                    <span className="text-xs text-neutral-500">
                      {selectedRegion.data?.volumes?.percentile || 50}th percentile
                    </span>
                  </div>
                </div>
                
                {/* Connectivity Strength */}
                <div>
                  <h3 className="text-xs font-medium text-neutral-500 mb-1">Connectivity</h3>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(selectedRegion.connections.length / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Low</span>
                    <span>{selectedRegion.connections.length} connections</span>
                    <span>High</span>
                  </div>
                </div>
                
                {/* Associated Conditions */}
                {selectedRegion.data?.anomalies && selectedRegion.data.anomalies.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-neutral-500 mb-2">Associated Anomalies</h3>
                    <div className="space-y-1">
                      {selectedRegion.data.anomalies.map((condition: string, index: number) => (
                        <div key={index} className="text-xs py-1 px-2 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded">
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                onClick={handleResetView}
              >
                Clear Selection
              </Button>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col justify-center items-center text-center">
              <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                Select a Brain Region
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                Click on any region in the brain model to view detailed information
              </p>
              
              {brainModel && (
                <div className="w-full max-h-64 overflow-auto bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Available Regions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {brainModel.regions.map((region: BrainRegion) => (
                      <div
                        key={region.id}
                        className="text-xs px-2 py-1.5 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-300 truncate"
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
