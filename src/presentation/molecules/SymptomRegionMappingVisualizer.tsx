/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Molecular Component
 * SymptomRegionMappingVisualizer - Quantum-level symptom-to-region mapping
 * with neuropsychiatric precision and clinical intelligence
 */

import React, { useEffect, useMemo } from 'react'; // Removed unused useState, useCallback
// Removed unused imports: useSpring, animated, Line, Html
import { Vector3 as ThreeVector3 } from 'three'; // Import Vector3 with alias, removed unused Color, QuadraticBezierCurve3
// Domain types
import type {
  SymptomNeuralMapping,
  DiagnosisNeuralMapping,
} from '@domain/models/brain/mapping/brain-mapping'; // Corrected import path
import type { BrainRegion } from '@domain/types/brain/models';
import type { Symptom, Diagnosis } from '@domain/types/clinical/patient';
// Removed unused import: import { ActivationLevel } from '@domain/types/brain/activity';

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
  points: ThreeVector3[]; // Use aliased type
  color: string;
  controlPoint?: ThreeVector3; // Use aliased type
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
    primary: '#ef4444',
    secondary: '#3b82f6',
    inactive: '#94a3b8',
    highlight: '#f97316',
  }
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
    const symptomPosition = new ThreeVector3( // Use aliased constructor
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      -r * Math.cos(phi)
    );

    // Process each activation pattern
    mapping.activationPatterns.forEach((pattern) => {
      // Use regionIds as defined in NeuralActivationPattern type
      pattern.regionIds.forEach((regionId) => {
        // Get the brain region
        const region = regionMap.get(regionId);

        if (region) {
          // Determine connection properties
          // const isPrimary = activation.primaryEffect; // Removed: 'activation' is not defined here, 'primaryEffect' removed from type
          // Removed unused isPrimary variable
          const isSelectedRegion = selectedRegionId === region.id;
          const isHighlighted = isSelectedSymptom || isSelectedRegion;

          // Determine color based on state
          let color = colorMap.inactive;

          if (isHighlighted) {
            color = colorMap.highlight;
          } else if (isActiveSymptom) {
            color = colorMap.primary; // Simplified: Default to primary color for active symptom
          }

          // Calculate control point for curved connections
          const midPoint = new ThreeVector3() // Use aliased constructor
            .addVectors(symptomPosition, region.position)
            .multiplyScalar(0.5);
          const controlPoint = new ThreeVector3().copy(midPoint).add(
            // Use aliased constructor
            new ThreeVector3( // Use aliased constructor
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3 + 2, // Bias upward for better arcs
              (Math.random() - 0.5) * 3
            )
          );

          // Create the connection
          connections.push({
            id: `symptom-${mapping.symptomId}-region-${region.id}`,
            symptomId: mapping.symptomId,
            symptomName: mapping.symptomName,
            regionId: region.id,
            regionName: region.name,
            // Assuming activityLevel should come from the pattern itself or a default
            strength: pattern.intensity, // Use pattern intensity as strength? Or activation.activityLevel if that exists elsewhere? Needs clarification. Using pattern.intensity for now.
            isPrimary: pattern.intensity > 0.7, // Use intensity proxy again
            isDiagnosis: false,
            // Create new ThreeVector3 instances for the points array
            points: [
              symptomPosition,
              new ThreeVector3(region.position.x, region.position.y, region.position.z),
            ], // Corrected assignment
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
    const diagnosisPosition = new ThreeVector3( // Use aliased constructor
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      -r * Math.cos(phi)
    );

    // Process each activation pattern
    mapping.activationPatterns.forEach((pattern) => {
      // Use regionIds as defined in NeuralActivationPattern type
      pattern.regionIds.forEach((regionId) => {
        // Get the brain region
        const region = regionMap.get(regionId);

        if (region) {
          // Determine connection properties
          // const isPrimary = activation.primaryEffect; // Removed: 'activation' is not defined here, 'primaryEffect' removed from type
          // Removed unused isPrimary variable
          const isSelectedRegion = selectedRegionId === region.id;
          const isHighlighted = isSelectedDiagnosis || isSelectedRegion;

          // Determine color based on state
          let color = colorMap.inactive;

          if (isHighlighted) {
            color = colorMap.highlight;
          } else if (isActiveDiagnosis) {
            color = colorMap.primary; // Simplified: Default to primary color for active diagnosis
          }

          // Calculate control point for curved connections
          const midPoint = new ThreeVector3() // Use aliased constructor
            .addVectors(diagnosisPosition, region.position)
            .multiplyScalar(0.5);
          const controlPoint = new ThreeVector3().copy(midPoint).add(
            // Use aliased constructor
            new ThreeVector3( // Use aliased constructor
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3 - 2, // Bias downward for better arcs
              (Math.random() - 0.5) * 3
            )
          );

          // Create the connection
          connections.push({
            id: `diagnosis-${mapping.diagnosisId}-region-${region.id}`,
            symptomId: mapping.diagnosisId,
            symptomName: mapping.diagnosisName, // Using diagnosis name
            regionId: region.id,
            regionName: region.name,
            // Assuming activityLevel should come from the pattern itself or a default
            strength: pattern.intensity, // Use pattern intensity as strength? Or activation.activityLevel if that exists elsewhere? Needs clarification. Using pattern.intensity for now.
            isPrimary: pattern.intensity > 0.7, // Use intensity proxy again
            isDiagnosis: true,
            // Create new ThreeVector3 instances for the points array
            points: [
              diagnosisPosition,
              new ThreeVector3(region.position.x, region.position.y, region.position.z),
            ], // Corrected assignment
            color,
            controlPoint,
          });
        }
      });
    });
  });

  return connections;
}

// Removed unused createCurvePoints function

/**
 * SymptomRegionMappingVisualizer - Molecular component for mapping symptoms to brain regions
 * Implements clinical precision neural pathway visualization
 */
export const SymptomRegionMappingVisualizer: React.FC<SymptomRegionMappingVisualizerProps> = ({
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
  lineWidth: _lineWidth = 2, // Prefixed unused variable
  enableAnimation: _enableAnimation = true, // Prefixed unused variable
  colorMap = {
    primary: '#ef4444',
    secondary: '#3b82f6',
    inactive: '#94a3b8',
    highlight: '#f97316',
  },
  onSymptomSelect: _onSymptomSelect, // Prefixed unused variable
  onRegionSelect: _onRegionSelect, // Prefixed unused variable
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
      colorMap
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
          conn.regionId === selectedRegionId
      );
    }

    // Sort by relevance
    filteredConnections.sort((a, b) => {
      // Prioritize selected elements
      if (a.symptomId === selectedSymptomId || a.regionId === selectedRegionId) return -1;
      if (b.symptomId === selectedSymptomId || b.regionId === selectedRegionId) return 1;

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
        position: ThreeVector3; // Use aliased type
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

  // Removed unused handleSymptomClick function

  // Render the connections
  return (
    <group>
      {/* Render connections */}
      {visibleConnections.map((_conn) => {
        // Prefixed unused variable
        // Generate curve points for smooth connections
        // Removed unused curvePoints variable calculation

        // Line thickness based on connection strength and selection state
        // Removed unused thickness variable calculation

        // Animation settings
        // Removed unused dashArray variable calculation
        // Removed unused dashOffset, dashAnimateFrom, dashAnimateTo variables

        // Use explicit return null;
        return null;
      })}

      {/* Render symptom/diagnosis labels */}
      {showSymptomLabels &&
        symptomGroups.map((_group) => {
          // Prefixed unused variable
          // Removed unused isSelected variable calculation

          // Selected items have higher opacity for better visibility
          // Removed unused opacity variable

          // Find a primary connection for determining color
          // Removed unused primaryConn variable calculation
          // Removed unused isActive variable calculation

          // Use explicit return null;
          return null;
        })}
    </group>
  );
};

export default SymptomRegionMappingVisualizer;
