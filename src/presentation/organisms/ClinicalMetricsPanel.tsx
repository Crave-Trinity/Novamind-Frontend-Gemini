/**
 * NOVAMIND Neural-Safe Organism Component
 * ClinicalMetricsPanel - Quantum-level clinical metrics display
 * with HIPAA-compliant data visualization and type-safe state management
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
import { Button } from "@/components/ui/button"; // Correct path and named import
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@presentation/atoms/Tooltip"; // Assuming this path is correct
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
import { Progress } from "@/components/ui/progress"; // Correct path

// Icons
import {
  BarChart,
  Activity, // Pulse replaced by Activity
  Brain,
  Calendar,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Minimize,
  Maximize,
  BrainCircuit,
  Clock,
  Settings, // Added missing icon
  Save, // Added missing icon
  Download, // Added missing icon
  HelpCircle, // Added missing icon
  Eye, // Added missing icon
  EyeOff, // Added missing icon
  RotateCcw, // Added missing icon
  Zap, // Added missing icon
  Layers, // Added missing icon
} from "lucide-react";

// Domain types
import { ActivationLevel } from "@domain/types/brain/activity";
import { BrainModel, BrainRegion, NeuralConnection } from "@domain/types/brain/models"; // Import types for placeholder state
import { RenderMode } from "@domain/types/brain/visualization"; // Import RenderMode for placeholder state
import {
  // CriticalTransitionIndicator, // Type missing
  // TemporalPattern, // Type missing
  // TimeScale, // Type missing
} from "@domain/types/temporal/dynamics";

// Placeholder types for missing domain types
type PlaceholderTemporalPattern = {
  id: string;
  class: string;
  timeScale: string;
  criticalTransition?: boolean;
  description?: string;
};
type PlaceholderCriticalTransition = any; // Use 'any' as structure is unknown
type PlaceholderTimeScale = "momentary" | "hourly" | "daily" | "weekly" | "monthly";

/**
 * Props with neural-safe typing
 */
interface ClinicalMetricsPanelProps {
  className?: string;
  compact?: boolean;
  showMinimap?: boolean;
  showConfidenceIntervals?: boolean;
}

/**
 * Neural-safe activation level to color mapping
 */
const activationLevelColorMap: Record<ActivationLevel, string> = {
  [ActivationLevel.NONE]: "bg-slate-600", // Map NONE to baseline color
  [ActivationLevel.LOW]: "bg-blue-600", // Map LOW to suppressed color
  [ActivationLevel.MEDIUM]: "bg-green-600", // Add MEDIUM mapping (e.g., green)
  [ActivationLevel.HIGH]: "bg-amber-600", // Map HIGH to elevated color
  [ActivationLevel.EXTREME]: "bg-red-600", // Map EXTREME to hyperactive color
};

/**
 * ClinicalMetricsPanel - Organism component for displaying clinical metrics
 * with HIPAA-compliant data visualization and type-safe state management
 */
export const ClinicalMetricsPanel: React.FC<ClinicalMetricsPanelProps> = ({
  className = "",
  compact = false,
  showMinimap = false,
  showConfidenceIntervals = true,
}) => {
  // Access visualization coordinator
  // const { state } = useVisualizationCoordinator(); // Commented out - hook missing
  // Placeholder state for type checking
  const state = {
      neuralActivation: new Map<string, ActivationLevel>(),
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
      temporalPatterns: [] as PlaceholderTemporalPattern[],
      currentTimeScale: 'daily' as PlaceholderTimeScale,
      isLoading: false,
      error: null,
      // Add other properties used below if needed
      selectedRegions: [] as string[],
      treatmentPredictions: [] as any[],
      selectedTreatmentId: null as string | null,
      performanceMetrics: { frameRate: 60, memoryUsage: 100, dataPointsProcessed: 0 } as any,
      renderMode: RenderMode.ANATOMICAL, // Add missing properties used in component
      detailLevel: 'medium' as "low" | "medium" | "high" | "ultra",
  };

  // Local UI state
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState("activity");

  // Toggle expansion state
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Process activation levels for visualization
  const activationMetrics = useMemo(() => {
    const counts: Record<ActivationLevel, number> = {
      [ActivationLevel.NONE]: 0,
      [ActivationLevel.LOW]: 0,
      [ActivationLevel.MEDIUM]: 0,
      [ActivationLevel.HIGH]: 0,
      [ActivationLevel.EXTREME]: 0,
    };

    // Count regions by activation level
    state.neuralActivation.forEach((level) => {
      if (level in counts) { // Type guard
        counts[level]++;
      }
    });

    // Calculate percentages
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const percentages: Record<ActivationLevel, number> = {
      [ActivationLevel.NONE]: total > 0 ? (counts[ActivationLevel.NONE] / total) * 100 : 0,
      [ActivationLevel.LOW]: total > 0 ? (counts[ActivationLevel.LOW] / total) * 100 : 0,
      [ActivationLevel.MEDIUM]: total > 0 ? (counts[ActivationLevel.MEDIUM] / total) * 100 : 0,
      [ActivationLevel.HIGH]: total > 0 ? (counts[ActivationLevel.HIGH] / total) * 100 : 0,
      [ActivationLevel.EXTREME]: total > 0 ? (counts[ActivationLevel.EXTREME] / total) * 100 : 0,
    };

    // Get top active regions (elevated or hyperactive)
    const topActiveRegions = Array.from(state.neuralActivation.entries())
      // Filter for HIGH or EXTREME levels based on the enum
      .filter(([_, level]) => level === ActivationLevel.HIGH || level === ActivationLevel.EXTREME)
      .map(([regionId, level]) => {
        const region = state.brainModel?.regions?.find(
          (r) => r.id === regionId,
        );
        return {
          id: regionId,
          name: region?.name || regionId,
          level,
        };
      })
      .sort((a, b) =>
        // Sort by EXTREME first, then HIGH
        (a.level === ActivationLevel.EXTREME && b.level !== ActivationLevel.EXTREME) ? -1 :
        (a.level !== ActivationLevel.EXTREME && b.level === ActivationLevel.EXTREME) ? 1 :
        (a.level === ActivationLevel.HIGH && b.level !== ActivationLevel.HIGH) ? -1 : 1
      )
      .slice(0, 5);

    // Calculate neural entropy
    // Higher entropy = more variability in activation levels
    let entropy = 0;
    Object.values(percentages).forEach((percent) => {
      if (percent > 0) {
        const p = percent / 100;
        entropy -= p * Math.log2(p);
      }
    });
    // Normalize to 0-100 range (max entropy for 5 states is ~2.32)
    const normalizedEntropy = (entropy / Math.log2(5)) * 100;

    return {
      counts,
      percentages,
      topActiveRegions,
      entropy: normalizedEntropy,
    };
  }, [state.neuralActivation, state.brainModel]);

  // Process temporal patterns for visualization
  const temporalMetrics = useMemo(() => {
    // Get patterns for current time scale
    const currentPatterns = state.temporalPatterns.filter(
      (pattern: PlaceholderTemporalPattern) => pattern.timeScale === state.currentTimeScale, // Use placeholder type and state
    );

    // Count patterns by class
    const patternCounts: Record<string, number> = {
      trend: 0,
      cycle: 0,
      anomaly: 0,
    };

    currentPatterns.forEach((pattern) => {
      patternCounts[pattern.class] = (patternCounts[pattern.class] || 0) + 1;
    });

    // Get critical transitions (early warning signals)
    const criticalTransitions: PlaceholderCriticalTransition[] = state.temporalPatterns // Use placeholder state and type
      .filter(
        (pattern: PlaceholderTemporalPattern) => // Use placeholder type
          pattern.timeScale === state.currentTimeScale && // Use placeholder state
          pattern.criticalTransition,
      )
      .slice(0, 3);

    // Calculate stability index (inverse of potential for state transitions)
    // Lower value = more likely to transition (less stable)
    const stabilityIndex = Math.max(
      0,
      100 - criticalTransitions.length * 20 - patternCounts.anomaly * 10,
    );

    return {
      patternCounts,
      criticalTransitions,
      stabilityIndex,
      patternCount: currentPatterns.length,
    };
  }, [state.temporalPatterns, state.currentTimeScale]); // Use placeholder state

  // Add helper function (copied from ClinicalTimelinePanel or simplified)
  const formatTimestamp = (date: string | Date): string => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // Main panel UI
  if (!expanded) {
    // Collapsed state - show minimal info
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
                <BarChart className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Clinical Metrics Panel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }

  // Expanded state - full metrics panel
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
            <CardTitle className="text-md flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Clinical Metrics
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
            Real-time neuropsychiatric metrics
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 bg-slate-700/50">
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-indigo-600"
              >
                <BrainCircuit className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="temporal"
                className="data-[state=active]:bg-indigo-600"
              >
                <Clock className="h-4 w-4 mr-2" />
                Temporal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-0">
              <div className="space-y-4">
                {/* Neural Activation Overview */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Neural Activation Profile
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Elevated Activity */}
                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Elevated
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-amber-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts[ActivationLevel.HIGH]}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages[ActivationLevel.HIGH]}
                        className="h-1 bg-slate-700"
                        // indicatorClassName prop removed
                      />
                    </div>

                    {/* Hyperactive Activity */}
                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Extreme
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-red-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts[ActivationLevel.EXTREME]}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages[ActivationLevel.EXTREME]}
                        className="h-1 bg-slate-700"
                         // indicatorClassName prop removed
                      />
                    </div>

                    {/* Baseline Activity */}
                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Baseline</span>
                        <Badge
                          variant="outline"
                          className="bg-slate-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts[ActivationLevel.NONE]}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages[ActivationLevel.NONE]}
                        className="h-1 bg-slate-700"
                         // indicatorClassName prop removed
                      />
                    </div>

                    {/* Suppressed Activity */}
                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Low/Suppressed
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts[ActivationLevel.LOW]}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages[ActivationLevel.LOW]}
                        className="h-1 bg-slate-700"
                         // indicatorClassName prop removed
                      />
                    </div>
                  </div>
                </div>

                {/* Top Active Regions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Top Active Regions
                  </h3>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    {activationMetrics.topActiveRegions.length > 0 ? (
                      <div className="space-y-2">
                        {activationMetrics.topActiveRegions.map((region: any) => ( // Use any temporarily
                          <div
                            key={region.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-white truncate max-w-[70%]">
                              {region.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs py-0 ${
                                region.level === ActivationLevel.EXTREME // Use enum value
                                  ? "bg-red-900/50"
                                  : "bg-amber-900/50"
                              }`}
                            >
                              {region.level}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-2">
                        No elevated activity detected
                      </div>
                    )}
                  </div>
                </div>

                {/* Neural Entropy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-300">
                      Neural Entropy
                    </h3>
                    <span className="text-xs text-slate-400">
                      {activationMetrics.entropy.toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    <Progress
                      value={activationMetrics.entropy}
                      className="h-2 bg-slate-700"
                      // indicatorClassName prop removed
                    />

                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400">Ordered</span>
                      <span className="text-xs text-slate-400">Chaotic</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="temporal" className="mt-0">
              <div className="space-y-4">
                {/* Temporal Pattern Analysis */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Temporal Pattern Analysis
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-700/50 rounded-md p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Trends</div>
                      <div className="text-lg font-medium text-white">
                        {temporalMetrics.patternCounts.trend || 0}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-md p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Cycles</div>
                      <div className="text-lg font-medium text-white">
                        {temporalMetrics.patternCounts.cycle || 0}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-md p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">
                        Anomalies
                      </div>
                      <div className="text-lg font-medium text-white">
                        {temporalMetrics.patternCounts.anomaly || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critical Transitions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-300">
                      Early Warning Signals
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge
                              variant="outline"
                              className={`text-xs py-0 ${
                                temporalMetrics.criticalTransitions.length > 0
                                  ? "bg-amber-900/50"
                                  : "bg-green-900/50"
                              }`}
                            >
                              {temporalMetrics.criticalTransitions.length}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Detected critical state transitions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    {temporalMetrics.criticalTransitions.length > 0 ? (
                      <div className="space-y-2">
                        {temporalMetrics.criticalTransitions.map(
                          (transition: PlaceholderCriticalTransition, index) => ( // Use placeholder type
                            <div
                              key={index} // Use index as key if ID is not available
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1 text-amber-400" />
                                {transition.description || `Transition ${index + 1}`}
                              </span>
                              <span className="text-slate-400">
                                {transition.timestamp ? formatTimestamp(new Date(transition.timestamp)) : 'N/A'}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-2">
                        No critical transitions detected
                      </div>
                    )}
                  </div>
                </div>

                {/* System Stability */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-300">
                      System Stability Index
                    </h3>
                    <span className="text-xs text-slate-400">
                      {temporalMetrics.stabilityIndex.toFixed(1)}%
                    </span>
                  </div>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    <Progress
                      value={temporalMetrics.stabilityIndex}
                      className="h-2 bg-slate-700"
                      // indicatorClassName prop removed
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400">Unstable</span>
                      <span className="text-xs text-slate-400">Stable</span>
                    </div>
                  </div>
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
                 "Metrics Updated"
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
                   <p>Clinical metrics and temporal analysis.</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
           </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ClinicalMetricsPanel;
