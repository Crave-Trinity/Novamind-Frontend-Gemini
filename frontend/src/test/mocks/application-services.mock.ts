/**
 * NOVAMIND Neural Architecture
 * Application Services Mock Implementation with Quantum Precision
 *
 * This implementation creates neural-safe mocks for application services
 * with clinical precision for testing visualization components.
 */

import { vi } from "vitest";

// Neural-safe mock for biometric service with quantum precision
export const biometricService = {
  fetchBiometricData: vi.fn().mockResolvedValue({
    heartRate: [
      { timestamp: 1617235200000, value: 72, unit: "bpm" },
      { timestamp: 1617235800000, value: 75, unit: "bpm" },
      { timestamp: 1617236400000, value: 70, unit: "bpm" },
    ],
    bloodPressure: [
      { timestamp: 1617235200000, systolic: 120, diastolic: 80, unit: "mmHg" },
      { timestamp: 1617235800000, systolic: 118, diastolic: 78, unit: "mmHg" },
      { timestamp: 1617236400000, systolic: 122, diastolic: 82, unit: "mmHg" },
    ],
    sleepData: [
      {
        date: "2023-04-01",
        duration: 7.5,
        quality: 0.85,
        deepSleepPercentage: 0.25,
      },
      {
        date: "2023-04-02",
        duration: 8.0,
        quality: 0.9,
        deepSleepPercentage: 0.3,
      },
    ],
    cortisol: [
      { timestamp: 1617235200000, value: 12.5, unit: "μg/dL" },
      { timestamp: 1617321600000, value: 10.2, unit: "μg/dL" },
    ],
  }),

  fetchAlerts: vi.fn().mockResolvedValue([
    {
      id: "alert-1",
      timestamp: 1617235200000,
      severity: "warning",
      metric: "heartRate",
      value: 110,
      threshold: 100,
      message: "Heart rate elevated above normal range",
    },
    {
      id: "alert-2",
      timestamp: 1617236400000,
      severity: "critical",
      metric: "bloodPressure",
      value: { systolic: 160, diastolic: 95 },
      threshold: { systolic: 140, diastolic: 90 },
      message: "Blood pressure significantly elevated",
    },
  ]),

  subscribeToBiometricUpdates: vi.fn().mockImplementation((callback) => {
    // Neural-safe mock implementation with clinical precision
    setTimeout(() => {
      callback({
        heartRate: { timestamp: Date.now(), value: 75, unit: "bpm" },
      });
    }, 100);

    return () => {}; // Unsubscribe function
  }),

  analyzePatternsByMetric: vi.fn().mockResolvedValue({
    patterns: [
      {
        id: "pattern-1",
        metric: "heartRate",
        patternType: "circadian",
        confidence: 0.85,
        description: "Regular diurnal variation with peak at 14:00",
      },
      {
        id: "pattern-2",
        metric: "cortisol",
        patternType: "abnormal",
        confidence: 0.78,
        description: "Inverted cortisol pattern with evening elevation",
      },
    ],
    correlations: [
      {
        metrics: ["heartRate", "bloodPressure"],
        coefficient: 0.72,
        significance: 0.95,
        description: "Strong correlation between heart rate and blood pressure",
      },
    ],
  }),
};

// Neural-safe mock for treatment service with quantum precision
export const treatmentService = {
  fetchTreatmentData: vi.fn().mockResolvedValue({
    currentMedications: [
      { id: "med-1", name: "Sertraline", dosage: "50mg", frequency: "daily" },
      {
        id: "med-2",
        name: "Lorazepam",
        dosage: "0.5mg",
        frequency: "as needed",
      },
    ],
    therapySessions: [
      {
        id: "therapy-1",
        date: "2023-04-01",
        type: "CBT",
        duration: 60,
        notes: "Focused on anxiety triggers",
      },
      {
        id: "therapy-2",
        date: "2023-04-08",
        type: "CBT",
        duration: 60,
        notes: "Exposure exercise planning",
      },
    ],
    adherence: {
      medications: 0.92,
      therapy: 1.0,
      selfCare: 0.75,
    },
    responseMetrics: {
      symptomReduction: 0.65,
      functionalImprovement: 0.5,
      sideEffects: 0.2,
    },
  }),

  simulateTreatmentResponse: vi.fn().mockResolvedValue({
    projectedOutcomes: [
      { week: 1, symptomReduction: 0.1, confidence: 0.6 },
      { week: 2, symptomReduction: 0.25, confidence: 0.7 },
      { week: 4, symptomReduction: 0.4, confidence: 0.75 },
      { week: 8, symptomReduction: 0.6, confidence: 0.8 },
    ],
    sideEffectProbability: 0.15,
    timeToResponse: { median: 4, range: [2, 6], unit: "weeks" },
  }),

  getTreatmentRecommendations: vi.fn().mockResolvedValue([
    {
      id: "rec-1",
      type: "medication",
      name: "Increase Sertraline",
      details:
        "Consider increasing dosage to 75mg after week 4 if minimal response",
      evidenceLevel: "A",
      confidence: 0.85,
    },
    {
      id: "rec-2",
      type: "therapy",
      name: "Add mindfulness practice",
      details: "Recommend daily 10-minute mindfulness meditation",
      evidenceLevel: "B",
      confidence: 0.75,
    },
  ]),
};

// Neural-safe mock for neural activity service with clinical precision
export const neuralActivityService = {
  fetchNeuralData: vi.fn().mockResolvedValue({
    regions: [
      { id: "prefrontal-cortex", activity: 0.75, connectivity: 0.68 },
      { id: "amygdala", activity: 0.85, connectivity: 0.62 },
      { id: "hippocampus", activity: 0.56, connectivity: 0.71 },
    ],
    connections: [
      { source: "prefrontal-cortex", target: "amygdala", strength: 0.45 },
      { source: "hippocampus", target: "prefrontal-cortex", strength: 0.65 },
      { source: "amygdala", target: "hippocampus", strength: 0.52 },
    ],
    temporalDynamics: [
      {
        timestamp: 1617235200000,
        regionId: "prefrontal-cortex",
        activity: 0.78,
      },
      {
        timestamp: 1617235800000,
        regionId: "prefrontal-cortex",
        activity: 0.72,
      },
      { timestamp: 1617235200000, regionId: "amygdala", activity: 0.82 },
      { timestamp: 1617235800000, regionId: "amygdala", activity: 0.88 },
    ],
  }),

  simulateActivationPattern: vi.fn().mockImplementation((pattern) => {
    return Promise.resolve({
      regions: [
        {
          id: "prefrontal-cortex",
          activity: pattern === "anxiety" ? 0.55 : 0.75,
          connectivity: 0.68,
        },
        {
          id: "amygdala",
          activity: pattern === "anxiety" ? 0.95 : 0.65,
          connectivity: 0.62,
        },
        {
          id: "hippocampus",
          activity: pattern === "anxiety" ? 0.45 : 0.72,
          connectivity: 0.71,
        },
      ],
      description:
        pattern === "anxiety"
          ? "Elevated amygdala activation with reduced prefrontal control"
          : "Balanced activation across neural circuits",
    });
  }),

  getRegionDetails: vi.fn().mockImplementation((regionId) => {
    const regions = {
      "prefrontal-cortex": {
        name: "Prefrontal Cortex",
        description: "Executive function and decision making",
        normalActivity: { min: 0.4, max: 0.7 },
        connections: ["amygdala", "hippocampus"],
      },
      amygdala: {
        name: "Amygdala",
        description: "Fear and emotion processing",
        normalActivity: { min: 0.3, max: 0.6 },
        connections: ["prefrontal-cortex", "hippocampus"],
      },
      hippocampus: {
        name: "Hippocampus",
        description: "Memory formation and contextual processing",
        normalActivity: { min: 0.4, max: 0.7 },
        connections: ["prefrontal-cortex", "amygdala"],
      },
    };

    return Promise.resolve(regions[regionId] || null);
  }),
};

// Export all services for comprehensive mocking
export default {
  biometricService,
  treatmentService,
  neuralActivityService,
};
