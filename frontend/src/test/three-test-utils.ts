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

// Mock data structures
export const createMockBrainRegions = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `region-${i}`,
    name: `Region ${i}`,
    position: { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5, z: Math.random() * 10 - 5 },
    color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    connections: [],
    activityLevel: Math.random(),
    isActive: Math.random() > 0.5,
    hemisphereLocation: Math.random() > 0.5 ? 'left' : 'right',
    dataConfidence: Math.random(),
  }));
};

// Mock data structures
export const createMockNeuralConnections = (regions: any[], connectionCount = 10) => {
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
      type: Math.random() > 0.5 ? 'functional' : 'structural',
      directionality: Math.random() > 0.5 ? 'bidirectional' : 'unidirectional',
      activityLevel: Math.random(),
      dataConfidence: Math.random(),
    };
  });
};
