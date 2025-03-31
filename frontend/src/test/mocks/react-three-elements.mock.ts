/**
 * NOVAMIND Neural Architecture
 * React Three Elements Mock Implementation with Quantum Precision
 * 
 * This implementation creates neural-safe mocks for React Three Fiber elements
 * with data-testid support for clinical-grade testing.
 */

import React from 'react';
import { vi } from 'vitest';

// Neural-safe group component with quantum precision
export const Group = vi.fn().mockImplementation(({ children, 'data-testid': testId, ...props }) => {
  return React.createElement('group', { 'data-testid': testId, ...props }, children);
});

// Neural-safe mesh component with quantum precision
export const Mesh = vi.fn().mockImplementation(({ children, 'data-testid': testId, ...props }) => {
  return React.createElement('mesh', { 'data-testid': testId, ...props }, children);
});

// Neural-safe Canvas component with clinical precision
export const Canvas = vi.fn().mockImplementation(({ children, 'data-testid': testId, ...props }) => {
  return React.createElement('div', { 'data-testid': testId || 'neural-canvas', ...props }, children);
});

// Neural-safe sphere geometry with quantum precision
export const SphereGeometry = vi.fn().mockImplementation((props) => {
  return React.createElement('spheregeometry', props);
});

// Neural-safe line component with clinical precision
export const Line = vi.fn().mockImplementation(({ 'data-testid': testId, ...props }) => {
  return React.createElement('line', { 'data-testid': testId || 'neural-line', ...props });
});

// Neural-safe text component with quantum precision
export const Text = vi.fn().mockImplementation(({ children, 'data-testid': testId, ...props }) => {
  return React.createElement('text', { 'data-testid': testId || 'neural-text', ...props }, children);
});

// Neural-safe sphere component with clinical precision
export const Sphere = vi.fn().mockImplementation(({ 'data-testid': testId, ...props }) => {
  return React.createElement('sphere', { 'data-testid': testId || 'neural-node', ...props });
});

// Neural-safe material with quantum precision
export const NeuralActivityShaderMaterial = vi.fn().mockImplementation((props) => {
  return React.createElement('neuralactivityshadermaterial', props);
});

// Export all mocks for comprehensive testing
export default {
  Group,
  Mesh,
  Canvas,
  SphereGeometry,
  Line,
  Text,
  Sphere,
  NeuralActivityShaderMaterial
};
