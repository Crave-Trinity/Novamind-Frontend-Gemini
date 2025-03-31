/**
 * NOVAMIND Neural-Safe Organism Component
 * NeuralControlPanel - Quantum-level control interface
 * with clinical precision and type-safe state management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Neural visualization coordinator
import { useVisualizationCoordinator } from '@application/coordinators/NeuralVisualizationCoordinator';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@presentation/atoms/Tabs';
import { Slider } from '@presentation/atoms/Slider';
import { Button } from '@presentation/atoms/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@presentation/atoms/Select';
import { Switch } from '@presentation/atoms/Switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@presentation/atoms/Tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@presentation/atoms/Popover';
import { Badge } from '@presentation/atoms/Badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@presentation/atoms/Card';
import { ScrollArea } from '@presentation/atoms/ScrollArea';

// Icons
import { 
  Brain, 
  Activity, 
  Calendar, 
  Layers, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Zap, 
  Maximize, 
  Minimize,
  ChevronRight,
  Settings,
  Save,
  Download,
  HelpCircle
} from 'lucide-react';

// Domain types
import { TimeScale } from '@domain/types/temporal/dynamics';
import { NeuralTransform } from '@domain/types/neural/transforms';

/**
 * Props with neural-safe typing
 */
interface NeuralControlPanelProps {
  className?: string;
  compact?: boolean;
  allowExport?: boolean;
  showPerformanceControls?: boolean;
}

/**
 * NeuralControlPanel - Organism component for controlling neural visualization
 * with clinical precision and type-safe state management
 */
export const NeuralControlPanel: React.FC<NeuralControlPanelProps> = ({
  className = '',
  compact = false,
  allowExport = true,
  showPerformanceControls = true
}) => {
  // Access visualization coordinator
  const { 
    state, 
    setRenderMode, 
    setDetailLevel, 
    setTimeScale,
    resetVisualization,
    exportVisualizationData
  } = useVisualizationCoordinator();
  
  // Local UI state
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState('view');
  
  // Toggle expansion state
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  // Handle render mode change
  const handleRenderModeChange = useCallback((mode: string) => {
    setRenderMode(mode as any);
  }, [setRenderMode]);
  
  // Handle detail level change
  const handleDetailLevelChange = useCallback((level: string) => {
    setDetailLevel(level as any);
  }, [setDetailLevel]);
  
  // Handle time scale change
  const handleTimeScaleChange = useCallback((scale: string) => {
    setTimeScale(scale as TimeScale);
  }, [setTimeScale]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    resetVisualization();
  }, [resetVisualization]);
  
  // Handle export
  const handleExport = useCallback(() => {
    const data = exportVisualizationData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `novamind-visualization-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportVisualizationData]);
  
  // Generate label for current detail level
  const detailLevelLabel = useMemo(() => {
    switch (state.detailLevel) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'ultra': return 'Ultra';
      default: return 'Medium';
    }
  }, [state.detailLevel]);
  
  // Generate label for current render mode
  const renderModeLabel = useMemo(() => {
    switch (state.renderMode) {
      case 'standard': return 'Standard';
      case 'heatmap': return 'Heatmap';
      case 'connectivity': return 'Connectivity';
      case 'activity': return 'Activity';
      case 'treatment': return 'Treatment';
      default: return 'Standard';
    }
  }, [state.renderMode]);
  
  // Generate label for current time scale
  const timeScaleLabel = useMemo(() => {
    switch (state.currentTimeScale) {
      case 'momentary': return 'Momentary';
      case 'hourly': return 'Hourly';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Daily';
    }
  }, [state.currentTimeScale]);
  
  // Calculate active regions percentage
  const activeRegionsPercentage = useMemo(() => {
    if (!state.brainModel || !state.brainModel.regions || state.brainModel.regions.length === 0) {
      return 0;
    }
    
    return Math.round((state.activeRegions.length / state.brainModel.regions.length) * 100);
  }, [state.brainModel, state.activeRegions]);
  
  // Main panel UI
  if (!expanded) {
    // Collapsed state - show minimal control icon
    return (
      <motion.div
        className={`flex flex-col items-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-slate-800/90 text-white hover:bg-slate-700/90"
                onClick={toggleExpanded}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Neural Control Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }
  
  // Expanded state - full control panel
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-[320px] bg-slate-800/90 backdrop-blur-md text-white border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md flex items-center gap-2 text-white">
              <Brain className="h-5 w-5" />
              Neural Controls
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
              onClick={toggleExpanded}
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-slate-400">
            Configure neural visualization parameters
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4 bg-slate-700/50">
              <TabsTrigger value="view" className="data-[state=active]:bg-indigo-600">
                <Eye className="h-4 w-4 mr-2" />
                View
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-indigo-600">
                <Activity className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="mt-0">
              <div className="space-y-4">
                {/* Render Mode */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Visualization Mode</label>
                    <Badge variant="outline" className="bg-slate-700 text-xs">
                      {renderModeLabel}
                    </Badge>
                  </div>
                  <Select
                    value={state.renderMode}
                    onValueChange={handleRenderModeChange}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 focus:ring-indigo-500">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="standard" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Standard
                        </div>
                      </SelectItem>
                      <SelectItem value="heatmap" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 mr-2" />
                          Heatmap
                        </div>
                      </SelectItem>
                      <SelectItem value="connectivity" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Connectivity
                        </div>
                      </SelectItem>
                      <SelectItem value="activity" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Activity
                        </div>
                      </SelectItem>
                      <SelectItem value="treatment" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Treatment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Detail Level */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Detail Level</label>
                    <Badge variant="outline" className="bg-slate-700 text-xs">
                      {detailLevelLabel}
                    </Badge>
                  </div>
                  <Select
                    value={state.detailLevel}
                    onValueChange={handleDetailLevelChange}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 focus:ring-indigo-500">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="ultra" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          Ultra
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Time Scale */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Time Scale</label>
                    <Badge variant="outline" className="bg-slate-700 text-xs">
                      {timeScaleLabel}
                    </Badge>
                  </div>
                  <Select
                    value={state.currentTimeScale}
                    onValueChange={handleTimeScaleChange}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 focus:ring-indigo-500">
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="momentary" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Momentary
                        </div>
                      </SelectItem>
                      <SelectItem value="hourly" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Hourly
                        </div>
                      </SelectItem>
                      <SelectItem value="daily" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Daily
                        </div>
                      </SelectItem>
                      <SelectItem value="weekly" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Weekly
                        </div>
                      </SelectItem>
                      <SelectItem value="monthly" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Monthly
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-0">
              <div className="space-y-4">
                {/* Current Activity Stats */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Neural Activity</h3>
                  
                  <div className="bg-slate-700/50 rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Active Regions</span>
                      <span className="text-xs font-medium text-white">
                        {state.activeRegions.length} / {state.brainModel?.regions?.length || 0}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${activeRegionsPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Selected Regions</span>
                      <span className="text-xs font-medium text-white">
                        {state.selectedRegions.length}
                      </span>
                    </div>
                    
                    {state.selectedRegions.length > 0 && (
                      <ScrollArea className="h-16 rounded-md">
                        <div className="flex flex-wrap gap-1 p-1">
                          {state.selectedRegions.map(regionId => {
                            const region = state.brainModel?.regions?.find(r => r.id === regionId);
                            if (!region) return null;
                            
                            return (
                              <Badge key={regionId} variant="outline" className="bg-indigo-900/50 text-xs py-0">
                                {region.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
                
                {/* Treatment Analysis */}
                {state.treatmentPredictions.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-slate-300">Treatment Predictions</h3>
                    
                    <div className="bg-slate-700/50 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Treatments Analyzed</span>
                        <span className="text-xs font-medium text-white">
                          {state.treatmentPredictions.length}
                        </span>
                      </div>
                      
                      <ScrollArea className="h-20 rounded-md">
                        <div className="space-y-2">
                          {state.treatmentPredictions.map(treatment => (
                            <div 
                              key={treatment.treatmentId} 
                              className={`flex items-center justify-between rounded-md px-2 py-1 ${
                                treatment.treatmentId === state.selectedTreatmentId
                                  ? 'bg-indigo-900/50'
                                  : 'bg-slate-800/50'
                              }`}
                            >
                              <span className="text-xs text-white">{treatment.treatmentName}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs py-0 ${
                                  treatment.efficacy === 'high'
                                    ? 'bg-green-900/50'
                                    : treatment.efficacy === 'moderate'
                                    ? 'bg-amber-900/50'
                                    : 'bg-red-900/50'
                                }`}
                              >
                                {treatment.efficacy}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0 space-y-4">
              {/* Performance Settings */}
              {showPerformanceControls && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Performance</h3>
                  
                  <div className="bg-slate-700/50 rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">FPS</span>
                      <span className="text-xs font-medium text-white">
                        {Math.round(state.performanceMetrics.frameRate)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          state.performanceMetrics.frameRate > 45
                            ? 'bg-green-600'
                            : state.performanceMetrics.frameRate > 30
                            ? 'bg-amber-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(100, (state.performanceMetrics.frameRate / 60) * 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Memory Usage</span>
                      <span className="text-xs font-medium text-white">
                        {Math.round(state.performanceMetrics.memoryUsage)} MB
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Control Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-300">Actions</h3>
                
                <div className="bg-slate-700/50 rounded-md p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600"
                      onClick={handleReset}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset View
                    </Button>
                    
                    {allowExport && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600"
                        onClick={handleExport}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Help Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-300">Help</h3>
                
                <div className="bg-slate-700/50 rounded-md p-3">
                  <div className="flex items-center text-xs text-slate-300">
                    <HelpCircle className="h-4 w-4 mr-2 text-indigo-400" />
                    <span>
                      Drag to rotate. Scroll to zoom. Right-click and drag to pan.
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between">
          <div className="text-xs text-slate-400">
            {state.isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              state.error ? (
                <span className="text-red-400">Error: {state.error}</span>
              ) : (
                <span>Last updated: {state.performanceMetrics.dataPointsProcessed} points</span>
              )
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default NeuralControlPanel;
