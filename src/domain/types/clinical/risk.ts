/**
 * NOVAMIND Neural-Safe Risk Assessment Types
 * Clinical risk assessment with quantum-level type safety
 */
import { Vector3, SafeArray } from "@domain/types/shared/common";

// Risk level with clinical precision
export enum RiskLevel {
  NONE = "none",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  SEVERE = "severe",
  UNKNOWN = "unknown",
}

// Risk assessment with mathematical precision
export interface RiskAssessment {
  id: string;
  patientId: string;
  timestamp: string;
  assessmentType: "automated" | "clinician" | "hybrid";
  overallRisk: RiskLevel;
  confidenceScore: number; // 0-1 representing confidence level
  domainRisks: DomainRisk[];
  temporalTrend: "increasing" | "decreasing" | "stable" | "fluctuating";
  contributingFactors: ContributingFactor[];
  protectiveFactors: ProtectiveFactor[];
  neuralCorrelates: NeuralRiskCorrelate[];
  algorithmVersion?: string;
  clinicianId?: string;
  notes?: string;
  recommendations?: string[];
  nextAssessmentDue?: string;
}

// Domain-specific risk assessment
export interface DomainRisk {
  domain:
    | "suicide"
    | "self_harm"
    | "harm_to_others"
    | "psychosis"
    | "substance_use"
    | "functional_decline"
    | "treatment_resistance"
    | "medical_complication";
  riskLevel: RiskLevel;
  confidenceScore: number; // 0-1 representing confidence level
  evidence: string[];
  urgency: "immediate" | "urgent" | "monitor" | "routine";
  temporalDynamics?: {
    shortTermRisk: RiskLevel;
    mediumTermRisk: RiskLevel;
    longTermRisk: RiskLevel;
  };
  clinicalThresholds?: {
    escalationPoint: number;
    interventionPoint: number;
  };
}

// Contributing factor to risk
export interface ContributingFactor {
  id: string;
  name: string;
  category:
    | "demographic"
    | "clinical"
    | "psychological"
    | "social"
    | "environmental"
    | "neurobiological";
  impactWeight: number; // 0-1 representing relative impact
  modifiability: "non-modifiable" | "partially-modifiable" | "modifiable";
  description?: string;
  evidenceBase?: "established" | "emerging" | "theoretical";
  temporalRelevance: "immediate" | "short-term" | "long-term";
}

// Protective factor against risk
export interface ProtectiveFactor {
  id: string;
  name: string;
  category:
    | "clinical"
    | "psychological"
    | "social"
    | "environmental"
    | "neurobiological";
  strengthLevel: "minimal" | "moderate" | "strong";
  description?: string;
  enhancementStrategies?: string[];
  temporalStability: "transient" | "episodic" | "stable";
}

// Neural correlates of risk
export interface NeuralRiskCorrelate {
  brainRegionId: string;
  riskContribution: "primary" | "secondary" | "contributory";
  abnormalityType:
    | "hyperactivity"
    | "hypoactivity"
    | "connectivity_disruption"
    | "structural_abnormality"
    | "neurochemical_imbalance";
  confidenceScore: number; // 0-1 representing confidence level
  description?: string;
  literatureReferences?: string[];
  interventionTargetability: "high" | "moderate" | "low" | "unknown";
}

// Risk timeline event
export interface RiskTimelineEvent {
  id: string;
  patientId: string;
  timestamp: string;
  eventType:
    | "assessment"
    | "symptom_change"
    | "life_event"
    | "treatment_change"
    | "biometric_alert";
  riskImpact: "increase" | "decrease" | "no_change" | "unknown";
  impactMagnitude: number; // 0-10 scale
  description: string;
  domainImpacts: {
    domain: string;
    impact: "increase" | "decrease" | "no_change" | "unknown";
  }[];
  relatedFactors: string[]; // IDs of contributing or protective factors
  neuralCorrelates?: {
    regionId: string;
    activityChange?: number;
  }[];
  urgency: "critical" | "high" | "moderate" | "low";
  interventionTaken?: string;
  outcome?: string;
}

// Biometric risk alert with clinical precision
export interface BiometricRiskAlert {
  id: string;
  patientId: string;
  timestamp: string;
  dataSource:
    | "heart_rate"
    | "sleep"
    | "activity"
    | "location"
    | "social"
    | "digital_phenotyping"
    | "self_report";
  alertType: "threshold_breach" | "pattern_change" | "anomaly" | "correlation";
  alertPriority: "critical" | "urgent" | "warning" | "informational";
  metricName: string;
  metricValue: number;
  thresholdType: "upper" | "lower" | "pattern" | "variance";
  thresholdValue: number;
  deviationPercentage: number;
  clinicalSignificance: string;
  potentialRiskDomains: string[];
  recommendedAction?: string;
  falsePositiveProbability: number; // 0-1 representing false positive probability
  neuralCorrelates?: {
    regionId: string;
    correlationStrength: number; // 0-1 representing correlation strength
  }[];
  relatedAlerts?: string[]; // IDs of related alerts
  status: "new" | "acknowledged" | "resolved" | "false_positive";
}

// Risk visualization settings
export interface RiskVisualizationSettings {
  colorScale: Record<RiskLevel, string>;
  visualizationMode: "heatmap" | "discrete" | "gradient";
  temporalResolution: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  thresholds: {
    low: number;
    moderate: number;
    high: number;
    severe: number;
  };
  showConfidenceIntervals: boolean;
  highlightChangePoints: boolean;
  domainFilterEnabled: boolean;
  filteredDomains: string[];
  neuralCorrelationDisplay: "none" | "simplified" | "detailed";
  alertVisualization: "badges" | "timeline" | "integrated" | "separated";
}

// Default risk visualization color scale
export const defaultRiskColorScale: Record<RiskLevel, string> = {
  [RiskLevel.NONE]: "#2ECC71", // Green
  [RiskLevel.LOW]: "#3498DB", // Blue
  [RiskLevel.MODERATE]: "#F1C40F", // Yellow
  [RiskLevel.HIGH]: "#E67E22", // Orange
  [RiskLevel.SEVERE]: "#E74C3C", // Red
  [RiskLevel.UNKNOWN]: "#95A5A6", // Gray
};

// Risk assessment state with discriminated union for type safety
export type RiskAssessmentState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: RiskAssessment };

// Risk timeline state with discriminated union for type safety
export type RiskTimelineState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | {
      status: "success";
      events: RiskTimelineEvent[];
      timeline: ProcessedRiskTimeline;
    };

// Processed risk timeline for visualization
export interface ProcessedRiskTimeline {
  timePoints: string[];
  riskLevels: RiskLevel[];
  domainRiskLevels: Record<string, RiskLevel[]>;
  significantEvents: {
    index: number;
    event: RiskTimelineEvent;
    impactScore: number;
  }[];
  thresholdCrossings: {
    index: number;
    fromLevel: RiskLevel;
    toLevel: RiskLevel;
    direction: "increase" | "decrease";
  }[];
  trendSegments: {
    startIndex: number;
    endIndex: number;
    direction: "increasing" | "decreasing" | "stable" | "fluctuating";
    magnitude: number;
  }[];
  alerts: {
    index: number;
    alert: BiometricRiskAlert;
  }[];
}

// Safe risk assessment operations
export const RiskAssessmentOps = {
  // Get risk level with null safety
  getRiskLevel: (assessment: RiskAssessment | null | undefined): RiskLevel => {
    return assessment?.overallRisk || RiskLevel.UNKNOWN;
  },

  // Get domain risk with null safety
  getDomainRisk: (
    assessment: RiskAssessment | null | undefined,
    domain: string,
  ): DomainRisk | undefined => {
    if (!assessment) return undefined;
    return new SafeArray(assessment.domainRisks).find(
      (r) => r.domain === domain,
    );
  },

  // Calculate overall risk score with mathematical precision
  calculateRiskScore: (assessment: RiskAssessment): number => {
    const riskMap: Record<RiskLevel, number> = {
      [RiskLevel.NONE]: 0,
      [RiskLevel.LOW]: 0.25,
      [RiskLevel.MODERATE]: 0.5,
      [RiskLevel.HIGH]: 0.75,
      [RiskLevel.SEVERE]: 1,
      [RiskLevel.UNKNOWN]: 0,
    };

    // Start with overall risk
    let score = riskMap[assessment.overallRisk] * 0.5;

    // Add weighted domain risks
    const domainRisks = new SafeArray(assessment.domainRisks);
    if (!domainRisks.isEmpty()) {
      const domainScore =
        domainRisks
          .map((dr) => riskMap[dr.riskLevel] * dr.confidenceScore)
          .reduce((a, b) => a + b, 0) / domainRisks.size();

      score += domainScore * 0.3;
    }

    // Add contributing factors
    const contributingFactors = new SafeArray(assessment.contributingFactors);
    if (!contributingFactors.isEmpty()) {
      const factorScore =
        contributingFactors
          .map((cf) => cf.impactWeight)
          .reduce((a, b) => a + b, 0) / contributingFactors.size();

      score += factorScore * 0.2;
    }

    return Math.min(Math.max(score, 0), 1);
  },

  // Get risk color with theme awareness
  getRiskColor: (
    level: RiskLevel,
    colorScale: Record<RiskLevel, string> = defaultRiskColorScale,
  ): string => {
    return colorScale[level] || colorScale[RiskLevel.UNKNOWN];
  },
};

// Type guard for risk level
export function isRiskLevel(value: unknown): value is RiskLevel {
  return (
    typeof value === "string" &&
    Object.values(RiskLevel).includes(value as RiskLevel)
  );
}

// Type guard for risk assessment
export function isRiskAssessment(obj: unknown): obj is RiskAssessment {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "patientId" in obj &&
    "overallRisk" in obj &&
    isRiskLevel((obj as RiskAssessment).overallRisk)
  );
}
