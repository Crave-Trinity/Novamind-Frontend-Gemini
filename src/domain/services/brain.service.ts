/* eslint-disable */
import type { BrainModel, BrainRegion, NeuralConnection } from '../models/brain.model';
import type { UUID, PaginationParams, PaginatedResponse } from '../types/common';

export interface IBrainService {
  // Brain Model Operations
  getBrainModel(id: UUID): Promise<BrainModel>;
  getBrainModels(patientId: UUID, params: PaginationParams): Promise<PaginatedResponse<BrainModel>>;
  createBrainModel(patientId: UUID, model: Omit<BrainModel, 'id'>): Promise<BrainModel>;
  updateBrainModel(id: UUID, model: Partial<BrainModel>): Promise<BrainModel>;
  deleteBrainModel(id: UUID): Promise<void>;

  // Brain Region Operations
  getBrainRegion(modelId: UUID, regionId: UUID): Promise<BrainRegion>;
  createBrainRegion(modelId: UUID, region: Omit<BrainRegion, 'id'>): Promise<BrainRegion>;
  updateBrainRegion(
    modelId: UUID,
    regionId: UUID,
    region: Partial<BrainRegion>
  ): Promise<BrainRegion>;
  deleteBrainRegion(modelId: UUID, regionId: UUID): Promise<void>;

  // Neural Connection Operations
  getNeuralConnection(modelId: UUID, connectionId: UUID): Promise<NeuralConnection>;
  createNeuralConnection(
    modelId: UUID,
    connection: Omit<NeuralConnection, 'id'>
  ): Promise<NeuralConnection>;
  updateNeuralConnection(
    modelId: UUID,
    connectionId: UUID,
    connection: Partial<NeuralConnection>
  ): Promise<NeuralConnection>;
  deleteNeuralConnection(modelId: UUID, connectionId: UUID): Promise<void>;

  // Analysis Operations
  analyzeConnectivity(modelId: UUID): Promise<{
    globalConnectivity: number;
    regionalConnectivity: Record<UUID, number>;
    pathways: {
      source: UUID;
      target: UUID;
      strength: number;
      path: UUID[];
    }[];
  }>;

  analyzeActivity(modelId: UUID): Promise<{
    globalActivity: number;
    regionalActivity: Record<UUID, number>;
    hotspots: UUID[];
    patterns: {
      type: string;
      regions: UUID[];
      strength: number;
    }[];
  }>;

  // Simulation Operations
  simulateActivity(
    modelId: UUID,
    params: {
      duration: number;
      stimulation: {
        regionId: UUID;
        strength: number;
        pattern: 'constant' | 'burst' | 'oscillating';
      }[];
    }
  ): Promise<{
    timeline: {
      timestamp: number;
      regionalActivity: Record<UUID, number>;
      connections: Record<UUID, { active: boolean; strength: number }>;
    }[];
    summary: {
      peakActivity: Record<UUID, number>;
      meanActivity: Record<UUID, number>;
      propagationPaths: {
        source: UUID;
        target: UUID;
        delay: number;
        strength: number;
      }[];
    };
  }>;
}
