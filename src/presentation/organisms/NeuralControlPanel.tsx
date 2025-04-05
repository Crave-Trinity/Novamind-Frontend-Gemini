/**
 * NOVAMIND Neural-Safe Organism Component
 * NeuralControlPanel - Quantum-level control interface
 * with clinical precision and type-safe state management
 */

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Neural visualization coordinator
// import { useVisualizationCoordinator } from "@application/coordinators/NeuralVisualizationCoordinator"; // Module missing

// UI components
// Correct import paths for Shadcn components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider"; // Correct path
import { Button } from "@/components/ui/button"; // Correct path and named import
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Correct path
import { Switch } from "@/components/ui/switch"; // Correct path
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@presentation/atoms/Tooltip"; // Assuming this path is correct
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // Correct path
import { Badge } from "@presentation/atoms/Badge"; // Assuming this path is correct
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Correct path
import { ScrollArea } from "@/components/ui/scroll-area"; // Correct path
import { Progress } from "@/components/ui/progress"; // Add missing Progress import

// Icons
import {
  Brain,
  Activity, // Pulse replaced by Activity
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
  HelpCircle,
  AlertTriangle, // Add missing icon import
} from "lucide-react";

// Domain types
// import { TimeScale } from "@domain/types/temporal/dynamics"; // Type missing
// Define placeholder if needed locally
type PlaceholderTimeScale = "momentary" | "hourly" | "daily" | "weekly" | "monthly";
// import { NeuralTransform } from "@domain/types/neural/transforms"; // Assuming this might be missing too, comment out for now
// Import types needed for placeholder state
import { BrainModel, BrainRegion, NeuralConnection } from "@domain/types/brain/models";
import { ActivationLevel } from "@domain/types/brain/activity";
import { RenderMode } from "@domain/types/brain/visualization"; // Import RenderMode

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
  className = "",
  compact = false,
  allowExport = true,
  showPerformanceControls = true,
}) => {
  // Access visualization coordinator
  // const {
  //   state,
  //   setRenderMode,
  //   setDetailLevel,
  //   setTimeScale,
  //   resetVisualization,
  //   exportVisualizationData,
  // } = useVisualizationCoordinator(); // Commented out - hook missing

  // Placeholder state for type checking
  const state = {
      renderMode: RenderMode.ANATOMICAL, // Use imported enum
      detailLevel: 'medium' as "low" | "medium" | "high" | "ultra", // Use valid literals
      currentTimeScale: 'daily' as PlaceholderTimeScale, // Use placeholder type
      isLoading: false,
      error: null,
      // Provide minimal brainModel structure with correct types
      brainModel: {
        id: '',
        name: '',
        regions: [] as BrainRegion[], // Use imported BrainRegion type
        connections: [] as NeuralConnection[], // Use imported NeuralConnection type
        patientId: '',
        scan: { id: '', type: '', date: '', patientId: '', scanDate: '', scanType: 'MRI', dataQualityScore: 0 } as any, // Use any for nested scan for now
        timestamp: '',
        version: '',
        metadata: {},
        processingStatus: 'complete' as any,
        processingLevel: 'analyzed' as any,
        lastUpdated: ''
      } as BrainModel | null,
      activeRegions: [] as string[],
      selectedRegions: [] as string[],
      treatmentPredictions: [] as any[], // Use 'any' for placeholder simplicity
      selectedTreatmentId: null as string | null, // Add missing property
      performanceMetrics: { frameRate: 60, memoryUsage: 100, dataPointsProcessed: 0 } as any, // Add missing property with placeholder data
      neuralActivation: new Map<string, ActivationLevel>(), // Add missing property
      temporalPatterns: [] as any[], // Use any for placeholder
  };
  // Placeholder functions
  const setRenderMode = (mode: RenderMode) => console.log('setRenderMode called', mode);
  const setDetailLevel = (level: "low" | "medium" | "high" | "ultra") => console.log('setDetailLevel called', level);
  const setTimeScale = (scale: PlaceholderTimeScale) => console.log('setTimeScale called', scale);
  const resetVisualization = () => console.log('resetVisualization called');
  const exportVisualizationData = () => { console.log('exportVisualizationData called'); return {}; };

  // Local UI state
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState("view");

  // Toggle expansion state
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Handle render mode change
  const handleRenderModeChange = useCallback(
    (mode: string) => {
      // setRenderMode(mode as RenderMode); // Commented out, use placeholder
      console.log("Render mode change:", mode);
    },
    [setRenderMode], // Keep dependency for now, even if function is commented out
  );

  // Handle detail level change
  const handleDetailLevelChange = useCallback(
    (level: string) => {
      // setDetailLevel(level as any); // Commented out
      console.log("Detail level change:", level);
    },
    [setDetailLevel], // Keep dependency
  );

  // Handle time scale change
  const handleTimeScaleChange = useCallback(
    (scale: string) => {
      // setTimeScale(scale as PlaceholderTimeScale); // Commented out, use placeholder type
      console.log("Time scale change:", scale);
    },
    [setTimeScale], // Keep dependency
  );

  // Handle reset
  const handleReset = useCallback(() => {
    // resetVisualization(); // Commented out
    console.log("Reset called");
  }, [resetVisualization]); // Keep dependency

  // Handle export
  const handleExport = useCallback(() => {
    // const data = exportVisualizationData(); // Commented out
    const data = {}; // Placeholder
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `novamind-visualization-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportVisualizationData]); // Keep dependency

  // Generate label for current detail level
  const detailLevelLabel = useMemo(() => {
    switch (state.detailLevel) {
      case "low": return "Low";
      case "medium": return "Medium";
      case "high": return "High";
      case "ultra": return "Ultra";
      default: return "Medium";
    }
  }, [state.detailLevel]);

  // Generate label for current render mode
  const renderModeLabel = useMemo(() => {
    // Use RenderMode enum for comparison
    switch (state.renderMode) {
      case RenderMode.ANATOMICAL: return "Anatomical";
      case RenderMode.FUNCTIONAL: return "Functional";
      case RenderMode.CONNECTIVITY: return "Connectivity";
      // Add other cases based on RenderMode enum
      default: return "Anatomical";
    }
  }, [state.renderMode]);

  // Generate label for current time scale
  const timeScaleLabel = useMemo(() => {
    switch (state.currentTimeScale) {
      case "momentary": return "Momentary";
      case "hourly": return "Hourly";
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      default: return "Daily";
    }
  }, [state.currentTimeScale]);

  // Calculate active regions percentage
  const activeRegionsPercentage = useMemo(() => {
    if (
      !state.brainModel ||
      !state.brainModel.regions ||
      state.brainModel.regions.length === 0
    ) {
      return 0;
    }

    return Math.round(
      (state.activeRegions.length / state.brainModel.regions.length) * 100,
    );
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
              <TabsTrigger
                value="view"
                className="data-[state=active]:bg-indigo-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-indigo-600"
              >
                <Activity className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-indigo-600"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="mt-0">
              <div className="space-y-4">
                {/* Render Mode */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Visualization Mode
                    </label>
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
                      {/* Use RenderMode enum values */}
                      {Object.values(RenderMode).map((mode) => (
                         <SelectItem
                           key={mode}
                           value={mode}
                           className="text-white focus:bg-slate-700 focus:text-white"
                         >
                           <div className="flex items-center">
                             {/* Add icons based on mode if desired */}
                             <Brain className="h-4 w-4 mr-2" />
                             {mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, ' ')}
                           </div>
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Detail Level */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">
                      Detail Level
                    </label>
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
                      <SelectItem
                        value="low"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="medium"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="high"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="ultra" // Assuming ultra is a valid level based on previous context
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
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
                    <label className="text-sm font-medium text-slate-300">
                      Time Scale
                    </label>
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
                      <SelectItem
                        value="momentary"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Momentary
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="hourly"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Hourly
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="daily"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Daily
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="weekly"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Weekly
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="monthly"
                        className="text-white focus:bg-slate-700 focus:text-white"
                      >
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Monthly
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Other View Controls */}
                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center">
                    <Eye className="h-4 w-4 mr-2" /> Show Labels
                  </label>
                  <Switch
                    // checked={state.showLabels} // Assuming state has this property
                    // onCheckedChange={(checked) => updateSetting('showLabels', checked)}
                    className="data-[state=checked]:bg-indigo-600 h-4 w-7"
                    // thumbClassName="h-3 w-3 data-[state=checked]:translate-x-3" // Remove invalid prop
                  />
                </div>
                 <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300 flex items-center">
                    <Activity className="h-4 w-4 mr-2" /> Auto-Rotate
                  </label>
                  <Switch
                    // checked={state.autoRotate} // Assuming state has this property
                    // onCheckedChange={(checked) => updateSetting('autoRotate', checked)}
                     className="data-[state=checked]:bg-indigo-600 h-4 w-7"
                     // thumbClassName="h-3 w-3 data-[state=checked]:translate-x-3" // Remove invalid prop
                  />
                </div>

              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-0">
               <div className="space-y-4">
                 {/* Active Regions */}
                 <div className="space-y-1">
                   <div className="flex items-center justify-between">
                     <label className="text-sm font-medium text-slate-300">Active Regions</label>
                     <Badge variant="outline" className="bg-slate-700 text-xs">
                       {activeRegionsPercentage}%
                     </Badge>
                   </div>
                   <Progress value={activeRegionsPercentage} className="h-2 bg-slate-700" />
                 </div>

                 {/* Selected Regions */}
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-300">Selected Regions</label>
                   <div className="bg-slate-700/50 rounded-md p-2">
                     {state.selectedRegions.length > 0 && state.brainModel ? (
                      <ScrollArea className="h-16 rounded-md">
                        <div className="space-y-1 pr-2">
                          {state.selectedRegions.map((regionId) => {
                            const region = state.brainModel?.regions?.find(
                              (r: BrainRegion) => r.id === regionId, // Add type annotation
                            );
                            return (
                              <Badge key={regionId} variant="secondary" className="mr-1 mb-1 text-xs">
                                {region?.name || regionId}
                              </Badge>
                            );
                          })}
                        </div>
                      </ScrollArea>
                     ) : (
                       <p className="text-xs text-slate-400 text-center py-2">No regions selected</p>
                     )}
                   </div>
                 </div>

                 {/* Treatment Predictions (Placeholder) */}
                  <div className="space-y-1">
                   <label className="text-sm font-medium text-slate-300">Treatment Predictions</label>
                   <div className="bg-slate-700/50 rounded-md p-3">
                     {state.treatmentPredictions.length > 0 ? (
                      <ScrollArea className="h-20 rounded-md">
                        <div className="space-y-2">
                          {state.treatmentPredictions.map((treatment: any) => ( // Use any for placeholder
                            <div
                              key={treatment.treatmentId} // Assuming treatment has id
                              className={`flex items-center justify-between p-1.5 rounded text-xs ${
                                treatment.treatmentId ===
                                state.selectedTreatmentId // Check if selected
                                  ? "bg-indigo-600/30 ring-1 ring-indigo-500"
                                  : "hover:bg-slate-600/50"
                              }`}
                              // onClick={() => handleSelectTreatment(treatment.treatmentId)} // Add handler if needed
                            >
                              <span className="font-medium truncate">
                                {treatment.treatmentName || `Treatment ${treatment.treatmentId}`}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-xs py-0 ${
                                  treatment.efficacy === "high"
                                    ? "border-green-600 text-green-300"
                                    : treatment.efficacy === "moderate"
                                      ? "border-amber-600 text-amber-300"
                                      : "border-slate-600 text-slate-400"
                                }`}
                              >
                                {treatment.efficacy || 'N/A'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                     ) : (
                       <p className="text-xs text-slate-400 text-center py-2">No treatment predictions available</p>
                     )}
                   </div>
                 </div>
               </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4">
               {/* Performance Controls */}
               {showPerformanceControls && (
                 <div className="space-y-2">
                   <h3 className="text-sm font-medium text-slate-300">Performance</h3>
                   <div className="flex items-center justify-between">
                     <label className="text-xs text-slate-400 flex items-center">
                       <Activity className="h-3 w-3 mr-1" /> Frame Rate
                     </label>
                     <span className="text-xs text-white">
                       {Math.round(state.performanceMetrics.frameRate)} FPS
                     </span>
                   </div>
                   <Progress
                     value={(state.performanceMetrics.frameRate / 60) * 100}
                     className="h-1 bg-slate-700"
                    // indicatorClassName prop removed
                   />
                   <div className="flex items-center justify-between">
                     <label className="text-xs text-slate-400 flex items-center">
                       <Brain className="h-3 w-3 mr-1" /> Memory Usage
                     </label>
                     <span className="text-xs text-white">
                       {Math.round(state.performanceMetrics.memoryUsage)} MB
                     </span>
                   </div>
                 </div>
               )}

               {/* General Settings */}
               <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  <h3 className="text-sm font-medium text-slate-300">General</h3>
                   <div className="flex items-center justify-between">
                     <label className="text-xs text-slate-400 flex items-center">
                       <Eye className="h-3 w-3 mr-1" /> Show Labels
                     </label>
                     <Switch
                       // checked={state.showLabels}
                       // onCheckedChange={(checked) => updateSetting('showLabels', checked)}
                       className="data-[state=checked]:bg-indigo-600 h-4 w-7"
                       // thumbClassName="h-3 w-3 data-[state=checked]:translate-x-3" // Remove invalid prop
                     />
                   </div>
                   <div className="flex items-center justify-between">
                     <label className="text-xs text-slate-400 flex items-center">
                       <Activity className="h-3 w-3 mr-1" /> Auto-Rotate
                     </label>
                     <Switch
                       // checked={state.autoRotate}
                       // onCheckedChange={(checked) => updateSetting('autoRotate', checked)}
                        className="data-[state=checked]:bg-indigo-600 h-4 w-7"
                        // thumbClassName="h-3 w-3 data-[state=checked]:translate-x-3" // Remove invalid prop
                     />
                   </div>
               </div>

               {/* Actions */}
               <div className="space-y-2 pt-2 border-t border-slate-700/50">
                 <h3 className="text-sm font-medium text-slate-300">Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="text-xs h-8">
                      <RotateCcw className="h-3 w-3 mr-1" /> Reset View
                    </Button>
                    {allowExport && (
                      <Button variant="outline" size="sm" onClick={handleExport} className="text-xs h-8">
                        <Download className="h-3 w-3 mr-1" /> Export Data
                      </Button>
                    )}
                     <Button variant="outline" size="sm" className="text-xs h-8 col-span-2">
                      <Save className="h-3 w-3 mr-1" /> Save Settings
                    </Button>
                  </div>
               </div>

            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="pt-0">
           <div className="flex items-center justify-between w-full">
             <span className="text-xs text-slate-500">
               Time Scale: {state.currentTimeScale}
             </span>
             <span className="text-xs text-slate-500">
               {state.isLoading ? (
                 <span className="flex items-center">
                   <svg
                     className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                   >
                     <circle
                       className="opacity-25"
                       cx="12"
                       cy="12"
                       r="10"
                       stroke="currentColor"
                       strokeWidth="4"
                     ></circle>
                     <path
                       className="opacity-75"
                       fill="currentColor"
                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                     ></path>
                   </svg>
                   Syncing...
                 </span>
               ) : state.error ? (
                 <span className="flex items-center text-red-400">
                   <AlertTriangle className="h-3 w-3 mr-1" /> Error
                 </span>
               ) : (
                 "Controls Ready"
               )}
             </span>
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white">
                     <HelpCircle className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>Neural visualization controls and settings.</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
           </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default NeuralControlPanel;
