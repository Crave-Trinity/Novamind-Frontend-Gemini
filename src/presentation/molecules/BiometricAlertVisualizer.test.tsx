/**
 * BiometricAlertVisualizer - Minimal Test
 * Replaced with minimal test to prevent hanging from useFrame animation loop
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest'; // Remove beforeEach, afterEach
import { render, screen } from '@test/test-utils.unified'; // Use unified render
import type { ClinicalAlert } from './BiometricAlertVisualizer';
import { BiometricAlertVisualizer } from './BiometricAlertVisualizer'; // Import type too
import type { BrainRegion } from '@domain/types/brain/models'; // Added import for BrainRegion type
// Remove WebGL mock imports
// Import Vector3 *after* vi.mock('three', ...)
// import { Vector3 } from 'three';

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
  Html: vi.fn(({ children }) => <div data-testid="mock-fiber-html">{children}</div>), // Mock Html used by component
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ), // Simple div mock
}));

// Mock Three.js more carefully
vi.mock('three', async () => {
  // Removed unused importOriginal
  // Removed unused variable: const actualThree = (await importOriginal()) as any;
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
    clone = vi.fn(() => new MockVector3(this.x, this.y, this.z));
    multiplyScalar = vi.fn(() => this);
    add = vi.fn(() => this); // Add method used in component
  }
  return {
    __esModule: true,
    Vector3: MockVector3,
    Group: React.forwardRef(
      (
        { children, ...props }: React.PropsWithChildren<any>,
        ref: any // Mock Group as component
      ) => React.createElement('div', { 'data-testid': 'mock-group', ref, ...props }, children)
    ),
    // Add other mocks if needed
  };
});

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  Text: vi.fn(({ children }) => <div data-testid="mock-drei-text">{children}</div>),
  Billboard: vi.fn(({ children }) => <div data-testid="mock-drei-billboard">{children}</div>),
  Html: vi.fn(({ children }) => <div data-testid="mock-drei-html">{children}</div>), // Add mock for Html
  // Add other Drei mocks if needed
}));

// Import Vector3 *after* vi.mock('three', ...)
import { Vector3 } from 'three';

// Minimal test to verify component can be imported
// Mock data
const mockAlerts: ClinicalAlert[] = [
  {
    id: 'a1',
    timestamp: Date.now() - 5000,
    message: 'HR Elevated',
    sourceMetric: 'Heart Rate',
    value: 110,
    threshold: 100,
    priority: 'warning',
    category: 'physiological',
    confidenceLevel: 0.8,
    isPatientSpecific: false,
    isAcknowledged: false,
  },
  {
    id: 'a2',
    timestamp: Date.now() - 65000,
    message: 'Low Activity',
    sourceMetric: 'Steps',
    value: 50,
    threshold: 100,
    priority: 'informational',
    category: 'behavioral',
    confidenceLevel: 0.7,
    isPatientSpecific: false,
    isAcknowledged: false,
  },
  {
    id: 'a3',
    timestamp: Date.now() - 120000,
    message: 'Panic Attack Reported',
    sourceMetric: 'Self-Report',
    value: 1,
    threshold: 0,
    priority: 'urgent',
    category: 'self-reported',
    confidenceLevel: 0.95,
    isPatientSpecific: true,
    isAcknowledged: false,
  },
  {
    id: 'a4',
    timestamp: Date.now() - 300000,
    message: 'Acknowledged Alert',
    sourceMetric: 'HRV',
    value: 30,
    threshold: 40,
    priority: 'warning',
    category: 'physiological',
    confidenceLevel: 0.75,
    isPatientSpecific: false,
    isAcknowledged: true,
  },
];

// Correctly typed mockRegions
const mockRegions: BrainRegion[] = [
  {
    id: 'r1',
    name: 'Amygdala',
    position: new Vector3(1, 0, 0),
    activityLevel: 0.6,
    connections: [],
    // metadata: {}, // Removed invalid property
    color: '#FF0000', // Added missing property
    isActive: true, // Added missing property
    hemisphereLocation: 'left', // Added missing property
    dataConfidence: 0.9, // Added missing property
    volume: 1500, // Added missing property
    activity: 0.6, // Added missing property (duplicate of activityLevel?)
  },
];

describe('BiometricAlertVisualizer', () => {
  // Remove WebGL setup/teardown

  it('renders alerts based on props', () => {
    render(
      <BiometricAlertVisualizer
        alerts={mockAlerts}
        regions={mockRegions}
        showAcknowledged={false} // Hide acknowledged
      />
    );

    // Expect 3 non-acknowledged alerts to be rendered (via the Billboard mock)
    expect(screen.getAllByTestId('mock-drei-billboard')).toHaveLength(3);
    expect(screen.getByText('HR Elevated')).toBeInTheDocument();
    expect(screen.getByText('Low Activity')).toBeInTheDocument();
    expect(screen.getByText('Panic Attack Reported')).toBeInTheDocument();
    expect(screen.queryByText('Acknowledged Alert')).not.toBeInTheDocument();
  });

  it('renders acknowledged alerts when showAcknowledged is true', () => {
    render(
      <BiometricAlertVisualizer
        alerts={mockAlerts}
        regions={mockRegions}
        showAcknowledged={true} // Show acknowledged
      />
    );

    // Expect all 4 alerts to be rendered
    expect(screen.getAllByTestId('mock-drei-billboard')).toHaveLength(4);
    expect(screen.getByText('Acknowledged Alert')).toBeInTheDocument();
  });

  // Add more tests for filtering, clicking, acknowledging etc.
});
