/**
 * NOVAMIND Neural-Safe Clinical Event Types
 * Defines structures for various clinical timeline events.
 */

// Base interface for all clinical events
export interface ClinicalEventBase {
  id: string;
  type: ClinicalEventType;
  title: string;
  details?: string;
  date: string; // ISO 8601 string
  neuralCorrelation?: NeuralCorrelation;
  actions?: string[]; // Potential actions related to the event
}

// Discriminating union type for different event types
export type ClinicalEventType = 
  | "symptom" 
  | "medication" 
  | "diagnosis" 
  | "assessment" 
  | "therapy" // Example: Add other potential types
  | "lifestyle"; // Example: Add other potential types

// Specific event types extending the base
export interface SymptomEvent extends ClinicalEventBase {
  type: "symptom";
  severity: "mild" | "moderate" | "severe"; // Use specific severity levels
  duration?: string;
  triggers?: string[];
  regions?: string[]; // Associated neural regions
}

export interface TreatmentEvent extends ClinicalEventBase {
  type: "medication"; // Assuming 'medication' is a type of TreatmentEvent
  dosage?: string;
  frequency?: string;
  targetSymptoms?: string[];
  sideEffects?: string[];
}

export interface DiagnosisEvent extends ClinicalEventBase {
  type: "diagnosis";
  code?: string; // e.g., ICD-10 code
  clinician?: string;
  relatedSymptoms?: string[];
}

export interface AssessmentEvent extends ClinicalEventBase {
  type: "assessment";
  score?: number;
  clinician?: string;
  findings?: string[];
}

// Neural correlation details (can be shared across event types)
interface NeuralCorrelation {
  strength: number; // 0-1
  description: string;
  regions: string[];
  confidence?: number; // Optional confidence score
}

// Union type representing any possible clinical event
export type ClinicalEvent = 
  | SymptomEvent 
  | TreatmentEvent 
  | DiagnosisEvent 
  | AssessmentEvent;
  // Add other event types to the union as needed