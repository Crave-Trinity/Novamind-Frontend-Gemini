import type { Identifiable, Timestamped } from '../common';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface MedicalEvent extends Identifiable, Timestamped {
  type: string;
  description: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved' | 'ongoing';
  metadata: Record<string, unknown>;
}

export interface Patient extends Identifiable {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  medicalHistory: MedicalEvent[];
}

export interface PatientStats {
  totalScans: number;
  lastScanDate: string | null;
  activeDiagnoses: number;
  treatmentProgress: number;
} 