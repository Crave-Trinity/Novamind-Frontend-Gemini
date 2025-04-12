/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Type Definitions
 * DigitalTwinProfile - Aggregated patient data view for the dashboard.
 */

// Placeholder types - Replace 'any' with specific imported types later
export type RiskAssessment = any;

export interface AssessmentScore {
  id: string;
  type: string;
  score: number;
  maxScore: number;
  change?: number;
  clinicalSignificance: 'none' | 'mild' | 'moderate' | 'severe';
  date?: string;
  notes?: string;
}
export type TreatmentPlan = any;
export type Biomarker = any;

export interface DigitalTwinProfile {
  // Properties accessed in DigitalTwinDashboard.tsx
  primaryDiagnosis: string;
  currentSeverity: string | number; // Assuming severity might be string or number
  updatedAt: Date | string; // Assuming date or string representation
  riskAssessments: RiskAssessment[];
  assessmentScores: AssessmentScore[];
  treatmentPlan: TreatmentPlan;
  biomarkers: Biomarker[];

  // Include other relevant fields if known, potentially from PatientModel
  id: string; // Likely needed
  // Add other fields as necessary based on how profile is constructed/used
}

// Optional: Type guard
export function isDigitalTwinProfile(obj: unknown): obj is DigitalTwinProfile {
  if (!obj || typeof obj !== 'object') return false;
  const profile = obj as Partial<DigitalTwinProfile>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.primaryDiagnosis === 'string' &&
    (typeof profile.currentSeverity === 'string' || typeof profile.currentSeverity === 'number') &&
    (profile.updatedAt instanceof Date || typeof profile.updatedAt === 'string') &&
    Array.isArray(profile.riskAssessments) &&
    Array.isArray(profile.assessmentScores) &&
    typeof profile.treatmentPlan === 'object' && // Basic check
    Array.isArray(profile.biomarkers)
    // Add checks for other required fields
  );
}
