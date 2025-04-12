/**
 * Neural Mock API Implementation
 * 
 * Mathematically elegant mock API system for the psychiatric digital twin platform
 * with quantum-level precision and architectural purity
 */

// Helper for generating random IDs with neural entropy
const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

// Helper for simulating real-world network latency with neural precision
const simulateLatency = (min = 200, max = 600): Promise<void> => {
  const latency = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, latency));
};

// Neural brain regions for mock data generation
const BRAIN_REGIONS = [
  { id: 'region-001', name: 'prefrontal-cortex', clinical: true },
  { id: 'region-002', name: 'amygdala', clinical: true },
  { id: 'region-003', name: 'hippocampus', clinical: true },
  { id: 'region-004', name: 'thalamus', clinical: true },
  { id: 'region-005', name: 'hypothalamus', clinical: true },
  { id: 'region-006', name: 'cerebellum', clinical: false },
  { id: 'region-007', name: 'brainstem', clinical: false },
  { id: 'region-008', name: 'basal-ganglia', clinical: true },
  { id: 'region-009', name: 'insula', clinical: false },
  { id: 'region-010', name: 'cingulate-cortex', clinical: true },
  { id: 'region-011', name: 'occipital-lobe', clinical: false },
  { id: 'region-012', name: 'temporal-lobe', clinical: true },
  { id: 'region-013', name: 'parietal-lobe', clinical: false },
  { id: 'region-014', name: 'frontal-lobe', clinical: true },
  { id: 'region-015', name: 'corpus-callosum', clinical: false },
];

// Neural diagnostic markers for mock data generation
const DIAGNOSTIC_MARKERS = [
  { id: 'marker-001', name: 'hypoactivation', clinical: true },
  { id: 'marker-002', name: 'hyperactivation', clinical: true },
  { id: 'marker-003', name: 'asymmetry', clinical: true },
  { id: 'marker-004', name: 'connectivity-deficit', clinical: true },
  { id: 'marker-005', name: 'volume-reduction', clinical: true },
];

// Neural treatment options for mock data generation
const TREATMENT_OPTIONS = [
  { id: 'treat-001', name: 'SSRI', efficacy: 0.75, target: ['region-002', 'region-010'] },
  { id: 'treat-002', name: 'SNRI', efficacy: 0.68, target: ['region-002', 'region-003'] },
  { id: 'treat-003', name: 'TMS', efficacy: 0.82, target: ['region-001', 'region-014'] },
  { id: 'treat-004', name: 'CBT', efficacy: 0.71, target: ['region-001', 'region-010'] },
  { id: 'treat-005', name: 'Mindfulness', efficacy: 0.63, target: ['region-002', 'region-010'] },
];

// Database mock for in-memory state
const db = {
  patients: new Map(),
  brainModels: new Map(),
  visualizations: new Map(),
  diagnostics: new Map(),
  treatments: new Map(),
};

// Initialize mock database with seed data
const initializeDb = (): void => {
  // Create a mock patient
  const patientId = 'patient-001';
  const patient = {
    id: patientId,
    demographicId: 'demo-001',
    clinicalHistory: [
      {
        conditionId: 'cond-001',
        diagnosisDate: '2024-01-15',
        severity: 3,
        status: 'active',
        treatments: [
          {
            id: 'treat-001',
            type: 'medication',
            startDate: '2024-01-20',
            dosage: '10mg',
            frequency: 'daily',
          },
        ],
      },
    ],
    assessmentScores: {
      'depression': [
        {
          date: '2024-01-10',
          score: 18,
          clinicianId: 'clin-001',
          notes: 'Initial assessment',
        },
        {
          date: '2024-02-10',
          score: 14,
          clinicianId: 'clin-001',
          notes: 'Follow-up assessment',
        },
      ],
      'anxiety': [
        {
          date: '2024-01-10',
          score: 16,
          clinicianId: 'clin-001',
          notes: 'Initial assessment',
        },
        {
          date: '2024-02-10',
          score: 12,
          clinicianId: 'clin-001',
          notes: 'Follow-up assessment',
        },
      ],
    },
    metadata: {
      lastUpdated: '2024-03-10T14:30:00Z',
    },
  };

  // Create a mock brain model
  const brainModelId = 'model-001';
  const brainModel = {
    id: brainModelId,
    patientId,
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-02-10T12:45:00Z',
    modelType: 'integrated',
    processingStatus: 'complete',
    processingLevel: 'analyzed',
    version: '1.0.0',
    metadata: {
      analysisMethod: 'deep-neural-mapping-v2',
      qualityScore: 0.92,
    },
    scan: {
      id: 'scan-001',
      type: 'fMRI',
      date: '2024-02-05T10:30:00Z',
      patientId,
      scanDate: '2024-02-05',
      scanType: 'fMRI',
      dataQualityScore: 0.95,
    },
    regions: BRAIN_REGIONS.map(region => ({
      id: region.id,
      name: region.name,
      volume: Math.random() * 100 + 50,
      coordinates: [
        Math.random() * 50 - 25,
        Math.random() * 50 - 25,
        Math.random() * 50 - 25,
      ],
      connections: BRAIN_REGIONS
        .filter(() => Math.random() > 0.7) // Only connect some regions
        .map(target => ({
          targetId: target.id,
          strength: Math.random() * 0.9 + 0.1, // 0.1 - 1.0
        })),
      clinicalSignificance: region.clinical ? ['diagnostic', 'treatment'] : undefined,
    })),
    diagnosticMarkers: BRAIN_REGIONS
      .filter(region => region.clinical && Math.random() > 0.5) // Only some clinical regions have markers
      .flatMap(region => 
        DIAGNOSTIC_MARKERS
          .filter(() => Math.random() > 0.7) // Only some markers per region
          .map(marker => ({
            id: generateId('dmark'),
            regionId: region.id,
            markerType: marker.name,
            severity: Math.floor(Math.random() * 5) + 1, // 1-5
            confidence: Math.random() * 0.5 + 0.5, // 0.5 - 1.0
            clinicalNotes: Math.random() > 0.5 ? 'Significant clinical finding' : undefined,
          }))
      ),
  };

  // Store in mock database
  db.patients.set(patientId, patient);
  db.brainModels.set(brainModelId, brainModel);
};

// Initialize the database
initializeDb();

// Mock API functions with neural precision
// These functions simulate backend API endpoints

export const mockApi = {
  // User authentication and profile
  async login(email: string, password: string) {
    await simulateLatency();
    
    // Basic validation
    if (!email || !password) {
      throw new Error('Invalid credentials');
    }
    
    return {
      id: 'user-001',
      name: 'Dr. Neural Smith',
      email,
      role: 'clinician',
      token: 'mock-jwt-token',
      organization: 'NovaMind Psychiatric Research',
    };
  },
  
  async getUserProfile(userId: string) {
    await simulateLatency();
    
    return {
      id: userId,
      name: 'Dr. Neural Smith',
      email: 'neural.smith@novamind.org',
      role: 'clinician',
      organization: 'NovaMind Psychiatric Research',
      department: 'Clinical Neuroscience',
      position: 'Senior Psychiatrist',
      credentials: ['MD', 'PhD'],
      specialties: ['Neuropsychiatry', 'Digital Twin Analysis'],
      lastLogin: new Date().toISOString(),
    };
  },
  
  // Patient data
  async getPatient(patientId: string) {
    await simulateLatency();
    
    const patient = db.patients.get(patientId);
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`);
    }
    
    return patient;
  },
  
  async searchPatients(query: string) {
    await simulateLatency();
    
    // Mock search - in real API would filter by query
    return Array.from(db.patients.values());
  },
  
  // Brain models
  async getBrainModels(patientId: string) {
    await simulateLatency();
    
    // Filter brain models by patient ID
    const models = Array.from(db.brainModels.values())
      .filter(model => model.patientId === patientId);
    
    return models;
  },
  
  async getBrainModel(modelId: string) {
    await simulateLatency();
    
    const model = db.brainModels.get(modelId);
    if (!model) {
      throw new Error(`Brain model not found: ${modelId}`);
    }
    
    return model;
  },
  
  // Diagnostics and treatment
  async getDiagnosticMarkers(modelId: string) {
    await simulateLatency();
    
    const model = db.brainModels.get(modelId);
    if (!model) {
      throw new Error(`Brain model not found: ${modelId}`);
    }
    
    return model.diagnosticMarkers || [];
  },
  
  async getRegionalActivation(modelId: string) {
    await simulateLatency();
    
    const model = db.brainModels.get(modelId);
    if (!model) {
      throw new Error(`Brain model not found: ${modelId}`);
    }
    
    // Generate activation data for each brain region
    return (model.regions || []).map(region => ({
      regionId: region.id,
      regionName: region.name,
      activation: Math.random() * 0.9 + 0.1, // 0.1 - 1.0
      timeSeriesData: Array.from({ length: 20 }, () => Math.random() * 0.9 + 0.1),
    }));
  },
  
  async getTreatmentRecommendations(modelId: string) {
    await simulateLatency();
    
    const model = db.brainModels.get(modelId);
    if (!model) {
      throw new Error(`Brain model not found: ${modelId}`);
    }
    
    // Find regions with diagnostic markers
    const affectedRegions = model.diagnosticMarkers
      ? model.diagnosticMarkers.map(marker => marker.regionId)
      : [];
    
    // Filter treatments that target affected regions
    return TREATMENT_OPTIONS
      .filter(treatment => 
        treatment.target.some(targetRegion => 
          affectedRegions.includes(targetRegion)
        )
      )
      .map(treatment => ({
        id: treatment.id,
        name: treatment.name,
        efficacy: treatment.efficacy,
        targetRegions: treatment.target,
        description: `Treatment targeting ${treatment.target.join(', ')}`,
      }));
  },
  
  // Visualization API
  async getVisualizationData(modelId: string, params: Record<string, unknown> = {}) {
    await simulateLatency();
    
    const model = db.brainModels.get(modelId);
    if (!model) {
      throw new Error(`Brain model not found: ${modelId}`);
    }
    
    // Generate visualization data based on the brain model
    // In a real API, this would return complex data for 3D rendering
    return {
      regions: model.regions,
      connections: model.regions?.flatMap(region => 
        (region.connections || []).map(conn => ({
          sourceId: region.id,
          targetId: conn.targetId,
          strength: conn.strength,
        }))
      ) || [],
      activationData: (model.regions || []).map(region => ({
        regionId: region.id,
        activation: Math.random() * 0.9 + 0.1, // 0.1 - 1.0
      })),
      renderMode: params.renderMode || 'standard',
      resolution: params.resolution || 'medium',
    };
  },
};

// Export a mock response builder for testing
export const mockResponse = <T>(data: T, status = 200) => {
  return {
    data,
    status,
    headers: {
      'content-type': 'application/json',
    },
  };
};

// Export database for direct testing access
export const getMockDb = () => db;