/**
 * Mock brain region data for testing brain visualization components
 */

export interface BrainRegion {
  id: string;
  name: string;
  coordinates: [number, number, number];
  size: number;
  color?: string;
  value?: number; // For functional data
  connections?: string[]; // IDs of connected regions
  description?: string;
}

export type BrainRegionData = Record<string, BrainRegion>;

export const mockBrainRegionData: BrainRegionData = {
  prefrontal_cortex: {
    id: 'prefrontal_cortex',
    name: 'Prefrontal Cortex',
    coordinates: [0, 2.5, 0],
    size: 1.2,
    color: '#ff5733',
    value: 75,
    connections: ['anterior_cingulate', 'thalamus', 'hippocampus'],
    description: 'Executive function, decision making, and complex cognitive behavior',
  },
  anterior_cingulate: {
    id: 'anterior_cingulate',
    name: 'Anterior Cingulate Cortex',
    coordinates: [0, 1.5, 0.5],
    size: 0.8,
    color: '#33ff57',
    value: 65,
    connections: ['prefrontal_cortex', 'amygdala'],
    description: 'Error detection, conflict monitoring, and emotional regulation',
  },
  amygdala: {
    id: 'amygdala',
    name: 'Amygdala',
    coordinates: [1.5, 0, 0.5],
    size: 0.6,
    color: '#3357ff',
    value: 85,
    connections: ['anterior_cingulate', 'hippocampus'],
    description: 'Fear processing, emotional responses, and memory consolidation',
  },
  hippocampus: {
    id: 'hippocampus',
    name: 'Hippocampus',
    coordinates: [2, -0.5, 0],
    size: 0.7,
    color: '#ff33a8',
    value: 60,
    connections: ['prefrontal_cortex', 'amygdala'],
    description: 'Memory formation, spatial navigation, and learning',
  },
  thalamus: {
    id: 'thalamus',
    name: 'Thalamus',
    coordinates: [0, 0, 0],
    size: 0.9,
    color: '#ffcc33',
    value: 50,
    connections: ['prefrontal_cortex'],
    description: 'Sensory relay, sleep regulation, and consciousness',
  },
};

export const mockBrainActivityData = {
  resting: {
    prefrontal_cortex: 40,
    anterior_cingulate: 35,
    amygdala: 30,
    hippocampus: 25,
    thalamus: 45,
  },
  active: {
    prefrontal_cortex: 75,
    anterior_cingulate: 65,
    amygdala: 85,
    hippocampus: 60,
    thalamus: 50,
  },
  depressed: {
    prefrontal_cortex: 30,
    anterior_cingulate: 45,
    amygdala: 75,
    hippocampus: 35,
    thalamus: 40,
  },
  anxious: {
    prefrontal_cortex: 65,
    anterior_cingulate: 80,
    amygdala: 90,
    hippocampus: 50,
    thalamus: 60,
  },
};

// Sample connectivity matrix (adjacency matrix) for network analysis
export const mockConnectivityMatrix = [
  [0, 1, 0, 1, 1], // prefrontal_cortex
  [1, 0, 1, 0, 0], // anterior_cingulate
  [0, 1, 0, 1, 0], // amygdala
  [1, 0, 1, 0, 0], // hippocampus
  [1, 0, 0, 0, 0], // thalamus
];
