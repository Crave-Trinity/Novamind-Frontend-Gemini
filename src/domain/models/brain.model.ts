import type { UUID } from '../types/common';

export interface BrainRegion {
  id: UUID;
  name: string;
  description: string;
  coordinates: [number, number, number];
  volume: number;
  connections: UUID[];
  activity: number;
  type: 'cortical' | 'subcortical' | 'brainstem' | 'cerebellum';
}

export interface NeuralConnection {
  id: UUID;
  sourceId: UUID;
  targetId: UUID;
  strength: number;
  type: 'excitatory' | 'inhibitory';
  active: boolean;
}

export interface BrainModel {
  id: UUID;
  patientId: UUID;
  timestamp: string;
  regions: BrainRegion[];
  connections: NeuralConnection[];
  metadata: {
    scanType: string;
    resolution: number;
    notes: string;
  };
}

// Type Guards
export const isBrainRegion = (value: unknown): value is BrainRegion => {
  const region = value as BrainRegion;
  return (
    typeof region === 'object' &&
    region !== null &&
    typeof region.id === 'string' &&
    typeof region.name === 'string' &&
    typeof region.description === 'string' &&
    Array.isArray(region.coordinates) &&
    region.coordinates.length === 3 &&
    typeof region.volume === 'number' &&
    Array.isArray(region.connections) &&
    typeof region.activity === 'number' &&
    ['cortical', 'subcortical', 'brainstem', 'cerebellum'].includes(region.type)
  );
};

export const isNeuralConnection = (value: unknown): value is NeuralConnection => {
  const connection = value as NeuralConnection;
  return (
    typeof connection === 'object' &&
    connection !== null &&
    typeof connection.id === 'string' &&
    typeof connection.sourceId === 'string' &&
    typeof connection.targetId === 'string' &&
    typeof connection.strength === 'number' &&
    ['excitatory', 'inhibitory'].includes(connection.type) &&
    typeof connection.active === 'boolean'
  );
};

export const isBrainModel = (value: unknown): value is BrainModel => {
  const model = value as BrainModel;
  return (
    typeof model === 'object' &&
    model !== null &&
    typeof model.id === 'string' &&
    typeof model.patientId === 'string' &&
    typeof model.timestamp === 'string' &&
    Array.isArray(model.regions) &&
    model.regions.every(isBrainRegion) &&
    Array.isArray(model.connections) &&
    model.connections.every(isNeuralConnection) &&
    typeof model.metadata === 'object' &&
    model.metadata !== null &&
    typeof model.metadata.scanType === 'string' &&
    typeof model.metadata.resolution === 'number' &&
    typeof model.metadata.notes === 'string'
  );
};
