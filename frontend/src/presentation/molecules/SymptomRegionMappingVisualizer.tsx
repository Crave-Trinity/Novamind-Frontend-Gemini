/**
 * NOVAMIND Neural-Safe Molecular Component
 * SymptomRegionMappingVisualizer - Quantum-level symptom-to-region mapping
 * with neuropsychiatric precision and clinical intelligence
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSpring, animated } from "@react-spring/three";
import { Line, Html } from "@react-three/drei";
import { Vector3, Color, QuadraticBezierCurve3 } from "three";

// Domain types
import {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
} from "@domain/models/brainMapping";
import { BrainRegion } from "@domain/types/brain/models";
import { Symptom, Diagnosis } from "@domain/types/clinical/patient";
import { ActivationLevel } from "@domain/types/brain/activity";

/**
 * Props with neural-safe typing
 */
interface SymptomRegionMappingVisualizerProps {
  regions: BrainRegion[];
  symptomMappings: SymptomNeuralMapping[];
  activeSymptoms: Symptom[];
  diagnosisMappings?: DiagnosisNeuralMapping[];
  activeDiagnoses?: Diagnosis[];
  selectedSymptomId?: string;
  selectedDiagnosisId?: string;
  selectedRegionId?: string;
  showSymptomLabels?: boolean;
  showAllConnections?: boolean;
  maxVisibleConnections?: number;
  lineWidth?: number;
  enableAnimation?: boolean;
  colorMap?: {
    primary: string;
    secondary: string;
    inactive: string;
    highlight: string;
  };
  onSymptomSelect?: (symptomId: string | null) => void;
  onRegionSelect?: (regionId: string | null) => void;
}

/**
 * Connection with neural-safe typing
 */
interface MappingConnection {
  id: string;
  symptomId: string;
  symptomName: string;
  regionId: string;
  regionName: string;
  strength: number;
  isPrimary: boolean;
  isDiagnosis: boolean;
  points: Vector3[];
  color: string;
  controlPoint?: Vector3;
}

/**
 * Calculate mapping connections with clinical precision
 */
function calculateMappingConnections(
  regions: BrainRegion[],
  symptomMappings: SymptomNeuralMapping[],
  activeSymptoms: Symptom[],
  diagnosisMappings: DiagnosisNeuralMapping[] = [],
  activeDiagnoses: Diagnosis[] = [],
  selectedSymptomId?: string,
  selectedDiagnosisId?: string,
  selectedRegionId?: string,
  colorMap = {
    primary: "#ef4444",
    secondary: "#3b82f6",
    inactive: "#94a3b8",
    highlight: "#f97316",
  },
): MappingConnection[] {
  const connections: MappingConnection[] = [];

  // Create region lookup map for efficiency
  const regionMap = new Map<string, BrainRegion>();
  regions.forEach((region) => {
    regionMap.set(region.id, region);
  });

  // Create active symptoms lookup set for efficiency
  const activeSymptomIds = new Set(activeSymptoms.map((s) => s.id));
  const activeDiagnosisIds = new Set(activeDiagnoses.map((d) => d.id));

  // Process symptom mappings
  symptomMappings.forEach((mapping) => {
    const isActiveSymptom = activeSymptomIds.has(mapping.symptomId);
    const isSelectedSymptom = selectedSymptomId === mapping.symptomId;

    // Calculate virtual position for symptom (will be adjusted later)
    // Place symptoms on a hemisphere in front of the brain
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const r = 8;
    const symptomPosition = new Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      -r * Math.cos(phi),
    );

    // Process each activation pattern
    mapping.activationPatterns.forEach((pattern) => {
      pattern.regionActivations.forEach((activation) => {
        // Get the brain region
        const region = regionMap.get(activation.regionId);

        if (region) {
          // Determine connection properties
          const isPrimary = activation.primaryEffect;
          const isSelectedRegion = selectedRegionId === region.id;
          const isHighlighted = isSelectedSymptom || isSelectedRegion;

          // Determine color based on state
          let color = colorMap.inactive;

          if (isHighlighted) {
            color = colorMap.highlight;
          } else if (isActiveSymptom) {
            color = isPrimary ? colorMap.primary : colorMap.secondary;
          }

          // Calculate control point for curved connections
          const midPoint = new Vector3()
            .addVectors(symptomPosition, region.position)
            .multiplyScalar(0.5);
          const controlPoint = new Vector3().copy(midPoint).add(
            new Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3 + 2, // Bias upward for better arcs
              (Math.random() - 0.5) * 3,
            ),
          );

          // Create the connection
          connections.push({
            id: `symptom-${mapping.symptomId}-region-${region.id}`,
            symptomId: mapping.symptomId,
            symptomName: mapping.symptomName,
            regionId: region.id,
            regionName: region.name,
            strength: activation.activityLevel,
            isPrimary,
            isDiagnosis: false,
            points: [symptomPosition, region.position],
            color,
            controlPoint,
          });
        }
      });
    });
  });

  // Process diagnosis mappings
  diagnosisMappings.forEach((mapping) => {
    const isActiveDiagnosis = activeDiagnosisIds.has(mapping.diagnosisId);
    const isSelectedDiagnosis = selectedDiagnosisId === mapping.diagnosisId;

    // Calculate virtual position for diagnosis (will be adjusted later)
    // Place diagnoses on a hemisphere below the brain
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5 + Math.PI * 0.5;
    const r = 8;
    const diagnosisPosition = new Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      -r * Math.cos(phi),
    );

    // Process each activation pattern
    mapping.activationPatterns.forEach((pattern) => {
      pattern.regionActivations.forEach((activation) => {
        // Get the brain region
        const region = regionMap.get(activation.regionId);

        if (region) {
          // Determine connection properties
          const isPrimary = activation.primaryEffect;
          const isSelectedRegion = selectedRegionId === region.id;
          const isHighlighted = isSelectedDiagnosis || isSelectedRegion;

          // Determine color based on state
          let color = colorMap.inactive;

          if (isHighlighted) {
            color = colorMap.highlight;
          } else if (isActiveDiagnosis) {
            color = isPrimary ? colorMap.primary : colorMap.secondary;
          }

          // Calculate control point for curved connections
          const midPoint = new Vector3()
            .addVectors(diagnosisPosition, region.position)
            .multiplyScalar(0.5);
          const controlPoint = new Vector3().copy(midPoint).add(
            new Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3 - 2, // Bias downward for better arcs
              (Math.random() - 0.5) * 3,
            ),
          );

          // Create the connection
          connections.push({
            id: `diagnosis-${mapping.diagnosisId}-region-${region.id}`,
            symptomId: mapping.diagnosisId,
            symptomName: mapping.diagnosisName, // Using diagnosis name
            regionId: region.id,
            regionName: region.name,
            strength: activation.activityLevel,
            isPrimary,
            isDiagnosis: true,
            points: [diagnosisPosition, region.position],
            color,
            controlPoint,
          });
        }
      });
    });
  });

  return connections;
}

/**
 * Calculate quadratic bezier points for smooth curves
 */
function createCurvePoints(
  start: Vector3,
  end: Vector3,
  control: Vector3,
  segments: number = 20,
): Vector3[] {
  const curve = new QuadraticBezierCurve3(start, control, end);
  return curve.getPoints(segments);
}

/**
 * SymptomRegionMappingVisualizer - Molecular component for mapping symptoms to brain regions
 * Implements clinical precision neural pathway visualization
 */
export const SymptomRegionMappingVisualizer: React.FC<
  SymptomRegionMappingVisualizerProps
> = ({
  regions,
  symptomMappings,
  activeSymptoms,
  diagnosisMappings = [],
  activeDiagnoses = [],
  selectedSymptomId,
  selectedDiagnosisId,
  selectedRegionId,
  showSymptomLabels = true,
  showAllConnections = false,
  maxVisibleConnections = 100,
  lineWidth = 2,
  enableAnimation = true,
  colorMap = {
    primary: "#ef4444",
    secondary: "#3b82f6",
    inactive: "#94a3b8",
    highlight: "#f97316",
  },
  onSymptomSelect,
  onRegionSelect,
}) => {
  // Calculate all possible mapping connections
  const allConnections = useMemo(() => {
    return calculateMappingConnections(
      regions,
      symptomMappings,
      activeSymptoms,
      diagnosisMappings,
      activeDiagnoses,
      selectedSymptomId,
      selectedDiagnosisId,
      selectedRegionId,
      colorMap,
    );
  }, [
    regions,
    symptomMappings,
    activeSymptoms,
    diagnosisMappings,
    activeDiagnoses,
    selectedSymptomId,
    selectedDiagnosisId,
    selectedRegionId,
    colorMap,
  ]);

  // Filter connections based on visibility settings
  const visibleConnections = useMemo(() => {
    let filteredConnections = allConnections;

    // Apply filters
    if (!showAllConnections) {
      filteredConnections = allConnections.filter(
        (conn) =>
          // Show active symptom connections
          activeSymptoms.some((s) => s.id === conn.symptomId) ||
          // Show active diagnosis connections
          activeDiagnoses.some((d) => d.id === conn.symptomId) ||
          // Show selected symptom/diagnosis connections
          conn.symptomId === selectedSymptomId ||
          conn.symptomId === selectedDiagnosisId ||
          // Show selected region connections
          conn.regionId === selectedRegionId,
      );
    }

    // Sort by relevance
    filteredConnections.sort((a, b) => {
      // Prioritize selected elements
      if (a.symptomId === selectedSymptomId || a.regionId === selectedRegionId)
        return -1;
      if (b.symptomId === selectedSymptomId || b.regionId === selectedRegionId)
        return 1;

      // Then prioritize active elements
      const aActive =
        activeSymptoms.some((s) => s.id === a.symptomId) ||
        activeDiagnoses.some((d) => d.id === a.symptomId);
      const bActive =
        activeSymptoms.some((s) => s.id === b.symptomId) ||
        activeDiagnoses.some((d) => d.id === b.symptomId);

      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // Then prioritize by strength
      return b.strength - a.strength;
    });

    // Limit the number of connections
    return filteredConnections.slice(0, maxVisibleConnections);
  }, [
    allConnections,
    showAllConnections,
    activeSymptoms,
    activeDiagnoses,
    selectedSymptomId,
    selectedDiagnosisId,
    selectedRegionId,
    maxVisibleConnections,
  ]);

  // Group connections by symptom for better layout
  const symptomGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        connections: MappingConnection[];
        position: Vector3;
        isDiagnosis: boolean;
      }
    >();

    visibleConnections.forEach((conn) => {
      // Get or create group
      if (!groups.has(conn.symptomId)) {
        groups.set(conn.symptomId, {
          connections: [],
          position: conn.points[0].clone(),
          isDiagnosis: conn.isDiagnosis,
        });
      }

      // Add connection to group
      const group = groups.get(conn.symptomId)!;
      group.connections.push(conn);
    });

    return Array.from(groups.values());
  }, [visibleConnections]);

  // Position symptom labels in a more organized way
  useEffect(() => {
    // This would adjust the positioning of symptoms/diagnoses to avoid overlaps
    // For this implementation, we're keeping the default random positions
  }, [symptomGroups]);

  // Handle symptom selection
  const handleSymptomClick = useCallback(
    (symptomId: string) => {
      if (onSymptomSelect) {
        onSymptomSelect(symptomId === selectedSymptomId ? null : symptomId);
      }
    },
    [onSymptomSelect, selectedSymptomId],
  );

  // Render the connections
  return (
    <group>
      {/* Render connections */}
      {visibleConnections.map((conn) => {
        // Generate curve points for smooth connections
        const curvePoints = conn.controlPoint
          ? createCurvePoints(conn.points[0], conn.points[1], conn.controlPoint)
          : conn.points;

        // Line thickness based on connection strength and selection state
        const thickness =
          lineWidth *
          (conn.isPrimary ? 1.5 : 1.0) *
          (conn.symptomId === selectedSymptomId ||
          conn.regionId === selectedRegionId
            ? 1.5
            : 1.0);

        // Animation settings
        const dashArray = enableAnimation
          ? [0.1, conn.isPrimary ? 0.1 : 0.15]
          : undefined;
        const dashOffset = enableAnimation ? 0 : undefined;
        const dashAnimateFrom = enableAnimation ? 0 : undefined;
        const dashAnimateTo = enableAnimation ? 1 : undefined;

        return (
          <Line
            key={conn.id}
            points={curvePoints}
            color={conn.color}
            lineWidth={thickness}
            dashed={!!dashArray}
            dashArray={dashArray}
            dashOffset={dashOffset}
            dashAnimateFrom={dashAnimateFrom}
            dashAnimateTo={dashAnimateTo}
          />
        );
      })}

      {/* Render symptom/diagnosis labels */}
      {showSymptomLabels &&
        symptomGroups.map((group) => {
          const isSelected =
            group.connections[0]?.symptomId === selectedSymptomId ||
            group.connections[0]?.symptomId === selectedDiagnosisId;

          // Selected items have higher opacity for better visibility
          const opacity = isSelected ? 0.95 : 0.7;

          // Find a primary connection for determining color
          const primaryConn =
            group.connections.find((c) => c.isPrimary) || group.connections[0];
          const isActive =
            primaryConn &&
            (activeSymptoms.some((s) => s.id === primaryConn.symptomId) ||
              activeDiagnoses.some((d) => d.id === primaryConn.symptomId));

          return (
            <Html
              key={group.connections[0]?.symptomId}
              position={group.position}
              center
              zIndexRange={[100, 0]}
              sprite
            >
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "1rem",
                  backgroundColor: `${primaryConn?.color}${Math.round(
                    opacity * 255,
                  )
                    .toString(16)
                    .padStart(2, "0")}`,
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  userSelect: "none",
                  boxShadow: isSelected
                    ? "0 0 10px rgba(255,255,255,0.5)"
                    : "none",
                  transition: "all 0.2s ease-out",
                  border: isSelected ? "1px solid white" : "none",
                  transform: `scale(${isSelected ? 1.1 : 1.0})`,
                  maxWidth: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onClick={() =>
                  handleSymptomClick(group.connections[0]?.symptomId || "")
                }
              >
                {group.isDiagnosis ? "🏥 " : "🔍 "}
                {group.connections[0]?.symptomName}
                {isActive && <span style={{ marginLeft: "0.25rem" }}>•</span>}
              </div>
            </Html>
          );
        })}
    </group>
  );
};

export default SymptomRegionMappingVisualizer;
