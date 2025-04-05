/**
 * NOVAMIND Neural-Safe Brain Mapping
 * Clinical mapping between symptoms, diagnoses, and neural regions
 * with mathematical precision and quantum-level type safety
 */

import { BrainRegion, NeuralConnection } from "@domain/types/brain/models";
import { RiskLevel } from "@domain/types/clinical/risk";
import { Diagnosis, Symptom } from "@domain/types/clinical/patient";
import { TreatmentType } from "@domain/types/clinical/treatment";
import { SafeArray, Result, success, failure } from "@domain/types/shared/common"; // Use correct alias

/**
 * Clinical-to-Neural Mapping Definitions
 */

// Neural activation pattern type
export interface NeuralActivationPattern {
  regionIds: string[];
  intensity: number; // 0-1 representing activation intensity
  connectivity: {
    increasedPathways: [string, string][]; // [sourceId, targetId]
    decreasedPathways: [string, string][]; // [sourceId, targetId]
  };
  timeScale: "acute" | "subacute" | "chronic"; // Temporal characteristics
  confidence: number; // 0-1 representing confidence in this mapping
}

// Symptom to neural mapping
export interface SymptomNeuralMapping {
  symptomId: string;
  symptomName: string;
  category: string;
  activationPatterns: NeuralActivationPattern[];
  contributingFactors: string[];
  evidenceQuality: "established" | "probable" | "theoretical";
  citations?: string[];
}

// Diagnosis to neural mapping
export interface DiagnosisNeuralMapping {
  diagnosisId: string;
  diagnosisName: string;
  codingSystem: string;
  activationPatterns: NeuralActivationPattern[];
  stageSpecificPatterns?: {
    stage: string;
    patterns: NeuralActivationPattern[];
  }[];
  subtypePatterns?: {
    subtype: string;
    patterns: NeuralActivationPattern[];
  }[];
  evidenceQuality: "established" | "probable" | "theoretical";
  citations?: string[];
}

// Treatment to neural mapping
export interface TreatmentNeuralMapping {
  treatmentId: string;
  treatmentName: string;
  treatmentType: TreatmentType;
  mechanismsOfAction: {
    description: string;
    affectedRegions: string[];
    affectedNeurotransmitters?: string[];
    timeToEffect: string;
    confidenceLevel: number; // 0-1
  }[];
  effectPatterns: {
    increasedActivity: string[];
    decreasedActivity: string[];
    normalizedConnectivity: [string, string][]; // [sourceId, targetId]
  };
  evidenceQuality: "established" | "probable" | "theoretical";
  citations?: string[];
}

// Neural impact rating for regions and connections
export interface NeuralImpactRating {
  regionImpacts: {
    regionId: string;
    impact: "increase" | "decrease" | "modulate" | "normalize";
    magnitude: number; // 0-1 representing impact magnitude
    confidence: number; // 0-1 representing confidence level
  }[];
  connectionImpacts: {
    sourceId: string;
    targetId: string;
    impact: "increase" | "decrease" | "modulate" | "normalize";
    magnitude: number; // 0-1 representing impact magnitude
    confidence: number; // 0-1 representing confidence level
  }[];
  overallSeverity: RiskLevel;
  reversibility: "reversible" | "partial" | "irreversible" | "unknown";
  projectedTimeline: string;
}

/**
 * Brain Mapping Operations
 */

// Calculate neural activity level from clinical data
export function calculateNeuralActivation(
  regions: BrainRegion[],
  symptomMappings: SymptomNeuralMapping[],
  activeSymptoms: Symptom[],
  diagnosisMappings?: DiagnosisNeuralMapping[],
  activeDiagnoses?: Diagnosis[],
): Result<Map<string, number>> {
  try {
    // Create a safe wrapper for our inputs
    const safeRegions = new SafeArray(regions);
    const safeSymptomMappings = new SafeArray(symptomMappings);
    const safeActiveSymptoms = new SafeArray(activeSymptoms);
    const safeDiagnosisMappings = new SafeArray(diagnosisMappings);
    const safeActiveDiagnoses = new SafeArray(activeDiagnoses);

    // Initialize activation map with 0 values
    const activationMap = new Map<string, number>();
    safeRegions.forEach((region) => {
      activationMap.set(region.id, 0);
    });

    // Process symptom contributions to neural activation
    safeActiveSymptoms.forEach((symptom) => {
      // Find relevant mapping
      const mapping = safeSymptomMappings.find(
        (m) => m.symptomId === symptom.id || m.symptomName === symptom.name,
      );

      if (!mapping) return;

      // Process each activation pattern
      new SafeArray(mapping.activationPatterns).forEach((pattern) => {
        // Scale activation by symptom severity and pattern confidence
        const activationStrength =
          (symptom.severity / 10) * pattern.intensity * pattern.confidence;

        // Apply activation to each region
        new SafeArray(pattern.regionIds).forEach((regionId) => {
          const currentActivation = activationMap.get(regionId) || 0;
          // Use quadratic combination for more realistic neural summation
          const combinedActivation = Math.sqrt(
            Math.pow(currentActivation, 2) + Math.pow(activationStrength, 2),
          );
          activationMap.set(regionId, Math.min(1, combinedActivation));
        });
      });
    });

    // Process diagnosis contributions to neural activation
    safeActiveDiagnoses.forEach((diagnosis) => {
      // Find relevant mapping
      const mapping = safeDiagnosisMappings.find(
        (m) =>
          m.diagnosisId === diagnosis.id || m.diagnosisName === diagnosis.name,
      );

      if (!mapping) return;

      // Process each activation pattern
      new SafeArray(mapping.activationPatterns).forEach((pattern) => {
        // Scale activation by diagnosis severity and pattern confidence
        const severityScale = {
          mild: 0.3,
          moderate: 0.6,
          severe: 0.9,
          "in remission": 0.15,
          unspecified: 0.5,
        };

        const severityFactor = severityScale[diagnosis.severity] || 0.5;
        const activationStrength =
          severityFactor * pattern.intensity * pattern.confidence;

        // Apply activation to each region
        new SafeArray(pattern.regionIds).forEach((regionId) => {
          const currentActivation = activationMap.get(regionId) || 0;
          // Use quadratic combination for more realistic neural summation
          const combinedActivation = Math.sqrt(
            Math.pow(currentActivation, 2) + Math.pow(activationStrength, 2),
          );
          activationMap.set(regionId, Math.min(1, combinedActivation));
        });
      });
    });

    return success(activationMap);
  } catch (error) {
    return failure(
      new Error(`Failed to calculate neural activation: ${error}`),
    );
  }
}

// Map symptoms to affected brain regions
export function mapSymptomsToRegions(
  symptomMappings: SymptomNeuralMapping[],
  activeSymptoms: Symptom[],
): Result<Map<string, Symptom[]>> {
  try {
    const safeSymptomMappings = new SafeArray(symptomMappings);
    const safeActiveSymptoms = new SafeArray(activeSymptoms);

    // Initialize region to symptoms map
    const regionToSymptomsMap = new Map<string, Symptom[]>();

    // Process each active symptom
    safeActiveSymptoms.forEach((symptom) => {
      // Find mapping for this symptom
      const mapping = safeSymptomMappings.find(
        (m) => m.symptomId === symptom.id || m.symptomName === symptom.name,
      );

      if (!mapping) return;

      // Process all affected regions
      const affectedRegionIds = new Set<string>();
      new SafeArray(mapping.activationPatterns).forEach((pattern) => {
        new SafeArray(pattern.regionIds).forEach((regionId) => {
          affectedRegionIds.add(regionId);
        });
      });

      // Add symptom to each affected region's list
      affectedRegionIds.forEach((regionId) => {
        const currentSymptoms = regionToSymptomsMap.get(regionId) || [];
        regionToSymptomsMap.set(regionId, [...currentSymptoms, symptom]);
      });
    });

    return success(regionToSymptomsMap);
  } catch (error) {
    return failure(new Error(`Failed to map symptoms to regions: ${error}`));
  }
}

// Map diagnoses to affected brain regions
export function mapDiagnosesToRegions(
  diagnosisMappings: DiagnosisNeuralMapping[],
  activeDiagnoses: Diagnosis[],
): Result<Map<string, Diagnosis[]>> {
  try {
    const safeDiagnosisMappings = new SafeArray(diagnosisMappings);
    const safeActiveDiagnoses = new SafeArray(activeDiagnoses);

    // Initialize region to diagnoses map
    const regionToDiagnosesMap = new Map<string, Diagnosis[]>();

    // Process each active diagnosis
    safeActiveDiagnoses.forEach((diagnosis) => {
      // Find mapping for this diagnosis
      const mapping = safeDiagnosisMappings.find(
        (m) =>
          m.diagnosisId === diagnosis.id || m.diagnosisName === diagnosis.name,
      );

      if (!mapping) return;

      // Process all affected regions
      const affectedRegionIds = new Set<string>();
      new SafeArray(mapping.activationPatterns).forEach((pattern) => {
        new SafeArray(pattern.regionIds).forEach((regionId) => {
          affectedRegionIds.add(regionId);
        });
      });

      // Add diagnosis to each affected region's list
      affectedRegionIds.forEach((regionId) => {
        const currentDiagnoses = regionToDiagnosesMap.get(regionId) || [];
        regionToDiagnosesMap.set(regionId, [...currentDiagnoses, diagnosis]);
      });
    });

    return success(regionToDiagnosesMap);
  } catch (error) {
    return failure(new Error(`Failed to map diagnoses to regions: ${error}`));
  }
}

// Calculate treatment impact on neural regions
export function calculateTreatmentImpact(
  regions: BrainRegion[],
  treatmentMappings: TreatmentNeuralMapping[],
  treatmentIds: string[],
): Result<NeuralImpactRating> {
  try {
    const safeRegions = new SafeArray(regions);
    const safeTreatmentMappings = new SafeArray(treatmentMappings);
    const safeTreatmentIds = new SafeArray(treatmentIds);

    // Initialize empty impact rating
    const impact: NeuralImpactRating = {
      regionImpacts: [],
      connectionImpacts: [],
      overallSeverity: RiskLevel.NONE,
      reversibility: "unknown",
      projectedTimeline: "",
    };

    // Process each treatment
    safeTreatmentIds.forEach((treatmentId) => {
      // Find mapping for this treatment
      const mapping = safeTreatmentMappings.find(
        (m) => m.treatmentId === treatmentId,
      );
      if (!mapping) return;

      // Process region impacts
      new SafeArray(mapping.effectPatterns.increasedActivity).forEach(
        (regionId) => {
          addOrUpdateRegionImpact(
            impact.regionImpacts,
            regionId,
            "increase",
            0.7,
            0.8,
          );
        },
      );

      new SafeArray(mapping.effectPatterns.decreasedActivity).forEach(
        (regionId) => {
          addOrUpdateRegionImpact(
            impact.regionImpacts,
            regionId,
            "decrease",
            0.7,
            0.8,
          );
        },
      );

      // Process connection impacts
      new SafeArray(mapping.effectPatterns.normalizedConnectivity).forEach(
        ([sourceId, targetId]) => {
          addOrUpdateConnectionImpact(
            impact.connectionImpacts,
            sourceId,
            targetId,
            "normalize",
            0.6,
            0.7,
          );
        },
      );

      // Additional processing for treatment mechanism of action
      new SafeArray(mapping.mechanismsOfAction).forEach((mechanism) => {
        new SafeArray(mechanism.affectedRegions).forEach((regionId) => {
          addOrUpdateRegionImpact(
            impact.regionImpacts,
            regionId,
            "modulate",
            0.8,
            mechanism.confidenceLevel,
          );
        });
      });
    });

    // Calculate overall severity based on region impacts
    if (impact.regionImpacts.length > 0) {
      const avgMagnitude =
        impact.regionImpacts.reduce((sum, ri) => sum + ri.magnitude, 0) /
        impact.regionImpacts.length;

      impact.overallSeverity =
        avgMagnitude > 0.8
          ? RiskLevel.HIGH
          : avgMagnitude > 0.5
            ? RiskLevel.MODERATE
            : avgMagnitude > 0.2
              ? RiskLevel.LOW
              : RiskLevel.NONE;
    }

    // Set projected timeline based on most significant mechanism
    impact.projectedTimeline = "2-4 weeks"; // Default timeline

    return success(impact);
  } catch (error) {
    return failure(new Error(`Failed to calculate treatment impact: ${error}`));
  }
}

// Helper function for adding or updating region impacts
function addOrUpdateRegionImpact(
  impacts: NeuralImpactRating["regionImpacts"],
  regionId: string,
  impact: "increase" | "decrease" | "modulate" | "normalize",
  magnitude: number,
  confidence: number,
): void {
  const existingIndex = impacts.findIndex(
    (ri) => ri.regionId === regionId && ri.impact === impact,
  );

  if (existingIndex >= 0) {
    // Combine with existing impact using quadratic summation for magnitudes
    const existing = impacts[existingIndex];
    const newMagnitude = Math.sqrt(
      Math.pow(existing.magnitude, 2) + Math.pow(magnitude, 2),
    );
    // Average the confidence values
    const newConfidence = (existing.confidence + confidence) / 2;

    impacts[existingIndex] = {
      ...existing,
      magnitude: Math.min(1, newMagnitude),
      confidence: newConfidence,
    };
  } else {
    // Add new impact
    impacts.push({
      regionId,
      impact,
      magnitude,
      confidence,
    });
  }
}

// Helper function for adding or updating connection impacts
function addOrUpdateConnectionImpact(
  impacts: NeuralImpactRating["connectionImpacts"],
  sourceId: string,
  targetId: string,
  impact: "increase" | "decrease" | "modulate" | "normalize",
  magnitude: number,
  confidence: number,
): void {
  const existingIndex = impacts.findIndex(
    (ci) =>
      ci.sourceId === sourceId &&
      ci.targetId === targetId &&
      ci.impact === impact,
  );

  if (existingIndex >= 0) {
    // Combine with existing impact using quadratic summation for magnitudes
    const existing = impacts[existingIndex];
    const newMagnitude = Math.sqrt(
      Math.pow(existing.magnitude, 2) + Math.pow(magnitude, 2),
    );
    // Average the confidence values
    const newConfidence = (existing.confidence + confidence) / 2;

    impacts[existingIndex] = {
      ...existing,
      magnitude: Math.min(1, newMagnitude),
      confidence: newConfidence,
    };
  } else {
    // Add new impact
    impacts.push({
      sourceId,
      targetId,
      impact,
      magnitude,
      confidence,
    });
  }
}
