/**
 * RegionSelectionIndicator - Test
 * Properly implemented test with React.createElement instead of JSX in mocks
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils.unified';
import { RegionSelectionIndicator } from './RegionSelectionIndicator';

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    gl: { setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() },
    camera: { position: { set: vi.fn() }, lookAt: vi.fn() },
    scene: { add: vi.fn(), remove: vi.fn() },
    size: { width: 800, height: 600 },
    clock: { getElapsedTime: vi.fn(() => 0) }
  })),
  Canvas: function MockCanvas(props) {
    return React.createElement('div', { 'data-testid': 'mock-canvas' }, props.children);
  }
}));

// Mock Three.js
vi.mock('three', () => {
  class MockVector3 {
    x = 0;
    y = 0;
    z = 0;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set = vi.fn(() => this);
    clone = vi.fn(() => new MockVector3(this.x, this.y, this.z));
    multiplyScalar = vi.fn(() => this);
  }
  
  return {
    __esModule: true,
    Vector3: MockVector3,
    Color: vi.fn().mockImplementation(() => ({ set: vi.fn() })),
    ShaderMaterial: vi.fn(),
    Mesh: vi.fn(),
    SphereGeometry: vi.fn(),
    BoxGeometry: vi.fn(),
    DoubleSide: 2,
    MeshBasicMaterial: vi.fn(() => ({ dispose: vi.fn() })),
    MeshStandardMaterial: vi.fn(() => ({ dispose: vi.fn() }))
  };
});

// Mock react-spring/three
vi.mock('@react-spring/three', () => {
  return {
    useSpring: vi.fn(() => ({ spring: 0 })),
    animated: new Proxy({}, {
      get: function(target, prop) {
        const MockAnimatedComponent = React.forwardRef(function(props, ref) {
          return React.createElement(
            'div',
            {
              'data-testid': `mock-animated-${String(prop)}`,
              ref,
              ...props
            },
            props.children
          );
        });
        MockAnimatedComponent.displayName = `animated.${String(prop)}`;
        return MockAnimatedComponent;
      }
    })
  };
});

// Import after mocks
import { Vector3 } from 'three';

describe('RegionSelectionIndicator', () => {
  it('renders the mock mesh when selected', () => {
    render(
      <RegionSelectionIndicator
        position={new Vector3(0, 0, 0)}
        scale={1}
        selected={true}
      />
    );
    expect(screen.getByTestId('mock-animated-mesh')).toBeInTheDocument();
  });

  it('renders the mock mesh when not selected', () => {
    render(
      <RegionSelectionIndicator
        position={new Vector3(0, 0, 0)}
        scale={1}
        selected={false}
      />
    );
    expect(screen.getByTestId('mock-animated-mesh')).toBeInTheDocument();
  });
});
