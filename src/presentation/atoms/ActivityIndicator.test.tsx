/**
 * ActivityIndicator - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

import React from 'react';
// Removed duplicate React import
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils.unified'; // Use unified render
import { ActivityIndicator } from './ActivityIndicator';
import { ActivationLevel } from '@domain/types/brain/activity';
// Don't import from 'three' directly if mocking it below

// Restore explicit vi.mock calls with refinements

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(), // Keep simple mock
  useThree: vi.fn(() => ({
    // Keep simple mock
    gl: { setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() },
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    scene: { add: vi.fn(), remove: vi.fn() },
    size: { width: 800, height: 600 },
    clock: { getElapsedTime: vi.fn(() => 0) },
  })),
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ), // Simple div mock
}));

// Mock Three.js more carefully
vi.mock('three', async (importOriginal) => {
  const actualThree = (await importOriginal()) as any; // Get actual constants if needed
  // Define Vector3 as a mock class
  class MockVector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set = vi.fn(() => this);
    clone = vi.fn(() => new MockVector3(this.x, this.y, this.z)); // Implement clone properly
    multiplyScalar = vi.fn(() => this);
    // Add other methods if needed by the component
  }
  return {
    __esModule: true, // Ensure ES module treatment
    Vector3: MockVector3, // Export the mock class
    Color: vi.fn().mockImplementation((_color) => ({
      // Prefixed unused parameter
      set: vi.fn(),
      // Add other methods/properties if needed
    })),
    // Mock geometry/material as simple components rendering null
    // Mock geometry/material as simple components rendering null
    ShaderMaterial: vi.fn(), // Simplify mock
    Mesh: vi.fn(({ children }) => <div data-testid="mock-mesh">{children}</div>), // Mock Mesh as a simple component
    SphereGeometry: vi.fn(), // Simplify mock
    // Removed duplicate ShaderMaterial mock
    DoubleSide: actualThree.DoubleSide ?? 2, // Use actual constant or fallback
    // Add other exports if ActivityIndicator uses them
  };
});

// Mock @react-spring/three
vi.mock('@react-spring/three', () => ({
  useSpring: vi.fn(() => ({
    springActivity: { get: vi.fn(() => 0.5) }, // Mock spring value with get()
  })),
  // Mock 'animated' object. Its properties (like animated.mesh) should be components.
  animated: new Proxy(
    {},
    {
      get: (_target, prop) => {
        // Prefixed unused target parameter
        // Restore forwardRef to handle refs passed to animated components
        const MockAnimatedComponent = React.forwardRef(
          ({ children, ...props }: React.PropsWithChildren<any>, ref: any // eslint-disable-line @typescript-eslint/no-explicit-any) => {
            // Render a simple div for testing, passing the ref if provided
            return React.createElement(
              'div',
              {
                'data-testid': `mock-animated-${String(prop)}`,
                ref: ref, // Forward the ref
                ...props,
              },
              children
            );
          }
        );
        MockAnimatedComponent.displayName = `animated.${String(prop)}`;
        return MockAnimatedComponent;
      },
    }
  ),
}));

// Minimal test to verify component can be imported
// Import Vector3 *after* vi.mock('three', ...) so it resolves to the mock
import { Vector3 } from 'three';

describe('ActivityIndicator', () => {
  it('renders the mock mesh when activity is low', () => {
    render(
      <ActivityIndicator
        position={new Vector3(0, 0, 0)} // Use the mocked Vector3
        scale={1}
        activationLevel={ActivationLevel.LOW}
        rawActivity={0.2}
      />
    );
    // Check if the mock animated mesh element is rendered
    expect(screen.getByTestId('mock-animated-mesh')).toBeInTheDocument();
  });

  it('does not render when activity is NONE', () => {
    const { container } = render(
      <ActivityIndicator
        position={new Vector3(0, 0, 0)} // Use the mocked Vector3
        scale={1}
        activationLevel={ActivationLevel.NONE}
        rawActivity={0.0}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
