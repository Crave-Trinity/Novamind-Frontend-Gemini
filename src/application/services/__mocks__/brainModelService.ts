import { vi } from 'vitest';
import type { BrainModel, BrainScan } from '@domain/types/brain/models';

// Define mock data structure matching BrainModel interface
const mockPatientId = 'mock-patient';
const minimalScan: BrainScan = {
  id: 'scan-mock',
  patientId: mockPatientId,
  scanDate: new Date().toISOString(),
  scanType: 'fMRI',
  dataQualityScore: 0.9,
};
const minimalBrainModel: BrainModel = {
  id: 'mock-model-id',
  patientId: mockPatientId,
  regions: [],
  connections: [],
  scan: minimalScan,
  timestamp: new Date().toISOString(),
  version: '1.0-mock',
  processingLevel: 'analyzed',
  lastUpdated: new Date().toISOString(),
};

export const mockGetBrainModel = vi
  .fn()
  .mockResolvedValue({ success: true, value: minimalBrainModel });
export const mockUpdateBrainModel = vi
  .fn()
  .mockResolvedValue({ success: true, value: { ...minimalBrainModel, version: '1.1-mock' } });
export const mockPredictTreatmentResponse = vi.fn().mockResolvedValue({
  success: true,
  value: {
    predictionId: 'pred-mock',
    predictedResponse: 0.7,
    confidenceInterval: [0.6, 0.8],
    treatmentId: 'treat-mock',
    patientId: mockPatientId,
  },
});

export const brainModelService = {
  getBrainModel: mockGetBrainModel,
  updateBrainModel: mockUpdateBrainModel,
  predictTreatmentResponse: mockPredictTreatmentResponse,
};

// Also mock default export if the original module uses it
export default brainModelService;
