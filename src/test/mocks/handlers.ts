import { http, HttpResponse } from 'msw';
import type { BrainModel, BrainRegion, BrainScan, NeuralConnection, Patient } from '@domain/types';

// Mock data
const mockPatient: Patient = {
  id: 'test-patient',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  medicalHistory: [],
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'Boston',
    state: 'MA',
    zip: '02108'
  },
  insurance: {
    provider: 'TestInsurance',
    policyNumber: '12345'
  }
};

const mockBrainScan: BrainScan = {
  id: 'test-scan',
  patientId: 'test-patient',
  scanDate: '2024-03-20',
  scanType: 'fMRI',
  resolution: { x: 256, y: 256, z: 128 },
  metadata: {},
  dataQualityScore: 0.95,
  artifacts: [],
  notes: '',
  technician: 'Dr. Smith',
  machine: {
    id: 'scanner-01',
    type: 'Siemens Magnetom',
    calibrationDate: '2024-01-01'
  }
};

const mockRegions: BrainRegion[] = [
  {
    id: 'region-1',
    name: 'Prefrontal Cortex',
    position: { x: 0, y: 0, z: 0 },
    volume: 100,
    activity: 0.8,
    connections: ['region-2'],
    color: '#FF6B6B',
    activityLevel: 'high',
    type: 'cortical',
    hemisphere: 'left',
    metrics: {
      density: 0.85,
      thickness: 2.5,
      surfaceArea: 120
    }
  },
  {
    id: 'region-2',
    name: 'Amygdala',
    position: { x: 10, y: -5, z: 5 },
    volume: 50,
    activity: 0.6,
    connections: ['region-1'],
    color: '#4ECDC4',
    activityLevel: 'medium',
    type: 'subcortical',
    hemisphere: 'right',
    metrics: {
      density: 0.75,
      thickness: 1.8,
      surfaceArea: 45
    }
  }
];

const mockConnections: NeuralConnection[] = [
  {
    id: 'connection-1',
    sourceId: 'region-1',
    targetId: 'region-2',
    strength: 0.7,
    type: 'excitatory',
    directionality: 'bidirectional',
    metrics: {
      signalSpeed: 0.85,
      bandwidth: 0.65,
      reliability: 0.9
    },
    pathPoints: [
      { x: 0, y: 0, z: 0 },
      { x: 5, y: -2.5, z: 2.5 },
      { x: 10, y: -5, z: 5 }
    ]
  }
];

const mockBrainModel: BrainModel = {
  id: 'test-model',
  patientId: 'test-patient',
  scan: mockBrainScan,
  regions: mockRegions,
  connections: mockConnections,
  metadata: {
    version: '1.0.0',
    generatedAt: '2024-03-20T12:00:00Z',
    algorithm: 'DeepBrain v2.1'
  },
  analysisResults: {
    overallHealth: 0.85,
    anomalies: [],
    recommendations: []
  }
};

// API Handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'DOCTOR',
      },
    });
  }),

  // Patient endpoints
  http.get('/api/patients', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'John Doe',
        age: 45,
        diagnosis: 'Depression',
        lastVisit: '2024-03-01',
      },
      {
        id: '2',
        name: 'Jane Smith',
        age: 32,
        diagnosis: 'Anxiety',
        lastVisit: '2024-03-05',
      },
    ]);
  }),

  // Brain scan endpoints
  http.get('/api/patients/:patientId/scans/:scanId', ({ params }) => {
    if (params.patientId === mockPatient.id && params.scanId === mockBrainScan.id) {
      return HttpResponse.json(mockBrainScan);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('/api/patients/:patientId/scans', ({ params }) => {
    if (params.patientId === mockPatient.id) {
      return HttpResponse.json([mockBrainScan]);
    }
    return HttpResponse.json([]);
  }),

  // Brain model endpoints
  http.get('/api/brain-models/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Default Brain Model',
      regions: [
        {
          id: 'r1',
          name: 'Frontal Lobe',
          activity: 0.75,
          connections: ['r2', 'r3'],
        },
        {
          id: 'r2',
          name: 'Temporal Lobe',
          activity: 0.65,
          connections: ['r1', 'r4'],
        },
      ],
    });
  }),

  http.get('/api/patients/:patientId/models', ({ params }) => {
    if (params.patientId === mockPatient.id) {
      return HttpResponse.json([mockBrainModel]);
    }
    return HttpResponse.json([]);
  }),

  // Fallback handler for unmatched requests
  http.all('*', ({ request }) => {
    console.error(`Unhandled ${request.method} request to ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  })
]; 