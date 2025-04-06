/**
 * THREE.js test utilities for Novamind tests
 * Provides mocks and test helpers for THREE.js component testing
 */

import { vi } from 'vitest';

// Mock THREE context
export const mockThreeContext = {
  camera: {
    position: { x: 0, y: 0, z: 10 },
    lookAt: vi.fn(),
    updateProjectionMatrix: vi.fn(),
    updateMatrixWorld: vi.fn(),
  },
  gl: {
    setSize: vi.fn(),
    render: vi.fn(),
    domElement: document.createElement('canvas'),
    setClearColor: vi.fn(),
  },
  scene: {
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
  },
  size: { width: 800, height: 600 },
  viewport: { width: 800, height: 600 },
  events: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
  get: vi.fn(),
  invalidate: vi.fn(),
  advance: vi.fn(),
  setSize: vi.fn(),
  onPointerMissed: vi.fn(),
  pointer: { x: 0, y: 0 },
};

// Mock for useThree hook
export const mockUseThree = () => mockThreeContext;

// Mock for useFrame hook
export const mockUseFrame = vi.fn((callback) => {
  callback(mockThreeContext, 0);
  return undefined;
});

// Create mock Vector3 implementation
export const mockVector3 = {
  x: 0,
  y: 0,
  z: 0,
  set: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  sub: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  divide: vi.fn().mockReturnThis(),
  length: vi.fn().mockReturnValue(0),
  normalize: vi.fn().mockReturnThis(),
  clone: vi.fn().mockReturnThis(),
  applyQuaternion: vi.fn().mockReturnThis(),
};

// Define interface for mock brain region data
interface MockBrainRegion {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  connections: unknown[]; // Assuming connections structure is not defined here
  activityLevel: number;
  isActive: boolean;
  hemisphereLocation: 'left' | 'right' | 'central';
  dataConfidence: number;
  volume: number;
  activity: number;
}

// Mock data structures
export const createMockBrainRegions = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `region-${i}`,
    name: `Region ${i}`,
    position: {
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: Math.random() * 10 - 5,
    },
    color: `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`,
    connections: [],
    activityLevel: Math.random(),
    isActive: Math.random() > 0.5,
    // Ensure hemisphereLocation matches the expected literal types
    hemisphereLocation: ['left', 'right', 'central'][Math.floor(Math.random() * 3)] as
      | 'left'
      | 'right'
      | 'central',
    dataConfidence: Math.random(),
    volume: Math.random() * 100 + 50, // Correct property name to 'volume'
    activity: Math.random(), // Correct type to number
  }));
};

// Mock data structures
export const createMockNeuralConnections = (regions: MockBrainRegion[], connectionCount = 10) => {
  return Array.from({ length: connectionCount }, (_, i) => {
    const sourceIndex = Math.floor(Math.random() * regions.length);
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * regions.length);
    } while (targetIndex === sourceIndex);

    return {
      id: `connection-${i}`,
      sourceId: regions[sourceIndex].id,
      targetId: regions[targetIndex].id,
      strength: Math.random(),
      // Ensure type matches the expected literal types
      type: ['functional', 'structural', 'effective'][Math.floor(Math.random() * 3)] as
        | 'functional'
        | 'structural'
        | 'effective',
      // Ensure directionality matches the expected literal types
      directionality: ['bidirectional', 'unidirectional'][Math.floor(Math.random() * 2)] as
        | 'bidirectional'
        | 'unidirectional',
      activityLevel: Math.random(),
      dataConfidence: Math.random(),
    };
  });
};
