/* eslint-disable */
/**
 * NOVAMIND Neural Test Framework
 * Critical Component Mocks with Quantum Precision
 */

import React from 'react';
import { vi } from 'vitest';

// Mock Three.js with surgical precision
// eslint-disable-next-line
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'neural-canvas' }, children), // Replaced JSX with React.createElement
// eslint-disable-next-line
  useThree: () => ({
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    gl: { setPixelRatio: vi.fn(), setSize: vi.fn() },
    scene: { background: { set: vi.fn() } },
  }),
  useFrame: vi.fn((cb) => cb({ camera: { position: { x: 0, y: 0, z: 10 } } }, 0)),
  extend: vi.fn(),
}));

// eslint-disable-next-line
vi.mock('@react-three/drei', () => ({
  Sphere: ({ position, scale, color }: { position: unknown; scale: unknown; color: unknown }) =>
    React.createElement(
      'div',
      {
        'data-testid': 'neural-node',
        'data-position': position,
        'data-scale': scale,
        'data-color': color,
      },
      'Node'
    ),
  Line: (
    { points: _points, color }: { points: unknown; color: unknown } // Mark points as unused
  ) => React.createElement('div', { 'data-testid': 'neural-line', 'data-color': color }, 'Line'),
  Text: ({ children, color }: { children: React.ReactNode; color: unknown }) =>
    React.createElement('div', { 'data-testid': 'neural-text', 'data-color': color }, children),
  Html: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'neural-html' }, children),
  useTexture: () => ({ map: {} }),
  shaderMaterial: () => ({}),
}));

// Mock react-spring/three
// eslint-disable-next-line
vi.mock('@react-spring/three', () => ({
  useSpring: () => ({ position: [0, 0, 0], scale: [1, 1, 1] }),
  animated: {
    mesh: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'animated-mesh' }, children),
    group: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'animated-group' }, children),
  },
}));

// Mock Chart.js
// eslint-disable-next-line
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
// eslint-disable-next-line
vi.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'chart-line' }, 'Chart'),
  Bar: () => React.createElement('div', { 'data-testid': 'chart-bar' }, 'Chart'),
  Scatter: () => React.createElement('div', { 'data-testid': 'chart-scatter' }, 'Chart'),
}));

// Create neural-safe mock components for tests
export const MockNeuralComponent = ({ children }: { children: React.ReactNode }) =>
  React.createElement('div', { 'data-testid': 'neural-component' }, children);

export const MockBrainVisualization = ({
  regions,
  connections,
}: {
  regions: Array<unknown> | { length?: number };
  connections: Array<unknown> | { length?: number };
}) =>
  React.createElement(
    'div',
    { 'data-testid': 'brain-visualization' },
    React.createElement('div', null, `Regions: ${regions?.length || 0}`),
    React.createElement('div', null, `Connections: ${connections?.length || 0}`)
  );

export const MockTemporalVisualizer = ({
  timeRange,
  stateTransitions,
}: {
  timeRange: unknown;
  stateTransitions: Array<unknown> | { length?: number };
}) =>
  React.createElement(
    'div',
    { 'data-testid': 'temporal-visualizer' },
    React.createElement('div', null, `Time Range: ${JSON.stringify(timeRange)}`),
    React.createElement('div', null, `Transitions: ${stateTransitions?.length || 0}`)
  );

export const MockClinicalDataDisplay = (
  { data, colorMap: _colorMap }: { data: Array<unknown> | { length?: number }; colorMap: unknown } // Mark colorMap as unused
) =>
  React.createElement(
    'div',
    { 'data-testid': 'clinical-data-display' },
    React.createElement('div', null, `Data Points: ${data?.length || 0}`)
  );
