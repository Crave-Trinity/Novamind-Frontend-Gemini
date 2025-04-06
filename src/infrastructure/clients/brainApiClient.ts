import { IBrainService } from '@domain/services/brain.service';
import { BrainModel, BrainRegion, NeuralConnection } from '@domain/models/brain.model';
import { UUID, PaginationParams, PaginatedResponse, ApiError } from '@domain/types/common';
import { ApiClient } from '../api/client';

export class BrainService implements IBrainService {
  constructor(private apiClient: ApiClient) {}

  // Brain Model Operations
  async getBrainModel(id: UUID): Promise<BrainModel> {
    const response = await this.apiClient.get<BrainModel>(`/brain-models/${id}`);
    return response.data;
  }

  async getBrainModels(
    patientId: UUID,
    params: PaginationParams
  ): Promise<PaginatedResponse<BrainModel>> {
    const response = await this.apiClient.get<PaginatedResponse<BrainModel>>('/brain-models', {
      params: { patientId, ...params },
    });
    return response;
  }

  async createBrainModel(patientId: UUID, model: Omit<BrainModel, 'id'>): Promise<BrainModel> {
    const response = await this.apiClient.post<BrainModel>('/brain-models', {
      ...model,
      patientId,
    });
    return response.data;
  }

  async updateBrainModel(id: UUID, model: Partial<BrainModel>): Promise<BrainModel> {
    const response = await this.apiClient.patch<BrainModel>(`/brain-models/${id}`, model);
    return response.data;
  }

  async deleteBrainModel(id: UUID): Promise<void> {
    await this.apiClient.delete(`/brain-models/${id}`);
  }

  // Brain Region Operations
  async getBrainRegion(modelId: UUID, regionId: UUID): Promise<BrainRegion> {
    const response = await this.apiClient.get<BrainRegion>(
      `/brain-models/${modelId}/regions/${regionId}`
    );
    return response.data;
  }

  async createBrainRegion(modelId: UUID, region: Omit<BrainRegion, 'id'>): Promise<BrainRegion> {
    const response = await this.apiClient.post<BrainRegion>(
      `/brain-models/${modelId}/regions`,
      region
    );
    return response.data;
  }

  async updateBrainRegion(
    modelId: UUID,
    regionId: UUID,
    region: Partial<BrainRegion>
  ): Promise<BrainRegion> {
    const response = await this.apiClient.patch<BrainRegion>(
      `/brain-models/${modelId}/regions/${regionId}`,
      region
    );
    return response.data;
  }

  async deleteBrainRegion(modelId: UUID, regionId: UUID): Promise<void> {
    await this.apiClient.delete(`/brain-models/${modelId}/regions/${regionId}`);
  }

  // Neural Connection Operations
  async getNeuralConnection(modelId: UUID, connectionId: UUID): Promise<NeuralConnection> {
    const response = await this.apiClient.get<NeuralConnection>(
      `/brain-models/${modelId}/connections/${connectionId}`
    );
    return response.data;
  }

  async createNeuralConnection(
    modelId: UUID,
    connection: Omit<NeuralConnection, 'id'>
  ): Promise<NeuralConnection> {
    const response = await this.apiClient.post<NeuralConnection>(
      `/brain-models/${modelId}/connections`,
      connection
    );
    return response.data;
  }

  async updateNeuralConnection(
    modelId: UUID,
    connectionId: UUID,
    connection: Partial<NeuralConnection>
  ): Promise<NeuralConnection> {
    const response = await this.apiClient.patch<NeuralConnection>(
      `/brain-models/${modelId}/connections/${connectionId}`,
      connection
    );
    return response.data;
  }

  async deleteNeuralConnection(modelId: UUID, connectionId: UUID): Promise<void> {
    await this.apiClient.delete(`/brain-models/${modelId}/connections/${connectionId}`);
  }

  // Analysis Operations
  async analyzeConnectivity(modelId: UUID) {
    const response = await this.apiClient.post<{
      globalConnectivity: number;
      regionalConnectivity: Record<UUID, number>;
      pathways: {
        source: UUID;
        target: UUID;
        strength: number;
        path: UUID[];
      }[];
    }>(`/brain-models/${modelId}/analyze/connectivity`);
    return response.data;
  }

  async analyzeActivity(modelId: UUID) {
    const response = await this.apiClient.post<{
      globalActivity: number;
      regionalActivity: Record<UUID, number>;
      hotspots: UUID[];
      patterns: {
        type: string;
        regions: UUID[];
        strength: number;
      }[];
    }>(`/brain-models/${modelId}/analyze/activity`);
    return response.data;
  }

  // Simulation Operations
  async simulateActivity(
    modelId: UUID,
    params: {
      duration: number;
      stimulation: {
        regionId: UUID;
        strength: number;
        pattern: 'constant' | 'burst' | 'oscillating';
      }[];
    }
  ) {
    const response = await this.apiClient.post<{
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
    }>(`/brain-models/${modelId}/simulate/activity`, params);
    return response.data;
  }
}
