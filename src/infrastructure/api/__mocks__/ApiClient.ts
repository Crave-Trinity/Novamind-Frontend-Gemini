import { vi } from 'vitest';
import type { BrainModel } from '@domain/types/brain/models';

const mockBrainModel: BrainModel = {
  id: "test-brain",
  patientId: "test-patient",
  regions: [],
  connections: [],
  scan: {
    id: "test-scan",
    patientId: "test-patient",
    scanDate: "2024-01-01T00:00:00.000Z",
    scanType: "fMRI",
    dataQualityScore: 1
  },
  timestamp: "2024-01-01T00:00:00.000Z",
  version: "1.0.0",
  processingLevel: "raw",
  lastUpdated: "2024-01-01T00:00:00.000Z"
};

export const apiClient = {
  getBrainModel: vi.fn().mockImplementation(async (patientId?: string) => {
    console.log('[MOCK] getBrainModel called with:', patientId);
    console.log('[MOCK] Returning data:', mockBrainModel);
    return mockBrainModel;
  })
}; 