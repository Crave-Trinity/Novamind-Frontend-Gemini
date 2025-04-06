/**
 * React Three Drei Mock for Testing
 *
 * Provides minimal, test-safe mocks for commonly used Drei components/hooks.
 * Prevents errors related to WebGL or complex rendering in JSDOM.
 */
import React from 'react';
import { vi } from 'vitest';

// Mock simple components as divs or fragments
export const Html = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-html', ...props }, children)
);
export const OrbitControls = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-orbitcontrols', ...props }, children)
);
export const Box = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-box', ...props }, children)
);
export const Sphere = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-sphere', ...props }, children)
);
export const Text = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-text', ...props }, children)
);
export const Line = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-line', ...props }, children)
);

// Mock hooks to return basic values or functions
export const useTexture = vi.fn(() => ({
  /* mock texture object */
}));
export const useGLTF = vi.fn(() => ({
  scene: {
    /* mock scene graph */
  },
  nodes: {
    /* mock nodes */
  },
  materials: {
    /* mock materials */
  },
}));

// Add other commonly used Drei exports as needed, mocking them minimally
export const Center = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-center', ...props }, children)
);
export const Environment = vi.fn(({ children, ...props }) =>
  React.createElement('div', { 'data-testid': 'mock-drei-environment', ...props }, children)
);

// Ensure all necessary exports are mocked to avoid import errors in tests
// Mock shaderMaterial - returns a simple div for testing purposes
export const shaderMaterial = vi.fn((_uniforms, _vertexShader, _fragmentShader, _onInit) => {
  // Return a simple component factory or a mock class instance
  // For simplicity, let's return a function component that renders a div
  const MockMaterial = (props: any) =>
    React.createElement('div', { 'data-testid': 'mock-drei-shadermaterial', ...props });
  return MockMaterial;
});

// Add more mocks here based on specific test failures if they arise
