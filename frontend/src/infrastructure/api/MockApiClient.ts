import {
  BrainModel,
  RenderMode,
  ModelSource,
  NeuralPathway,
} from "@domain/models/brain/BrainModel";

/**
 * Mock API Client for development & testing
 * Provides sample data for the brain visualization component
 */
export class MockApiClient {
  /**
   * Get a mock brain model for visualization
   * @param patientId The ID of the patient
   * @returns A sample brain model
   */
  async getBrainModel(patientId = "demo-patient"): Promise<ReturnType<typeof BrainModel>> {
    // Simulate network latency for realistic testing
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return a mock brain model
    return {
      id: `model-${patientId}-${Date.now()}`,
      patientId: patientId,
      regions: generateBrainRegions(),
      pathways: generateNeuralPathways(),
      timestamp: new Date().toISOString(),
      metadata: {
        modelVersion: "1.2.3",
        confidenceScore: 0.89,
        dataQuality: 0.95,
        source: ModelSource.SIMULATION,
      },
    };
  }
}

/**
 * Generate sample brain regions
 */
function generateBrainRegions() {
  // A list of brain regions with their locations in 3D space
  const regionData = [
    {
      id: "frontal-lobe",
      name: "Frontal Lobe",
      pos: [0, 20, 10],
      size: 5,
      significance: 0.7,
    },
    {
      id: "parietal-lobe",
      name: "Parietal Lobe",
      pos: [0, 10, 20],
      size: 4,
      significance: 0.5,
    },
    {
      id: "temporal-lobe",
      name: "Temporal Lobe",
      pos: [15, 0, 5],
      size: 3.5,
      significance: 0.8,
    },
    {
      id: "occipital-lobe",
      name: "Occipital Lobe",
      pos: [0, -10, 15],
      size: 4,
      significance: 0.4,
    },
    {
      id: "cerebellum",
      name: "Cerebellum",
      pos: [0, -20, 0],
      size: 6,
      significance: 0.3,
    },
    {
      id: "hippocampus",
      name: "Hippocampus",
      pos: [10, -5, 0],
      size: 2,
      significance: 0.9,
    },
    {
      id: "amygdala",
      name: "Amygdala",
      pos: [12, -2, 5],
      size: 1.5,
      significance: 0.85,
    },
    {
      id: "thalamus",
      name: "Thalamus",
      pos: [5, 5, 5],
      size: 2,
      significance: 0.6,
    },
    {
      id: "hypothalamus",
      name: "Hypothalamus",
      pos: [6, 3, 2],
      size: 1,
      significance: 0.7,
    },
    {
      id: "brainstem",
      name: "Brainstem",
      pos: [0, -15, -10],
      size: 3,
      significance: 0.5,
    },
    {
      id: "corpus-callosum",
      name: "Corpus Callosum",
      pos: [0, 5, 5],
      size: 4,
      significance: 0.4,
    },
    {
      id: "prefrontal-cortex",
      name: "Prefrontal Cortex",
      pos: [0, 25, 5],
      size: 3,
      significance: 0.75,
    },
  ];

  // Generate region objects with all required properties
  return regionData.map((r) => ({
    id: r.id,
    name: r.name,
    description: `The ${r.name} region of the brain`,
    coordinates: [r.pos[0], r.pos[1], r.pos[2]] as [number, number, number],
    position: [r.pos[0], r.pos[1], r.pos[2]] as [number, number, number],
    size: r.size,
    scale: r.size / 3, // Scale for visualization
    color: r.significance > 0.7 ? "#ff6b6b" : "#64748b",
    volume: r.size * 50,
    significance: r.significance,
    connections: [], // Will be populated below
    functions: ["memory", "emotion", "cognition"],
    data: {
      activity: Math.random() * r.significance,
      anomalies: r.significance > 0.8 ? ["hyperactivity"] : [],
      volumes: {
        current: r.size * 50,
        expected: r.size * 55,
        percentile: Math.round(r.significance * 100),
      },
    },
  }));
}

/**
 * Generate sample neural pathways
 */
function generateNeuralPathways(): NeuralPathway[] {
  // Define some sample pathways between regions
  const pathwayData = [
    { source: "frontal-lobe", target: "parietal-lobe", strength: 0.8 },
    { source: "frontal-lobe", target: "temporal-lobe", strength: 0.7 },
    { source: "parietal-lobe", target: "occipital-lobe", strength: 0.9 },
    { source: "temporal-lobe", target: "hippocampus", strength: 0.85 },
    { source: "amygdala", target: "hippocampus", strength: 0.75 },
    { source: "thalamus", target: "hypothalamus", strength: 0.65 },
    { source: "brainstem", target: "cerebellum", strength: 0.7 },
    { source: "prefrontal-cortex", target: "frontal-lobe", strength: 0.9 },
  ];

  return pathwayData.map((p, index) => ({
    id: `pathway-${index}`,
    sourceId: p.source,
    targetId: p.target,
    strength: p.strength,
    // Explicitly define as one of the enum values
    type: p.strength > 0.7 ? ("excitatory" as const) : ("inhibitory" as const),
    significance: p.strength,
    isActive: p.strength > 0.75,
  }));
}

// Export singleton instance
export const mockApiClient = new MockApiClient();
