/**
 * NOVAMIND Neural Test Framework
 * Critical Component Mocks with Quantum Precision
 */

import React from 'react';
import { vi } from 'vitest';

// Mock Three.js with surgical precision
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="neural-canvas">{children}</div>,
  useThree: () => ({
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
    scene: { background: { set: vi.fn() } },
  }),
  useFrame: vi.fn((cb) => cb({ camera: { position: { x: 0, y: 0, z: 10 } }}, 0)),
  extend: vi.fn()
}));

vi.mock('@react-three/drei', () => ({
  Sphere: ({ position, scale, color }) => (
    <div data-testid="neural-node" data-position={position} data-scale={scale} data-color={color}>
      Node
    </div>
  ),
  Line: ({ points, color }) => (
    <div data-testid="neural-line" data-color={color}>
      Line
    </div>
  ),
  Text: ({ children, color }) => (
    <div data-testid="neural-text" data-color={color}>{children}</div>
  ),
  Html: ({ children }) => <div data-testid="neural-html">{children}</div>,
  useTexture: () => ({ map: {} }),
  shaderMaterial: () => ({})
}));

// Mock react-spring/three
vi.mock('@react-spring/three', () => ({
  useSpring: () => ({ position: [0, 0, 0], scale: [1, 1, 1] }),
  animated: {
    mesh: ({ children }) => <div data-testid="animated-mesh">{children}</div>,
    group: ({ children }) => <div data-testid="animated-group">{children}</div>,
  },
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class {
    static register() {}
  },
  CategoryScale: class {},
  LinearScale: class {},
  PointElement: class {},
  LineElement: class {},
  Title: class {},
  Tooltip: class {},
  Legend: class {},
  Filler: class {},
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="chart-line">Chart</div>,
  Bar: () => <div data-testid="chart-bar">Chart</div>,
  Scatter: () => <div data-testid="chart-scatter">Chart</div>,
}));

// Create neural-safe mock components for tests
export const MockNeuralComponent = ({ children }) => (
  <div data-testid="neural-component">{children}</div>
);

export const MockBrainVisualization = ({ regions, connections }) => (
  <div data-testid="brain-visualization">
    <div>Regions: {regions?.length || 0}</div>
    <div>Connections: {connections?.length || 0}</div>
  </div>
);

export const MockTemporalVisualizer = ({ timeRange, stateTransitions }) => (
  <div data-testid="temporal-visualizer">
    <div>Time Range: {JSON.stringify(timeRange)}</div>
    <div>Transitions: {stateTransitions?.length || 0}</div>
  </div>
);

export const MockClinicalDataDisplay = ({ data, colorMap }) => (
  <div data-testid="clinical-data-display">
    <div>Data Points: {data?.length || 0}</div>
  </div>
);
