/**
 * NOVAMIND Neural-Safe Organism Component
 * ClinicalMetricsPanel - Quantum-level clinical metrics display
 * with HIPAA-compliant data visualization and type-safe state management
 */

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Neural visualization coordinator
import { useVisualizationCoordinator } from "@application/coordinators/NeuralVisualizationCoordinator";

// UI components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@presentation/atoms/Tabs";
import { Button } from "@presentation/atoms/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@presentation/atoms/Tooltip";
import { Badge } from "@presentation/atoms/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@presentation/atoms/Card";
import { ScrollArea } from "@presentation/atoms/ScrollArea";
import { Progress } from "@presentation/atoms/Progress";

// Icons
import {
  BarChart,
  Activity,
  Brain,
  Calendar,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Minimize,
  Maximize,
  Pulse,
  BrainCircuit,
  Clock,
} from "lucide-react";

// Domain types
import { NeuralActivationLevel } from "@domain/types/brain/activity";
import {
  CriticalTransitionIndicator,
  TemporalPattern,
} from "@domain/types/temporal/dynamics";

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
const activationLevelColorMap: Record<NeuralActivationLevel, string> = {
  suppressed: "bg-blue-600",
  baseline: "bg-slate-600",
  elevated: "bg-amber-600",
  hyperactive: "bg-red-600",
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
  const { state } = useVisualizationCoordinator();

  // Local UI state
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState("activity");

  // Toggle expansion state
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Process activation levels for visualization
  const activationMetrics = useMemo(() => {
    const counts: Record<NeuralActivationLevel, number> = {
      suppressed: 0,
      baseline: 0,
      elevated: 0,
      hyperactive: 0,
    };

    // Count regions by activation level
    state.neuralActivation.forEach((level) => {
      counts[level]++;
    });

    // Calculate percentages
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const percentages: Record<NeuralActivationLevel, number> = {
      suppressed: total > 0 ? (counts.suppressed / total) * 100 : 0,
      baseline: total > 0 ? (counts.baseline / total) * 100 : 0,
      elevated: total > 0 ? (counts.elevated / total) * 100 : 0,
      hyperactive: total > 0 ? (counts.hyperactive / total) * 100 : 0,
    };

    // Get top active regions (elevated or hyperactive)
    const topActiveRegions = Array.from(state.neuralActivation.entries())
      .filter(([_, level]) => level === "elevated" || level === "hyperactive")
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
        a.level === "hyperactive" && b.level !== "hyperactive" ? -1 : 1,
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
    // Normalize to 0-100 range (max entropy for 4 states is 2)
    const normalizedEntropy = (entropy / 2) * 100;

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
      (pattern) => pattern.timeScale === state.currentTimeScale,
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
    const criticalTransitions = state.temporalPatterns
      .filter(
        (pattern) =>
          pattern.timeScale === state.currentTimeScale &&
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
  }, [state.temporalPatterns, state.currentTimeScale]);

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
                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Elevated Activity
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-amber-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts.elevated}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages.elevated}
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-amber-600"
                      />
                    </div>

                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Hyperactive
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-red-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts.hyperactive}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages.hyperactive}
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-red-600"
                      />
                    </div>

                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Baseline</span>
                        <Badge
                          variant="outline"
                          className="bg-slate-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts.baseline}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages.baseline}
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-slate-600"
                      />
                    </div>

                    <div className="bg-slate-700/50 rounded-md p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Suppressed
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-900/50 text-xs py-0"
                        >
                          {activationMetrics.counts.suppressed}
                        </Badge>
                      </div>
                      <Progress
                        value={activationMetrics.percentages.suppressed}
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-blue-600"
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
                        {activationMetrics.topActiveRegions.map((region) => (
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
                                region.level === "hyperactive"
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
                      indicatorClassName={`${
                        activationMetrics.entropy > 75
                          ? "bg-red-600"
                          : activationMetrics.entropy > 50
                            ? "bg-amber-600"
                            : activationMetrics.entropy > 25
                              ? "bg-indigo-600"
                              : "bg-green-600"
                      }`}
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
                          <p>
                            {temporalMetrics.criticalTransitions.length === 0
                              ? "No transition warnings detected"
                              : `${temporalMetrics.criticalTransitions.length} potential state transitions detected`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    {temporalMetrics.criticalTransitions.length > 0 ? (
                      <div className="space-y-2">
                        {temporalMetrics.criticalTransitions.map(
                          (transition, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-slate-700/60 p-2 rounded-md"
                            >
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                                <div>
                                  <div className="text-xs text-white">
                                    {transition.name}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {transition.description?.substring(0, 30)}
                                    {transition.description &&
                                    transition.description.length > 30
                                      ? "..."
                                      : ""}
                                  </div>
                                </div>
                              </div>

                              <Badge
                                variant="outline"
                                className="bg-amber-900/50 text-xs py-0"
                              >
                                {Math.round(transition.confidence * 100)}%
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-2 text-xs text-slate-400">
                        No critical transitions detected
                      </div>
                    )}
                  </div>
                </div>

                {/* Stability Index */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-300">
                      Neural Stability
                    </h3>
                    <span className="text-xs text-slate-400">
                      {temporalMetrics.stabilityIndex.toFixed(0)}%
                    </span>
                  </div>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    <Progress
                      value={temporalMetrics.stabilityIndex}
                      className="h-2 bg-slate-700"
                      indicatorClassName={`${
                        temporalMetrics.stabilityIndex < 30
                          ? "bg-red-600"
                          : temporalMetrics.stabilityIndex < 60
                            ? "bg-amber-600"
                            : "bg-green-600"
                      }`}
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
          <div className="flex justify-between w-full text-xs text-slate-400">
            <span>Time Scale: {state.currentTimeScale}</span>
            <span>
              {state.isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
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
                  Updating...
                </span>
              ) : (
                <span>{new Date().toLocaleTimeString()}</span>
              )}
            </span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ClinicalMetricsPanel;
