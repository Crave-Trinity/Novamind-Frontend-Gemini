/**
 * Mock API for demo purposes
 * 
 * This file provides mock data responses for frontend development
 * before connecting to the real backend API.
 */

// Simulate network delay for realistic testing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock patient data
const mockPatients = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Thompson',
    dateOfBirth: '1985-05-12',
    gender: 'Female',
    mrn: 'MRN12345',
    status: 'Active',
    riskLevel: 'Medium',
    lastVisit: '2025-03-15',
    diagnoses: ['Major Depressive Disorder', 'Generalized Anxiety Disorder'],
    currentMedications: [
      { name: 'Sertraline', dosage: '100mg', frequency: 'Daily' },
      { name: 'Clonazepam', dosage: '0.5mg', frequency: 'As needed' }
    ]
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    dateOfBirth: '1992-11-03',
    gender: 'Male',
    mrn: 'MRN67890',
    status: 'Active',
    riskLevel: 'High',
    lastVisit: '2025-03-20',
    diagnoses: ['Bipolar I Disorder', 'Substance Use Disorder'],
    currentMedications: [
      { name: 'Lithium', dosage: '900mg', frequency: 'Daily' },
      { name: 'Quetiapine', dosage: '300mg', frequency: 'Nightly' }
    ]
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Chen',
    dateOfBirth: '1979-03-24',
    gender: 'Female',
    mrn: 'MRN54321',
    status: 'Active',
    riskLevel: 'Low',
    lastVisit: '2025-03-10',
    diagnoses: ['Post-Traumatic Stress Disorder'],
    currentMedications: [
      { name: 'Prazosin', dosage: '1mg', frequency: 'Nightly' },
      { name: 'Bupropion', dosage: '150mg', frequency: 'Daily' }
    ]
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Wilson',
    dateOfBirth: '1988-07-16',
    gender: 'Male',
    mrn: 'MRN13579',
    status: 'Active',
    riskLevel: 'High',
    lastVisit: '2025-03-22',
    diagnoses: ['Schizophrenia', 'Obsessive-Compulsive Disorder'],
    currentMedications: [
      { name: 'Risperidone', dosage: '4mg', frequency: 'Daily' },
      { name: 'Fluoxetine', dosage: '40mg', frequency: 'Daily' }
    ]
  },
  {
    id: '5',
    firstName: 'Olivia',
    lastName: 'Johnson',
    dateOfBirth: '1995-12-05',
    gender: 'Female',
    mrn: 'MRN24680',
    status: 'Active',
    riskLevel: 'Medium',
    lastVisit: '2025-03-18',
    diagnoses: ['Major Depressive Disorder', 'Eating Disorder NOS'],
    currentMedications: [
      { name: 'Escitalopram', dosage: '20mg', frequency: 'Daily' },
      { name: 'Olanzapine', dosage: '5mg', frequency: 'Nightly' }
    ]
  }
];

// Mock patient details with additional data
const mockPatientDetails = {
  '1': {
    id: '1',
    firstName: 'Emma',
    lastName: 'Thompson',
    dateOfBirth: '1985-05-12',
    gender: 'Female',
    mrn: 'MRN12345',
    status: 'Active',
    riskLevel: 'Medium',
    lastVisit: '2025-03-15',
    diagnoses: ['Major Depressive Disorder', 'Generalized Anxiety Disorder'],
    currentMedications: [
      { name: 'Sertraline', dosage: '100mg', frequency: 'Daily' },
      { name: 'Clonazepam', dosage: '0.5mg', frequency: 'As needed' }
    ],
    assessments: [
      { 
        name: 'PHQ-9', 
        score: 14, 
        interpretation: 'Moderate Depression',
        date: '2025-03-15',
        previousScores: [18, 16, 15, 14]
      },
      { 
        name: 'GAD-7', 
        score: 12, 
        interpretation: 'Moderate Anxiety',
        date: '2025-03-15',
        previousScores: [15, 14, 13, 12]
      },
      { 
        name: 'MOCA', 
        score: 27, 
        interpretation: 'Normal Cognitive Function',
        date: '2025-03-10',
        previousScores: [26, 27, 27, 27]
      }
    ],
    vitalSigns: [
      { name: 'Heart Rate', value: 72, unit: 'bpm', normalRange: '60-100' },
      { name: 'Blood Pressure', value: '118/78', unit: 'mmHg', normalRange: '90-120/60-80' },
      { name: 'Sleep Quality', value: 6.5, unit: 'hours', normalRange: '7-9' },
      { name: 'HRV', value: 45, unit: 'ms', normalRange: '20-200' }
    ],
    riskFactors: [
      { name: 'Suicide', level: 'Medium', trend: 'Decreasing', lastUpdated: '2025-03-15' },
      { name: 'Self-Harm', level: 'Low', trend: 'Stable', lastUpdated: '2025-03-15' },
      { name: 'Treatment Non-Adherence', level: 'Medium', trend: 'Stable', lastUpdated: '2025-03-15' },
      { name: 'Substance Use', level: 'Low', trend: 'Stable', lastUpdated: '2025-03-15' }
    ],
    treatmentResponses: [
      { treatment: 'Sertraline', responseLevel: 'Moderate', confidence: 75, predictedRemission: '65%' },
      { treatment: 'CBT', responseLevel: 'High', confidence: 85, predictedRemission: '72%' },
      { treatment: 'Mindfulness', responseLevel: 'Moderate', confidence: 70, predictedRemission: '60%' }
    ]
  },
  '2': {
    id: '2',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    dateOfBirth: '1992-11-03',
    gender: 'Male',
    mrn: 'MRN67890',
    status: 'Active',
    riskLevel: 'High',
    lastVisit: '2025-03-20',
    diagnoses: ['Bipolar I Disorder', 'Substance Use Disorder'],
    currentMedications: [
      { name: 'Lithium', dosage: '900mg', frequency: 'Daily' },
      { name: 'Quetiapine', dosage: '300mg', frequency: 'Nightly' }
    ],
    assessments: [
      { 
        name: 'YMRS', 
        score: 22, 
        interpretation: 'Moderate Mania',
        date: '2025-03-20',
        previousScores: [18, 20, 23, 22]
      },
      { 
        name: 'MADRS', 
        score: 8, 
        interpretation: 'Minimal Depression',
        date: '2025-03-20',
        previousScores: [15, 12, 10, 8]
      },
      { 
        name: 'CAGE-AID', 
        score: 3, 
        interpretation: 'Substance Use Concern',
        date: '2025-03-15',
        previousScores: [4, 4, 3, 3]
      }
    ],
    vitalSigns: [
      { name: 'Heart Rate', value: 88, unit: 'bpm', normalRange: '60-100' },
      { name: 'Blood Pressure', value: '130/85', unit: 'mmHg', normalRange: '90-120/60-80' },
      { name: 'Sleep Quality', value: 5.0, unit: 'hours', normalRange: '7-9' },
      { name: 'HRV', value: 35, unit: 'ms', normalRange: '20-200' }
    ],
    riskFactors: [
      { name: 'Suicide', level: 'High', trend: 'Increasing', lastUpdated: '2025-03-20' },
      { name: 'Self-Harm', level: 'Medium', trend: 'Stable', lastUpdated: '2025-03-20' },
      { name: 'Treatment Non-Adherence', level: 'High', trend: 'Increasing', lastUpdated: '2025-03-20' },
      { name: 'Substance Use', level: 'High', trend: 'Stable', lastUpdated: '2025-03-20' }
    ],
    treatmentResponses: [
      { treatment: 'Lithium', responseLevel: 'Moderate', confidence: 65, predictedRemission: '55%' },
      { treatment: 'Quetiapine', responseLevel: 'High', confidence: 80, predictedRemission: '70%' },
      { treatment: 'Dialectical Behavior Therapy', responseLevel: 'Low', confidence: 45, predictedRemission: '35%' }
    ]
  }
};

// Mock brain model data
const mockBrainModel = {
  id: 'default',
  name: 'Default Adult Brain',
  regions: [
    {
      id: 'prefrontal',
      name: 'Prefrontal Cortex',
      description: 'Involved in planning complex cognitive behavior, personality expression, decision making, and moderating social behavior.',
      position: [0, 0, 0],
      volume: 100,
      activityLevel: 75,
      bloodFlow: 80,
      connectivityStrength: 85,
      associatedConditions: ['Major Depression', 'ADHD', 'OCD'],
      connections: [
        { targetRegionId: 'hippocampus', strength: 65, pathwayId: 'pf-hc' },
        { targetRegionId: 'amygdala', strength: 70, pathwayId: 'pf-am' }
      ]
    },
    {
      id: 'hippocampus',
      name: 'Hippocampus',
      description: 'Critical for learning and memory, particularly declarative memory.',
      position: [2, -1, 0],
      volume: 85,
      activityLevel: 65,
      bloodFlow: 70,
      connectivityStrength: 75,
      associatedConditions: ['Alzheimer\'s', 'PTSD', 'Memory Disorders'],
      connections: [
        { targetRegionId: 'prefrontal', strength: 65, pathwayId: 'hc-pf' },
        { targetRegionId: 'amygdala', strength: 80, pathwayId: 'hc-am' }
      ]
    },
    {
      id: 'amygdala',
      name: 'Amygdala',
      description: 'Responsible for processing emotions, particularly fear and threat responses.',
      position: [1, -1.5, 0],
      volume: 70,
      activityLevel: 80,
      bloodFlow: 75,
      connectivityStrength: 70,
      associatedConditions: ['Anxiety', 'PTSD', 'Phobias'],
      connections: [
        { targetRegionId: 'prefrontal', strength: 70, pathwayId: 'am-pf' },
        { targetRegionId: 'hippocampus', strength: 80, pathwayId: 'am-hc' }
      ]
    },
    {
      id: 'thalamus',
      name: 'Thalamus',
      description: 'Relay center for sensory and motor signals to the cerebral cortex.',
      position: [0, -1, 1],
      volume: 90,
      activityLevel: 70,
      bloodFlow: 65,
      connectivityStrength: 90,
      associatedConditions: ['Sensory Processing Disorders', 'Epilepsy'],
      connections: [
        { targetRegionId: 'prefrontal', strength: 85, pathwayId: 'th-pf' },
        { targetRegionId: 'amygdala', strength: 60, pathwayId: 'th-am' }
      ]
    },
    {
      id: 'striatum',
      name: 'Striatum',
      description: 'Part of the basal ganglia, involved in reward processing and movement coordination.',
      position: [1, 0, 1],
      volume: 75,
      activityLevel: 60,
      bloodFlow: 55,
      connectivityStrength: 65,
      associatedConditions: ['Addiction', 'Parkinson\'s', 'OCD'],
      connections: [
        { targetRegionId: 'prefrontal', strength: 75, pathwayId: 'st-pf' },
        { targetRegionId: 'thalamus', strength: 70, pathwayId: 'st-th' }
      ]
    }
  ],
  pathways: [
    { id: 'pf-hc', startRegionId: 'prefrontal', endRegionId: 'hippocampus', strength: 65, activity: 60 },
    { id: 'pf-am', startRegionId: 'prefrontal', endRegionId: 'amygdala', strength: 70, activity: 65 },
    { id: 'hc-pf', startRegionId: 'hippocampus', endRegionId: 'prefrontal', strength: 65, activity: 60 },
    { id: 'hc-am', startRegionId: 'hippocampus', endRegionId: 'amygdala', strength: 80, activity: 75 },
    { id: 'am-pf', startRegionId: 'amygdala', endRegionId: 'prefrontal', strength: 70, activity: 65 },
    { id: 'am-hc', startRegionId: 'amygdala', endRegionId: 'hippocampus', strength: 80, activity: 75 },
    { id: 'th-pf', startRegionId: 'thalamus', endRegionId: 'prefrontal', strength: 85, activity: 80 },
    { id: 'th-am', startRegionId: 'thalamus', endRegionId: 'amygdala', strength: 60, activity: 55 },
    { id: 'st-pf', startRegionId: 'striatum', endRegionId: 'prefrontal', strength: 75, activity: 70 },
    { id: 'st-th', startRegionId: 'striatum', endRegionId: 'thalamus', strength: 70, activity: 65 }
  ]
};

// Exported mock API functions
export const mockApi = {
  // Get all patients
  getPatients: async () => {
    await delay(800);
    return mockPatients;
  },
  
  // Get patient by ID
  getPatientById: async (patientId: string) => {
    await delay(600);
    return mockPatientDetails[patientId as keyof typeof mockPatientDetails] || mockPatientDetails['1'];
  },
  
  // Get brain model
  getBrainModel: async (modelId: string = 'default') => {
    await delay(1000);
    return mockBrainModel;
  },
  
  // Predict treatment response
  predictTreatmentResponse: async (patientId: string, treatment: string) => {
    await delay(1500);
    return {
      treatment,
      responseLevel: Math.random() > 0.5 ? 'High' : 'Moderate',
      confidence: Math.floor(65 + Math.random() * 25),
      predictedRemission: `${Math.floor(55 + Math.random() * 30)}%`
    };
  },
  
  // Get risk assessment
  getRiskAssessment: async (patientId: string) => {
    await delay(800);
    const patient = mockPatientDetails[patientId as keyof typeof mockPatientDetails] || mockPatientDetails['1'];
    return patient.riskFactors;
  }
};
