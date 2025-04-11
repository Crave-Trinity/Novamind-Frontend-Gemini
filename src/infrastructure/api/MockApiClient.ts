import type { BrainModel, NeuralConnection, BrainRegion } from '@domain/types/brain/models'; // Corrected path and type name
// Removed import for ModelSource as it's not exported

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
  async getBrainModel(patientId = 'demo-patient'): Promise<BrainModel> {
    // Use imported BrainModel type
    // Return static, simplified mock data for faster tests
    const staticRegions: BrainRegion[] = [
      {
        id: 'frontal-lobe',
        name: 'Frontal Lobe',
        // Removed description as it's not in BrainRegion type
        // Removed coordinates as it's not in BrainRegion type
        position: { x: 0, y: 20, z: 10 }, // Corrected format
        // Removed size as it's not in BrainRegion type
        // Removed scale as it's not in BrainRegion type
        color: '#ff6b6b',
        volume: 250,
        activityLevel: 0.6, // Added missing property
        isActive: true, // Added missing property
        hemisphereLocation: 'central', // Added missing property
        dataConfidence: 0.9, // Added missing property
        activity: 0.6, // Added missing property (potentially redundant with activityLevel)
        // Removed significance as it's not in BrainRegion type
        connections: ['parietal-lobe'],
        // Removed functions as it's not in BrainRegion type
        // Removed data property as it's not in BrainRegion type
      },
      {
        id: 'parietal-lobe',
        name: 'Parietal Lobe',
        // Removed description as it's not in BrainRegion type
        // Removed coordinates as it's not in BrainRegion type
        position: { x: 0, y: 10, z: 20 }, // Corrected format
        // Removed size as it's not in BrainRegion type
        // Removed scale as it's not in BrainRegion type
        color: '#64748b',
        volume: 200,
        activityLevel: 0.4, // Added missing property
        isActive: false, // Added missing property
        hemisphereLocation: 'left', // Added missing property
        dataConfidence: 0.85, // Added missing property
        activity: 0.4, // Added missing property (potentially redundant with activityLevel)
        // Removed significance as it's not in BrainRegion type
        connections: ['frontal-lobe'],
        // Removed functions as it's not in BrainRegion type
        // Removed data property as it's not in BrainRegion type
      },
      // Add more static regions if needed for specific tests, but keep it minimal
    ];

    const staticConnections: NeuralConnection[] = [
      // Use correct type name
      {
        id: 'path-1',
        sourceId: 'frontal-lobe',
        targetId: 'parietal-lobe',
        strength: 0.8,
        type: 'excitatory',
        directionality: 'bidirectional', // Added missing property
        activityLevel: 0.7, // Added missing property
        dataConfidence: 0.8, // Added missing property
      },
      // Add more static pathways if needed
    ];

    return {
      id: `model-${patientId}-${Date.now()}`,
      patientId: patientId,
      regions: staticRegions,
      connections: staticConnections, // Renamed property
      timestamp: new Date().toISOString(),
      // Removed metadata property as it's not in BrainModel type
      scan: {
        // Added missing scan property
        id: `scan-${patientId}-${Date.now()}`,
        patientId: patientId,
        scanDate: new Date().toISOString(),
        scanType: 'fMRI',
        resolution: { x: 1, y: 1, z: 1 },
        metadata: {},
        dataQualityScore: 0.95,
      },
      version: 'mock-1.0', // Added missing version property
      processingLevel: 'analyzed', // Added missing processingLevel property
      lastUpdated: new Date().toISOString(), // Added missing lastUpdated property
    };
  }

  // Keep other methods if they exist and are needed...
}

// Export singleton instance
export const mockApiClient = new MockApiClient();
