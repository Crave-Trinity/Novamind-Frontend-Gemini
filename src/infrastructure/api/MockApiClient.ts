import {
  BrainModel,
  ModelSource,
  NeuralPathway,
  BrainRegion, // Import BrainRegion type
} from '@domain/models/brain/BrainModel';

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
  async getBrainModel(patientId = 'demo-patient'): Promise<ReturnType<typeof BrainModel>> {
    // Return static, simplified mock data for faster tests
    const staticRegions: BrainRegion[] = [
      {
        id: 'frontal-lobe',
        name: 'Frontal Lobe',
        description: 'desc',
        coordinates: [0, 20, 10],
        position: [0, 20, 10],
        size: 5,
        scale: 1.67,
        color: '#ff6b6b',
        volume: 250,
        significance: 0.7,
        connections: ['parietal-lobe'],
        functions: ['cognition'],
        data: {
          activity: 0.6,
          anomalies: [],
          volumes: { current: 250, expected: 275, percentile: 70 },
        },
      },
      {
        id: 'parietal-lobe',
        name: 'Parietal Lobe',
        description: 'desc',
        coordinates: [0, 10, 20],
        position: [0, 10, 20],
        size: 4,
        scale: 1.33,
        color: '#64748b',
        volume: 200,
        significance: 0.5,
        connections: ['frontal-lobe'],
        functions: ['sensory'],
        data: {
          activity: 0.4,
          anomalies: [],
          volumes: { current: 200, expected: 220, percentile: 50 },
        },
      },
      // Add more static regions if needed for specific tests, but keep it minimal
    ];

    const staticPathways: NeuralPathway[] = [
      {
        id: 'path-1',
        sourceId: 'frontal-lobe',
        targetId: 'parietal-lobe',
        strength: 0.8,
        type: 'excitatory',
        significance: 0.8,
        isActive: true,
      },
      // Add more static pathways if needed
    ];

    return {
      id: `model-${patientId}-${Date.now()}`,
      patientId: patientId,
      regions: staticRegions,
      pathways: staticPathways,
      timestamp: new Date().toISOString(),
      metadata: {
        modelVersion: '1.2.3',
        confidenceScore: 0.89,
        dataQuality: 0.95,
        source: ModelSource.SIMULATION,
      },
    };
  }

  // Keep other methods if they exist and are needed...
}

// Export singleton instance
export const mockApiClient = new MockApiClient();
